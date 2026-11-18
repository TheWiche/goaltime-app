import { forwardRef } from "react";
import PropTypes from "prop-types";
import { Banknote, Clock, Heart, MapPin, Pencil } from "lucide-react";
import { Button, IconButton, StatusPill, cx } from "shared/components/ui";
import { formatCurrency } from "shared/utils/format";
import { getFieldStatusMeta } from "shared/utils/reservationStatus";
import FieldCover from "features/fields/components/FieldCover";

export { FieldCover };

const FieldCard = forwardRef(function FieldCard(
  {
    field,
    role,
    isFavorite = false,
    favoriteBusy = false,
    isOwn = false,
    highlighted = false,
    actionsDisabled = false,
    onOpen,
    onReserve,
    onToggleFavorite,
    onEdit,
    onApprove,
    onReject,
  },
  ref
) {
  const isAdmin = role === "admin";
  const isClient = role === "cliente";
  const status = getFieldStatusMeta(field.status);
  const price = Number(field.pricePerHour);

  return (
    <article
      ref={ref}
      data-field-id={field.id}
      className={cx(
        "flex flex-col overflow-hidden rounded-lg border bg-white transition-colors duration-150",
        highlighted ? "border-primary-500 ring-2 ring-primary-500/30" : "border-line hover:border-line-strong"
      )}
    >
      <div className="relative border-b border-line">
        <FieldCover src={field.imageUrl} alt={field.name || "Cancha"} />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5">
          {isAdmin ? (
            <StatusPill tone={status.tone} size="sm" dot>
              {status.label}
            </StatusPill>
          ) : isOwn ? (
            <StatusPill tone="info" size="sm">
              Tu cancha
            </StatusPill>
          ) : (
            <span />
          )}
          {isAdmin && (
            <IconButton label={`Editar ${field.name || "cancha"}`} variant="secondary" onClick={() => onEdit?.(field)}>
              <Pencil />
            </IconButton>
          )}
          {isClient && (
            <IconButton
              label={isFavorite ? "Quitar de favoritas" : "Agregar a favoritas"}
              variant="secondary"
              aria-pressed={isFavorite}
              disabled={favoriteBusy}
              onClick={() => onToggleFavorite?.(field.id)}
            >
              <Heart className={isFavorite ? "fill-red-500 text-red-500" : undefined} />
            </IconButton>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-fg-strong" title={field.name}>
            {field.name || "Sin nombre"}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-fg-muted">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-fg-subtle" aria-hidden />
            <span className="truncate">{field.address || "Sin dirección"}</span>
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-2 border-t border-line-subtle pt-3 text-[13px]">
          <div className="min-w-0">
            <dt className="flex items-center gap-1 text-xs text-fg-subtle">
              <Banknote className="h-3.5 w-3.5" aria-hidden />
              Por hora
            </dt>
            <dd className="tabular mt-0.5 font-medium text-fg-strong">
              {Number.isFinite(price) && price > 0 ? formatCurrency(price) : "—"}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="flex items-center gap-1 text-xs text-fg-subtle">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              Horario
            </dt>
            <dd className="tabular mt-0.5 font-medium text-fg-strong">
              {field.openingTime && field.closingTime ? `${field.openingTime} – ${field.closingTime}` : "—"}
            </dd>
          </div>
        </dl>

        <div className="mt-auto flex gap-2 pt-1">
          {isAdmin && field.status === "pending" ? (
            <>
              <Button type="button" size="sm" variant="secondary" fullWidth disabled={actionsDisabled} onClick={() => onReject?.(field)}>
                Rechazar
              </Button>
              <Button type="button" size="sm" fullWidth disabled={actionsDisabled} onClick={() => onApprove?.(field)}>
                Aprobar
              </Button>
            </>
          ) : (
            <>
              <Button type="button" size="sm" variant="secondary" fullWidth onClick={() => onOpen?.(field)}>
                Ver detalles
              </Button>
              {isClient && (
                <Button type="button" size="sm" fullWidth onClick={() => onReserve?.(field)}>
                  Reservar
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
});

FieldCard.propTypes = {
  field: PropTypes.object.isRequired,
  role: PropTypes.string,
  isFavorite: PropTypes.bool,
  favoriteBusy: PropTypes.bool,
  isOwn: PropTypes.bool,
  highlighted: PropTypes.bool,
  actionsDisabled: PropTypes.bool,
  onOpen: PropTypes.func,
  onReserve: PropTypes.func,
  onToggleFavorite: PropTypes.func,
  onEdit: PropTypes.func,
  onApprove: PropTypes.func,
  onReject: PropTypes.func,
};

export default FieldCard;
