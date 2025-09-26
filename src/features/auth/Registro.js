import React, { useState } from 'react';
import { registerUser } from '../../api/firebaseService'; 
import { useNotification } from '../../context/NotificationContext';

// Importaciones de MUI
import { Button, TextField, Link, Box, Typography, Container } from '@mui/material';

function Registro({ onToggleForm }) {
  const { showNotification } = useNotification();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegistro = async (e) => {
    e.preventDefault();
    if (!email || !password || !nombre) {
      showNotification("Por favor, completa todos los campos.", "warning");
      return;
    }
    setLoading(true);
    try {
      // 2. Usamos la función del servicio, que hace todo el trabajo pesado
      await registerUser(nombre, email, password);
      // Firebase inicia sesión automáticamente después del registro,
      // así que el listener en App.js mostrará el Dashboard.
      showNotification('¡Cuenta creada con éxito! Bienvenido.', 'success');
    } catch (error) {
      console.error("Error al registrar: ", error);
      showNotification("Error al registrar. El correo puede que ya esté en uso.", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Crear una Cuenta
        </Typography>
        <Box component="form" onSubmit={handleRegistro} sx={{ mt: 1 }}>
          <TextField
            margin="normal" required fullWidth
            id="nombre" label="Nombre Completo" name="nombre"
            autoComplete="name" autoFocus
            value={nombre} onChange={(e) => setNombre(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal" required fullWidth
            id="email" label="Correo Electrónico" name="email"
            autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal" required fullWidth
            name="password" label="Contraseña (mín. 6 caracteres)" type="password"
            id="password" autoComplete="new-password"
            value={password} onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit" fullWidth variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
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