// Archivo: src/context/NotificationContext.js

import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

// 1. Creamos el Contexto
const NotificationContext = createContext();

// 2. Creamos el Proveedor del Contexto
// Este componente envolverá nuestra aplicación y le dará acceso al sistema de notificaciones.
export function NotificationProvider({ children }) {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success', 'error', 'warning', 'info'
  });

  const showNotification = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

// 3. Creamos un "Hook" personalizado para usar el contexto fácilmente
// En lugar de importar 'useContext' y 'NotificationContext' en cada archivo,
// solo importaremos y usaremos 'useNotification'. ¡Mucho más limpio!
export const useNotification = () => {
  return useContext(NotificationContext);
};