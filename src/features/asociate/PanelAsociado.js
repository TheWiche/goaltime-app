import React, { useState } from 'react';
import { registerCourt } from '../../api/firebaseService';
import { useNotification } from '../../context/NotificationContext'; 

// Importaciones de MUI para la nueva interfaz
import { Paper, Box, Typography, TextField, Button, CircularProgress, Grid } from '@mui/material';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';

function PanelAsociado({ currentUser }) {
  const { showNotification } = useNotification();
  const [nombreCancha, setNombreCancha] = useState('');
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegistroCancha = async (e) => {
    e.preventDefault();
    if (!nombreCancha || !direccion) {
      showNotification("Por favor, completa todos los campos.", "warning");
      return;
    }

    setLoading(true);
    try {
      const courtData = {
        ownerId: currentUser.uid,
        nombre: nombreCancha,
        direccion: direccion,
      };
      // 2. Usamos la función del servicio, mucho más limpia
      await registerCourt(courtData);
      
      showNotification('¡Cancha enviada para aprobación!', 'success'); 
      setNombreCancha('');
      setDireccion('');

    } catch (error) {
      console.error("Error al registrar la cancha: ", error);
      showNotification("Hubo un error al registrar tu cancha.", 'error'); 
    } finally {
      setLoading(false);
    }
  };

  // --- 3. NUEVA APARIENCIA PROFESIONAL CON MUI ---
  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AddBusinessIcon sx={{ mr: 1, fontSize: '2rem' }} />
            <Typography variant="h5">Panel de Asociado</Typography>
        </Box>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
            Desde aquí puedes registrar tus canchas para que sean revisadas y aprobadas por un administrador.
        </Typography>
        
        <Box component="form" onSubmit={handleRegistroCancha}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Nombre de la Cancha"
                        fullWidth
                        required
                        value={nombreCancha}
                        onChange={(e) => setNombreCancha(e.target.value)}
                        disabled={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Dirección de la Cancha"
                        fullWidth
                        required
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                        disabled={loading}
                    />
                </Grid>
            </Grid>
            <Box sx={{ mt: 3 }}>
                <Button 
                    type="submit" 
                    variant="contained" 
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit"/> : null}
                >
                    {loading ? 'Enviando...' : 'Enviar para Aprobación'}
                </Button>
            </Box>
        </Box>
    </Paper>
  );
}

export default PanelAsociado;
