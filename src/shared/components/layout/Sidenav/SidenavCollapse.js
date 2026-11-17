import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import { cx, focusRing } from "shared/components/ui";

/**
 * Item de navegación. El estado activo lo resuelve NavLink por prefijo de ruta
 * (aria-current="page"), no comparando pathnames a mano.
 */
function SidenavCollapse({ icon, name, to, onNavigate }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cx(
          "relative flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm no-underline transition-colors duration-150",
          focusRing,
          isActive
            ? "bg-zinc-100 font-medium text-fg-strong before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:bg-primary-600"
            : "text-fg-muted hover:bg-zinc-50 hover:text-fg"
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cx(
              "inline-flex shrink-0 [&>svg]:h-4 [&>svg]:w-4",
              isActive ? "text-primary-600" : "text-fg-subtle"
            )}
            aria-hidden="true"
          >
            {icon}
          </span>
          <span className="truncate">{name}</span>
        </>
      )}
    </NavLink>
  );
}

SidenavCollapse.propTypes = {
  icon: PropTypes.node.isRequired,
  name: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  onNavigate: PropTypes.func,
};

SidenavCollapse.defaultProps = {
  onNavigate: undefined,
};

export default SidenavCollapse;
