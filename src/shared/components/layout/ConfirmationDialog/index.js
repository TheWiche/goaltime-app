import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { TriangleAlert, CircleCheck, Info } from "lucide-react";
import { Modal, Button } from "shared/components/ui";

const TONES = {
  error: { iconColor: "text-red-600", Icon: TriangleAlert, variant: "danger" },
  warning: { iconColor: "text-amber-600", Icon: TriangleAlert, variant: "primary" },
  success: { iconColor: "text-green-600", Icon: CircleCheck, variant: "primary" },
  info: { iconColor: "text-primary-600", Icon: Info, variant: "primary" },
  primary: { iconColor: "text-primary-600", Icon: Info, variant: "primary" },
};

/**
 * Diálogo de confirmación compartido.
 * - `onConfirm` puede ser async: mientras la promesa está pendiente los botones se bloquean
 *   (anti doble clic) y el diálogo no se puede cerrar. El cierre lo decide quien lo usa,
 *   normalmente tras el `await` de su acción.
 * - `loading` permite forzar el estado de carga desde fuera.
 */
function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  children,
  confirmColor,
  confirmLabel,
  cancelLabel,
  loading,
}) {
  const tone = TONES[confirmColor] || TONES.info;
  const Icon = tone.Icon;
  const [pending, setPending] = useState(false);
  const mountedRef = useRef(true);
  const lockRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const busy = loading || pending;

  const handleConfirm = async () => {
    if (lockRef.current) return;
    lockRef.current = true;
    setPending(true);
    try {
      await onConfirm();
    } finally {
      lockRef.current = false;
      if (mountedRef.current) setPending(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={busy ? undefined : onClose}
      closeOnBackdrop={!busy}
      closeOnEsc={!busy}
      hideClose={busy}
      size="sm"
      title={title}
      icon={<Icon className={`h-4 w-4 ${tone.iconColor}`} strokeWidth={1.75} />}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy} data-autofocus>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={tone.variant}
            onClick={handleConfirm}
            loading={busy}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-fg-muted">{message}</p>
      {children}
    </Modal>
  );
}

ConfirmationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.node,
  children: PropTypes.node,
  confirmColor: PropTypes.oneOf(["error", "warning", "success", "info", "primary"]),
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  loading: PropTypes.bool,
};

ConfirmationDialog.defaultProps = {
  message: null,
  children: null,
  confirmColor: "error",
  confirmLabel: "Confirmar",
  cancelLabel: "Cancelar",
  loading: false,
};

export default ConfirmationDialog;
