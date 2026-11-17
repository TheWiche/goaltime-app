import PropTypes from "prop-types";
import { AlertTriangle } from "lucide-react";
import { Button } from "shared/components/ui";

/** Aviso de error en línea con reintento. */
function DashboardError({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700 sm:flex-row sm:items-center sm:justify-between"
    >
      <span className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        {message}
      </span>
      {onRetry && (
        <Button type="button" size="sm" variant="secondary" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}

DashboardError.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func,
};

export default DashboardError;
