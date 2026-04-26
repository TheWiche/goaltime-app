/**
=========================================================
* GoalTime App - v2.2.0
=========================================================
*/
function collapseItem(theme, ownerState) {
  const { active, transparentSidenav, whiteSidenav, darkMode } = ownerState;

  const glassShadow = "0 4px 16px rgba(30, 58, 138, 0.2)";
  const activeGradient = "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)";

  return {
    background: active ? activeGradient : "transparent",
    color:
      (transparentSidenav && !darkMode && !active) || (whiteSidenav && !active)
        ? "#1E3A8A"
        : active ? "#ffffff" : "#64748b",
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "12px 16px",
    margin: "4px 0",
    borderRadius: "10px",
    cursor: "pointer",
    userSelect: "none",
    whiteSpace: "nowrap",
    fontFamily: "'Poppins', sans-serif",
    fontWeight: active ? 600 : 500,
    boxShadow: active ? glassShadow : "none",
    position: "relative",
    overflow: "hidden",
    
    "&::before": active ? {
      content: '""',
      position: "absolute",
      inset: 0,
      background: "rgba(255, 255, 255, 0.1)",
      borderRadius: "10px",
      pointerEvents: "none",
    } : {},

    "@media (min-width: 1280px)": {
      transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
    },

    "&:hover, &:focus": {
      backgroundColor: () => {
        let backgroundValue;

        if (!active) {
          backgroundValue = "rgba(30, 58, 138, 0.08)";
        }

        return backgroundValue;
      },
      transform: !active ? "translateX(6px)" : "scale(1.02)",
      boxShadow: !active ? "0 2px 8px rgba(30, 58, 138, 0.1)" : glassShadow,
    },
  };
}

function collapseIconBox(theme, ownerState) {
  const { active } = ownerState;

  return {
    minWidth: "32px",
    minHeight: "32px",
    color: active ? "#ffffff" : "#1E3A8A",
    borderRadius: "0.75rem",
    display: "grid",
    placeItems: "center",
    transition: "margin 300ms ease-in-out",

    "& svg, svg g": {
      color: active ? "#ffffff" : "#1E3A8A",
    },
  };
}

const collapseIcon = (theme, { active }) => ({
  color: active ? "#ffffff" : "#1E3A8A",
  fontSize: "1.25rem",
});

function collapseText(theme, ownerState) {
  const { miniSidenav, transparentSidenav, active } = ownerState;

  return {
    marginLeft: "12px",

    "@media (min-width: 1280px)": {
      opacity: miniSidenav || (miniSidenav && transparentSidenav) ? 0 : 1,
      maxWidth: miniSidenav || (miniSidenav && transparentSidenav) ? 0 : "100%",
      marginLeft: miniSidenav || (miniSidenav && transparentSidenav) ? 0 : "12px",
      transition: "opacity 300ms ease-in-out, margin 300ms ease-in-out",
    },

    "& span": {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: active ? 600 : 500,
      fontSize: "0.875rem",
      lineHeight: 1.5,
    },
  };
}

export { collapseItem, collapseIconBox, collapseIcon, collapseText };
