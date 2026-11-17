import PropTypes from "prop-types";
import Button from "./Button";
import { cx } from "./cx";

/** Pie de lista: "Mostrando X de Y" + botón "Cargar más". */
function LoadMoreFooter({ shown, total, hasMore, onLoadMore, className = "" }) {
  if (total === 0) return null;
  return (
    <div
      className={cx(
        "flex flex-col items-center justify-between gap-2 text-xs text-fg-muted sm:flex-row",
        className
      )}
    >
      <span className="tabular" aria-live="polite">
        Mostrando {shown} de {total}
      </span>
      {hasMore && (
        <Button type="button" size="sm" variant="secondary" onClick={onLoadMore}>
          Cargar más
        </Button>
      )}
    </div>
  );
}

LoadMoreFooter.propTypes = {
  shown: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  hasMore: PropTypes.bool.isRequired,
  onLoadMore: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default LoadMoreFooter;
