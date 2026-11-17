import PropTypes from "prop-types";
import { cx } from "./cx";

/**
 * Tarjeta de sección con cabecera opcional (título + acciones) y pie.
 * Para tablas a sangre usa padding="p-0" y <Table bare>.
 */
function SectionCard({
  eyebrow,
  title,
  subtitle,
  icon,
  actions,
  footer,
  padding = "p-5",
  className = "",
  bodyClassName = "",
  children,
  as: Tag = "section",
}) {
  const hasHeader = Boolean(title || eyebrow || icon || actions);
  return (
    <Tag className={cx("flex flex-col rounded-lg border border-line bg-white", className)}>
      {hasHeader && (
        <header className="flex items-start gap-3 border-b border-line px-5 py-4">
          {icon && (
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-zinc-50 text-fg-muted"
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            {eyebrow && (
              <p className="mb-0.5 text-2xs font-medium uppercase tracking-wider text-fg-subtle">
                {eyebrow}
              </p>
            )}
            {title && (
              <h3 className="truncate text-sm font-semibold leading-5 text-fg-strong">{title}</h3>
            )}
            {subtitle && <p className="mt-0.5 text-[13px] leading-5 text-fg-muted">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}

      <div className={cx("flex-1", padding, bodyClassName)}>{children}</div>

      {footer && (
        <footer className="rounded-b-lg border-t border-line bg-zinc-50 px-5 py-3">{footer}</footer>
      )}
    </Tag>
  );
}

SectionCard.propTypes = {
  eyebrow: PropTypes.node,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  icon: PropTypes.node,
  actions: PropTypes.node,
  footer: PropTypes.node,
  padding: PropTypes.string,
  className: PropTypes.string,
  bodyClassName: PropTypes.string,
  children: PropTypes.node.isRequired,
  as: PropTypes.elementType,
};

export default SectionCard;
