// Archivo: src/App.js

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from './firebase'; // Importamos todo desde firebase

import Registro from './components/Registro';
import Login from './components/Login';
import PanelDueño from './components/dueño/PanelDueño'; 
import PanelAdmin from './components/admin/PanelAdmin'; 
import './App.css';

function App() {
  // --- ESTADO ---
  // currentUser guardará la información del usuario con sesión activa, o será 'null' si nadie ha iniciado sesión.
  const [currentUser, setCurrentUser] = useState(null);

  // --- EFECTO (EL OYENTE) ---
  // useEffect se ejecuta una sola vez cuando el componente App se carga.
  useEffect(() => {
    // onAuthStateChanged es nuestro "oyente" de Firebase.
    // Queda activo y nos notifica cada vez que el estado de autenticación cambia (login/logout).
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Si 'user' existe, significa que alguien ha iniciado sesión.
        // Ahora, vamos a Firestore a buscar el documento de este usuario para obtener su rol y nombre.
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          // Si encontramos el documento, guardamos toda la información en nuestro estado 'currentUser'.
          setCurrentUser({
            uid: user.uid,
            ...userDoc.data() // Esto copia todos los campos del documento (email, nombre, rol)
          });
        }
      } else {
        // Si 'user' no existe, significa que nadie ha iniciado sesión o se ha cerrado la sesión.
        setCurrentUser(null);
      }
    });

    // Esta función de limpieza es importante. Se ejecuta cuando el componente se "desmonta".
    return () => unsubscribe();
  }, []); // El array vacío [] asegura que el efecto se ejecute solo una vez.

  // --- FUNCIÓN PARA CERRAR SESIÓN ---
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Has cerrado la sesión.");
    } catch (error) {
      console.error("Error al cerrar sesión: ", error);
    }
  };

  // --- RENDERIZADO CONDICIONAL ---
  // Aquí decidimos qué mostrar en la pantalla basándonos en si 'currentUser' tiene datos o es 'null'.
  return (
    <div className="App">
      <header className="App-header">
        <h1>Bienvenido a GoalTime</h1>

        {currentUser ? (
          <div>
            <h2>Hola, {currentUser.nombre}!</h2>
            <p>Tu rol es: <strong>{currentUser.rol.toUpperCase()}</strong></p>
            <button onClick={handleLogout}>Cerrar Sesión</button>

            {/* AQUÍ ESTÁ EL CAMBIO PRINCIPAL */}
            {currentUser.rol === 'cliente' && <div>Panel del Cliente (próximamente)</div>}
            
            {/* 2. REEMPLAZA EL DIV CON EL NUEVO COMPONENTE Y PÁSALE LOS DATOS DEL USUARIO */}
            {currentUser.rol === 'dueño' && <PanelDueño currentUser={currentUser} />}
            
            {currentUser.rol === 'admin' && <PanelAdmin />}
          </div>
        ) : (
          <div>
            <Registro />
            <hr />
            <Login />
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
