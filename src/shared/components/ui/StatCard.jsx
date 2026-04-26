import PropTypes from "prop-types";

const tones = {
  primary: { bg: "bg-primary-50", text: "text-primary" },
  secondary: { bg: "bg-blue-50", text: "text-blue-600" },
  cta: { bg: "bg-cta-50", text: "text-cta-600" },
  success: { bg: "bg-emerald-50", text: "text-emerald-600" },
  warning: { bg: "bg-amber-50", text: "text-amber-600" },
  danger: { bg: "bg-rose-50", text: "text-rose-600" },
};

function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  trendUp = true,
  color = "primary",
  className = "",
  onClick,
}) {
  const tone = tones[color] || tones.primary;
  const interactive = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick(e);
            }
          : undefined
      }
      className={[
        "relative rounded-xl bg-white border border-slate-200 p-5",
        "shadow-sm transition-all duration-200",
        interactive
          ? "cursor-pointer hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {title}
          </p>
          <p className="mt-2 text-3xl font-semibold font-heading text-slate-900 leading-none">
            {value}
          </p>
          {(subtitle || trend !== undefined) && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {trend !== undefined && (
                <span
                  className={[
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    trendUp
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700",
                  ].join(" ")}
                >
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={["h-3 w-3", trendUp ? "" : "rotate-180"].join(" ")}
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 17a.75.75 0 01-.75-.75V5.612L4.296 10.566a.75.75 0 01-1.092-1.029l6.25-6.5a.75.75 0 011.092 0l6.25 6.5a.75.75 0 11-1.092 1.029L10.75 5.612V16.25A.75.75 0 0110 17z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {trend}%
                </span>
              )}
              {subtitle && (
                <span className="text-xs text-slate-500 truncate">{subtitle}</span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <span
            className={[
              "shrink-0 w-11 h-11 rounded-xl flex items-center justify-center",
              tone.bg,
              tone.text,
            ].join(" ")}
            aria-hidden="true"
          >
            <Icon className="w-5 h-5" />
          </span>
        )}
      </div>
    </div>
  );
}

StatCard.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  trend: PropTypes.number,
  trendUp: PropTypes.bool,
  color: PropTypes.oneOf(["primary", "secondary", "cta", "success", "warning", "danger"]),
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default StatCard;
