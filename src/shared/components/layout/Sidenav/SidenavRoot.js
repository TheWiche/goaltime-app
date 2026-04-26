/**
=========================================================
* GoalTime App - v2.2.0
=========================================================
*/

// @mui material components
import Drawer from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";

export default styled(Drawer)(({ theme, ownerState }) => {
  const { transparentSidenav, miniSidenav } = ownerState;

  const sidebarWidth = 250;
  const glassShadow = "0 8px 32px 0 rgba(31, 38, 135, 0.2)";
  
  let backgroundValue = "rgba(255, 255, 255, 0.85)";
  let backdropFilter = "blur(16px)";
  let border = "1px solid rgba(30, 58, 138, 0.15)";

  if (transparentSidenav) {
    backgroundValue = "rgba(255, 255, 255, 0.6)";
    backdropFilter = "blur(12px)";
  }

  const drawerOpenStyles = () => ({
    background: backgroundValue,
    backdropFilter: backdropFilter,
    border: "none",
    borderRight: border,
    transform: "translateX(0)",
    transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    flexDirection: "column",

    "@media (min-width: 1280px)": {
      boxShadow: transparentSidenav ? "none" : glassShadow,
      marginBottom: transparentSidenav ? 0 : "inherit",
      left: "0",
      width: sidebarWidth,
      transform: "translateX(0)",
      transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
    },
  });

  const drawerCloseStyles = () => ({
    background: backgroundValue,
    backdropFilter: backdropFilter,
    border: "none",
    borderRight: border,
    transform: "translateX(-320px)",
    transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    flexDirection: "column",

    "@media (min-width: 1280px)": {
      boxShadow: transparentSidenav ? "none" : glassShadow,
      marginBottom: transparentSidenav ? 0 : "inherit",
      left: "0",
      width: "96px",
      overflowX: "hidden",
      transform: "translateX(0)",
      transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
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
