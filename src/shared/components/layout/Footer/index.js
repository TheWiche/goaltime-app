import PropTypes from "prop-types";
import { Link as RouterLink } from "react-router-dom";

function Footer({ company, links }) {
  const year = new Date().getFullYear();
  const { href, name } = company;
  const brandClass =
    "font-semibold text-primary uppercase tracking-[0.06em] hover:text-primary-800 transition-colors duration-200";
  const isExternal = typeof href === "string" && /^https?:\/\//i.test(href);

  return (
    <footer className="w-full mt-10 border-t border-slate-200/90 bg-surface">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center sm:text-left text-[13px] text-slate-500 leading-relaxed">
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
            {" "}
            . Todos los derechos reservados.
          </p>
          <nav aria-label="Enlaces del pie">
            <ul className="m-0 p-0 list-none flex flex-wrap items-center justify-center sm:justify-end gap-x-6 gap-y-2">
              {links.map((link) => (
                <li key={link.name}>
                  {link.isInternal ? (
                    <RouterLink
                      to={link.href}
                      className="text-[12px] font-semibold uppercase tracking-[0.08em] text-primary hover:text-primary-800 transition-colors duration-200"
                    >
                      {link.name}
                    </RouterLink>
                  ) : (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12px] font-semibold uppercase tracking-[0.08em] text-primary hover:text-primary-800 transition-colors duration-200"
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
