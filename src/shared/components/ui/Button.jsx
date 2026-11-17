import { forwardRef } from "react";
import PropTypes from "prop-types";
import { cx, focusRing } from "./cx";

/*
 * Variantes:
 *  primary   – acción principal de la vista (azul sólido)
 *  cta       – CTA de conversión (naranja). Úsalo como máximo 1 vez por vista.
 *  secondary – acción secundaria (blanco + borde)
 *  ghost     – acciones terciarias / toolbars
 *  danger    – acción destructiva confirmada
 *  dark      – sólido neutro (zinc-900)
 *  goaltime  – alias legacy de primary
 *  glass     – alias legacy de secondary
 */
const variants = {
  primary:
    "bg-primary-600 text-white border border-primary-600 shadow-xs hover:bg-primary-700 hover:border-primary-700 active:bg-primary-800",
  cta: "bg-cta-500 text-white border border-cta-500 shadow-xs hover:bg-cta-600 hover:border-cta-600 active:bg-cta-700",
  secondary:
    "bg-white text-fg border border-line-strong shadow-xs hover:bg-zinc-50 hover:border-zinc-400 active:bg-zinc-100",
  ghost:
    "bg-transparent text-fg-muted border border-transparent hover:bg-zinc-100 hover:text-fg active:bg-zinc-200",
  danger:
    "bg-red-600 text-white border border-red-600 shadow-xs hover:bg-red-700 hover:border-red-700 active:bg-red-800",
  dark: "bg-zinc-900 text-white border border-zinc-900 shadow-xs hover:bg-zinc-800 hover:border-zinc-800 active:bg-black",
};
variants.goaltime = variants.primary;
variants.glass = variants.secondary;

const sizes = {
  sm: "h-8 px-3 text-[13px] gap-1.5",
  md: "h-9 px-3.5 text-sm gap-2",
  lg: "h-10 px-4 text-sm gap-2",
  xl: "h-11 px-5 text-[15px] gap-2",
};

function ButtonSpinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
    </svg>
  );
}

const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      className = "",
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cx(
          "inline-flex select-none items-center justify-center whitespace-nowrap rounded-md font-medium",
          "transition-colors duration-150",
          focusRing,
          variants[variant] ?? variants.primary,
          sizes[size] ?? sizes.md,
          fullWidth && "w-full",
          isDisabled ? "pointer-events-none cursor-not-allowed opacity-50" : "cursor-pointer",
          className
        )}
        {...rest}
      >
        {loading ? <ButtonSpinner /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(["primary", "cta", "secondary", "danger", "ghost", "glass", "goaltime", "dark"]),
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  fullWidth: PropTypes.bool,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  className: PropTypes.string,
};

export default Button;
