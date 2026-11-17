import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, TextField, Toast } from "shared/components/ui";
import AuthShell from "features/auth/components/AuthShell";
import PasswordField from "features/auth/components/PasswordField";
import SocialButtons from "features/auth/components/SocialButtons";
import { getAuthErrorMessage, getAuthErrorType } from "features/auth/utils/authErrors";
import { loginUser, signInWithGoogle, signInWithFacebook } from "shared/services/firebaseService";
import { getHomePathForRole } from "shared/utils/url";

const CREDENTIAL_ERRORS = ["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found"];

const ASIDE = {
  heading: "Vuelve al juego.",
  description: "Reserva tu cancha favorita en segundos. Tus partidos te están esperando.",
  points: [
    "Disponibilidad de horarios en tiempo real",
    "Confirmaciones y avisos por correo",
    "Tus reservas y canchas favoritas en un solo lugar",
  ],
};

function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [busy, setBusy] = useState(null); // null | "email" | "google" | "facebook"
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [toast, setToast] = useState({ open: false, message: "", type: "error" });

  const notify = (code) =>
    setToast({ open: true, message: getAuthErrorMessage(code), type: getAuthErrorType(code) });

  const goHome = (profile) => navigate(getHomePathForRole(profile?.role), { replace: true });

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setFailedAttempts(0);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy("email");
    try {
      const profile = await loginUser(email.trim(), password, rememberMe);
      setFailedAttempts(0);
      goHome(profile);
    } catch (error) {
      if (error.code === "auth/email-not-verified") {
        navigate("/authentication/verify-email", { replace: true });
        return;
      }
      if (CREDENTIAL_ERRORS.includes(error.code)) setFailedAttempts((n) => n + 1);
      notify(error.code);
    } finally {
      setBusy(null);
    }
  };

  const handleSocial = async (provider) => {
    if (busy) return;
    setBusy(provider);
    try {
      const signIn = provider === "google" ? signInWithGoogle : signInWithFacebook;
      goHome(await signIn());
    } catch (error) {
      notify(error.code);
    } finally {
      setBusy(null);
    }
  };

  const showResetHint = failedAttempts >= 2;

  return (
    <AuthShell
      title="Iniciar sesión"
      subtitle="¿Listo para tu próximo partido? Ingresa para continuar."
      aside={ASIDE}
      footer={
        <>
          ¿No tienes una cuenta?{" "}
          <Link to="/authentication/sign-up" className="font-medium text-primary-600 hover:underline">
            Crear cuenta
          </Link>
        </>
      }
    >
      <SocialButtons onSelect={handleSocial} loadingProvider={busy === "google" || busy === "facebook" ? busy : null} disabled={Boolean(busy)} />

      <form onSubmit={handleLogin} className="space-y-4">
        <TextField
          id="signin-email"
          name="email"
          type="email"
          size="lg"
          label="Correo electrónico"
          placeholder="nombre@ejemplo.com"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={handleEmailChange}
          required
          disabled={Boolean(busy)}
        />

        <PasswordField
          id="signin-password"
          name="password"
          label="Contraseña"
          placeholder="Tu contraseña"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={Boolean(busy)}
          labelAside={
            <Link
              to="/authentication/reset-password"
              className="text-[13px] font-medium text-primary-600 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          }
        />

        <label htmlFor="signin-remember" className="flex cursor-pointer select-none items-center gap-2">
          <input
            id="signin-remember"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded-sm border-line-strong accent-primary-600"
          />
          <span className="text-sm text-fg-muted">Recordarme en este dispositivo</span>
        </label>

        {showResetHint && (
          <div
            role="status"
            className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-800"
          >
            ¿Problemas para entrar?{" "}
            <Link to="/authentication/reset-password" className="font-medium underline">
              Restablece tu contraseña
            </Link>
            .
          </div>
        )}

        <Button type="submit" size="lg" fullWidth loading={busy === "email"} disabled={Boolean(busy)}>
          {busy === "email" ? "Entrando…" : "Iniciar sesión"}
        </Button>
      </form>

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </AuthShell>
  );
}

export default SignIn;
