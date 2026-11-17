import PropTypes from "prop-types";
import { cx } from "./cx";

const variants = {
  default: "bg-white border border-line",
  flat: "bg-zinc-50 border border-line",
  dark: "bg-zinc-900 text-white border border-zinc-800",
};
// Alias legacy: glass → default (sin blur ni transparencias)
variants.glass = variants.default;

function Card({ children, variant = "default", padding = "p-5", hover = false, className = "", ...rest }) {
  return (
    <div
      className={cx(
        "rounded-lg transition-colors duration-150",
        variants[variant] ?? variants.default,
        padding,
        hover && "cursor-pointer hover:border-line-strong hover:shadow-sm",
        className
      )}
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
