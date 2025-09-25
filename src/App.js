// Archivo: src/App.js

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from './firebase'; // Importamos todo desde firebase

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Registro from './components/Registro';
import Login from './components/Login';
import PanelDueño from './components/dueño/PanelDueño'; 
import PanelAdmin from './components/admin/PanelAdmin'; 
import './App.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  // --- ESTADO ---
  // currentUser guardará la información del usuario con sesión activa, o será 'null' si nadie ha iniciado sesión.
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
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

  // Invierte el valor de showLogin para cambiar de formulario.
  const toggleForm = () => {
    setShowLogin(!showLogin);
  };

  // --- RENDERIZADO CONDICIONAL ---
  // Aquí decidimos qué mostrar en la pantalla basándonos en si 'currentUser' tiene datos o es 'null'.
  
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div className="App">
        <header className="App-header">
          <h1>Bienvenido a GoalTime</h1>

          {currentUser ? (
            <div>
              {/* Aquí va la lógica cuando el usuario YA ha iniciado sesión */}
            </div>
          ) : (
            // 3. RENDERIZADO CONDICIONAL: Muestra un componente u otro.
            <div>
              {showLogin ? (
                <Login onToggleForm={toggleForm} />
              ) : (
                <Registro onToggleForm={toggleForm} />
              )}
            </div>
          )}
        </header>
      </div>
    </ThemeProvider>
  );
}

export default App;