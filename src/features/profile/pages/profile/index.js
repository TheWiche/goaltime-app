import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { DashboardLayout, DashboardNavbar, Footer } from "shared/components/layout";
import { openSettingsModal } from "shared/components/notifications/GlobalSettingsModal";
import {
  Avatar,
  Button,
  EmptyState,
  SectionCard,
  Skeleton,
  StatusPill,
  cx,
  focusRing,
} from "shared/components/ui";
import { useAuth } from "shared/context/AuthContext";
import { db } from "shared/services/firebaseService";
import { formatCurrency } from "shared/utils/format";
import { formatDateEs } from "shared/utils/date";
import { getStatusMeta } from "shared/utils/reservationStatus";
import { logger } from "shared/utils/logger";
import { ArrowRight, BadgeCheck, Calendar, ImagePlus, KeyRound, Settings, TriangleAlert } from "lucide-react";

const ROLES = {
  admin: { label: "Administrador", tone: "info" },
  asociado: { label: "Asociado", tone: "cta" },
  cliente: { label: "Cliente", tone: "neutral" },
};

const RECENT_LIMIT = 8;
const SHORT_DATE = { day: "numeric", month: "short", year: "numeric" };

function InfoRow({ label, value }) {
  return (
    <>
      <dt className="text-fg-muted">{label}</dt>
      <dd className="m-0 min-w-0 break-words font-medium text-fg-strong">
        {value || <span className="font-normal text-fg-subtle">No especificado</span>}
      </dd>
    </>
  );
}

InfoRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
};

function SettingRow({ icon, title, description, action }) {
  return (
    <li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-zinc-50 text-fg-muted [&>svg]:h-4 [&>svg]:w-4"
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-fg-strong">{title}</p>
        <p className="text-[13px] text-fg-muted">{description}</p>
      </div>
      {action}
    </li>
  );
}

SettingRow.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  action: PropTypes.node,
};

function Profile() {
  const { userProfile, currentUser } = useAuth();
  const navigate = useNavigate();
  const uid = currentUser?.uid;
  const isClient = userProfile?.role === "cliente";
  const hasPassword = Boolean(currentUser?.providerData?.some((p) => p.providerId === "password"));

  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(isClient);
  const [reservationsError, setReservationsError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!uid || !isClient) {
      setReservations([]);
      setLoadingReservations(false);
      return undefined;
    }
    setLoadingReservations(true);
    setReservationsError(false);

    const recentQuery = query(
      collection(db, "reservations"),
      where("clientId", "==", uid),
      orderBy("createdAt", "desc"),
      limit(RECENT_LIMIT)
    );
    const unsub = onSnapshot(
      recentQuery,
      (snap) => {
        setReservations(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoadingReservations(false);
      },
      (error) => {
        logger.error("profile: reservas recientes", error);
        setReservations([]);
        setReservationsError(true);
        setLoadingReservations(false);
      }
    );
    return () => unsub();
  }, [uid, isClient, reloadKey]);

  const role = ROLES[userProfile?.role] || { label: userProfile?.role || "—", tone: "neutral" };
  const displayName = userProfile?.name || "Usuario";

  let recentContent;
  if (loadingReservations) {
    recentContent = (
      <div className="divide-y divide-line-subtle" aria-busy="true" aria-label="Cargando reservas">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between gap-3 px-5 py-3">
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    );
  } else if (reservationsError) {
    recentContent = (
      <EmptyState
        bordered={false}
        size="sm"
        icon={TriangleAlert}
        title="No pudimos cargar tus reservas"
        description="Revisa tu conexión e inténtalo de nuevo."
        action={
          <Button size="sm" variant="secondary" onClick={() => setReloadKey((k) => k + 1)}>
            Reintentar
          </Button>
        }
      />
    );
  } else if (reservations.length === 0) {
    recentContent = (
      <EmptyState
        bordered={false}
        size="sm"
        icon={Calendar}
        title="Aún no tienes reservas"
        description="Explora canchas y reserva en segundos."
        action={
          <Button size="sm" onClick={() => navigate("/canchas")}>
            Explorar canchas
          </Button>
        }
      />
    );
  } else {
    recentContent = (
      <ul className="m-0 list-none divide-y divide-line-subtle p-0">
        {reservations.map((r) => {
          const status = getStatusMeta(r.status);
          return (
            <li key={r.id}>
              <Link
                to="/reservations"
                className={cx(
                  "flex items-start justify-between gap-3 px-5 py-3 transition-colors duration-150 hover:bg-zinc-50",
                  focusRing,
                  "focus-visible:ring-inset"
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-fg-strong">
                    {r.fieldName || "Cancha"}
                  </span>
                  <span className="mt-0.5 block text-xs text-fg-muted">
                    {formatDateEs(r.date, SHORT_DATE, "Sin fecha")}
                    {r.startTime ? ` · ${r.startTime}${r.endTime ? ` – ${r.endTime}` : ""}` : ""}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <StatusPill tone={status.tone} size="sm">
                    {status.label}
                  </StatusPill>
                  {r.totalPrice > 0 && (
                    <span className="tabular text-[13px] font-medium text-fg-strong">
                      {formatCurrency(r.totalPrice)}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />

      {/* Cabecera */}
      <section
        aria-label="Resumen del perfil"
        className="mb-6 flex flex-col gap-4 rounded-lg border border-line bg-white p-5 sm:flex-row sm:items-center"
      >
        <Avatar src={userProfile?.photoURL} name={displayName} size="xl" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-semibold tracking-tight text-fg-strong">{displayName}</h1>
          {userProfile?.email && (
            <p className="mt-0.5 truncate text-sm text-fg-muted">{userProfile.email}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusPill tone={role.tone} size="sm">
              {role.label}
            </StatusPill>
            {currentUser?.emailVerified && (
              <StatusPill tone="success" size="sm" icon={<BadgeCheck aria-hidden />}>
                Correo verificado
              </StatusPill>
            )}
          </div>
        </div>
        <Button
          variant="secondary"
          leftIcon={<Settings className="h-4 w-4" aria-hidden />}
          onClick={() => openSettingsModal("account")}
        >
          Editar perfil
        </Button>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Información */}
        <SectionCard title="Información de la cuenta" className="lg:col-span-1">
          <dl className="m-0 grid grid-cols-[96px_1fr] gap-x-4 gap-y-3 text-sm">
            <InfoRow label="Nombre" value={userProfile?.name} />
            <InfoRow label="Correo" value={userProfile?.email} />
            <InfoRow label="Teléfono" value={userProfile?.phone} />
            <InfoRow label="Rol" value={role.label} />
            <InfoRow
              label="Miembro desde"
              value={
                userProfile?.createdAt
                  ? formatDateEs(userProfile.createdAt, { month: "long", year: "numeric" }, "")
                  : ""
              }
            />
          </dl>
        </SectionCard>

        <div className="space-y-6 lg:col-span-2">
          {/* Reservas recientes (solo clientes) */}
          {isClient && (
            <SectionCard
              title="Reservas recientes"
              subtitle={`Tus últimas ${RECENT_LIMIT} reservas`}
              padding="p-0"
              actions={
                reservations.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    rightIcon={<ArrowRight className="h-3.5 w-3.5" aria-hidden />}
                    onClick={() => navigate("/reservations")}
                  >
                    Ver todas
                  </Button>
                )
              }
            >
              {recentContent}
            </SectionCard>
          )}

          {/* Ajustes */}
          <SectionCard title="Ajustes" subtitle="Foto de perfil y seguridad de la cuenta">
            <ul className="m-0 list-none divide-y divide-line-subtle p-0">
              <SettingRow
                icon={<ImagePlus />}
                title="Foto de perfil"
                description="Sube, cambia o elimina tu imagen."
                action={
                  <Button size="sm" variant="secondary" onClick={() => openSettingsModal("account")}>
                    Gestionar
                  </Button>
                }
              />
              <SettingRow
                icon={<KeyRound />}
                title="Contraseña"
                description={
                  hasPassword
                    ? "Te enviaremos un enlace para crear una nueva."
                    : "Tu cuenta usa un proveedor externo; la contraseña se gestiona allí."
                }
                action={
                  hasPassword ? (
                    <Button size="sm" variant="secondary" onClick={() => openSettingsModal("password")}>
                      Cambiar
                    </Button>
                  ) : null
                }
              />
            </ul>
          </SectionCard>
        </div>
      </div>

      <Footer />
    </DashboardLayout>
  );
}

export default Profile;
