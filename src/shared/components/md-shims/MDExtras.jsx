// MDSnackbar, MDAvatar, MDProgress shims (API MUI conservada, estilos del sistema).
import PropTypes from "prop-types";
import { ToastIcon } from "shared/components/ui/Toast";

const snackbarType = {
  success: "success",
  error: "error",
  warning: "warning",
  info: "info",
  primary: "info",
  dark: "info",
  light: "info",
};

const iconNameToType = { check: "success", warning: "warning", error: "error", info: "info" };

export function MDSnackbar({ open, close, onClose, color = "info", title, content, icon, dateTime }) {
  if (!open) return null;
  const handleClose = close || onClose;
  const type =
    typeof icon === "string" && iconNameToType[icon] ? iconNameToType[icon] : snackbarType[color] || "info";
  const urgent = type === "error" || type === "warning";

  return (
    <div className="fixed bottom-4 right-4 z-[70] w-[calc(100vw-2rem)] max-w-sm sm:bottom-6 sm:right-6">
      <div
        role={urgent ? "alert" : "status"}
        aria-live={urgent ? "assertive" : "polite"}
        className="relative flex animate-slide-up items-start gap-3 rounded-md border border-line bg-white p-3 pr-10 shadow-md"
      >
        <span className="mt-0.5 shrink-0">
          {icon && typeof icon !== "string" ? icon : <ToastIcon type={type} />}
        </span>
        <div className="min-w-0 flex-1">
          {title && (
            <p className="text-sm font-semibold leading-5 text-fg-strong">
              {title}
              {dateTime && <span className="ml-2 text-xs font-normal text-fg-subtle">{dateTime}</span>}
            </p>
          )}
          {content && <div className="text-[13px] leading-5 text-fg-muted">{content}</div>}
        </div>
        {handleClose && (
          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar notificación"
            className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded text-fg-subtle hover:bg-zinc-100 hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

MDSnackbar.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  onClose: PropTypes.func,
  color: PropTypes.string,
  title: PropTypes.node,
  content: PropTypes.node,
  icon: PropTypes.node,
  dateTime: PropTypes.node,
};

const avatarSizes = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-20 w-20",
};

/** Avatar circular (excepción permitida al sistema angular). Para código nuevo usa ui/Avatar. */
export function MDAvatar({ src, alt, size = "md", className = "", shadow, bgColor, ...rest }) {
  const sizeClass = avatarSizes[size] || avatarSizes.md;
  return (
    <img
      src={src}
      alt={alt || ""}
      className={`rounded-full bg-zinc-100 object-cover ring-1 ring-black/5 ${sizeClass} ${className}`.trim()}
      {...rest}
    />
  );
}

MDAvatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  size: PropTypes.string,
  className: PropTypes.string,
  shadow: PropTypes.string,
  bgColor: PropTypes.string,
};

const progressColors = {
  info: "bg-primary-600",
  primary: "bg-primary-600",
  success: "bg-green-600",
  warning: "bg-amber-500",
  error: "bg-red-600",
  dark: "bg-zinc-900",
};

/** Barra de progreso rectangular. */
export function MDProgress({ value = 0, color = "info", label }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-sm bg-zinc-100"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={typeof label === "string" ? label : undefined}
    >
      <div className={`h-full rounded-sm ${progressColors[color] || progressColors.info}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

MDProgress.propTypes = {
  value: PropTypes.number,
  color: PropTypes.string,
  variant: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
};
