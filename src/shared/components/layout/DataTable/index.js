import { useMemo, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTable, usePagination, useGlobalFilter, useAsyncDebounce, useSortBy } from "react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { MDTypography, MDInput } from "shared/components/md-shims";
import DataTableHeadCell from "./DataTableHeadCell";
import DataTableBodyCell from "./DataTableBodyCell";

const pageBtnClass =
  "grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-40";

const pageNumClass = (active) =>
  [
    "min-w-[2.25rem] rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
    active ? "bg-primary text-white" : "bg-slate-100 text-slate-800 hover:bg-slate-200",
  ].join(" ");

function DataTable({
  entriesPerPage,
  canSearch,
  showTotalEntries,
  table,
  pagination,
  isSorted,
  noEndBorder,
}) {
  const defaultValue = entriesPerPage.defaultValue ? entriesPerPage.defaultValue : 10;
  const entries = entriesPerPage.entries
    ? entriesPerPage.entries.map((el) => el.toString())
    : ["5", "10", "15", "20", "25"];
  const columns = useMemo(() => table.columns, [table]);
  const data = useMemo(() => table.rows, [table]);

  const tableInstance = useTable(
    { columns, data, initialState: { pageIndex: 0 } },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    page,
    pageOptions,
    canPreviousPage,
    canNextPage,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    setGlobalFilter,
    state: { pageIndex, pageSize, globalFilter },
  } = tableInstance;

  useEffect(() => setPageSize(defaultValue || 10), [defaultValue, setPageSize]);

  const setEntriesPerPage = (value) => setPageSize(value);

  const renderPagination = pageOptions.map((option) => (
    <button
      type="button"
      key={option}
      className={pageNumClass(pageIndex === option)}
      onClick={() => gotoPage(Number(option))}
    >
      {option + 1}
    </button>
  ));

  const customizedPageOptions = pageOptions.map((option) => option + 1);

  const [search, setSearch] = useState(globalFilter);

  const onSearchChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 100);

  const setSortedValue = (column) => {
    let sortedValue;

    if (isSorted && column.isSorted) {
      sortedValue = column.isSortedDesc ? "desc" : "asce";
    } else if (isSorted) {
      sortedValue = "none";
    } else {
      sortedValue = false;
    }

    return sortedValue;
  };

  const entriesStart = pageIndex === 0 ? pageIndex + 1 : pageIndex * pageSize + 1;

  let entriesEnd;

  if (pageIndex === 0) {
    entriesEnd = pageSize;
  } else if (pageIndex === pageOptions.length - 1) {
    entriesEnd = rows.length;
  } else {
    entriesEnd = pageSize * (pageIndex + 1);
  }

  return (
    <div className="shadow-none">
      {entriesPerPage || canSearch ? (
        <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
          {entriesPerPage && (
            <div className="flex flex-wrap items-center gap-2">
              <label className="sr-only" htmlFor="data-table-page-size">
                Entradas por página
              </label>
              <select
                id="data-table-page-size"
                className="h-9 w-20 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={String(pageSize)}
                onChange={(e) => setEntriesPerPage(parseInt(e.target.value, 10))}
              >
                {entries.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <MDTypography variant="caption" className="text-slate-500">
                entradas por página
              </MDTypography>
            </div>
          )}
          {canSearch && (
            <div className="w-full sm:ml-auto sm:w-48">
              <MDInput
                placeholder="Search..."
                value={search ?? ""}
                size="small"
                fullWidth
                onChange={({ currentTarget }) => {
                  const v = currentTarget.value;
                  setSearch(v);
                  onSearchChange(v);
                }}
              />
            </div>
          )}
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table {...getTableProps()} className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            {headerGroups.map((headerGroup, key) => (
              <tr key={key} {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, idx) => (
                  <DataTableHeadCell
                    key={idx}
                    {...column.getHeaderProps(isSorted && column.getSortByToggleProps())}
                    width={column.width ? column.width : "auto"}
                    align={column.align ? column.align : "left"}
                    sorted={setSortedValue(column)}
                  >
                    {column.render("Header")}
                  </DataTableHeadCell>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row, key) => {
              prepareRow(row);
              return (
                <tr key={key} {...row.getRowProps()} className="hover:bg-slate-50/80">
                  {row.cells.map((cell, idx) => (
                    <DataTableBodyCell
                      key={idx}
                      noBorder={noEndBorder && rows.length - 1 === key}
                      align={cell.column.align ? cell.column.align : "left"}
                      {...cell.getCellProps()}
                    >
                      {cell.render("Cell")}
                    </DataTableBodyCell>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {(showTotalEntries || pageOptions.length > 1) && (
        <div
          className={[
            "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
            !showTotalEntries && pageOptions.length === 1 ? "p-0" : "p-3",
          ].join(" ")}
        >
          {showTotalEntries && (
            <div>
              <MDTypography variant="button" className="font-normal normal-case text-slate-500">
                Mostrando desde {entriesStart} hasta {entriesEnd} de {rows.length} entradas
              </MDTypography>
            </div>
          )}
          {pageOptions.length > 1 && (
            <div className="flex flex-wrap items-center justify-end gap-1">
              {canPreviousPage && (
                <button
                  type="button"
                  aria-label="Página anterior"
                  className={pageBtnClass}
                  onClick={() => previousPage()}
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden />
                </button>
              )}
              {renderPagination.length > 6 ? (
                <label className="mx-1 flex w-20 flex-col gap-0.5">
                  <span className="sr-only">Ir a página</span>
                  <input
                    type="number"
                    min={1}
                    max={customizedPageOptions.length}
                    className="h-9 w-full rounded-lg border border-slate-200 px-2 text-sm text-slate-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={customizedPageOptions[pageIndex] ?? ""}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10);
                      if (Number.isNaN(n) || n < 1) {
                        gotoPage(0);
                        return;
                      }
                      if (n > pageOptions.length) {
                        gotoPage(pageOptions.length - 1);
                        return;
                      }
                      gotoPage(n - 1);
                    }}
                  />
                </label>
              ) : (
                renderPagination
              )}
              {canNextPage && (
                <button
                  type="button"
                  aria-label="Página siguiente"
                  className={pageBtnClass}
                  onClick={() => nextPage()}
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={2} aria-hidden />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

DataTable.defaultProps = {
  entriesPerPage: { defaultValue: 10, entries: [5, 10, 15, 20, 25] },
  canSearch: false,
  showTotalEntries: true,
  pagination: { variant: "gradient", color: "info" },
  isSorted: true,
  noEndBorder: false,
};

DataTable.propTypes = {
  entriesPerPage: PropTypes.oneOfType([
    PropTypes.shape({
      defaultValue: PropTypes.number,
      entries: PropTypes.arrayOf(PropTypes.number),
    }),
    PropTypes.bool,
  ]),
  canSearch: PropTypes.bool,
  showTotalEntries: PropTypes.bool,
  table: PropTypes.objectOf(PropTypes.array).isRequired,
  pagination: PropTypes.shape({
    variant: PropTypes.oneOf(["contained", "gradient"]),
    color: PropTypes.oneOf([
      "primary",
      "secondary",
      "info",
      "success",
      "warning",
      "error",
      "dark",
      "light",
    ]),
  }),
  isSorted: PropTypes.bool,
  noEndBorder: PropTypes.bool,
};

export default DataTable;
