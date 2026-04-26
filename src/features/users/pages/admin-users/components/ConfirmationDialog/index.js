import PropTypes from "prop-types";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import { Close, WarningAmber } from "@mui/icons-material";
import { Button } from "shared/components/ui";

function ConfirmationDialog({ open, onClose, onConfirm, title, message, confirmColor = "error" }) {
  const isDestructive = confirmColor === "error";
  const confirmVariant = isDestructive ? "danger" : "primary";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
        },
      }}
    >
      <div className="relative bg-gradient-to-br from-primary to-primary-600 px-6 pt-6 pb-5">
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            color: "white",
            bgcolor: "rgba(255,255,255,0.15)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
          }}
        >
          <Close fontSize="small" />
        </IconButton>
        <div className="flex items-start gap-3 pr-10">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              isDestructive ? "bg-red-500/30" : "bg-white/20"
            }`}
          >
            <WarningAmber sx={{ color: "white", fontSize: 28 }} />
          </div>
          <h2 className="text-lg font-bold font-heading text-white leading-snug">{title}</h2>
        </div>
      </div>

      <DialogContent sx={{ p: 0 }}>
        <div className="px-6 py-5">
          <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
        </div>
        <div className="px-6 py-4 bg-surface-50 border-t border-surface-200 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" variant={confirmVariant} onClick={onConfirm}>
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

ConfirmationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmColor: PropTypes.oneOf([
    "error",
    "success",
    "info",
    "warning",
    "primary",
    "secondary",
    "dark",
  ]),
};

export default ConfirmationDialog;
