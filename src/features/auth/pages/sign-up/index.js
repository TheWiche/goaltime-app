import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import FullScreenLoader from "shared/components/loaders/FullScreenLoader";
import SplitScreenLayout from "features/auth/components/SplitScreenLayout";
import AuthFootballPanel from "features/auth/components/AuthFootballPanel";
import { Toast } from "shared/components/ui";
import { registerUser, signInWithFacebook, signInWithGoogle } from "shared/services/firebaseService";

const getFriendlyError = (code) => {
  const map = {
    "auth/email-already-in-use": "Este correo electrónico ya está registrado.",
    "auth/invalid-email": "El formato del correo electrónico no es válido.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
  };
  return map[code] ?? "Ocurrió un error inesperado. Inténtalo más tarde.";
};

const calcStrength = (pwd) => {
  if (!pwd) return { value: 0, color: "", label: "" };
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  const map = [
    { value: 0, color: "bg-red-400", label: "Débil" },
    { value: 25, color: "bg-red-400", label: "Muy Débil" },
    { value: 50, color: "bg-yellow-400", label: "Media" },
    { value: 75, color: "bg-blue-400", label: "Fuerte" },
    { value: 100, color: "bg-goaltime", label: "Muy Fuerte" },
  ];
  return map[s];
};

const IconGoogle = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);
const IconFacebook = () => (
  <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

function Cover() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState({ value: 0, color: "", label: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, type: "info", message: "" });
  const [jokeSB, setJokeSB] = useState(false);
  const navigate = useNavigate();
  const formRef = useRef(null);

  useEffect(() => {
    setStrength(calcStrength(password));
  }, [password]);

  // Timeline entrada (botones no animados para garantizar visibilidad)
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from('[data-auth="title"]', { opacity: 0, y: -16, duration: 0.5 })
        .from('[data-auth="subtitle"]', { opacity: 0, y: -10, duration: 0.4 }, "-=0.3")
        .from('[data-auth="divider"]', { opacity: 0, scaleX: 0.4, duration: 0.4 }, "-=0.15")
        .from('[data-auth="field"]', { opacity: 0, y: 14, duration: 0.4, stagger: 0.07 }, "-=0.15")
        .from('[data-auth="terms"]', { opacity: 0, y: 12, duration: 0.35 }, "-=0.12");
    },
    { scope: formRef }
  );

  const showError = (msg) => setToast({ open: true, type: "error", message: msg });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { showError("Las contraseñas no coinciden."); return; }
    if (!agreeTerms) { showError("Debes aceptar los términos y condiciones."); return; }

    setIsLoading(true);
    try {
      const profile = await registerUser(name, email, password);
      if (profile?.emailVerificationError) {
        const err = profile.emailVerificationError;
        if (err.code === "auth/unauthorized-continue-uri") {
          showError(`El dominio no está autorizado en Firebase. El registro fue exitoso, pero no se pudo enviar el email de verificación.`);
        } else if (err.code === "auth/too-many-requests") {
          showError("Has enviado demasiados emails de verificación. Espera unos minutos.");
        }
      }
      navigate("/authentication/verify-email", { replace: true });
    } catch (err) {
      showError(getFriendlyError(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocial = async (provider) => {
    setIsLoading(true);
    try {
      const fn = provider === "google" ? signInWithGoogle : signInWithFacebook;
      const profile = await fn();
      navigate(profile.role === "cliente" ? "/canchas" : "/dashboard");
    } catch (err) {
      showError(
        err.code === "auth/account-exists-with-different-credential"
          ? "Ya existe una cuenta con este email. Inicia sesión con tu método original."
          : getFriendlyError(err.code)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-10 text-sm text-dark placeholder-gray-400 focus:outline-none focus:border-goaltime focus:ring-2 focus:ring-goaltime/20 focus:bg-white transition-all";

  const leftContent = (
    <AuthFootballPanel
      title="Únete al equipo ganador."
      subtitle="Miles de jugadores y dueños de cancha ya confían en GoalTime. Crea tu cuenta y empieza a reservar gratis."
      footnote="© GoalTime — Más que reservas, comunidad deportiva."
    />
  );

  const rightContent = (
    <div ref={formRef} className="relative w-full h-full flex flex-col justify-center px-6 sm:px-10 md:px-14 py-10 bg-white overflow-y-auto">
      {isLoading && <FullScreenLoader />}

      <button
        onClick={() => navigate("/")}
        className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-dark transition-all"
        aria-label="Cerrar"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="max-w-[440px] w-full mx-auto">
        {/* Brand mobile */}
        <div className="md:hidden flex items-center gap-2 mb-6">
          <span className="text-2xl">⚽</span>
          <span className="font-bold text-dark text-lg">GoalTime</span>
        </div>

        <h2 data-auth="title" className="text-3xl md:text-4xl font-extrabold text-dark mb-2">
          Crear Cuenta
        </h2>
        <p data-auth="subtitle" className="text-sm text-gray-500 mb-7">
          Empieza a reservar canchas en menos de un minuto.
        </p>

        {/* Social */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            data-auth="social"
            type="button"
            onClick={() => handleSocial("google")}
            className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-sm font-medium text-dark hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <IconGoogle /> Google
          </button>
          <button
            data-auth="social"
            type="button"
            onClick={() => handleSocial("facebook")}
            className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-sm font-medium text-dark hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <IconFacebook /> Facebook
          </button>
        </div>

        <div data-auth="divider" className="relative flex items-center mb-5">
          <div className="flex-1 border-t border-gray-200" />
          <span className="px-3 text-xs text-gray-400 uppercase tracking-wider">o con email</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        <form onSubmit={handleRegister} className="space-y-3.5">
          <div data-auth="field">
            <label className="block text-xs font-semibold text-dark mb-1.5 uppercase tracking-wider">Nombre Completo</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">👤</span>
              <input type="text" placeholder="Juan Pérez" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          </div>

          <div data-auth="field">
            <label className="block text-xs font-semibold text-dark mb-1.5 uppercase tracking-wider">Correo Electrónico</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">✉️</span>
              <input type="email" placeholder="nombre@ejemplo.com" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          <div data-auth="field">
            <label className="block text-xs font-semibold text-dark mb-1.5 uppercase tracking-wider">Contraseña</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`${inputClass} pr-10`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark transition-colors"
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
            {password && (
              <div className="mt-2">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: `${strength.value}%` }} />
                </div>
                {strength.label && <span className="text-xs text-gray-400 mt-1 block">{strength.label}</span>}
              </div>
            )}
          </div>

          <div data-auth="field">
            <label className="block text-xs font-semibold text-dark mb-1.5 uppercase tracking-wider">Confirmar Contraseña</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`${inputClass} ${confirmPassword && password !== confirmPassword ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
            )}
          </div>

          <div data-auth="terms" className="flex items-start gap-2 py-1">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 accent-goaltime rounded mt-0.5"
            />
            <label htmlFor="terms" className="text-sm text-dark leading-snug">
              Acepto los{" "}
              <button type="button" onClick={() => setJokeSB(true)} className="text-goaltime font-semibold hover:underline">
                Términos y Condiciones
              </button>{" "}
              de GoalTime
            </label>
          </div>

          <button
            data-auth="submit"
            type="submit"
            disabled={!agreeTerms || isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-goaltime to-green-500 hover:from-goaltime-500 hover:to-green-600 text-white font-bold rounded-xl shadow-goaltime hover:shadow-2xl hover:shadow-goaltime/40 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <span>⚽</span>
            {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
          </button>

          <p className="text-center text-sm text-gray-500 pt-2">
            ¿Ya tienes cuenta?{" "}
            <Link to="/authentication/sign-in" className="font-bold text-goaltime hover:underline">
              Inicia sesión →
            </Link>
          </p>
        </form>
      </div>

      <Toast open={toast.open} type={toast.type} message={toast.message} onClose={() => setToast((t) => ({ ...t, open: false }))} />
      <Toast open={jokeSB} type="info" message="Si te hackeo es bajo tu propia responsabilidad. 😎" onClose={() => setJokeSB(false)} />
    </div>
  );

  return <SplitScreenLayout leftContent={leftContent} rightContent={rightContent} />;
}

export default Cover;
