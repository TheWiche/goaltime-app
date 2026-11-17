import PropTypes from "prop-types";
import { cx } from "./cx";

/** Bloque rectangular de carga. Dale tamaño con className (h-4 w-32) o width/height. */
export function Skeleton({ className = "", width, height, style, ...rest }) {
  return (
    <div
      aria-hidden="true"
      className={cx("animate-pulse rounded bg-zinc-200/70", className)}
      style={{ width, height, ...style }}
      {...rest}
    />
  );
}

Skeleton.propTypes = {
  className: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  style: PropTypes.object,
};

/** Varias líneas de texto simuladas; la última más corta. */
export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <div className={cx("space-y-2", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cx("h-3", i === lines - 1 && lines > 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}

SkeletonText.propTypes = {
  lines: PropTypes.number,
  className: PropTypes.string,
};

/** Tarjeta de carga (imagen + texto + botón) para grids de canchas. */
export function SkeletonCard({ className = "" }) {
  return (
    <div className={cx("overflow-hidden rounded-lg border border-line bg-white", className)} aria-hidden="true">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="mt-4 h-9 w-full" />
      </div>
    </div>
  );
}

SkeletonCard.propTypes = {
  className: PropTypes.string,
};

export function SkeletonGrid({ count = 6, className = "" }) {
  return (
    <div
      role="status"
      aria-label="Cargando"
      className={cx("grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3", className)}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

SkeletonGrid.propTypes = {
  count: PropTypes.number,
  className: PropTypes.string,
};

export default Skeleton;
