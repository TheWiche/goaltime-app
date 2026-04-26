import PropTypes from "prop-types";
import { TriangleAlert, CircleCheck, Info } from "lucide-react";
import { Modal, Button } from "shared/components/ui";

const tones = {
  error: {
    iconBg: "bg-rose-50 text-rose-600",
    Icon: TriangleAlert,
    confirmVariant: "danger",
  },
  warning: {
    iconBg: "bg-amber-50 text-amber-600",
    Icon: TriangleAlert,
    confirmVariant: "primary",
  },
  success: {
    iconBg: "bg-emerald-50 text-emerald-600",
    Icon: CircleCheck,
    confirmVariant: "primary",
  },
  info: {
    iconBg: "bg-primary-50 text-primary",
    Icon: Info,
    confirmVariant: "primary",
  },
  primary: {
    iconBg: "bg-primary-50 text-primary",
    Icon: Info,
    confirmVariant: "primary",
  },
};

function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmColor = "error",
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  loading = false,
}) {
  const tone = tones[confirmColor] || tones.info;
  const Icon = tone.Icon;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      eyebrow="Confirmación"
      title={title}
      subtitle={message}
      icon={
        <span className={`inline-flex items-center justify-center w-full h-full rounded-xl ${tone.iconBg}`}>
          <Icon className="h-[22px] w-[22px] shrink-0" strokeWidth={2} aria-hidden />
        </span>
      }
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={tone.confirmVariant}
            onClick={onConfirm}
            loading={loading}
            disabled={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-600 leading-relaxed">
        Esta acción se aplicará de inmediato. Verifica que sea la decisión correcta antes de continuar.
      </p>
    </Modal>
  );
}

ConfirmationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmColor: PropTypes.oneOf(["error", "warning", "success", "info", "primary"]),
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  loading: PropTypes.bool,
};

export default ConfirmationDialog;
