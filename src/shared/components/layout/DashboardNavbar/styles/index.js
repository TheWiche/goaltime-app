// Styles simplificados para DashboardNavbar (sin dependencia de MUI theme)
// TODO: Migrar completamente a Tailwind CSS

export const navbar = (theme, { absolute, light, darkMode, transparentNavbar }) => ({
  boxShadow: transparentNavbar || absolute ? "none" : "0 8px 32px 0 rgba(31, 38, 135, 0.1)",
  backdropFilter: transparentNavbar || absolute ? "none" : "blur(12px)",
  backgroundColor: transparentNavbar || absolute 
    ? "transparent !important" 
    : "rgba(255, 255, 255, 0.75)",
  border: transparentNavbar || absolute ? "none" : "1px solid rgba(255, 255, 255, 0.2)",
  color: "#1E3A8A",
  top: absolute ? 0 : "16px",
  minHeight: "70px",
  display: "grid",
  alignItems: "center",
  borderRadius: absolute ? "0px" : "1rem",
  paddingTop: "8px",
  paddingBottom: "8px",
  paddingLeft: absolute ? "16px" : "0px",
  paddingRight: absolute ? "8px" : "0px",
  transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
  "& > *": {
    transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
  },
  "& .MuiToolbar-root": {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: "auto",
    padding: "4px 16px",
  },
});

export const navbarContainer = (theme) => ({
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "space-between",
  paddingTop: "4px",
  paddingBottom: "4px",
  "@media (min-width: 960px)": {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: "0",
    paddingBottom: "0",
  },
});

export const navbarRow = (theme, { isMini }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  width: "100%",
  "@media (min-width: 960px)": {
    justifyContent: isMini ? "space-between" : "flex-end",
    width: isMini ? "100%" : "max-content",
  },
  "@media (min-width: 1280px)": {
    justifyContent: "flex-end !important",
    width: "max-content !important",
  },
});

export const navbarIconButton = (theme) => ({
  padding: "8px",
  "& .material-icons, .material-icons-round": {
    fontSize: "1.5rem !important",
  },
  "& .MuiTypography-root": {
    display: "none",
    "@media (min-width: 600px)": {
      display: "inline-block",
      lineHeight: 1.2,
      marginLeft: "8px",
    },
  },
});

export const navbarMobileMenu = (theme) => ({
  display: "inline-block",
  lineHeight: 0,
  "@media (min-width: 1280px)": {
    display: "none",
  },
});
