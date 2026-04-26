import { useEffect } from "react";
import { useLocation, NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import { X, Shield, Briefcase, User } from "lucide-react";
import { useAuth } from "shared/context/AuthContext";
import {
  useMaterialUIController,
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
} from "shared/context";
import SidenavCollapse from "./SidenavCollapse";
import SidenavRoot from "./SidenavRoot";

const ROLE_CONFIG = {
  admin: {
    label: "Administrador",
    Icon: Shield,
    tone: "bg-primary-50 text-primary-800 border-primary-200",
  },
  asociado: {
    label: "Asociado",
    Icon: Briefcase,
    tone: "bg-cta-50 text-cta-700 border-cta-200",
  },
  cliente: {
    label: "Cliente",
    Icon: User,
    tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

function Sidenav({ brand, brandName, routes, ...rest }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode } = controller;
  const location = useLocation();
  const { userProfile } = useAuth();
  const collapseName = location.pathname.replace("/", "");

  const closeSidenav = () => setMiniSidenav(dispatch, true);

  useEffect(() => {
    function handleResize() {
      setMiniSidenav(dispatch, window.innerWidth < 1200);
      setTransparentSidenav(dispatch, window.innerWidth < 1200 ? false : transparentSidenav);
      setWhiteSidenav(dispatch, window.innerWidth < 1200 ? false : whiteSidenav);
    }

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch, location, transparentSidenav, whiteSidenav]);

  const role = ROLE_CONFIG[userProfile?.role] || ROLE_CONFIG.cliente;
  const RoleIcon = role.Icon;
  const compactLabels = miniSidenav;

  const renderRoutes = routes.map(({ type, name, icon, title, key, route }) => {
    if (type === "collapse" && route) {
      return (
        <li key={key} className="list-none">
          <NavLink
            to={route}
            className="block no-underline"
            aria-label={name}
          >
            <SidenavCollapse name={name} icon={icon} active={key === collapseName} />
          </NavLink>
        </li>
      );
    }

    if (type === "title") {
      return (
        <p
          key={key}
          className={[
            "px-3 mt-5 mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400",
            compactLabels ? "xl:opacity-0 xl:h-0 xl:m-0" : "",
          ].join(" ")}
        >
          {title}
        </p>
      );
    }

    if (type === "divider") {
      return (
        <div
          key={key}
          aria-hidden="true"
          className="my-3 h-px w-full bg-slate-100"
        />
      );
    }

    return null;
  });

  return (
    <SidenavRoot
      {...rest}
      variant="permanent"
      ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode }}
    >
      {/* Header brand */}
      <div className="relative flex items-center gap-3 px-4 py-5 border-b border-slate-100">
        {/* Close button mobile */}
        <button
          type="button"
          onClick={closeSidenav}
          aria-label="Cerrar menú"
          className="absolute top-3 right-3 xl:hidden w-8 h-8 grid place-items-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <X className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
        </button>

        <NavLink
          to="/"
          className="flex items-center gap-3 flex-1 min-w-0 no-underline group"
        >
          {brand && (
            <span className="shrink-0 w-11 h-11 rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm grid place-items-center">
              <img src={brand} alt={brandName} className="w-9 h-9 object-contain" />
            </span>
          )}
          <span
            className={[
              "min-w-0 transition-all duration-200",
              compactLabels ? "xl:opacity-0 xl:max-w-0 xl:overflow-hidden" : "opacity-100",
            ].join(" ")}
          >
            <span className="block text-[15px] font-semibold font-heading text-primary-900 leading-tight tracking-tight">
              {brandName}
            </span>
            <span className="block text-[11px] text-slate-500 mt-0.5">
              Gestión de canchas
            </span>
          </span>
        </NavLink>
      </div>

      {/* Section label */}
      <div
        className={[
          "px-4 pt-4 pb-1",
          compactLabels ? "xl:hidden" : "",
        ].join(" ")}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Navegación
        </p>
      </div>

      {/* Nav items */}
      <nav
        aria-label="Menú principal"
        className="flex-1 overflow-y-auto px-3 pb-4"
      >
        <ul className="flex flex-col gap-0.5 m-0 p-0">{renderRoutes}</ul>
      </nav>

      {/* Footer: user role pill */}
      {userProfile && (
        <div className="px-4 pb-4 pt-3 border-t border-slate-100">
          <div
            className={[
              "rounded-xl border bg-white p-3 flex items-center gap-3 shadow-sm",
              compactLabels ? "xl:p-2 xl:justify-center" : "",
              "border-slate-200",
            ].join(" ")}
          >
            <span
              className={[
                "shrink-0 w-9 h-9 rounded-lg grid place-items-center border",
                role.tone,
              ].join(" ")}
            >
              <RoleIcon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
            </span>
            <div
              className={[
                "min-w-0 flex-1 transition-all duration-200",
                compactLabels ? "xl:hidden" : "block",
              ].join(" ")}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 leading-none">
                Rol activo
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900 truncate">
                {role.label}
              </p>
            </div>
          </div>

          <p
            className={[
              "mt-3 text-[10px] text-slate-400 text-center",
              compactLabels ? "xl:hidden" : "",
            ].join(" ")}
          >
            GoalTime · v2.2
          </p>
        </div>
      )}
    </SidenavRoot>
  );
}

Sidenav.defaultProps = {
  brand: "",
};

Sidenav.propTypes = {
  color: PropTypes.string,
  brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;
