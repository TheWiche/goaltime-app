import PropTypes from "prop-types";
import GlassCard from "./GlassCard";

function StatCard({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  trend,
  trendUp = true,
  color = "primary",
  iconBg = true,
}) {
  const colorClasses = {
    primary: {
      icon: "text-primary",
      bg: "bg-primary/10",
      trend: trendUp ? "text-green-600" : "text-red-600",
    },
    secondary: {
      icon: "text-secondary",
      bg: "bg-secondary/10",
      trend: trendUp ? "text-green-600" : "text-red-600",
    },
    cta: {
      icon: "text-cta",
      bg: "bg-cta/10",
      trend: trendUp ? "text-green-600" : "text-red-600",
    },
  };

  const colors = colorClasses[color] || colorClasses.primary;

  return (
    <GlassCard className="p-6" hover={false}>
      <div className="flex items-start gap-4">
        {Icon && (
          <div className={`
            ${iconBg ? `${colors.bg} p-3 rounded-xl` : ""}
          `}>
            <Icon className={`w-6 h-6 ${colors.icon}`} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium font-heading text-surface-400 uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold font-heading text-primary-900">
            {value}
          </p>
          {(subtitle || trend !== undefined) && (
            <div className="flex items-center gap-2 mt-2">
              {trend !== undefined && (
                <span className={`text-sm font-semibold ${colors.trend}`}>
                  {trendUp ? "↑" : "↓"} {trend}%
                </span>
              )}
              {subtitle && (
                <span className="text-sm text-surface-500">
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

StatCard.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  trend: PropTypes.number,
  trendUp: PropTypes.bool,
  color: PropTypes.oneOf(["primary", "secondary", "cta"]),
  iconBg: PropTypes.bool,
};

export default StatCard;
