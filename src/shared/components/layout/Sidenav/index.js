import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { X, Shield, Briefcase, User } from "lucide-react";
import { useAuth } from "shared/context/AuthContext";
import { useMaterialUIController, setMiniSidenav } from "shared/context";
import { IconButton, cx, focusRing } from "shared/components/ui";
import SidenavCollapse from "./SidenavCollapse";
import SidenavRoot from "./SidenavRoot";

const ROLE_CONFIG = {
  admin: { label: "Administrador", Icon: Shield },
  asociado: { label: "Asociado", Icon: Briefcase },
  cliente: { label: "Cliente", Icon: User },
};

// Mismo punto de corte que `xl` de Tailwind.
const DESKTOP_QUERY = "(min-width: 1280px)";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" && window.matchMedia ? window.matchMedia(DESKTOP_QUERY).matches : true
  );

  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mql = window.matchMedia(DESKTOP_QUERY);
    const onChange = (e) => setIsDesktop(e.matches);
    setIsDesktop(mql.matches);
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else mql.addListener(onChange);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, []);

  return isDesktop;
}

/**
 * `miniSidenav` (contexto) significa "drawer cerrado" por debajo de xl. En escritorio la
 * columna siempre está visible, así que navegar nunca la colapsa.
 */
function Sidenav({ brand, brandName, routes, color, ...rest }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav } = controller;
  const { pathname } = useLocation();
  const { userProfile } = useAuth();
  const isDesktop = useIsDesktop();

  const asideRef = useRef(null);
  const openerRef = useRef(null);
  const closeBtnRef = useRef(null);

  const drawerOpen = !isDesktop && !miniSidenav;
  const closed = !isDesktop && miniSidenav;

  // 1) Sincroniza con el breakpoint: solo reacciona al cruzarlo (no a la navegación).
  useLayoutEffect(() => {
    setMiniSidenav(dispatch, !isDesktop);
  }, [isDesktop, dispatch]);

  // 2) Cierra el drawer móvil al navegar.
  useEffect(() => {
    if (!isDesktop) setMiniSidenav(dispatch, true);
  }, [pathname, isDesktop, dispatch]);

  const closeDrawer = useCallback(() => setMiniSidenav(dispatch, true), [dispatch]);

  // 3) Drawer abierto: foco dentro, Escape, trampa de Tab y retorno del foco al cerrar.
  useEffect(() => {
    if (!drawerOpen) return undefined;
    openerRef.current = document.activeElement;
    const raf = requestAnimationFrame(() => closeBtnRef.current?.focus({ preventScroll: true }));

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeDrawer();
        return;
      }
      if (e.key !== "Tab" || !asideRef.current) return;
      const items = Array.from(asideRef.current.querySelectorAll(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown);
      const opener = openerRef.current;
      if (opener && typeof opener.focus === "function" && document.contains(opener)) {
        opener.focus({ preventScroll: true });
      }
    };
  }, [drawerOpen, closeDrawer]);

  const role = ROLE_CONFIG[userProfile?.role] || ROLE_CONFIG.cliente;
  const RoleIcon = role.Icon;
  const onNavigate = isDesktop ? undefined : closeDrawer;

  const renderRoutes = routes.map(({ type, name, icon, title, key, route }) => {
    if (type === "collapse" && route) {
      return (
        <li key={key}>
          <SidenavCollapse name={name} icon={icon} to={route} onNavigate={onNavigate} />
        </li>
      );
    }
    if (type === "title") {
      return (
        <li key={key} role="presentation" className="px-2.5 pb-1 pt-4 text-xs font-medium text-fg-subtle">
          {title}
        </li>
      );
    }
    if (type === "divider") {
      return <li key={key} role="separator" aria-hidden="true" className="my-2 h-px bg-line" />;
    }
    return null;
  });

  return (
    <>
      {/* Backdrop del drawer móvil */}
      {drawerOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-zinc-950/40 animate-fade-in xl:hidden"
          onClick={closeDrawer}
        />
      )}

      <SidenavRoot {...rest} ref={asideRef} closed={closed}>
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-line px-4">
          <Link
            to="/"
            className={cx(
              "-ml-1 flex min-w-0 flex-1 items-center gap-2.5 rounded-md px-1 py-1 no-underline",
              focusRing
            )}
          >
            {brand && <img src={brand} alt="" className="h-6 w-6 shrink-0 object-contain" />}
            <span className="truncate text-sm font-semibold tracking-tight text-fg-strong">
              {brandName}
            </span>
          </Link>
          <IconButton
            ref={closeBtnRef}
            label="Cerrar menú de navegación"
            size="lg"
            className="xl:hidden"
            onClick={closeDrawer}
          >
            <X aria-hidden />
          </IconButton>
        </div>

        <nav aria-label="Menú principal" className="flex-1 overflow-y-auto px-3 py-3">
          <ul className="m-0 flex list-none flex-col gap-0.5 p-0">{renderRoutes}</ul>
        </nav>

        {userProfile && (
          <div className="shrink-0 border-t border-line p-3">
            <div className="flex items-center gap-2.5 rounded-md border border-line bg-zinc-50 px-2.5 py-2">
              <span
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded border border-line bg-white text-fg-muted"
                aria-hidden="true"
              >
                <RoleIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <p className="text-xs leading-4 text-fg-subtle">Rol activo</p>
                <p className="truncate text-[13px] font-medium leading-4 text-fg-strong">{role.label}</p>
              </div>
            </div>
          </div>
        )}
      </SidenavRoot>
    </>
  );
}

Sidenav.defaultProps = {
  brand: "",
  color: undefined,
};

Sidenav.propTypes = {
  color: PropTypes.string,
  brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;
