import PropTypes from "prop-types";
import { useMaterialUIController } from "shared/context";

function SidenavCollapse({ icon, name, active, ...rest }) {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;

  const baseClasses = [
    "group relative flex w-full select-none items-center",
    "h-11 px-3 my-0.5 rounded-xl",
    "font-heading text-[13.5px] font-medium",
    "transition-all duration-200 ease-out",
    "outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25",
  ].join(" ");

  const stateClasses = active
    ? "bg-primary text-white shadow-[0_6px_18px_rgba(30,58,138,0.25)] font-semibold"
    : "text-slate-600 hover:bg-primary-50 hover:text-primary-900";

  const iconWrapClasses = [
    "grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-all duration-200",
    active
      ? "bg-white/15 text-white"
      : "bg-slate-50 text-primary-700 group-hover:bg-primary-100 group-hover:text-primary-900",
  ].join(" ");

  return (
    <span {...rest} className={[baseClasses, stateClasses].join(" ")}>
      <span className={iconWrapClasses}>{icon}</span>
      <span
        className={[
          "ml-3 truncate transition-opacity duration-200",
          miniSidenav ? "xl:ml-0 xl:max-w-0 xl:opacity-0" : "opacity-100",
        ].join(" ")}
      >
        {name}
      </span>
      {active && (
        <span
          aria-hidden="true"
          className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-white/90"
        />
      )}
    </span>
  );
}

SidenavCollapse.defaultProps = {
  active: false,
};

SidenavCollapse.propTypes = {
  icon: PropTypes.node.isRequired,
  name: PropTypes.string.isRequired,
  active: PropTypes.bool,
};

export default SidenavCollapse;
