import { forwardRef, useId, useState } from "react";
import PropTypes from "prop-types";
import { Eye, EyeOff } from "lucide-react";
import { IconButton, cx } from "shared/components/ui";
import { controlBase, controlError } from "shared/components/ui/cx";

/**
 * Campo de contraseña con mostrar/ocultar. Label asociado (htmlFor/id), error y hint enlazados
 * con aria-describedby. `labelAside` permite un enlace a la derecha del label ("¿Olvidaste…?").
 */
const PasswordField = forwardRef(function PasswordField(
  { id, label, hint, error, required, labelAside, visible, onToggleVisible, className = "", ...rest },
  ref
) {
  const auto = useId();
  const fieldId = id || `pw${auto.replace(/:/g, "")}`;
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;
  const [localVisible, setLocalVisible] = useState(false);
  const isControlled = typeof visible === "boolean";
  const show = isControlled ? visible : localVisible;
  const toggle = () => (isControlled ? onToggleVisible?.() : setLocalVisible((v) => !v));

  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={fieldId} className="text-[13px] font-medium leading-5 text-fg">
          {label}
          {required && (
            <span className="ml-0.5 text-red-600" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {labelAside}
      </div>
      <div className="relative">
        <input
          ref={ref}
          id={fieldId}
          type={show ? "text" : "password"}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={cx(controlBase, "h-10 px-3.5 pr-11", error && controlError)}
          {...rest}
        />
        <IconButton
          label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          size="sm"
          onClick={toggle}
          className="absolute right-1.5 top-1/2 -translate-y-1/2"
        >
          {show ? <EyeOff /> : <Eye />}
        </IconButton>
      </div>
      {error ? (
        <p id={errorId} className="text-xs leading-snug text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs leading-snug text-fg-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

PasswordField.propTypes = {
  id: PropTypes.string,
  label: PropTypes.node.isRequired,
  hint: PropTypes.node,
  error: PropTypes.node,
  required: PropTypes.bool,
  labelAside: PropTypes.node,
  visible: PropTypes.bool,
  onToggleVisible: PropTypes.func,
  className: PropTypes.string,
};

export default PasswordField;
