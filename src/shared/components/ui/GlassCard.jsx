import PropTypes from "prop-types";

function GlassCard({ 
  children, 
  className = "", 
  hover = true,
  onClick,
  blur = "glass",
  gradient = true,
  ...props 
}) {
  const baseClasses = `
    backdrop-blur-${blur}
    bg-white/70
    border border-white/20
    rounded-2xl
    shadow-glass
    transition-all duration-200
    ${gradient ? "relative overflow-hidden" : ""}
    ${hover ? "hover:shadow-xl hover:-translate-y-1 cursor-pointer" : ""}
    ${className}
  `.trim().replace(/\s+/g, " ");

  return (
    <div 
      className={baseClasses}
      onClick={onClick}
      {...props}
    >
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

GlassCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  hover: PropTypes.bool,
  onClick: PropTypes.func,
  blur: PropTypes.oneOf(["xs", "glass", "glass-lg"]),
  gradient: PropTypes.bool,
};

export default GlassCard;
