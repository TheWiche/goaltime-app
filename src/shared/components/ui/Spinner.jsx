import PropTypes from "prop-types";
import { cx } from "./cx";

const sizes = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-[3px]",
};

/** Indicador de carga (único elemento circular de ui/ junto con Avatar). */
function Spinner({ className = "", size = "md", label = "Cargando" }) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cx(
        "inline-block animate-spin rounded-full border-zinc-200 border-t-primary-600",
        sizes[size] ?? sizes.md,
        className
      )}
    />
  );
}

Spinner.propTypes = {
  className: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  label: PropTypes.string,
};

export default Spinner;
