import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { CircleAlert, CircleCheck, Mail, RefreshCw } from "lucide-react";
import { Button, Spinner, Toast } from "shared/components/ui";
import ButtonLink from "shared/components/layout/ButtonLink";
import AuthShell from "features/auth/components/AuthShell";
import { getAuthErrorMessage } from "features/auth/utils/authErrors";
import { logoutUser, resendVerificationEmail, verifyEmailWithCode } from "shared/services/firebaseService";
import { useAuth } from "shared/context/AuthContext";
import { getHomePathForRole } from "shared/utils/url";

const SIGN_IN_PATH = "/authentication/sign-in";
const SIGN_UP_PATH = "/authentication/sign-up";
const RESEND_COOLDOWN_S = 60;
const TOO_MANY_COOLDOWN_S = 300;
const REDIRECT_WITH_ROLE_MS = 1200;
const REDIRECT_NO_ROLE_MS = 4000;

const ASIDE = {
  heading: "Un último paso.",
  description: "Confirma tu correo para activar tu cuenta y empezar a reservar.",
  points: [
    "Abre el enlace que te enviamos",
    "Esta página se actualiza sola al verificar",
    "Revisa spam si no lo ves en unos minutos",
  ],
};

const storageKeyFor = (uid) => `goaltime:verifyCooldown:${uid}`;

const readCooldown = (uid) => {
  try {
    const until = Number(window.localStorage.getItem(storageKeyFor(uid)));
    return Number.isFinite(until) && until > Date.now() ? until : 0;
  } catch {
    return 0;
  }
};

const writeCooldown = (uid, until) => {
  try {
    window.localStorage.setItem(storageKeyFor(uid), String(until));
  } catch {
    /* almacenamiento no disponible: el cooldown solo vive en memoria */
  }
};

const sendErrorMessage = (code) => {
  if (code === "auth/unauthorized-continue-uri") {
    return "Tu cuenta se creó, pero este dominio no está autorizado para enviar el correo. Contacta al administrador.";
  }
  if (code === "auth/too-many-requests") {
    return "Tu cuenta se creó, pero hay demasiados envíos recientes. Espera unos minutos y reenvía el correo.";
  }
  return "Tu cuenta se creó, pero no pudimos enviar el correo de verificación. Pulsa «Reenviar correo».";
};

function Notice({ tone, children }) {
  const tones = {
    error: "border-red-200 bg-red-50 text-red-700",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    success: "border-green-200 bg-green-50 text-green-700",
  };
  const Icon = tone === "success" ? CircleCheck : CircleAlert;
  return (
    <div
      role={tone === "success" ? "status" : "alert"}
      className={`flex items-start gap-3 rounded-md border p-3 text-[13px] leading-5 ${tones[tone]}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { currentUser, userProfile, emailVerified, isSocialAuth, refreshEmailVerification } = useAuth();

  const oobCode = searchParams.get("oobCode") || searchParams.get("oobcode");
  const mode = searchParams.get("mode");
  const hasCodeFlow = Boolean(oobCode && mode === "verifyEmail");

  // "idle" | "applying" | "applied" | "failed"
  const [codeStatus, setCodeStatus] = useState(hasCodeFlow ? "applying" : "idle");
  const [codeError, setCodeError] = useState("");
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [toast, setToast] = useState({ open: false, type: "info", message: "" });
  const applyPromiseRef = useRef(null);
  const leavingRef = useRef(false);
  const initialCooldownRef = useRef(false);

  const uid = currentUser?.uid || null;
  const role = userProfile?.role || null;
  const verified = Boolean(currentUser && (currentUser.emailVerified || emailVerified || isSocialAuth));
  const sendErrorCode = location.state?.sendErrorCode ?? null;
  const justRegistered = Boolean(location.state && "sendErrorCode" in location.state);

  const notify = useCallback(
    (type, message) => setToast({ open: true, type, message }),
    []
  );

  const startCooldown = useCallback(
    (seconds) => {
      const until = Date.now() + seconds * 1000;
      setCooldownUntil(until);
      setNow(Date.now());
      if (uid) writeCooldown(uid, until);
    },
    [uid]
  );

  // 1) Aplica el oobCode (?mode=verifyEmail&oobCode=…) una sola vez y limpia la URL.
  useEffect(() => {
    if (!hasCodeFlow) return undefined;
    let cancelled = false;
    if (!applyPromiseRef.current) applyPromiseRef.current = verifyEmailWithCode(oobCode);
    applyPromiseRef.current
      .then(() => refreshEmailVerification())
      .then(() => {
        if (cancelled) return;
        setCodeStatus("applied");
        navigate(location.pathname, { replace: true });
      })
      .catch((error) => {
        if (cancelled) return;
        setCodeError(getAuthErrorMessage(error.code));
        setCodeStatus("failed");
        navigate(location.pathname, { replace: true });
      });
    return () => {
      cancelled = true;
    };
    // location.pathname es estable en esta ruta; oobCode identifica el flujo.
  }, [hasCodeFlow, oobCode, navigate, location.pathname, refreshEmailVerification]);

  // 2) Sin sesión y sin flujo de código → no hay nada que verificar.
  useEffect(() => {
    if (currentUser || codeStatus !== "idle" || leavingRef.current) return;
    navigate(SIGN_IN_PATH, { replace: true });
  }, [currentUser, codeStatus, navigate]);

  // 3) Verificado → redirige según el rol real (espera brevemente a que llegue el perfil).
  useEffect(() => {
    if (!verified) return undefined;
    const timer = setTimeout(
      () => navigate(getHomePathForRole(role), { replace: true }),
      role ? REDIRECT_WITH_ROLE_MS : REDIRECT_NO_ROLE_MS
    );
    return () => clearTimeout(timer);
  }, [verified, role, navigate]);

  // 4) Cooldown de reenvío persistido por usuario.
  useEffect(() => {
    if (!uid) return;
    const stored = readCooldown(uid);
    if (stored) {
      setCooldownUntil(stored);
      setNow(Date.now());
    }
  }, [uid]);

  useEffect(() => {
    if (!uid || !justRegistered || sendErrorCode || initialCooldownRef.current) return;
    // Recién registrado y el correo salió bien: evita reenviar de inmediato.
    initialCooldownRef.current = true;
    if (!readCooldown(uid)) startCooldown(RESEND_COOLDOWN_S);
  }, [uid, justRegistered, sendErrorCode, startCooldown]);

  useEffect(() => {
    if (cooldownUntil <= Date.now()) return undefined;
    const interval = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= cooldownUntil) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownUntil]);

  const secondsLeft = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));

  const handleResend = async () => {
    if (resending || secondsLeft > 0) return;
    setResending(true);
    try {
      await resendVerificationEmail();
      startCooldown(RESEND_COOLDOWN_S);
      notify("success", "Te reenviamos el correo de verificación. Revisa tu bandeja de entrada.");
    } catch (error) {
      if (error.code === "auth/too-many-requests") startCooldown(TOO_MANY_COOLDOWN_S);
      const message =
        error.code === "auth/too-many-requests" || error.code === "auth/unauthorized-continue-uri"
          ? error.message
          : error.code
          ? getAuthErrorMessage(error.code)
          : error.message || getAuthErrorMessage();
      notify("error", message);
    } finally {
      setResending(false);
    }
  };

  const handleCheck = async () => {
    if (checking) return;
    setChecking(true);
    try {
      const ok = await refreshEmailVerification();
      if (!ok) notify("info", "Aún no vemos la verificación. Abre el enlace del correo e inténtalo de nuevo.");
    } finally {
      setChecking(false);
    }
  };

  const handleLeave = async (target) => {
    leavingRef.current = true;
    try {
      await logoutUser();
    } finally {
      navigate(target, { replace: true });
    }
  };

  const toastNode = (
    <Toast
      open={toast.open}
      type={toast.type}
      message={toast.message}
      onClose={() => setToast((t) => ({ ...t, open: false }))}
    />
  );

  // --- Estados de pantalla ---

  if (codeStatus === "applying") {
    return (
      <AuthShell title="Verificando tu correo" aside={ASIDE}>
        <div className="flex items-center gap-3 text-sm text-fg-muted" role="status">
          <Spinner size="sm" label="Verificando" />
          Confirmando tu enlace de verificación…
        </div>
      </AuthShell>
    );
  }

  if (verified) {
    return (
      <AuthShell
        title="Correo verificado"
        subtitle="Tu cuenta está activa. Te estamos llevando a tu panel."
        aside={ASIDE}
      >
        <Notice tone="success">Tu correo electrónico se verificó correctamente.</Notice>
        <Button
          type="button"
          size="lg"
          fullWidth
          className="mt-4"
          onClick={() => navigate(getHomePathForRole(role), { replace: true })}
        >
          Continuar
        </Button>
        {toastNode}
      </AuthShell>
    );
  }

  if (!currentUser) {
    // Llegó desde el enlace del correo sin sesión abierta en este navegador.
    return (
      <AuthShell
        title={codeStatus === "applied" ? "Correo verificado" : "No pudimos verificar el enlace"}
        subtitle={
          codeStatus === "applied"
            ? "Tu cuenta está activa. Inicia sesión para continuar."
            : "Inicia sesión para solicitar un nuevo correo de verificación."
        }
        aside={ASIDE}
        backTo={SIGN_IN_PATH}
        backLabel="Iniciar sesión"
      >
        {codeStatus === "applied" ? (
          <Notice tone="success">Tu correo electrónico se verificó correctamente.</Notice>
        ) : (
          <Notice tone="error">{codeError || getAuthErrorMessage("auth/invalid-action-code")}</Notice>
        )}
        <ButtonLink to={SIGN_IN_PATH} size="lg" fullWidth className="mt-4">
          Iniciar sesión
        </ButtonLink>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Verifica tu correo"
      subtitle="Te enviamos un enlace de verificación. Ábrelo para activar tu cuenta."
      aside={ASIDE}
    >
      <div className="flex items-center gap-3 rounded-md border border-line bg-zinc-50 px-3 py-2.5">
        <Mail className="h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />
        <span className="min-w-0 break-all text-sm font-medium text-fg">{currentUser.email}</span>
      </div>

      <div className="mt-4 space-y-3">
        {codeStatus === "failed" && <Notice tone="error">{codeError}</Notice>}
        {justRegistered && sendErrorCode && <Notice tone="warning">{sendErrorMessage(sendErrorCode)}</Notice>}
      </div>

      <p className="mt-4 text-[13px] leading-5 text-fg-muted">
        Esta página se actualiza automáticamente cuando verifiques tu correo.
      </p>

      <div className="mt-5 space-y-2">
        <Button type="button" size="lg" fullWidth loading={checking} onClick={handleCheck}>
          Ya verifiqué mi correo
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          fullWidth
          loading={resending}
          disabled={secondsLeft > 0}
          leftIcon={resending ? undefined : <RefreshCw className="h-4 w-4" aria-hidden="true" />}
          onClick={handleResend}
        >
          {secondsLeft > 0 ? `Reenviar en ${secondsLeft} s` : "Reenviar correo"}
        </Button>
      </div>

      <div className="mt-6 rounded-md border border-line p-3">
        <p className="text-[13px] font-medium text-fg-strong">¿No recibiste el correo?</p>
        <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[13px] leading-5 text-fg-muted">
          <li>Revisa la carpeta de spam o correo no deseado.</li>
          <li>Comprueba que la dirección de arriba sea correcta.</li>
          <li>Espera unos minutos y vuelve a solicitar el envío.</li>
        </ul>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-1 gap-y-1">
        <Button type="button" variant="ghost" size="sm" onClick={() => handleLeave(SIGN_UP_PATH)}>
          Usar otro correo
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => handleLeave(SIGN_IN_PATH)}>
          Cerrar sesión
        </Button>
      </div>

      {toastNode}
    </AuthShell>
  );
}

export default VerifyEmail;
