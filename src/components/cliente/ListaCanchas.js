// Archivo: src/components/cliente/ListaCanchas.js

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from '../../firebase';

// Importamos componentes de MUI para que se vea bien
import { Typography, Box, Paper, Button, CircularProgress, Grid } from '@mui/material';

function ListaCanchas() {
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Creamos la consulta para traer solo las canchas con estado 'aprobado'
    const q = query(collection(db, "canchas"), where("estado", "==", "aprobado"));

    // onSnapshot es el listener en tiempo real
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const canchasAprobadas = [];
      querySnapshot.forEach((doc) => {
        canchasAprobadas.push({ id: doc.id, ...doc.data() });
      });
      setCanchas(canchasAprobadas);
      setLoading(false); // Dejamos de cargar cuando tenemos los datos
    });

    return () => unsubscribe(); // Limpiamos el listener al desmontar
  }, []);

  const handleReservar = (canchaId) => {
    alert(`Próximamente: Vista de calendario para reservar la cancha ${canchaId}`);
  };

  // Si aún está cargando, mostramos un indicador
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
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
                <Button 
                  variant="contained" 
                  sx={{ mt: 2 }} 
                  onClick={() => handleReservar(cancha.id)}
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
  );
}

export default ListaCanchas;