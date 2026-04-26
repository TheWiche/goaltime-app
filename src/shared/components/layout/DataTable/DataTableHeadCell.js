import PropTypes from "prop-types";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useMaterialUIController } from "shared/context";

function DataTableHeadCell({ width, children, sorted, align, ...rest }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const alignClass =
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

  return (
    <th
      scope="col"
      className={[
        "border-b border-slate-200 py-3 px-3",
        darkMode ? "text-white/90" : "text-slate-600",
        alignClass,
      ].join(" ")}
      style={width && width !== "auto" ? { width } : undefined}
    >
      <div
        {...rest}
        className={[
          "relative text-[10px] font-bold uppercase tracking-wide",
          sorted ? "cursor-pointer select-none" : "",
          alignClass,
        ].join(" ")}
      >
        {children}
        {sorted && (
          <span
            className={[
              "absolute top-1/2 -translate-y-1/2 inline-flex flex-col leading-none",
              align === "right" ? "left-0" : "right-4",
            ].join(" ")}
          >
            <ChevronUp
              className={[
                "h-4 w-4 -mb-1",
                sorted === "asce" ? "text-slate-900 opacity-100" : "text-slate-400 opacity-50",
              ].join(" ")}
              strokeWidth={2}
              aria-hidden
            />
            <ChevronDown
              className={[
                "h-4 w-4",
                sorted === "desc" ? "text-slate-900 opacity-100" : "text-slate-400 opacity-50",
              ].join(" ")}
              strokeWidth={2}
              aria-hidden
            />
          </span>
        )}
      </div>
    </th>
  );
}

DataTableHeadCell.defaultProps = {
  width: "auto",
  sorted: "none",
  align: "left",
};

DataTableHeadCell.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  children: PropTypes.node.isRequired,
  sorted: PropTypes.oneOf([false, "none", "asce", "desc"]),
  align: PropTypes.oneOf(["left", "right", "center"]),
};

export default DataTableHeadCell;
