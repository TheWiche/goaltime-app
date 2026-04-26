import { forwardRef } from "react";
import PropTypes from "prop-types";

const Input = forwardRef(
  (
    {
      label,
      error,
      helper,
      icon: Icon,
      iconEnd: IconEnd,
      fullWidth = false,
      className = "",
      ...rest
    },
    ref
  ) => {
    const inputBase =
      "w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-dark placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-goaltime focus:border-transparent";

    const inputState = error
      ? "border-orange focus:ring-orange"
      : "border-gray-200 hover:border-gray-300";

    const paddingLeft = Icon ? "pl-10" : "pl-4";
    const paddingRight = IconEnd ? "pr-10" : "pr-4";

    return (
      <div className={`flex flex-col gap-1 ${fullWidth ? "w-full" : ""} ${className}`}>
        {label && <label className="text-xs font-medium text-gray-600 ml-1">{label}</label>}
        <div className="relative">
          {Icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Icon size={16} />
            </span>
          )}
          <input
            ref={ref}
            className={[inputBase, inputState, paddingLeft, paddingRight].join(" ")}
            {...rest}
          />
          {IconEnd && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <IconEnd size={16} />
            </span>
          )}
        </div>
        {error && <p className="text-xs text-orange ml-1">{error}</p>}
        {helper && !error && <p className="text-xs text-gray-400 ml-1">{helper}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  helper: PropTypes.string,
  icon: PropTypes.elementType,
  iconEnd: PropTypes.elementType,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
};

export default Input;
