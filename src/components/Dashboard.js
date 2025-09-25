// Archivo: src/components/Dashboard.js

import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box, Drawer, Divider, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import logo from '../logo.png';

// Importamos los paneles y listas
import ListaCanchas from './cliente/ListaCanchas';
import PanelAdmin from './admin/PanelAdmin';
import PanelAsociado from './asociado/PanelAsociado';
import SolicitudSocio from './asociado/SolicitudSocio';

// Iconos para el menú del admin
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';

const drawerWidth = 240;

function Dashboard({ currentUser, handleLogout }) {
  const [vistaCliente, setVistaCliente] = useState('lista');
  const [adminView, setAdminView] = useState('dashboard'); // Estado para la vista del admin

  // --- COMPONENTE DEL MENÚ DEL ADMIN ---
  const adminMenu = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        <ListItemButton selected={adminView === 'dashboard'} onClick={() => setAdminView('dashboard')}>
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
        <ListItemButton selected={adminView === 'usuarios'} onClick={() => setAdminView('usuarios')}>
          <ListItemIcon><PeopleIcon /></ListItemIcon>
          <ListItemText primary="Gestión de Usuarios" />
        </ListItemButton>
        <ListItemButton selected={adminView === 'solicitudes'} onClick={() => setAdminView('solicitudes')}>
          <ListItemIcon><HowToRegIcon /></ListItemIcon>
          <ListItemText primary="Aprobar Asociados" />
        </ListItemButton>
        <ListItemButton selected={adminView === 'canchas'} onClick={() => setAdminView('canchas')}>
          <ListItemIcon><SportsSoccerIcon /></ListItemIcon>
          <ListItemText primary="Aprobar Canchas" />
        </ListItemButton>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* BARRA DE NAVEGACIÓN SUPERIOR (AppBar) */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Box component="img" sx={{ height: 40, mr: 1.5 }} alt="GoalTime Logo" src={logo} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            GoalTime
          </Typography>
          <Typography sx={{ mr: 2 }}>
            Hola, {currentUser.nombre}
            {(currentUser.rol === 'asociado' || currentUser.rol === 'admin') && ` (${currentUser.rol})`}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>Cerrar Sesión</Button>
        </Toolbar>
      </AppBar>

      {/* MENÚ LATERAL (solo para el admin) */}
      {currentUser.rol === 'admin' && (
        <Drawer variant="permanent" sx={{ width: drawerWidth, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' } }}>
          {adminMenu}
        </Drawer>
      )}

      {/* CONTENIDO PRINCIPAL DE LA PÁGINA */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar /> {/* ESTA LÍNEA ES CLAVE: Crea un espacio para que el contenido no quede debajo de la AppBar */}
        
        {/* Lógica para mostrar el contenido correcto */}
        {currentUser.rol === 'admin' && <PanelAdmin activeView={adminView} />}
        
        {currentUser.rol === 'asociado' && (
          <>
            <ListaCanchas />
            <PanelAsociado currentUser={currentUser} />
          </>
        )}
        
        {currentUser.rol === 'cliente' && (
          <>
            {vistaCliente === 'lista' ? (
              <>
                <ListaCanchas />
                <Box sx={{ mt: 4, p: 2, border: '1px dashed grey', textAlign: 'center' }}>
                  <Typography variant="h6">¿Quieres registrar tus canchas?</Typography>
                  <Button variant="contained" sx={{ mt: 2 }} onClick={() => setVistaCliente('solicitud')}>
                    Conviértete en Asociado
                  </Button>
                </Box>
              </>
            ) : (
              <SolicitudSocio currentUser={currentUser} onSolicitudEnviada={() => setVistaCliente('lista')} />
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

export default Dashboard;