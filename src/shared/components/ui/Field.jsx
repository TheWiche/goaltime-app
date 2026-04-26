import { forwardRef } from "react";
import PropTypes from "prop-types";

const baseControl =
  "w-full bg-white text-[0.9375rem] text-slate-900 placeholder:text-slate-400 " +
  "border border-slate-200 rounded-lg transition-all duration-200 " +
  "focus:outline-none focus:ring-[3px] focus:ring-primary/20 focus:border-primary " +
  "disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-50";

const sizeControl = {
  sm: "px-3 py-2 text-sm",
  md: "px-3.5 py-2.5",
  lg: "px-4 py-3 text-base",
};

function FieldShell({
  id,
  label,
  hint,
  error,
  required,
  inline,
  optional,
  className = "",
  children,
}) {
  return (
    <div className={["flex flex-col gap-1.5", className].join(" ")}>
      {label && (
        <div className={inline ? "flex items-center justify-between gap-2" : ""}>
          <label
            htmlFor={id}
            className="text-[12px] font-semibold text-slate-700 font-heading"
          >
            {label}
            {required && <span className="text-cta ml-0.5">*</span>}
          </label>
          {optional && (
            <span className="text-[11px] font-medium text-slate-400">Opcional</span>
          )}
        </div>
      )}
      {children}
      {error ? (
        <p className="text-xs text-red-600 leading-snug">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-500 leading-snug">{hint}</p>
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
    ...rest
  },
  ref
) {
  const hasLeft = Boolean(leftIcon || prefix);
  const hasRight = Boolean(rightIcon);

  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      className={className}
    >
      <div className="relative">
        {hasLeft && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400 text-sm">
            {leftIcon || <span className="text-slate-500 font-medium">{prefix}</span>}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          className={[
            baseControl,
            sizeControl[size] ?? sizeControl.md,
            hasLeft ? "pl-10" : "",
            hasRight ? "pr-10" : "",
            error ? "border-red-300 focus:ring-red-200 focus:border-red-500" : "",
            inputClassName,
          ]
            .filter(Boolean)
            .join(" ")}
          {...rest}
        />
        {hasRight && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
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
    ...rest
  },
  ref
) {
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      className={className}
    >
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        className={[
          baseControl,
          "px-3.5 py-2.5 resize-y leading-relaxed",
          error ? "border-red-300 focus:ring-red-200 focus:border-red-500" : "",
          inputClassName,
        ]
          .filter(Boolean)
          .join(" ")}
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
    ...rest
  },
  ref
) {
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      className={className}
    >
      <div className="relative">
        <select
          ref={ref}
          id={id}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          className={[
            baseControl,
            sizeControl[size] ?? sizeControl.md,
            "appearance-none pr-10 cursor-pointer",
            error ? "border-red-300 focus:ring-red-200 focus:border-red-500" : "",
            inputClassName,
          ]
            .filter(Boolean)
            .join(" ")}
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
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 011.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
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
};

export { TextField, Textarea, SelectField, FieldShell };
export default TextField;
