import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Info, Pencil, Plus, TriangleAlert } from "lucide-react";
import { Avatar, Button, Modal, SegmentedControl, Skeleton, StatusPill, FieldShell } from "shared/components/ui";
import { getUserProfileById } from "shared/services/firebaseService";
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
 * onSubmit(payload) para create; onSubmit(fieldId, payload) para edit/admin.
 */
function FieldFormModal({ open, mode = "create", field = null, loading = false, onClose, onSubmit }) {
  const [values, setValues] = useState(EMPTY_FIELD_VALUES);
  const [status, setStatus] = useState("pending");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(mode === "create" ? { ...EMPTY_FIELD_VALUES } : fieldToValues(field));
    setStatus(field?.status || "pending");
    setSubmitted(false);
  }, [open, mode, field]);

  const errors = useMemo(() => (submitted ? validateFieldValues(values) : {}), [submitted, values]);
  const copy = COPY[mode] || COPY.create;
  const formId = `field-form-${mode}`;

  if (mode !== "create" && !field) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (loading) return;
    setSubmitted(true);
    const nextErrors = validateFieldValues(values);
    if (Object.keys(nextErrors).length > 0) return;
    const payload = valuesToPayload(values);
    if (mode === "create") onSubmit(payload);
    else if (mode === "admin") onSubmit(field.id, { ...payload, status });
    else onSubmit(field.id, payload);
  };

  const currentStatus = field ? getFieldStatusMeta(field.status) : null;
  const errorCount = Object.keys(errors).length;

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
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
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} loading={loading}>
            {copy.submit}
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
          disabled={loading}
          idPrefix={formId}
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
