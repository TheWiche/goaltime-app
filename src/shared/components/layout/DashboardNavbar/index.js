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
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              mt: 1.5,
              minWidth: 280,
              borderRadius: "16px",
              bgcolor: "white",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              border: "1px solid rgba(0, 0, 0, 0.05)",
              overflow: "visible",
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 20,
                width: 10,
                height: 10,
                bgcolor: "white",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
                borderTop: "1px solid rgba(0, 0, 0, 0.05)",
                borderLeft: "1px solid rgba(0, 0, 0, 0.05)",
              },
            },
          },
        }}
      >
        {/* Header con info usuario */}
        <div className="px-4 py-3 bg-gradient-to-br from-primary-50 to-white">
          <div className="flex items-center gap-3 mb-3">
            <Avatar
              src={userProfile?.photoURL || ""}
              sx={{
                width: 50,
                height: 50,
                background: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)",
                border: "2px solid white",
                boxShadow: "0 2px 8px rgba(30, 58, 138, 0.15)",
              }}
            >
              {userProfile?.name ? userProfile.name[0].toUpperCase() : "U"}
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-bold font-heading text-primary-900 text-sm truncate">
                {userProfile?.name || "Usuario"}
              </p>
              <p className="text-xs text-primary-600 truncate">{userProfile?.email || ""}</p>
            </div>
          </div>
          {userProfile?.role && (
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white shadow-sm"
              style={{ color: roleConfig.color, border: `1.5px solid ${roleConfig.color}20` }}
            >
              <RoleIcon sx={{ fontSize: 15 }} />
              {roleConfig.label}
            </div>
          )}
        </div>

        <Divider sx={{ borderColor: "rgba(0, 0, 0, 0.06)" }} />

        {/* Opciones */}
        <div className="py-2">
          <MenuItem
            component={Link}
            to="/profile"
            onClick={() => setAccountMenuAnchor(null)}
            sx={{ 
              py: 1.5, 
              px: 3, 
              gap: 2,
              borderRadius: "8px",
              mx: 1,
              "&:hover": {
                bgcolor: "rgba(30, 58, 138, 0.06)",
              },
            }}
          >
            <Person sx={{ color: "#1E3A8A", fontSize: 20 }} />
            <span className="font-medium text-sm text-gray-700">Mi Perfil</span>
          </MenuItem>

          <MenuItem
            onClick={() => {
              setAccountMenuAnchor(null);
              window.dispatchEvent(new CustomEvent("openSettingsModal"));
            }}
            sx={{ 
              py: 1.5, 
              px: 3, 
              gap: 2,
              borderRadius: "8px",
              mx: 1,
              "&:hover": {
                bgcolor: "rgba(30, 58, 138, 0.06)",
              },
            }}
          >
            <Settings sx={{ color: "#1E3A8A", fontSize: 20 }} />
            <span className="font-medium text-sm text-gray-700">Configuración</span>
          </MenuItem>
        </div>

        <Divider sx={{ borderColor: "rgba(0, 0, 0, 0.06)" }} />

        <div className="py-2">
          <MenuItem
            onClick={handleLogout}
            sx={{ 
              py: 1.5, 
              px: 3, 
              gap: 2,
              borderRadius: "8px",
              mx: 1,
              "&:hover": {
                bgcolor: "rgba(220, 38, 38, 0.06)",
              },
            }}
          >
            <Logout sx={{ color: "#dc2626", fontSize: 20 }} />
            <span className="font-medium text-sm text-red-600">Cerrar Sesión</span>
          </MenuItem>
        </div>
      </Menu>

      {/* Menú Notificaciones */}
      <Menu
        anchorEl={notifMenuAnchor}
        open={Boolean(notifMenuAnchor)}
        onClose={() => setNotifMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              mt: 1.5,
              minWidth: 380,
              maxWidth: 420,
              maxHeight: 520,
              borderRadius: "16px",
              bgcolor: "white",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              border: "1px solid rgba(0, 0, 0, 0.05)",
              overflow: "hidden",
            },
          },
        }}
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-primary-50 to-white border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Notifications sx={{ color: "#1E3A8A", fontSize: 22 }} />
            <h3 className="font-bold font-heading text-primary-900 text-base">Notificaciones</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs font-semibold text-primary hover:text-primary-700 transition-colors"
            >
              Marcar todas
            </button>
          )}
        </div>

        {/* Lista */}
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                <Notifications sx={{ fontSize: 32, color: "#94a3b8" }} />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">No hay notificaciones</p>
              <p className="text-xs text-gray-500">Te avisaremos cuando haya algo nuevo</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <MenuItem
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                sx={{
                  py: 2,
                  px: 3,
                  bgcolor: notif.read ? "transparent" : "rgba(30, 58, 138, 0.04)",
                  borderLeft: notif.read ? "3px solid transparent" : "3px solid #1E3A8A",
                  "&:hover": { 
                    bgcolor: notif.read ? "rgba(0, 0, 0, 0.02)" : "rgba(30, 58, 138, 0.08)",
                  },
                  "&:not(:last-child)": {
                    borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
                  },
                }}
              >
                <div className="flex items-start gap-3 w-full">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor:
                        notif.color === "success"
                          ? "#dcfce7"
                          : notif.color === "error"
                          ? "#fee2e2"
                          : "#dbeafe",
                    }}
                  >
                    <Notifications 
                      sx={{ 
                        fontSize: 18, 
                        color: notif.color === "success"
                          ? "#16a34a"
                          : notif.color === "error"
                          ? "#dc2626"
                          : "#3B82F6"
                      }} 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm mb-1 ${
                        notif.read ? "font-medium text-gray-700" : "font-bold text-gray-900"
                      }`}
                    >
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-1">{notif.message}</p>
                    <p className="text-xs text-gray-400">{formatDate(notif.createdAt)}</p>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                  )}
                </div>
              </MenuItem>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <div className="px-4 py-2.5 text-center border-t border-gray-100 bg-gray-50">
            <p className="text-xs font-medium text-gray-500">
              {notifications.length} {notifications.length === 1 ? "notificación" : "notificaciones"}
            </p>
          </div>
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
