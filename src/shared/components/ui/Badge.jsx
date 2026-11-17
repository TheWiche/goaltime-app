import PropTypes from "prop-types";
import { cx } from "./cx";

const variants = {
  success: "bg-green-50 text-green-700 ring-green-600/20",
  warning: "bg-amber-50 text-amber-800 ring-amber-600/25",
  error: "bg-red-50 text-red-700 ring-red-600/20",
  info: "bg-primary-50 text-primary-700 ring-primary-600/20",
  gray: "bg-zinc-100 text-zinc-700 ring-zinc-500/15",
  dark: "bg-zinc-900 text-white ring-zinc-900",
  goaltime: "bg-primary-600 text-white ring-primary-600",
  orange: "bg-cta-50 text-cta-700 ring-cta-600/25",
};

const sizes = {
  sm: "h-5 px-1.5 text-2xs gap-1",
  md: "h-[22px] px-2 text-xs gap-1.5",
  lg: "h-6 px-2.5 text-[13px] gap-1.5",
};

/** Etiqueta compacta (conteos, categorías). Para estados de negocio usa StatusPill. */
function Badge({ children, variant = "gray", size = "md", dot = false, className = "" }) {
  return (
    <span
      className={cx(
        "inline-flex items-center whitespace-nowrap rounded font-medium ring-1 ring-inset",
        variants[variant] ?? variants.gray,
        sizes[size] ?? sizes.md,
        className
      )}
    >
      {dot && <span className="inline-block h-1.5 w-1.5 rounded-[1px] bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["success", "warning", "error", "info", "gray", "dark", "goaltime", "orange"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  dot: PropTypes.bool,
  className: PropTypes.string,
};

export default Badge;
