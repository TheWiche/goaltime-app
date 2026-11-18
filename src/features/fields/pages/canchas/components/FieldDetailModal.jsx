import PropTypes from "prop-types";
import { MapPin } from "lucide-react";
import { Button, Modal, StatusPill } from "shared/components/ui";
import { formatCurrency } from "shared/utils/format";
import { getFieldStatusMeta } from "shared/utils/reservationStatus";
import FieldCover from "features/fields/components/FieldCover";

/** Detalle de una cancha (todos los roles). La acción principal depende del rol. */
function FieldDetailModal({ open, field, role, onClose, onReserve, onEdit }) {
  if (!field) return null;
  const isAdmin = role === "admin";
  const isClient = role === "cliente";
  const status = getFieldStatusMeta(field.status);
  const price = Number(field.pricePerHour);

  const rows = [
    ["Precio por hora", Number.isFinite(price) && price > 0 ? formatCurrency(price) : "—"],
    [
      "Horario",
      field.openingTime && field.closingTime ? `${field.openingTime} – ${field.closingTime}` : "—",
    ],
    ["Dirección", field.address || "—"],
    field.city ? ["Ciudad", field.city] : null,
    field.phone ? ["Teléfono", field.phone] : null,
  ].filter(Boolean);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={field.name || "Cancha"}
      subtitle={field.address}
      icon={<MapPin className="h-4 w-4" aria-hidden />}
      bodyClassName="space-y-5"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
          {isAdmin && (
            <Button type="button" onClick={() => onEdit?.(field)}>
              Editar cancha
            </Button>
          )}
          {isClient && (
            <Button type="button" variant="cta" onClick={() => onReserve?.(field)}>
              Reservar
            </Button>
          )}
        </>
      }
    >
      <FieldCover src={field.imageUrl} alt={field.name || "Cancha"} className="rounded-md border border-line" />

      {isAdmin && (
        <div className="flex items-center gap-2 text-[13px] text-fg-muted">
          Estado
          <StatusPill tone={status.tone} size="sm" dot>
            {status.label}
          </StatusPill>
        </div>
      )}

      <dl className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2 text-sm sm:grid-cols-[140px_1fr]">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-fg-muted">{label}</dt>
            <dd className="tabular min-w-0 break-words text-fg">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="border-t border-line pt-4">
        <h3 className="text-sm font-semibold text-fg-strong">Descripción</h3>
        <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-fg-muted">
          {field.description?.trim() || "Esta cancha aún no tiene descripción."}
        </p>
      </section>
    </Modal>
  );
}

FieldDetailModal.propTypes = {
  open: PropTypes.bool.isRequired,
  field: PropTypes.object,
  role: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onReserve: PropTypes.func,
  onEdit: PropTypes.func,
};

export default FieldDetailModal;
