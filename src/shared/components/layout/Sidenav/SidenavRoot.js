import PropTypes from "prop-types";

/**
 * Drawer lateral sin MUI: aside fijo + ancho responsive (desktop mini / full).
 */
function SidenavRoot({ children, ownerState, ...rest }) {
  const { miniSidenav } = ownerState;

  return (
    <aside
      {...rest}
      className={[
        "fixed left-0 top-0 z-[1100] flex h-screen flex-col border-r border-slate-200 bg-white",
        "transition-[width,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "w-[280px] max-w-[100vw]",
        miniSidenav
          ? "max-xl:pointer-events-none max-xl:-translate-x-full xl:w-24 xl:translate-x-0 xl:overflow-x-hidden"
          : "translate-x-0 xl:w-[280px]",
      ].join(" ")}
    >
      {children}
    </aside>
  );
}

SidenavRoot.propTypes = {
  children: PropTypes.node,
  ownerState: PropTypes.shape({
    miniSidenav: PropTypes.bool,
    transparentSidenav: PropTypes.bool,
    whiteSidenav: PropTypes.bool,
    darkMode: PropTypes.bool,
  }).isRequired,
};

export default SidenavRoot;
