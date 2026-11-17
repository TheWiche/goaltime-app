import PropTypes from "prop-types";
import { cx } from "./cx";

/** Cabecera de página: título, subtítulo, meta (badges) y acciones a la derecha. */
function PageHeader({ eyebrow, title, subtitle, actions, meta, bordered = false, className = "" }) {
  return (
    <header
      className={cx(
        "mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        bordered && "border-b border-line pb-5",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-xs font-medium text-fg-subtle">{eyebrow}</p>
        )}
        {title && (
          <h1 className="text-2xl font-semibold leading-tight tracking-tight text-fg-strong">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-fg-muted">{subtitle}</p>
        )}
        {meta && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

PageHeader.propTypes = {
  eyebrow: PropTypes.node,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  actions: PropTypes.node,
  meta: PropTypes.node,
  bordered: PropTypes.bool,
  className: PropTypes.string,
};

export default PageHeader;
