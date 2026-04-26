import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Pencil,
  Save,
  TriangleAlert,
  CircleCheck,
  Hourglass,
  Ban,
  XCircle,
} from "lucide-react";
import { Modal, Button, StatusPill } from "shared/components/ui";
import FieldFormFields from "../FieldFormFields";

const STATUS_MAP = {
  approved: { label: "Aprobada", tone: "success", Icon: CircleCheck },
  pending: { label: "Pendiente", tone: "warning", Icon: Hourglass },
  rejected: { label: "Rechazada", tone: "danger", Icon: XCircle },
  disabled: { label: "Deshabilitada", tone: "neutral", Icon: Ban },
};

const EMPTY = {
  name: "",
  address: "",
  description: "",
  pricePerHour: "",
  imageUrl: "",
  openingTime: "08:00",
  closingTime: "22:00",
};

function EditFieldModal({ open, onClose, onSubmit, loading, field }) {
  const [values, setValues] = useState(EMPTY);

  useEffect(() => {
    if (field && open) {
      setValues({
        name: field.name || "",
        address: field.address || "",
        description: field.description || "",
        pricePerHour: field.pricePerHour?.toString() || "",
        imageUrl: field.imageUrl || "",
        openingTime: field.openingTime || "08:00",
        closingTime: field.closingTime || "22:00",
      });
    }
  }, [field, open]);

  if (!field) return null;

  const status = STATUS_MAP[field.status] || STATUS_MAP.pending;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (loading) return;
    onSubmit(field.id, {
      ...values,
      pricePerHour: parseFloat(values.pricePerHour) || 0,
      imageUrl: values.imageUrl || null,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="2xl"
      eyebrow="Mis canchas"
      title="Editar cancha"
      subtitle="Actualiza la información pública. Los cambios aplican al guardar."
      icon={<Pencil className="h-[22px] w-[22px] shrink-0" strokeWidth={2} aria-hidden />}
      bodyClassName="bg-slate-50 px-0 py-0"
      footer={
        <>
          <div className="sm:mr-auto flex items-center gap-2">
            <span className="text-xs text-slate-500">Estado actual:</span>
            <StatusPill tone={status.tone} icon={<status.Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />}>
              {status.label}
            </StatusPill>
          </div>
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="edit-field-form"
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            <Save className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
            Guardar cambios
          </Button>
        </>
      }
    >
      <form id="edit-field-form" onSubmit={handleSubmit} className="px-6 sm:px-8 py-7">
        <FieldFormFields values={values} onChange={setValues} disabled={loading} />
        {field.status === "approved" && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <TriangleAlert className="h-5 w-5 shrink-0 text-amber-700" strokeWidth={2} aria-hidden />
            <div>
              <p className="text-sm font-semibold text-amber-900">Volverá a revisión</p>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Al editar una cancha aprobada, regresa a <strong>Pendiente</strong> y deberá ser
                revisada de nuevo por un administrador.
              </p>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}

EditFieldModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  field: PropTypes.object,
};

EditFieldModal.defaultProps = { loading: false, field: null };

export default EditFieldModal;
