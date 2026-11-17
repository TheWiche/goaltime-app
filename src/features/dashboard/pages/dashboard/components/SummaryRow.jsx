import PropTypes from "prop-types";

const valueTone = {
  success: "text-green-700",
  warning: "text-amber-700",
  danger: "text-red-700",
};

/** Par etiqueta/valor separado por borde fino. */
function SummaryRow({ label, value, tone }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line-subtle py-2.5 first:pt-0 last:border-b-0 last:pb-0">
      <dt className="text-[13px] text-fg-muted">{label}</dt>
      <dd className={`tabular text-sm font-semibold ${valueTone[tone] || "text-fg-strong"}`}>{value}</dd>
    </div>
  );
}

SummaryRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  tone: PropTypes.oneOf(["success", "warning", "danger"]),
};

export default SummaryRow;
