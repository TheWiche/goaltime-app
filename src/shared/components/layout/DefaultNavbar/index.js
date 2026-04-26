import { MDBox, MDTypography, MDButton } from "shared/components/md-shims";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Menu, X } from "lucide-react";
import DefaultNavbarLink from "./DefaultNavbarLink";
import DefaultNavbarMobile from "./DefaultNavbarMobile";
import breakpoints from "assets/theme/base/breakpoints";
import { useMaterialUIController } from "shared/context";

function DefaultNavbar({ transparent, light, action }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const [mobileNavbar, setMobileNavbar] = useState(false);
  const [mobileView, setMobileView] = useState(false);

  const openMobileNavbar = (e) => setMobileNavbar(e.currentTarget);
  const closeMobileNavbar = () => setMobileNavbar(false);

  useEffect(() => {
    function displayMobileNavbar() {
      if (window.innerWidth < breakpoints.values.lg) {
        setMobileView(true);
        setMobileNavbar(false);
      } else {
        setMobileView(false);
        setMobileNavbar(false);
      }
    }

    window.addEventListener("resize", displayMobileNavbar);
    displayMobileNavbar();
    return () => window.removeEventListener("resize", displayMobileNavbar);
  }, []);

  const barBg = transparent
    ? "bg-transparent backdrop-blur-none"
    : darkMode
    ? "bg-slate-900/80 backdrop-blur-xl backdrop-saturate-200"
    : "bg-white/80 backdrop-blur-xl backdrop-saturate-200";

  const textColor = light ? "text-white" : "text-slate-900";

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div
        className={[
          "absolute left-1/2 z-[3] my-3 flex w-[calc(100%-48px)] max-w-[calc(100%-48px)] -translate-x-1/2 items-center justify-between rounded-xl py-2 pl-4 pr-3 sm:pl-6 sm:pr-4 lg:pl-6 lg:pr-4",
          transparent ? "shadow-none" : "shadow-md",
          barBg,
          textColor,
        ].join(" ")}
      >
        <MDBox
          component={Link}
          to="/"
          py={transparent ? 1.5 : 0.75}
          lineHeight={1}
          pl={{ xs: 0, lg: 1 }}
          className="no-underline"
        >
          <MDTypography variant="button" fontWeight="bold" color={light ? "white" : "dark"}>
            Material Dashboard 2
          </MDTypography>
        </MDBox>
        <MDBox color="inherit" display={{ xs: "none", lg: "flex" }} m={0} p={0}>
          <DefaultNavbarLink icon="donut_large" name="dashboard" route="/dashboard" light={light} />
          <DefaultNavbarLink icon="person" name="profile" route="/profile" light={light} />
          <DefaultNavbarLink
            icon="account_circle"
            name="sign up"
            route="/authentication/sign-up"
            light={light}
          />
          <DefaultNavbarLink icon="key" name="sign in" route="/authentication/sign-in" light={light} />
        </MDBox>
        {action &&
          (action.type === "internal" ? (
            <div className="hidden lg:inline-block">
              <Link to={action.route} className="no-underline">
                <MDButton
                  variant="contained"
                  color={action.color ? action.color : "info"}
                  size="small"
                >
                  {action.label}
                </MDButton>
              </Link>
            </div>
          ) : (
            <div className="hidden lg:inline-block">
              <a
                href={action.route}
                target="_blank"
                rel="noreferrer"
                className="no-underline"
              >
                <MDButton
                  variant="contained"
                  color={action.color ? action.color : "info"}
                  size="small"
                  className="-mt-0.5"
                >
                  {action.label}
                </MDButton>
              </a>
            </div>
          ))}
        <button
          type="button"
          className="inline-flex cursor-pointer items-center p-2 text-inherit lg:hidden"
          aria-label={mobileNavbar ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={Boolean(mobileNavbar)}
          onClick={mobileNavbar ? closeMobileNavbar : openMobileNavbar}
        >
          {mobileNavbar ? (
            <X className="h-6 w-6" strokeWidth={2} aria-hidden />
          ) : (
            <Menu className="h-6 w-6" strokeWidth={2} aria-hidden />
          )}
        </button>
      </div>
      {mobileView && <DefaultNavbarMobile open={mobileNavbar} close={closeMobileNavbar} />}
    </div>
  );
}

DefaultNavbar.defaultProps = {
  transparent: false,
  light: false,
  action: false,
};

DefaultNavbar.propTypes = {
  transparent: PropTypes.bool,
  light: PropTypes.bool,
  action: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.shape({
      type: PropTypes.oneOf(["external", "internal"]).isRequired,
      route: PropTypes.string.isRequired,
      color: PropTypes.oneOf([
        "primary",
        "secondary",
        "info",
        "success",
        "warning",
        "error",
        "dark",
        "light",
      ]),
      label: PropTypes.string.isRequired,
    }),
  ]),
};

export default DefaultNavbar;
