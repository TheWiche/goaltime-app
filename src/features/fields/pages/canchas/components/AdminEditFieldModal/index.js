import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { User, Mail, KeyRound, Save, MapPin } from "lucide-react";
import Spinner from "shared/components/ui/Spinner";
import { doc, getDoc } from "firebase/firestore";
import { db } from "shared/services/firebaseService";
import {
  Modal,
  Button,
  SectionCard,
  TextField,
  Textarea,
} from "shared/components/ui";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente", hint: "En revisión", tone: "amber" },
  { value: "approved", label: "Aprobada", hint: "Visible y activa", tone: "emerald" },
  { value: "rejected", label: "Rechazada", hint: "No publicada", tone: "rose" },
  { value: "disabled", label: "Deshabilitada", hint: "Oculta temporalmente", tone: "slate" },
];

function toneClasses(tone, active) {
  const map = {
    amber: active
      ? "border-amber-400 bg-amber-50 text-amber-900 ring-[3px] ring-amber-400/25"
      : "border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50/40",
    emerald: active
      ? "border-emerald-500 bg-emerald-50 text-emerald-900 ring-[3px] ring-emerald-500/20"
      : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/40",
    rose: active
      ? "border-rose-500 bg-rose-50 text-rose-900 ring-[3px] ring-rose-500/20"
      : "border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:bg-rose-50/40",
    slate: active
      ? "border-slate-500 bg-slate-100 text-slate-900 ring-[3px] ring-slate-400/25"
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
    if (!field || !open) {
      setOwnerInfo(null);
      return;
    }
    setName(field.name || "");
    setAddress(field.address || "");
    setDescription(field.description || "");
    setPricePerHour(field.pricePerHour?.toString() || "");
    setImageUrl(field.imageUrl || "");
    setOpeningTime(field.openingTime || "08:00");
    setClosingTime(field.closingTime || "22:00");
    setStatus(field.status || "pending");

    if (!field.ownerId) return;
    setLoadingOwner(true);
    getDoc(doc(db, "users", field.ownerId))
      .then((ownerDoc) => {
        if (ownerDoc.exists()) setOwnerInfo(ownerDoc.data());
      })
      .catch((error) => console.error("Error al cargar dueño:", error))
      .finally(() => setLoadingOwner(false));
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
    <Modal
      open={open}
      onClose={onClose}
      size="2xl"
      eyebrow="Administración · Canchas"
      title="Editar instalación"
      subtitle="Ajusta la ficha pública, tarifas y el estado de moderación. Los cambios aplican al guardar."
      icon={<MapPin className="h-[22px] w-[22px] shrink-0" strokeWidth={2} aria-hidden />}
      bodyClassName="bg-slate-50 px-0 py-0"
      footer={
        <>
          <p className="text-xs text-slate-500 sm:mr-auto sm:text-left">
            Los usuarios verán la ficha según el estado de moderación.
          </p>
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="admin-edit-field-form"
            variant="dark"
            loading={loading}
            disabled={loading}
          >
            <Save className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
            Guardar cambios
          </Button>
        </>
      }
    >
      <form
        id="admin-edit-field-form"
        onSubmit={handleSubmit}
        className="px-6 sm:px-8 py-7"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <aside className="lg:col-span-4 space-y-5">
            <SectionCard
              eyebrow="Titular"
              title="Dueño de la cancha"
              padding="p-5"
            >
              {loadingOwner ? (
                <div className="flex items-center justify-center py-6">
                  <Spinner size="md" />
                </div>
              ) : ownerInfo ? (
                <dl className="space-y-4">
                  <InfoRow icon={<User className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />} label="Nombre" value={ownerInfo.name || "—"} />
                  <InfoRow
                    icon={<Mail className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />}
                    label="Correo"
                    value={ownerInfo.email || "—"}
                    breakAll
                  />
                  <div className="pt-3 border-t border-slate-100">
                    <InfoRow
                      icon={<KeyRound className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />}
                      label="UID Firebase"
                      value={field.ownerId}
                      mono
                    />
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-slate-500">No se pudo cargar al titular.</p>
              )}
            </SectionCard>

            <SectionCard
              eyebrow="Moderación"
              title="Estado de la cancha"
              subtitle="Define cómo se muestra en el catálogo y reservas."
              padding="p-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STATUS_OPTIONS.map((opt) => {
                  const active = status === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStatus(opt.value)}
                      className={[
                        "text-left rounded-lg border px-3 py-2.5 transition-all duration-200 cursor-pointer",
                        "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20",
                        toneClasses(opt.tone, active),
                      ].join(" ")}
                    >
                      <span className="block text-sm font-semibold leading-tight">{opt.label}</span>
                      <span className="block text-[11px] opacity-80 mt-0.5">{opt.hint}</span>
                    </button>
                  );
                })}
              </div>

              <p className="mt-4 text-[11px] font-mono text-slate-400 break-all" title={field.id}>
                ID · {field.id}
              </p>
            </SectionCard>
          </aside>

          <div className="lg:col-span-8 space-y-5">
            <SectionCard eyebrow="Ficha pública" title="Información de la instalación">
              <div className="space-y-5">
                <TextField
                  id="field-name"
                  label="Nombre comercial"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Polideportivo Los Panches"
                />
                <TextField
                  id="field-address"
                  label="Dirección completa"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Calle, número, barrio, ciudad"
                />
                <Textarea
                  id="field-description"
                  label="Descripción para el público"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Superficie, iluminación, vestuarios, estacionamiento…"
                  hint="Aparece en el detalle de la cancha para los usuarios."
                />
              </div>
            </SectionCard>

            <SectionCard eyebrow="Operación" title="Tarifas y horario">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <TextField
                  id="field-price"
                  label="Precio por hora"
                  type="number"
                  required
                  prefix="$"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={pricePerHour}
                  onChange={(e) => setPricePerHour(e.target.value)}
                />
                <TextField
                  id="field-opening"
                  label="Apertura"
                  type="time"
                  required
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                />
                <TextField
                  id="field-closing"
                  label="Cierre"
                  type="time"
                  required
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                />
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Galería"
              title="Imagen de portada"
              subtitle="URL HTTPS de una imagen horizontal (recomendado 16:9)."
            >
              <TextField
                id="field-image"
                label="URL de la imagen"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://…"
              />
              {imageUrl ? (
                <div className="mt-4 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                  <img
                    src={imageUrl}
                    alt="Vista previa"
                    className="w-full aspect-video object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              ) : null}
            </SectionCard>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function InfoRow({ icon, label, value, mono = false, breakAll = false }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-xs text-slate-500">{label}</dt>
        <dd
          className={[
            "text-sm font-medium text-slate-900 leading-relaxed",
            mono ? "font-mono text-xs text-slate-600" : "",
            breakAll ? "break-all" : "truncate",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {value}
        </dd>
      </div>
    </div>
  );
}

InfoRow.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  mono: PropTypes.bool,
  breakAll: PropTypes.bool,
};

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
