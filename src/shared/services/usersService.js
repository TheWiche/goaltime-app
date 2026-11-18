// src/shared/services/usersService.js

import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { auth, db, storage, callHttpFunction } from "./firebaseApp";
import { logger } from "shared/utils/logger";

export const USER_ROLES = Object.freeze(["admin", "asociado", "cliente"]);

export const ALLOWED_IMAGE_TYPES = Object.freeze(["image/png", "image/jpeg", "image/webp"]);
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// --- Administración de usuarios (Cloud Functions, solo admin) ---

export const callCreateUserRequest = async (userData) => {
  if (!userData || !USER_ROLES.includes(userData.role)) {
    throw new Error("Rol no válido.");
  }
  return callHttpFunction("createUser", userData, "Error al crear el usuario.");
};

export const callToggleUserStatusRequest = async (userId) =>
  callHttpFunction("toggleUserStatus", { userId }, "Error al cambiar estado del usuario.");

export const callSetUserRoleRequest = async (userId, newRole) => {
  if (!USER_ROLES.includes(newRole)) throw new Error("Rol no válido.");
  return callHttpFunction("setUserRole", { userId, newRole }, "Error al cambiar rol del usuario.");
};

/**
 * Lee el perfil de un usuario. Permitido por las reglas para: el propio usuario,
 * asociados (p.ej. datos de contacto del cliente de una reserva) y admins.
 * @returns {Promise<object|null>} {id, name, email, phone, photoURL, role} o null.
 */
export const getUserProfileById = async (userId) => {
  if (!userId) return null;
  try {
    const snap = await getDoc(doc(db, "users", userId));
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      id: snap.id,
      name: d.name || "",
      email: d.email || "",
      phone: d.phone || d.phoneNumber || "",
      photoURL: d.photoURL || null,
      role: d.role || "cliente",
    };
  } catch (error) {
    logger.error("getUserProfileById", error);
    return null;
  }
};

/**
 * Actualiza campos editables del propio perfil (name, phone).
 * role/status/email NO se pueden cambiar desde el cliente (lo impiden las reglas).
 */
export const updateOwnProfile = async (data) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No autenticado.");
  const update = {};
  if (typeof data?.name === "string") {
    const name = data.name.trim();
    if (!name || name.length > 120) throw new Error("El nombre no es válido.");
    update.name = name;
  }
  if (typeof data?.phone === "string") {
    const phone = data.phone.trim();
    if (phone.length > 30) throw new Error("El teléfono no es válido.");
    update.phone = phone;
  }
  if (Object.keys(update).length === 0) return { success: true };
  update.updatedAt = serverTimestamp();
  await updateDoc(doc(db, "users", user.uid), update);
  return { success: true };
};

// --- Fotos de perfil ---

/** Valida un archivo de imagen (png/jpeg/webp, <5MB). Lanza Error si no es válido. */
export const validateImageFile = (file) => {
  if (!file) throw new Error("Selecciona una imagen.");
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("La imagen debe ser PNG, JPG o WEBP.");
  }
  if (file.size >= MAX_IMAGE_BYTES) throw new Error("La imagen no puede ser mayor a 5MB.");
};

const uploadFile = (storagePath, file, customMetadata, onProgress) =>
  new Promise((resolve, reject) => {
    const task = uploadBytesResumable(ref(storage, storagePath), file, {
      contentType: file.type,
      customMetadata,
    });
    const progress =
      typeof onProgress === "function"
        ? (snap) => {
            if (snap.totalBytes > 0) onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
          }
        : null;
    task.on("state_changed", progress, reject, () => resolve(task.snapshot));
  });

const storageErrorMessage = (error, fallback) => {
  if (error?.code === "storage/unauthorized") {
    return "No tienes permisos para subir este archivo (formato o tamaño no permitido).";
  }
  if (error?.code === "storage/canceled") return "La subida fue cancelada.";
  if (error?.code === "storage/unknown") return "Error al subir la imagen. Verifica tu conexión.";
  return error?.message || fallback;
};

export const uploadProfilePhoto = async (file, userId) => {
  const user = auth.currentUser;
  if (!user || user.uid !== userId) throw new Error("No autorizado para subir esta foto.");
  validateImageFile(file);

  try {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").slice(-80);
    const snapshot = await uploadFile(`profile-photos/${userId}/${timestamp}_${safeName}`, file, {
      uploadedBy: userId,
    });
    const downloadURL = await getDownloadURL(snapshot.ref);
    await updateDoc(doc(db, "users", userId), {
      photoURL: downloadURL,
      updatedAt: serverTimestamp(),
    });
    return downloadURL;
  } catch (error) {
    logger.error("uploadProfilePhoto", error);
    throw new Error(storageErrorMessage(error, "Error al subir la foto de perfil."));
  }
};

/** Extrae la ruta de Storage de una URL de descarga de Firebase. */
const storagePathFromDownloadUrl = (url) => {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith("firebasestorage.googleapis.com")) return null;
    const idx = parsed.pathname.indexOf("/o/");
    if (idx === -1) return null;
    return decodeURIComponent(parsed.pathname.slice(idx + 3));
  } catch {
    return null;
  }
};

export const deleteProfilePhoto = async (userId) => {
  const user = auth.currentUser;
  if (!user || user.uid !== userId) throw new Error("No autorizado para eliminar esta foto.");

  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) return true;

    const path = storagePathFromDownloadUrl(userDoc.data().photoURL);
    if (path && path.startsWith(`profile-photos/${userId}/`)) {
      try {
        await deleteObject(ref(storage, path));
      } catch (storageError) {
        logger.warn("deleteProfilePhoto: el archivo ya no existe", storageError);
      }
    }
    await updateDoc(userRef, { photoURL: null, updatedAt: serverTimestamp() });
    return true;
  } catch (error) {
    logger.error("deleteProfilePhoto", error);
    throw new Error(error.message || "Error al eliminar la foto de perfil.");
  }
};

/**
 * Sube una imagen de cancha a fields/{fieldId}/ (solo dueño asociado o admin; la cancha
 * debe existir ya en Firestore porque storage.rules lee su ownerId).
 * @param {File} file
 * @param {string} fieldId
 * @param {{onProgress?: (percent: number) => void}} [opts]
 * @returns {Promise<string>} downloadURL (guárdala en canchas/{id}.imageUrl con updateField).
 */
export const uploadFieldImage = async (file, fieldId, { onProgress } = {}) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No autenticado.");
  if (!fieldId) throw new Error("Cancha no válida.");
  validateImageFile(file);
  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").slice(-80);
    const snapshot = await uploadFile(
      `fields/${fieldId}/${Date.now()}_${safeName}`,
      file,
      { uploadedBy: user.uid },
      onProgress
    );
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    logger.error("uploadFieldImage", error);
    throw new Error(storageErrorMessage(error, "Error al subir la imagen de la cancha."));
  }
};
