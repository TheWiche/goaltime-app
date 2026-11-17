import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, TextField, Toast, cx } from "shared/components/ui";
import AuthShell from "features/auth/components/AuthShell";
import PasswordField from "features/auth/components/PasswordField";
import SocialButtons from "features/auth/components/SocialButtons";
import {
  MIN_PASSWORD_LENGTH,
  getAuthErrorMessage,
  getAuthErrorType,
} from "features/auth/utils/authErrors";
import { registerUser, signInWithFacebook, signInWithGoogle } from "shared/services/firebaseService";

const ASIDE = {
  heading: "Únete a GoalTime.",
  description: "Crea tu cuenta gratis y empieza a reservar canchas en Riohacha en menos de un minuto.",
  points: [
    "Reserva en línea sin llamadas ni mensajes",
    "Ve la disponibilidad real de cada cancha",
    "Gestiona todas tus reservas desde un solo lugar",
  ],
};

const EMAIL_RE = /^\S+@\S+\.\S+$/;

const STRENGTH_LEVELS = [
  { label: "Muy débil", bar: "bg-red-500", text: "text-red-700" },
  { label: "Débil", bar: "bg-red-500", text: "text-red-700" },
  { label: "Media", bar: "bg-amber-500", text: "text-amber-700" },
  { label: "Fuerte", bar: "bg-green-500", text: "text-green-700" },
  { label: "Muy fuerte", bar: "bg-green-600", text: "text-green-700" },
];

const getStrength = (pwd) => {
  if (!pwd) return null;
  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
  return { score, ...STRENGTH_LEVELS[score] };
};

function StrengthMeter({ password }) {
  const strength = useMemo(() => getStrength(password), [password]);
  if (!strength) return null;
  return (
    <div className="mt-1" aria-live="polite">
      <div className="flex gap-1" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cx("h-1 flex-1 rounded-sm", i < Math.max(strength.score, 1) ? strength.bar : "bg-zinc-200")}
          />
        ))}
      </div>
      <p className={cx("mt-1 text-xs", strength.text)}>Seguridad: {strength.label}</p>
    </div>
  );
}

function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(null); // null | "email" | "google" | "facebook"
  const [toast, setToast] = useState({ open: false, type: "error", message: "" });

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const errors = {
    name: !form.name.trim() ? "Ingresa tu nombre completo." : null,
    email: !EMAIL_RE.test(form.email.trim()) ? "Ingresa un correo electrónico válido." : null,
    password:
      form.password.length < MIN_PASSWORD_LENGTH
        ? `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
        : null,
    confirm:
      form.confirm && form.password !== form.confirm
        ? "Las contraseñas no coinciden."
        : !form.confirm
        ? "Confirma tu contraseña."
        : null,
    terms: !agreeTerms ? "Debes aceptar los términos y la política de privacidad." : null,
  };
  // Errores visibles: el de coincidencia se muestra mientras se escribe; el resto, tras intentar enviar.
  const visible = {
    name: submitted ? errors.name : null,
    email: submitted ? errors.email : null,
    password: submitted || form.password ? errors.password : null,
    confirm: form.confirm && form.password !== form.confirm ? errors.confirm : submitted ? errors.confirm : null,
    terms: submitted ? errors.terms : null,
  };

  const notify = (code) =>
    setToast({ open: true, message: getAuthErrorMessage(code), type: getAuthErrorType(code) });

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (busy || errors.name || errors.email || errors.password || errors.confirm || errors.terms) return;

    setBusy("email");
    try {
      const profile = await registerUser(form.name.trim(), form.email.trim(), form.password);
      // El registro ya inició sesión: verify-email gestiona el resto (y permite reenviar el correo).
      navigate("/authentication/verify-email", {
        replace: true,
        state: { sendErrorCode: profile?.emailVerificationError?.code || null },
      });
    } catch (error) {
      notify(error.code);
      setBusy(null);
    }
  };

  const handleSocial = async (provider) => {
    if (busy) return;
    setBusy(provider);
    try {
      const signIn = provider === "google" ? signInWithGoogle : signInWithFacebook;
      await signIn();
      // GuestRoute (sign-in) espera el perfil y redirige al home del rol sin condiciones de carrera.
      navigate("/authentication/sign-in", { replace: true });
    } catch (error) {
      notify(error.code);
      setBusy(null);
    }
  };

  const disabled = Boolean(busy);

  return (
    <AuthShell
      title="Crear cuenta"
      subtitle="Empieza a reservar canchas en menos de un minuto."
      aside={ASIDE}
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link to="/authentication/sign-in" className="font-medium text-primary-600 hover:underline">
            Iniciar sesión
          </Link>
        </>
      }
    >
      <SocialButtons
        onSelect={handleSocial}
        loadingProvider={busy === "google" || busy === "facebook" ? busy : null}
        disabled={disabled}
      />

      <form onSubmit={handleRegister} className="space-y-4" noValidate>
        <TextField
          id="signup-name"
          name="name"
          size="lg"
          label="Nombre completo"
          placeholder="Juan Pérez"
          autoComplete="name"
          value={form.name}
          onChange={setField("name")}
          error={visible.name}
          disabled={disabled}
        />
        <TextField
          id="signup-email"
          name="email"
          type="email"
          size="lg"
          label="Correo electrónico"
          placeholder="nombre@ejemplo.com"
          autoComplete="email"
          inputMode="email"
          value={form.email}
          onChange={setField("email")}
          error={visible.email}
          disabled={disabled}
        />

        <div>
          <PasswordField
            id="signup-password"
            name="password"
            label="Contraseña"
            placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
            autoComplete="new-password"
            value={form.password}
            onChange={setField("password")}
            error={visible.password}
            disabled={disabled}
          />
          <StrengthMeter password={form.password} />
        </div>

        <PasswordField
          id="signup-confirm"
          name="confirmPassword"
          label="Confirmar contraseña"
          placeholder="Repite tu contraseña"
          autoComplete="new-password"
          value={form.confirm}
          onChange={setField("confirm")}
          error={visible.confirm}
          disabled={disabled}
        />

        <div>
          <div className="flex items-start gap-2">
            <input
              id="signup-terms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              aria-invalid={Boolean(visible.terms) || undefined}
              aria-describedby={visible.terms ? "signup-terms-error" : undefined}
              className="mt-0.5 h-4 w-4 shrink-0 rounded-sm border-line-strong accent-primary-600"
            />
            <label htmlFor="signup-terms" className="text-[13px] leading-5 text-fg-muted">
              Acepto los{" "}
              <Link
                to="/terminos-y-condiciones"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary-600 hover:underline"
              >
                Términos y Condiciones
              </Link>{" "}
              y la{" "}
              <Link
                to="/politica-de-privacidad"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary-600 hover:underline"
              >
                Política de Privacidad
              </Link>
              .
            </label>
          </div>
          {visible.terms && (
            <p id="signup-terms-error" className="mt-1.5 text-xs text-red-600">
              {visible.terms}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" fullWidth loading={busy === "email"} disabled={disabled}>
          {busy === "email" ? "Creando cuenta…" : "Crear cuenta"}
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

export default SignUp;
