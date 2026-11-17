// MDInput shim — input con label, mapeado a los tokens de ui/Field.
import { useId } from "react";
import PropTypes from "prop-types";
import { stripSystemProps } from "./systemProps";

function MDInput({ label, error, success, className = "", fullWidth, id, size = "medium", InputProps, inputProps, ...rest }) {
  const auto = useId();
  const inputId = id || `mdi${auto.replace(/:/g, "")}`;
  const stateClass = error
    ? "border-red-500 focus:border-red-500 focus:ring-red-500/15"
    : success
    ? "border-green-500 focus:border-green-600 focus:ring-green-500/15"
    : "border-line-strong hover:border-zinc-400 focus:border-primary-500 focus:ring-primary-500/15";
  const widthClass = fullWidth ? "w-full" : "";
  const sizeClass = size === "small" ? "h-8 px-2.5 text-[13px]" : "h-9 px-3 text-sm";

  return (
    <div className={`flex flex-col gap-1.5 ${widthClass}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="text-[13px] font-medium leading-5 text-fg">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={`${sizeClass} rounded-md border bg-white text-fg shadow-xs transition-colors placeholder:text-fg-subtle focus:outline-none focus:ring-[3px] disabled:cursor-not-allowed disabled:bg-zinc-50 ${stateClass} ${widthClass} ${className}`.trim()}
        {...(inputProps || {})}
        {...stripSystemProps(rest)}
      />
    </div>
  );
}

MDInput.propTypes = {
  label: PropTypes.string,
  error: PropTypes.bool,
  success: PropTypes.bool,
  className: PropTypes.string,
  fullWidth: PropTypes.bool,
  id: PropTypes.string,
  size: PropTypes.oneOf(["small", "medium"]),
  InputProps: PropTypes.object,
  inputProps: PropTypes.object,
};

export default MDInput;
