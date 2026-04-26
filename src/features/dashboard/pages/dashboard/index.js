import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "shared/services/firebaseService";
import { useAuth } from "shared/context/AuthContext";
import { DashboardLayout, DashboardNavbar, Footer } from "shared/components/layout";
import { ReportsBarChart, ReportsLineChart } from "shared/components/charts";
import { StatCard, GlassCard, Button } from "shared/components/ui";
import FieldDetailsModal from "./components/FieldDetailsModal";
import {
  People,
  HourglassEmpty,
  CheckCircle,
  CalendarToday,
  SportsSoccer,
  AttachMoney,
  TrendingUp,
} from "@mui/icons-material";

const STATUS_BADGE = {
  approved: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  disabled: "bg-gray-100 text-gray-500",
};

const STATUS_LABEL = {
  confirmed: { label: "Confirmada", cls: "text-green-600" },
  pending: { label: "Pendiente", cls: "text-yellow-600" },
};

function Dashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [userCount, setUserCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [totalPendingCount, setTotalPendingCount] = useState(0);
  const [approvedFieldsCount, setApprovedFieldsCount] = useState(0);
  const [disabledFieldsCount, setDisabledFieldsCount] = useState(0);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentFields, setRecentFields] = useState([]);
  const [adminCount, setAdminCount] = useState(0);
  const [associateCount, setAssociateCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [selectedField, setSelectedField] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [myFieldsCount, setMyFieldsCount] = useState(0);
  const [myPendingCount, setMyPendingCount] = useState(0);
  const [myApprovedCount, setMyApprovedCount] = useState(0);
  const [myReservationsCount, setMyReservationsCount] = useState(0);
  const [myPendingReservationsCount, setMyPendingReservationsCount] = useState(0);
  const [myTotalRevenue, setMyTotalRevenue] = useState(0);
  const [recentReservations, setRecentReservations] = useState([]);
  const [myRecentFields, setMyRecentFields] = useState([]);

  useEffect(() => {
    if (!userProfile || userProfile.role !== "admin") return;

    const unsubUsers = onSnapshot(query(collection(db, "users")), (snap) => {
      setUserCount(snap.size);
      let admins = 0, asociados = 0, clientes = 0;
      snap.docs.forEach((doc) => {
        const role = doc.data().role;
        if (role === "admin") admins++;
        else if (role === "asociado") asociados++;
        else if (role === "cliente") clientes++;
      });
      setAdminCount(admins); setAssociateCount(asociados); setClientCount(clientes);
      setRecentUsers(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          .slice(0, 5)
      );
    });

    const unsubBookings = onSnapshot(query(collection(db, "reservations")), (snap) => setBookingCount(snap.size));
    const unsubPending = onSnapshot(query(collection(db, "canchas"), where("status", "==", "pending")), (snap) => setTotalPendingCount(snap.size));
    const unsubApproved = onSnapshot(query(collection(db, "canchas"), where("status", "==", "approved")), (snap) => setApprovedFieldsCount(snap.size));
    const unsubDisabled = onSnapshot(query(collection(db, "canchas"), where("status", "==", "disabled")), (snap) => setDisabledFieldsCount(snap.size));
    const unsubAllFields = onSnapshot(query(collection(db, "canchas")), (snap) => {
      setRecentFields(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          .slice(0, 4)
      );
    });

    return () => { unsubUsers(); unsubBookings(); unsubPending(); unsubApproved(); unsubDisabled(); unsubAllFields(); };
  }, [userProfile]);

  useEffect(() => {
    if (!userProfile || userProfile.role !== "asociado") return;

    let unsubAllReservations = null;
    const myFieldsQuery = query(collection(db, "canchas"), where("ownerId", "==", userProfile.uid));

    const unsubMyFields = onSnapshot(myFieldsQuery, (snap) => {
      setMyFieldsCount(snap.size);
      setMyRecentFields(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          .slice(0, 4)
      );
    });

    const unsubMyPending = onSnapshot(
      query(collection(db, "canchas"), where("ownerId", "==", userProfile.uid), where("status", "==", "pending")),
      (snap) => setMyPendingCount(snap.size)
    );
    const unsubMyApproved = onSnapshot(
      query(collection(db, "canchas"), where("ownerId", "==", userProfile.uid), where("status", "==", "approved")),
      (snap) => setMyApprovedCount(snap.size)
    );

    const unsubFieldsForReservations = onSnapshot(myFieldsQuery, (fieldsSnap) => {
      const fieldIds = fieldsSnap.docs.map((d) => d.id);
      if (unsubAllReservations) unsubAllReservations();

      if (fieldIds.length === 0) {
        setMyReservationsCount(0); setMyPendingReservationsCount(0); setMyTotalRevenue(0); setRecentReservations([]);
        return;
      }

      unsubAllReservations = onSnapshot(query(collection(db, "reservations")), (snap) => {
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
          .filter((r) => fieldIds.includes(r.fieldId))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        setMyReservationsCount(all.length);
        setMyPendingReservationsCount(all.filter((r) => r.status === "pending").length);
        setMyTotalRevenue(all.filter((r) => r.status === "confirmed" || r.status === "completed").reduce((s, r) => s + (r.totalPrice || 0), 0));
        setRecentReservations(all.slice(0, 5));
      });
    });

    return () => {
      unsubMyFields(); unsubMyPending(); unsubMyApproved(); unsubFieldsForReservations();
      if (unsubAllReservations) unsubAllReservations();
    };
  }, [userProfile]);

  if (!userProfile || userProfile.role === "cliente") {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <div className="p-6 min-h-[calc(100vh-200px)] bg-gradient-to-br from-surface via-primary-50 to-secondary-50">
          <div className="flex flex-col items-center justify-center min-h-[60vh] py-8 text-center px-4">
            <GlassCard className="p-12 max-w-2xl mx-auto">
              <SportsSoccer className="w-20 h-20 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold font-heading text-primary-900 mb-3">
                Bienvenido a GoalTime
              </h2>
              <p className="text-surface-500 text-lg mb-8">
                Explora nuestras canchas disponibles y reserva tu próximo partido
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate("/canchas")}
                className="gap-2"
              >
                <SportsSoccer className="w-5 h-5" />
                Ver Canchas Disponibles
              </Button>
            </GlassCard>
          </div>
        </div>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <div className="p-4 md:p-6">
        {/* Header mejorado */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading text-primary-900 mb-2">Dashboard</h1>
          <p className="text-surface-500">Vista general del sistema</p>
        </div>

        {/* ── ADMIN ── */}
        {userProfile.role === "admin" && (
          <>
            {/* Stats cards - más prominentes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <StatCard 
                icon={People} 
                title="Usuarios Registrados" 
                value={userCount} 
                subtitle="Total en el sistema"
                color="primary"
              />
              <StatCard 
                icon={HourglassEmpty} 
                title="Canchas Pendientes" 
                value={totalPendingCount} 
                subtitle="Pendientes de revisión"
                color="secondary"
              />
              <StatCard 
                icon={CheckCircle} 
                title="Canchas Aprobadas" 
                value={approvedFieldsCount} 
                subtitle="Activas y disponibles"
                color="primary"
                trend={12}
                trendUp
              />
              <StatCard 
                icon={CalendarToday} 
                title="Reservas Totales" 
                value={bookingCount} 
                subtitle="Todas las reservas"
                color="cta"
              />
            </div>

            {/* Charts section - Más grande y prominente */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Chart principal - Ocupa 2 columnas */}
              <div className="lg:col-span-2">
                <GlassCard className="p-6 h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold font-heading text-primary-900 mb-1">
                        Estado de Canchas
                      </h3>
                      <p className="text-sm text-surface-500">Estados de las canchas registradas</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-surface-500">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      Actualizado ahora
                    </div>
                  </div>
                  <div className="h-[300px]">
                    <ReportsBarChart
                      color="info"
                      title=""
                      description=""
                      date=""
                      chart={{
                        labels: ["Aprobadas", "Pendientes", "Deshabilitadas"],
                        datasets: { label: "Canchas", data: [approvedFieldsCount, totalPendingCount, disabledFieldsCount] },
                      }}
                    />
                  </div>
                </GlassCard>
              </div>

              {/* Stats adicionales - 1 columna */}
              <div className="space-y-6">
                <GlassCard className="p-6">
                  <h4 className="font-semibold font-heading text-primary-900 mb-4">
                    Distribución de Usuarios
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-surface-500">Administradores</span>
                        <span className="font-bold text-primary-900">{adminCount}</span>
                      </div>
                      <div className="w-full bg-surface-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${userCount > 0 ? (adminCount / userCount) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-surface-500">Asociados</span>
                        <span className="font-bold text-primary-900">{associateCount}</span>
                      </div>
                      <div className="w-full bg-surface-200 rounded-full h-2">
                        <div 
                          className="bg-secondary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${userCount > 0 ? (associateCount / userCount) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-surface-500">Clientes</span>
                        <span className="font-bold text-primary-900">{clientCount}</span>
                      </div>
                      <div className="w-full bg-surface-200 rounded-full h-2">
                        <div 
                          className="bg-cta h-2 rounded-full transition-all duration-500"
                          style={{ width: `${userCount > 0 ? (clientCount / userCount) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-6">
                  <h4 className="font-semibold font-heading text-primary-900 mb-4">
                    Actividad Reciente
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary-900 truncate">
                          Nueva cancha aprobada
                        </p>
                        <p className="text-xs text-surface-400">Hace 2 horas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary-900 truncate">
                          Nueva reserva creada
                        </p>
                        <p className="text-xs text-surface-400">Hace 3 horas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary-900 truncate">
                          Usuario registrado
                        </p>
                        <p className="text-xs text-surface-400">Hace 5 horas</p>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>

            {/* Sección inferior - Canchas y Usuarios */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Canchas recientes - 2 columnas */}
              <div className="lg:col-span-2">
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold font-heading text-primary-900 flex items-center gap-2">
                      <SportsSoccer className="w-5 h-5" />
                      Canchas Recientes
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate("/canchas")}
                    >
                      Ver Todas
                    </Button>
                  </div>
                  {recentFields.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recentFields.map((field) => (
                        <div
                          key={field.id}
                          onClick={() => { setSelectedField(field); setIsDetailsModalOpen(true); }}
                          className="group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-1"
                        >
                          {field.imageUrl ? (
                            <img 
                              src={field.imageUrl} 
                              alt={field.name} 
                              className="w-full h-32 object-cover rounded-xl" 
                            />
                          ) : (
                            <div className="w-full h-32 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center">
                              <SportsSoccer className="w-12 h-12 text-primary/40" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl"></div>
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold font-heading text-white text-sm line-clamp-1">
                                {field.name}
                              </h4>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_BADGE[field.status] || "bg-gray-100 text-gray-500"}`}>
                                {field.status}
                              </span>
                            </div>
                            <p className="text-xs text-white/80 mt-1 line-clamp-1">{field.address}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-surface-400 py-8 text-sm">No hay canchas registradas aún</p>
                  )}
                </GlassCard>
              </div>

              {/* Usuarios recientes - 1 columna */}
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold font-heading text-primary-900 mb-6 flex items-center gap-2">
                  <People className="w-5 h-5" />
                  Usuarios Recientes
                </h3>
                {recentUsers.length > 0 ? (
                  <div className="space-y-3">
                    {recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">
                            {user.name ? user.name[0].toUpperCase() : "U"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold font-heading text-primary-900 truncate">
                            {user.name || "Usuario"}
                          </p>
                          <p className="text-xs text-surface-400 truncate">{user.email || "Sin email"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-surface-400 py-8 text-center">No hay usuarios registrados</p>
                )}
              </GlassCard>
            </div>

            {/* Acciones rápidas - Full width */}
            <div className="mt-6">
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold font-heading text-primary-900 mb-4">Acciones Rápidas</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    variant="primary" 
                    size="md"
                    fullWidth
                    onClick={() => navigate("/admin/users")}
                    className="gap-2"
                  >
                    <People className="w-4 h-4" />
                    Gestionar Usuarios
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="md"
                    fullWidth
                    onClick={() => navigate("/canchas?status=pending")}
                    className="gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Aprobar Canchas
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="md"
                    fullWidth
                    onClick={() => navigate("/canchas")}
                    className="gap-2"
                  >
                    <SportsSoccer className="w-4 h-4" />
                    Ver Canchas
                  </Button>
                  <Button 
                    variant="glass" 
                    size="md"
                    fullWidth
                    onClick={() => navigate("/canchas")}
                    className="gap-2"
                  >
                    <CalendarToday className="w-4 h-4" />
                    Ver Reservas
                  </Button>
                </div>
              </GlassCard>
            </div>
          </>
        )}

        {/* ── ASOCIADO ── */}
        {userProfile.role === "asociado" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard 
                icon={SportsSoccer} 
                title="Mis Canchas" 
                value={myFieldsCount} 
                subtitle="Total registradas"
                color="primary"
              />
              <StatCard 
                icon={CheckCircle} 
                title="Canchas Aprobadas" 
                value={myApprovedCount} 
                subtitle="Activas y disponibles"
                color="primary"
                trend={8}
                trendUp
              />
              <StatCard 
                icon={HourglassEmpty} 
                title="Reservas Pendientes" 
                value={myPendingReservationsCount} 
                subtitle="Pendientes de revisión"
                color="secondary"
              />
              <StatCard 
                icon={AttachMoney} 
                title="Ingresos Totales" 
                value={`$${myTotalRevenue.toLocaleString()}`} 
                subtitle="Reservas confirmadas"
                color="cta"
                trend={15}
                trendUp
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Mis canchas */}
              <div className="lg:col-span-2">
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold font-heading text-primary-900 flex items-center gap-2">
                      <SportsSoccer className="w-5 h-5" />
                      Mis Canchas
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate("/associate/fields")}
                    >
                      Ver Todas
                    </Button>
                  </div>
                  {myRecentFields.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {myRecentFields.map((field) => (
                        <GlassCard 
                          key={field.id} 
                          className="overflow-hidden"
                        >
                          {field.imageUrl && (
                            <img 
                              src={field.imageUrl} 
                              alt={field.name} 
                              className="w-full h-28 object-cover" 
                            />
                          )}
                          <div className="p-3">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold font-heading text-primary-900 text-sm">{field.name}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_BADGE[field.status] || "bg-gray-100 text-gray-500"}`}>
                                {field.status}
                              </span>
                            </div>
                            <p className="text-xs text-surface-400 mt-1">{field.address}</p>
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-surface-400 text-sm mb-3">Aún no has registrado canchas</p>
                      <Button 
                        variant="primary" 
                        size="md"
                        onClick={() => navigate("/associate/fields")}
                      >
                        + Registrar Mi Primera Cancha
                      </Button>
                    </div>
                  )}
                </GlassCard>
              </div>

              {/* Sidebar asociado */}
              <div className="flex flex-col gap-5">
                {/* Reservas recientes */}
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold font-heading text-primary-900 flex items-center gap-2">
                      <CalendarToday className="w-5 h-5" />
                      Reservas Recientes
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate("/associate/reservations")}
                    >
                      Ver Todas
                    </Button>
                  </div>
                  {recentReservations.length > 0 ? (
                    <div className="space-y-3">
                      {recentReservations.map((r) => {
                        const st = STATUS_LABEL[r.status];
                        return (
                          <div key={r.id} className="border-b border-white/30 pb-2 last:border-0">
                            <p className="text-sm font-medium font-heading text-primary-900">{r.fieldName || "Cancha"}</p>
                            <div className="flex justify-between items-center mt-0.5">
                              <span className="text-xs text-surface-400">{r.date || "N/A"}</span>
                              {st && <span className={`text-xs font-medium ${st.cls}`}>{st.label}</span>}
                            </div>
                            {r.totalPrice && <span className="text-xs text-green-600 font-bold">${r.totalPrice}</span>}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-surface-400">No hay reservas aún</p>
                  )}
                </GlassCard>

                {/* Resumen */}
                <GlassCard className="p-6">
                  <h3 className="font-bold font-heading text-primary-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Resumen
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "Total Reservas", value: myReservationsCount, cls: "text-primary" },
                      { label: "Canchas Pendientes", value: myPendingCount, cls: "text-yellow-600" },
                      { label: "Ingresos Totales", value: `$${myTotalRevenue.toLocaleString()}`, cls: "text-green-600" },
                    ].map(({ label, value, cls }) => (
                      <div key={label} className="flex justify-between items-center">
                        <span className="text-sm text-surface-500">{label}</span>
                        <span className={`font-bold font-heading ${cls}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Acciones rápidas */}
                <GlassCard className="p-6">
                  <h3 className="font-bold font-heading text-primary-900 mb-4">⚡ Acciones Rápidas</h3>
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="primary" 
                      size="md"
                      fullWidth
                      onClick={() => navigate("/associate/fields")}
                      className="gap-2"
                    >
                      <SportsSoccer className="w-4 h-4" />
                      Mis Canchas
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="md"
                      fullWidth
                      onClick={() => navigate("/associate/fields?add=true")}
                    >
                      + Agregar Cancha
                    </Button>
                  </div>
                </GlassCard>
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />

      {userProfile?.role === "admin" && (
        <FieldDetailsModal
          open={isDetailsModalOpen}
          onClose={() => { setIsDetailsModalOpen(false); setSelectedField(null); }}
          field={selectedField}
        />
      )}
    </DashboardLayout>
  );
}

export default Dashboard;
