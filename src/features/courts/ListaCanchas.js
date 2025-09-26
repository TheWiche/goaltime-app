import React, { useState, useEffect } from 'react';
import { listenToApprovedCourts } from '../../api/firebaseService';
import { useAuth } from '../../context/AuthContext'; // Importamos el hook para obtener el usuario

// Importamos componentes de MUI y el nuevo Modal
import { Typography, Box, Paper, Button, CircularProgress, Grid } from '@mui/material';
import ReservationModal from './ReservationModal';

function ListaCanchas() {
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. ESTADOS PARA CONTROLAR EL MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(null);
  
  // --- 2. OBTENEMOS EL USUARIO ACTUAL ---
  // Gracias al AuthContext, podemos acceder al usuario desde cualquier componente.
  const currentUser = useAuth();

  useEffect(() => {
    const unsubscribe = listenToApprovedCourts((approvedCourts) => {
      setCanchas(approvedCourts);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- 3. NUEVAS FUNCIONES PARA MANEJAR EL MODAL ---
  const handleOpenModal = (cancha) => {
    setSelectedCourt(cancha); // Guardamos la información de la cancha seleccionada
    setIsModalOpen(true);     // Abrimos el modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);    // Cerramos el modal
    setSelectedCourt(null);   // Limpiamos la cancha seleccionada
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    // Usamos un Fragment (<>) para poder retornar múltiples elementos a la vez
    <>
      <Box sx={{ mt: 2 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Canchas Disponibles
        </Typography>
        {canchas.length > 0 ? (
          <Grid container spacing={3}>
            {canchas.map((cancha) => (
              <Grid item xs={12} sm={6} md={4} key={cancha.id}>
                <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Typography variant="h5" component="h3" sx={{ flexGrow: 1 }}>
                    {cancha.nombre}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ flexGrow: 1, mt: 1 }}>
                    {cancha.direccion}
                  </Typography>
                  {/* --- 4. EL BOTÓN AHORA ABRE EL MODAL --- */}
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2 }} 
                    onClick={() => handleOpenModal(cancha)} // Llama a la nueva función
                  >
                    Ver Disponibilidad
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography>
            No hay canchas aprobadas disponibles en este momento.
          </Typography>
        )}
      </Box>

      {/* --- 5. RENDERIZAMOS EL MODAL --- */}
      {/* El modal solo se renderiza si hemos seleccionado una cancha */}
      {selectedCourt && (
        <ReservationModal 
            open={isModalOpen} 
            onClose={handleCloseModal}
            court={selectedCourt}
            currentUser={currentUser}
        />
      )}
    </>
  );
}

export default ListaCanchas;
