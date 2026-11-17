import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { verifyPasswordResetCode } from "firebase/auth";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Button, Spinner, Toast } from "shared/components/ui";
import ButtonLink from "shared/components/layout/ButtonLink";
import AuthShell from "features/auth/components/AuthShell";
import PasswordField from "features/auth/components/PasswordField";
import {
  MIN_PASSWORD_LENGTH,
  getAuthErrorMessage,
} from "features/auth/utils/authErrors";
import { auth, resetPassword } from "shared/services/firebaseService";

const ASIDE = {
  heading: "Crea una nueva contraseña.",
  description: "Elige una contraseña que no uses en otros sitios.",
  points: [
    `Mínimo ${MIN_PASSWORD_LENGTH} caracteres`,
    "Combina letras, números y símbolos",
    "Después podrás iniciar sesión normalmente",
  ],
};

const REDIRECT_DELAY_MS = 2500;

function ConfirmResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get("oobCode") || searchParams.get("oobcode");

  // "checking" | "valid" | "invalid" | "done"
  const [status, setStatus] = useState(oobCode ? "checking" : "invalid");
  const [accountEmail, setAccountEmail] = useState("");
  const [invalidMessage, setInvalidMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, type: "error", message: "" });

  // Valida el código del enlace al montar (antes de pedir la contraseña).
  useEffect(() => {
    if (!oobCode) {
      setStatus("invalid");
      return undefined;
    }
    let cancelled = false;
    setStatus("checking");
    verifyPasswordResetCode(auth, oobCode)
      .then((email) => {
        if (cancelled) return;
        setAccountEmail(email || "");
        setStatus("valid");
      })
      .catch((error) => {
        if (cancelled) return;
        setInvalidMessage(getAuthErrorMessage(error.code));
        setStatus("invalid");
      });
    return () => {
      cancelled = true;
    };
  }, [oobCode]);

  // Tras restablecer, redirige a iniciar sesión (el timer se limpia al desmontar).
  useEffect(() => {
    if (status !== "done") return undefined;
    const timer = setTimeout(() => navigate("/authentication/sign-in", { replace: true }), REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [status, navigate]);

  const passwordError =
    password.length < MIN_PASSWORD_LENGTH
      ? `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
      : null;
  const confirmError = password !== confirm ? "Las contraseñas no coinciden." : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (saving || passwordError || confirmError) return;
    setSaving(true);
    try {
      await resetPassword(oobCode, password);
      setStatus("done");
    } catch (error) {
      if (error.code === "auth/expired-action-code" || error.code === "auth/invalid-action-code") {
        setInvalidMessage(getAuthErrorMessage(error.code));
        setStatus("invalid");
      } else {
        setToast({ open: true, type: "error", message: getAuthErrorMessage(error.code) });
      }
    } finally {
      setSaving(false);
    }
  };

  if (status === "checking") {
    return (
      <AuthShell title="Validando enlace" aside={ASIDE} backTo="/authentication/sign-in" backLabel="Iniciar sesión">
        <div className="flex items-center gap-3 text-sm text-fg-muted" role="status">
          <Spinner size="sm" label="Validando enlace" />
          Comprobando tu enlace de restablecimiento…
        </div>
      </AuthShell>
    );
  }

  if (status === "invalid") {
    return (
      <AuthShell
        title="Enlace no válido"
        subtitle="El enlace de restablecimiento no es válido o ya expiró."
        aside={ASIDE}
        backTo="/authentication/sign-in"
        backLabel="Iniciar sesión"
      >
        <div className="mb-6 flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-[13px] leading-5 text-red-700">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {invalidMessage || "Solicita un nuevo enlace para continuar."}
        </div>
        <div className="space-y-2">
          <ButtonLink to="/authentication/reset-password" size="lg" fullWidth>
            Solicitar un nuevo enlace
          </ButtonLink>
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

  if (status === "done") {
    return (
      <AuthShell title="Contraseña actualizada" aside={ASIDE} backTo="/authentication/sign-in" backLabel="Iniciar sesión">
        <div
          role="status"
          className="mb-6 flex items-start gap-3 rounded-md border border-green-200 bg-green-50 p-3 text-[13px] leading-5 text-green-700"
        >
          <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Tu contraseña se restableció correctamente. Te llevaremos a iniciar sesión.
        </div>
        <Button type="button" size="lg" fullWidth onClick={() => navigate("/authentication/sign-in", { replace: true })}>
          Iniciar sesión
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Nueva contraseña"
      subtitle={
        accountEmail ? (
          <>
            Crea una nueva contraseña para <strong className="font-medium text-fg">{accountEmail}</strong>.
          </>
        ) : (
          "Ingresa tu nueva contraseña para completar el restablecimiento."
        )
      }
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
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Campo oculto para que los gestores de contraseñas asocien la cuenta */}
        <input type="email" name="username" value={accountEmail} autoComplete="username" readOnly hidden />
        <PasswordField
          id="reset-password"
          name="password"
          label="Nueva contraseña"
          placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={submitted ? passwordError : null}
          disabled={saving}
        />
        <PasswordField
          id="reset-password-confirm"
          name="confirmPassword"
          label="Confirmar contraseña"
          placeholder="Repite la contraseña"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={submitted || confirm ? confirmError : null}
          disabled={saving}
        />
        <Button type="submit" size="lg" fullWidth loading={saving}>
          {saving ? "Restableciendo…" : "Restablecer contraseña"}
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

export default ConfirmResetPassword;
