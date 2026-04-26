import PropTypes from "prop-types";

const tones = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-rose-50 text-rose-700 border-rose-200",
  info: "bg-primary-50 text-primary-700 border-primary-200",
  neutral: "bg-slate-50 text-slate-600 border-slate-200",
  cta: "bg-cta-50 text-cta-600 border-cta-200",
};

const sizes = {
  sm: "text-[11px] px-2 py-0.5 gap-1",
  md: "text-xs px-2.5 py-1 gap-1.5",
  lg: "text-sm px-3 py-1.5 gap-2",
};

function StatusPill({
  tone = "neutral",
  size = "md",
  icon,
  children,
  className = "",
  dot = false,
}) {
  return (
    <span
      className={[
        "inline-flex items-center font-medium rounded-full border whitespace-nowrap",
        tones[tone] ?? tones.neutral,
        sizes[size] ?? sizes.md,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />}
      {icon && <span className="inline-flex items-center">{icon}</span>}
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
