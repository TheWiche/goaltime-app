import { forwardRef } from "react";
import PropTypes from "prop-types";

const variants = {
  primary:
    "bg-cta text-white hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 shadow-lg hover:shadow-xl",
  secondary:
    "bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-white shadow-md hover:shadow-lg",
  danger: 
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-md hover:shadow-lg",
  ghost:
    "bg-transparent text-primary hover:bg-primary/10 active:bg-primary/20",
  glass:
    "backdrop-blur-glass bg-white/70 border border-white/20 text-primary hover:bg-white/80 shadow-glass hover:shadow-xl hover:-translate-y-0.5",
  // Mantener compatibilidad
  goaltime:
    "bg-goaltime text-white hover:bg-goaltime-500 active:bg-goaltime-600 shadow-md hover:shadow-lg",
  dark: 
    "bg-primary text-white hover:bg-primary-800 active:bg-primary-900 shadow-md hover:shadow-lg",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
  xl: "px-8 py-4 text-lg rounded-2xl",
};

const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      disabled = false,
      className = "",
      ...rest
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-medium font-heading transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cta focus:ring-offset-2 select-none";

    const disabledStyles =
      disabled || loading ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer";

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          base,
          variants[variant] ?? variants.primary,
          sizes[size] ?? sizes.md,
          fullWidth ? "w-full" : "",
          disabledStyles,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["primary", "secondary", "danger", "ghost", "glass", "goaltime", "dark"]),
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  fullWidth: PropTypes.bool,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default Button;
