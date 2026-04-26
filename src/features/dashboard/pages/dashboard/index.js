import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "shared/services/firebaseService";
import { useAuth } from "shared/context/AuthContext";
import { DashboardLayout, DashboardNavbar, Footer } from "shared/components/layout";
import { ReportsBarChart } from "shared/components/charts";
import {
  StatCard,
  Button,
  PageHeader,
  SectionCard,
  StatusPill,
} from "shared/components/ui";
import FieldDetailsModal from "./components/FieldDetailsModal";
import {
  Users,
  Hourglass,
  CircleCheck,
  Calendar,
  Trophy,
  Banknote,
  TrendingUp,
  ArrowRight,
  Shield,
  Plus,
  CalendarCheck2,
  Zap,
  XCircle,
  Ban,
  ArrowUpRight,
} from "lucide-react";

const STATUS_MAP = {
  approved: { label: "Aprobada", tone: "success", Icon: CircleCheck },
  pending: { label: "Pendiente", tone: "warning", Icon: Hourglass },
  disabled: { label: "Deshabilitada", tone: "neutral", Icon: Ban },
  rejected: { label: "Rechazada", tone: "danger", Icon: XCircle },
};

const RES_STATUS = {
  confirmed: { label: "Confirmada", tone: "success" },
  pending: { label: "Pendiente", tone: "warning" },
  cancelled: { label: "Cancelada", tone: "danger" },
  completed: { label: "Completada", tone: "info" },
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
    if (!userProfile || userProfile.role !== "admin") return undefined;

    const unsubUsers = onSnapshot(query(collection(db, "users")), (snap) => {
      setUserCount(snap.size);
      let admins = 0,
        asociados = 0,
        clientes = 0;
      snap.docs.forEach((doc) => {
        const role = doc.data().role;
        if (role === "admin") admins += 1;
        else if (role === "asociado") asociados += 1;
        else if (role === "cliente") clientes += 1;
      });
      setAdminCount(admins);
      setAssociateCount(asociados);
      setClientCount(clientes);
      setRecentUsers(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          .slice(0, 5)
      );
    });

    const unsubBookings = onSnapshot(query(collection(db, "reservations")), (snap) =>
      setBookingCount(snap.size)
    );
    const unsubPending = onSnapshot(
      query(collection(db, "canchas"), where("status", "==", "pending")),
      (snap) => setTotalPendingCount(snap.size)
    );
    const unsubApproved = onSnapshot(
      query(collection(db, "canchas"), where("status", "==", "approved")),
      (snap) => setApprovedFieldsCount(snap.size)
    );
    const unsubDisabled = onSnapshot(
      query(collection(db, "canchas"), where("status", "==", "disabled")),
      (snap) => setDisabledFieldsCount(snap.size)
    );
    const unsubAllFields = onSnapshot(query(collection(db, "canchas")), (snap) => {
      setRecentFields(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          .slice(0, 4)
      );
    });

    return () => {
      unsubUsers();
      unsubBookings();
      unsubPending();
      unsubApproved();
      unsubDisabled();
      unsubAllFields();
    };
  }, [userProfile]);

  useEffect(() => {
    if (!userProfile || userProfile.role !== "asociado") return undefined;

    let unsubAllReservations = null;
    const myFieldsQuery = query(collection(db, "canchas"), where("ownerId", "==", userProfile.uid));

    const unsubMyFields = onSnapshot(myFieldsQuery, (snap) => {
      setMyFieldsCount(snap.size);
      setMyRecentFields(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          .slice(0, 4)
      );
    });

    const unsubMyPending = onSnapshot(
      query(
        collection(db, "canchas"),
        where("ownerId", "==", userProfile.uid),
        where("status", "==", "pending")
      ),
      (snap) => setMyPendingCount(snap.size)
    );
    const unsubMyApproved = onSnapshot(
      query(
        collection(db, "canchas"),
        where("ownerId", "==", userProfile.uid),
        where("status", "==", "approved")
      ),
      (snap) => setMyApprovedCount(snap.size)
    );

    const unsubFieldsForReservations = onSnapshot(myFieldsQuery, (fieldsSnap) => {
      const fieldIds = fieldsSnap.docs.map((d) => d.id);
      if (unsubAllReservations) unsubAllReservations();
      if (fieldIds.length === 0) {
        setMyReservationsCount(0);
        setMyPendingReservationsCount(0);
        setMyTotalRevenue(0);
        setRecentReservations([]);
        return;
      }
      unsubAllReservations = onSnapshot(query(collection(db, "reservations")), (snap) => {
        const all = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((r) => fieldIds.includes(r.fieldId))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setMyReservationsCount(all.length);
        setMyPendingReservationsCount(all.filter((r) => r.status === "pending").length);
        setMyTotalRevenue(
          all
            .filter((r) => r.status === "confirmed" || r.status === "completed")
            .reduce((s, r) => s + (r.totalPrice || 0), 0)
        );
        setRecentReservations(all.slice(0, 5));
      });
    });

    return () => {
      unsubMyFields();
      unsubMyPending();
      unsubMyApproved();
      unsubFieldsForReservations();
      if (unsubAllReservations) unsubAllReservations();
    };
  }, [userProfile]);

  if (!userProfile || userProfile.role === "cliente") {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <ClientWelcome onExplore={() => navigate("/canchas")} />
        <Footer />
      </DashboardLayout>
    );
  }

  const isAdmin = userProfile.role === "admin";

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <PageHeader
        eyebrow={isAdmin ? "Administración · Panel" : "Asociado · Panel"}
        title={`Hola, ${userProfile.name?.split(" ")[0] || "operador"}`}
        subtitle={
          isAdmin
            ? "Vista general del sistema: usuarios, canchas y reservas."
            : "Resumen de tus canchas, reservas e ingresos en GoalTime."
        }
        actions={
          isAdmin ? (
            <>
              <Button variant="ghost" size="md" onClick={() => navigate("/admin/users")}>
                <Users className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
                Usuarios
              </Button>
              <Button variant="primary" size="md" onClick={() => navigate("/canchas?status=pending")}>
                <CircleCheck className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
                Aprobar canchas
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="md" onClick={() => navigate("/associate/reservations")}>
                <Calendar className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
                Reservas
              </Button>
              <Button variant="primary" size="md" onClick={() => navigate("/associate/fields?add=true")}>
                <Plus className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
                Nueva cancha
              </Button>
            </>
          )
        }
      />

      {isAdmin && (
        <AdminView
          stats={{ userCount, totalPendingCount, approvedFieldsCount, bookingCount, disabledFieldsCount }}
          users={{ adminCount, associateCount, clientCount, recentUsers }}
          fields={recentFields}
          onSelectField={(field) => {
            setSelectedField(field);
            setIsDetailsModalOpen(true);
          }}
          onNav={navigate}
        />
      )}

      {!isAdmin && (
        <AssociateView
          stats={{
            myFieldsCount,
            myApprovedCount,
            myPendingReservationsCount,
            myTotalRevenue,
            myReservationsCount,
            myPendingCount,
          }}
          fields={myRecentFields}
          reservations={recentReservations}
          onNav={navigate}
        />
      )}

      <Footer />

      {isAdmin && (
        <FieldDetailsModal
          open={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedField(null);
          }}
          field={selectedField}
        />
      )}
    </DashboardLayout>
  );
}

function ClientWelcome({ onExplore }) {
  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-sm p-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary mx-auto mb-5 flex items-center justify-center">
          <Trophy className="h-9 w-9" strokeWidth={1.5} aria-hidden />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary mb-2">
          Bienvenido a GoalTime
        </p>
        <h2 className="text-3xl font-semibold font-heading text-slate-900 mb-3">
          Reserva canchas en segundos
        </h2>
        <p className="text-slate-500 mb-6 max-w-md mx-auto">
          Explora todas las canchas disponibles, elige fecha y horario, y confirma tu reserva al
          instante.
        </p>
        <Button variant="primary" size="lg" onClick={onExplore}>
          <Trophy className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
          Ver canchas disponibles
        </Button>
      </div>
    </div>
  );
}

ClientWelcome.propTypes = { onExplore: PropTypes.func.isRequired };

function AdminView({ stats, users, fields, onSelectField, onNav }) {
  const { userCount, totalPendingCount, approvedFieldsCount, bookingCount, disabledFieldsCount } = stats;
  const { adminCount, associateCount, clientCount, recentUsers } = users;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          color="primary"
          title="Usuarios"
          value={userCount}
          subtitle="Total registrados"
        />
        <StatCard
          icon={Hourglass}
          color="warning"
          title="Pendientes"
          value={totalPendingCount}
          subtitle="Canchas en revisión"
        />
        <StatCard
          icon={CircleCheck}
          color="success"
          title="Aprobadas"
          value={approvedFieldsCount}
          subtitle="Activas y disponibles"
          trend={12}
          trendUp
        />
        <StatCard
          icon={Calendar}
          color="cta"
          title="Reservas"
          value={bookingCount}
          subtitle="Total históricas"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <SectionCard
          eyebrow="Reportes"
          title="Estado de canchas"
          subtitle="Distribución de canchas por estado de moderación."
          icon={<TrendingUp className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />}
          className="xl:col-span-2"
          padding="p-4 sm:p-6"
        >
          <div className="h-[280px]">
            <ReportsBarChart
              color="info"
              title=""
              description=""
              date=""
              chart={{
                labels: ["Aprobadas", "Pendientes", "Deshabilitadas"],
                datasets: {
                  label: "Canchas",
                  data: [approvedFieldsCount, totalPendingCount, disabledFieldsCount],
                },
              }}
            />
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Usuarios"
          title="Distribución por rol"
          icon={<Shield className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />}
        >
          <RoleBar label="Administradores" count={adminCount} total={userCount} color="bg-primary" />
          <RoleBar label="Asociados" count={associateCount} total={userCount} color="bg-secondary" />
          <RoleBar label="Clientes" count={clientCount} total={userCount} color="bg-cta" />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <SectionCard
          eyebrow="Catálogo"
          title="Canchas recientes"
          icon={<Trophy className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />}
          className="xl:col-span-2"
          actions={
            <Button variant="ghost" size="sm" onClick={() => onNav("/canchas")}>
              Ver todas
              <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            </Button>
          }
        >
          {fields.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map((field) => (
                <FieldThumbnail key={field.id} field={field} onClick={() => onSelectField(field)} />
              ))}
            </div>
          ) : (
            <EmptyState message="No hay canchas registradas aún." />
          )}
        </SectionCard>

        <SectionCard
          eyebrow="Equipo"
          title="Usuarios recientes"
          icon={<Users className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />}
          actions={
            <Button variant="ghost" size="sm" onClick={() => onNav("/admin/users")}>
              Gestionar
              <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            </Button>
          }
          padding="p-2"
        >
          {recentUsers.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {recentUsers.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 rounded-lg cursor-pointer"
                  onClick={() => onNav("/admin/users")}
                >
                  <span className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary text-white text-sm font-semibold flex items-center justify-center">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {user.name || "Usuario"}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{user.email || "Sin email"}</p>
                  </div>
                  <StatusPill tone="neutral" size="sm">
                    {user.role || "cliente"}
                  </StatusPill>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState message="No hay usuarios todavía." />
          )}
        </SectionCard>
      </div>
    </div>
  );
}

AdminView.propTypes = {
  stats: PropTypes.object.isRequired,
  users: PropTypes.object.isRequired,
  fields: PropTypes.array.isRequired,
  onSelectField: PropTypes.func.isRequired,
  onNav: PropTypes.func.isRequired,
};

function AssociateView({ stats, fields, reservations, onNav }) {
  const {
    myFieldsCount,
    myApprovedCount,
    myPendingReservationsCount,
    myTotalRevenue,
    myReservationsCount,
    myPendingCount,
  } = stats;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Trophy} color="primary" title="Mis canchas" value={myFieldsCount} subtitle="Registradas" />
        <StatCard icon={CircleCheck} color="success" title="Aprobadas" value={myApprovedCount} subtitle="Activas" trend={8} trendUp />
        <StatCard icon={CalendarCheck2} color="warning" title="Reservas pendientes" value={myPendingReservationsCount} subtitle="Por revisar" />
        <StatCard icon={Banknote} color="cta" title="Ingresos" value={`$${myTotalRevenue.toLocaleString()}`} subtitle="Confirmadas" trend={15} trendUp />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <SectionCard
          eyebrow="Mi catálogo"
          title="Canchas recientes"
          icon={<Trophy className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />}
          className="xl:col-span-2"
          actions={
            <Button variant="ghost" size="sm" onClick={() => onNav("/associate/fields")}>
              Ver todas
              <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            </Button>
          }
        >
          {fields.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map((field) => (
                <FieldThumbnail key={field.id} field={field} onClick={() => onNav("/associate/fields")} />
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-500 text-sm mb-4">Aún no has registrado canchas.</p>
              <Button variant="primary" onClick={() => onNav("/associate/fields?add=true")}>
                <Plus className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
                Registrar mi primera cancha
              </Button>
            </div>
          )}
        </SectionCard>

        <div className="space-y-6">
          <SectionCard
            eyebrow="Actividad"
            title="Reservas recientes"
            icon={<Calendar className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />}
            actions={
              <Button variant="ghost" size="sm" onClick={() => onNav("/associate/reservations")}>
                Ver
                <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
              </Button>
            }
          >
            {reservations.length > 0 ? (
              <ul className="space-y-3">
                {reservations.map((r) => {
                  const st = RES_STATUS[r.status] || { label: r.status, tone: "neutral" };
                  return (
                    <li
                      key={r.id}
                      className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {r.fieldName || "Cancha"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {r.date} · {r.startTime}
                        </p>
                      </div>
                      <div className="text-right">
                        <StatusPill tone={st.tone} size="sm">
                          {st.label}
                        </StatusPill>
                        {r.totalPrice && (
                          <p className="mt-1 text-xs font-semibold text-emerald-600">
                            ${r.totalPrice}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState message="No hay reservas todavía." />
            )}
          </SectionCard>

          <SectionCard
            eyebrow="Resumen"
            title="Métricas rápidas"
            icon={<Zap className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />}
          >
            <SummaryRow label="Total reservas" value={myReservationsCount} />
            <SummaryRow label="Canchas pendientes" value={myPendingCount} highlight="warning" />
            <SummaryRow
              label="Ingresos totales"
              value={`$${myTotalRevenue.toLocaleString()}`}
              highlight="success"
            />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

AssociateView.propTypes = {
  stats: PropTypes.object.isRequired,
  fields: PropTypes.array.isRequired,
  reservations: PropTypes.array.isRequired,
  onNav: PropTypes.func.isRequired,
};

function FieldThumbnail({ field, onClick }) {
  const status = STATUS_MAP[field.status] || STATUS_MAP.pending;
  return (
    <button
      type="button"
      onClick={onClick}
      className="group text-left rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 cursor-pointer focus:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20"
    >
      <div className="relative aspect-[16/10] bg-gradient-to-br from-primary-50 to-secondary/20">
        {field.imageUrl ? (
          <img
            src={field.imageUrl}
            alt={field.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-primary/40">
            <Trophy className="h-14 w-14" strokeWidth={1.25} aria-hidden />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <StatusPill tone={status.tone} size="sm">
            {status.label}
          </StatusPill>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold font-heading text-slate-900 truncate">
            {field.name || "Sin nombre"}
          </p>
          <ArrowUpRight
            className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-primary"
            strokeWidth={2}
            aria-hidden
          />
        </div>
        <p className="mt-0.5 text-xs text-slate-500 truncate">{field.address || "Sin dirección"}</p>
      </div>
    </button>
  );
}

FieldThumbnail.propTypes = {
  field: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

function RoleBar({ label, count, total, color }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-center mb-1.5 text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-900">{count}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`${color} h-full rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

RoleBar.propTypes = {
  label: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
};

function SummaryRow({ label, value, highlight }) {
  const cls =
    highlight === "success"
      ? "text-emerald-600"
      : highlight === "warning"
      ? "text-amber-600"
      : highlight === "danger"
      ? "text-rose-600"
      : "text-slate-900";
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-semibold ${cls}`}>{value}</span>
    </div>
  );
}

SummaryRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  highlight: PropTypes.string,
};

function EmptyState({ message }) {
  return (
    <div className="text-center py-8 text-sm text-slate-500">{message}</div>
  );
}

EmptyState.propTypes = { message: PropTypes.string.isRequired };

export default Dashboard;
