import React from "react";
import logo from "assets/images/Logo.png";
import Spinner from "shared/components/ui/Spinner";

/**
 * Pantalla de carga a pantalla completa (arranque de la app, guards de ruta, acciones bloqueantes).
 * z-[60]: queda por debajo de los Toast (z-[70]) para que un mensaje de error nunca quede tapado.
 */
export function FullScreenLoader() {
  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-white"
      role="status"
      aria-live="polite"
      aria-label="Cargando aplicación"
    >
      <img src={logo} alt="GoalTime" className="h-12 w-12 object-contain" />
      <Spinner size="md" label="Cargando" />
      <p className="text-[13px] text-fg-muted">Cargando…</p>
    </div>
  );
}

export default FullScreenLoader;
