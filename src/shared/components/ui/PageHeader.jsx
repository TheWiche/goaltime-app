import PropTypes from "prop-types";

function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  meta,
  className = "",
}) {
  return (
    <header
      className={[
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        "mb-6",
        className,
      ].join(" ")}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary mb-1.5">
            {eyebrow}
          </p>
        )}
        {title && (
          <h1 className="text-2xl sm:text-3xl font-semibold font-heading text-slate-900 tracking-tight leading-tight">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="mt-2 text-sm sm:text-[15px] text-slate-500 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
        {meta && <div className="mt-3 flex flex-wrap gap-2 items-center">{meta}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}

PageHeader.propTypes = {
  eyebrow: PropTypes.node,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  actions: PropTypes.node,
  meta: PropTypes.node,
  className: PropTypes.string,
};

export default PageHeader;
