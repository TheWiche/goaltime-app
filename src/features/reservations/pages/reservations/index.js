import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CalendarOff, CircleCheck, Flag, Hourglass, Lock, Plus, Search, XCircle } from "lucide-react";
import { ConfirmationDialog, DashboardLayout, DashboardNavbar, Footer } from "shared/components/layout";
import {
  Button,
  EmptyState,
  PageHeader,
  SectionCard,
  SegmentedControl,
  LoadMoreFooter,
  Skeleton,
  StatCard,
  Textarea,
  TextField,
  Toast,
} from "shared/components/ui";
import { useAuth } from "shared/context/AuthContext";
import {
  cancelReservation,
  notifyReservationCancelledByClient,
  subscribeToClientReservations,
} from "shared/services/firebaseService";
import { formatDateEs } from "shared/utils/date";
import useDebounce from "shared/hooks/useDebounce";
import { canClientCancelReservation, getStatusOptions } from "shared/utils/reservationStatus";
import useLoadMore from "shared/hooks/useLoadMore";
import ClientReservationsTable from "./components/ClientReservationsTable";
import TicketModal from "./components/TicketModal";

const FILTERS = getStatusOptions({ includeAll: true, allLabel: "Todas" });

const normalize = (v) =>
  String(v || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

function ListSkeleton() {
  return (
    <div className="divide-y divide-line-subtle" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-44" />
            <Skeleton className="h-3 w-64 max-w-full" />
          </div>
          <Skeleton className="hidden h-3 w-20 sm:block" />
          <Skeleton className="h-5 w-20" />
        </div>
      ))}
    </div>
  );
}

function Reservations() {
  const { userProfile, currentUser } = useAuth();
  const navigate = useNavigate();
  const uid = currentUser?.uid;
  const isClient = userProfile?.role === "cliente";

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [toast, setToast] = useState({ open: false, type: "info", message: "" });

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  // Reloj para ocultar "Cancelar reserva" cuando la reserva ya comenzó, sin recargar.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  const showToast = useCallback((message, type = "info") => setToast({ open: true, type, message }), []);

  // Un único listener (where clientId == uid, orden en cliente: no requiere índice).
  useEffect(() => {
    if (!uid || !isClient) {
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    setLoadError("");
    const unsubscribe = subscribeToClientReservations(
      uid,
      (list) => {
        setReservations(list);
        setLoading(false);
      },
      {
        onError: (error) => setLoadError(error?.message || "No se pudieron cargar tus reservaciones."),
      }
    );
    return () => unsubscribe();
  }, [uid, isClient]);

  const counts = useMemo(() => {
    const c = { all: reservations.length, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    reservations.forEach((r) => {
      if (c[r.status] !== undefined) c[r.status] += 1;
    });
    return c;
  }, [reservations]);

  const filtered = useMemo(() => {
    const q = normalize(debouncedSearch).trim();
    return reservations.filter(
      (r) =>
        (statusFilter === "all" || r.status === statusFilter) &&
        (!q || normalize(r.fieldName).includes(q) || normalize(r.fieldAddress).includes(q))
    );
  }, [reservations, statusFilter, debouncedSearch]);

  const pager = useLoadMore(filtered, { resetKey: `${statusFilter}|${debouncedSearch}` });

  // Se busca por id para que el ticket refleje cambios en tiempo real (p.ej. confirmación).
  const selectedReservation = useMemo(
    () => (selectedId ? reservations.find((r) => r.id === selectedId) || null : null),
    [selectedId, reservations]
  );

  const requestCancel = (reservation) => {
    setCancelReason("");
    setSelectedId(null);
    setCancelTarget(reservation);
  };

  const closeCancel = () => setCancelTarget(null);

  // ConfirmationDialog bloquea el doble clic mientras esta promesa está pendiente.
  const confirmCancel = async () => {
    const target = cancelTarget;
    if (!target) return;
    if (!canClientCancelReservation(target)) {
      showToast("Esta reserva ya no se puede cancelar porque ya comenzó.", "warning");
      closeCancel();
      return;
    }
    const reason = cancelReason.trim();
    try {
      const { reservation } = await cancelReservation(target.id, reason);
      closeCancel();
      showToast("Reserva cancelada. Las franjas quedaron libres.", "success");
      const ownerId = reservation?.ownerId || target.ownerId;
      if (ownerId) {
        await notifyReservationCancelledByClient(
          target.id,
          target.fieldName || "tu cancha",
          ownerId,
          userProfile?.name || target.clientName,
          reason
        );
      }
    } catch (error) {
      showToast(error?.message || "No se pudo cancelar la reserva.", "error");
    }
  };

  if (userProfile && !isClient) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <EmptyState
          icon={Lock}
          title="Acceso restringido"
          description="Esta página está disponible solo para clientes."
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

  let body;
  if (loading) body = <ListSkeleton />;
  else if (loadError && reservations.length === 0) {
    body = (
      <EmptyState bordered={false} icon={AlertTriangle} title="No pudimos cargar tus reservaciones" description={loadError} />
    );
  } else if (reservations.length === 0) {
    body = (
      <EmptyState
        bordered={false}
        icon={CalendarOff}
        title="Aún no tienes reservaciones"
        description="Reserva una cancha y aparecerá aquí con su ticket."
        action={
          <Button type="button" size="sm" onClick={() => navigate("/canchas")}>
            Ver canchas
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
        description="Ninguna reservación coincide con los filtros."
        action={
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}
          >
            Limpiar filtros
          </Button>
        }
      />
    );
  } else {
    body = (
      <ClientReservationsTable
        reservations={pager.visibleItems}
        onOpen={(r) => setSelectedId(r.id)}
        onCancel={requestCancel}
        now={now}
      />
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <PageHeader
        title="Mis reservaciones"
        subtitle="Consulta el estado de tus reservas y descarga sus tickets."
        actions={
          <Button type="button" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate("/canchas")}>
            Nueva reserva
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Hourglass} color="warning" title="Pendientes" value={counts.pending} subtitle="Esperando al dueño" />
        <StatCard icon={CircleCheck} color="success" title="Confirmadas" value={counts.confirmed} subtitle="Listas para jugar" />
        <StatCard icon={Flag} color="primary" title="Completadas" value={counts.completed} subtitle="Partidos jugados" />
        <StatCard icon={XCircle} color="danger" title="Canceladas" value={counts.cancelled} subtitle="No realizadas" />
      </div>

      <SectionCard padding="p-0">
        <div className="flex flex-col gap-2 border-b border-line p-3 md:flex-row md:items-center">
          <TextField
            size="sm"
            type="search"
            leftIcon={<Search />}
            placeholder="Buscar por cancha o dirección"
            aria-label="Buscar reservaciones"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:w-64"
          />
          <div className="-mx-1 overflow-x-auto px-1">
            <SegmentedControl
              aria-label="Filtrar por estado"
              size="sm"
              items={FILTERS.map((f) => ({ ...f, count: counts[f.value] }))}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
        </div>
        {loadError && reservations.length > 0 && (
          <div className="flex gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-[13px] text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {loadError}
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

      <TicketModal
        open={Boolean(selectedReservation)}
        onClose={() => setSelectedId(null)}
        reservation={selectedReservation}
        userProfile={userProfile}
        onNotify={showToast}
        onCancel={requestCancel}
        now={now}
      />

      <ConfirmationDialog
        open={Boolean(cancelTarget)}
        onClose={closeCancel}
        onConfirm={confirmCancel}
        title="¿Cancelar reserva?"
        message={
          cancelTarget
            ? `Vas a cancelar tu reserva en ${cancelTarget.fieldName || "la cancha"} el ${formatDateEs(cancelTarget.date, { day: "numeric", month: "long", year: "numeric" }, cancelTarget.date)} de ${cancelTarget.startTime} a ${cancelTarget.endTime}. Las franjas quedarán libres y esta acción no se puede deshacer.`
            : ""
        }
        confirmColor="error"
        confirmLabel="Cancelar reserva"
        cancelLabel="Volver"
      >
        <Textarea
          id="client-cancel-reason"
          label="Motivo"
          optional
          rows={3}
          maxLength={500}
          className="mt-3"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Ej. Ya no podré asistir."
        />
      </ConfirmationDialog>

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </DashboardLayout>
  );
}

export default Reservations;
