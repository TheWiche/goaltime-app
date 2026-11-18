import { useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { cx } from "shared/components/ui";

/**
 * Activa el "reveal" de los elementos [data-reveal] dentro de `rootRef`.
 * No hace nada si el usuario prefiere menos movimiento o no hay IntersectionObserver:
 * en ese caso el contenido simplemente está visible (sin estado oculto inicial).
 */
export function useReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === "undefined") return undefined;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) return undefined;

    root.classList.add("reveal-on");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    root.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      root.classList.remove("reveal-on");
    };
  }, [rootRef]);
}

/** Props para un elemento animado al entrar en pantalla (con retardo opcional en ms). */
export const reveal = (delay = 0) => ({
  "data-reveal": "",
  style: delay ? { "--reveal-delay": `${delay}ms` } : undefined,
});

/** Marca "+" en las esquinas de la rejilla (solo decorativa). */
function Cross({ className }) {
  return (
    <svg
      viewBox="0 0 11 11"
      className={cx("pointer-events-none absolute hidden h-[11px] w-[11px] text-zinc-300 sm:block", className)}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5.5 0v11M0 5.5h11" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

Cross.propTypes = { className: PropTypes.string };

/**
 * Sección de la landing: línea superior a todo el ancho + columna central con bordes laterales
 * (la "rejilla visible") y cruces en las esquinas.
 */
export function Section({ id, labelledBy, tone = "white", className, innerClassName, children }) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cx(
        "relative scroll-mt-16 border-t border-line",
        tone === "canvas" ? "bg-canvas" : "bg-white",
        className
      )}
    >
      <div
        className={cx(
          "relative mx-auto w-full max-w-7xl px-4 py-16 sm:border-x sm:border-line sm:px-8 md:py-24 lg:px-12",
          innerClassName
        )}
      >
        <Cross className="-left-[6px] -top-[6px]" />
        <Cross className="-right-[6px] -top-[6px]" />
        {children}
      </div>
    </section>
  );
}

Section.propTypes = {
  id: PropTypes.string,
  labelledBy: PropTypes.string,
  tone: PropTypes.oneOf(["white", "canvas"]),
  className: PropTypes.string,
  innerClassName: PropTypes.string,
  children: PropTypes.node.isRequired,
};

/** Cabecera editorial: índice en mono + título grande + entradilla. */
export function SectionIntro({ index, eyebrow, title, titleId, children, className, aside, stacked = false }) {
  return (
    <div
      className={cx("grid grid-cols-1 gap-6", !stacked && "lg:grid-cols-12 lg:items-end lg:gap-10", className)}
      {...reveal()}
    >
      <div className={stacked ? undefined : "lg:col-span-7"}>
        <p className="flex items-center gap-3 font-mono text-xs text-fg-subtle">
          <span className="text-primary-700">{index}</span>
          <span className="h-px w-8 bg-line-strong" aria-hidden="true" />
          <span>{eyebrow}</span>
        </p>
        <h2
          id={titleId}
          className="mt-5 text-[2rem] font-semibold leading-[1.05] tracking-[-0.035em] text-fg-strong sm:text-[2.75rem] lg:text-[3.25rem]"
        >
          {title}
        </h2>
      </div>
      {(children || aside) && (
        <div className={stacked ? undefined : "lg:col-span-5"}>
          {children && <p className="max-w-xl text-base leading-7 text-fg-muted">{children}</p>}
          {aside}
        </div>
      )}
    </div>
  );
}

SectionIntro.propTypes = {
  index: PropTypes.string.isRequired,
  eyebrow: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired,
  titleId: PropTypes.string.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
  aside: PropTypes.node,
  stacked: PropTypes.bool,
};

/** Etiqueta que aclara que un mockup usa datos de ejemplo. */
export function SampleTag({ className, children = "Vista ilustrativa · datos de ejemplo" }) {
  return (
    <p
      className={cx(
        "inline-flex items-center gap-2 rounded border border-dashed border-line-strong bg-white px-2 py-1 font-mono text-2xs text-fg-subtle",
        className
      )}
    >
      {children}
    </p>
  );
}

SampleTag.propTypes = { className: PropTypes.string, children: PropTypes.node };

/** Cancha vista desde arriba (líneas reglamentarias a escala 105 × 68). Decorativa. */
export function PitchLines({ className }) {
  return (
    <svg
      viewBox="0 0 1060 690"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform="translate(5 5)">
        <rect x="0" y="0" width="1050" height="680" />
        <line x1="525" y1="0" x2="525" y2="680" />
        <circle cx="525" cy="340" r="91.5" />
        <circle cx="525" cy="340" r="3" fill="currentColor" />
        {/* Áreas izquierda */}
        <rect x="0" y="138.5" width="165" height="403" />
        <rect x="0" y="248.5" width="55" height="183" />
        <circle cx="110" cy="340" r="3" fill="currentColor" />
        <path d="M165 266.9 A91.5 91.5 0 0 1 165 413.1" />
        {/* Áreas derecha */}
        <rect x="885" y="138.5" width="165" height="403" />
        <rect x="995" y="248.5" width="55" height="183" />
        <circle cx="940" cy="340" r="3" fill="currentColor" />
        <path d="M885 266.9 A91.5 91.5 0 0 0 885 413.1" />
        {/* Esquinas */}
        <path d="M0 10 A10 10 0 0 0 10 0" />
        <path d="M1040 0 A10 10 0 0 0 1050 10" />
        <path d="M0 670 A10 10 0 0 1 10 680" />
        <path d="M1040 680 A10 10 0 0 1 1050 670" />
      </g>
    </svg>
  );
}

PitchLines.propTypes = { className: PropTypes.string };

const CTA_VARIANTS = {
  cta: "border-cta-500 bg-cta-500 text-white hover:border-cta-600 hover:bg-cta-600 active:bg-cta-700",
  primary: "border-primary-600 bg-primary-600 text-white hover:border-primary-700 hover:bg-primary-700",
  secondary: "border-line-strong bg-white text-fg hover:border-zinc-400 hover:bg-zinc-50",
  light: "border-white bg-white text-zinc-950 hover:border-zinc-200 hover:bg-zinc-200",
  outlineDark: "border-zinc-700 bg-transparent text-white hover:border-zinc-500 hover:bg-zinc-900",
};

/**
 * Enlace con forma de botón grande para la landing (h-12). Para acciones estándar usa ButtonLink;
 * este existe para el tamaño editorial y la variante clara sobre fondo oscuro.
 */
export function CtaLink({ to, href, variant = "primary", leftIcon, rightIcon, className, children, ...rest }) {
  const classes = cx(
    "inline-flex h-12 select-none items-center justify-center gap-2 whitespace-nowrap rounded-md border px-6 text-[15px] font-medium shadow-xs transition-colors duration-150",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 focus-visible:ring-offset-2",
    variant === "light" || variant === "outlineDark"
      ? "focus-visible:ring-offset-zinc-950"
      : "focus-visible:ring-offset-white",
    CTA_VARIANTS[variant],
    className
  );
  const content = (
    <>
      {leftIcon}
      {children}
      {rightIcon}
    </>
  );
  return href ? (
    <a href={href} className={classes} {...rest}>
      {content}
    </a>
  ) : (
    <Link to={to} className={classes} {...rest}>
      {content}
    </Link>
  );
}

CtaLink.propTypes = {
  to: PropTypes.string,
  href: PropTypes.string,
  variant: PropTypes.oneOf(Object.keys(CTA_VARIANTS)),
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  className: PropTypes.string,
  children: PropTypes.node,
};
