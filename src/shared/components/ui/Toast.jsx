import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { cx, focusRing } from "./cx";

const paths = {
  success: "M4 10.5l3.5 3.5L16 6",
  error: "M6 6l8 8M14 6l-8 8",
  warning: "M10 6.5v4.5M10 14h.01M10 2.5L1.75 17h16.5L10 2.5z",
  info: "M10 9v5M10 6h.01M10 18a8 8 0 100-16 8 8 0 000 16z",
};

const tones = {
  success: "text-green-600",
  error: "text-red-600",
  warning: "text-amber-600",
  info: "text-primary-600",
};

const accents = {
  success: "bg-green-500",
  error: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-primary-500",
};

export function ToastIcon({ type = "info", className = "h-4 w-4" }) {
  return (
    <svg
      className={cx(className, tones[type] ?? tones.info)}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[type] ?? paths.info} />
    </svg>
  );
}

ToastIcon.propTypes = {
  type: PropTypes.oneOf(["success", "error", "warning", "info"]),
  className: PropTypes.string,
};

/** Notificación flotante (abajo-derecha). Autocierre según `duration` (0 = persistente). */
function Toast({ open, onClose, message, type = "info", duration = 4000 }) {
  const timerRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (open && duration > 0) {
      timerRef.current = setTimeout(() => onCloseRef.current?.(), duration);
    }
    return () => clearTimeout(timerRef.current);
  }, [open, duration, message]);

  if (!open) return null;

  const isUrgent = type === "error" || type === "warning";

  return (
    <div className="fixed bottom-4 right-4 z-[70] w-[calc(100vw-2rem)] max-w-sm sm:bottom-6 sm:right-6">
      <div
        role={isUrgent ? "alert" : "status"}
        aria-live={isUrgent ? "assertive" : "polite"}
        className="relative flex animate-slide-up items-start gap-3 overflow-hidden rounded-md border border-line bg-white py-3 pl-4 pr-3 shadow-md"
      >
        <span className={cx("absolute inset-y-0 left-0 w-[3px]", accents[type] ?? accents.info)} aria-hidden="true" />
        <span className="mt-0.5 shrink-0">
          <ToastIcon type={type} />
        </span>
        <p className="flex-1 text-sm font-medium leading-5 text-fg">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className={cx(
            "-my-0.5 shrink-0 rounded p-1 text-fg-subtle transition-colors hover:bg-zinc-100 hover:text-fg",
            focusRing
          )}
          aria-label="Cerrar notificación"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

Toast.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["success", "error", "warning", "info"]),
  duration: PropTypes.number,
};

export default Toast;
