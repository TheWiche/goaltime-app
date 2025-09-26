// Archivo: src/components/Login.js

import React, { useState } from 'react';
import { useNotification } from '../../context/NotificationContext'; 
import { loginUser } from '../../api/firebaseService';

// Importaciones de componentes de MUI
import { Button, TextField, Box, Typography, Container, Link } from '@mui/material';

function Login({ onToggleForm }) {
  const { showNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showNotification("Por favor, ingresa tu correo y contraseña.", "warning");
      return;
    }
    setLoading(true);
    try {
      await loginUser(email, password);
    } catch (error) {
      console.error("Error al iniciar sesión: ", error);
      showNotification("Credenciales incorrectas. Verifica tus datos.", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Esta es la nueva estructura visual con MUI
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Iniciar Sesión
        </Typography>
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Correo Electrónico"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained" // Este es el estilo del botón principal
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </Button>
          <Link href="#" variant="body2" onClick={onToggleForm} sx={{cursor: 'pointer'}}>
            {"¿No tienes una cuenta? Regístrate"}
          </Link>
        </Box>
      </Box>
    </Container>
  );
}

export default Login;