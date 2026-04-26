import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { FullScreenLoader } from "shared/components/loaders/FullScreenLoader";
import { Toast } from "shared/components/ui";
import SplitScreenLayout from "features/auth/components/SplitScreenLayout";
import AuthFootballPanel from "features/auth/components/AuthFootballPanel";
import { loginUser, signInWithGoogle, signInWithFacebook } from "shared/services/firebaseService";

const getFriendlyErrorMessage = (errorCode) => {
  switch (errorCode) {
    case "auth/invalid-credential":
      return "Credenciales incorrectas. Verifica tu correo y contraseña.";
    case "auth/email-not-verified":
      return "Por favor, verifica tu email antes de iniciar sesión.";
    default:
      return "Ocurrió un error. Por favor, inténtalo más tarde.";
  }
};

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

function SignIn() {
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showPasswordResetHint, setShowPasswordResetHint] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", type: "error" });
  const navigate = useNavigate();
  const formRef = useRef(null);

  // Timeline entrada formulario (botones no animados para garantizar visibilidad)
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from('[data-auth="title"]', { opacity: 0, y: -16, duration: 0.5 })
        .from('[data-auth="subtitle"]', { opacity: 0, y: -10, duration: 0.4 }, "-=0.3")
        .from('[data-auth="divider"]', { opacity: 0, scaleX: 0.4, duration: 0.4 }, "-=0.15")
        .from('[data-auth="field"]', { opacity: 0, y: 16, duration: 0.4, stagger: 0.08 }, "-=0.15")
        .from('[data-auth="actions"]', { opacity: 0, y: 16, duration: 0.4 }, "-=0.15");
    },
    { scope: formRef }
  );

  useEffect(() => {
    setFailedAttempts(0);
    setShowPasswordResetHint(false);
  }, [email]);

  useEffect(() => {
    setShowPasswordResetHint(failedAttempts >= 2);
  }, [failedAttempts]);

  const showError = (message) => setToast({ open: true, message, type: "error" });

  const redirectByRole = (role) => navigate(role === "cliente" ? "/canchas" : "/dashboard");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userProfile = await loginUser(email, password, rememberMe);
      setFailedAttempts(0);
      redirectByRole(userProfile.role);
    } catch (error) {
      if (error.code === "auth/email-not-verified") {
        navigate("/authentication/verify-email");
        return;
      }
      if (["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found"].includes(error.code)) {
        setFailedAttempts((prev) => prev + 1);
      }
      showError(getFriendlyErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider) => {
    setIsLoading(true);
    try {
      const signIn = provider === "google" ? signInWithGoogle : signInWithFacebook;
      const userProfile = await signIn();
      redirectByRole(userProfile.role);
    } catch (error) {
      showError(
        error.code === "auth/account-exists-with-different-credential"
          ? "Ya existe una cuenta con este email. Inicia sesión con tu método original."
          : getFriendlyErrorMessage(error.code)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-dark placeholder-gray-400 focus:outline-none focus:border-goaltime focus:ring-2 focus:ring-goaltime/20 focus:bg-white transition-all";

  const leftContent = (
    <AuthFootballPanel
      title="¡Vuelve al juego, capitán!"
      subtitle="Reserva tu cancha favorita en segundos. Tus partidos te están esperando."
      footnote="© GoalTime — Tu cancha, tu equipo, tu momento."
    />
  );

  const rightContent = (
    <div ref={formRef} className="relative flex flex-col justify-center w-full h-full px-6 sm:px-10 md:px-16 py-10 bg-white">
      {isLoading && <FullScreenLoader />}

      {/* Botón cerrar */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-5 right-5 p-2 rounded-lg text-gray-400 hover:text-dark hover:bg-gray-100 transition-all"
        aria-label="Volver al inicio"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="max-w-[440px] w-full mx-auto">
        {/* Pequeño branding mobile */}
        <div className="md:hidden flex items-center gap-2 mb-6">
          <span className="text-2xl">⚽</span>
          <span className="font-bold text-dark text-lg">GoalTime</span>
        </div>

        <h1 data-auth="title" className="text-3xl md:text-4xl font-extrabold text-dark mb-2">
          Iniciar Sesión
        </h1>
        <p data-auth="subtitle" className="text-sm text-gray-500 mb-8">
          ¿Listo para tu próximo partido? Ingresa para continuar.
        </p>

        {/* Social */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            data-auth="social"
            type="button"
            onClick={() => handleSocialSignIn("google")}
            className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-sm font-medium text-dark hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <GoogleIcon /> Google
          </button>
          <button
            data-auth="social"
            type="button"
            onClick={() => handleSocialSignIn("facebook")}
            className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-sm font-medium text-dark hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <FacebookIcon /> Facebook
          </button>
        </div>

        {/* Divider */}
        <div data-auth="divider" className="relative flex items-center mb-6">
          <div className="flex-1 border-t border-gray-200" />
          <span className="px-3 text-xs text-gray-400 uppercase tracking-wider">o con email</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div data-auth="field">
            <label className="block text-xs font-semibold text-dark mb-1.5 uppercase tracking-wider">
              Correo Electrónico
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">✉️</span>
              <input
                type="email"
                placeholder="nombre@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          <div data-auth="field">
            <label className="block text-xs font-semibold text-dark mb-1.5 uppercase tracking-wider">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`${inputClass} pl-10 pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark transition-colors"
                aria-label="Mostrar contraseña"
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <div data-auth="actions" className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe((r) => !r)}
                className="w-4 h-4 rounded accent-goaltime"
              />
              <span className="text-sm text-gray-600">Recordarme</span>
            </label>
            <Link
              to="/authentication/reset-password"
              className={[
                "text-sm transition-all",
                showPasswordResetHint ? "text-yellow-600 font-semibold animate-pulse" : "text-goaltime hover:underline font-medium",
              ].join(" ")}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {showPasswordResetHint && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
              <p className="text-xs text-yellow-700 font-medium">
                ¿Olvidaste tu contraseña? Puedes recuperarla fácilmente arriba.
              </p>
            </div>
          )}

          <button
            data-auth="submit"
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-goaltime to-green-500 hover:from-goaltime-500 hover:to-green-600 text-white font-bold rounded-xl shadow-goaltime hover:shadow-2xl hover:shadow-goaltime/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <span>⚽</span>
            {isLoading ? "Entrando..." : "Iniciar Sesión"}
          </button>

          <p className="text-center text-sm text-gray-500 pt-2">
            ¿No tienes una cuenta?{" "}
            <Link to="/authentication/sign-up" className="font-bold text-goaltime hover:underline">
              Crea una gratis →
            </Link>
          </p>
        </form>
      </div>

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </div>
  );

  return <SplitScreenLayout leftContent={leftContent} rightContent={rightContent} />;
}

export default SignIn;
