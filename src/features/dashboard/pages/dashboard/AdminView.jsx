import { useState } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import { Users, Hourglass, CircleCheck, Calendar, Trophy, ChartColumn, Shield, Inbox } from "lucide-react";
import { ReportsBarChart } from "shared/components/charts";
import {
  Avatar,
  Button,
  EmptyState,
  PageHeader,
  SectionCard,
  Skeleton,
  StatCard,
  StatusPill,
  cx,
  focusRing,
} from "shared/components/ui";
import { formatNumber } from "shared/utils/format";
import useAdminDashboardData from "./hooks/useAdminDashboardData";
import { periodTrend } from "./lib/metrics";
import FieldThumbnail from "./components/FieldThumbnail";
import FieldDetailsModal from "./components/FieldDetailsModal";
import RoleBar from "./components/RoleBar";
import DashboardError from "./components/DashboardError";
import { SectionSkeleton, StatGridSkeleton } from "./components/DashboardSkeletons";

const ROLE_LABEL = { admin: "Admin", asociado: "Asociado", cliente: "Cliente" };

const userRowClass = cx(
  "flex w-full items-center gap-3 px-5 py-3 text-left transition-colors duration-150 hover:bg-zinc-50",
  focusRing,
  "focus-visible:ring-inset"
);

function AdminView({ firstName }) {
  const navigate = useNavigate();
  const { loading, error, reload, fields, recentUsers, users, reservations } = useAdminDashboardData(true);
  const [selectedField, setSelectedField] = useState(null);

  const usersTrend = users ? periodTrend(users.new30, users.prev30) : {};
  const reservationsTrend = reservations ? periodTrend(reservations.new30, reservations.prev30) : {};
  const roleTotal = users
    ? users.roles.admin + users.roles.asociado + users.roles.cliente + users.roles.otros
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administración"
        title={`Hola, ${firstName}`}
        subtitle="Vista general del sistema: usuarios, canchas y reservas."
        className="mb-0"
        actions={
          <>
            <Button
              type="button"
              variant="secondary"
              leftIcon={<Users className="h-4 w-4" aria-hidden="true" />}
              onClick={() => navigate("/admin/users")}
            >
              Usuarios
            </Button>
            <Button
              type="button"
              variant="primary"
              leftIcon={<CircleCheck className="h-4 w-4" aria-hidden="true" />}
              onClick={() => navigate("/canchas?status=pending")}
            >
              Revisar canchas
            </Button>
          </>
        }
      />

      {error && <DashboardError message={error} onRetry={reload} />}

      {loading ? (
        <StatGridSkeleton />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={Users}
            color="primary"
            title="Usuarios"
            value={formatNumber(users.total)}
            subtitle={users.new30 > 0 ? `${formatNumber(users.new30)} nuevos en 30 días` : "Total registrados"}
            {...usersTrend}
          />
          <StatCard
            icon={Hourglass}
            color="warning"
            title="Canchas pendientes"
            value={formatNumber(fields.byStatus.pending)}
            subtitle="En revisión"
            onClick={() => navigate("/canchas?status=pending")}
          />
          <StatCard
            icon={CircleCheck}
            color="success"
            title="Canchas aprobadas"
            value={formatNumber(fields.byStatus.approved)}
            subtitle={`De ${formatNumber(fields.total)} registradas`}
          />
          <StatCard
            icon={Calendar}
            color="cta"
            title="Reservas"
            value={formatNumber(reservations.total)}
            subtitle={
              reservations.new30 > 0 ? `${formatNumber(reservations.new30)} nuevas en 30 días` : "Total históricas"
            }
            {...reservationsTrend}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {loading ? (
          <>
            <div className="rounded-lg border border-line bg-white p-5 lg:col-span-2" aria-hidden="true">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-5 h-[240px] w-full" />
            </div>
            <div className="space-y-4 rounded-lg border border-line bg-white p-5" aria-hidden="true">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </>
        ) : (
          <>
            <SectionCard
              title="Canchas por estado"
              subtitle="Distribución de las canchas registradas según su moderación."
              icon={<ChartColumn className="h-4 w-4" aria-hidden="true" />}
              className="lg:col-span-2"
            >
              {fields.total > 0 ? (
                <div className="h-[260px]">
                  <ReportsBarChart
                    color="primary"
                    title=""
                    description=""
                    date=""
                    chart={{
                      labels: ["Aprobadas", "Pendientes", "Deshabilitadas", "Rechazadas"],
                      datasets: {
                        label: "Canchas",
                        data: [
                          fields.byStatus.approved,
                          fields.byStatus.pending,
                          fields.byStatus.disabled,
                          fields.byStatus.rejected,
                        ],
                      },
                    }}
                  />
                </div>
              ) : (
                <EmptyState icon={Inbox} title="Sin canchas registradas" description="Cuando los asociados registren canchas verás su distribución aquí." bordered={false} size="sm" />
              )}
            </SectionCard>

            <SectionCard
              title="Usuarios por rol"
              subtitle={`${formatNumber(roleTotal)} en total`}
              icon={<Shield className="h-4 w-4" aria-hidden="true" />}
            >
              <div className="space-y-4">
                <RoleBar label="Administradores" count={users.roles.admin} total={roleTotal} color="bg-primary-600" />
                <RoleBar label="Asociados" count={users.roles.asociado} total={roleTotal} color="bg-zinc-700" />
                <RoleBar label="Clientes" count={users.roles.cliente} total={roleTotal} color="bg-cta-500" />
                {users.roles.otros > 0 && (
                  <RoleBar label="Otros" count={users.roles.otros} total={roleTotal} color="bg-zinc-300" />
                )}
              </div>
            </SectionCard>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {loading ? (
          <>
            <SectionSkeleton rows={4} />
            <SectionSkeleton rows={4} />
          </>
        ) : (
          <>
            <SectionCard
              title="Canchas recientes"
              icon={<Trophy className="h-4 w-4" aria-hidden="true" />}
              padding="p-0"
              actions={
                <Button type="button" variant="ghost" size="sm" onClick={() => navigate("/canchas")}>
                  Ver todas
                </Button>
              }
            >
              {fields.recent.length > 0 ? (
                <ul className="divide-y divide-line-subtle">
                  {fields.recent.map((field) => (
                    <li key={field.id}>
                      <FieldThumbnail field={field} onClick={() => setSelectedField(field)} />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState icon={Trophy} title="No hay canchas registradas aún" bordered={false} size="sm" />
              )}
            </SectionCard>

            <SectionCard
              title="Usuarios recientes"
              icon={<Users className="h-4 w-4" aria-hidden="true" />}
              padding="p-0"
              actions={
                <Button type="button" variant="ghost" size="sm" onClick={() => navigate("/admin/users")}>
                  Gestionar
                </Button>
              }
            >
              {recentUsers.length > 0 ? (
                <ul className="divide-y divide-line-subtle">
                  {recentUsers.map((user) => (
                    <li key={user.id}>
                      <Link to="/admin/users" className={userRowClass}>
                        <Avatar src={user.photoURL} name={user.name || user.email || "Usuario"} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-fg-strong">
                            {user.name || "Usuario"}
                          </span>
                          <span className="block truncate text-xs text-fg-subtle">{user.email || "Sin email"}</span>
                        </span>
                        <StatusPill tone="neutral" size="sm">
                          {ROLE_LABEL[user.role] || user.role || "Sin rol"}
                        </StatusPill>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState icon={Users} title="No hay usuarios todavía" bordered={false} size="sm" />
              )}
            </SectionCard>
          </>
        )}
      </div>

      <FieldDetailsModal open={Boolean(selectedField)} onClose={() => setSelectedField(null)} field={selectedField} />
    </div>
  );
}

AdminView.propTypes = { firstName: PropTypes.string.isRequired };

export default AdminView;
