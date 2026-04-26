import React from "react";
import logo from "assets/images/Logo.png";
import Spinner from "shared/components/ui/Spinner";

export function FullScreenLoader() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/70 backdrop-blur-[5px]"
      role="status"
      aria-live="polite"
      aria-label="Cargando aplicación"
    >
      <img src={logo} alt="GoalTime Logo" className="mb-6 w-[150px] object-contain" />
      <Spinner size="lg" />
      <p className="mt-4 text-sm text-slate-600">Cargando...</p>
    </div>
  );
}

export default FullScreenLoader;
