// MDTypography shim - Wrapper temporal para migración progresiva
import PropTypes from "prop-types";

const variantMap = {
  h1: "text-4xl font-bold",
  h2: "text-3xl font-bold",
  h3: "text-2xl font-bold",
  h4: "text-xl font-bold",
  h5: "text-lg font-bold",
  h6: "text-base font-bold",
  subtitle1: "text-base",
  subtitle2: "text-sm",
  body1: "text-base",
  body2: "text-sm",
  caption: "text-xs",
  button: "text-sm font-medium uppercase",
};

function MDTypography({
  children,
  variant = "body1",
  className = "",
  color = "dark",
  fontWeight,
  textTransform,
  ...rest
}) {
  const Component = variant.startsWith("h") ? variant : "p";
  const baseClass = variantMap[variant] || "";
  const weightClass = fontWeight ? `font-${fontWeight}` : "";
  const transformClass = textTransform ? `uppercase` : "";

  return (
    <Component className={`${baseClass} ${weightClass} ${transformClass} ${className}`} {...rest}>
      {children}
    </Component>
  );
}

MDTypography.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.string,
  className: PropTypes.string,
  color: PropTypes.string,
  fontWeight: PropTypes.string,
  textTransform: PropTypes.string,
};

export default MDTypography;
