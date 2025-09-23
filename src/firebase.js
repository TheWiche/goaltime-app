// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDnmhpENoQhzOl7cp8fnRDtb_8Bf5deR4w",
  authDomain: "goaltime-fd6c6.firebaseapp.com",
  projectId: "goaltime-fd6c6",
  storageBucket: "goaltime-fd6c6.firebasestorage.app",
  messagingSenderId: "790185974791",
  appId: "1:790185974791:web:1f53ecab01052bcb4ddea2"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar los servicios que usaremos
export const auth = getAuth(app);
export const db = getFirestore(app);