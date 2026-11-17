import { forwardRef, useId } from "react";
import PropTypes from "prop-types";
import { cx, controlBase, controlError } from "./cx";

/**
 * Input simple con label/icono. Para formularios nuevos prefiere `TextField`
 * (hint, required, prefix, tamaños). Se mantiene por compatibilidad.
 */
const Input = forwardRef(
  ({ label, error, helper, icon: Icon, iconEnd: IconEnd, fullWidth = false, className = "", id, ...rest }, ref) => {
    const auto = useId();
    const inputId = id || `i${auto.replace(/:/g, "")}`;
    const msgId = `${inputId}-msg`;
    const hasMsg = Boolean(error || helper);

    return (
      <div className={cx("flex flex-col gap-1.5", fullWidth && "w-full", className)}>
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-medium leading-5 text-fg">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" aria-hidden="true">
              <Icon size={16} />
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={hasMsg ? msgId : undefined}
            className={cx(controlBase, "h-9 text-sm", Icon ? "pl-9" : "pl-3", IconEnd ? "pr-9" : "pr-3", error && controlError)}
            {...rest}
          />
          {IconEnd && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle" aria-hidden="true">
              <IconEnd size={16} />
            </span>
          )}
        </div>
        {error ? (
          <p id={msgId} className="text-xs text-red-600">
            {error}
          </p>
        ) : helper ? (
          <p id={msgId} className="text-xs text-fg-subtle">
            {helper}
          </p>
        ) : null}
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
  id: PropTypes.string,
};

export default Input;
