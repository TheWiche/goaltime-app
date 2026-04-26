import { forwardRef } from "react";
import PropTypes from "prop-types";
import { Button, StatusPill } from "shared/components/ui";
import { MapPin, Banknote, Clock, Pencil, Heart, Trophy } from "lucide-react";

const STATUS_TONES = {
  approved: "success",
  pending: "warning",
  rejected: "danger",
  disabled: "neutral",
};

const FieldCard = forwardRef(
  (
    {
      field,
      userProfile,
      favoriteIds,
      togglingFavorite,
      statusMap,
      onEdit,
      onToggleFavorite,
      onAction,
      loadingAction,
    },
    externalRef
  ) => {
    const isAdmin = userProfile?.role === "admin";
    const isClient = userProfile?.role === "cliente";
    const isFav = favoriteIds?.includes(field.id);

    return (
      <article
        ref={externalRef}
        className="field-card group relative flex flex-col overflow-hidden rounded-xl bg-white border border-slate-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30"
      >
        <div className="relative aspect-[16/9] bg-gradient-to-br from-primary-50 to-secondary/15">
          {field.imageUrl ? (
            <img
              src={field.imageUrl}
              alt={field.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-primary/40">
              <Trophy className="h-16 w-16" strokeWidth={1.25} aria-hidden />
            </div>
          )}

          <div className="absolute inset-x-0 top-0 p-3 flex items-start justify-between gap-2">
            {isAdmin ? (
              <button
                type="button"
                onClick={() => onEdit(field)}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/95 backdrop-blur-sm text-primary shadow-sm transition-all duration-200 hover:bg-white hover:shadow-md focus:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30"
                aria-label="Editar cancha"
              >
                <Pencil className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
              </button>
            ) : (
              <span />
            )}

            {isAdmin && (
              <StatusPill tone={STATUS_TONES[field.status] || "neutral"} size="sm">
                {statusMap?.[field.status]?.label ?? field.status}
              </StatusPill>
            )}

            {isClient && (
              <button
                type="button"
                onClick={(e) => onToggleFavorite(field.id, e)}
                disabled={togglingFavorite === field.id}
                className={[
                  "inline-flex items-center justify-center w-9 h-9 rounded-lg shadow-sm transition-all duration-200",
                  "bg-white/95 backdrop-blur-sm hover:bg-white hover:shadow-md",
                  "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30",
                  togglingFavorite === field.id ? "opacity-60 cursor-wait" : "",
                ].join(" ")}
                aria-label={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
              >
                {isFav ? (
                  <Heart className="h-[18px] w-[18px] fill-rose-500 text-rose-500" strokeWidth={2} aria-hidden />
                ) : (
                  <Heart className="h-[18px] w-[18px] text-slate-500" strokeWidth={2} aria-hidden />
                )}
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col p-5">
          <h3 className="font-semibold font-heading text-slate-900 text-lg leading-tight mb-3 line-clamp-1">
            {field.name || "Sin nombre"}
          </h3>

          <div className="space-y-2 mb-5 text-sm text-slate-600">
            {field.address && (
              <div className="flex items-center gap-2 truncate">
                <MapPin className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} aria-hidden />
                <span className="truncate">{field.address}</span>
              </div>
            )}
            {field.pricePerHour && (
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <Banknote className="h-4 w-4 shrink-0 text-cta-600" strokeWidth={2} aria-hidden />
                <span>${field.pricePerHour}</span>
                <span className="text-xs font-normal text-slate-500">/ hora</span>
              </div>
            )}
            {field.openingTime && field.closingTime && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} aria-hidden />
                <span>
                  {field.openingTime} - {field.closingTime}
                </span>
              </div>
            )}
          </div>

          <div className="mt-auto">
            {isAdmin && field.status === "pending" ? (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  disabled={loadingAction}
                  onClick={() => onAction(field, "approve")}
                >
                  Aprobar
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  fullWidth
                  disabled={loadingAction}
                  onClick={() => onAction(field, "reject")}
                >
                  Rechazar
                </Button>
              </div>
            ) : (
              <Button
                variant={isClient ? "primary" : "secondary"}
                size="md"
                fullWidth
                disabled={!isClient}
                onClick={() => onAction(field, "reserve")}
              >
                {isClient
                  ? "Reservar ahora"
                  : isAdmin
                  ? "Ver detalles"
                  : "Ver disponibilidad"}
              </Button>
            )}
          </div>
        </div>
      </article>
    );
  }
);

FieldCard.displayName = "FieldCard";

FieldCard.propTypes = {
  field: PropTypes.object.isRequired,
  userProfile: PropTypes.object,
  favoriteIds: PropTypes.array,
  togglingFavorite: PropTypes.string,
  statusMap: PropTypes.object,
  onEdit: PropTypes.func,
  onToggleFavorite: PropTypes.func,
  onAction: PropTypes.func.isRequired,
  loadingAction: PropTypes.bool,
};

export default FieldCard;
