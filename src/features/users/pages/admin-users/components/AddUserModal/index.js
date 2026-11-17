import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { UserPlus, User, Mail, Lock } from "lucide-react";
import { Modal, Button, TextField, SelectField } from "shared/components/ui";

const ROLE_OPTIONS = [
  { value: "cliente", label: "Cliente: reserva canchas" },
  { value: "asociado", label: "Asociado: gestiona sus canchas" },
  { value: "admin", label: "Administrador: acceso total" },
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
    if (loading) return;
    onSubmit({ name: name.trim(), email: email.trim(), password, role });
  };

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      closeOnBackdrop={!loading}
      closeOnEsc={!loading}
      size="md"
      eyebrow="Administración · Usuarios"
      title="Crear nuevo usuario"
      subtitle="Recibirá una contraseña temporal y deberá cambiarla en su primer ingreso."
      icon={<UserPlus className="h-4 w-4" strokeWidth={1.75} aria-hidden />}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" form="add-user-form" loading={loading}>
            Crear usuario
          </Button>
        </>
      }
    >
      <form id="add-user-form" onSubmit={handleSubmit} className="space-y-4">
        <TextField
          id="user-name"
          label="Nombre completo"
          required
          data-autofocus
          autoComplete="off"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. María Rodríguez"
          leftIcon={<User aria-hidden />}
        />
        <TextField
          id="user-email"
          label="Correo electrónico"
          type="email"
          required
          autoComplete="off"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="usuario@correo.com"
          leftIcon={<Mail aria-hidden />}
        />
        <TextField
          id="user-password"
          label="Contraseña temporal"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          hint="El usuario deberá cambiarla en su primer inicio de sesión."
          leftIcon={<Lock aria-hidden />}
        />
        <SelectField
          id="user-role"
          label="Rol del usuario"
          required
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={ROLE_OPTIONS}
          hint="Define qué puede hacer dentro de GoalTime."
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
