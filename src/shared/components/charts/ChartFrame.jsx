import PropTypes from "prop-types";
import { Clock } from "lucide-react";

/** Marco común: área del gráfico + pie opcional (título, descripción, fecha). */
function ChartFrame({ title, description, date, children }) {
  const hasFooter = Boolean(title || description || date);
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="relative min-h-[12.5rem] flex-1">{children}</div>
      {hasFooter && (
        <div className="mt-4 border-t border-line pt-3">
          {title && <h6 className="text-sm font-semibold text-fg-strong">{title}</h6>}
          {description && <div className="mt-0.5 text-[13px] text-fg-muted">{description}</div>}
          {date && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-fg-subtle">
              <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
              <span>{date}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

ChartFrame.propTypes = {
  title: PropTypes.string,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  date: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default ChartFrame;
