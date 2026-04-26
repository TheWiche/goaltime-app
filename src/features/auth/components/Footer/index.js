import { MDTypography } from "shared/components/md-shims";
import PropTypes from "prop-types";
import { Link as RouterLink } from "react-router-dom";

function Footer({ light }) {
  const textMuted = light ? "text-white/90" : "text-slate-600";
  const linkClass = light
    ? "text-white hover:text-white/80 no-underline"
    : "text-slate-800 hover:text-primary no-underline";

  return (
    <footer className="w-full py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center justify-between gap-6 px-2 lg:flex-row lg:gap-4">
          <div
            className={`flex flex-wrap items-center justify-center gap-x-1 text-center text-sm ${textMuted}`}
          >
            &copy; {new Date().getFullYear()}
            <RouterLink to="/" className={linkClass}>
              <MDTypography variant="button" className="font-medium">
                &nbsp;GoalTime&nbsp;
              </MDTypography>
            </RouterLink>
            . Todos los derechos reservados.
          </div>

          <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-x-0 p-0 lg:mt-0">
            <li className="px-4 leading-none">
              <RouterLink to="/sobre-nosotros" className={linkClass}>
                <MDTypography variant="button" className="font-normal">
                  Sobre Nosotros
                </MDTypography>
              </RouterLink>
            </li>
            <li className="px-4 leading-none">
              <RouterLink to="/blog" className={linkClass}>
                <MDTypography variant="button" className="font-normal">
                  Blog
                </MDTypography>
              </RouterLink>
            </li>
            <li className="pl-4 leading-none">
              <RouterLink to="/licencia" className={linkClass}>
                <MDTypography variant="button" className="font-normal">
                  Licencia
                </MDTypography>
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

Footer.defaultProps = {
  light: false,
};

Footer.propTypes = {
  light: PropTypes.bool,
};

export default Footer;
