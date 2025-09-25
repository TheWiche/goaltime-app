// Archivo: src/components/Login.js

import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNotification } from '../context/NotificationContext'; 

// Importaciones de componentes de MUI
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';

function Login({ onToggleForm }) {
  const { showNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // La lógica de Firebase no cambia en absoluto
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Por favor, ingresa tu correo y contraseña.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // La alerta de éxito la manejaremos de otra forma más adelante
    } catch (error) {
      console.error("Error al iniciar sesión: ", error);
      showNotification("Credenciales incorrectas. Verifica tus datos.", 'error'); 
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
          />
          <Button
            type="submit"
            fullWidth
            variant="contained" // Este es el estilo del botón principal
            sx={{ mt: 3, mb: 2 }}
          >
            Iniciar Sesión
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