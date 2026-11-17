import { useState } from "react";
import { Link } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { Button, TextField, Toast } from "shared/components/ui";
import AuthShell from "features/auth/components/AuthShell";
import { getAuthErrorMessage } from "features/auth/utils/authErrors";
import { sendPasswordReset } from "shared/services/firebaseService";

const ASIDE = {
  heading: "Recupera el acceso a tu cuenta.",
  description: "Te enviaremos un enlace seguro al correo con el que te registraste.",
  points: [
    "El enlace funciona una sola vez",
    "Revisa también tu carpeta de spam",
    "Si no lo recibes, puedes solicitar otro",
  ],
};

const getErrorMessage = (code) => {
  if (code === "auth/user-not-found") return "No existe una cuenta con este correo electrónico.";
  if (code === "auth/unauthorized-continue-uri" || code === "auth/invalid-continue-uri") {
    return "La URL de redirección no está autorizada. Contacta al administrador.";
  }
  return getAuthErrorMessage(code);
};

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState(null);
  const [toast, setToast] = useState({ open: false, type: "error", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = email.trim();
    if (!value || loading) return;
    setLoading(true);
    try {
      await sendPasswordReset(value);
      setSentTo(value);
    } catch (error) {
      setToast({ open: true, type: "error", message: getErrorMessage(error.code) });
    } finally {
      setLoading(false);
    }
  };

  if (sentTo) {
    return (
      <AuthShell
        title="Revisa tu correo"
        subtitle={
          <>
            Enviamos las instrucciones para restablecer tu contraseña a{" "}
            <strong className="font-medium text-fg">{sentTo}</strong>.
          </>
        }
        aside={ASIDE}
        backTo="/authentication/sign-in"
        backLabel="Iniciar sesión"
      >
        <div className="mb-6 flex items-start gap-3 rounded-md border border-line bg-zinc-50 p-3 text-[13px] leading-5 text-fg-muted">
          <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" aria-hidden="true" />
          Si no lo encuentras en unos minutos, revisa la carpeta de spam o correo no deseado.
        </div>
        <div className="space-y-2">
          <Button type="button" variant="secondary" size="lg" fullWidth onClick={() => setSentTo(null)}>
            Usar otro correo
          </Button>
          <Link
            to="/authentication/sign-in"
            className="block py-2 text-center text-sm font-medium text-primary-600 hover:underline"
          >
            Volver a iniciar sesión
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Restablecer contraseña"
      subtitle="Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña."
      aside={ASIDE}
      backTo="/authentication/sign-in"
      backLabel="Iniciar sesión"
      footer={
        <>
          ¿Recordaste tu contraseña?{" "}
          <Link to="/authentication/sign-in" className="font-medium text-primary-600 hover:underline">
            Iniciar sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          id="reset-email"
          name="email"
          type="email"
          size="lg"
          label="Correo electrónico"
          placeholder="nombre@ejemplo.com"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <Button type="submit" size="lg" fullWidth loading={loading}>
          {loading ? "Enviando…" : "Enviar enlace"}
        </Button>
      </form>

      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </AuthShell>
  );
}

export default ResetPassword;
