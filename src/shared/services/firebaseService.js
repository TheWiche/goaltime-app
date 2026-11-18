// src/shared/services/firebaseService.js
//
// Punto de entrada ÚNICO (compatibilidad): los features importan desde aquí.
// La implementación está dividida en módulos:
//   firebaseApp.js          → app, auth, db, storage, callHttpFunction
//   authService.js          → registro, login, verificación de email, reset password
//   usersService.js         → admin de usuarios (Cloud Functions), perfil, fotos
//   fieldsService.js        → canchas
//   reservationsService.js  → reservas, disponibilidad (locks en `slots`), emails
//   notificationsService.js → notificaciones
//   favoritesService.js     → favoritos

export { app, auth, db, storage, callHttpFunction, requireUser } from "./firebaseApp";

export {
  registerUser,
  loginUser,
  signInWithGoogle,
  signInWithFacebook,
  verifyCurrentPassword,
  sendPasswordReset,
  resetPassword,
  logoutUser,
  resendVerificationEmail,
  checkEmailVerification,
  verifyEmailWithCode,
  subscribeToEmailVerification,
  getAuthActionContinueUrl,
} from "./authService";

export {
  USER_ROLES,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  callCreateUserRequest,
  callToggleUserStatusRequest,
  callSetUserRoleRequest,
  getUserProfileById,
  updateOwnProfile,
  validateImageFile,
  uploadProfilePhoto,
  deleteProfilePhoto,
  uploadFieldImage,
} from "./usersService";

export {
  FIELD_STATUSES,
  FIELD_EDITABLE_KEYS,
  sanitizeFieldData,
  createField,
  createFieldWithImage,
  updateField,
  updateFieldAsAdmin,
  getFieldById,
  toggleFieldStatus,
  callApproveFieldRequest,
} from "./fieldsService";

export {
  SLOT_MINUTES,
  MAX_RESERVATION_HOURS,
  getSlotId,
  getSlotStarts,
  rangesOverlap,
  checkReservationConflict,
  getAvailableTimeSlots,
  createReservation,
  updateReservationStatus,
  cancelReservation,
  subscribeToOwnerReservations,
  subscribeToClientReservations,
  sendReservationStatusChangeEmail,
  sendTicketByEmail,
} from "./reservationsService";

export {
  NOTIFICATIONS_LIMIT,
  NOTIFICATION_TYPES,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToNotifications,
  notifyFieldApproved,
  notifyFieldRejected,
  notifyAdminsFieldPending,
  notifyReservationCreated,
  notifyReservationReceived,
  notifyReservationConfirmed,
  notifyReservationCancelled,
  notifyReservationCancelledByClient,
  notifyReservationCompleted,
} from "./notificationsService";

export {
  addToFavorites,
  removeFromFavorites,
  isFavorite,
  getUserFavorites,
  subscribeToFavorites,
} from "./favoritesService";
