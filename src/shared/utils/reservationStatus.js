// src/shared/utils/reservationStatus.js
// Fuente única de verdad para los estados de reserva (cliente).
// Debe mantenerse sincronizado con firestore.rules (validReservationTransition)
// y functions/index.js (RESERVATION_STATUS_LABELS).

export const RESERVATION_STATUS = Object.freeze({
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
});

/**
 * Metadatos por estado. `tone` es compatible con <StatusPill tone="...">.
 */
export const STATUS = Object.freeze({
  pending: { value: "pending", label: "Pendiente", tone: "warning" },
  confirmed: { value: "confirmed", label: "Confirmada", tone: "success" },
  cancelled: { value: "cancelled", label: "Cancelada", tone: "danger" },
  completed: { value: "completed", label: "Completada", tone: "info" },
});

export const RESERVATION_STATUSES = Object.freeze(Object.keys(STATUS));

/**
 * Transiciones válidas: estado actual → estados destino permitidos.
 * - pending   → confirmed (dueño/admin) | cancelled (dueño/admin/cliente)
 * - confirmed → completed (dueño/admin) | cancelled (dueño/admin/cliente)
 * - cancelled / completed son finales.
 */
export const STATUS_TRANSITIONS = Object.freeze({
  pending: Object.freeze(["confirmed", "cancelled"]),
  confirmed: Object.freeze(["completed", "cancelled"]),
  cancelled: Object.freeze([]),
  completed: Object.freeze([]),
});

/** Estados que ocupan franja horaria (bloquean disponibilidad). */
export const BLOCKING_STATUSES = Object.freeze(["pending", "confirmed"]);

export const isValidReservationStatus = (status) =>
  Object.prototype.hasOwnProperty.call(STATUS, status);

export const canTransition = (from, to) =>
  Boolean(STATUS_TRANSITIONS[from] && STATUS_TRANSITIONS[from].includes(to));

/** Destinos posibles desde `from` (para poblar un select). */
export const getAllowedTransitions = (from) => STATUS_TRANSITIONS[from] || [];

/** Destinos que un CLIENTE puede elegir sobre su propia reserva. */
export const getClientAllowedTransitions = (from) =>
  getAllowedTransitions(from).filter((s) => s === "cancelled");

export const getStatusMeta = (status) =>
  STATUS[status] || { value: status, label: status || "Desconocido", tone: "neutral" };

export const getStatusLabel = (status) => getStatusMeta(status).label;
export const getStatusTone = (status) => getStatusMeta(status).tone;

/** Opciones {value,label} para filtros, con "Todas" opcional al inicio. */
export const getStatusOptions = ({ includeAll = false, allLabel = "Todas" } = {}) => {
  const opts = RESERVATION_STATUSES.map((s) => ({ value: s, label: STATUS[s].label }));
  return includeAll ? [{ value: "all", label: allLabel }, ...opts] : opts;
};

// --- Estados de cancha (por conveniencia de UI) ---
export const FIELD_STATUS = Object.freeze({
  pending: { value: "pending", label: "Pendiente", tone: "warning" },
  approved: { value: "approved", label: "Aprobada", tone: "success" },
  rejected: { value: "rejected", label: "Rechazada", tone: "danger" },
  disabled: { value: "disabled", label: "Deshabilitada", tone: "neutral" },
});

export const getFieldStatusMeta = (status) =>
  FIELD_STATUS[status] || { value: status, label: status || "Desconocido", tone: "neutral" };
