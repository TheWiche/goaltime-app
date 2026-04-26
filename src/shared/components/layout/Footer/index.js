import PropTypes from "prop-types";
import { Link as RouterLink } from "react-router-dom";
import Link from "@mui/material/Link";
import { MDBox, MDTypography } from "shared/components/md-shims";

function Footer({ company, links }) {
  const { href, name } = company;

  const renderLinks = () =>
    links.map((link) => (
      <li key={link.name} className="px-2">
        {link.isInternal ? (
          <Link component={RouterLink} to={link.href}>
            <MDTypography variant="button" fontWeight="regular" color="text">
              {link.name}
            </MDTypography>
          </Link>
        ) : (
          <Link href={link.href} target="_blank">
            <MDTypography variant="button" fontWeight="regular" color="text">
              {link.name}
            </MDTypography>
          </Link>
        )}
      </li>
    ));

  return (
    <div className="w-full flex flex-col lg:flex-row justify-between items-center px-4 py-3 text-sm text-gray-600">
      <div className="flex items-center flex-wrap justify-center">
        &copy; {new Date().getFullYear()}
        <Link href={href} target="_blank">
          <MDTypography variant="button" fontWeight="medium">
            &nbsp;{name}&nbsp;
          </MDTypography>
        </Link>
        . Todos los derechos reservados.
      </div>
      <ul className="flex flex-wrap items-center justify-center list-none mt-3 lg:mt-0 p-0 gap-1">
        {renderLinks()}
      </ul>
    </div>
  );
}

Footer.defaultProps = {
  company: { href: "#", name: "GoalTime" },
  links: [
    { href: "/sobre-nosotros", name: "Sobre Nosotros", isInternal: true },
    { href: "/blog", name: "Blog", isInternal: true },
    { href: "/licencia", name: "Licencia", isInternal: true },
  ],
};

Footer.propTypes = {
  company: PropTypes.objectOf(PropTypes.string),
  links: PropTypes.arrayOf(PropTypes.object),
};

export default Footer;
