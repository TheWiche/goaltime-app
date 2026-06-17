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
  }, [pathname, dispatch]);

  return (
    <div
      className={[
        "relative min-h-screen bg-surface",
        "transition-[margin] duration-300 ease-in-out",
        miniSidenav ? "xl:ml-[96px]" : "xl:ml-[280px]",
      ].join(" ")}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(1200px 600px at 0% 0%, rgba(30,58,138,0.06), transparent 60%), radial-gradient(900px 500px at 100% 100%, rgba(249,115,22,0.05), transparent 60%)",
        }}
      />
      <div className="relative px-4 sm:px-6 lg:px-8 py-6 lg:py-8">{children}</div>
    </div>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DashboardLayout;
