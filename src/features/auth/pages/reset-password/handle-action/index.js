import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spinner } from "shared/components/ui";
import { getSafeContinuePath } from "shared/utils/url";

const VERIFY_EMAIL_PATH = "/authentication/verify-email";
const RESET_CONFIRM_PATH = "/authentication/reset-password/confirm";

/** Destino interno según el modo de la acción de Firebase; null si el modo no se maneja. */
const DESTINATIONS = {
  verifyEmail: VERIFY_EMAIL_PATH,
  resetPassword: RESET_CONFIRM_PATH,
};

/**
 * Resuelve la ruta interna a la que se redirige. `continueUrl` es un parámetro controlable por
 * terceros: solo se acepta si pasa getSafeContinuePath Y apunta a la pantalla esperada.
 */
const resolveTarget = (mode, oobCode, continueUrl) => {
  const expected = DESTINATIONS[mode];
  const safe = getSafeContinuePath(continueUrl, expected);
  const url = new URL(safe, window.location.origin);
  const base = url.pathname === expected ? url : new URL(expected, window.location.origin);
  base.searchParams.set("mode", mode);
  base.searchParams.set("oobCode", oobCode);
  return `${base.pathname}${base.search}${base.hash}`;
};

/**
 * Manejador de acciones de Firebase (/__/auth/action): reenvía a la pantalla interna
 * correspondiente conservando el oobCode. La pantalla destino aplica y valida el código.
 */
function HandleFirebaseAction() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const oobCode = searchParams.get("oobCode");
    const mode = searchParams.get("mode");

    if (!oobCode || !DESTINATIONS[mode]) {
      navigate("/", { replace: true });
      return;
    }
    navigate(resolveTarget(mode, oobCode, searchParams.get("continueUrl")), { replace: true });
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-4" role="status">
      <Spinner size="md" label="Procesando enlace" />
      <p className="text-[13px] text-fg-muted">Procesando enlace…</p>
    </div>
  );
}

export default HandleFirebaseAction;
