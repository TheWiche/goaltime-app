import PropTypes from "prop-types";
import { formatNumber } from "shared/utils/format";

/** Barra de distribución: etiqueta, conteo, porcentaje y barra recta de 6px. */
function RoleBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.min(100, (count / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
        <span className="text-fg-muted">{label}</span>
        <span className="tabular text-fg-strong">
          <span className="font-semibold">{formatNumber(count)}</span>
          <span className="ml-1.5 text-xs text-fg-subtle">{Math.round(pct)}%</span>
        </span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-sm bg-zinc-100"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
      >
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

RoleBar.propTypes = {
  label: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
};

export default RoleBar;
