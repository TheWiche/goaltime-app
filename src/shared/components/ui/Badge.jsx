import PropTypes from "prop-types";

const variants = {
  success: "bg-goaltime-100 text-goaltime-700",
  warning: "bg-yellow-100 text-yellow-700",
  error: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
  gray: "bg-gray-100 text-gray-600",
  dark: "bg-dark text-white",
  goaltime: "bg-goaltime text-white",
  orange: "bg-orange text-white",
};

const sizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

function Badge({ children, variant = "gray", size = "md", dot = false, className = "" }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 font-medium rounded-full",
        variants[variant] ?? variants.gray,
        sizes[size] ?? sizes.md,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />}
      {children}
    </span>
  );
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    "success",
    "warning",
    "error",
    "info",
    "gray",
    "dark",
    "goaltime",
    "orange",
  ]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  dot: PropTypes.bool,
  className: PropTypes.string,
};

export default Badge;
