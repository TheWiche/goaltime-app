import { toDate } from "shared/utils/date";

export const DAY_MS = 24 * 60 * 60 * 1000;
export const TREND_DAYS = 30;

/** Milisegundos de un valor de fecha (Timestamp, Date, ms, ISO); 0 si no es válido. */
export const toMillis = (value) => {
  const d = toDate(value);
  return d ? d.getTime() : 0;
};

/** Ordena (copia) por createdAt descendente. */
export const sortByCreatedDesc = (items) =>
  [...items].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));

/**
 * Compara los últimos 30 días con los 30 anteriores.
 * Devuelve props para StatCard: { trend, trendUp } o {} si no hay base de comparación.
 */
export function periodTrend(current, previous) {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0) return {};
  const pct = Math.round(((current - previous) / previous) * 100);
  return { trend: Math.abs(pct), trendUp: pct >= 0 };
}

/**
 * Suma `getValue(item)` de los elementos creados en los últimos 30 días (current)
 * y en los 30 previos (previous), según `createdAt`.
 */
export function sumByPeriods(items, getValue = () => 1, now = Date.now()) {
  const startCurrent = now - TREND_DAYS * DAY_MS;
  const startPrevious = now - 2 * TREND_DAYS * DAY_MS;
  let current = 0;
  let previous = 0;
  items.forEach((item) => {
    const t = toMillis(item.createdAt);
    if (!t) return;
    if (t >= startCurrent) current += getValue(item);
    else if (t >= startPrevious) previous += getValue(item);
  });
  return { current, previous };
}

const MONTH_FORMAT = new Intl.DateTimeFormat("es-CO", { month: "short" });

/** Últimos `count` meses (más antiguo primero): [{ key: "2026-06", label: "jun" }]. */
export function lastMonths(count = 6, now = new Date()) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return { key, label: MONTH_FORMAT.format(d).replace(".", "") };
  });
}
