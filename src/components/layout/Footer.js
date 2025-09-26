import React from 'react';
import { Box, Typography, Link, Container } from '@mui/material';
import logo from '../../logo.png'; // Importamos el logo

function Footer({ onBecomePartnerClick }) {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200],
      }}
    >
      <Container maxWidth="lg">
        {/* --- 1. NUEVA LÍNEA DE COPYRIGHT CON FLEXBOX --- */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            mb: 1 // Margen inferior para separarlo del enlace de abajo
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="GoalTime Logo"
            sx={{ height: 24, mr: 0.2 }} // Logo pequeño con margen derecho
          />
          <Typography variant="body1" align="center">
            GoalTime Copyright &copy; {new Date().getFullYear()}. Todos los derechos reservados
          </Typography>
        </Box>
        
        {/* --- 2. ENLACE PARA ASOCIADOS (SIN CAMBIOS) --- */}
        <Typography variant="body2" color="text.secondary" align="center">
          {'¿Eres dueño de una cancha? '}
          <Link color="inherit" onClick={onBecomePartnerClick} sx={{ cursor: 'pointer', textDecoration: 'underline' }}>
            Asóciate con nosotros
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;