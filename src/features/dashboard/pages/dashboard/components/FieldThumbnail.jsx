import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Trophy, ChevronRight } from "lucide-react";
import { StatusPill, cx, focusRing } from "shared/components/ui";
import { getFieldStatusMeta } from "shared/utils/reservationStatus";

const rowClass = cx(
  "flex w-full items-center gap-3 px-5 py-3 text-left transition-colors duration-150 hover:bg-zinc-50",
  focusRing,
  "focus-visible:ring-inset"
);

/**
 * Fila de cancha: miniatura cuadrada + nombre/dirección + estado.
 * Pasa `to` para navegar (Link) o `onClick` para abrir algo (button).
 */
function FieldThumbnail({ field, to, onClick }) {
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => setImageFailed(false), [field.imageUrl]);

  const status = getFieldStatusMeta(field.status);
  const showImage = Boolean(field.imageUrl) && !imageFailed;

  const content = (
    <>
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-line bg-zinc-50 text-fg-subtle">
        {showImage ? (
          <img
            src={field.imageUrl}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <Trophy className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-fg-strong">
          {field.name || "Cancha sin nombre"}
        </span>
        <span className="mt-0.5 block truncate text-xs text-fg-subtle">
          {field.address || "Sin dirección"}
        </span>
      </span>
      <StatusPill tone={status.tone} size="sm">
        {status.label}
      </StatusPill>
      <ChevronRight className="h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />
    </>
  );

  if (to) {
    return (
      <Link to={to} className={rowClass}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={rowClass}>
      {content}
    </button>
  );
}

FieldThumbnail.propTypes = {
  field: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    address: PropTypes.string,
    imageUrl: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
  to: PropTypes.string,
  onClick: PropTypes.func,
};

export default FieldThumbnail;
