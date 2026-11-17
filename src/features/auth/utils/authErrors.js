// Mapeo de códigos de error de Firebase Auth a mensajes en español.

const MESSAGES = {
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/wrong-password": "Correo o contraseña incorrectos.",
  "auth/user-not-found": "Correo o contraseña incorrectos.",
  "auth/invalid-email": "El formato del correo electrónico no es válido.",
  "auth/email-already-in-use": "Este correo electrónico ya está registrado.",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
  "auth/email-not-verified": "Verifica tu correo electrónico antes de iniciar sesión.",
  "auth/too-many-requests":
    "Demasiados intentos. Espera unos minutos o restablece tu contraseña.",
  "auth/user-disabled": "Esta cuenta está deshabilitada. Contacta a soporte.",
  "auth/network-request-failed": "Sin conexión. Revisa tu internet e inténtalo de nuevo.",
  "auth/popup-closed-by-user": "Cerraste la ventana antes de completar el acceso.",
  "auth/cancelled-popup-request": "Cerraste la ventana antes de completar el acceso.",
  "auth/popup-blocked": "Tu navegador bloqueó la ventana emergente. Permítela e inténtalo de nuevo.",
  "auth/operation-not-allowed": "Este método de acceso no está habilitado en este momento.",
  "auth/account-exists-with-different-credential":
    "Ya existe una cuenta con este correo. Inicia sesión con tu método original.",
  "auth/unauthorized-domain": "Este dominio no está autorizado. Contacta al administrador.",
  "auth/expired-action-code": "El enlace ha expirado. Solicita uno nuevo.",
  "auth/invalid-action-code": "El enlace no es válido o ya fue utilizado. Solicita uno nuevo.",
};

const FALLBACK = "Ocurrió un error inesperado. Inténtalo de nuevo más tarde.";

/** Códigos que no son un fallo real (el usuario cerró el popup). */
const NEUTRAL_CODES = ["auth/popup-closed-by-user", "auth/cancelled-popup-request"];

export const getAuthErrorMessage = (code) => MESSAGES[code] ?? FALLBACK;

/** Tipo de toast sugerido: info para cancelaciones del usuario, error para el resto. */
export const getAuthErrorType = (code) => (NEUTRAL_CODES.includes(code) ? "info" : "error");

export const MIN_PASSWORD_LENGTH = 6;
