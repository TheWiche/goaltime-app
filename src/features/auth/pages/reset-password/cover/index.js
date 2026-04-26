import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FullScreenLoader from "shared/components/loaders/FullScreenLoader";
import SplitScreenLayout from "features/auth/components/SplitScreenLayout";
import { Toast } from "shared/components/ui";
import { sendPasswordReset } from "shared/services/firebaseService";
import bgImage from "assets/images/bg-reset-cover.jpeg";

const getFriendlyError = (code) => {
  const map = {
    "auth/user-not-found": "No existe una cuenta con este correo electrónico.",
    "auth/invalid-email": "El correo electrónico no es válido.",
    "auth/too-many-requests": "Demasiados intentos. Por favor, espera unos minutos.",
    "auth/unauthorized-domain": "El dominio no está autorizado. Contacta al administrador.",
    "auth/unauthorized-continue-uri": "La URL de redirección no está autorizada.",
    "auth/invalid-continue-uri": "La URL de redirección no es válida.",
    "auth/missing-continue-uri": "Falta la URL de redirección.",
  };
  return map[code] ?? `Ocurrió un error (${code || "desconocido"}). Inténtalo más tarde.`;
};

function Cover() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [toast, setToast] = useState({ open: false, type: "info", message: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setToast({ open: true, type: "warning", message: "Por favor, ingresa tu correo electrónico." }); return; }
    setIsLoading(true);
    try {
      await sendPasswordReset(email);
      setEmailSent(true);
      setToast({ open: true, type: "success", message: "Se ha enviado un correo con las instrucciones para restablecer tu contraseña." });
    } catch (err) {
      setToast({ open: true, type: "error", message: getFriendlyError(err.code) });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 pl-10 text-sm text-dark placeholder-gray-400 bg-gray-50 focus:outline-none focus:border-goaltime focus:ring-2 focus:ring-goaltime/20 transition-all";

  const leftContent = (
    <div
      className="w-full h-full"
      style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
    />
  );

  const rightContent = (
    <div className="w-full h-full flex flex-col justify-center px-6 sm:px-10 md:px-14 py-8 relative">
      {isLoading && <FullScreenLoader />}

      <Link
        to="/sobre-nosotros"
        className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-dark text-white flex items-center justify-center hover:bg-dark-800 transition-colors text-sm"
      >
        ?
      </Link>

      <div className="max-w-sm mx-auto w-full">
        <Link to="/authentication/sign-in" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-dark hover:underline mb-6">
          ← Volver al inicio de sesión
        </Link>

        <h2 className="text-2xl font-bold text-dark mb-1">Restablecer Contraseña</h2>
        <p className="text-sm text-gray-500 mb-6">Ingresa tu correo y te enviaremos un enlace para restablecerla</p>

        {emailSent ? (
          <div>
            <div className="text-center mb-5">
              <p className="text-2xl mb-2">✅</p>
              <p className="font-bold text-green-600 mb-2">Correo Enviado</p>
              <p className="text-sm text-gray-500 mb-2">
                Hemos enviado instrucciones a <strong>{email}</strong>.
              </p>
              <p className="text-xs text-gray-400">Si no lo encuentras, revisa tu carpeta de spam.</p>
            </div>
            <Link
              to="/authentication/sign-in"
              className="w-full block text-center py-3 bg-goaltime hover:bg-goaltime-500 text-white font-semibold rounded-xl text-sm transition-all shadow-goaltime"
            >
              Volver a Iniciar Sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-dark mb-1">Correo Electrónico</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">✉️</span>
                <input
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-goaltime hover:bg-goaltime-500 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all shadow-goaltime"
            >
              {isLoading ? "Enviando..." : "Enviar Enlace de Restablecimiento"}
            </button>

            <p className="text-center text-sm text-gray-500">
              ¿Recordaste tu contraseña?{" "}
              <Link to="/authentication/sign-in" className="text-goaltime font-semibold hover:underline">
                Iniciar Sesión
              </Link>
            </p>
          </form>
        )}
      </div>

      <Toast open={toast.open} type={toast.type} message={toast.message} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </div>
  );

  return (
    <SplitScreenLayout leftContent={leftContent} rightContent={rightContent} leftWidth="50%" rightWidth="50%" />
  );
}

export default Cover;
