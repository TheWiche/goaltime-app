import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { useMaterialUIController, setMiniSidenav } from "shared/context";
import { IconButton } from "shared/components/ui";
import NotificationsMenu from "shared/components/notifications/NotificationsMenu";
import AccountMenu from "./AccountMenu";

const ROUTE_LABELS = [
  { path: "/dashboard", section: "Panel", title: "Dashboard" },
  { path: "/admin/users", section: "Administración", title: "Usuarios" },
  { path: "/admin/fields", section: "Administración", title: "Canchas" },
  { path: "/associate/fields", section: "Asociado", title: "Mis canchas" },
  { path: "/associate/reservations", section: "Asociado", title: "Reservas" },
  { path: "/canchas", section: "Explorar", title: "Canchas" },
  { path: "/reservations", section: "Mi cuenta", title: "Mis reservaciones" },
  { path: "/profile", section: "Mi cuenta", title: "Perfil" },
];

/** Coincidencia por segmento de ruta: "/admin/users/x" → "/admin/users"; "/canchasX" no coincide. */
const matchRoute = (pathname) =>
  ROUTE_LABELS.find((r) => pathname === r.path || pathname.startsWith(`${r.path}/`)) || null;

function DashboardNavbar() {
  const [, dispatch] = useMaterialUIController();
  const { pathname } = useLocation();
  const pageMeta = useMemo(() => matchRoute(pathname), [pathname]);

  return (
    <header className="sticky top-0 z-30 -mx-4 mb-6 border-b border-line bg-white sm:-mx-6 lg:-mx-8">
      <div className="flex h-14 items-center gap-2 px-4 sm:px-6 lg:px-8">
        <IconButton
          label="Abrir menú de navegación"
          size="lg"
          className="xl:hidden"
          aria-controls="app-sidenav"
          onClick={() => setMiniSidenav(dispatch, false)}
        >
          <Menu aria-hidden />
        </IconButton>

        <div className="min-w-0 flex-1 truncate text-sm">
          {pageMeta ? (
            <>
              <span className="hidden text-fg-subtle sm:inline">
                {pageMeta.section}
                <span className="mx-1.5" aria-hidden="true">
                  /
                </span>
              </span>
              <span className="font-semibold text-fg-strong">{pageMeta.title}</span>
            </>
          ) : (
            <span className="font-semibold text-fg-strong">GoalTime</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <NotificationsMenu />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}

export default DashboardNavbar;
