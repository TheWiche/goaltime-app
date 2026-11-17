import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CalendarOff, CircleCheck, Flag, Hourglass, Lock, Search, XCircle } from "lucide-react";
import { DashboardLayout, DashboardNavbar, Footer } from "shared/components/layout";
import {
  Button,
  EmptyState,
  PageHeader,
  SectionCard,
  SegmentedControl,
  Select,
  LoadMoreFooter,
  Skeleton,
  StatCard,
  TextField,
  Toast,
} from "shared/components/ui";
import { useAuth } from "shared/context/AuthContext";
import { formatCurrency } from "shared/utils/format";
import { getStatusLabel, getStatusOptions } from "shared/utils/reservationStatus";
import useLoadMore from "shared/hooks/useLoadMore";
import useAssociateReservations, { getClientName } from "./useAssociateReservations";
import ReservationsTable from "./components/ReservationsTable";
import ReservationDetailsModal from "./components/ReservationDetailsModal";
import StatusChangeModal from "./components/StatusChangeModal";

const FILTERS = getStatusOptions({ includeAll: true, allLabel: "Todas" });

function TableSkeleton() {
  return (
    <div className="divide-y divide-line-subtle" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-3 w-32" />
          <Skeleton className="hidden h-3 w-40 md:block" />
          <Skeleton className="ml-auto h-5 w-20" />
        </div>
      ))}
    </div>
  );
}

function AssociateReservations() {
  const navigate = useNavigate();
  const { userProfile, currentUser } = useAuth();
  const isAssociate = userProfile?.role === "asociado";
  const data = useAssociateReservations(currentUser?.uid, { enabled: isAssociate });
  const { reservations, loading, error, clientsMap, counts, filtered } = data;

  const [detailId, setDetailId] = useState(null);
  const [statusChange, setStatusChange] = useState(null); // { id, target }
  const [changing, setChanging] = useState(false);
  const [toast, setToast] = useState({ open: false, type: "info", message: "" });

  const showToast = useCallback((message, type = "info") => setToast({ open: true, type, message }), []);
  const clientNameOf = useCallback((r) => getClientName(r, clientsMap), [clientsMap]);

  const pager = useLoadMore(filtered, {
    resetKey: `${data.statusFilter}|${data.fieldFilter}|${data.debouncedSearch}|${data.dateSort}`,
  });

  // Los modales leen la reserva viva de la lista (reflejan cambios en tiempo real).
  const byId = useMemo(() => new Map(reservations.map((r) => [r.id, r])), [reservations]);
  const detailReservation = detailId ? byId.get(detailId) || null : null;
  const statusReservation = statusChange ? byId.get(statusChange.id) || null : null;

  const openStatusChange = useCallback((reservation, target) => {
    setStatusChange({ id: reservation.id, target });
  }, []);

  const handleStatusSubmit = async (newStatus, reason) => {
    if (!statusReservation || changing) return;
    setChanging(true);
    try {
      const { emailError } = await data.changeStatus(statusReservation, newStatus, reason);
      setStatusChange(null);
      if (emailError) {
        showToast(`Estado actualizado, pero no se pudo enviar el correo: ${emailError}`, "warning");
      } else {
        showToast(`Reserva ${getStatusLabel(newStatus).toLowerCase()}.`, "success");
      }
    } catch (err) {
      showToast(err.message || "No se pudo cambiar el estado.", "error");
    } finally {
      setChanging(false);
    }
  };

  if (userProfile && !isAssociate) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <EmptyState
          icon={Lock}
          title="Acceso restringido"
          description="Solo los asociados pueden gestionar reservas de canchas."
          action={
            <Button type="button" size="sm" variant="secondary" onClick={() => navigate("/dashboard")}>
              Ir al panel
            </Button>
          }
        />
        <Footer />
      </DashboardLayout>
    );
  }

  const hasFilters = Boolean(data.search) || data.statusFilter !== "all" || data.fieldFilter !== "all";

  let body;
  if (loading) body = <TableSkeleton />;
  else if (error && reservations.length === 0) {
    body = <EmptyState bordered={false} icon={AlertTriangle} title="No pudimos cargar las reservas" description={error} />;
  } else if (reservations.length === 0) {
    body = (
      <EmptyState
        bordered={false}
        icon={CalendarOff}
        title="Aún no tienes reservas"
        description="Cuando un cliente reserve una de tus canchas aparecerá aquí."
        action={
          <Button type="button" size="sm" variant="secondary" onClick={() => navigate("/associate/fields")}>
            Ver mis canchas
          </Button>
        }
      />
    );
  } else if (filtered.length === 0) {
    body = (
      <EmptyState
        bordered={false}
        size="sm"
        icon={Search}
        title="Sin resultados"
        description="Ninguna reserva coincide con los filtros."
        action={
          hasFilters ? (
            <Button type="button" size="sm" variant="secondary" onClick={data.resetFilters}>
              Limpiar filtros
            </Button>
          ) : null
        }
      />
    );
  } else {
    body = (
      <ReservationsTable
        reservations={pager.visibleItems}
        getClientName={clientNameOf}
        busy={changing}
        dateSort={data.dateSort}
        onToggleDateSort={data.toggleDateSort}
        onOpen={(r) => setDetailId(r.id)}
        onAction={openStatusChange}
      />
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <PageHeader
        title="Reservas"
        subtitle="Confirma, rechaza y completa las reservas de tus canchas."
        meta={
          !loading && counts.revenue > 0 ? (
            <span className="text-[13px] text-fg-muted">
              Ingresos confirmados: <span className="tabular font-medium text-fg-strong">{formatCurrency(counts.revenue)}</span>
            </span>
          ) : null
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Hourglass}
          color="warning"
          title="Pendientes"
          value={counts.pending}
          subtitle="Por revisar"
          onClick={() => data.setStatusFilter("pending")}
        />
        <StatCard
          icon={CircleCheck}
          color="success"
          title="Confirmadas"
          value={counts.confirmed}
          subtitle="Próximas o en curso"
          onClick={() => data.setStatusFilter("confirmed")}
        />
        <StatCard
          icon={Flag}
          color="primary"
          title="Completadas"
          value={counts.completed}
          subtitle="Partidos jugados"
          onClick={() => data.setStatusFilter("completed")}
        />
        <StatCard
          icon={XCircle}
          color="danger"
          title="Canceladas"
          value={counts.cancelled}
          subtitle="Rechazadas o canceladas"
          onClick={() => data.setStatusFilter("cancelled")}
        />
      </div>

      <SectionCard padding="p-0">
        <div className="flex flex-col gap-2 border-b border-line p-3 lg:flex-row lg:items-center">
          <TextField
            size="sm"
            type="search"
            leftIcon={<Search />}
            placeholder="Buscar por cliente, cancha o correo"
            aria-label="Buscar reservas"
            value={data.search}
            onChange={(e) => data.setSearch(e.target.value)}
            className="lg:w-64"
          />
          <div className="-mx-1 overflow-x-auto px-1">
            <SegmentedControl
              aria-label="Filtrar por estado"
              size="sm"
              items={FILTERS.map((f) => ({ ...f, count: counts[f.value] }))}
              value={data.statusFilter}
              onChange={data.setStatusFilter}
            />
          </div>
          {data.fieldOptions.length > 2 && (
            <Select
              size="sm"
              aria-label="Filtrar por cancha"
              className="lg:ml-auto lg:w-52"
              value={data.fieldFilter}
              onChange={(e) => data.setFieldFilter(e.target.value)}
              options={data.fieldOptions}
            />
          )}
        </div>
        {error && reservations.length > 0 && (
          <div className="flex gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-[13px] text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {error}
          </div>
        )}
        {body}
        {!loading && filtered.length > 0 && (
          <LoadMoreFooter
            className="border-t border-line px-4 py-3"
            shown={pager.visibleItems.length}
            total={pager.total}
            hasMore={pager.hasMore}
            onLoadMore={pager.loadMore}
          />
        )}
      </SectionCard>

      <Footer />

      <ReservationDetailsModal
        open={Boolean(detailReservation) && !statusChange}
        reservation={detailReservation}
        clientName={detailReservation ? clientNameOf(detailReservation) : ""}
        busy={changing}
        onClose={() => setDetailId(null)}
        onAction={openStatusChange}
        onError={(msg) => showToast(msg, "error")}
      />

      <StatusChangeModal
        open={Boolean(statusReservation)}
        reservation={statusReservation}
        initialStatus={statusChange?.target}
        clientName={statusReservation ? clientNameOf(statusReservation) : ""}
        loading={changing}
        onClose={() => setStatusChange(null)}
        onSubmit={handleStatusSubmit}
      />

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </DashboardLayout>
  );
}

export default AssociateReservations;
