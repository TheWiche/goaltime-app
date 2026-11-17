// src/shared/services/reservationsService.js
//
// MODELO DE DISPONIBILIDAD (decisión documentada)
// ------------------------------------------------
// Cada reserva activa ocupa "locks" en la colección `slots`, uno por franja de 30 min:
//   slots/{fieldId}_{YYYY-MM-DD}_{HHmm}  { fieldId, date, time, reservationId, ownerId, status }
// - createReservation crea la reserva (pending) + sus locks en UNA transacción: si algún
//   lock existe, la transacción falla → imposible la doble reserva (ni de otro cliente ni
//   del mismo cliente).
// - Las reservas PENDING también bloquean la franja (el cliente que llega primero la
//   retiene hasta que el dueño la confirme o la rechace). Es lo más seguro sin backend
//   transaccional propio y evita que el dueño reciba solicitudes imposibles de confirmar.
// - Al cancelar/rechazar (→ cancelled) los locks se BORRAN en la misma transacción.
// - Al confirmar se marcan status:"confirmed" (y se crean si la reserva es antigua y no
//   tenía locks). "completed" conserva los locks (la franja ya pasó).
// - Los clientes calculan disponibilidad leyendo `slots` (no contienen datos personales),
//   porque las reglas ya no les permiten leer reservas ajenas.
// Reservas antiguas (sin ownerId ni locks): ver functions/scripts/migrate-reservations.js.

import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db, requireUser, callHttpFunction } from "./firebaseApp";
import {
  minutesFromTime,
  timeFromMinutes,
  todayLocalISO,
  isValidISODate,
  isPastDate,
} from "shared/utils/date";
import {
  RESERVATION_STATUSES,
  canTransition,
  getStatusLabel,
} from "shared/utils/reservationStatus";
import { logger } from "shared/utils/logger";

export const SLOT_MINUTES = 30;
export const MAX_RESERVATION_HOURS = 6;

const DAY_MINUTES = 24 * 60;

const toMillis = (ts) => {
  if (!ts) return 0;
  if (typeof ts.toMillis === "function") return ts.toMillis();
  if (typeof ts.seconds === "number") return ts.seconds * 1000;
  return 0;
};

const sortByCreatedDesc = (list) => list.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));

/** Id del lock para una franja (minutos desde medianoche, alineados a 30). */
export const getSlotId = (fieldId, date, minutes) =>
  `${fieldId}_${date}_${timeFromMinutes(minutes).replace(":", "")}`;

/** Inicios (en minutos) de las franjas de 30 min que cubre [start, end). */
export const getSlotStarts = (startMinutes, endMinutes) => {
  const out = [];
  const first = Math.floor(startMinutes / SLOT_MINUTES) * SLOT_MINUTES;
  for (let m = first; m < endMinutes; m += SLOT_MINUTES) out.push(m);
  return out;
};

/** Solape de intervalos semiabiertos [aStart,aEnd) y [bStart,bEnd). */
export const rangesOverlap = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && aEnd > bStart;

const nowMinutesLocal = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

const parseHours = (openingTime, closingTime) => {
  const open = minutesFromTime(openingTime);
  const close = minutesFromTime(closingTime);
  if (Number.isNaN(open) || Number.isNaN(close)) {
    throw new Error("El horario de la cancha no es válido.");
  }
  if (open >= close) {
    throw new Error("El horario de la cancha no es válido (apertura debe ser antes del cierre).");
  }
  return { open, close };
};

/** Lee los locks de una cancha en una fecha → Map<minutos, {reservationId, status}>. */
const getSlotsForDay = async (fieldId, date) => {
  const snap = await getDocs(
    query(collection(db, "slots"), where("fieldId", "==", fieldId), where("date", "==", date))
  );
  const map = new Map();
  snap.docs.forEach((d) => {
    const data = d.data();
    const m = minutesFromTime(data.time);
    if (!Number.isNaN(m)) map.set(m, { reservationId: data.reservationId, status: data.status });
  });
  return map;
};

/**
 * Verifica si hay conflicto de horario para [startTime, endTime) en una cancha/fecha.
 * Usa los locks de `slots` (pending + confirmed) y, si el usuario puede leerlas
 * (dueño/admin), también reservas confirmadas antiguas sin lock.
 * @returns {Promise<{hasConflict: boolean, conflictingReservation?: {id,startTime,endTime,clientName}}>}
 */
export const checkReservationConflict = async (
  fieldId,
  date,
  startTime,
  endTime,
  excludeReservationId = null
) => {
  const start = minutesFromTime(startTime);
  const end = minutesFromTime(endTime);
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    throw new Error("Horario de reserva no válido.");
  }

  try {
    const slots = await getSlotsForDay(fieldId, date);
    const conflictLock = getSlotStarts(start, end)
      .map((m) => slots.get(m))
      .find((lock) => lock && lock.reservationId !== excludeReservationId);

    if (conflictLock) {
      let info = { id: conflictLock.reservationId, startTime: "", endTime: "", clientName: "otra reserva" };
      try {
        const r = await getDoc(doc(db, "reservations", conflictLock.reservationId));
        if (r.exists()) {
          const d = r.data();
          info = {
            id: r.id,
            startTime: d.startTime,
            endTime: d.endTime,
            clientName: d.clientName || "Cliente",
          };
        }
      } catch {
        /* el cliente no puede leer reservas ajenas: basta con el lock */
      }
      return { hasConflict: true, conflictingReservation: info };
    }

    // Reservas confirmadas antiguas sin lock (solo visibles para dueño/admin).
    try {
      const legacy = await getDocs(
        query(
          collection(db, "reservations"),
          where("fieldId", "==", fieldId),
          where("date", "==", date),
          where("status", "==", "confirmed")
        )
      );
      const hit = legacy.docs.find((d) => {
        if (d.id === excludeReservationId) return false;
        const r = d.data();
        return rangesOverlap(start, end, minutesFromTime(r.startTime), minutesFromTime(r.endTime));
      });
      if (hit) {
        const r = hit.data();
        return {
          hasConflict: true,
          conflictingReservation: {
            id: hit.id,
            startTime: r.startTime,
            endTime: r.endTime,
            clientName: r.clientName || "Cliente",
          },
        };
      }
    } catch {
      /* permission-denied para clientes: ignorado a propósito */
    }

    return { hasConflict: false };
  } catch (error) {
    logger.error("checkReservationConflict", error);
    throw new Error("Error al verificar disponibilidad de la reserva.");
  }
};

/**
 * Horas de INICIO disponibles ('HH:mm') para una cancha y fecha.
 * - Falla cerrado: si no se puede consultar la disponibilidad, LANZA error.
 * - Inicios alineados a :00 / :30 desde la apertura.
 * - Excluye inicios cuyo [start, start+durationHours) choque con una reserva o
 *   exceda el cierre, y (si la fecha es hoy) los que ya pasaron.
 * @param {string} fieldId
 * @param {string} date 'YYYY-MM-DD'
 * @param {string} openingTime 'HH:mm'
 * @param {string} closingTime 'HH:mm'
 * @param {number} [durationHours=1]
 * @returns {Promise<string[]>}
 */
export const getAvailableTimeSlots = async (
  fieldId,
  date,
  openingTime,
  closingTime,
  durationHours = 1
) => {
  if (!fieldId || !isValidISODate(date)) throw new Error("Fecha no válida.");
  const { open, close } = parseHours(openingTime, closingTime);
  const durationMin = Math.round(Number(durationHours) * 60);
  if (!Number.isFinite(durationMin) || durationMin <= 0) throw new Error("Duración no válida.");
  if (isPastDate(date)) return [];

  let slots;
  try {
    slots = await getSlotsForDay(fieldId, date);
  } catch (error) {
    logger.error("getAvailableTimeSlots", error);
    throw new Error("No se pudo consultar la disponibilidad. Intenta de nuevo.");
  }

  const isToday = date === todayLocalISO();
  const now = nowMinutesLocal();
  const firstStart = Math.ceil(open / SLOT_MINUTES) * SLOT_MINUTES;
  const result = [];

  for (let s = firstStart; s + durationMin <= close; s += SLOT_MINUTES) {
    if (isToday && s <= now) continue;
    const blocked = getSlotStarts(s, s + durationMin).some((m) => slots.has(m));
    if (!blocked) result.push(timeFromMinutes(s));
  }
  return result;
};

/**
 * Crea una reserva (cliente) de forma transaccional con locks por franja.
 * Entrada (compatible con la anterior): { fieldId, date, startTime, endTime?, duration?,
 *   clientName?, fieldName?, fieldAddress?, totalPrice?, notes? }
 * - fieldName/fieldAddress/ownerId/totalPrice se toman de la cancha (no del cliente).
 * - Requiere cancha "approved", inicio en :00/:30, fin <= cierre, sin cruzar medianoche,
 *   duración 0.5–6 h y fecha/hora futura.
 * @returns {Promise<object>} { id, ...reserva }
 */
export const createReservation = async (reservationData) => {
  const user = requireUser();
  const data = reservationData || {};
  const { fieldId, date, startTime } = data;

  try {
    if (!fieldId || typeof fieldId !== "string") throw new Error("Cancha no válida.");
    if (!isValidISODate(date)) throw new Error("Fecha no válida.");
    if (isPastDate(date)) throw new Error("No puedes reservar en una fecha pasada.");

    const start = minutesFromTime(startTime);
    if (Number.isNaN(start) || start % SLOT_MINUTES !== 0) {
      throw new Error("La hora de inicio debe ser en punto o y media (HH:00 / HH:30).");
    }

    let durationMin;
    if (data.duration !== undefined && data.duration !== null && data.duration !== "") {
      durationMin = Math.round(Number(data.duration) * 60);
    } else {
      durationMin = minutesFromTime(data.endTime) - start;
    }
    if (
      !Number.isFinite(durationMin) ||
      durationMin < SLOT_MINUTES ||
      durationMin % SLOT_MINUTES !== 0 ||
      durationMin > MAX_RESERVATION_HOURS * 60
    ) {
      throw new Error(`La duración debe estar entre 30 minutos y ${MAX_RESERVATION_HOURS} horas.`);
    }
    const end = start + durationMin;
    if (end > DAY_MINUTES) throw new Error("La reserva no puede pasar de la medianoche.");
    const endTime = timeFromMinutes(end);
    if (data.endTime && minutesFromTime(data.endTime) !== end) {
      throw new Error("La hora de fin no coincide con la duración seleccionada.");
    }
    if (date === todayLocalISO() && start <= nowMinutesLocal()) {
      throw new Error("La hora seleccionada ya pasó.");
    }

    const reservationRef = doc(collection(db, "reservations"));
    const fieldRef = doc(db, "canchas", fieldId);
    const slotStarts = getSlotStarts(start, end);
    const slotRefs = slotStarts.map((m) => doc(db, "slots", getSlotId(fieldId, date, m)));

    const reservationDoc = await runTransaction(db, async (tx) => {
      const fieldSnap = await tx.get(fieldRef);
      if (!fieldSnap.exists()) throw new Error("La cancha no existe.");
      const field = fieldSnap.data();
      if (field.status !== "approved") throw new Error("La cancha no está disponible para reservas.");

      const { open, close } = parseHours(field.openingTime, field.closingTime);
      if (start < open || end > close) {
        throw new Error(
          `El horario debe estar dentro de ${field.openingTime} – ${field.closingTime}.`
        );
      }

      const slotSnaps = await Promise.all(slotRefs.map((r) => tx.get(r)));
      if (slotSnaps.some((s) => s.exists())) {
        throw new Error(
          `El horario seleccionado (${startTime} - ${endTime}) ya está ocupado. Por favor, selecciona otro horario.`
        );
      }

      const price = Number(field.pricePerHour) || 0;
      const docData = {
        fieldId,
        fieldName: field.name || data.fieldName || "",
        fieldAddress: field.address || data.fieldAddress || "",
        ownerId: field.ownerId,
        clientId: user.uid,
        clientName:
          typeof data.clientName === "string" ? data.clientName.trim().slice(0, 120) : "Cliente",
        date,
        startTime,
        endTime,
        duration: durationMin / 60,
        totalPrice: Math.round(price * (durationMin / 60)),
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (typeof data.notes === "string" && data.notes.trim()) {
        docData.notes = data.notes.trim().slice(0, 500);
      }

      tx.set(reservationRef, docData);
      slotRefs.forEach((ref, i) =>
        tx.set(ref, {
          fieldId,
          date,
          time: timeFromMinutes(slotStarts[i]),
          reservationId: reservationRef.id,
          ownerId: field.ownerId,
          status: "pending",
          createdAt: serverTimestamp(),
        })
      );
      return docData;
    });

    return { id: reservationRef.id, ...reservationDoc };
  } catch (error) {
    logger.error("createReservation", error);
    if (error?.code === "permission-denied") {
      throw new Error("No tienes permiso para crear esta reserva.");
    }
    throw new Error(error.message || "Error al crear la reserva.");
  }
};

/**
 * Cambia el estado de una reserva validando lista blanca + transición + permisos.
 * - El actor es SIEMPRE auth.currentUser (el parámetro `changedBy` se ignora; se mantiene
 *   por compatibilidad de firma).
 * - Dueño de la cancha / admin: pending→confirmed|cancelled, confirmed→completed|cancelled.
 * - Cliente (su propia reserva): pending|confirmed → cancelled.
 * - confirmed: marca/crea los locks y falla si otra reserva ocupa la franja.
 * - cancelled: libera los locks.
 * @returns {Promise<{success: true, reservation: object}>}
 */
// eslint-disable-next-line no-unused-vars
export const updateReservationStatus = async (reservationId, newStatus, reason, changedBy) => {
  const user = requireUser();
  try {
    if (!reservationId) throw new Error("Reserva no válida.");
    if (!RESERVATION_STATUSES.includes(newStatus)) throw new Error("Estado de reserva no válido.");
    const cleanReason = typeof reason === "string" ? reason.trim().slice(0, 500) : "";

    const reservationRef = doc(db, "reservations", reservationId);

    // Pre-chequeo de reservas confirmadas antiguas sin lock (fuera de la transacción).
    if (newStatus === "confirmed") {
      const pre = await getDoc(reservationRef);
      if (pre.exists()) {
        const r = pre.data();
        const conflict = await checkReservationConflict(
          r.fieldId,
          r.date,
          r.startTime,
          r.endTime,
          reservationId
        );
        if (conflict.hasConflict) {
          throw new Error(
            "No se puede confirmar esta reserva. El horario ya está ocupado por otra reserva."
          );
        }
      }
    }

    const result = await runTransaction(db, async (tx) => {
      const resSnap = await tx.get(reservationRef);
      if (!resSnap.exists()) throw new Error("La reserva no existe.");
      const r = resSnap.data();
      const oldStatus = r.status;

      if (oldStatus === newStatus) throw new Error("La reserva ya está en ese estado.");
      if (!canTransition(oldStatus, newStatus)) {
        throw new Error(
          `No se puede pasar de "${getStatusLabel(oldStatus)}" a "${getStatusLabel(newStatus)}".`
        );
      }

      let ownerId = r.ownerId;
      // Reserva antigua sin ownerId: se resuelve desde la cancha. Si el actor es el propio
      // cliente cancelando no hace falta (y podría no tener permiso de lectura de la cancha).
      if (!ownerId && (r.clientId !== user.uid || newStatus !== "cancelled")) {
        const fieldSnap = await tx.get(doc(db, "canchas", r.fieldId));
        ownerId = fieldSnap.exists() ? fieldSnap.data().ownerId : null;
      }
      const meSnap = await tx.get(doc(db, "users", user.uid));
      const isAdmin = meSnap.exists() && meSnap.data().role === "admin";
      const isOwner = Boolean(ownerId) && ownerId === user.uid;
      const isClient = r.clientId === user.uid;

      if (!isAdmin && !isOwner) {
        if (!(isClient && newStatus === "cancelled")) {
          throw new Error("No tienes permiso para cambiar el estado de esta reserva.");
        }
      }

      const start = minutesFromTime(r.startTime);
      const end = minutesFromTime(r.endTime);
      const hasValidRange = !Number.isNaN(start) && !Number.isNaN(end) && end > start;
      const slotStarts = hasValidRange ? getSlotStarts(start, end) : [];
      const slotRefs = slotStarts.map((m) => doc(db, "slots", getSlotId(r.fieldId, r.date, m)));
      const slotSnaps = await Promise.all(slotRefs.map((ref) => tx.get(ref)));

      if (newStatus === "confirmed") {
        const taken = slotSnaps.some(
          (s) => s.exists() && s.data().reservationId !== reservationId
        );
        if (taken) {
          throw new Error(
            "No se puede confirmar esta reserva. El horario ya está ocupado por otra reserva."
          );
        }
      }

      const update = {
        status: newStatus,
        statusChangedAt: serverTimestamp(),
        statusChangedBy: user.uid,
        statusChangeReason: cleanReason,
        previousStatus: oldStatus,
        updatedAt: serverTimestamp(),
      };
      if (isAdmin || isOwner) {
        update.reviewedAt = serverTimestamp();
        update.reviewedBy = user.uid;
        if (!r.ownerId && ownerId) update.ownerId = ownerId; // migración progresiva
      }
      tx.update(reservationRef, update);

      if (newStatus === "confirmed") {
        slotRefs.forEach((ref, i) => {
          if (slotSnaps[i].exists()) {
            tx.update(ref, { status: "confirmed" });
          } else {
            tx.set(ref, {
              fieldId: r.fieldId,
              date: r.date,
              time: timeFromMinutes(slotStarts[i]),
              reservationId,
              ownerId: ownerId || null,
              status: "confirmed",
              createdAt: serverTimestamp(),
            });
          }
        });
      } else if (newStatus === "cancelled") {
        slotRefs.forEach((ref, i) => {
          if (slotSnaps[i].exists() && slotSnaps[i].data().reservationId === reservationId) {
            tx.delete(ref);
          }
        });
      }

      return { ...r, ownerId: r.ownerId || ownerId, previousStatus: oldStatus };
    });

    return {
      success: true,
      reservation: {
        id: reservationId,
        ...result,
        status: newStatus,
        statusChangeReason: cleanReason,
      },
    };
  } catch (error) {
    logger.error("updateReservationStatus", error);
    if (error?.code === "permission-denied") {
      throw new Error("No tienes permiso para cambiar el estado de esta reserva.");
    }
    throw new Error(error.message || "Error al actualizar el estado de la reserva.");
  }
};

/** Atajo: cancela una reserva (cliente sobre la suya, dueño o admin). */
export const cancelReservation = (reservationId, reason = "") =>
  updateReservationStatus(reservationId, "cancelled", reason);

/**
 * Suscripción en tiempo real a las reservas de las canchas de un asociado.
 * Combina:
 *  1) where("ownerId","==",ownerId)  → reservas nuevas (guardan ownerId).
 *  2) (opcional, includeLegacy) por cada cancha del dueño where("fieldId","==",id)
 *     → reservas antiguas sin ownerId (desactívalo tras ejecutar la migración).
 * El callback recibe la lista deduplicada, ordenada por createdAt desc.
 * @returns {Function} unsubscribe
 */
export const subscribeToOwnerReservations = (
  ownerId,
  callback,
  { includeLegacy = true, onError } = {}
) => {
  if (!ownerId || typeof callback !== "function") return () => {};

  const byOwner = new Map();
  const byField = new Map(); // fieldId -> Map(resId -> data)
  const fieldUnsubs = new Map();
  let active = true;

  const emit = () => {
    if (!active) return;
    const merged = new Map(byOwner);
    byField.forEach((m) => m.forEach((v, k) => merged.set(k, v)));
    callback(sortByCreatedDesc([...merged.values()]));
  };

  const unsubOwner = onSnapshot(
    query(collection(db, "reservations"), where("ownerId", "==", ownerId)),
    (snap) => {
      byOwner.clear();
      snap.docs.forEach((d) => byOwner.set(d.id, { id: d.id, ...d.data() }));
      emit();
    },
    (error) => {
      logger.error("subscribeToOwnerReservations", error);
      if (onError) onError(error);
      emit();
    }
  );

  let unsubFields = () => {};
  if (includeLegacy) {
    unsubFields = onSnapshot(
      query(collection(db, "canchas"), where("ownerId", "==", ownerId)),
      (fieldsSnap) => {
        const ids = new Set(fieldsSnap.docs.map((d) => d.id));
        // quitar canchas que ya no existen
        [...fieldUnsubs.keys()].forEach((fid) => {
          if (!ids.has(fid)) {
            fieldUnsubs.get(fid)();
            fieldUnsubs.delete(fid);
            byField.delete(fid);
          }
        });
        ids.forEach((fid) => {
          if (fieldUnsubs.has(fid)) return;
          const unsub = onSnapshot(
            query(collection(db, "reservations"), where("fieldId", "==", fid)),
            (snap) => {
              const m = new Map();
              snap.docs.forEach((d) => m.set(d.id, { id: d.id, ...d.data() }));
              byField.set(fid, m);
              emit();
            },
            () => {
              // Sin permiso para la consulta legacy: se ignora (queda la de ownerId).
              byField.delete(fid);
            }
          );
          fieldUnsubs.set(fid, unsub);
        });
        emit();
      },
      (error) => logger.error("subscribeToOwnerReservations(fields)", error)
    );
  }

  return () => {
    active = false;
    unsubOwner();
    unsubFields();
    fieldUnsubs.forEach((u) => u());
    fieldUnsubs.clear();
  };
};

/**
 * Suscripción a las reservas de un cliente (where clientId==uid), orden createdAt desc
 * en cliente (no requiere índice compuesto).
 * @returns {Function} unsubscribe
 */
export const subscribeToClientReservations = (clientId, callback, { onError } = {}) => {
  if (!clientId || typeof callback !== "function") return () => {};
  return onSnapshot(
    query(collection(db, "reservations"), where("clientId", "==", clientId)),
    (snap) => callback(sortByCreatedDesc(snap.docs.map((d) => ({ id: d.id, ...d.data() })))),
    (error) => {
      logger.error("subscribeToClientReservations", error);
      if (onError) onError(error);
      callback([]);
    }
  );
};

/**
 * Envía al CLIENTE el correo de cambio de estado. El servidor toma destinatario,
 * estado y datos de la reserva desde Firestore; clientEmail/clientName se ignoran
 * (se conservan en la firma por compatibilidad).
 */
export const sendReservationStatusChangeEmail = async (
  reservationData,
  newStatus,
  reason
  // clientEmail, clientName → ignorados por seguridad
) =>
  callHttpFunction(
    "sendReservationStatusChangeEmail",
    {
      reservationId: reservationData?.id,
      newStatus,
      reason: reason || "",
    },
    "Error al enviar la notificación por correo."
  );

/**
 * Envía el ticket de una reserva al email del usuario autenticado.
 * El HTML se genera en el servidor; solo se usa `reservationId` del objeto recibido
 * (ticketHTML/email/reservationData se ignoran).
 */
export const sendTicketByEmail = async (ticketData) => {
  const reservationId = ticketData?.reservationId || ticketData?.reservationData?.id;
  if (!reservationId) throw new Error("Reserva no válida.");
  return callHttpFunction(
    "sendTicketByEmail",
    { reservationId },
    "Error al enviar el ticket por correo."
  );
};
