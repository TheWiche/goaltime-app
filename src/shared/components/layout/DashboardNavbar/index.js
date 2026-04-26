import { MDBox, MDInput, MDBadge, MDTypography } from "shared/components/md-shims";
/**
=========================================================
* GoalTime App - v2.2.0
=========================================================
*/

import { useState, useEffect } from "react";

// react-router components
import { useLocation, Link, useNavigate } from "react-router-dom"; // 👈 1. Se importa useNavigate

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem"; // 👈 2. Se importa MenuItem
import Icon from "@mui/material/Icon";
import Avatar from "@mui/material/Avatar";
import { Divider } from "@mui/material"; // Para el separador

// GoalTime App components
 // 👈 3. Se importa MDTypography
import { useAuth } from "shared/context/AuthContext"; // Para obtener los datos del usuario

// GoalTime App example components
import NotificationsMenu from "shared/components/notifications/NotificationsMenu";

// Custom styles for DashboardNavbar
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarMobileMenu,
} from "./styles/index";

// GoalTime App context
import { useMaterialUIController, setTransparentNavbar, setMiniSidenav } from "shared/context";

// 👈 4. Se importa la función de logout
import { logoutUser } from "shared/services/firebaseService";

function DashboardNavbar({ absolute, light, isMini }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, darkMode } = controller;

  // 👈 5. Se añaden estados y manejadores para el NUEVO menú de cuenta
  const [openAccountMenu, setOpenAccountMenu] = useState(false);
  const handleOpenAccountMenu = (event) => setOpenAccountMenu(event.currentTarget);
  const handleCloseAccountMenu = () => setOpenAccountMenu(false);

  const route = useLocation().pathname.split("/").slice(1);
  const navigate = useNavigate(); // 👈 6. Se inicializa el hook de navegación

  // 👈 7. Se crea la función para manejar el logout
  const handleLogout = async () => {
    handleCloseAccountMenu(); // Cierra el menú primero
    try {
      await logoutUser();
      navigate("/authentication/sign-in");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  useEffect(() => {
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    window.addEventListener("scroll", handleTransparentNavbar);
    handleTransparentNavbar();
    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);

  // 👈 8. Obtenemos el perfil del usuario desde el contexto
  const { userProfile } = useAuth();

  // 👈 9. Se crea la función para renderizar el NUEVO menú de cuenta
  const renderAccountMenu = () => {
    return (
      <Menu
        anchorEl={openAccountMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        open={Boolean(openAccountMenu)}
        onClose={handleCloseAccountMenu}
        sx={{ mt: 2 }}
      >
        {/* Sección de Información del Usuario */}
        <MDBox px={2} py={1}>
          <MDTypography variant="h6">{userProfile ? userProfile.name : "Usuario"}</MDTypography>
          <MDTypography variant="button" color="text">
            {userProfile ? userProfile.email : ""}
          </MDTypography>

          {/* 👇 1. Se añade la lógica condicional para mostrar el rol */}
          {userProfile && (userProfile.role === "admin" || userProfile.role === "asociado") && (
            <MDBox mt={1}>
              <MDBadge
                badgeContent={userProfile.role}
                color={userProfile.role === "admin" ? "info" : "dark"}
                variant="gradient"
                size="sm"
              />
            </MDBox>
          )}
        </MDBox>

        <Divider sx={{ my: 1 }} />

        {/* Sección de Acciones */}
        <MenuItem component={Link} to="/profile" onClick={handleCloseAccountMenu}>
          <Icon>person</Icon>
          <MDTypography variant="button" sx={{ ml: 1 }}>
            Mi Perfil
          </MDTypography>
        </MenuItem>

        <MenuItem
          onClick={(e) => {
            handleCloseAccountMenu();
            // Disparar evento para abrir modal de configuración
            window.dispatchEvent(new CustomEvent("openSettingsModal"));
          }}
        >
          <Icon>settings</Icon>
          <MDTypography variant="button" sx={{ ml: 1 }}>
            Configuración
          </MDTypography>
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <MenuItem onClick={handleLogout}>
          <Icon>logout</Icon>
          <MDTypography variant="button" color="error" sx={{ ml: 1 }}>
            Cerrar Sesión
          </MDTypography>
        </MenuItem>
      </Menu>
    );
  };

  // Styles for the navbar icons - simplificado sin dependencias del theme
  const iconsStyle = () => ({
    color: () => {
      let colorValue = light || darkMode ? "#ffffff" : "#1a2035";
      if (transparentNavbar && !light) {
        colorValue = darkMode ? "rgba(52, 71, 103, 0.6)" : "#344767";
      }
      return colorValue;
    },
  });

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light, darkMode })}
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        <MDBox color="inherit" sx={(theme) => navbarRow(theme, { isMini })} py={{ xs: 1.5, md: 2 }}>
          {/* Breadcrumbs removido - cada página tiene su propio título */}
        </MDBox>
        {isMini ? null : (
          <MDBox
            sx={(theme) => navbarRow(theme, { isMini })}
            display="flex"
            justifyContent="flex-end"
            flex={1}
          >
            <MDBox
              color={light ? "white" : "inherit"}
              display="flex"
              alignItems="center"
              gap={1}
              sx={{
                ml: "auto",
                flexShrink: 0,
              }}
            >
              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarMobileMenu}
                onClick={handleMiniSidenav}
              >
                <Icon sx={iconsStyle} fontSize="medium">
                  {miniSidenav ? "menu_open" : "menu"}
                </Icon>
              </IconButton>
              {/* Componente de Notificaciones */}
              <NotificationsMenu />
              {/* 👇 Avatar del usuario como en la página de inicio */}
              <IconButton onClick={handleOpenAccountMenu} sx={{ p: 0 }}>
                <Avatar
                  src={userProfile?.photoURL || ""}
                  alt={userProfile?.name || "Usuario"}
                  sx={{ width: 48, height: 48 }}
                >
                  {userProfile?.name ? userProfile.name[0].toUpperCase() : "U"}
                </Avatar>
              </IconButton>
              {renderAccountMenu()} {/* 👈 10. Se renderiza el nuevo menú */}
            </MDBox>
          </MDBox>
        )}
      </Toolbar>
    </AppBar>
  );
}

// ... (defaultProps y propTypes sin cambios)
DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;
