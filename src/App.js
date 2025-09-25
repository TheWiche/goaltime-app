// Archivo: src/App.js

import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from './firebase';

// Componentes principales de la aplicación
import Registro from './components/Registro';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { NotificationProvider } from './context/NotificationContext';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  // Nuevo estado para indicar si la app está verificando la sesión
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setCurrentUser({ uid: user.uid, ...userDoc.data() });
        }
      } else {
        setCurrentUser(null);
      }
      // Cuando termina de verificar, quitamos el estado de carga
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const toggleForm = () => {
    setShowLogin(!showLogin);
  };

  // Si aún está cargando, podemos mostrar un mensaje
  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <NotificationProvider>  
        <CssBaseline />
        {currentUser ? (
          // SI HAY SESIÓN: Muestra el Dashboard y le pasa los datos necesarios
          <Dashboard currentUser={currentUser} handleLogout={handleLogout} />
        ) : (
          // SI NO HAY SESIÓN: Muestra el Login o el Registro
          <div className="App-header">
            {showLogin ? (
              <Login onToggleForm={toggleForm} />
            ) : (
              <Registro onToggleForm={toggleForm} />
            )}
          </div>
        )}
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;