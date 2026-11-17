// src/shared/utils/date.js
// Utilidades de fecha/hora en zona LOCAL del navegador.
// IMPORTANTE: no usar `new Date().toISOString().split("T")[0]` para "hoy":
// toISOString() está en UTC y en Colombia (UTC-5) devuelve el día siguiente
// a partir de las 19:00.

const pad2 = (n) => String(n).padStart(2, "0");

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Convierte un Date a 'YYYY-MM-DD' usando la fecha local. */
export const toLocalISODate = (date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

/** 'YYYY-MM-DD' de hoy (zona local). */
export const todayLocalISO = () => toLocalISODate(new Date());

/** 'YYYY-MM-DD' de mañana (zona local). */
export const tomorrowLocalISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toLocalISODate(d);
};

/** Suma días a 'YYYY-MM-DD' y devuelve 'YYYY-MM-DD'. */
export const addDaysISO = (isoDate, days) => {
  const d = parseLocalDate(isoDate);
  if (!d) return null;
  d.setDate(d.getDate() + days);
  return toLocalISODate(d);
};

/** true si el string tiene formato 'YYYY-MM-DD' y es una fecha real. */
export const isValidISODate = (str) => parseLocalDate(str) !== null;

/**
 * Parsea 'YYYY-MM-DD' como fecha LOCAL (00:00 hora local).
 * `new Date("2025-01-10")` la interpreta en UTC y en Colombia muestra el día 9.
 * @returns {Date|null}
 */
export const parseLocalDate = (str) => {
  if (typeof str !== "string") return null;
  const m = ISO_DATE_RE.exec(str.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]) - 1;
  const day = Number(m[3]);
  const d = new Date(year, month, day);
  if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) return null;
  return d;
};

/**
 * Convierte cualquier valor de fecha habitual en la app a Date:
 * Timestamp de Firestore ({seconds} o toDate()), Date, número (ms) o 'YYYY-MM-DD'.
 * @returns {Date|null}
 */
export const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value.seconds === "number") return new Date(value.seconds * 1000);
  if (typeof value === "number") return new Date(value);
  if (typeof value === "string") {
    const local = parseLocalDate(value);
    if (local) return local;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
};

/**
 * Formatea una fecha en español (es-CO).
 * @param {string|Date|object} value 'YYYY-MM-DD', Date o Timestamp de Firestore.
 * @param {Intl.DateTimeFormatOptions} [opts] por defecto: "10 de enero de 2025".
 * @param {string} [fallback="N/A"]
 */
export const formatDateEs = (
  value,
  opts = { year: "numeric", month: "long", day: "numeric" },
  fallback = "N/A"
) => {
  const d = toDate(value);
  if (!d) return fallback;
  return d.toLocaleDateString("es-CO", opts);
};

/** Fecha + hora en español, p.ej. "10 ene 2025, 3:45 p. m." */
export const formatDateTimeEs = (value, fallback = "N/A") => {
  const d = toDate(value);
  if (!d) return fallback;
  return d.toLocaleString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

/** true si 'HH:mm' es válido (00:00–23:59). */
export const isValidTime = (time) => typeof time === "string" && TIME_RE.test(time);

/**
 * 'HH:mm' → minutos desde medianoche. Devuelve NaN si el formato no es válido.
 * Acepta "24:00" como fin de día (1440).
 */
export const minutesFromTime = (time) => {
  if (time === "24:00") return 24 * 60;
  if (!isValidTime(time)) return NaN;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

/** minutos desde medianoche → 'HH:mm' (no hace wrap: 1440 → "24:00"). */
export const timeFromMinutes = (minutes) => {
  const total = Math.max(0, Math.round(minutes));
  return `${pad2(Math.floor(total / 60))}:${pad2(total % 60)}`;
};

/** Añade horas (puede ser decimal) a 'HH:mm'. Devuelve null si cruza medianoche. */
export const addHoursToTime = (time, hours) => {
  const start = minutesFromTime(time);
  if (Number.isNaN(start)) return null;
  const end = start + Math.round(Number(hours) * 60);
  if (end > 24 * 60) return null;
  return timeFromMinutes(end);
};

/** Compara dos fechas 'YYYY-MM-DD' (sirve comparación lexicográfica). */
export const compareISODate = (a, b) => (a === b ? 0 : a < b ? -1 : 1);

/** true si la fecha 'YYYY-MM-DD' es anterior a hoy (local). */
export const isPastDate = (isoDate) => compareISODate(isoDate, todayLocalISO()) < 0;
