import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Drawer, Divider, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import logo from '../logo.png';

// Importa el nuevo componente Footer
import Footer from '../components/layout/Footer';
import ListaCanchas from '../features/courts/ListaCanchas';
import PanelAdmin from '../features/admin/PanelAdmin';
import PanelAsociado from '../features/asociate/PanelAsociado';
import SolicitudSocio from '../features/asociate/SolicitudSocio';

// Iconos para el menú del admin
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';

const drawerWidth = 240;

function Dashboard({ currentUser, handleLogout }) {
  const [vistaCliente, setVistaCliente] = useState('lista');
  const [adminView, setAdminView] = useState('dashboard');
  
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
    // Cambiamos la estructura para que el layout ocupe toda la altura
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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

      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {currentUser.rol === 'admin' && (
          <Drawer variant="permanent" sx={{ width: drawerWidth, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' } }}>
            {adminMenu}
          </Drawer>
        )}

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar /> {/* Espaciador para la AppBar */}
          
          {/* Lógica de renderizado (con la caja obstructiva eliminada) */}
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
                // La caja punteada ha sido eliminada de aquí
                <ListaCanchas />
              ) : (
                <SolicitudSocio currentUser={currentUser} onSolicitudEnviada={() => setVistaCliente('lista')} />
              )}
            </>
          )}
        </Box>
      </Box>

      {/* AÑADIMOS EL FOOTER AL FINAL (solo para clientes en la vista de lista) */}
      {currentUser.rol === 'cliente' && vistaCliente === 'lista' && (
        <Footer onBecomePartnerClick={() => setVistaCliente('solicitud')} />
      )}
    </Box>
  );
}

export default Dashboard;