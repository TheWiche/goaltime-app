// MDTypography shim — tipografía mapeada a los tokens (Inter, escala 14px).
import PropTypes from "prop-types";
import { stripSystemProps } from "./systemProps";

const variantMap = {
  h1: "text-3xl font-semibold tracking-tight leading-tight",
  h2: "text-2xl font-semibold tracking-tight leading-tight",
  h3: "text-xl font-semibold tracking-tight leading-snug",
  h4: "text-lg font-semibold tracking-tight leading-snug",
  h5: "text-base font-semibold leading-snug",
  h6: "text-sm font-semibold leading-5",
  subtitle1: "text-base leading-6",
  subtitle2: "text-sm leading-5",
  body1: "text-sm leading-6",
  body2: "text-[13px] leading-5",
  caption: "text-xs leading-4",
  button: "text-[13px] font-medium leading-5",
};

const colorMap = {
  dark: "text-fg-strong",
  text: "text-fg-muted",
  secondary: "text-fg-muted",
  white: "text-white",
  light: "text-white/80",
  primary: "text-primary-600",
  info: "text-primary-600",
  success: "text-green-700",
  warning: "text-amber-700",
  error: "text-red-600",
};

const weightMap = {
  light: "font-normal",
  regular: "font-normal",
  medium: "font-medium",
  bold: "font-semibold",
};

const transformMap = {
  uppercase: "uppercase tracking-wide",
  capitalize: "capitalize",
  lowercase: "lowercase",
  none: "normal-case",
};

// Si className ya define un color de texto, no aplicamos el de `color`.
const HAS_TEXT_COLOR =
  /(^|\s)(?:[a-z-]+:)*text-(?!(?:xs|sm|base|lg|xl|\d?xl|2xs|left|right|center|justify|start|end|wrap|nowrap|balance|pretty|ellipsis|clip)\b)[a-z]/;

function MDTypography({
  children,
  variant = "body1",
  className = "",
  color = "dark",
  fontWeight,
  textTransform,
  component,
  ...rest
}) {
  const Component = component || (/^h[1-6]$/.test(variant) ? variant : "p");
  const classes = [
    variantMap[variant] || "",
    !HAS_TEXT_COLOR.test(className) ? colorMap[color] || "" : "",
    fontWeight ? weightMap[fontWeight] || "" : "",
    textTransform ? transformMap[textTransform] || "" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classes} {...stripSystemProps(rest)}>
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
  component: PropTypes.elementType,
};

export default MDTypography;
