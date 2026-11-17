import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import { Trophy, CircleCheck, Calendar, CalendarCheck2, Banknote, Plus, ChartColumn, ListChecks, Inbox } from "lucide-react";
import { ReportsBarChart } from "shared/components/charts";
import {
  Button,
  EmptyState,
  PageHeader,
  SectionCard,
  Skeleton,
  StatCard,
  StatusPill,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  focusRing,
} from "shared/components/ui";
import { formatCurrency, formatNumber } from "shared/utils/format";
import { formatDateEs } from "shared/utils/date";
import { getStatusMeta } from "shared/utils/reservationStatus";
import useAssociateDashboardData from "./hooks/useAssociateDashboardData";
import FieldThumbnail from "./components/FieldThumbnail";
import SummaryRow from "./components/SummaryRow";
import DashboardError from "./components/DashboardError";
import { SectionSkeleton, StatGridSkeleton } from "./components/DashboardSkeletons";

function AssociateView({ uid, firstName }) {
  const navigate = useNavigate();
  const { loading, error, reload, fields, reservations, revenue } = useAssociateDashboardData(uid);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Asociado"
        title={`Hola, ${firstName}`}
        subtitle="Resumen de tus canchas, reservas e ingresos en GoalTime."
        className="mb-0"
        actions={
          <>
            <Button
              type="button"
              variant="secondary"
              leftIcon={<Calendar className="h-4 w-4" aria-hidden="true" />}
              onClick={() => navigate("/associate/reservations")}
            >
              Reservas
            </Button>
            <Button
              type="button"
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}
              onClick={() => navigate("/associate/fields?add=true")}
            >
              Nueva cancha
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
            icon={Trophy}
            color="primary"
            title="Mis canchas"
            value={formatNumber(fields.total)}
            subtitle={`${formatNumber(fields.approved)} aprobadas · ${formatNumber(fields.pending)} en revisión`}
            onClick={() => navigate("/associate/fields")}
          />
          <StatCard
            icon={CalendarCheck2}
            color="secondary"
            title="Reservas"
            value={formatNumber(reservations.total)}
            subtitle="Total recibidas"
            {...reservations.trend}
          />
          <StatCard
            icon={CircleCheck}
            color="warning"
            title="Por confirmar"
            value={formatNumber(reservations.pending)}
            subtitle="Reservas pendientes"
            onClick={() => navigate("/associate/reservations")}
          />
          <StatCard
            icon={Banknote}
            color="success"
            title="Ingresos"
            value={formatCurrency(revenue.total)}
            subtitle="Confirmadas y completadas"
            {...revenue.trend}
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
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
          </>
        ) : (
          <>
            <SectionCard
              title="Ingresos por mes"
              subtitle="Reservas confirmadas y completadas, últimos 6 meses."
              icon={<ChartColumn className="h-4 w-4" aria-hidden="true" />}
              className="lg:col-span-2"
            >
              {revenue.monthly.hasData ? (
                <div className="h-[260px]">
                  <ReportsBarChart
                    color="primary"
                    title=""
                    description=""
                    date=""
                    chart={{
                      labels: revenue.monthly.labels,
                      datasets: { label: "Ingresos (COP)", data: revenue.monthly.values },
                    }}
                  />
                </div>
              ) : (
                <EmptyState
                  icon={Banknote}
                  title="Aún no hay ingresos"
                  description="Aparecerán aquí cuando confirmes tus primeras reservas."
                  bordered={false}
                  size="sm"
                />
              )}
            </SectionCard>

            <SectionCard title="Resumen" icon={<ListChecks className="h-4 w-4" aria-hidden="true" />}>
              <dl>
                <SummaryRow label="Reservas totales" value={formatNumber(reservations.total)} />
                <SummaryRow label="Confirmadas" value={formatNumber(reservations.confirmed)} tone="success" />
                <SummaryRow label="Completadas" value={formatNumber(reservations.completed)} />
                <SummaryRow label="Canceladas" value={formatNumber(reservations.cancelled)} tone="danger" />
                <SummaryRow label="Canchas en revisión" value={formatNumber(fields.pending)} tone="warning" />
                <SummaryRow label="Ingresos totales" value={formatCurrency(revenue.total)} tone="success" />
              </dl>
            </SectionCard>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {loading ? (
          <>
            <SectionSkeleton rows={5} className="lg:col-span-2" />
            <SectionSkeleton rows={3} />
          </>
        ) : (
          <>
            <SectionCard
              title="Reservas recientes"
              icon={<Calendar className="h-4 w-4" aria-hidden="true" />}
              padding="p-0"
              className="lg:col-span-2"
              actions={
                <Button type="button" variant="ghost" size="sm" onClick={() => navigate("/associate/reservations")}>
                  Ver todas
                </Button>
              }
            >
              {reservations.recent.length > 0 ? (
                <Table bare caption="Reservas recientes">
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Cancha</TableHeaderCell>
                      <TableHeaderCell>Fecha</TableHeaderCell>
                      <TableHeaderCell>Estado</TableHeaderCell>
                      <TableHeaderCell align="right">Total</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reservations.recent.map((r) => {
                      const st = getStatusMeta(r.status);
                      return (
                        <TableRow key={r.id}>
                          <TableCell>
                            <Link
                              to="/associate/reservations"
                              className={`rounded font-medium text-fg-strong hover:text-primary-700 ${focusRing}`}
                            >
                              {r.fieldName || "Cancha"}
                            </Link>
                          </TableCell>
                          <TableCell muted nowrap>
                            {formatDateEs(r.date, { day: "numeric", month: "short" }, "—")}
                            {r.startTime ? ` · ${r.startTime}` : ""}
                          </TableCell>
                          <TableCell>
                            <StatusPill tone={st.tone} size="sm">
                              {st.label}
                            </StatusPill>
                          </TableCell>
                          <TableCell align="right" numeric>
                            {Number(r.totalPrice) > 0 ? formatCurrency(r.totalPrice) : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState
                  icon={Inbox}
                  title="Aún no hay reservas"
                  description="Cuando un cliente reserve una de tus canchas aparecerá aquí."
                  bordered={false}
                  size="sm"
                />
              )}
            </SectionCard>

            <SectionCard
              title="Mis canchas"
              icon={<Trophy className="h-4 w-4" aria-hidden="true" />}
              padding="p-0"
              actions={
                <Button type="button" variant="ghost" size="sm" onClick={() => navigate("/associate/fields")}>
                  Ver todas
                </Button>
              }
            >
              {fields.recent.length > 0 ? (
                <ul className="divide-y divide-line-subtle">
                  {fields.recent.map((field) => (
                    <li key={field.id}>
                      <FieldThumbnail field={field} to="/associate/fields" />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={Trophy}
                  title="Aún no has registrado canchas"
                  action={
                    <Button
                      type="button"
                      size="sm"
                      leftIcon={<Plus className="h-3.5 w-3.5" aria-hidden="true" />}
                      onClick={() => navigate("/associate/fields?add=true")}
                    >
                      Registrar mi primera cancha
                    </Button>
                  }
                  bordered={false}
                  size="sm"
                />
              )}
            </SectionCard>
          </>
        )}
      </div>
    </div>
  );
}

AssociateView.propTypes = {
  uid: PropTypes.string.isRequired,
  firstName: PropTypes.string.isRequired,
};

export default AssociateView;
