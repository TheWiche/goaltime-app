import { isValidElement } from "react";
import PropTypes from "prop-types";
import { cx } from "./cx";

/**
 * Estado vacío / sin resultados / error recuperable.
 * `icon` acepta un componente (Inbox de lucide) o un nodo ya renderizado.
 */
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  size = "md",
  bordered = true,
  className = "",
}) {
  const compact = size === "sm";
  const iconNode = Icon ? (isValidElement(Icon) ? Icon : <Icon className="h-5 w-5" strokeWidth={1.75} />) : null;

  return (
    <div
      className={cx(
        "flex flex-col items-center justify-center text-center",
        compact ? "px-4 py-8" : "px-6 py-14",
        bordered && "rounded-lg border border-dashed border-line-strong bg-white",
        className
      )}
    >
      {iconNode && (
        <div
          className="mb-3 flex h-10 w-10 items-center justify-center rounded-md border border-line bg-zinc-50 text-fg-subtle"
          aria-hidden="true"
        >
          {iconNode}
        </div>
      )}
      {title && <h3 className="text-sm font-semibold text-fg-strong">{title}</h3>}
      {description && (
        <p className={cx("mt-1 max-w-sm text-[13px] leading-5 text-fg-muted")}>{description}</p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.elementType, PropTypes.node]),
  title: PropTypes.node,
  description: PropTypes.node,
  action: PropTypes.node,
  secondaryAction: PropTypes.node,
  size: PropTypes.oneOf(["sm", "md"]),
  bordered: PropTypes.bool,
  className: PropTypes.string,
};

export default EmptyState;
