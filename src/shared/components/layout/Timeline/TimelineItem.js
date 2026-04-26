import PropTypes from "prop-types";
import { Bell, Package, ShoppingCart, CreditCard, KeyRound } from "lucide-react";

const ICON_MAP = {
  notifications: Bell,
  inventory_2: Package,
  shopping_cart: ShoppingCart,
  payment: CreditCard,
  vpn_key: KeyRound,
};

const DOT_CLASS = {
  success: "bg-emerald-500",
  error: "bg-rose-500",
  info: "bg-sky-500",
  warning: "bg-amber-500",
  primary: "bg-primary",
};

function TimelineItem({ color, icon, title, dateTime, lastItem }) {
  const IconCmp = ICON_MAP[icon] || Bell;
  const dot = DOT_CLASS[color] || DOT_CLASS.info;

  return (
    <div className={["relative flex gap-3 pb-6 pl-1", lastItem ? "pb-0" : ""].join(" ")}>
      {!lastItem && (
        <span
          className="absolute left-[15px] top-8 bottom-0 w-px bg-slate-200"
          aria-hidden
        />
      )}
      <span
        className={[
          "relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow-sm",
          dot,
        ].join(" ")}
      >
        <IconCmp className="h-4 w-4" strokeWidth={2} aria-hidden />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-slate-400">
          {dateTime}
        </p>
      </div>
    </div>
  );
}

TimelineItem.defaultProps = {
  lastItem: false,
};

TimelineItem.propTypes = {
  color: PropTypes.oneOf(["success", "error", "info", "warning", "primary"]).isRequired,
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  dateTime: PropTypes.string.isRequired,
  lastItem: PropTypes.bool,
};

export default TimelineItem;
