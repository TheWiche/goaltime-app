// MDSnackbar, MDAlert, MDBadge, MDAvatar, MDProgress, MDPagination shims
import PropTypes from "prop-types";

export function MDSnackbar({ open, close, color = "info", title, content, icon, ...rest }) {
  if (!open) return null;
  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-card-hover p-4 max-w-sm z-50">
      {title && <p className="font-bold text-dark mb-1">{title}</p>}
      {content && <p className="text-sm text-gray-600">{content}</p>}
      <button onClick={close} className="absolute top-2 right-2 text-gray-400 hover:text-dark">
        ×
      </button>
    </div>
  );
}

MDSnackbar.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func,
  color: PropTypes.string,
  title: PropTypes.string,
  content: PropTypes.node,
  icon: PropTypes.node,
};

export function MDAlert({ color = "info", children }) {
  return <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">{children}</div>;
}

MDAlert.propTypes = {
  color: PropTypes.string,
  children: PropTypes.node,
};

export function MDBadge({ children, color = "info", variant = "gradient", size = "sm" }) {
  return <span className="inline-block px-2 py-0.5 bg-goaltime text-white text-xs rounded-full">{children}</span>;
}

MDBadge.propTypes = {
  children: PropTypes.node,
  color: PropTypes.string,
  variant: PropTypes.string,
  size: PropTypes.string,
};

export function MDAvatar({ src, alt, size = "md" }) {
  return <img src={src} alt={alt} className="w-10 h-10 rounded-full object-cover" />;
}

MDAvatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  size: PropTypes.string,
};

export function MDProgress({ value, color = "info", variant = "gradient" }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className="bg-goaltime h-2 rounded-full" style={{ width: `${value}%` }} />
    </div>
  );
}

MDProgress.propTypes = {
  value: PropTypes.number,
  color: PropTypes.string,
  variant: PropTypes.string,
};

export function MDPagination({ children }) {
  return <div className="flex gap-1">{children}</div>;
}

export function MDPaginationItem({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-lg text-sm ${active ? "bg-goaltime text-white" : "bg-gray-100 text-dark hover:bg-gray-200"}`}
    >
      {children}
    </button>
  );
}

MDPagination.Item = MDPaginationItem;

MDPagination.propTypes = {
  children: PropTypes.node,
};

MDPaginationItem.propTypes = {
  children: PropTypes.node,
  active: PropTypes.bool,
  onClick: PropTypes.func,
};
