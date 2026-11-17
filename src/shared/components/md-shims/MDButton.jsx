// MDButton shim — mapea variant/color MUI a los estilos de ui/Button.
import PropTypes from "prop-types";
import { stripSystemProps } from "./systemProps";

const solid = {
  info: "bg-primary-600 border-primary-600 text-white hover:bg-primary-700 hover:border-primary-700",
  primary: "bg-primary-600 border-primary-600 text-white hover:bg-primary-700 hover:border-primary-700",
  dark: "bg-zinc-900 border-zinc-900 text-white hover:bg-zinc-800 hover:border-zinc-800",
  secondary: "bg-white border-line-strong text-fg hover:bg-zinc-50",
  light: "bg-white border-line-strong text-fg hover:bg-zinc-50",
  white: "bg-white border-line-strong text-fg hover:bg-zinc-50",
  success: "bg-green-600 border-green-600 text-white hover:bg-green-700 hover:border-green-700",
  error: "bg-red-600 border-red-600 text-white hover:bg-red-700 hover:border-red-700",
  warning: "bg-amber-500 border-amber-500 text-white hover:bg-amber-600 hover:border-amber-600",
};

const outlinedText = {
  info: "text-primary-700",
  primary: "text-primary-700",
  dark: "text-fg",
  secondary: "text-fg-muted",
  success: "text-green-700",
  error: "text-red-600",
  warning: "text-amber-700",
};

function MDButton({ children, variant = "contained", color = "info", size = "medium", className = "", type = "button", ...rest }) {
  const base =
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border font-medium transition-colors duration-150 " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-1 " +
    "disabled:pointer-events-none disabled:opacity-50";
  const sizeClass = size === "small" ? "h-8 px-3 text-[13px]" : size === "large" ? "h-10 px-4 text-sm" : "h-9 px-3.5 text-sm";
  const tone = outlinedText[color] || outlinedText.info;
  const variantClass =
    variant === "outlined"
      ? `bg-white border-line-strong shadow-xs hover:bg-zinc-50 ${tone}`
      : variant === "text"
      ? `bg-transparent border-transparent hover:bg-zinc-100 ${tone}`
      : `shadow-xs ${solid[color] || solid.info}`;

  return (
    <button type={type} className={`${base} ${sizeClass} ${variantClass} ${className}`.trim()} {...stripSystemProps(rest)}>
      {children}
    </button>
  );
}

MDButton.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.string,
  color: PropTypes.string,
  size: PropTypes.string,
  className: PropTypes.string,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
};

export default MDButton;
