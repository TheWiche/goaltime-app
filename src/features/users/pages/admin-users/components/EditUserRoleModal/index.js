import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Shield, User, Briefcase, Save } from "lucide-react";
import { Modal, Button, SectionCard, StatusPill } from "shared/components/ui";

const ROLE_OPTIONS = [
  {
    value: "cliente",
    label: "Cliente",
    description: "Puede reservar canchas y ver sus reservas.",
    Icon: User,
    tone: "info",
  },
  {
    value: "asociado",
    label: "Asociado",
    description: "Gestiona sus canchas, horarios y reservas.",
    Icon: Briefcase,
    tone: "warning",
  },
  {
    value: "admin",
    label: "Administrador",
    description: "Control total: usuarios, canchas, moderación.",
    Icon: Shield,
    tone: "danger",
  },
];

function EditUserRoleModal({ open, onClose, onSubmit, loading, user }) {
  const [newRole, setNewRole] = useState("cliente");

  useEffect(() => {
    if (user && open) {
      setNewRole(user.role || "cliente");
    }
  }, [user, open]);

  if (!user) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!loading) onSubmit(user, newRole);
  };

  const isUnchanged = newRole === user.role;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      eyebrow="Administración · Usuarios"
      title="Editar rol del usuario"
      subtitle="Asigna los permisos del usuario en GoalTime. El cambio aplica inmediatamente al guardar."
      icon={<Shield className="h-[22px] w-[22px] shrink-0" strokeWidth={2} aria-hidden />}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="edit-role-form"
            variant="primary"
            loading={loading}
            disabled={loading || isUnchanged}
          >
            <Save className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
            Guardar rol
          </Button>
        </>
      }
    >
      <form id="edit-role-form" onSubmit={handleSubmit} className="space-y-6">
        <SectionCard
          eyebrow="Cuenta"
          title="Datos del usuario"
          padding="p-5"
          className="bg-slate-50/60"
        >
          <div className="flex items-center gap-4">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.name || "Usuario"}
                className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
            ) : (
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white shadow-sm"
                style={{ background: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)" }}
              >
                {user.name ? user.name[0].toUpperCase() : "?"}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold font-heading text-slate-900 truncate">
                {user.name || "Usuario"}
              </p>
              <p className="text-sm text-slate-500 truncate">{user.email || "Sin correo"}</p>
              <div className="mt-2">
                <StatusPill tone="neutral" size="sm" dot>
                  Rol actual: {user.role || "cliente"}
                </StatusPill>
              </div>
            </div>
          </div>
        </SectionCard>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-3">
            Selecciona un rol
          </p>
          <div className="grid grid-cols-1 gap-3">
            {ROLE_OPTIONS.map((opt) => {
              const active = newRole === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setNewRole(opt.value)}
                  disabled={loading}
                  className={[
                    "group flex items-start gap-4 text-left rounded-xl border px-4 py-4 transition-all duration-200 cursor-pointer",
                    "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20",
                    active
                      ? "border-primary bg-primary-50/60 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                      active
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-200",
                    ].join(" ")}
                  >
                    <opt.Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold font-heading text-slate-900">
                        {opt.label}
                      </span>
                      {active && (
                        <StatusPill tone="info" size="sm">
                          Seleccionado
                        </StatusPill>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">{opt.description}</p>
                  </div>
                  <span
                    aria-hidden="true"
                    className={[
                      "mt-1 w-4 h-4 rounded-full border-2 transition-colors",
                      active ? "border-primary bg-primary" : "border-slate-300 bg-white",
                    ].join(" ")}
                  />
                </button>
              );
            })}
          </div>
        </div>
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
