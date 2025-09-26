import React from 'react';
import { Box, Typography, Link, Container } from '@mui/material';

// El Footer recibe una función para ejecutar al hacer clic en el enlace
function Footer({ onBecomePartnerClick }) {
  return (
    <Box
      component="footer"
      sx={{
        py: 3, // padding vertical
        px: 2, // padding horizontal
        mt: 'auto', // Esto empuja el footer al final de la página
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body1" align="center">
          GoalTime &copy; {new Date().getFullYear()}
        </Typography>
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