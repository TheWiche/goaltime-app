// src/shared/utils/format.js

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });

/**
 * Formatea un monto en pesos colombianos sin decimales: 85000 → "$ 85.000".
 * Valores no numéricos se tratan como 0.
 */
export const formatCurrency = (amount) => {
  const n = Number(amount);
  return currencyFormatter.format(Number.isFinite(n) ? n : 0);
};

/** Número con separador de miles es-CO: 12500 → "12.500". */
export const formatNumber = (value) => {
  const n = Number(value);
  return numberFormatter.format(Number.isFinite(n) ? n : 0);
};

const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "`": "&#96;",
};

/**
 * Escapa texto para insertarlo en HTML (p.ej. al generar un ticket imprimible
 * con document.write). null/undefined → "".
 */
export const escapeHtml = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[&<>"'`]/g, (ch) => HTML_ESCAPES[ch]);
};

/** Código corto de reserva: "#AB12CD34". */
export const formatReservationCode = (id) =>
  id ? `#${String(id).substring(0, 8).toUpperCase()}` : "#N/A";

/** Iniciales para avatares: "Juan Pérez" → "JP". */
export const getInitials = (name, fallback = "?") => {
  if (!name || typeof name !== "string") return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  const first = parts[0][0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
};
