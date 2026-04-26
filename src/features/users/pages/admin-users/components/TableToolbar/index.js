import { MDInput, MDTypography } from "shared/components/md-shims";
import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { ListFilter } from "lucide-react";

const filterMenuBtnClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25";

function TableToolbar({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleChange,
  entriesPerPage,
  onEntriesChange,
  entriesOptions,
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);

  const roleLabels = {
    all: "Todos",
    admin: "Admin",
    asociado: "Asociado",
    cliente: "Cliente",
  };

  const filterOptions = [
    { value: "all", label: "Todos" },
    { value: "admin", label: "Admin" },
    { value: "asociado", label: "Asociado" },
    { value: "cliente", label: "Cliente" },
  ];

  useEffect(() => {
    if (!filterOpen) return undefined;
    const onDocClick = (e) => {
      if (!filterRef.current?.contains(e.target)) setFilterOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [filterOpen]);

  const safeEntriesOptions =
    Array.isArray(entriesOptions) && entriesOptions.length > 0 ? entriesOptions : [10];
  const currentEntriesPerPage =
    entriesPerPage && safeEntriesOptions.includes(entriesPerPage)
      ? entriesPerPage.toString()
      : safeEntriesOptions[0].toString();

  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 py-3 sm:flex-row sm:items-center sm:justify-between sm:pl-2 sm:pr-1">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="admin-users-page-size" className="sr-only">
          Entradas por página
        </label>
        <select
          id="admin-users-page-size"
          className="h-9 w-20 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          value={currentEntriesPerPage}
          onChange={(e) => onEntriesChange?.(parseInt(e.target.value, 10))}
        >
          {safeEntriesOptions.map((n) => (
            <option key={n} value={String(n)}>
              {n}
            </option>
          ))}
        </select>
        <MDTypography variant="caption" className="whitespace-nowrap text-slate-500">
          entradas por página
        </MDTypography>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative" ref={filterRef}>
          <button
            type="button"
            className={filterMenuBtnClass}
            aria-expanded={filterOpen}
            aria-haspopup="true"
            title="Filtrar por rol"
            onClick={() => setFilterOpen((o) => !o)}
          >
            <ListFilter className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
          </button>
          {filterOpen && (
            <div
              className="absolute right-0 z-50 mt-1 min-w-[11rem] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
              role="menu"
            >
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="menuitem"
                  className={[
                    "flex w-full px-4 py-2 text-left text-sm text-slate-800 transition-colors hover:bg-slate-50",
                    roleFilter === opt.value ? "bg-primary-50 font-semibold text-primary-900" : "",
                  ].join(" ")}
                  onClick={() => {
                    onRoleChange(opt.value);
                    setFilterOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-full min-w-[120px] sm:w-60">
          <MDInput
            placeholder={`Buscar (${roleLabels[roleFilter]}) ...`}
            value={searchTerm}
            onChange={onSearchChange}
            size="small"
            fullWidth
          />
        </div>
      </div>
    </div>
  );
}

TableToolbar.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  roleFilter: PropTypes.string.isRequired,
  onRoleChange: PropTypes.func.isRequired,
  entriesPerPage: PropTypes.number.isRequired,
  onEntriesChange: PropTypes.func.isRequired,
  entriesOptions: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default TableToolbar;
