// src/shared/utils/url.js
// Protección contra open redirects en parámetros como ?continueUrl= / ?redirect=.

const ALLOWED_HOSTS = ["goaltime.site", "www.goaltime.site", "localhost", "127.0.0.1"];

const currentOrigin = () =>
  typeof window !== "undefined" && window.location ? window.location.origin : "";

/**
 * true si `url` es una ruta interna segura:
 *  - ruta relativa que empieza por "/" pero no "//" ni "/\" (protocol-relative),
 *  - o URL absoluta http(s) del mismo origen o de un host permitido.
 * Rechaza javascript:, data:, etc.
 */
export const isSafeInternalUrl = (url) => {
  if (typeof url !== "string") return false;
  const value = url.trim();
  if (!value) return false;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001F\u007F]/.test(value)) return false;

  if (value.startsWith("/")) {
    return !value.startsWith("//") && !value.startsWith("/\\");
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    if (parsed.origin === currentOrigin()) return true;
    return ALLOWED_HOSTS.includes(parsed.hostname);
  } catch {
    return false;
  }
};

/**
 * Devuelve una RUTA interna (pathname + search + hash) segura para navigate(),
 * o `fallback` si la URL no es segura.
 * Ej: getSafeContinuePath("https://www.goaltime.site/canchas?x=1") → "/canchas?x=1"
 *     getSafeContinuePath("https://evil.com") → "/"
 */
export const getSafeContinuePath = (url, fallback = "/") => {
  if (!isSafeInternalUrl(url)) return fallback;
  const value = url.trim();
  if (value.startsWith("/")) return value;
  try {
    const parsed = new URL(value);
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || fallback;
  } catch {
    return fallback;
  }
};

/** Home por rol: admin/asociado → /dashboard, cliente (o desconocido) → /canchas. */
export const getHomePathForRole = (role) =>
  role === "admin" || role === "asociado" ? "/dashboard" : "/canchas";
