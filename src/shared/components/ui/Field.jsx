import { forwardRef, useId } from "react";
import PropTypes from "prop-types";
import { cx, controlBase, controlError } from "./cx";

const sizeControl = {
  sm: "h-8 px-2.5 text-[13px]",
  md: "h-9 px-3 text-sm",
  lg: "h-10 px-3.5 text-sm",
};

/** Genera ids estables para label/hint/error cuando el consumidor no pasa `id`. */
function useFieldIds(id) {
  const auto = useId();
  const fieldId = id || `f${auto.replace(/:/g, "")}`;
  return { fieldId, hintId: `${fieldId}-hint`, errorId: `${fieldId}-error` };
}

function describedBy({ hint, error, hintId, errorId, extra }) {
  return cx(error ? errorId : hint ? hintId : null, extra) || undefined;
}

/** Envoltorio de campo: label + control + ayuda/error. Útil para controles propios. */
function FieldShell({ id, label, hint, error, required, inline, optional, className = "", children, hintId, errorId }) {
  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      {label && (
        <div className={inline || optional ? "flex items-center justify-between gap-2" : undefined}>
          <label htmlFor={id} className="text-[13px] font-medium leading-5 text-fg">
            {label}
            {required && (
              <span className="ml-0.5 text-red-600" aria-hidden="true">
                *
              </span>
            )}
          </label>
          {optional && <span className="text-xs text-fg-subtle">Opcional</span>}
        </div>
      )}
      {children}
      {error ? (
        <p id={errorId || (id ? `${id}-error` : undefined)} className="text-xs leading-snug text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId || (id ? `${id}-hint` : undefined)} className="text-xs leading-snug text-fg-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

FieldShell.propTypes = {
  id: PropTypes.string,
  label: PropTypes.node,
  hint: PropTypes.node,
  error: PropTypes.node,
  required: PropTypes.bool,
  inline: PropTypes.bool,
  optional: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  hintId: PropTypes.string,
  errorId: PropTypes.string,
};

const TextField = forwardRef(function TextField(
  {
    id,
    label,
    hint,
    error,
    required,
    optional,
    size = "md",
    leftIcon,
    rightIcon,
    prefix,
    className = "",
    inputClassName = "",
    "aria-describedby": ariaDescribedBy,
    ...rest
  },
  ref
) {
  const { fieldId, hintId, errorId } = useFieldIds(id);
  const hasLeft = Boolean(leftIcon || prefix);
  const hasRight = Boolean(rightIcon);

  return (
    <FieldShell
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      className={className}
      hintId={hintId}
      errorId={errorId}
    >
      <div className="relative">
        {hasLeft && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-fg-subtle [&>svg]:h-4 [&>svg]:w-4">
            {leftIcon || <span className="font-medium text-fg-muted">{prefix}</span>}
          </span>
        )}
        <input
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy({ hint, error, hintId, errorId, extra: ariaDescribedBy })}
          className={cx(
            controlBase,
            sizeControl[size] ?? sizeControl.md,
            hasLeft && "pl-9",
            hasRight && "pr-9",
            error && controlError,
            inputClassName
          )}
          {...rest}
        />
        {hasRight && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-fg-subtle [&>svg]:h-4 [&>svg]:w-4">
            {rightIcon}
          </span>
        )}
      </div>
    </FieldShell>
  );
});

TextField.propTypes = {
  id: PropTypes.string,
  label: PropTypes.node,
  hint: PropTypes.node,
  error: PropTypes.node,
  required: PropTypes.bool,
  optional: PropTypes.bool,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  prefix: PropTypes.node,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  "aria-describedby": PropTypes.string,
};

const Textarea = forwardRef(function Textarea(
  {
    id,
    label,
    hint,
    error,
    required,
    optional,
    rows = 4,
    className = "",
    inputClassName = "",
    "aria-describedby": ariaDescribedBy,
    ...rest
  },
  ref
) {
  const { fieldId, hintId, errorId } = useFieldIds(id);
  return (
    <FieldShell
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      className={className}
      hintId={hintId}
      errorId={errorId}
    >
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy({ hint, error, hintId, errorId, extra: ariaDescribedBy })}
        className={cx(controlBase, "resize-y px-3 py-2 leading-relaxed", error && controlError, inputClassName)}
        {...rest}
      />
    </FieldShell>
  );
});

Textarea.propTypes = {
  id: PropTypes.string,
  label: PropTypes.node,
  hint: PropTypes.node,
  error: PropTypes.node,
  required: PropTypes.bool,
  optional: PropTypes.bool,
  rows: PropTypes.number,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  "aria-describedby": PropTypes.string,
};

const SelectField = forwardRef(function SelectField(
  {
    id,
    label,
    hint,
    error,
    required,
    optional,
    size = "md",
    options = [],
    placeholder,
    className = "",
    inputClassName = "",
    children,
    "aria-describedby": ariaDescribedBy,
    ...rest
  },
  ref
) {
  const { fieldId, hintId, errorId } = useFieldIds(id);
  return (
    <FieldShell
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      className={className}
      hintId={hintId}
      errorId={errorId}
    >
      <div className="relative">
        <select
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy({ hint, error, hintId, errorId, extra: ariaDescribedBy })}
          className={cx(
            controlBase,
            sizeControl[size] ?? sizeControl.md,
            "cursor-pointer appearance-none pr-9",
            error && controlError,
            inputClassName
          )}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children
            ? children
            : options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fg-subtle"
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="square" />
        </svg>
      </div>
    </FieldShell>
  );
});

SelectField.propTypes = {
  id: PropTypes.string,
  label: PropTypes.node,
  hint: PropTypes.node,
  error: PropTypes.node,
  required: PropTypes.bool,
  optional: PropTypes.bool,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.node.isRequired,
      disabled: PropTypes.bool,
    })
  ),
  placeholder: PropTypes.string,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  children: PropTypes.node,
  "aria-describedby": PropTypes.string,
};

/** Alias corto: `<Select>` === `<SelectField>` (label opcional). */
const Select = SelectField;

export { TextField, Textarea, SelectField, Select, FieldShell };
export default TextField;
