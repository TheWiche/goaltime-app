import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { cx } from "./cx";

const sizes = {
  xs: "h-6 w-6 text-2xs",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-20 w-20 text-xl",
};

function initialsOf(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/**
 * Avatar de usuario/entidad. Único lugar del sistema con círculo (shape="circle").
 * shape="square" → cuadrado redondeado 4px (para canchas, organizaciones).
 * Sin `src` (o si falla la carga) muestra iniciales de `name`.
 */
function Avatar({ src, alt, name, size = "md", shape = "circle", className = "", ...rest }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  const showImage = Boolean(src) && !failed;
  const label = alt || name || "";

  return (
    <span
      className={cx(
        "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden",
        "bg-zinc-100 font-medium text-fg-muted ring-1 ring-inset ring-black/5",
        shape === "square" ? "rounded" : "rounded-full",
        sizes[size] ?? sizes.md,
        className
      )}
      role={showImage ? undefined : "img"}
      aria-label={showImage ? undefined : label || undefined}
      {...rest}
    >
      {showImage ? (
        <img src={src} alt={label} className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden="true">{initialsOf(name || alt)}</span>
      )}
    </span>
  );
}

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
  shape: PropTypes.oneOf(["circle", "square"]),
  className: PropTypes.string,
};

export default Avatar;
