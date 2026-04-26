import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useToastEntrance } from "shared/hooks/useGSAPAnimations";

const icons = {
  success: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
};

const styles = {
  success: "bg-goaltime-50 border-goaltime-400 text-goaltime-700",
  error: "bg-red-50 border-red-400 text-red-700",
  warning: "bg-yellow-50 border-yellow-400 text-yellow-700",
  info: "bg-blue-50 border-blue-400 text-blue-700",
};

function Toast({ open, onClose, message, type = "info", duration = 4000 }) {
  const timerRef = useRef(null);
  const toastRef = useToastEntrance();

  useEffect(() => {
    if (open && duration > 0) {
      timerRef.current = setTimeout(() => onClose?.(), duration);
    }
    return () => clearTimeout(timerRef.current);
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={toastRef}>
      <div
        className={[
          "flex items-start gap-3 px-4 py-3 rounded-xl border shadow-card-hover max-w-sm",
          styles[type] ?? styles.info,
        ].join(" ")}
      >
        <span className="flex-shrink-0 mt-0.5">{icons[type]}</span>
        <p className="text-sm font-medium leading-snug flex-1">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Cerrar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
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
