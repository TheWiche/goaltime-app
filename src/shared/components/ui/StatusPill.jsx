import PropTypes from "prop-types";
import { cx } from "./cx";

const tones = {
  success: { box: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" },
  warning: { box: "bg-amber-50 text-amber-800 border-amber-200", dot: "bg-amber-500" },
  danger: { box: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
  info: { box: "bg-primary-50 text-primary-700 border-primary-200", dot: "bg-primary-500" },
  neutral: { box: "bg-zinc-50 text-zinc-700 border-line", dot: "bg-zinc-400" },
  cta: { box: "bg-cta-50 text-cta-700 border-cta-200", dot: "bg-cta-500" },
};

const sizes = {
  sm: "h-5 px-1.5 text-2xs gap-1",
  md: "h-6 px-2 text-xs gap-1.5",
  lg: "h-7 px-2.5 text-[13px] gap-1.5",
};

/** Estado de negocio (reserva, cancha, usuario). Rectangular, borde 1px, fondo tintado. */
function StatusPill({ tone = "neutral", size = "md", icon, children, className = "", dot = false }) {
  const t = tones[tone] ?? tones.neutral;
  return (
    <span
      className={cx(
        "inline-flex items-center whitespace-nowrap rounded-md border font-medium leading-none",
        t.box,
        sizes[size] ?? sizes.md,
        className
      )}
    >
      {dot && <span className={cx("h-1.5 w-1.5 shrink-0 rounded-[1px]", t.dot)} aria-hidden="true" />}
      {icon && (
        <span className="inline-flex items-center [&>svg]:h-3.5 [&>svg]:w-3.5" aria-hidden="true">
          {icon}
        </span>
      )}
      <span>{children}</span>
    </span>
  );
}

StatusPill.propTypes = {
  tone: PropTypes.oneOf(["success", "warning", "danger", "info", "neutral", "cta"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  icon: PropTypes.node,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  dot: PropTypes.bool,
};

export default StatusPill;
