import PropTypes from "prop-types";

const variants = {
  default: "bg-white border border-gray-100 shadow-card hover:shadow-card-hover",
  flat: "bg-gray-50 border border-gray-100",
  glass: "bg-white/70 backdrop-blur-sm border border-white/40 shadow-card",
  dark: "bg-dark text-white border border-dark-800 shadow-card",
};

function Card({
  children,
  variant = "default",
  padding = "p-5",
  hover = false,
  className = "",
  ...rest
}) {
  return (
    <div
      className={[
        "rounded-2xl transition-all duration-200",
        variants[variant] ?? variants.default,
        padding,
        hover ? "cursor-pointer hover:-translate-y-0.5" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["default", "flat", "glass", "dark"]),
  padding: PropTypes.string,
  hover: PropTypes.bool,
  className: PropTypes.string,
};

export default Card;
