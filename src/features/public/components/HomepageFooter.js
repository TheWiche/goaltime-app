import { Link } from "react-router-dom";
import logo from "assets/images/Logo.png";

const columns = [
  {
    title: "GoalTime",
    links: [
      { to: "/sobre-nosotros", label: "Sobre nosotros" },
      { to: "/blog", label: "Blog" },
      { to: "/licencia", label: "Licencia" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/politica-de-privacidad", label: "Política de privacidad" },
      { to: "/terminos-y-condiciones", label: "Términos y condiciones" },
    ],
  },
];

const linkClass =
  "rounded text-[13px] text-fg-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40";

function HomepageFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <img src={logo} alt="" className="h-8 w-8 object-contain" />
              <span className="text-base font-semibold tracking-tight text-fg-strong">GoalTime</span>
            </div>
            <p className="mt-3 text-[13px] leading-5 text-fg-muted">
              Encuentra y reserva canchas deportivas en línea, o gestiona las tuyas desde un solo panel.
            </p>
            <a href="mailto:equipo@goaltime.site" className={`${linkClass} mt-3 inline-block font-medium text-fg`}>
              equipo@goaltime.site
            </a>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-xs font-medium text-fg-subtle">{column.title}</h2>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-8 border-t border-line pt-5">
          <p className="text-xs text-fg-subtle">
            © {new Date().getFullYear()} GoalTime. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default HomepageFooter;
