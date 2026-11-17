import PropTypes from "prop-types";
import { cx, focusRing } from "./cx";

/*
 * Tabla compuesta con bordes finos.
 *
 * <Table>
 *   <TableHead>
 *     <TableRow>
 *       <TableHeaderCell>Cancha</TableHeaderCell>
 *       <TableHeaderCell align="right">Precio</TableHeaderCell>
 *     </TableRow>
 *   </TableHead>
 *   <TableBody>
 *     <TableRow onClick={...}>
 *       <TableCell>Norte</TableCell>
 *       <TableCell align="right" numeric>$80.000</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 */

const alignClass = { left: "text-left", center: "text-center", right: "text-right" };

export function Table({ children, bare = false, dense = false, className = "", containerClassName = "", caption, ...rest }) {
  return (
    <div
      className={cx(
        "w-full overflow-x-auto",
        !bare && "rounded-lg border border-line bg-white",
        containerClassName
      )}
    >
      <table
        className={cx(
          "w-full border-collapse text-sm text-fg",
          dense ? "[&_td]:py-1.5 [&_th]:h-8" : "",
          className
        )}
        {...rest}
      >
        {caption && <caption className="sr-only">{caption}</caption>}
        {children}
      </table>
    </div>
  );
}

Table.propTypes = {
  children: PropTypes.node.isRequired,
  /** Sin borde/fondo exterior (p. ej. dentro de SectionCard padding="p-0"). */
  bare: PropTypes.bool,
  /** Filas compactas. */
  dense: PropTypes.bool,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  /** Título accesible (oculto visualmente). */
  caption: PropTypes.node,
};

export function TableHead({ children, sticky = false, className = "" }) {
  return (
    <thead className={cx("bg-zinc-50", sticky && "sticky top-0 z-10", className)}>{children}</thead>
  );
}

TableHead.propTypes = {
  children: PropTypes.node.isRequired,
  sticky: PropTypes.bool,
  className: PropTypes.string,
};

export function TableBody({ children, className = "" }) {
  return <tbody className={cx("[&>tr:last-child>td]:border-b-0", className)}>{children}</tbody>;
}

TableBody.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export function TableRow({ children, onClick, selected = false, className = "", ...rest }) {
  const interactive = Boolean(onClick);
  return (
    <tr
      onClick={onClick}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.target !== e.currentTarget) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick(e);
              }
            }
          : undefined
      }
      data-selected={selected ? "" : undefined}
      className={cx(
        "transition-colors duration-100",
        selected ? "bg-primary-50/60" : "hover:bg-zinc-50/80",
        interactive && cx("cursor-pointer", focusRing),
        className
      )}
      {...rest}
    >
      {children}
    </tr>
  );
}

TableRow.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  selected: PropTypes.bool,
  className: PropTypes.string,
};

function SortIcon({ direction }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3" aria-hidden="true">
      <path d="M5 6.5L8 3.5l3 3" className={direction === "asc" ? "opacity-100" : "opacity-35"} />
      <path d="M5 9.5l3 3 3-3" className={direction === "desc" ? "opacity-100" : "opacity-35"} />
    </svg>
  );
}

SortIcon.propTypes = { direction: PropTypes.oneOf(["asc", "desc", false, null]) };

export function TableHeaderCell({
  children,
  align = "left",
  sortDirection,
  onSort,
  width,
  className = "",
  ...rest
}) {
  const sortable = typeof onSort === "function";
  const ariaSort = sortDirection === "asc" ? "ascending" : sortDirection === "desc" ? "descending" : sortable ? "none" : undefined;
  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      style={width ? { width } : undefined}
      className={cx(
        "h-9 whitespace-nowrap border-b border-line px-3 text-xs font-medium text-fg-muted first:pl-4 last:pr-4",
        alignClass[align] ?? alignClass.left,
        className
      )}
      {...rest}
    >
      {sortable ? (
        <button
          type="button"
          onClick={onSort}
          className={cx(
            "-mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 hover:text-fg",
            sortDirection && "text-fg",
            focusRing
          )}
        >
          {children}
          <SortIcon direction={sortDirection} />
        </button>
      ) : (
        children
      )}
    </th>
  );
}

TableHeaderCell.propTypes = {
  children: PropTypes.node,
  align: PropTypes.oneOf(["left", "center", "right"]),
  sortDirection: PropTypes.oneOf(["asc", "desc", false, null]),
  onSort: PropTypes.func,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
};

export function TableCell({ children, align = "left", numeric = false, muted = false, nowrap = false, className = "", ...rest }) {
  return (
    <td
      className={cx(
        "border-b border-line-subtle px-3 py-2.5 align-middle first:pl-4 last:pr-4",
        alignClass[align] ?? alignClass.left,
        numeric && "tabular",
        muted && "text-fg-muted",
        nowrap && "whitespace-nowrap",
        className
      )}
      {...rest}
    >
      {children}
    </td>
  );
}

TableCell.propTypes = {
  children: PropTypes.node,
  align: PropTypes.oneOf(["left", "center", "right"]),
  numeric: PropTypes.bool,
  muted: PropTypes.bool,
  nowrap: PropTypes.bool,
  className: PropTypes.string,
};

/** Fila única para "sin resultados" / carga dentro del tbody. */
export function TableEmpty({ colSpan, children, className = "" }) {
  return (
    <tr>
      <td colSpan={colSpan} className={cx("px-4 py-10 text-center text-[13px] text-fg-muted", className)}>
        {children}
      </td>
    </tr>
  );
}

TableEmpty.propTypes = {
  colSpan: PropTypes.number.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default Table;
