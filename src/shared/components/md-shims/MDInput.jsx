// MDInput shim - Wrapper temporal para migración progresiva
import PropTypes from "prop-types";

function MDInput({ label, error, success, className = "", fullWidth, ...rest }) {
  const baseClass = "border rounded-lg px-3 py-2 text-sm transition-all";
  const stateClass = error
    ? "border-red-400 focus:border-red-500 focus:ring-red-200"
    : success
    ? "border-green-400 focus:border-green-500 focus:ring-green-200"
    : "border-gray-200 focus:border-goaltime focus:ring-goaltime/20";
  const widthClass = fullWidth ? "w-full" : "";

  return (
    <div className={widthClass}>
      {label && <label className="block text-xs font-medium text-dark mb-1">{label}</label>}
      <input className={`${baseClass} ${stateClass} ${widthClass} ${className}`} {...rest} />
    </div>
  );
}

MDInput.propTypes = {
  label: PropTypes.string,
  error: PropTypes.bool,
  success: PropTypes.bool,
  className: PropTypes.string,
  fullWidth: PropTypes.bool,
};

export default MDInput;
