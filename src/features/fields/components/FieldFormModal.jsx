import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Info, Pencil, Plus, TriangleAlert } from "lucide-react";
import { Avatar, Button, Modal, SegmentedControl, Skeleton, StatusPill, FieldShell } from "shared/components/ui";
import { getUserProfileById, uploadFieldImage } from "shared/services/firebaseService";
import { FIELD_STATUS, getFieldStatusMeta } from "shared/utils/reservationStatus";
import FieldFormFields from "./FieldForm/FieldFormFields";
import {
  EMPTY_FIELD_VALUES,
  fieldToValues,
  validateFieldValues,
  valuesToPayload,
} from "./FieldForm/fieldFormUtils";

const STATUS_ITEMS = Object.values(FIELD_STATUS).map((s) => ({ value: s.value, label: s.label }));

const COPY = {
  create: {
    title: "Registrar cancha",
    subtitle: "Un administrador la revisará antes de publicarla.",
    submit: "Registrar cancha",
    Icon: Plus,
  },
  edit: {
    title: "Editar cancha",
    subtitle: "Actualiza la información pública de tu cancha.",
    submit: "Guardar cambios",
    Icon: Pencil,
  },
  admin: {
    title: "Editar cancha",
    subtitle: "Ficha pública, tarifa, horario y estado de moderación.",
    submit: "Guardar cambios",
    Icon: Pencil,
  },
};

function Notice({ tone = "amber", children }) {
  const cls =
    tone === "amber"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-line bg-zinc-50 text-fg-muted";
  const Icon = tone === "amber" ? TriangleAlert : Info;
  return (
    <div className={`flex gap-2 rounded-md border px-3 py-2 text-[13px] ${cls}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}

Notice.propTypes = { tone: PropTypes.oneOf(["amber", "neutral"]), children: PropTypes.node };

function OwnerCard({ ownerId, open }) {
  const [state, setState] = useState({ loading: false, owner: null, id: null });

  useEffect(() => {
    if (!open || !ownerId) return undefined;
    let cancelled = false;
    setState({ loading: true, owner: null, id: ownerId });
    getUserProfileById(ownerId)
      .then((owner) => {
        if (!cancelled) setState({ loading: false, owner, id: ownerId });
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, owner: null, id: ownerId });
      });
    return () => {
      cancelled = true;
    };
  }, [ownerId, open]);

  if (!ownerId) return <p className="text-[13px] text-fg-muted">Sin titular asignado.</p>;
  if (state.loading || state.id !== ownerId) {
    return (
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
    );
  }
  if (!state.owner) return <p className="text-[13px] text-fg-muted">No se pudo cargar al titular.</p>;
  return (
    <div className="flex items-center gap-3">
      <Avatar src={state.owner.photoURL} name={state.owner.name} size="sm" />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-fg-strong">{state.owner.name || "Sin nombre"}</p>
        <p className="truncate text-xs text-fg-subtle">{state.owner.email || "Sin correo"}</p>
      </div>
    </div>
  );
}

OwnerCard.propTypes = { ownerId: PropTypes.string, open: PropTypes.bool };

/**
 * Modal único para crear/editar canchas.
 * - mode="create": asociado registra una cancha (nace "pending").
 * - mode="edit":   asociado edita su cancha (approved/rejected vuelven a "pending").
 * - mode="admin":  admin edita cualquier cancha, ve al titular y puede cambiar el estado.
 *
 * onSubmit(payload, { imageFile, onProgress }) para create: la cancha aún no tiene id y
 *   storage.rules exige que exista, así que el padre crea y DESPUÉS sube (createFieldWithImage).
 * onSubmit(fieldId, payload) para edit/admin: si hay archivo nuevo, el modal lo sube antes a
 *   fields/{id}/… y entrega en payload.imageUrl la URL de descarga.
 */
function FieldFormModal({ open, mode = "create", field = null, loading = false, onClose, onSubmit }) {
  const [values, setValues] = useState(EMPTY_FIELD_VALUES);
  const [status, setStatus] = useState("pending");
  const [submitted, setSubmitted] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [progress, setProgress] = useState(null);
  const [uploading, setUploading] = useState(false);
  // Última subida hecha en esta sesión del modal: si falla el guardado, reintentar no re-sube.
  const uploadedRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setValues(mode === "create" ? { ...EMPTY_FIELD_VALUES } : fieldToValues(field));
    setStatus(field?.status || "pending");
    setSubmitted(false);
    setImageFile(null);
    setImageError(null);
    setProgress(null);
    setUploading(false);
    uploadedRef.current = null;
  }, [open, mode, field]);

  // Con archivo seleccionado la URL escrita se ignora (y su campo queda deshabilitado).
  const validatedValues = useMemo(
    () => (imageFile ? { ...values, imageUrl: "" } : values),
    [imageFile, values]
  );
  const errors = useMemo(
    () => (submitted ? validateFieldValues(validatedValues) : {}),
    [submitted, validatedValues]
  );
  const copy = COPY[mode] || COPY.create;
  const formId = `field-form-${mode}`;
  const busy = loading || uploading;

  if (mode !== "create" && !field) return null;

  const uploadIfNeeded = async () => {
    if (!imageFile) return undefined;
    if (uploadedRef.current?.file === imageFile) return uploadedRef.current.url;
    setUploading(true);
    setImageError(null);
    setProgress(0);
    try {
      const url = await uploadFieldImage(imageFile, field.id, { onProgress: setProgress });
      uploadedRef.current = { file: imageFile, url };
      return url;
    } finally {
      setUploading(false);
      setProgress(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setSubmitted(true);
    const nextErrors = validateFieldValues(validatedValues);
    if (Object.keys(nextErrors).length > 0) return;
    const payload = valuesToPayload(validatedValues);

    if (mode === "create") {
      onSubmit(payload, { imageFile, onProgress: setProgress });
      return;
    }

    let uploadedUrl;
    try {
      uploadedUrl = await uploadIfNeeded();
    } catch (error) {
      setImageError(error.message || "No se pudo subir la imagen.");
      return;
    }
    const data = uploadedUrl ? { ...payload, imageUrl: uploadedUrl } : payload;
    if (mode === "admin") onSubmit(field.id, { ...data, status });
    else onSubmit(field.id, data);
  };

  // En create el progreso lo reporta el padre mientras `loading`.
  const shownProgress = uploading || (loading && mode === "create" && imageFile) ? progress : null;

  const currentStatus = field ? getFieldStatusMeta(field.status) : null;
  const errorCount = Object.keys(errors).length;

  return (
    <Modal
      open={open}
      onClose={busy ? undefined : onClose}
      size="lg"
      title={copy.title}
      subtitle={copy.subtitle}
      icon={<copy.Icon className="h-4 w-4" aria-hidden />}
      bodyClassName="space-y-6"
      footerSticky
      footer={
        <>
          {errorCount > 0 && (
            <p className="text-xs text-red-600 sm:mr-auto" role="alert">
              Revisa {errorCount === 1 ? "1 campo" : `${errorCount} campos`} marcados.
            </p>
          )}
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} loading={busy}>
            {typeof shownProgress === "number" ? `Subiendo imagen… ${shownProgress}%` : copy.submit}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-6">
        {mode === "admin" && (
          <section className="grid gap-4 rounded-lg border border-line p-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-medium text-fg-muted">Titular</p>
              <OwnerCard ownerId={field.ownerId} open={open} />
            </div>
            <FieldShell id={`${formId}-status`} label="Estado de moderación" hint={`ID ${field.id}`}>
              <SegmentedControl
                aria-label="Estado de moderación"
                size="sm"
                items={STATUS_ITEMS}
                value={status}
                onChange={setStatus}
                className="flex-wrap"
              />
            </FieldShell>
          </section>
        )}

        {mode === "edit" && currentStatus && (
          <div className="flex items-center gap-2 text-[13px] text-fg-muted">
            Estado actual
            <StatusPill tone={currentStatus.tone} size="sm" dot>
              {currentStatus.label}
            </StatusPill>
          </div>
        )}

        <FieldFormFields
          values={values}
          errors={errors}
          onChange={setValues}
          disabled={busy}
          idPrefix={formId}
          image={{
            file: imageFile,
            error: imageError,
            progress: shownProgress,
            onFileChange: setImageFile,
            onError: setImageError,
          }}
        />

        {mode === "create" && (
          <Notice>
            La cancha quedará <strong>Pendiente</strong> hasta que un administrador la apruebe.
          </Notice>
        )}
        {mode === "edit" && (field.status === "approved" || field.status === "rejected") && (
          <Notice>
            Al guardar, la cancha vuelve a <strong>Pendiente</strong> y un administrador debe revisarla de
            nuevo antes de mostrarse a los clientes.
          </Notice>
        )}
      </form>
    </Modal>
  );
}

FieldFormModal.propTypes = {
  open: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(["create", "edit", "admin"]),
  field: PropTypes.object,
  loading: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default FieldFormModal;
