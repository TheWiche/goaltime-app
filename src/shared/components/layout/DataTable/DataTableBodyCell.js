import PropTypes from "prop-types";

const alignClass = (align) =>
  align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

function DataTableBodyCell({ noBorder, align, children, ...cellProps }) {
  return (
    <td
      {...cellProps}
      className={[
        "py-3 px-3 text-sm text-slate-800 align-middle",
        alignClass(align),
        noBorder ? "border-b-0" : "border-b border-slate-200",
      ].join(" ")}
    >
      <span className="inline-block max-w-max align-middle">{children}</span>
    </td>
  );
}

DataTableBodyCell.defaultProps = {
  noBorder: false,
  align: "left",
};

DataTableBodyCell.propTypes = {
  children: PropTypes.node.isRequired,
  noBorder: PropTypes.bool,
  align: PropTypes.oneOf(["left", "right", "center"]),
};

export default DataTableBodyCell;
