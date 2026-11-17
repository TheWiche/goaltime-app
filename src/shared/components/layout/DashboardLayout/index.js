import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useMaterialUIController, setLayout } from "shared/context";

/** Marco de las páginas autenticadas: deja sitio al Sidenav fijo (240px en xl). */
function DashboardLayout({ children }) {
  const [, dispatch] = useMaterialUIController();
  const { pathname } = useLocation();

  useEffect(() => {
    setLayout(dispatch, "dashboard");
  }, [pathname, dispatch]);

  return (
    <div className="min-h-dvh bg-canvas xl:ml-60">
      <div className="px-4 pb-8 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DashboardLayout;
