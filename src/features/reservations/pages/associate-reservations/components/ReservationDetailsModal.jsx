import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { CalendarDays } from "lucide-react";
import { Avatar, Button, Modal, Skeleton, StatusPill } from "shared/components/ui";
import { getUserProfileById } from "shared/services/firebaseService";
import { formatDateEs, formatDateTimeEs } from "shared/utils/date";
import { formatCurrency, formatReservationCode } from "shared/utils/format";
import { getAllowedTransitions, getStatusMeta } from "shared/utils/reservationStatus";
import { getActionLabel } from "./StatusChangeModal";

function ClientBlock({ state, fallbackName }) {
  if (state.loading) {
    return (
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-3 w-52" />
        </div>
      </div>
    );
  }
  const profile = state.profile;
  return (
    <div className="flex items-center gap-3">
      <Avatar src={profile?.photoURL} name={profile?.name || fallbackName} size="md" />
      <div className="min-w-0 text-[13px]">
        <p className="truncate text-sm font-medium text-fg-strong">{profile?.name || fallbackName}</p>
        {profile?.email ? (
          <a href={`mailto:${profile.email}`} className="block truncate text-primary-600 hover:underline">
            {profile.email}
          </a>
        ) : (
          <p className="text-fg-subtle">{state.failed ? "No se pudo cargar el contacto." : "Sin correo"}</p>
        )}
        {profile?.phone && (
          <a href={`tel:${profile.phone}`} className="block truncate text-fg-muted hover:text-fg">
            {profile.phone}
          </a>
        )}
      </div>
    </div>
  );
}

ClientBlock.propTypes = {
  state: PropTypes.shape({ loading: PropTypes.bool, failed: PropTypes.bool, profile: PropTypes.object }).isRequired,
  fallbackName: PropTypes.string,
};

/**
 * Detalle de una reserva. La info del cliente se limpia al abrir y se carga de nuevo
 * (ignorando respuestas de una reserva anterior); si falla se avisa vía onError.
 */
function ReservationDetailsModal({ open, reservation, clientName, busy, onClose, onAction, onError }) {
  const [client, setClient] = useState({ loading: false, failed: false, profile: null });
  const clientId = reservation?.clientId;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    if (!open) return undefined;
    setClient({ loading: Boolean(clientId), failed: false, profile: null });
    if (!clientId) return undefined;
    let cancelled = false;
    getUserProfileById(clientId)
      .then((profile) => {
        if (cancelled) return;
        if (!profile) {
          setClient({ loading: false, failed: true, profile: null });
          onErrorRef.current?.("No se pudo cargar la información del cliente.");
        } else {
          setClient({ loading: false, failed: false, profile });
        }
      })
      .catch(() => {
        if (cancelled) return;
        setClient({ loading: false, failed: true, profile: null });
        onErrorRef.current?.("No se pudo cargar la información del cliente.");
      });
    return () => {
      cancelled = true;
    };
  }, [open, clientId]);

  if (!reservation) return null;

  const status = getStatusMeta(reservation.status);
  const actions = getAllowedTransitions(reservation.status);

  const rows = [
    ["Código", formatReservationCode(reservation.id)],
    ["Cancha", reservation.fieldName || "—"],
    ["Dirección", reservation.fieldAddress || "—"],
    ["Fecha", formatDateEs(reservation.date, { weekday: "long", year: "numeric", month: "long", day: "numeric" })],
    ["Horario", `${reservation.startTime || "—"} – ${reservation.endTime || "—"}`],
    ["Total", formatCurrency(reservation.totalPrice)],
    ["Creada", formatDateTimeEs(reservation.createdAt)],
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Detalle de la reserva"
      subtitle={reservation.fieldName}
      icon={<CalendarDays className="h-4 w-4" aria-hidden />}
      bodyClassName="space-y-5"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
          {actions.map((to) => (
            <Button
              key={to}
              type="button"
              variant={to === "cancelled" ? "secondary" : "primary"}
              disabled={busy}
              onClick={() => onAction(reservation, to)}
            >
              {getActionLabel(reservation.status, to)}
            </Button>
          ))}
        </>
      }
    >
      <section className="flex flex-col gap-3 rounded-lg border border-line p-4 sm:flex-row sm:items-center sm:justify-between">
        <ClientBlock state={client} fallbackName={clientName} />
        <StatusPill tone={status.tone} dot>
          {status.label}
        </StatusPill>
      </section>

      <dl className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-2 text-sm sm:grid-cols-[140px_1fr]">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-fg-muted">{label}</dt>
            <dd className="tabular min-w-0 break-words text-fg first-letter:uppercase">{value}</dd>
          </div>
        ))}
      </dl>

      {reservation.notes && (
        <section className="border-t border-line pt-4">
          <h3 className="text-sm font-semibold text-fg-strong">Notas del cliente</h3>
          <p className="mt-1 whitespace-pre-line text-sm text-fg-muted">{reservation.notes}</p>
        </section>
      )}
      {reservation.statusChangeReason && (
        <section className="border-t border-line pt-4">
          <h3 className="text-sm font-semibold text-fg-strong">Último cambio de estado</h3>
          <p className="mt-1 text-sm text-fg-muted">
            {reservation.statusChangeReason}
            {reservation.statusChangedAt && (
              <span className="text-fg-subtle"> · {formatDateTimeEs(reservation.statusChangedAt)}</span>
            )}
          </p>
        </section>
      )}
    </Modal>
  );
}

ReservationDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  reservation: PropTypes.object,
  clientName: PropTypes.string,
  busy: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onAction: PropTypes.func.isRequired,
  onError: PropTypes.func,
};

export default ReservationDetailsModal;
