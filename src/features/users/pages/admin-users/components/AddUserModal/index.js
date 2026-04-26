import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { UserPlus, User, Mail, Lock, Shield, Briefcase, Save } from "lucide-react";
import { Modal, Button, TextField, SelectField } from "shared/components/ui";

const ROLE_OPTIONS = [
  { value: "cliente", label: "Cliente — Reserva canchas" },
  { value: "asociado", label: "Asociado — Gestiona sus canchas" },
  { value: "admin", label: "Administrador — Acceso total" },
];

function AddUserModal({ open, onClose, onSubmit, loading }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("cliente");

  useEffect(() => {
    if (!open) {
      setName("");
      setEmail("");
      setPassword("");
      setRole("cliente");
    }
  }, [open]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!loading) onSubmit({ name, email, password, role });
  };

  const RoleIcon = role === "admin" ? Shield : role === "asociado" ? Briefcase : User;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      eyebrow="Administración · Usuarios"
      title="Crear nuevo usuario"
      subtitle="El usuario recibirá su contraseña temporal y deberá cambiarla en su primer ingreso."
      icon={<UserPlus className="h-[22px] w-[22px] shrink-0" strokeWidth={2} aria-hidden />}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="add-user-form"
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            <Save className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
            Crear usuario
          </Button>
        </>
      }
    >
      <form id="add-user-form" onSubmit={handleSubmit} className="space-y-5">
        <TextField
          id="user-name"
          label="Nombre completo"
          required
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. María Rodríguez"
          leftIcon={<User className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />}
        />
        <TextField
          id="user-email"
          label="Correo electrónico"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="usuario@correo.com"
          leftIcon={<Mail className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />}
        />
        <TextField
          id="user-password"
          label="Contraseña temporal"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          hint="El usuario deberá cambiarla en su primer inicio de sesión."
          leftIcon={<Lock className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />}
        />
        <SelectField
          id="user-role"
          label="Rol del usuario"
          required
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={ROLE_OPTIONS}
          hint={
            <span className="inline-flex items-center gap-1.5 text-slate-500">
              <RoleIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
              Define qué puede hacer dentro de GoalTime.
            </span>
          }
        />
      </form>
    </Modal>
  );
}

AddUserModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

AddUserModal.defaultProps = {
  loading: false,
};

export default AddUserModal;
