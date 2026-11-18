import { useState } from "react";
import PropTypes from "prop-types";
import { ImageOff } from "lucide-react";
import { cx } from "shared/components/ui";

/**
 * Portada 16:9 de una cancha. Sin `src` muestra un placeholder neutro ("Sin imagen");
 * si la imagen falla al cargar, "Imagen no disponible". `children` se pinta encima (overlays).
 */
export default function FieldCover({ src, alt, className = "", children }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const [loadedSrc, setLoadedSrc] = useState(null);
  const failed = Boolean(src) && failedSrc === src;
  const showImage = Boolean(src) && !failed;

  return (
    <div className={cx("relative aspect-[16/9] overflow-hidden bg-zinc-100", className)}>
      {showImage ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={cx(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-150",
            loadedSrc === src ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setLoadedSrc(src)}
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-fg-subtle">
          <ImageOff className="h-6 w-6" strokeWidth={1.5} aria-hidden />
          <span className="text-xs">{failed ? "Imagen no disponible" : "Sin imagen"}</span>
        </div>
      )}
      {children}
    </div>
  );
}

FieldCover.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
};
