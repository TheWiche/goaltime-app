import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  MapPin,
  Banknote,
  Clock,
  Calendar,
  Pencil,
  CircleCheck,
  Hourglass,
  Ban,
  XCircle,
} from "lucide-react";
import { Modal, Button, SectionCard, StatusPill } from "shared/components/ui";

const STATUS_MAP = {
  approved: { label: "Aprobada", tone: "success", Icon: CircleCheck },
  pending: { label: "Pendiente", tone: "warning", Icon: Hourglass },
  disabled: { label: "Deshabilitada", tone: "neutral", Icon: Ban },
  rejected: { label: "Rechazada", tone: "danger", Icon: XCircle },
};

function FieldDetailsModal({ open, onClose, field }) {
  const navigate = useNavigate();
  if (!field) return null;

  const status = STATUS_MAP[field.status] || STATUS_MAP.pending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      variant="hero"
      eyebrow="Detalle de cancha"
      title={field.name || "Cancha"}
      subtitle={field.address || "Sin dirección registrada"}
      icon={<Trophy className="h-6 w-6 shrink-0" strokeWidth={2} aria-hidden />}
      bodyClassName="bg-slate-50 px-0 py-0"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => navigate(`/canchas?edit=${field.id}`)}
          >
            <Pencil className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
            Gestionar cancha
          </Button>
        </>
      }
    >
      <div className="px-6 sm:px-8 py-7 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill tone={status.tone} icon={<status.Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />}>
            {status.label}
          </StatusPill>
          {field.createdAt?.seconds && (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
              Registrada el{" "}
              {new Date(field.createdAt.seconds * 1000).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          )}
        </div>

        {field.imageUrl && (
          <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
            <img
              src={field.imageUrl}
              alt={field.name}
              className="w-full aspect-[16/9] object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat
            icon={<Banknote className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />}
            tone="bg-emerald-50 text-emerald-600"
            label="Precio por hora"
            value={`$${(field.pricePerHour ?? 0).toLocaleString()}`}
          />
          <Stat
            icon={<Clock className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />}
            tone="bg-primary-50 text-primary"
            label="Apertura"
            value={field.openingTime || "—"}
          />
          <Stat
            icon={<Clock className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />}
            tone="bg-primary-50 text-primary"
            label="Cierre"
            value={field.closingTime || "—"}
          />
          <Stat
            icon={<MapPin className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />}
            tone="bg-rose-50 text-rose-600"
            label="ID"
            value={
              <span className="font-mono text-xs text-slate-500 truncate block">{field.id}</span>
            }
          />
        </div>

        <SectionCard
          eyebrow="Ubicación"
          title="Dirección de la instalación"
          icon={<MapPin className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />}
          padding="p-5"
        >
          <p className="text-sm text-slate-700 leading-relaxed">
            {field.address || "Sin dirección registrada."}
          </p>
        </SectionCard>

        {field.description && (
          <SectionCard
            eyebrow="Descripción"
            title="Información para el público"
            icon={<Trophy className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />}
            padding="p-5"
          >
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {field.description}
            </p>
          </SectionCard>
        )}
      </div>
    </Modal>
  );
}

function Stat({ icon, tone, label, value }) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${tone}`}>
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{label}</p>
          <p className="text-base font-semibold font-heading text-slate-900 truncate">{value}</p>
        </div>
      </div>
    </div>
  );
}

Stat.propTypes = {
  icon: PropTypes.node.isRequired,
  tone: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
};

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
    createdAt: PropTypes.shape({ seconds: PropTypes.number }),
  }),
};

FieldDetailsModal.defaultProps = {
  field: null,
};

export default FieldDetailsModal;
