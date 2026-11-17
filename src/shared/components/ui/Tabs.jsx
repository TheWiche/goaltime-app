import { useId, useRef } from "react";
import PropTypes from "prop-types";
import { cx, focusRing } from "./cx";

const itemShape = PropTypes.shape({
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.node.isRequired,
  icon: PropTypes.node,
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  disabled: PropTypes.bool,
});

/** Navegación con flechas / Home / End entre botones habilitados (roving tabindex). */
function useRovingKeys(items, value, onChange) {
  const refs = useRef({});
  const onKeyDown = (e) => {
    const enabled = items.filter((it) => !it.disabled);
    const idx = enabled.findIndex((it) => it.value === value);
    let next = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = enabled[(idx + 1) % enabled.length];
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = enabled[(idx - 1 + enabled.length) % enabled.length];
    else if (e.key === "Home") next = enabled[0];
    else if (e.key === "End") next = enabled[enabled.length - 1];
    if (!next) return;
    e.preventDefault();
    onChange?.(next.value);
    refs.current[next.value]?.focus();
  };
  const register = (val) => (el) => {
    refs.current[val] = el;
  };
  // Si ningún item coincide con `value`, el primero habilitado recibe el foco por Tab.
  const fallback = items.some((it) => it.value === value) ? null : items.find((it) => !it.disabled)?.value;
  const tabIndexFor = (it) => (it.value === value || it.value === fallback ? 0 : -1);
  return { onKeyDown, register, tabIndexFor };
}

function Count({ children, active }) {
  return (
    <span
      className={cx(
        "tabular inline-flex h-[18px] min-w-[18px] items-center justify-center rounded px-1 text-2xs font-medium",
        active ? "bg-zinc-900 text-white" : "bg-zinc-100 text-fg-muted"
      )}
    >
      {children}
    </span>
  );
}

Count.propTypes = { children: PropTypes.node, active: PropTypes.bool };

/**
 * Pestañas. variant "underline" (navegación de secciones, por defecto) o "segmented".
 * Controlado: `value` + `onChange(value)`. Los paneles los renderiza el consumidor;
 * usa `getTabPanelProps(value)` si quieres enlazar aria-controls.
 */
export function Tabs({ items, value, onChange, variant = "underline", size = "md", fullWidth = false, className = "", "aria-label": ariaLabel, idPrefix }) {
  const auto = useId();
  const prefix = idPrefix || `tabs${auto.replace(/:/g, "")}`;
  const { onKeyDown, register, tabIndexFor } = useRovingKeys(items, value, onChange);
  const segmented = variant === "segmented";

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cx(
        segmented
          ? "inline-flex items-center gap-0.5 rounded-md border border-line bg-zinc-100/70 p-0.5"
          : "flex items-center gap-4 overflow-x-auto border-b border-line",
        fullWidth && "w-full",
        className
      )}
    >
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            ref={register(it.value)}
            id={`${prefix}-tab-${it.value}`}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={`${prefix}-panel-${it.value}`}
            tabIndex={tabIndexFor(it)}
            disabled={it.disabled}
            onClick={() => onChange?.(it.value)}
            className={cx(
              "inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium transition-colors duration-150",
              "disabled:pointer-events-none disabled:opacity-40",
              focusRing,
              size === "sm" ? "text-[13px]" : "text-sm",
              fullWidth && "flex-1",
              segmented
                ? cx(
                    "rounded px-2.5",
                    size === "sm" ? "h-7" : "h-8",
                    active ? "border border-line bg-white text-fg-strong shadow-xs" : "border border-transparent text-fg-muted hover:text-fg"
                  )
                : cx(
                    "-mb-px border-b-2 px-0.5",
                    size === "sm" ? "h-9" : "h-10",
                    active ? "border-zinc-900 text-fg-strong" : "border-transparent text-fg-muted hover:border-line-strong hover:text-fg"
                  )
            )}
          >
            {it.icon && <span className="inline-flex [&>svg]:h-4 [&>svg]:w-4" aria-hidden="true">{it.icon}</span>}
            {it.label}
            {it.count !== undefined && it.count !== null && <Count active={active && !segmented}>{it.count}</Count>}
          </button>
        );
      })}
    </div>
  );
}

Tabs.propTypes = {
  items: PropTypes.arrayOf(itemShape).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  variant: PropTypes.oneOf(["underline", "segmented"]),
  size: PropTypes.oneOf(["sm", "md"]),
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  "aria-label": PropTypes.string,
  idPrefix: PropTypes.string,
};

/** Props para el panel asociado a una pestaña (role, id, aria-labelledby). */
export function getTabPanelProps(idPrefix, value) {
  return {
    role: "tabpanel",
    id: `${idPrefix}-panel-${value}`,
    "aria-labelledby": `${idPrefix}-tab-${value}`,
    tabIndex: 0,
  };
}

/**
 * Control segmentado para filtros / vistas (semántica radiogroup).
 * Ej.: <SegmentedControl items={[{value:"all",label:"Todas"}]} value={f} onChange={setF} />
 */
export function SegmentedControl({ items, value, onChange, size = "md", fullWidth = false, className = "", "aria-label": ariaLabel }) {
  const { onKeyDown, register, tabIndexFor } = useRovingKeys(items, value, onChange);
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cx(
        "inline-flex items-center gap-0.5 rounded-md border border-line bg-zinc-100/70 p-0.5",
        fullWidth && "flex w-full",
        className
      )}
    >
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            ref={register(it.value)}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={tabIndexFor(it)}
            disabled={it.disabled}
            onClick={() => onChange?.(it.value)}
            className={cx(
              "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded border px-2.5 font-medium transition-colors duration-150",
              "disabled:pointer-events-none disabled:opacity-40",
              focusRing,
              size === "sm" ? "h-7 text-[13px]" : "h-8 text-sm",
              fullWidth && "flex-1",
              active
                ? "border-line bg-white text-fg-strong shadow-xs"
                : "border-transparent text-fg-muted hover:text-fg"
            )}
          >
            {it.icon && <span className="inline-flex [&>svg]:h-4 [&>svg]:w-4" aria-hidden="true">{it.icon}</span>}
            {it.label}
            {it.count !== undefined && it.count !== null && <Count>{it.count}</Count>}
          </button>
        );
      })}
    </div>
  );
}

SegmentedControl.propTypes = {
  items: PropTypes.arrayOf(itemShape).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  size: PropTypes.oneOf(["sm", "md"]),
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  "aria-label": PropTypes.string,
};

export default Tabs;
