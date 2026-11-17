// src/shared/services/favoritesService.js
// Documento: favorites/{uid}_{fieldId}  { userId, fieldId, createdAt }

import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, requireUser } from "./firebaseApp";
import { logger } from "shared/utils/logger";

const favoriteRef = (uid, fieldId) => doc(db, "favorites", `${uid}_${fieldId}`);

const assertFieldId = (fieldId) => {
  if (!fieldId || typeof fieldId !== "string" || fieldId.includes("/")) {
    throw new Error("Cancha no válida.");
  }
};

export const addToFavorites = async (fieldId) => {
  const user = requireUser();
  assertFieldId(fieldId);
  try {
    const ref = favoriteRef(user.uid, fieldId);
    const snap = await getDoc(ref);
    if (snap.exists()) return true; // no pisar createdAt
    await setDoc(ref, { userId: user.uid, fieldId, createdAt: serverTimestamp() });
    return true;
  } catch (error) {
    logger.error("addToFavorites", error);
    throw new Error(error.message || "Error al agregar a favoritos.");
  }
};

export const removeFromFavorites = async (fieldId) => {
  const user = requireUser();
  assertFieldId(fieldId);
  try {
    await deleteDoc(favoriteRef(user.uid, fieldId));
    return true;
  } catch (error) {
    logger.error("removeFromFavorites", error);
    throw new Error(error.message || "Error al remover de favoritos.");
  }
};

export const isFavorite = async (fieldId) => {
  const user = auth.currentUser;
  if (!user || !fieldId) return false;
  try {
    const snap = await getDoc(favoriteRef(user.uid, fieldId));
    return snap.exists();
  } catch (error) {
    logger.error("isFavorite", error);
    return false;
  }
};

/** @returns {Promise<string[]>} ids de canchas favoritas del usuario. */
export const getUserFavorites = async (userId) => {
  if (!userId) return [];
  try {
    const snap = await getDocs(query(collection(db, "favorites"), where("userId", "==", userId)));
    return snap.docs.map((d) => d.data().fieldId);
  } catch (error) {
    logger.error("getUserFavorites", error);
    return [];
  }
};

/** @returns {Function} unsubscribe. El callback recibe string[] de fieldIds. */
export const subscribeToFavorites = (userId, callback) => {
  if (!userId || typeof callback !== "function") return () => {};
  return onSnapshot(
    query(collection(db, "favorites"), where("userId", "==", userId)),
    (snapshot) => callback(snapshot.docs.map((d) => d.data().fieldId)),
    (error) => {
      logger.error("subscribeToFavorites", error);
      callback([]);
    }
  );
};
