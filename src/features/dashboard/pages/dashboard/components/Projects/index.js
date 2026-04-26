import { DataTable } from "shared/components/layout";
import { MDBox, MDTypography } from "shared/components/md-shims";
import { useState, useEffect, useRef } from "react";
import { CircleCheck, EllipsisVertical } from "lucide-react";
import data from "./data";

function Projects() {
  const { columns, rows } = data();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <MDBox
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={3}
        className="relative"
      >
        <MDBox>
          <MDTypography variant="h6" gutterBottom>
            Projects
          </MDTypography>
          <MDBox display="flex" alignItems="center" lineHeight={0}>
            <CircleCheck className="mr-1 h-[18px] w-[18px] shrink-0 text-sky-600" strokeWidth={2} aria-hidden />
            <MDTypography variant="button" fontWeight="regular" color="text">
              &nbsp;<strong>30 done</strong> this month
            </MDTypography>
          </MDBox>
        </MDBox>
        <div className="relative px-2 text-slate-600" ref={menuRef}>
          <button
            type="button"
            className="rounded-lg p-2 font-bold hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
            aria-label="Más opciones"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <EllipsisVertical className="h-5 w-5" strokeWidth={2} aria-hidden />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-full z-20 mt-1 min-w-[10rem] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
              role="menu"
            >
              {["Action", "Another action", "Something else"].map((label) => (
                <button
                  key={label}
                  type="button"
                  role="menuitem"
                  className="block w-full px-4 py-2 text-left text-sm text-slate-800 hover:bg-slate-50"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </MDBox>
      <MDBox>
        <DataTable
          table={{ columns, rows }}
          showTotalEntries={false}
          isSorted={false}
          noEndBorder
          entriesPerPage={false}
        />
      </MDBox>
    </div>
  );
}

export default Projects;
