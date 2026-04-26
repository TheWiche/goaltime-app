import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { DashboardLayout, DashboardNavbar, Footer } from "shared/components/layout";
import { GlassCard, Button, Badge } from "shared/components/ui";
import { useAuth } from "shared/context/AuthContext";
import { db } from "shared/services/firebaseService";
import SettingsModal from "./components/SettingsModal";
import {
  Person,
  Email,
  Phone,
  CalendarToday,
  Settings,
  CheckCircle,
  HourglassEmpty,
  Cancel,
  AccountCircle,
} from "@mui/icons-material";
import backgroundImage from "assets/images/bg-profile.jpeg";

function Profile() {
  const { userProfile, currentUser } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const getRoleText = (role) => {
    const roleMap = {
      admin: "Administrador",
      asociado: "Asociado",
      cliente: "Cliente",
    };
    return roleMap[role] || role;
  };

  const getRoleBadgeColor = (role) => {
    const colorMap = {
      admin: "primary",
      asociado: "secondary",
      cliente: "success",
    };
    return colorMap[role] || "gray";
  };

  useEffect(() => {
    if (!currentUser || userProfile?.role !== "cliente") {
      setLoadingReservations(false);
      return;
    }

    setLoadingReservations(true);
    const reservationsQuery = query(
      collection(db, "reservations"),
      where("clientId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      reservationsQuery,
      (snapshot) => {
        const reservationsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReservations(reservationsData);
        setLoadingReservations(false);
      },
      (error) => {
        console.error("Error al obtener reservaciones:", error);
        setLoadingReservations(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, userProfile]);

  const getStatusConfig = (status) => {
    const configs = {
      pending: { label: "Pendiente", variant: "warning", icon: HourglassEmpty, color: "text-yellow-600" },
      confirmed: { label: "Confirmada", variant: "success", icon: CheckCircle, color: "text-green-600" },
      cancelled: { label: "Cancelada", variant: "error", icon: Cancel, color: "text-red-600" },
      completed: { label: "Completada", variant: "primary", icon: CheckCircle, color: "text-blue-600" },
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    if (dateValue.seconds) {
      const date = new Date(dateValue.seconds * 1000);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    if (typeof dateValue === "string" && dateValue.includes("-")) {
      const date = new Date(dateValue);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return "N/A";
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      
      <div className="p-4 md:p-6">
        {/* Header con imagen de fondo */}
        <div className="relative mb-8">
          <div
            className="relative h-64 rounded-3xl overflow-hidden"
            style={{
              backgroundImage: `linear-gradient(rgba(30, 58, 138, 0.6), rgba(59, 130, 246, 0.6)), url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 backdrop-blur-[2px]"></div>
          </div>

          {/* Card de perfil flotante */}
          <GlassCard className="relative -mt-20 mx-4 p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                  {userProfile?.photoURL ? (
                    <img
                      src={userProfile.photoURL}
                      alt={userProfile.name}
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <span>{userProfile?.name ? userProfile.name[0].toUpperCase() : "U"}</span>
                  )}
                </div>
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-cta text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold font-heading text-primary-900 mb-2">
                  {userProfile?.name || "Usuario"}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                  <Badge variant={getRoleBadgeColor(userProfile?.role)}>
                    {getRoleText(userProfile?.role)}
                  </Badge>
                  {currentUser?.emailVerified && (
                    <Badge variant="success">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col gap-2 text-surface-500">
                  {userProfile?.email && (
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <Email className="w-4 h-4" />
                      <span className="text-sm">{userProfile.email}</span>
                    </div>
                  )}
                  {userProfile?.phone && (
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{userProfile.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botón configuración */}
              <Button
                variant="secondary"
                size="md"
                onClick={() => setSettingsOpen(true)}
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
                Configuración
              </Button>
            </div>
          </GlassCard>
        </div>

        {/* Contenido */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Personal */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold font-heading text-primary-900 mb-6 flex items-center gap-2">
              <AccountCircle className="w-6 h-6" />
              Información Personal
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-surface-500 mb-1">Nombre Completo</p>
                <p className="font-semibold text-primary-900">{userProfile?.name || "No especificado"}</p>
              </div>
              <div>
                <p className="text-sm text-surface-500 mb-1">Correo Electrónico</p>
                <p className="font-semibold text-primary-900 break-all">{userProfile?.email || "No especificado"}</p>
              </div>
              <div>
                <p className="text-sm text-surface-500 mb-1">Teléfono</p>
                <p className="font-semibold text-primary-900">{userProfile?.phone || "No especificado"}</p>
              </div>
              <div>
                <p className="text-sm text-surface-500 mb-1">Rol</p>
                <p className="font-semibold text-primary-900">{getRoleText(userProfile?.role)}</p>
              </div>
            </div>
          </GlassCard>

          {/* Reservas (solo para clientes) */}
          {userProfile?.role === "cliente" && (
            <div className="lg:col-span-2">
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold font-heading text-primary-900 mb-6 flex items-center gap-2">
                  <CalendarToday className="w-6 h-6" />
                  Mis Reservas ({reservations.length})
                </h3>

                {loadingReservations ? (
                  <div className="flex justify-center py-12">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : reservations.length > 0 ? (
                  <div className="space-y-3">
                    {reservations.slice(0, 10).map((reservation) => {
                      const statusConfig = getStatusConfig(reservation.status);
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <div
                          key={reservation.id}
                          className="p-4 rounded-xl hover:bg-primary/5 transition-colors border border-white/20"
                        >
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold font-heading text-primary-900 truncate">
                                {reservation.fieldName || "Cancha"}
                              </h4>
                              <p className="text-sm text-surface-500">
                                {formatDate(reservation.date)} • {reservation.startTime} - {reservation.endTime}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                            </div>
                          </div>
                          {reservation.totalPrice && (
                            <p className="text-sm font-bold text-cta">
                              ${reservation.totalPrice.toLocaleString()}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CalendarToday className="w-16 h-16 text-primary/20 mx-auto mb-4" />
                    <p className="text-surface-500 mb-4">No tienes reservas aún</p>
                    <Button variant="primary" size="md" onClick={() => window.location.href = "/canchas"}>
                      Explorar Canchas
                    </Button>
                  </div>
                )}
              </GlassCard>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Modal de configuración */}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </DashboardLayout>
  );
}

export default Profile;
