import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Trophy, Pencil } from "lucide-react";
import { Modal, Button, StatusPill } from "shared/components/ui";
import { getFieldStatusMeta } from "shared/utils/reservationStatus";
import { formatCurrency } from "shared/utils/format";
import { formatDateEs } from "shared/utils/date";

function DetailRow({ label, children }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-x-4 border-b border-line-subtle py-2.5 text-sm last:border-b-0">
      <dt className="text-fg-muted">{label}</dt>
      <dd className="min-w-0 break-words text-fg">{children}</dd>
    </div>
  );
}

DetailRow.propTypes = { label: PropTypes.string.isRequired, children: PropTypes.node.isRequired };

function FieldDetailsModal({ open, onClose, field }) {
  const navigate = useNavigate();
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => setImageFailed(false), [field?.imageUrl]);

  if (!field) return null;

  const status = getFieldStatusMeta(field.status);
  const registered = formatDateEs(field.createdAt, undefined, "");
  const hours =
    field.openingTime && field.closingTime ? `${field.openingTime} – ${field.closingTime}` : "—";

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      eyebrow="Detalle de cancha"
      title={field.name || "Cancha"}
      subtitle={field.address || "Sin dirección registrada"}
      icon={<Trophy className="h-4 w-4" aria-hidden="true" />}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
          <Button
            type="button"
            variant="primary"
            leftIcon={<Pencil className="h-4 w-4" aria-hidden="true" />}
            onClick={() => navigate(`/canchas?edit=${field.id}`)}
          >
            Gestionar cancha
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill tone={status.tone}>{status.label}</StatusPill>
          {registered && <span className="text-xs text-fg-subtle">Registrada el {registered}</span>}
        </div>

        {field.imageUrl && !imageFailed && (
          <div className="overflow-hidden rounded-lg border border-line bg-zinc-50">
            <img
              src={field.imageUrl}
              alt={`Foto de ${field.name || "la cancha"}`}
              className="aspect-[16/9] w-full object-cover"
              onError={() => setImageFailed(true)}
            />
          </div>
        )}

        <dl>
          <DetailRow label="Precio por hora">
            <span className="tabular font-medium">{formatCurrency(field.pricePerHour)}</span>
          </DetailRow>
          <DetailRow label="Horario">
            <span className="tabular">{hours}</span>
          </DetailRow>
          <DetailRow label="Dirección">{field.address || "Sin dirección registrada."}</DetailRow>
          {field.description && (
            <DetailRow label="Descripción">
              <span className="whitespace-pre-line">{field.description}</span>
            </DetailRow>
          )}
          <DetailRow label="ID">
            <span className="font-mono text-xs text-fg-muted">{field.id}</span>
          </DetailRow>
        </dl>
      </div>
    </Modal>
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
    createdAt: PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.number]),
  }),
};

FieldDetailsModal.defaultProps = {
  field: null,
};

export default FieldDetailsModal;
