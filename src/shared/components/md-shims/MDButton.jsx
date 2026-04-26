// MDButton shim - Wrapper temporal para migración progresiva
import PropTypes from "prop-types";

function MDButton({ children, variant = "contained", color = "info", size = "medium", className = "", ...rest }) {
  const baseClass = "inline-flex items-center justify-center font-semibold rounded-lg transition-all";
  const sizeClass = size === "small" ? "px-3 py-1.5 text-xs" : size === "large" ? "px-6 py-3 text-base" : "px-4 py-2 text-sm";
  const variantClass =
    variant === "outlined"
      ? "border-2 border-goaltime text-goaltime hover:bg-goaltime hover:text-white"
      : variant === "text"
      ? "text-goaltime hover:bg-goaltime/10"
      : "bg-goaltime text-white hover:bg-goaltime-500";

  return (
    <button className={`${baseClass} ${sizeClass} ${variantClass} ${className}`} {...rest}>
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
};

export default MDButton;
