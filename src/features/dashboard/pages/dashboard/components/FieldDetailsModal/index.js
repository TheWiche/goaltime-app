import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import {
  Close,
  SportsSoccer,
  LocationOn,
  AttachMoney,
  Schedule,
  CalendarToday,
  Edit,
  CheckCircle,
  HourglassEmpty,
  Block,
  Cancel,
} from "@mui/icons-material";
import { GlassCard } from "shared/components/ui";
import { Button } from "shared/components/ui";

function FieldDetailsModal({ open, onClose, field }) {
  const navigate = useNavigate();
  if (!field) return null;

  const getStatusConfig = (status) => {
    const configs = {
      approved: {
        icon: CheckCircle,
        label: "Aprobada",
        color: "#16a34a",
        bgColor: "#dcfce7",
      },
      pending: {
        icon: HourglassEmpty,
        label: "Pendiente",
        color: "#ea580c",
        bgColor: "#fed7aa",
      },
      disabled: {
        icon: Block,
        label: "Deshabilitada",
        color: "#dc2626",
        bgColor: "#fee2e2",
      },
      rejected: {
        icon: Cancel,
        label: "Rechazada",
        color: "#dc2626",
        bgColor: "#fee2e2",
      },
    };
    return configs[status] || configs.pending;
  };

  const statusConfig = getStatusConfig(field.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <div className="relative bg-gradient-to-br from-primary to-primary-600 p-6 pb-20">
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            color: "white",
            bgcolor: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(8px)",
            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" },
          }}
        >
          <Close />
        </IconButton>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <SportsSoccer sx={{ fontSize: 28, color: "white" }} />
          </div>
          <h2 className="text-2xl font-bold font-heading text-white">Detalles de la Cancha</h2>
        </div>

        {/* Estado Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 backdrop-blur-sm shadow-lg"
          style={{ border: `2px solid ${statusConfig.color}` }}
        >
          <StatusIcon sx={{ fontSize: 20, color: statusConfig.color }} />
          <span className="font-bold text-sm" style={{ color: statusConfig.color }}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      <DialogContent sx={{ p: 0 }}>
        <div className="px-6 py-6 -mt-10">
          {/* Imagen */}
          {field.imageUrl && (
            <div className="mb-6">
              <img
                src={field.imageUrl}
                alt={field.name}
                className="w-full h-72 object-cover rounded-2xl shadow-lg"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Información General */}
            <GlassCard className="p-5" hover={false}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <SportsSoccer sx={{ fontSize: 20, color: "#1E3A8A" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-surface-500 mb-1">Nombre de la Cancha</p>
                  <p className="font-bold font-heading text-primary-900 text-lg truncate">
                    {field.name || "No especificado"}
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-5" hover={false}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <AttachMoney sx={{ fontSize: 20, color: "#16a34a" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-surface-500 mb-1">Precio por Hora</p>
                  <p className="font-bold font-heading text-green-600 text-xl">
                    ${field.pricePerHour?.toLocaleString() || "0"}
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-5" hover={false}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Schedule sx={{ fontSize: 20, color: "#3B82F6" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-surface-500 mb-1">Hora de Apertura</p>
                  <p className="font-bold text-primary-900 text-lg">
                    {field.openingTime || "No especificada"}
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-5" hover={false}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Schedule sx={{ fontSize: 20, color: "#3B82F6" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-surface-500 mb-1">Hora de Cierre</p>
                  <p className="font-bold text-primary-900 text-lg">
                    {field.closingTime || "No especificada"}
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Dirección */}
          <GlassCard className="p-5 mb-6" hover={false}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <LocationOn sx={{ fontSize: 20, color: "#dc2626" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-surface-500 mb-1">Dirección</p>
                <p className="text-sm text-gray-700">{field.address || "No especificada"}</p>
              </div>
            </div>
          </GlassCard>

          {/* Descripción */}
          {field.description && (
            <GlassCard className="p-5 mb-6" hover={false}>
              <p className="text-xs font-medium text-surface-500 mb-2">Descripción</p>
              <p className="text-sm text-gray-700">{field.description}</p>
            </GlassCard>
          )}

          {/* Fecha de Registro */}
          {field.createdAt && (
            <div className="flex items-center gap-2 text-sm text-surface-500">
              <CalendarToday sx={{ fontSize: 16 }} />
              <span>
                Registrada el{" "}
                {field.createdAt?.seconds
                  ? new Date(field.createdAt.seconds * 1000).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "fecha no disponible"}
              </span>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            <Close sx={{ fontSize: 18, mr: 0.5 }} />
            Cerrar
          </Button>
          <Button variant="primary" onClick={() => navigate(`/canchas?edit=${field.id}`)}>
            <Edit sx={{ fontSize: 18, mr: 0.5 }} />
            Gestionar Cancha
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

FieldDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  field: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    address: PropTypes.string,
    description: PropTypes.string,
    pricePerHour: PropTypes.number,
    openingTime: PropTypes.string,
    closingTime: PropTypes.string,
    imageUrl: PropTypes.string,
    status: PropTypes.string,
    createdAt: PropTypes.shape({
      seconds: PropTypes.number,
    }),
  }),
};

FieldDetailsModal.defaultProps = {
  field: null,
};

export default FieldDetailsModal;
