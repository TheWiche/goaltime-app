import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useMaterialUIController, setLayout } from "shared/context";

function DashboardLayout({ children }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav } = controller;
  const { pathname } = useLocation();

  useEffect(() => {
    setLayout(dispatch, "dashboard");
  }, [pathname]);

  return (
    <div
      className={[
        "relative p-4 md:p-6 transition-all duration-300 ease-in-out min-h-screen",
        "bg-gradient-to-br from-surface via-primary-50/30 to-secondary-50/30",
        miniSidenav ? "xl:ml-[120px]" : "xl:ml-[274px]",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DashboardLayout;
