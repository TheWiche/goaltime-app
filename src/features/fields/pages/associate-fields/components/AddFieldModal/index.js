import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { PlusCircle, Save, Info } from "lucide-react";
import { Modal, Button } from "shared/components/ui";
import FieldFormFields from "../FieldFormFields";

const INITIAL = {
  name: "",
  address: "",
  description: "",
  pricePerHour: "",
  imageUrl: "",
  openingTime: "08:00",
  closingTime: "22:00",
};

function AddFieldModal({ open, onClose, onSubmit, loading }) {
  const [values, setValues] = useState(INITIAL);

  useEffect(() => {
    if (!open) setValues(INITIAL);
  }, [open]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (loading) return;
    onSubmit({
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
      title="Registrar nueva cancha"
      subtitle="Completa la ficha. Un administrador la revisará antes de publicarla."
      icon={<PlusCircle className="h-[22px] w-[22px] shrink-0" strokeWidth={2} aria-hidden />}
      bodyClassName="bg-slate-50 px-0 py-0"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="add-field-form"
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            <Save className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
            Registrar cancha
          </Button>
        </>
      }
    >
      <form id="add-field-form" onSubmit={handleSubmit} className="px-6 sm:px-8 py-7">
        <FieldFormFields values={values} onChange={setValues} disabled={loading} />
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <Info className="h-5 w-5 shrink-0 text-amber-700" strokeWidth={2} aria-hidden />
          <div>
            <p className="text-sm font-semibold text-amber-900">Revisión pendiente</p>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              Tu cancha pasará a estado <strong>Pendiente</strong> y un administrador la
              aprobará antes de que sea visible para los clientes.
            </p>
          </div>
        </div>
      </form>
    </Modal>
  );
}

AddFieldModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

AddFieldModal.defaultProps = { loading: false };

export default AddFieldModal;
