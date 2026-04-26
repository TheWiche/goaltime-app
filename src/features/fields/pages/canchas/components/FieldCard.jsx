import { forwardRef } from "react";
import { Badge, Button, GlassCard } from "shared/components/ui";
import { useCardTilt, useMagneticButton } from "shared/hooks/useGSAPAnimations";
import { 
  LocationOn, 
  AttachMoney, 
  AccessTime, 
  Edit, 
  Favorite, 
  FavoriteBorder,
  PhotoCamera 
} from "@mui/icons-material";

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
    const cardRef = useCardTilt();
    const reserveButtonRef = useMagneticButton(0.2);

    return (
      <GlassCard
        ref={(el) => {
          // Asignar ambos refs
          cardRef.current = el;
          if (externalRef && typeof externalRef === "function") {
            externalRef(el);
          }
        }}
        className="field-card overflow-hidden"
        style={{ willChange: "transform" }}
      >
        {/* Imagen */}
        <div className="relative">
          {field.imageUrl ? (
            <img src={field.imageUrl} alt={field.name} className="w-full h-48 object-cover" />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
              <PhotoCamera className="w-16 h-16 text-primary/40" />
            </div>
          )}

          {/* Badge de estado (admin) */}
          {userProfile?.role === "admin" && (
            <div className="absolute top-3 right-3">
              <Badge variant={statusMap[field.status]?.variant ?? "gray"} dot>
                {statusMap[field.status]?.label ?? field.status}
              </Badge>
            </div>
          )}

          {/* Botón editar (admin) */}
          {userProfile?.role === "admin" && (
            <button
              onClick={() => onEdit(field)}
              className="absolute top-3 left-3 backdrop-blur-glass bg-white/80 p-2 rounded-lg shadow-md hover:bg-white hover:shadow-lg transition-all duration-200"
            >
              <Edit className="w-4 h-4 text-primary" />
            </button>
          )}

          {/* Favorito (cliente) */}
          {userProfile?.role === "cliente" && (
            <button
              onClick={(e) => onToggleFavorite(field.id, e)}
              disabled={togglingFavorite === field.id}
              className="absolute top-3 right-3 backdrop-blur-glass bg-white/80 p-2 rounded-lg shadow-md hover:bg-white hover:shadow-lg transition-all duration-200"
              title={
                favoriteIds.includes(field.id) ? "Quitar de favoritos" : "Agregar a favoritos"
              }
            >
              {favoriteIds.includes(field.id) ? (
                <Favorite className="w-4 h-4 text-red-500" />
              ) : (
                <FavoriteBorder className="w-4 h-4 text-surface-400" />
              )}
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-5">
          <h3 className="font-bold font-heading text-primary-900 text-xl mb-3 leading-tight">
            {field.name || "Nombre no disponible"}
          </h3>

          <div className="space-y-2 mb-5">
            {field.address && (
              <div className="flex items-center gap-2 text-sm text-surface-500">
                <LocationOn className="w-4 h-4 flex-shrink-0 text-primary" />
                <span className="truncate">{field.address}</span>
              </div>
            )}
            {field.pricePerHour && (
              <div className="flex items-center gap-2 text-sm font-semibold text-primary-900">
                <AttachMoney className="w-4 h-4 flex-shrink-0 text-cta" />
                ${field.pricePerHour} / hora
              </div>
            )}
            {field.openingTime && field.closingTime && (
              <div className="flex items-center gap-2 text-sm text-surface-500">
                <AccessTime className="w-4 h-4 flex-shrink-0 text-primary" />
                {field.openingTime} - {field.closingTime}
              </div>
            )}
          </div>

          {/* Acciones según rol */}
          {userProfile?.role === "admin" && field.status === "pending" ? (
            <div className="flex gap-2">
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
            <div ref={reserveButtonRef}>
              <Button
                variant={userProfile?.role === "cliente" ? "primary" : "secondary"}
                size="md"
                fullWidth
                disabled={userProfile?.role !== "cliente"}
                onClick={() => onAction(field, "reserve")}
              >
                {userProfile?.role === "cliente"
                  ? "Reservar Ahora"
                  : userProfile?.role === "admin"
                  ? "Ver Detalles"
                  : "Ver Disponibilidad"}
              </Button>
            </div>
          )}
        </div>
      </GlassCard>
    );
  }
);

FieldCard.displayName = "FieldCard";

export default FieldCard;
