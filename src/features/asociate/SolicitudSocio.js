import React, { useState } from 'react';
import { hasPendingPartnerRequest, createPartnerRequest } from '../../api/firebaseService';
import { useNotification } from '../../context/NotificationContext';
import { Box, Typography, TextField, Button, Paper, CircularProgress, Grid, InputAdornment } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';

function SolicitudSocio({ currentUser, onSolicitudEnviada }) {
  const { showNotification } = useNotification();
  const [telefono, setTelefono] = useState('');
  const [nombreNegocio, setNombreNegocio] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // --- FUNCIÓN MOVIDA AQUÍ ADENTRO ---
  // Ahora tiene acceso a nombreNegocio, telefono y setFormErrors.
  const validateForm = () => {
    const errors = {};
    const phoneRegex = /^3\d{9}$/;
    if (!nombreNegocio.trim()) { errors.nombreNegocio = "El nombre del negocio es obligatorio."; }
    if (!telefono.trim()) { errors.telefono = "El teléfono es obligatorio."; }
    else if (!phoneRegex.test(telefono)) { errors.telefono = "Debe ser un número de 10 dígitos comenzando con 3."; }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const hasPendingRequest = await hasPendingPartnerRequest(currentUser.uid);
      if (hasPendingRequest) {
        showNotification("Ya tienes una solicitud pendiente de revisión.", 'warning');
        return;
      }
      const formData = { telefono, nombreNegocio, mensaje };
      await createPartnerRequest({ currentUser, formData });
      showNotification('¡Solicitud enviada con éxito!', 'success');
      setTimeout(() => { onSolicitudEnviada(); }, 2000);
    } catch (err) {
      console.error("Error al enviar la solicitud: ", err);
      showNotification('Hubo un error al enviar la solicitud.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={6} sx={{ mt: 4, p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
      <Typography variant="h4" component="h2" gutterBottom align="center" fontWeight="bold">
        Postúlate para ser Socio
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }} align="center">
        Únete a nuestra red de canchas. Completa el formulario y nos pondremos en contacto contigo.
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="Nombre de tu Negocio" fullWidth required
                value={nombreNegocio}
                onChange={(e) => setNombreNegocio(e.target.value)}
                error={!!formErrors.nombreNegocio}
                helperText={formErrors.nombreNegocio}
                InputProps={{
                  startAdornment: (<InputAdornment position="start"><BusinessIcon /></InputAdornment>),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Teléfono de Contacto" fullWidth required
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                error={!!formErrors.telefono}
                helperText={formErrors.telefono}
                InputProps={{
                  startAdornment: (<InputAdornment position="start"><PhoneIcon /></InputAdornment>),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Mensaje Adicional (Opcional)" fullWidth multiline rows={4}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ minWidth: 200 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : "Enviar Solicitud"}
            </Button>
          </Box>
      </Box>
    </Paper>
  );
}

export default SolicitudSocio;