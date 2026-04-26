import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogContent,
  TextField,
  IconButton,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { Close, Person, Email, VpnKey, Save } from "@mui/icons-material";
import { doc, getDoc } from "firebase/firestore";
import { db } from "shared/services/firebaseService";
import { Button } from "shared/components/ui";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: "#fff",
    fontSize: "0.9375rem",
    "& fieldset": { borderColor: "#e2e8f0" },
    "&:hover fieldset": { borderColor: "#cbd5e1" },
    "&.Mui-focused fieldset": { borderWidth: "1px" },
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.875rem",
    color: "#64748b",
  },
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente", hint: "En revisión", tone: "amber" },
  { value: "approved", label: "Aprobada", hint: "Visible y activa", tone: "emerald" },
  { value: "rejected", label: "Rechazada", hint: "No publicada", tone: "rose" },
  { value: "disabled", label: "Deshabilitada", hint: "Oculta temporalmente", tone: "slate" },
];

function toneClasses(tone, active) {
  const map = {
    amber: active
      ? "border-amber-400 bg-amber-50 text-amber-900 ring-1 ring-amber-400/40"
      : "border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50/40",
    emerald: active
      ? "border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500/35"
      : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/40",
    rose: active
      ? "border-rose-500 bg-rose-50 text-rose-900 ring-1 ring-rose-500/35"
      : "border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:bg-rose-50/40",
    slate: active
      ? "border-slate-500 bg-slate-100 text-slate-900 ring-1 ring-slate-400/40"
      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
  };
  return map[tone] || map.slate;
}

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

  if (!field) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: "16px",
          maxHeight: "calc(100vh - 48px)",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.18)",
          border: "1px solid #e2e8f0",
        },
      }}
    >
      <div className="flex flex-col max-h-[calc(100vh-48px)] bg-white">
        {/* Header */}
        <header className="shrink-0 flex items-start justify-between gap-4 px-8 pt-7 pb-5 border-b border-slate-200 bg-white">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-1">
              Administración · Canchas
            </p>
            <h2 className="text-xl font-semibold font-heading text-slate-900 tracking-tight">
              Editar instalación
            </h2>
            <p className="mt-1 text-sm text-slate-500 max-w-xl">
              Ajusta la ficha pública, tarifas y el estado de moderación. Los cambios aplican al guardar.
            </p>
            <p className="mt-2 text-xs font-mono text-slate-400 truncate" title={field.id}>
              ID · {field.id}
            </p>
          </div>
          <IconButton
            onClick={onClose}
            size="small"
            aria-label="Cerrar"
            sx={{
              color: "#64748b",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              "&:hover": { bgcolor: "#f8fafc", borderColor: "#cbd5e1" },
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <DialogContent sx={{ p: 0, flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div className="flex-1 overflow-y-auto bg-slate-50/90">
              <div className="px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Columna lateral */}
                  <aside className="lg:col-span-4 space-y-6">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-4">
                        Titular de la cancha
                      </h3>
                      {loadingOwner ? (
                        <div className="flex items-center justify-center py-10">
                          <CircularProgress size={28} sx={{ color: "#1e3a8a" }} />
                        </div>
                      ) : ownerInfo ? (
                        <dl className="space-y-4">
                          <div className="flex gap-3">
                            <div className="mt-0.5 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                              <Person sx={{ fontSize: 18, color: "#475569" }} />
                            </div>
                            <div className="min-w-0">
                              <dt className="text-xs text-slate-500">Nombre</dt>
                              <dd className="text-sm font-medium text-slate-900 truncate">
                                {ownerInfo.name || "—"}
                              </dd>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <div className="mt-0.5 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                              <Email sx={{ fontSize: 18, color: "#475569" }} />
                            </div>
                            <div className="min-w-0">
                              <dt className="text-xs text-slate-500">Correo</dt>
                              <dd className="text-sm font-medium text-slate-900 break-all">
                                {ownerInfo.email || "—"}
                              </dd>
                            </div>
                          </div>
                          <div className="flex gap-3 pt-2 border-t border-slate-100">
                            <div className="mt-0.5 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                              <VpnKey sx={{ fontSize: 18, color: "#475569" }} />
                            </div>
                            <div className="min-w-0">
                              <dt className="text-xs text-slate-500">UID Firebase</dt>
                              <dd className="text-xs font-mono text-slate-600 break-all leading-relaxed">
                                {field.ownerId}
                              </dd>
                            </div>
                          </div>
                        </dl>
                      ) : (
                        <p className="text-sm text-slate-500 py-2">No se pudo cargar al titular.</p>
                      )}
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        Estado de moderación
                      </h3>
                      <p className="text-xs text-slate-500 mb-4">
                        Define cómo se muestra la cancha en el catálogo y reservas.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {STATUS_OPTIONS.map((opt) => {
                          const active = status === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setStatus(opt.value)}
                              className={[
                                "text-left rounded-lg border px-3 py-2.5 transition-all duration-150",
                                toneClasses(opt.tone, active),
                              ].join(" ")}
                            >
                              <span className="block text-sm font-semibold leading-tight">{opt.label}</span>
                              <span className="block text-[11px] opacity-80 mt-0.5">{opt.hint}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </aside>

                  {/* Formulario principal */}
                  <div className="lg:col-span-8 space-y-6">
                    <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
                      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-5">
                        Ficha de la instalación
                      </h3>
                      <div className="space-y-5">
                        <TextField
                          label="Nombre comercial"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          fullWidth
                          placeholder="Ej. Polideportivo Los Panches"
                          sx={fieldSx}
                        />
                        <TextField
                          label="Dirección completa"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          required
                          fullWidth
                          placeholder="Calle, número, barrio, ciudad"
                          sx={fieldSx}
                        />
                        <TextField
                          label="Descripción para el público"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          fullWidth
                          multiline
                          minRows={4}
                          placeholder="Superficie, iluminación, vestuarios, estacionamiento…"
                          sx={fieldSx}
                        />
                      </div>
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
                      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-5">
                        Tarifas y horario
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <TextField
                          label="Precio por hora"
                          type="number"
                          value={pricePerHour}
                          onChange={(e) => setPricePerHour(e.target.value)}
                          required
                          fullWidth
                          inputProps={{ min: 0, step: 0.01 }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <span className="text-slate-500 text-sm font-semibold">$</span>
                              </InputAdornment>
                            ),
                          }}
                          sx={fieldSx}
                        />
                        <TextField
                          label="Apertura"
                          type="time"
                          value={openingTime}
                          onChange={(e) => setOpeningTime(e.target.value)}
                          required
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          sx={fieldSx}
                        />
                        <TextField
                          label="Cierre"
                          type="time"
                          value={closingTime}
                          onChange={(e) => setClosingTime(e.target.value)}
                          required
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          sx={fieldSx}
                        />
                      </div>
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
                      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        Imagen de portada
                      </h3>
                      <p className="text-xs text-slate-500 mb-4">
                        URL HTTPS de una imagen horizontal (recomendado 16:9).
                      </p>
                      <TextField
                        label="URL de la imagen"
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        fullWidth
                        placeholder="https://…"
                        sx={fieldSx}
                      />
                    </section>
                  </div>
                </div>
              </div>
            </div>

            <footer className="shrink-0 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 px-8 py-4 border-t border-slate-200 bg-white">
              <p className="text-xs text-slate-500 text-center sm:text-left">
                Los usuarios verán los datos de la ficha según el estado de moderación.
              </p>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                  Cancelar
                </Button>
                <Button type="submit" variant="dark" loading={loading} disabled={loading}>
                  <Save sx={{ fontSize: 18 }} />
                  Guardar cambios
                </Button>
              </div>
            </footer>
          </DialogContent>
        </form>
      </div>
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
