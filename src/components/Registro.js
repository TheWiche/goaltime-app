// Archivo: src/components/Registro.js

import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNotification } from '../context/NotificationContext';

// Importaciones de MUI
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

// Recibiremos una nueva 'prop' llamada onToggleForm para cambiar de vista
function Registro({ onToggleForm }) {
  const { showNotification } = useNotification();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // La lógica de Firebase sigue siendo la misma
  const handleRegistro = async (e) => {
    e.preventDefault();
    if (!email || !password || !nombre) {
      alert("Por favor, completa todos los campos.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        nombre: nombre,
        rol: 'cliente' // Todos se registran como clientes
      });
      // El listener en App.js se encargará de loguear al usuario automáticamente
    } catch (error) {
      console.error("Error al registrar: ", error);
      showNotification("Error al registrar. El correo puede que ya esté en uso.", 'error'); //
    }
  };

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
          Crear una Cuenta
        </Typography>
        <Box component="form" onSubmit={handleRegistro} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="nombre"
            label="Nombre Completo"
            name="nombre"
            autoComplete="name"
            autoFocus
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Correo Electrónico"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña (mín. 6 caracteres)"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Registrarse
          </Button>
          <Link href="#" variant="body2" onClick={onToggleForm} sx={{cursor: 'pointer'}}>
            {"¿Ya tienes una cuenta? Inicia Sesión"}
          </Link>
        </Box>
      </Box>
    </Container>
  );
}

export default Registro;