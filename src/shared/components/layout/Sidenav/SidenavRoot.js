import { forwardRef } from "react";
import PropTypes from "prop-types";
import { cx } from "shared/components/ui";

/**
 * Contenedor lateral. En >= xl es una columna fija de 240px; por debajo es un drawer
 * que se oculta con transform + visibility (y `inert` cuando está cerrado).
 */
const SidenavRoot = forwardRef(function SidenavRoot({ children, closed, ...rest }, ref) {
  return (
    <aside
      id="app-sidenav"
      ref={ref}
      aria-label="Navegación principal"
      aria-hidden={closed ? true : undefined}
      inert={closed ? "" : undefined}
      {...rest}
      className={cx(
        "fixed inset-y-0 left-0 z-[41] flex h-dvh w-60 max-w-[85vw] flex-col border-r border-line bg-white",
        "transition-[transform,visibility] duration-200 ease-out xl:translate-x-0 xl:visible",
        closed ? "max-xl:invisible max-xl:-translate-x-full" : "translate-x-0"
      )}
    >
      {children}
    </aside>
  );
});

SidenavRoot.propTypes = {
  children: PropTypes.node,
  closed: PropTypes.bool,
};

SidenavRoot.defaultProps = {
  children: null,
  closed: false,
};

export default SidenavRoot;
