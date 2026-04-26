import { MDBox, MDTypography } from "shared/components/md-shims";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { LayoutDashboard, User, UserCircle, KeyRound } from "lucide-react";

const NAV_ICONS = {
  donut_large: LayoutDashboard,
  person: User,
  account_circle: UserCircle,
  key: KeyRound,
};

function DefaultNavbarLink({ icon, name, route, light }) {
  const IconCmp = NAV_ICONS[icon] || LayoutDashboard;
  const iconClass = light ? "text-white" : "text-slate-500";

  return (
    <MDBox
      component={Link}
      to={route}
      mx={1}
      p={1}
      display="flex"
      alignItems="center"
      className="cursor-pointer select-none no-underline"
    >
      <IconCmp className={`h-5 w-5 shrink-0 ${iconClass}`} strokeWidth={2} aria-hidden />
      <MDTypography
        variant="button"
        fontWeight="regular"
        color={light ? "white" : "dark"}
        textTransform="capitalize"
        className="w-full leading-none"
      >
        &nbsp;{name}
      </MDTypography>
    </MDBox>
  );
}

DefaultNavbarLink.propTypes = {
  icon: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  route: PropTypes.string.isRequired,
  light: PropTypes.bool.isRequired,
};

export default DefaultNavbarLink;
