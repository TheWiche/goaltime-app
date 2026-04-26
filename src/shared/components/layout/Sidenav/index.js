import { useEffect } from "react";
import { useLocation, NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";
import { SportsSoccer, TrendingUp } from "@mui/icons-material";

import { MDBox, MDTypography } from "shared/components/md-shims";
import SidenavCollapse from "./SidenavCollapse";
import SidenavRoot from "./SidenavRoot";
import sidenavLogoLabel from "./styles/sidenav";

import {
  useMaterialUIController,
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
} from "shared/context";

function Sidenav({ color, brand, brandName, routes, ...rest }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode } = controller;
  const location = useLocation();
  const collapseName = location.pathname.replace("/", "");

  const closeSidenav = () => setMiniSidenav(dispatch, true);

  useEffect(() => {
    function handleMiniSidenav() {
      setMiniSidenav(dispatch, window.innerWidth < 1200);
      setTransparentSidenav(dispatch, window.innerWidth < 1200 ? false : transparentSidenav);
      setWhiteSidenav(dispatch, window.innerWidth < 1200 ? false : whiteSidenav);
    }

    window.addEventListener("resize", handleMiniSidenav);
    handleMiniSidenav();

    return () => window.removeEventListener("resize", handleMiniSidenav);
  }, [dispatch, location, transparentSidenav, whiteSidenav]);

  const renderRoutes = routes.map(({ type, name, icon, title, noCollapse, key, href, route }) => {
    let returnValue;

    if (type === "collapse") {
      returnValue = href ? (
        <Link
          href={href}
          key={key}
          target="_blank"
          rel="noreferrer"
          sx={{ textDecoration: "none" }}
        >
          <SidenavCollapse
            name={name}
            icon={icon}
            active={key === collapseName}
            noCollapse={noCollapse}
          />
        </Link>
      ) : (
        <NavLink key={key} to={route}>
          <SidenavCollapse name={name} icon={icon} active={key === collapseName} />
        </NavLink>
      );
    } else if (type === "title") {
      returnValue = (
        <MDTypography
          key={key}
          color="primary"
          display="block"
          variant="caption"
          fontWeight="bold"
          textTransform="uppercase"
          pl={3}
          mt={2}
          mb={1}
          ml={1}
          sx={{ fontFamily: "'Poppins', sans-serif", fontSize: "0.7rem", letterSpacing: "0.5px" }}
        >
          {title}
        </MDTypography>
      );
    } else if (type === "divider") {
      returnValue = (
        <Divider
          key={key}
          light
          sx={{ 
            borderColor: "rgba(30, 58, 138, 0.1)",
            my: 1.5,
          }}
        />
      );
    }

    return returnValue;
  });

  return (
    <SidenavRoot
      {...rest}
      variant="permanent"
      ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode }}
    >
      {/* Header con logo */}
      <MDBox pt={3} pb={2} px={3}>
        <MDBox
          display={{ xs: "block", xl: "none" }}
          position="absolute"
          top={0}
          right={0}
          p={1.625}
          onClick={closeSidenav}
          sx={{ cursor: "pointer" }}
        >
          <MDTypography variant="h6" sx={{ color: "#1E3A8A" }}>
            <Icon sx={{ fontWeight: "bold" }}>close</Icon>
          </MDTypography>
        </MDBox>
        <MDBox
          component={NavLink}
          to="/"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          sx={{ 
            textAlign: "center",
            transition: "all 200ms",
            "&:hover": { transform: "scale(1.05)" }
          }}
        >
          {brand && (
            <MDBox
              component="img"
              src={brand}
              alt="Brand"
              sx={{ 
                width: "3.5rem", 
                height: "3.5rem", 
                mb: 1.5,
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(30, 58, 138, 0.15)",
              }}
            />
          )}
          <MDBox width="100%" sx={(theme) => sidenavLogoLabel(theme, { miniSidenav })}>
            <MDTypography
              component="h6"
              variant="h5"
              fontWeight="bold"
              textAlign="center"
              sx={{ 
                color: "#1E3A8A",
                fontFamily: "'Poppins', sans-serif",
                letterSpacing: "-0.5px",
              }}
            >
              {brandName}
            </MDTypography>
            <MDTypography
              variant="caption"
              textAlign="center"
              sx={{ 
                color: "#64748b",
                display: "block",
                mt: 0.5,
                fontSize: "0.7rem",
              }}
            >
              Gestión de Canchas
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
      
      <Divider
        light
        sx={{ 
          borderColor: "rgba(30, 58, 138, 0.1)",
          mb: 1,
        }}
      />
      
      {/* Lista de rutas */}
      <List sx={{ px: 1.5, flex: 1, overflowY: "auto" }}>{renderRoutes}</List>
      
      {/* Footer */}
      <MDBox px={3} py={2}>
        <Divider
          light
          sx={{ 
            borderColor: "rgba(30, 58, 138, 0.1)",
            mb: 2,
          }}
        />
        <MDBox
          sx={{
            backdropFilter: "blur(8px)",
            bgcolor: "rgba(30, 58, 138, 0.05)",
            borderRadius: "12px",
            p: 2,
            border: "1px solid rgba(30, 58, 138, 0.1)",
          }}
        >
          <MDTypography
            variant="caption"
            fontWeight="bold"
            sx={{ 
              color: "#1E3A8A",
              display: "block",
              mb: 1,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            GoalTime v2.2
          </MDTypography>
          <MDBox display="flex" alignItems="center" gap={0.5} mb={0.5}>
            <SportsSoccer sx={{ fontSize: 12, color: "#64748b" }} />
            <MDTypography variant="caption" sx={{ color: "#64748b", fontSize: "0.65rem" }}>
              Sistema de reservas
            </MDTypography>
          </MDBox>
          <MDBox display="flex" alignItems="center" gap={0.5}>
            <TrendingUp sx={{ fontSize: 12, color: "#64748b" }} />
            <MDTypography variant="caption" sx={{ color: "#64748b", fontSize: "0.65rem" }}>
              Panel modernizado
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
    </SidenavRoot>
  );
}

Sidenav.defaultProps = {
  color: "info",
  brand: "",
};

Sidenav.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;
