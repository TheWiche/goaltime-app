// Props heredadas de MUI "system" que los shims aceptan pero NO aplican.
// Se filtran para que no lleguen al DOM (evita warnings de React y atributos basura).
// Para espaciado/alineación usa className con utilidades Tailwind.
const SYSTEM_PROPS = [
  "variant", "bgColor", "borderRadius", "coloredShadow", "shadow", "opacity", "sx",
  "p", "pt", "pb", "pl", "pr", "px", "py",
  "m", "mt", "mb", "ml", "mr", "mx", "my",
  "display", "width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight",
  "alignItems", "justifyContent", "flexDirection", "flexWrap", "gap",
  "textAlign", "textGradient", "verticalAlign", "position", "top", "left", "right", "bottom", "zIndex",
  "lineHeight", "overflow", "opacity", "fontSize", "letterSpacing",
];

export function stripSystemProps(props) {
  const out = {};
  Object.keys(props).forEach((key) => {
    if (!SYSTEM_PROPS.includes(key)) out[key] = props[key];
  });
  return out;
}
