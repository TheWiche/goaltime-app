import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Shield, User, Briefcase } from "lucide-react";
import { Avatar, Modal, Button, StatusPill, cx } from "shared/components/ui";

const ROLE_OPTIONS = [
  {
    value: "cliente",
    label: "Cliente",
    description: "Puede reservar canchas y ver sus reservas.",
    Icon: User,
  },
  {
    value: "asociado",
    label: "Asociado",
    description: "Gestiona sus canchas, horarios y reservas.",
    Icon: Briefcase,
  },
  {
    value: "admin",
    label: "Administrador",
    description: "Control total: usuarios, canchas y moderación.",
    Icon: Shield,
  },
];

const ROLE_LABEL = Object.fromEntries(ROLE_OPTIONS.map((o) => [o.value, o.label]));

function EditUserRoleModal({ open, onClose, onSubmit, loading, user }) {
  const [newRole, setNewRole] = useState("cliente");

  useEffect(() => {
    if (user && open) setNewRole(user.role || "cliente");
  }, [user, open]);

  if (!user) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!loading && newRole !== (user.role || "cliente")) onSubmit(user, newRole);
  };

  const isUnchanged = newRole === (user.role || "cliente");

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      closeOnBackdrop={!loading}
      closeOnEsc={!loading}
      size="md"
      eyebrow="Administración · Usuarios"
      title="Editar rol del usuario"
      subtitle="El cambio se aplica de inmediato al guardar."
      icon={<Shield className="h-4 w-4" strokeWidth={1.75} aria-hidden />}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" form="edit-role-form" loading={loading} disabled={isUnchanged}>
            Guardar rol
          </Button>
        </>
      }
    >
      <form id="edit-role-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-3 rounded-lg border border-line bg-zinc-50 p-3">
          <Avatar src={user.photoURL} name={user.name || user.email} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-fg-strong">{user.name || "Usuario"}</p>
            <p className="truncate text-[13px] text-fg-muted">{user.email || "Sin correo"}</p>
            <StatusPill tone="neutral" size="sm" className="mt-1.5">
              Rol actual: {ROLE_LABEL[user.role] || user.role || "Cliente"}
            </StatusPill>
          </div>
        </div>

        <fieldset className="m-0 min-w-0 border-0 p-0" disabled={loading}>
          <legend className="mb-2 p-0 text-[13px] font-medium text-fg">Selecciona un rol</legend>
          <div className="space-y-2">
            {ROLE_OPTIONS.map((opt) => {
              const checked = newRole === opt.value;
              const id = `edit-role-${opt.value}`;
              return (
                <label
                  key={opt.value}
                  htmlFor={id}
                  className={cx(
                    "flex cursor-pointer items-start gap-3 rounded-md border px-3.5 py-3 transition-colors duration-150",
                    "focus-within:ring-2 focus-within:ring-primary-500/40",
                    checked
                      ? "border-primary-500 bg-primary-50/50"
                      : "border-line bg-white hover:border-line-strong hover:bg-zinc-50"
                  )}
                >
                  <input
                    id={id}
                    type="radio"
                    name="user-role"
                    value={opt.value}
                    checked={checked}
                    onChange={() => setNewRole(opt.value)}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary-600"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-fg-strong">
                      <opt.Icon className="h-3.5 w-3.5 text-fg-subtle" aria-hidden />
                      {opt.label}
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-5 text-fg-muted">
                      {opt.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          {!isUnchanged && (
            <p className="mt-3 text-xs text-fg-muted">
              {newRole === "admin" || ROLE_OPTIONS.findIndex((o) => o.value === newRole) <
                ROLE_OPTIONS.findIndex((o) => o.value === (user.role || "cliente"))
                ? "Este cambio pedirá una confirmación adicional."
                : "El nuevo rol se aplica en cuanto guardes."}
            </p>
          )}
        </fieldset>
      </form>
    </Modal>
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
