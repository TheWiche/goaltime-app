import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { DashboardLayout, DashboardNavbar, Footer } from "shared/components/layout";
import {
  Button,
  SectionCard,
  StatusPill,
} from "shared/components/ui";
import { useAuth } from "shared/context/AuthContext";
import { db } from "shared/services/firebaseService";
import SettingsModal from "./components/SettingsModal";
import {
  Mail,
  Phone,
  Calendar,
  Settings,
  CircleCheck,
  User,
  BadgeCheck,
  UserCircle,
  ArrowRight,
} from "lucide-react";

const ROLES = {
  admin: { label: "Administrador", tone: "info" },
  asociado: { label: "Asociado", tone: "cta" },
  cliente: { label: "Cliente", tone: "neutral" },
};

const RES_STATUS = {
  pending: { label: "Pendiente", tone: "warning" },
  confirmed: { label: "Confirmada", tone: "success" },
  cancelled: { label: "Cancelada", tone: "danger" },
  completed: { label: "Completada", tone: "info" },
};

function formatDate(value) {
  if (!value) return "—";
  let d;
  if (value.seconds) d = new Date(value.seconds * 1000);
  else if (typeof value === "string" && value.includes("-")) d = new Date(value);
  else if (value instanceof Date) d = value;
  else return "—";
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function Profile() {
  const { userProfile, currentUser } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!currentUser || userProfile?.role !== "cliente") {
      setLoadingReservations(false);
      return undefined;
    }
    setLoadingReservations(true);

    const reservationsQuery = query(
      collection(db, "reservations"),
      where("clientId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(
      reservationsQuery,
      (snap) => {
        setReservations(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoadingReservations(false);
      },
      () => {
        setReservations([]);
        setLoadingReservations(false);
      }
    );
    return () => unsub();
  }, [currentUser, userProfile]);

  const role = ROLES[userProfile?.role] || { label: userProfile?.role || "—", tone: "neutral" };
  const initial = userProfile?.name ? userProfile.name[0].toUpperCase() : "U";

  return (
    <DashboardLayout>
      <DashboardNavbar />

      {/* Hero del perfil */}
      <div className="relative mb-6">
        <div
          aria-hidden="true"
          className="h-44 sm:h-52 rounded-2xl overflow-hidden relative"
          style={{
            background:
              "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #60A5FA 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(800px 400px at 0% 0%, rgba(255,255,255,0.25), transparent 60%), radial-gradient(600px 300px at 100% 100%, rgba(249,115,22,0.25), transparent 60%)",
            }}
          />
        </div>

        <div className="relative -mt-16 px-4 sm:px-6">
          <SectionCard padding="p-5 sm:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
              <div className="relative">
                {userProfile?.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt={userProfile.name || "Avatar"}
                    className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <span className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white text-3xl font-semibold flex items-center justify-center border-4 border-white shadow-md">
                    {initial}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-cta text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform focus:outline-none focus-visible:ring-[3px] focus-visible:ring-cta/30"
                  aria-label="Editar perfil"
                >
                  <Settings className="h-4 w-4" strokeWidth={2} aria-hidden />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary mb-1">
                  Perfil · Cuenta
                </p>
                <h1 className="text-2xl sm:text-3xl font-semibold font-heading text-slate-900">
                  {userProfile?.name || "Usuario"}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusPill tone={role.tone} size="sm">
                    {role.label}
                  </StatusPill>
                  {currentUser?.emailVerified && (
                    <StatusPill tone="success" size="sm" icon={<BadgeCheck className="h-3 w-3" strokeWidth={2} aria-hidden />}>
                      Verificado
                    </StatusPill>
                  )}
                </div>
              </div>

              <Button variant="ghost" size="md" onClick={() => setSettingsOpen(true)}>
                <Settings className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
                Configurar
              </Button>
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard
          eyebrow="Datos personales"
          title="Información de cuenta"
          icon={<UserCircle className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />}
        >
          <ProfileField icon={<User className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />} label="Nombre completo" value={userProfile?.name} />
          <ProfileField icon={<Mail className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />} label="Correo electrónico" value={userProfile?.email} />
          <ProfileField icon={<Phone className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />} label="Teléfono" value={userProfile?.phone} />
          <div className="pt-3 mt-1 border-t border-slate-100">
            <p className="text-xs uppercase tracking-[0.1em] text-slate-500 mb-1.5">Rol</p>
            <StatusPill tone={role.tone} size="md">
              {role.label}
            </StatusPill>
          </div>
        </SectionCard>

        {userProfile?.role === "cliente" && (
          <div className="lg:col-span-2">
            <SectionCard
              eyebrow="Actividad"
              title={`Mis reservas (${reservations.length})`}
              icon={<Calendar className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />}
              actions={
                reservations.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => navigate("/reservations")}>
                    Ver todas
                    <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                  </Button>
                )
              }
              padding="p-2"
            >
              {loadingReservations ? (
                <div className="p-8 text-center text-sm text-slate-500">Cargando reservas...</div>
              ) : reservations.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {reservations.slice(0, 8).map((r) => {
                    const st = RES_STATUS[r.status] || { label: r.status, tone: "neutral" };
                    return (
                      <li
                        key={r.id}
                        className="flex items-start justify-between gap-3 px-3 py-3.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => navigate("/reservations")}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900 truncate">
                            {r.fieldName || "Cancha"}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {formatDate(r.date)} · {r.startTime} – {r.endTime}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <StatusPill tone={st.tone} size="sm">
                            {st.label}
                          </StatusPill>
                          {r.totalPrice && (
                            <p className="mt-1 text-sm font-semibold text-emerald-600">
                              ${r.totalPrice.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="text-center p-10">
                  <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary mx-auto mb-3 flex items-center justify-center">
                    <Calendar className="h-7 w-7" strokeWidth={2} aria-hidden />
                  </div>
                  <p className="text-base font-semibold font-heading text-slate-900 mb-1">
                    No tienes reservas aún
                  </p>
                  <p className="text-sm text-slate-500 mb-5">
                    Explora canchas y reserva en segundos.
                  </p>
                  <Button variant="primary" size="md" onClick={() => navigate("/canchas")}>
                    <CircleCheck className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
                    Explorar canchas
                  </Button>
                </div>
              )}
            </SectionCard>
          </div>
        )}
      </div>

      <Footer />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </DashboardLayout>
  );
}

function ProfileField({ icon, label, value }) {
  return (
    <div className="py-2.5 first:pt-0 last:pb-0 border-b border-slate-100 last:border-0">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 text-slate-400">{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-[0.1em] text-slate-500 mb-1">{label}</p>
          <p className="text-sm font-medium text-slate-900 break-all">
            {value || "No especificado"}
          </p>
        </div>
      </div>
    </div>
  );
}

ProfileField.propTypes = {
  icon: PropTypes.node,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
};

export default Profile;
