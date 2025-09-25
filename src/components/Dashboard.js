// src/components/Dashboard.js

import React, { useState } from 'react'; 
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import logo from '../logo.png';

// Importamos los paneles y listas que mostraremos aquí
import ListaCanchas from './cliente/ListaCanchas';
import PanelAdmin from './admin/PanelAdmin';
import PanelAsociado from './asociado/PanelAsociado';
import SolicitudSocio from './asociado/SolicitudSocio'; 

// El Dashboard recibe los datos del usuario y la función para cerrar sesión
function Dashboard({ currentUser, handleLogout }) {
  const [vistaCliente, setVistaCliente] = useState('lista'); 
    return (
    <Box sx={{ flexGrow: 1 }}>
      {/* BARRA DE NAVEGACIÓN SUPERIOR */}
      <AppBar position="static">
        <Toolbar>
          <Box
            component="img"
            sx={{
                height: 40, // Ajusta la altura de tu logo
                mr: 1.5,     // mr es 'margin-right', para darle espacio antes del texto
            }}
            alt="GoalTime Logo"
            src={logo}   // Usamos la variable 'logo' que importamos
            />  
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            GoalTime
          </Typography>
          <Typography sx={{ marginRight: 2 }}>
            Hola, {currentUser.nombre}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>Cerrar Sesión</Button>
        </Toolbar>
      </AppBar>

      {/* CONTENIDO PRINCIPAL DE LA PÁGINA */}
      <Container sx={{ mt: 4 }}>
        {/* Paneles específicos para admin y asociado */}
        {currentUser.rol === 'asociado' && <PanelAsociado currentUser={currentUser} />}
        {currentUser.rol === 'admin' && <PanelAdmin />}

        {/* --- LÓGICA MODIFICADA PARA EL CLIENTE --- */}
        {currentUser.rol === 'cliente' && (
          <>
            {vistaCliente === 'lista' ? (
              // Si la vista es 'lista', mostramos las canchas y el botón para postularse
              <>
                <ListaCanchas />
                <Box sx={{ mt: 4, p: 2, border: '1px dashed grey', textAlign: 'center' }}>
                  <Typography variant="h6">¿Quieres registrar tus canchas en nuestra plataforma?</Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2 }}
                    onClick={() => setVistaCliente('solicitud')} // <-- 3. Cambia la vista al hacer clic
                  >
                    Conviértete en Asociado
                  </Button>
                </Box>
              </>
            ) : (
              // Si la vista es 'solicitud', mostramos el formulario
              <SolicitudSocio 
              currentUser={currentUser} 
              onSolicitudEnviada={() => setVistaCliente('lista')}
              />
            )}
          </>
        )}

        {/* Si el usuario es asociado o admin, siempre ve la lista de canchas */}
        {(currentUser.rol === 'asociado' || currentUser.rol === 'admin') && <ListaCanchas />}

      </Container>
    </Box>
  );
}

export default Dashboard;