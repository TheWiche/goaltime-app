import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { ArrowRight, Pencil } from "lucide-react";
import { Button, FieldShell, Modal, SegmentedControl, StatusPill, Textarea } from "shared/components/ui";
import { formatDateEs } from "shared/utils/date";
import { getAllowedTransitions, getStatusMeta } from "shared/utils/reservationStatus";

/** Texto de la acción para pasar de `from` a `to` (desde la vista del dueño). */
export const getActionLabel = (from, to) => {
  if (to === "confirmed") return "Confirmar";
  if (to === "completed") return "Completar";
  if (to === "cancelled") return from === "pending" ? "Rechazar" : "Cancelar";
  return getStatusMeta(to).label;
};

const MIN_REASON = 5;

/**
 * Cambio de estado con transiciones válidas (utils/reservationStatus).
 * Motivo obligatorio al rechazar/cancelar; opcional en el resto.
 */
function StatusChangeModal({ open, reservation, initialStatus, clientName, loading, onClose, onSubmit }) {
  const allowed = reservation ? getAllowedTransitions(reservation.status) : [];
  const [target, setTarget] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const reservationId = reservation?.id;
  const currentStatus = reservation?.status;

  // Se reinicia al abrir o si la reserva cambia de estado (no en cada snapshot).
  useEffect(() => {
    if (!open || !reservationId) return;
    const options = getAllowedTransitions(currentStatus);
    setTarget(options.includes(initialStatus) ? initialStatus : options[0] || "");
    setReason("");
    setSubmitted(false);
  }, [open, reservationId, currentStatus, initialStatus]);

  if (!reservation) return null;

  const current = getStatusMeta(reservation.status);
  const next = target ? getStatusMeta(target) : null;
  const reasonRequired = target === "cancelled";
  const reasonError =
    submitted && reasonRequired && reason.trim().length < MIN_REASON
      ? `Explica el motivo al cliente (mínimo ${MIN_REASON} caracteres).`
      : "";

  const handleSubmit = (event) => {
    event.preventDefault();
    if (loading || !target) return;
    setSubmitted(true);
    if (reasonRequired && reason.trim().length < MIN_REASON) return;
    onSubmit(target, reason.trim());
  };

  const destructive = target === "cancelled";

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      size="md"
      title="Cambiar estado"
      subtitle="El cliente recibirá una notificación y un correo con el cambio."
      icon={<Pencil className="h-4 w-4" aria-hidden />}
      bodyClassName="space-y-5"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Volver
          </Button>
          {allowed.length > 0 && (
            <Button
              type="submit"
              form="status-change-form"
              variant={destructive ? "danger" : "primary"}
              loading={loading}
              disabled={!target}
            >
              {target ? getActionLabel(reservation.status, target) : "Guardar"}
            </Button>
          )}
        </>
      }
    >
      <dl className="grid grid-cols-[96px_1fr] gap-x-4 gap-y-1.5 rounded-lg border border-line p-4 text-[13px]">
        <dt className="text-fg-muted">Cliente</dt>
        <dd className="truncate font-medium text-fg">{clientName}</dd>
        <dt className="text-fg-muted">Cancha</dt>
        <dd className="truncate text-fg">{reservation.fieldName || "—"}</dd>
        <dt className="text-fg-muted">Fecha</dt>
        <dd className="tabular text-fg first-letter:uppercase">
          {formatDateEs(reservation.date, { weekday: "short", day: "numeric", month: "short", year: "numeric" })} ·{" "}
          {reservation.startTime}–{reservation.endTime}
        </dd>
      </dl>

      {allowed.length === 0 ? (
        <p className="text-sm text-fg-muted">
          Esta reserva está <strong className="font-medium text-fg">{current.label.toLowerCase()}</strong>: es un
          estado final y no admite más cambios.
        </p>
      ) : (
        <form id="status-change-form" onSubmit={handleSubmit} noValidate className="space-y-4">
          <FieldShell id="status-change-target" label="Nuevo estado">
            <div className="flex flex-wrap items-center gap-3">
              <SegmentedControl
                aria-label="Nuevo estado"
                size="sm"
                items={allowed.map((s) => ({ value: s, label: getActionLabel(reservation.status, s) }))}
                value={target}
                onChange={(v) => {
                  setTarget(v);
                  setSubmitted(false);
                }}
              />
              <span className="flex items-center gap-1.5 text-xs text-fg-subtle">
                <StatusPill tone={current.tone} size="sm">
                  {current.label}
                </StatusPill>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                {next && (
                  <StatusPill tone={next.tone} size="sm">
                    {next.label}
                  </StatusPill>
                )}
              </span>
            </div>
          </FieldShell>

          <Textarea
            id="status-change-reason"
            label={reasonRequired ? "Motivo" : "Mensaje para el cliente"}
            required={reasonRequired}
            optional={!reasonRequired}
            rows={3}
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={reasonError}
            hint={reasonRequired ? "Se enviará al cliente por correo." : undefined}
            placeholder={
              reasonRequired ? "Ej. La cancha estará en mantenimiento ese día." : "Ej. ¡Te esperamos 10 minutos antes!"
            }
            disabled={loading}
          />
        </form>
      )}
    </Modal>
  );
}

StatusChangeModal.propTypes = {
  open: PropTypes.bool.isRequired,
  reservation: PropTypes.object,
  initialStatus: PropTypes.string,
  clientName: PropTypes.string,
  loading: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default StatusChangeModal;
