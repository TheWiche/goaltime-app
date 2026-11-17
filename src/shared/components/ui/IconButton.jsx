import { forwardRef } from "react";
import PropTypes from "prop-types";
import { cx, focusRing } from "./cx";

const variants = {
  ghost: "border-transparent bg-transparent text-fg-muted hover:bg-zinc-100 hover:text-fg",
  secondary: "border-line-strong bg-white text-fg-muted shadow-xs hover:bg-zinc-50 hover:text-fg",
  danger: "border-transparent bg-transparent text-fg-muted hover:bg-red-50 hover:text-red-600",
};

const sizes = {
  sm: "h-7 w-7 [&>svg]:h-3.5 [&>svg]:w-3.5",
  md: "h-8 w-8 [&>svg]:h-4 [&>svg]:w-4",
  lg: "h-9 w-9 [&>svg]:h-4 [&>svg]:w-4",
};

/** Botón cuadrado solo-icono. `label` es obligatorio (aria-label + title). */
const IconButton = forwardRef(function IconButton(
  { label, children, variant = "ghost", size = "md", className = "", type = "button", ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-md border transition-colors duration-150",
        "disabled:pointer-events-none disabled:opacity-50",
        focusRing,
        variants[variant] ?? variants.ghost,
        sizes[size] ?? sizes.md,
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
});

IconButton.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["ghost", "secondary", "danger"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  className: PropTypes.string,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
};

export default IconButton;
