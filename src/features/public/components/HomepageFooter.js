import { Link } from "react-router-dom";
import logo from "assets/images/Logo.png";
import { SECTION_LINKS, useSectionNavigation } from "features/public/components/HomepageHeader";

const PAGE_COLUMNS = [
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
  "rounded-sm text-[13px] text-fg-muted transition-colors hover:text-fg-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40";

function HomepageFooter() {
  const goToSection = useSectionNavigation();

  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 sm:border-x sm:border-line sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 lg:grid-cols-12 lg:gap-8">
          <div className="col-span-2 lg:col-span-5">
            <div className="flex items-center gap-2">
              <img src={logo} alt="" width="32" height="32" className="h-8 w-8 object-contain" />
              <span className="text-[17px] font-bold tracking-[-0.03em] text-fg-strong">GoalTime</span>
            </div>
            <p className="mt-4 max-w-sm text-[13px] leading-6 text-fg-muted">
              Reserva de canchas de fútbol en Riohacha, La Guajira: los jugadores reservan por franjas y los dueños
              gestionan sus canchas desde un panel.
            </p>
            <a href="mailto:equipo@goaltime.site" className={`${linkClass} mt-4 inline-block font-medium text-fg`}>
              equipo@goaltime.site
            </a>
          </div>

          <nav aria-label="Secciones de la página de inicio" className="col-span-2 min-[400px]:col-span-1 lg:col-span-3">
            <h2 className="font-mono text-2xs text-fg-subtle">Producto</h2>
            <ul className="mt-4 space-y-2.5">
              {SECTION_LINKS.map(({ id, label }) => (
                <li key={id}>
                  <a href={`/#${id}`} onClick={(e) => goToSection(e, id)} className={linkClass}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {PAGE_COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title} className="lg:col-span-2">
              <h2 className="font-mono text-2xs text-fg-subtle">{column.title}</h2>
              <ul className="mt-4 space-y-2.5">
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

        <div className="flex flex-col gap-2 border-t border-line py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-fg-subtle">© {new Date().getFullYear()} GoalTime. Todos los derechos reservados.</p>
          <p className="font-mono text-2xs text-fg-subtle">Riohacha · La Guajira · Colombia</p>
        </div>
      </div>
    </footer>
  );
}

export default HomepageFooter;
