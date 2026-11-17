// src/shared/services/fieldsService.js

import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db, requireUser, callHttpFunction } from "./firebaseApp";
import { minutesFromTime } from "shared/utils/date";
import { logger } from "shared/utils/logger";

export const FIELD_STATUSES = Object.freeze(["pending", "approved", "rejected", "disabled"]);

/** Campos que el asociado puede escribir en canchas/{id}. Debe coincidir con firestore.rules. */
export const FIELD_EDITABLE_KEYS = Object.freeze([
  "name",
  "address",
  "description",
  "pricePerHour",
  "imageUrl",
  "openingTime",
  "closingTime",
  "phone",
  "city",
]);

const MAX_PRICE = 100000000;

const trimOrEmpty = (v) => (typeof v === "string" ? v.trim() : "");

/**
 * Valida y normaliza los datos de una cancha (lista blanca de campos).
 * @param {object} data
 * @param {{partial?: boolean}} [opts] partial=true para updates (solo valida lo presente).
 * @returns {object} datos limpios
 */
export const sanitizeFieldData = (data, { partial = false } = {}) => {
  const src = data || {};
  const out = {};
  const has = (k) => Object.prototype.hasOwnProperty.call(src, k) && src[k] !== undefined;

  if (!partial || has("name")) {
    const name = trimOrEmpty(src.name);
    if (!name) throw new Error("El nombre de la cancha es obligatorio.");
    if (name.length > 120) throw new Error("El nombre no puede superar 120 caracteres.");
    out.name = name;
  }
  if (!partial || has("address")) {
    const address = trimOrEmpty(src.address);
    if (address.length > 250) throw new Error("La dirección no puede superar 250 caracteres.");
    out.address = address;
  }
  if (!partial || has("description")) {
    const description = trimOrEmpty(src.description);
    if (description.length > 3000) throw new Error("La descripción es demasiado larga.");
    out.description = description;
  }
  if (!partial || has("pricePerHour")) {
    const price = Number(src.pricePerHour);
    if (!Number.isFinite(price) || price <= 0) {
      throw new Error("El precio por hora debe ser mayor que 0.");
    }
    if (price > MAX_PRICE) throw new Error("El precio por hora no es válido.");
    out.pricePerHour = price;
  }
  if (!partial || has("imageUrl")) {
    const url = trimOrEmpty(src.imageUrl);
    if (url && (!/^https?:\/\//i.test(url) || url.length > 2048)) {
      throw new Error("La URL de la imagen debe empezar por https://");
    }
    out.imageUrl = url || null;
  }
  ["phone", "city"].forEach((k) => {
    if (has(k)) {
      const v = trimOrEmpty(src[k]);
      if (v.length > 120) throw new Error(`El campo ${k} es demasiado largo.`);
      out[k] = v;
    }
  });

  const needsHours = !partial || has("openingTime") || has("closingTime");
  if (needsHours) {
    const opening = src.openingTime;
    const closing = src.closingTime;
    const o = minutesFromTime(opening);
    const c = minutesFromTime(closing);
    if (Number.isNaN(o) || Number.isNaN(c) || closing === "24:00") {
      throw new Error("El horario debe tener formato HH:mm.");
    }
    if (o >= c) {
      throw new Error("La hora de apertura debe ser anterior a la de cierre (sin cruzar medianoche).");
    }
    out.openingTime = opening;
    out.closingTime = closing;
  }
  return out;
};

// Crear una nueva cancha (asociado). Siempre nace "pending" y con ownerId = usuario actual.
// Los admins son notificados por la Cloud Function `onFieldWritten` (trigger de Firestore).
export const createField = async (fieldData) => {
  const user = requireUser();
  try {
    const clean = sanitizeFieldData(fieldData);
    const fieldDoc = {
      ...clean,
      ownerId: user.uid,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, "canchas"), fieldDoc);
    return { id: docRef.id, ...fieldDoc };
  } catch (error) {
    logger.error("createField", error);
    throw new Error(error.message || "Error al crear la cancha.");
  }
};

/**
 * Actualizar una cancha (dueño). No permite cambiar ownerId ni status directamente:
 *  - approved → pending (los cambios vuelven a revisión)
 *  - rejected → pending (reenvío a revisión)
 *  - pending / disabled se mantienen.
 */
export const updateField = async (fieldId, fieldData) => {
  const user = requireUser();
  try {
    const fieldRef = doc(db, "canchas", fieldId);
    const fieldSnap = await getDoc(fieldRef);
    if (!fieldSnap.exists()) throw new Error("La cancha no existe.");

    const field = fieldSnap.data();
    if (field.ownerId !== user.uid) throw new Error("No tienes permiso para editar esta cancha.");

    // Para validar opening<closing necesitamos ambos valores.
    const merged = {
      ...fieldData,
      openingTime: fieldData?.openingTime ?? field.openingTime,
      closingTime: fieldData?.closingTime ?? field.closingTime,
    };
    const clean = sanitizeFieldData(merged, { partial: true });

    const nextStatus =
      field.status === "approved" || field.status === "rejected" ? "pending" : field.status;

    const updatedData = { ...clean, updatedAt: serverTimestamp() };
    if (nextStatus !== field.status) updatedData.status = nextStatus;

    await updateDoc(fieldRef, updatedData);
    return { id: fieldId, ...field, ...updatedData, status: nextStatus };
  } catch (error) {
    logger.error("updateField", error);
    throw new Error(error.message || "Error al actualizar la cancha.");
  }
};

// Actualizar una cancha (admin): campos editables + status (lista blanca). No cambia ownerId.
export const updateFieldAsAdmin = async (fieldId, fieldData) => {
  requireUser();
  try {
    const fieldRef = doc(db, "canchas", fieldId);
    const fieldSnap = await getDoc(fieldRef);
    if (!fieldSnap.exists()) throw new Error("La cancha no existe.");
    const field = fieldSnap.data();

    const merged = {
      ...fieldData,
      openingTime: fieldData?.openingTime ?? field.openingTime,
      closingTime: fieldData?.closingTime ?? field.closingTime,
    };
    const clean = sanitizeFieldData(merged, { partial: true });
    const updatedData = { ...clean, updatedAt: serverTimestamp() };

    if (fieldData && fieldData.status !== undefined && fieldData.status !== field.status) {
      if (!FIELD_STATUSES.includes(fieldData.status)) throw new Error("Estado de cancha no válido.");
      updatedData.status = fieldData.status;
    }

    await updateDoc(fieldRef, updatedData);
    return { id: fieldId, ...updatedData };
  } catch (error) {
    logger.error("updateFieldAsAdmin", error);
    throw new Error(error.message || "Error al actualizar la cancha.");
  }
};

/** Lee una cancha por id. @returns {Promise<object|null>} */
export const getFieldById = async (fieldId) => {
  if (!fieldId) return null;
  const snap = await getDoc(doc(db, "canchas", fieldId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// Deshabilitar/habilitar una cancha aprobada (dueño o admin) - Cloud Function.
export const toggleFieldStatus = async (fieldId) =>
  callHttpFunction("toggleFieldStatus", { fieldId }, "Error al cambiar el estado de la cancha.");

// Aprobar o rechazar cancha (admin) - Cloud Function. action: "approve" | "reject".
export const callApproveFieldRequest = async (fieldId, action) => {
  if (action !== "approve" && action !== "reject") throw new Error("Acción no válida.");
  return callHttpFunction("approveField", { fieldId, action }, "Error al procesar la solicitud.");
};
