// src/shared/services/authService.js

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  confirmPasswordReset,
  sendEmailVerification,
  applyActionCode,
  onAuthStateChanged,
  reload,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebaseApp";
import { logger } from "shared/utils/logger";

/**
 * URL a la que Firebase redirige tras una acción de email (verificar / reset).
 * Usa el origin real (http://localhost:3000, https://goaltime.site o https://www.goaltime.site).
 * Todos esos dominios deben estar en Firebase Console > Authentication > Authorized domains.
 */
export const getAuthActionContinueUrl = (path) => `${window.location.origin}${path}`;

const VERIFY_EMAIL_PATH = "/authentication/verify-email";
const RESET_CONFIRM_PATH = "/authentication/reset-password/confirm";

/**
 * Crea el perfil users/{uid} si no existe (rol "cliente").
 * Usa siempre user.email (normalizado por Firebase Auth) para cumplir firestore.rules.
 */
const ensureUserProfile = async (user, name) => {
  const userDocRef = doc(db, "users", user.uid);
  const snap = await getDoc(userDocRef);
  if (snap.exists()) return snap.data();

  const profile = {
    uid: user.uid,
    name: (name || user.displayName || user.email || "").trim().slice(0, 120), // reglas: <=120
    email: user.email || null,
    role: "cliente",
    createdAt: serverTimestamp(),
  };
  await setDoc(userDocRef, profile);
  const finalSnap = await getDoc(userDocRef);
  return finalSnap.exists() ? finalSnap.data() : profile;
};

export const registerUser = async (name, email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const userProfile = {
    uid: user.uid,
    name: (name || "").trim().slice(0, 120), // reglas: <=120
    email: user.email,
    role: "cliente",
    createdAt: serverTimestamp(),
  };
  await setDoc(doc(db, "users", user.uid), userProfile);

  let emailSent = false;
  let emailError = null;
  try {
    await sendEmailVerification(user, {
      url: getAuthActionContinueUrl(VERIFY_EMAIL_PATH),
      handleCodeInApp: false,
    });
    emailSent = true;
  } catch (error) {
    // No interrumpe el registro; la página de verificación permite reenviar.
    logger.error("registerUser: error enviando verificación", error);
    emailError = error;
  }

  userProfile.emailVerificationSent = emailSent;
  if (emailError) {
    userProfile.emailVerificationError = { code: emailError.code, message: emailError.message };
  }
  return userProfile;
};

export const loginUser = async (email, password, rememberMe) => {
  const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
  await setPersistence(auth, persistenceType);

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // NO se cierra sesión: el frontend redirige a /authentication/verify-email.
  if (!user.emailVerified) {
    const error = new Error("Email no verificado");
    error.code = "auth/email-not-verified";
    throw error;
  }

  // Si el registro no llegó a crear users/{uid} (p.ej. fallo de red tras crear la cuenta),
  // se crea aquí con rol "cliente" (lo permiten las reglas) en vez de dejar la cuenta sin perfil.
  return ensureUserProfile(user);
};

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, new GoogleAuthProvider());
  return ensureUserProfile(result.user);
};

export const signInWithFacebook = async () => {
  const result = await signInWithPopup(auth, new FacebookAuthProvider());
  return ensureUserProfile(result.user);
};

export const verifyCurrentPassword = async (password) => {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error("No hay un usuario autenticado.");

  const isEmailPassword = user.providerData.some((p) => p.providerId === "password");
  if (!isEmailPassword) throw new Error("Este método de autenticación no requiere contraseña.");

  try {
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    return { success: true };
  } catch (error) {
    if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
      const passwordError = new Error("La contraseña actual es incorrecta.");
      passwordError.code = "auth/wrong-password";
      throw passwordError;
    }
    throw error;
  }
};

export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email, {
      url: getAuthActionContinueUrl(RESET_CONFIRM_PATH),
      handleCodeInApp: false,
    });
    return { success: true };
  } catch (error) {
    logger.error("sendPasswordReset", error);
    throw error;
  }
};

export const resetPassword = async (oobCode, newPassword) => {
  await confirmPasswordReset(auth, oobCode, newPassword);
  return { success: true };
};

export const logoutUser = () => signOut(auth);

/** Reenvía el email de verificación al usuario actual. */
export const resendVerificationEmail = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("No hay usuario autenticado");
  if (user.emailVerified) throw new Error("El email ya está verificado");

  try {
    await sendEmailVerification(user, {
      url: getAuthActionContinueUrl(VERIFY_EMAIL_PATH),
      handleCodeInApp: false,
    });
  } catch (error) {
    if (error.code === "auth/too-many-requests") {
      const friendlyError = new Error(
        "Has enviado demasiados emails de verificación. Por favor, espera unos minutos antes de intentar nuevamente."
      );
      friendlyError.code = "auth/too-many-requests";
      throw friendlyError;
    }
    if (error.code === "auth/unauthorized-continue-uri") {
      const currentDomain = window.location.hostname;
      const friendlyError = new Error(
        `El dominio "${currentDomain}" no está autorizado en Firebase (Authentication > Settings > Authorized domains).`
      );
      friendlyError.code = "auth/unauthorized-continue-uri";
      friendlyError.domain = currentDomain;
      throw friendlyError;
    }
    throw error;
  }
};

/** Recarga el usuario y devuelve si su email está verificado. */
export const checkEmailVerification = async () => {
  const user = auth.currentUser;
  if (!user) return false;
  await reload(user);
  return user.emailVerified;
};

/** Aplica el oobCode de verificación de email y recarga el usuario. */
export const verifyEmailWithCode = async (oobCode) => {
  await applyActionCode(auth, oobCode);
  const user = auth.currentUser;
  if (user) {
    try {
      await reload(user);
      // Fuerza un token nuevo con email_verified=true (lo usan las reglas/funciones).
      await user.getIdToken(true);
    } catch (error) {
      logger.warn("verifyEmailWithCode: no se pudo recargar el usuario", error);
    }
  }
  return { success: true };
};

/**
 * Suscribe a cambios de auth + verificación de email.
 * @returns {Function} unsubscribe
 */
export const subscribeToEmailVerification = (callback) =>
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback(false, null);
      return;
    }
    try {
      await reload(user);
    } catch (error) {
      logger.warn("subscribeToEmailVerification: reload falló", error);
    }
    callback(user.emailVerified, user);
  });
