/**
=========================================================
* GoalTime App - v2.2.0
=========================================================
*/

// @mui material components
import Drawer from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";

export default styled(Drawer)(({ theme, ownerState }) => {
  const { transparentSidenav, whiteSidenav, miniSidenav, darkMode } = ownerState;

  const sidebarWidth = 250;
  const glassShadow = "0 8px 32px 0 rgba(31, 38, 135, 0.15)";
  
  // Glassmorphism background
  let backgroundValue = "rgba(255, 255, 255, 0.75)";
  let backdropFilter = "blur(12px)";
  let border = "1px solid rgba(255, 255, 255, 0.2)";

  if (transparentSidenav) {
    backgroundValue = "rgba(255, 255, 255, 0.5)";
    backdropFilter = "blur(8px)";
  }

  // styles for the sidenav when miniSidenav={false}
  const drawerOpenStyles = () => ({
    background: backgroundValue,
    backdropFilter: backdropFilter,
    border: "none",
    borderRight: border,
    transform: "translateX(0)",
    transition: "transform 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms",

    "@media (min-width: 1280px)": {
      boxShadow: transparentSidenav ? "none" : glassShadow,
      marginBottom: transparentSidenav ? 0 : "inherit",
      left: "0",
      width: sidebarWidth,
      transform: "translateX(0)",
      transition: "width 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms, background-color 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms",
    },
  });

  // styles for the sidenav when miniSidenav={true}
  const drawerCloseStyles = () => ({
    background: backgroundValue,
    backdropFilter: backdropFilter,
    border: "none",
    borderRight: border,
    transform: "translateX(-320px)",
    transition: "transform 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms",

    "@media (min-width: 1280px)": {
      boxShadow: transparentSidenav ? "none" : glassShadow,
      marginBottom: transparentSidenav ? 0 : "inherit",
      left: "0",
      width: "96px",
      overflowX: "hidden",
      transform: "translateX(0)",
      transition: "width 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms, background-color 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms",
    },
  });

  return {
    "& .MuiDrawer-paper": {
      boxShadow: glassShadow,
      border: "none",

      ...(miniSidenav ? drawerCloseStyles() : drawerOpenStyles()),
    },
  };
});
