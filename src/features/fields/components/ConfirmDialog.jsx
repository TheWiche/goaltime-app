import PropTypes from "prop-types";
import { Button, Modal } from "shared/components/ui";

/** Confirmación genérica (receta "Modal de confirmación" de MASTER.md). */
function ConfirmDialog({
  open,
  title,
  description,
  children,
  confirmLabel = "Confirmar",
  cancelLabel = "Volver",
  variant = "primary",
  loading = false,
  onConfirm,
  onClose,
}) {
  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      size="sm"
      title={title}
      bodyClassName="space-y-3"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button type="button" variant={variant} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {description && <p className="text-sm text-fg-muted">{description}</p>}
      {children}
    </Modal>
  );
}

ConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.node.isRequired,
  description: PropTypes.node,
  children: PropTypes.node,
  confirmLabel: PropTypes.node,
  cancelLabel: PropTypes.node,
  variant: PropTypes.oneOf(["primary", "danger", "dark"]),
  loading: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ConfirmDialog;
