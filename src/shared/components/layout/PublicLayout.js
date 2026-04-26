import { MDBox } from "shared/components/md-shims";
// src/layouts/PublicLayout.js
/**
 * Este layout envuelve todas las páginas públicas (Homepage, About, Blog, etc.)
 * para asegurar que tengan el mismo Header y Footer.
 * Reemplaza al 'HomepageLayout.js' y al 'PublicLayout.js' básico que tenías.
 */
import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import HomepageHeader from "features/public/components/HomepageHeader";
import HomepageFooter from "features/public/components/HomepageFooter";
import { useMaterialUIController, setLayout } from "shared/context";

function PublicLayout({ children }) {
  const { pathname } = useLocation();
  const [, dispatch] = useMaterialUIController();

  // Establecer el layout a "page" para que no se muestre el sidebar
  useEffect(() => {
    setLayout(dispatch, "page");
  }, [pathname, dispatch]);

  const isHeaderLight = pathname !== "/";

  return (
    <MDBox
      width="100%"
      minHeight="100vh"
      sx={{ backgroundColor: "#f5f5f5" }}
    >
      <HomepageHeader light={isHeaderLight} />
      {children}
      <HomepageFooter />
    </MDBox>
  );
}

PublicLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PublicLayout;
