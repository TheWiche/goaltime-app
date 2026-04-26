import PropTypes from "prop-types";

/** Spinner sin MUI; solo Tailwind */
function Spinner({ className = "", size = "md", label = "Cargando" }) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-[3px]",
  };
  return (
    <span
      role="status"
      aria-label={label}
      className={[
        "inline-block animate-spin rounded-full border-primary border-t-transparent",
        sizes[size] ?? sizes.md,
        className,
      ].join(" ")}
    />
  );
}

Spinner.propTypes = {
  className: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  label: PropTypes.string,
};

export default Spinner;
