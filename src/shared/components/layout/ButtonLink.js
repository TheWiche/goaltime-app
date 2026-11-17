import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { cx, focusRing } from "shared/components/ui";

/*
 * Enlace con la apariencia de <Button> (misma escala de variantes/tamaños que ui/Button).
 * Úsalo cuando la acción es navegación: evita anidar <button> dentro de <a>.
 */
const variants = {
  primary:
    "bg-primary-600 text-white border border-primary-600 shadow-xs hover:bg-primary-700 hover:border-primary-700 active:bg-primary-800",
  cta: "bg-cta-500 text-white border border-cta-500 shadow-xs hover:bg-cta-600 hover:border-cta-600 active:bg-cta-700",
  secondary:
    "bg-white text-fg border border-line-strong shadow-xs hover:bg-zinc-50 hover:border-zinc-400 active:bg-zinc-100",
  ghost:
    "bg-transparent text-fg-muted border border-transparent hover:bg-zinc-100 hover:text-fg active:bg-zinc-200",
};

const sizes = {
  sm: "h-8 px-3 text-[13px] gap-1.5",
  md: "h-9 px-3.5 text-sm gap-2",
  lg: "h-10 px-4 text-sm gap-2",
  xl: "h-11 px-5 text-[15px] gap-2",
};

function ButtonLink({
  to,
  href,
  variant = "primary",
  size = "md",
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = "",
  children,
  ...rest
}) {
  const classes = cx(
    "inline-flex select-none items-center justify-center whitespace-nowrap rounded-md font-medium",
    "transition-colors duration-150",
    focusRing,
    variants[variant] ?? variants.primary,
    sizes[size] ?? sizes.md,
    fullWidth && "w-full",
    className
  );

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {leftIcon}
        {children}
        {rightIcon}
      </a>
    );
  }
  return (
    <Link to={to} className={classes} {...rest}>
      {leftIcon}
      {children}
      {rightIcon}
    </Link>
  );
}

ButtonLink.propTypes = {
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  href: PropTypes.string,
  variant: PropTypes.oneOf(["primary", "cta", "secondary", "ghost"]),
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  fullWidth: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  className: PropTypes.string,
  children: PropTypes.node,
};

export default ButtonLink;
