import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import logo from "assets/images/Logo.png";

function Brand({ className = "" }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 ${className}`}
    >
      <img src={logo} alt="" className="h-8 w-8 object-contain" />
      <span className="text-base font-semibold tracking-tight text-fg-strong">GoalTime</span>
    </Link>
  );
}

Brand.propTypes = { className: PropTypes.string };

/**
 * Estructura común de las pantallas de autenticación.
 * - lg+: panel informativo a la izquierda (borde, sin imágenes ni degradados) + formulario a la derecha.
 * - móvil: solo el formulario con la marca arriba.
 */
function AuthShell({ title, subtitle, aside, children, footer, backTo, backLabel }) {
  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="hidden flex-col justify-between border-r border-line bg-zinc-50 p-10 lg:flex xl:p-14">
        <Brand />
        {aside && (
          <div className="max-w-md">
            <h2 className="text-3xl font-semibold tracking-tight text-fg-strong">{aside.heading}</h2>
            {aside.description && (
              <p className="mt-3 text-[15px] leading-6 text-fg-muted">{aside.description}</p>
            )}
            {aside.points?.length > 0 && (
              <ul className="mt-8 space-y-3">
                {aside.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm text-fg">
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-line-strong bg-white text-primary-600"
                      aria-hidden="true"
                    >
                      <Check className="h-3 w-3" strokeWidth={2.5} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <p className="text-xs text-fg-subtle">© {new Date().getFullYear()} GoalTime</p>
      </aside>

      <main className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:justify-end lg:px-8">
          <Brand className="lg:hidden" />
          <Link
            to={backTo}
            className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] font-medium text-fg-muted transition-colors hover:bg-zinc-100 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {backLabel}
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-12 pt-4 sm:px-6">
          <div className="w-full max-w-[400px] animate-fade-in">
            <h1 className="text-2xl font-semibold tracking-tight text-fg-strong">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm leading-5 text-fg-muted">{subtitle}</p>}
            <div className="mt-7">{children}</div>
            {footer && <div className="mt-6 text-center text-sm text-fg-muted">{footer}</div>}
          </div>
        </div>
      </main>
    </div>
  );
}

AuthShell.propTypes = {
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  aside: PropTypes.shape({
    heading: PropTypes.string.isRequired,
    description: PropTypes.string,
    points: PropTypes.arrayOf(PropTypes.string),
  }),
  children: PropTypes.node,
  footer: PropTypes.node,
  backTo: PropTypes.string,
  backLabel: PropTypes.string,
};

AuthShell.defaultProps = {
  backTo: "/",
  backLabel: "Volver al inicio",
};

export default AuthShell;
