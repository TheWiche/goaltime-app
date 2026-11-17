// src/shared/utils/logger.js
// Logger mínimo: en producción NO imprime nada salvo errores (sin datos personales).
// Úsalo en lugar de console.log para no filtrar emails/uids en la consola.

const isDev = process.env.NODE_ENV !== "production";

/* eslint-disable no-console */
export const logger = {
  debug: (...args) => {
    if (isDev) console.debug(...args);
  },
  info: (...args) => {
    if (isDev) console.info(...args);
  },
  warn: (...args) => {
    if (isDev) console.warn(...args);
  },
  /**
   * Registra un error con un contexto corto. En producción solo se imprime
   * el código/mensaje (no objetos con datos de usuario).
   */
  error: (context, error) => {
    if (isDev) {
      console.error(context, error);
    } else {
      console.error(context, error?.code || error?.message || "error");
    }
  },
};
/* eslint-enable no-console */

export default logger;
