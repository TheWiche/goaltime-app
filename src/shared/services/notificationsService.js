// src/shared/services/notificationsService.js

import {
  doc,
  getDocs,
  addDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, requireUser } from "./firebaseApp";
import { logger } from "shared/utils/logger";

export const NOTIFICATIONS_LIMIT = 50;
const BATCH_SIZE = 450;

/** Tipos permitidos por firestore.rules para notificaciones creadas desde el cliente. */
export const NOTIFICATION_TYPES = Object.freeze([
  "field_approved",
  "field_rejected",
  "field_pending",
  "reservation_created",
  "reservation_received",
  "reservation_confirmed",
  "reservation_cancelled",
  "reservation_completed",
  "info",
]);

const NOTIFICATION_KEYS = ["userId", "type", "title", "message", "relatedId", "actionUrl", "icon", "color"];

const toMillis = (ts) => {
  if (!ts) return 0;
  if (typeof ts.toMillis === "function") return ts.toMillis();
  if (typeof ts.seconds === "number") return ts.seconds * 1000;
  return 0;
};

/** Crea una notificación (cualquier usuario autenticado hacia cualquier userId; campos validados). */
export const createNotification = async (notificationData) => {
  requireUser();
  const src = notificationData || {};
  if (!src.userId || typeof src.userId !== "string") throw new Error("Destinatario no válido.");
  if (!NOTIFICATION_TYPES.includes(src.type)) throw new Error("Tipo de notificación no válido.");

  const notificationDoc = {};
  NOTIFICATION_KEYS.forEach((k) => {
    if (src[k] !== undefined && src[k] !== null) notificationDoc[k] = String(src[k]);
  });
  notificationDoc.title = (notificationDoc.title || "").slice(0, 120);
  notificationDoc.message = (notificationDoc.message || "").slice(0, 500);
  if (notificationDoc.actionUrl && !notificationDoc.actionUrl.startsWith("/")) {
    delete notificationDoc.actionUrl; // solo rutas internas
  }
  notificationDoc.read = false;
  notificationDoc.createdAt = serverTimestamp();

  try {
    const docRef = await addDoc(collection(db, "notifications"), notificationDoc);
    return { id: docRef.id, ...notificationDoc };
  } catch (error) {
    logger.error("createNotification", error);
    throw new Error(error.message || "Error al crear la notificación.");
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    await updateDoc(doc(db, "notifications", notificationId), {
      read: true,
      readAt: serverTimestamp(),
    });
  } catch (error) {
    logger.error("markNotificationAsRead", error);
    throw new Error(error.message || "Error al actualizar la notificación.");
  }
};

/** Marca todas las no leídas del usuario actual como leídas (writeBatch en bloques de 450). */
export const markAllNotificationsAsRead = async (userId) => {
  const user = requireUser();
  const uid = userId || user.uid;
  if (uid !== user.uid) throw new Error("No autorizado.");

  try {
    const snap = await getDocs(
      query(collection(db, "notifications"), where("userId", "==", uid), where("read", "==", false))
    );
    const docs = snap.docs;
    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      docs.slice(i, i + BATCH_SIZE).forEach((d) =>
        batch.update(d.ref, { read: true, readAt: serverTimestamp() })
      );
      // eslint-disable-next-line no-await-in-loop
      await batch.commit();
    }
    return { updated: docs.length };
  } catch (error) {
    logger.error("markAllNotificationsAsRead", error);
    throw new Error(error.message || "Error al actualizar las notificaciones.");
  }
};

/**
 * Notificaciones en tiempo real del usuario (máx. 50, más recientes primero).
 * Si falta el índice compuesto (userId asc, createdAt desc) cae a una consulta sin
 * orderBy y ordena en cliente. El unsubscribe devuelto cancela la suscripción activa.
 * @returns {Function} unsubscribe
 */
export const subscribeToNotifications = (userId, callback) => {
  if (!userId || typeof callback !== "function") return () => {};

  let cancelled = false;
  let activeUnsub = null;

  const mapDocs = (snapshot) => snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

  const subscribeFallback = () => {
    activeUnsub = onSnapshot(
      query(collection(db, "notifications"), where("userId", "==", userId), limit(200)),
      (snapshot) => {
        if (cancelled) return;
        const list = mapDocs(snapshot)
          .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt))
          .slice(0, NOTIFICATIONS_LIMIT);
        callback(list);
      },
      (error) => {
        logger.error("subscribeToNotifications(fallback)", error);
        if (!cancelled) callback([]);
      }
    );
  };

  activeUnsub = onSnapshot(
    query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(NOTIFICATIONS_LIMIT)
    ),
    (snapshot) => {
      if (!cancelled) callback(mapDocs(snapshot));
    },
    (error) => {
      if (cancelled) return;
      if (error.code === "failed-precondition") {
        logger.warn("subscribeToNotifications: falta índice, usando consulta sin orden");
        subscribeFallback();
        return;
      }
      logger.error("subscribeToNotifications", error);
      callback([]);
    }
  );

  return () => {
    cancelled = true;
    if (activeUnsub) activeUnsub();
    activeUnsub = null;
  };
};

const safeNotify = async (data, context) => {
  try {
    await createNotification(data);
  } catch (error) {
    logger.error(context, error);
  }
};

export const notifyFieldApproved = (fieldId, fieldName, ownerId) =>
  safeNotify(
    {
      userId: ownerId,
      type: "field_approved",
      title: "Cancha Aprobada",
      message: `Tu cancha "${fieldName}" ha sido aprobada y ahora está visible para los clientes.`,
      relatedId: fieldId,
      actionUrl: "/associate/fields",
      icon: "check_circle",
      color: "success",
    },
    "notifyFieldApproved"
  );

export const notifyFieldRejected = (fieldId, fieldName, ownerId) =>
  safeNotify(
    {
      userId: ownerId,
      type: "field_rejected",
      title: "Cancha Rechazada",
      message: `Tu cancha "${fieldName}" ha sido rechazada. Por favor, revisa la información y contacta al administrador si tienes dudas.`,
      relatedId: fieldId,
      actionUrl: "/associate/fields",
      icon: "cancel",
      color: "error",
    },
    "notifyFieldRejected"
  );

/**
 * Notifica a los admins de una cancha pendiente.
 * NOTA: desde la Fase 2 esto lo hace la Cloud Function `onFieldWritten` en el servidor
 * (un asociado no puede listar usuarios admin con las nuevas reglas). Esta función solo
 * funciona si la ejecuta un admin y se mantiene por compatibilidad.
 */
export const notifyAdminsFieldPending = async (fieldId, fieldName, ownerName) => {
  try {
    if (!auth.currentUser) return;
    const adminsSnapshot = await getDocs(
      query(collection(db, "users"), where("role", "==", "admin"))
    );
    await Promise.all(
      adminsSnapshot.docs.map((adminDoc) =>
        safeNotify(
          {
            userId: adminDoc.id,
            type: "field_pending",
            title: "Nueva Cancha Pendiente",
            message: `La cancha "${fieldName}" de ${ownerName || "un asociado"} está pendiente de aprobación.`,
            relatedId: fieldId,
            actionUrl: `/canchas?fieldId=${fieldId}&status=pending`,
            icon: "pending_actions",
            color: "warning",
          },
          "notifyAdminsFieldPending"
        )
      )
    );
  } catch (error) {
    logger.warn("notifyAdminsFieldPending: sin permiso (lo hace el servidor)", error);
  }
};

export const notifyReservationCreated = (reservationId, fieldName, clientId) =>
  safeNotify(
    {
      userId: clientId,
      type: "reservation_created",
      title: "Reserva Creada",
      message: `Tu reserva para "${fieldName}" ha sido creada exitosamente. El dueño de la cancha la revisará pronto.`,
      relatedId: reservationId,
      actionUrl: "/reservations",
      icon: "event_available",
      color: "info",
    },
    "notifyReservationCreated"
  );

export const notifyReservationReceived = (reservationId, fieldName, ownerId, clientName) =>
  safeNotify(
    {
      userId: ownerId,
      type: "reservation_received",
      title: "Nueva Reserva",
      message: `Has recibido una nueva reserva para "${fieldName}" de ${clientName}.`,
      relatedId: reservationId,
      actionUrl: "/associate/reservations",
      icon: "notifications_active",
      color: "info",
    },
    "notifyReservationReceived"
  );

export const notifyReservationConfirmed = (reservationId, fieldName, clientId) =>
  safeNotify(
    {
      userId: clientId,
      type: "reservation_confirmed",
      title: "Reserva Confirmada",
      message: `Tu reserva para "${fieldName}" ha sido confirmada por el dueño de la cancha.`,
      relatedId: reservationId,
      actionUrl: "/reservations",
      icon: "check_circle",
      color: "success",
    },
    "notifyReservationConfirmed"
  );

export const notifyReservationCancelled = (reservationId, fieldName, clientId) =>
  safeNotify(
    {
      userId: clientId,
      type: "reservation_cancelled",
      title: "Reserva Cancelada",
      message: `Tu reserva para "${fieldName}" ha sido cancelada por el dueño de la cancha.`,
      relatedId: reservationId,
      actionUrl: "/reservations",
      icon: "cancel",
      color: "error",
    },
    "notifyReservationCancelled"
  );
