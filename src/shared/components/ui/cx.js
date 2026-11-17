/** Une clases condicionales ignorando valores falsy. */
export function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

/** Anillo de foco estándar (solo teclado). */
export const focusRing =
  "focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-1 focus-visible:ring-offset-white";

/** Control de formulario base (input/select/textarea). */
export const controlBase =
  "w-full bg-white text-sm text-fg placeholder:text-fg-subtle " +
  "border border-line-strong rounded-md shadow-xs transition-colors duration-150 " +
  "hover:border-zinc-400 " +
  "focus:outline-none focus:border-primary-500 focus:ring-[3px] focus:ring-primary-500/15 " +
  "disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-fg-faint disabled:hover:border-line-strong";

/** Variante de error para controles. */
export const controlError =
  "border-red-500 hover:border-red-500 focus:border-red-500 focus:ring-red-500/15";

/** Alturas de control por tamaño (compartidas por Input, Select, Button). */
export const controlSizes = {
  sm: "h-8 px-2.5 text-[13px]",
  md: "h-9 px-3 text-sm",
  lg: "h-10 px-3.5 text-sm",
};
