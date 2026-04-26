import PropTypes from "prop-types";

function SectionCard({
  eyebrow,
  title,
  subtitle,
  icon,
  actions,
  footer,
  padding = "p-6",
  className = "",
  bodyClassName = "",
  children,
  as: Tag = "section",
}) {
  return (
    <Tag
      className={[
        "rounded-xl bg-white border border-slate-200 shadow-sm",
        "transition-shadow duration-200 hover:shadow-md",
        "flex flex-col",
        className,
      ].join(" ")}
    >
      {(title || eyebrow || icon || actions) && (
        <header className="flex items-start gap-3 px-6 pt-5 pb-4 border-b border-slate-100">
          {icon && (
            <div className="shrink-0 w-9 h-9 rounded-lg bg-primary-50 text-primary flex items-center justify-center">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            {eyebrow && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-0.5">
                {eyebrow}
              </p>
            )}
            {title && (
              <h3 className="text-base font-semibold font-heading text-slate-900 leading-snug truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{subtitle}</p>
            )}
          </div>
          {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
        </header>
      )}

      <div className={[padding, bodyClassName].filter(Boolean).join(" ")}>{children}</div>

      {footer && (
        <footer className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-xl">
          {footer}
        </footer>
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
