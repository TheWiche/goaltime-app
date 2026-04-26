import { MDBox, MDTypography, MDAvatar } from "shared/components/md-shims";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Home, Mail, Settings } from "lucide-react";
import breakpoints from "assets/theme/base/breakpoints";
import burceMars from "assets/images/bruce-mars.jpg";
import backgroundImage from "assets/images/bg-profile.jpeg";

const TABS = [
  { label: "Aplicación", Icon: Home },
  { label: "Mensaje", Icon: Mail },
  { label: "Configuración", Icon: Settings },
];

function Header({ children }) {
  const [tabsVertical, setTabsVertical] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    function handleTabsLayout() {
      setTabsVertical(window.innerWidth < breakpoints.values.sm);
    }
    window.addEventListener("resize", handleTabsLayout);
    handleTabsLayout();
    return () => window.removeEventListener("resize", handleTabsLayout);
  }, []);

  return (
    <MDBox position="relative" mb={5}>
      <div
        className="relative flex min-h-[18.75rem] items-center overflow-hidden rounded-2xl bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.55), rgba(29, 78, 216, 0.55)), url(${backgroundImage})`,
        }}
      />
      <div className="relative z-[1] mx-3 -mt-16 rounded-xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm sm:px-6">
        <div
          className={[
            "flex flex-wrap items-center gap-4 md:gap-6",
            tabsVertical ? "flex-col items-stretch" : "",
          ].join(" ")}
        >
          <MDAvatar src={burceMars} alt="profile-image" size="xl" shadow="sm" />
          <MDBox height="100%" mt={0.5} lineHeight={1} className="min-w-0 flex-1">
            <MDTypography variant="h5" fontWeight="medium">
              Richard Davis
            </MDTypography>
            <MDTypography variant="button" color="text" fontWeight="regular">
              CEO / Co-Fundador
            </MDTypography>
          </MDBox>
          <nav
            className={[
              "flex w-full rounded-xl bg-slate-100 p-1 md:ml-auto md:w-auto",
              tabsVertical ? "flex-col" : "flex-row flex-wrap justify-center",
            ].join(" ")}
            aria-label="Secciones de perfil"
          >
            {TABS.map((tab, idx) => {
              const Icon = tab.Icon;
              const active = tabValue === idx;
              return (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => setTabValue(idx)}
                  className={[
                    "flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                    active
                      ? "bg-white text-primary shadow-sm"
                      : "text-slate-600 hover:bg-white/70 hover:text-slate-900",
                    tabsVertical ? "w-full" : "",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
        {children}
      </div>
    </MDBox>
  );
}

Header.defaultProps = {
  children: "",
};

Header.propTypes = {
  children: PropTypes.node,
};

export default Header;
