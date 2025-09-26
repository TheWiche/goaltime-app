import React, { useState, useEffect } from 'react';

import { onAuthAndProfileStateChange, logoutUser } from './api/firebaseService';

// Importaciones de Contexto y UI
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';

import Dashboard from './pages/Dashboard';
import Login from './features/auth/Login';
import Registro from './features/auth/Registro';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthAndProfileStateChange((userProfile) => {
      setCurrentUser(userProfile);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const toggleForm = () => {
    setShowLogin(!showLogin);
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <NotificationProvider>
        <AuthProvider value={currentUser}>
          <CssBaseline />
          {currentUser ? (
            <Dashboard currentUser={currentUser} handleLogout={handleLogout} />
          ) : (
            <div className="App-header">
              {showLogin ? (
                <Login onToggleForm={toggleForm} />
              ) : (
                <Registro onToggleForm={toggleForm} />
              )}
            </div>
          )}
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
