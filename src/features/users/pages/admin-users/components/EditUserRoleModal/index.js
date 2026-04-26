import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  IconButton,
} from "@mui/material";
import { Close, AdminPanelSettings, Person } from "@mui/icons-material";
import { GlassCard } from "shared/components/ui";
import { Button } from "shared/components/ui";

function EditUserRoleModal({ open, onClose, onSubmit, loading, user }) {
  const [newRole, setNewRole] = useState("");

  useEffect(() => {
    if (user) {
      setNewRole(user.role || "cliente");
    } else {
      setNewRole("cliente");
    }
  }, [user, open]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!loading && user) {
      onSubmit(user, newRole);
    }
  };

  const roleLabels = {
    cliente: "Cliente",
    asociado: "Asociado",
    admin: "Administrador",
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
        },
      }}
    >
      <div className="relative bg-gradient-to-br from-primary to-primary-600 px-6 pt-6 pb-8">
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
        <div className="flex items-center gap-3 pr-10">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
            <AdminPanelSettings sx={{ color: "white", fontSize: 26 }} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-heading text-white">Editar rol de usuario</h2>
            <p className="text-sm text-white/80">Asigna permisos en GoalTime</p>
          </div>
        </div>
      </div>

      {user && (
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ p: 0 }}>
            <div className="px-6 py-5 -mt-4">
              <GlassCard className="p-4 mb-5" hover={false}>
                <div className="flex items-center gap-4">
                  <Avatar
                    src={user.photoURL || ""}
                    alt={user.name || ""}
                    sx={{
                      width: 56,
                      height: 56,
                      fontWeight: 700,
                      background: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)",
                    }}
                  >
                    {user.name ? user.name[0].toUpperCase() : "?"}
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold font-heading text-primary-900 truncate text-base">
                      {user.name || "Usuario"}
                    </p>
                    <p className="text-sm text-surface-500 truncate">{user.email || "Sin correo"}</p>
                  </div>
                </div>
              </GlassCard>

              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel id="edit-role-label">Nuevo rol</InputLabel>
                <Select
                  labelId="edit-role-label"
                  id="newRole"
                  label="Nuevo rol"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  disabled={loading}
                  sx={{
                    borderRadius: "12px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(30, 58, 138, 0.2)",
                    },
                  }}
                >
                  <MenuItem value="cliente">{roleLabels.cliente}</MenuItem>
                  <MenuItem value="asociado">{roleLabels.asociado}</MenuItem>
                  <MenuItem value="admin">{roleLabels.admin}</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="px-6 py-4 bg-surface-50 border-t border-surface-200 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading || newRole === user.role}
              >
                <Person sx={{ fontSize: 18 }} />
                Guardar rol
              </Button>
            </div>
          </DialogContent>
        </form>
      )}
    </Dialog>
  );
}

EditUserRoleModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  user: PropTypes.object,
};

EditUserRoleModal.defaultProps = {
  loading: false,
  user: null,
};

export default EditUserRoleModal;
