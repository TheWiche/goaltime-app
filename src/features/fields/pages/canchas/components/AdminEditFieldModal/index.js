import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogContent,
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
} from "@mui/material";
import {
  Close,
  Edit,
  Person,
  Email,
  VpnKey,
  SportsSoccer,
  Save,
} from "@mui/icons-material";
import { doc, getDoc } from "firebase/firestore";
import { db } from "shared/services/firebaseService";
import { GlassCard } from "shared/components/ui";
import { Button } from "shared/components/ui";

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "rgba(255,255,255,0.9)",
  },
};

function AdminEditFieldModal({ open, onClose, onSubmit, loading, field }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [openingTime, setOpeningTime] = useState("08:00");
  const [closingTime, setClosingTime] = useState("22:00");
  const [status, setStatus] = useState("pending");
  const [ownerInfo, setOwnerInfo] = useState(null);
  const [loadingOwner, setLoadingOwner] = useState(false);

  useEffect(() => {
    if (field && open) {
      setName(field.name || "");
      setAddress(field.address || "");
      setDescription(field.description || "");
      setPricePerHour(field.pricePerHour?.toString() || "");
      setImageUrl(field.imageUrl || "");
      setOpeningTime(field.openingTime || "08:00");
      setClosingTime(field.closingTime || "22:00");
      setStatus(field.status || "pending");

      if (field.ownerId) {
        setLoadingOwner(true);
        getDoc(doc(db, "users", field.ownerId))
          .then((ownerDoc) => {
            if (ownerDoc.exists()) {
              setOwnerInfo(ownerDoc.data());
            }
            setLoadingOwner(false);
          })
          .catch((error) => {
            console.error("Error al cargar información del dueño:", error);
            setLoadingOwner(false);
          });
      }
    } else {
      setOwnerInfo(null);
    }
  }, [field, open]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!loading && field) {
      onSubmit(field.id, {
        name,
        address,
        description,
        pricePerHour: parseFloat(pricePerHour) || 0,
        imageUrl: imageUrl || null,
        openingTime,
        closingTime,
        status,
      });
    }
  };

  const statusLabels = {
    pending: "Pendiente",
    approved: "Aprobada",
    rejected: "Rechazada",
    disabled: "Deshabilitada",
  };

  if (!field) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
        },
      }}
    >
      <div className="relative bg-gradient-to-br from-primary to-primary-600 px-6 pt-6 pb-6">
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
            <Edit sx={{ color: "white", fontSize: 26 }} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-heading text-white">Editar cancha</h2>
            <p className="text-sm text-white/80">Actualiza datos y estado de aprobación</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 0 }}>
          <div className="px-6 py-5 space-y-5">
            <GlassCard className="p-4" hover={false}>
              <div className="flex items-center gap-2 mb-3">
                <Person sx={{ color: "#1E3A8A", fontSize: 22 }} />
                <h3 className="font-bold font-heading text-primary-900 text-sm">Información del dueño</h3>
              </div>
              {loadingOwner ? (
                <div className="flex justify-center py-6">
                  <CircularProgress size={28} sx={{ color: "#1E3A8A" }} />
                </div>
              ) : ownerInfo ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Person sx={{ fontSize: 18, color: "#1E3A8A" }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-surface-500">Nombre</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {ownerInfo.name || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Email sx={{ fontSize: 18, color: "#1E3A8A" }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-surface-500">Correo</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {ownerInfo.email || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="sm:col-span-2 flex gap-3">
                    <div className="w-9 h-9 rounded-lg bg-surface-200 flex items-center justify-center shrink-0">
                      <VpnKey sx={{ fontSize: 18, color: "#64748b" }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-surface-500">ID de usuario</p>
                      <p className="text-xs font-mono text-gray-700 break-all">{field.ownerId}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-surface-500">No se pudo cargar la información del dueño.</p>
              )}
            </GlassCard>

            <GlassCard className="p-4" hover={false}>
              <div className="flex items-center gap-2 mb-4">
                <SportsSoccer sx={{ color: "#1E3A8A", fontSize: 22 }} />
                <h3 className="font-bold font-heading text-primary-900 text-sm">Información de la cancha</h3>
              </div>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Nombre de la cancha"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    fullWidth
                    size="small"
                    sx={textFieldSx}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Dirección"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    fullWidth
                    size="small"
                    sx={textFieldSx}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Descripción"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                    multiline
                    minRows={3}
                    size="small"
                    sx={textFieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Precio por hora ($)"
                    type="number"
                    value={pricePerHour}
                    onChange={(e) => setPricePerHour(e.target.value)}
                    required
                    fullWidth
                    size="small"
                    inputProps={{ min: 0, step: 0.01 }}
                    sx={textFieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Apertura"
                    type="time"
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                    required
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    sx={textFieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Cierre"
                    type="time"
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                    required
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    sx={textFieldSx}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="URL de imagen (opcional)"
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    fullWidth
                    size="small"
                    helperText="Enlace a una foto de la cancha"
                    sx={textFieldSx}
                  />
                </Grid>
              </Grid>
            </GlassCard>

            <GlassCard className="p-4" hover={false}>
              <h3 className="font-bold font-heading text-primary-900 text-sm mb-3">Estado de la cancha</h3>
              <Grid container spacing={2} alignItems="stretch">
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small" variant="outlined">
                    <InputLabel id="status-edit-label">Estado</InputLabel>
                    <Select
                      labelId="status-edit-label"
                      label="Estado"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      sx={{
                        borderRadius: "12px",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(30, 58, 138, 0.2)",
                        },
                      }}
                    >
                      <MenuItem value="pending">Pendiente</MenuItem>
                      <MenuItem value="approved">Aprobada</MenuItem>
                      <MenuItem value="rejected">Rechazada</MenuItem>
                      <MenuItem value="disabled">Deshabilitada</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <div className="h-full min-h-[40px] flex items-center rounded-xl border border-primary/15 bg-primary/5 px-4 py-2">
                    <p className="text-sm font-semibold text-primary-900">
                      Vista previa:{" "}
                      <span className="text-primary">{statusLabels[status] || status}</span>
                    </p>
                  </div>
                </Grid>
              </Grid>
            </GlassCard>
          </div>

          <div className="px-6 py-4 bg-surface-50 border-t border-surface-200 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={loading} disabled={loading}>
              <Save sx={{ fontSize: 18 }} />
              Guardar cambios
            </Button>
          </div>
        </DialogContent>
      </form>
    </Dialog>
  );
}

AdminEditFieldModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  field: PropTypes.object,
};

AdminEditFieldModal.defaultProps = {
  loading: false,
  field: null,
};

export default AdminEditFieldModal;
