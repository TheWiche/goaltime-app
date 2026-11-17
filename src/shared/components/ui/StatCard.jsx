import PropTypes from "prop-types";
import { cx, focusRing } from "./cx";

const tones = {
  primary: "bg-primary-50 text-primary-700 border-primary-100",
  secondary: "bg-zinc-50 text-zinc-700 border-line",
  cta: "bg-cta-50 text-cta-700 border-cta-100",
  success: "bg-green-50 text-green-700 border-green-100",
  warning: "bg-amber-50 text-amber-700 border-amber-100",
  danger: "bg-red-50 text-red-700 border-red-100",
};

function TrendArrow({ up }) {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className={cx("h-3 w-3", !up && "rotate-180")}
    >
      <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" strokeLinecap="square" />
    </svg>
  );
}

TrendArrow.propTypes = { up: PropTypes.bool };

/** KPI: etiqueta, valor grande tabular, tendencia opcional e icono en tile cuadrado. */
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
  const interactive = Boolean(onClick);
  const Tag = interactive ? "button" : "div";

  return (
    <Tag
      type={interactive ? "button" : undefined}
      onClick={onClick}
      className={cx(
        "relative block w-full rounded-lg border border-line bg-white p-4 text-left",
        interactive && cx("cursor-pointer transition-colors duration-150 hover:border-line-strong hover:bg-zinc-50/60", focusRing),
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-fg-muted">{title}</p>
          <p className="tabular mt-1.5 text-2xl font-semibold leading-none tracking-tight text-fg-strong">
            {value}
          </p>
          {(subtitle || trend !== undefined) && (
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {trend !== undefined && (
                <span
                  className={cx(
                    "tabular inline-flex h-5 items-center gap-0.5 rounded px-1.5 text-2xs font-semibold",
                    trendUp ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  )}
                >
                  <TrendArrow up={trendUp} />
                  {trend}%
                </span>
              )}
              {subtitle && <span className="truncate text-xs text-fg-subtle">{subtitle}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <span
            className={cx(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border",
              tones[color] ?? tones.primary
            )}
            aria-hidden="true"
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
    </Tag>
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
