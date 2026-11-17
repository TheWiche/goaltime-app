// src/shared/services/firebaseApp.js
// Inicialización única de Firebase + helper para llamar a las Cloud Functions HTTP.

import { initializeApp } from "firebase/app";
import { getAuth, getIdToken } from "firebase/auth";
import { getFirestore, enableNetwork } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// La configuración web de Firebase NO es secreta (identifica el proyecto);
// la seguridad la dan firestore.rules / storage.rules y las Cloud Functions.
const firebaseConfig = {
  apiKey: "AIzaSyAYNTJFFdA7pPR3WGJv0mUTc328FRZ3gg8",
  authDomain: "goaltime-68101.firebaseapp.com",
  projectId: "goaltime-68101",
  storageBucket: "goaltime-68101.appspot.com",
  messagingSenderId: "208497272561",
  appId: "1:208497272561:web:38bc4f42784da077dbeb50",
  measurementId: "G-66L288MXFS",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

if (typeof window !== "undefined") {
  // Puede fallar si una extensión bloquea Firestore; no es crítico.
  enableNetwork(db).catch(() => {});
}

export const FUNCTIONS_BASE_URL = "https://us-central1-goaltime-68101.cloudfunctions.net";

/** Devuelve el usuario autenticado o lanza un Error("No autenticado."). */
export const requireUser = () => {
  const user = auth.currentUser;
  if (!user) throw new Error("No autenticado.");
  return user;
};

/**
 * POST autenticado a una Cloud Function HTTP (onRequest).
 * Lanza Error con el mensaje del servidor (`error` o `details`) si la respuesta no es 2xx.
 * @param {string} name nombre de la función (p.ej. "createUser")
 * @param {object} [body]
 * @param {string} [fallbackMessage]
 */
export const callHttpFunction = async (name, body, fallbackMessage = "Error del servidor.") => {
  const user = requireUser();
  const token = await getIdToken(user);

  let response;
  try {
    response = await fetch(`${FUNCTIONS_BASE_URL}/${name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body || {}),
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor. Revisa tu conexión a internet.");
  }

  const contentType = response.headers.get("content-type") || "";
  let data = null;
  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    const text = await response.text().catch(() => "");
    data = { error: text && text.length < 300 ? text : null };
  }

  if (!response.ok) {
    const error = new Error(
      data?.error || data?.details || `${fallbackMessage} (HTTP ${response.status})`
    );
    error.status = response.status;
    throw error;
  }
  return data || { success: true };
};
