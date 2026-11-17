import PropTypes from "prop-types";
import { Link as RouterLink } from "react-router-dom";

function Footer({ company, links }) {
  const year = new Date().getFullYear();
  const { href, name } = company;
  const brandClass =
    "font-medium text-fg hover:text-primary-700 transition-colors duration-150";
  const isExternal = typeof href === "string" && /^https?:\/\//i.test(href);

  return (
    <footer className="mt-10 w-full border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center sm:text-left text-xs text-fg-subtle leading-relaxed">
            © {year}{" "}
            {isExternal ? (
              <a href={href} target="_blank" rel="noopener noreferrer" className={brandClass}>
                {name}
              </a>
            ) : (
              <RouterLink to={href || "/"} className={brandClass}>
                {name}
              </RouterLink>
            )}
            . Todos los derechos reservados.
          </p>
          <nav aria-label="Enlaces del pie">
            <ul className="m-0 p-0 list-none flex flex-wrap items-center justify-center sm:justify-end gap-x-6 gap-y-2">
              {links.map((link) => (
                <li key={link.name}>
                  {link.isInternal ? (
                    <RouterLink
                      to={link.href}
                      className="text-xs font-medium text-fg-muted hover:text-fg transition-colors duration-150"
                    >
                      {link.name}
                    </RouterLink>
                  ) : (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-fg-muted hover:text-fg transition-colors duration-150"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}

Footer.defaultProps = {
  company: { href: "/", name: "GoalTime" },
  links: [
    { href: "/sobre-nosotros", name: "Sobre nosotros", isInternal: true },
    { href: "/blog", name: "Blog", isInternal: true },
    { href: "/licencia", name: "Licencia", isInternal: true },
  ],
};

Footer.propTypes = {
  company: PropTypes.shape({
    href: PropTypes.string,
    name: PropTypes.string,
  }),
  links: PropTypes.arrayOf(
    PropTypes.shape({
      href: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      isInternal: PropTypes.bool,
    })
  ),
};

export default Footer;
