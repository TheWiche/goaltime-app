import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Badge from "@mui/material/Badge";
import Avatar from "@mui/material/Avatar";
import { 
  Notifications, 
  Person, 
  Settings, 
  Logout, 
  Menu as MenuIcon,
  MenuOpen,
  AdminPanelSettings,
  BusinessCenter
} from "@mui/icons-material";
import { useAuth } from "shared/context/AuthContext";
import { useMaterialUIController, setTransparentNavbar, setMiniSidenav } from "shared/context";
import { logoutUser, subscribeToNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "shared/services/firebaseService";
import { navbar, navbarContainer } from "./styles/index";

function DashboardNavbar({ absolute, light, isMini }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, darkMode } = controller;
  
  // Estados menú avatar
  const [accountMenuAnchor, setAccountMenuAnchor] = useState(null);
  
  // Estados notificaciones
  const [notifMenuAnchor, setNotifMenuAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const navigate = useNavigate();
  const { userProfile, currentUser } = useAuth();

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

  // Suscribirse a notificaciones
  useEffect(() => {
    if (!currentUser?.uid) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const unsubscribe = subscribeToNotifications(currentUser.uid, (notifs) => {
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.read).length);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);

  const handleLogout = async () => {
    setAccountMenuAnchor(null);
    try {
      await logoutUser();
      navigate("/authentication/sign-in");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id);
      } catch (error) {
        console.error("Error:", error);
      }
    }
    setNotifMenuAnchor(null);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser?.uid || unreadCount === 0) return;
    try {
      await markAllNotificationsAsRead(currentUser.uid);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Ahora";
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Ahora";
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    if (days < 7) return `Hace ${days} d`;
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  const getRoleConfig = (role) => {
    const configs = {
      admin: { icon: AdminPanelSettings, label: "Administrador", color: "#1E3A8A" },
      asociado: { icon: BusinessCenter, label: "Asociado", color: "#3B82F6" },
      cliente: { icon: Person, label: "Cliente", color: "#14b85f" },
    };
    return configs[role] || configs.cliente;
  };

  const roleConfig = getRoleConfig(userProfile?.role);
  const RoleIcon = roleConfig.icon;

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light, darkMode })}
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        <div className="flex items-center justify-between w-full gap-4">
          <div className="flex-1" />
          
          <div className="flex items-center gap-2">
            {/* Menu toggle */}
            <IconButton
              size="medium"
              onClick={handleMiniSidenav}
              className="lg:hidden"
              sx={{ color: "inherit" }}
            >
              {miniSidenav ? <MenuOpen /> : <MenuIcon />}
            </IconButton>

            {/* Notificaciones */}
            <IconButton
              size="medium"
              onClick={(e) => setNotifMenuAnchor(e.currentTarget)}
              sx={{ 
                color: "inherit",
                transition: "all 200ms",
                "&:hover": { 
                  transform: "scale(1.1)",
                  bgcolor: "rgba(30, 58, 138, 0.08)",
                },
              }}
            >
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <Notifications />
              </Badge>
            </IconButton>

            {/* Avatar */}
            <IconButton
              onClick={(e) => setAccountMenuAnchor(e.currentTarget)}
              sx={{ 
                p: 0.5,
                transition: "all 200ms",
                "&:hover": { 
                  transform: "scale(1.05)",
                },
              }}
            >
              <Avatar
                src={userProfile?.photoURL || ""}
                alt={userProfile?.name || "Usuario"}
                sx={{
                  width: 40,
                  height: 40,
                  background: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)",
                  fontWeight: "bold",
                  fontSize: "1rem",
                }}
              >
                {userProfile?.name ? userProfile.name[0].toUpperCase() : "U"}
              </Avatar>
            </IconButton>
          </div>
        </div>
      </Toolbar>

      {/* Menú Avatar */}
      <Menu
        anchorEl={accountMenuAnchor}
        open={Boolean(accountMenuAnchor)}
        onClose={() => setAccountMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 280,
            borderRadius: "12px",
            backdropFilter: "blur(12px)",
            bgcolor: "rgba(255, 255, 255, 0.95)",
            boxShadow: "0 8px 32px rgba(31, 38, 135, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          },
        }}
      >
        {/* Header con info usuario */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-2">
            <Avatar
              src={userProfile?.photoURL || ""}
              sx={{
                width: 48,
                height: 48,
                background: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)",
              }}
            >
              {userProfile?.name ? userProfile.name[0].toUpperCase() : "U"}
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-bold font-heading text-primary-900 truncate">
                {userProfile?.name || "Usuario"}
              </p>
              <p className="text-xs text-surface-500 truncate">{userProfile?.email || ""}</p>
            </div>
          </div>
          {userProfile?.role && (
            <div
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold"
              style={{ backgroundColor: `${roleConfig.color}15`, color: roleConfig.color }}
            >
              <RoleIcon sx={{ fontSize: 14 }} />
              {roleConfig.label}
            </div>
          )}
        </div>

        <Divider />

        {/* Opciones */}
        <MenuItem
          component={Link}
          to="/profile"
          onClick={() => setAccountMenuAnchor(null)}
          sx={{ py: 1.5, px: 2, gap: 1.5 }}
        >
          <Person sx={{ color: "primary.main" }} />
          <span className="font-medium">Mi Perfil</span>
        </MenuItem>

        <MenuItem
          onClick={() => {
            setAccountMenuAnchor(null);
            window.dispatchEvent(new CustomEvent("openSettingsModal"));
          }}
          sx={{ py: 1.5, px: 2, gap: 1.5 }}
        >
          <Settings sx={{ color: "primary.main" }} />
          <span className="font-medium">Configuración</span>
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={handleLogout}
          sx={{ py: 1.5, px: 2, gap: 1.5, color: "error.main" }}
        >
          <Logout />
          <span className="font-medium">Cerrar Sesión</span>
        </MenuItem>
      </Menu>

      {/* Menú Notificaciones */}
      <Menu
        anchorEl={notifMenuAnchor}
        open={Boolean(notifMenuAnchor)}
        onClose={() => setNotifMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 380,
            maxWidth: 420,
            maxHeight: 520,
            borderRadius: "12px",
            backdropFilter: "blur(12px)",
            bgcolor: "rgba(255, 255, 255, 0.95)",
            boxShadow: "0 8px 32px rgba(31, 38, 135, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          },
        }}
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between">
          <h3 className="font-bold font-heading text-primary-900 text-lg">Notificaciones</h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs font-medium text-primary hover:underline"
            >
              Marcar todas
            </button>
          )}
        </div>

        <Divider />

        {/* Lista */}
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <Notifications sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
              <p className="text-sm text-surface-500">No tienes notificaciones</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <MenuItem
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                sx={{
                  py: 2,
                  px: 3,
                  bgcolor: notif.read ? "transparent" : "rgba(30, 58, 138, 0.05)",
                  borderLeft: notif.read ? "none" : "3px solid #1E3A8A",
                  "&:hover": { bgcolor: "rgba(30, 58, 138, 0.08)" },
                }}
              >
                <div className="flex items-start gap-3 w-full">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor:
                        notif.color === "success"
                          ? "#14b85f"
                          : notif.color === "error"
                          ? "#dc2626"
                          : "#3B82F6",
                    }}
                  >
                    <Notifications sx={{ fontSize: 20, color: "white" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${
                        notif.read ? "font-medium" : "font-bold"
                      } text-primary-900 truncate`}
                    >
                      {notif.title}
                    </p>
                    <p className="text-xs text-surface-500 line-clamp-2 mt-0.5">{notif.message}</p>
                    <p className="text-xs text-surface-400 mt-1">{formatDate(notif.createdAt)}</p>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                  )}
                </div>
              </MenuItem>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <>
            <Divider />
            <div className="px-4 py-2 text-center">
              <p className="text-xs text-surface-400">
                {notifications.length} {notifications.length === 1 ? "notificación" : "notificaciones"}
              </p>
            </div>
          </>
        )}
      </Menu>
    </AppBar>
  );
}

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
