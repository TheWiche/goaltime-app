import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Button from "./Button";

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  "2xl": "max-w-5xl",
  full: "max-w-7xl",
};

function CloseIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function Modal({
  open,
  onClose,
  eyebrow,
  title,
  subtitle,
  icon,
  size = "md",
  variant = "panel",
  hideClose = false,
  closeOnBackdrop = true,
  closeOnEsc = true,
  className = "",
  bodyClassName = "",
  footer,
  footerSticky = false,
  children,
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open || !closeOnEsc) return undefined;
    const handler = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, closeOnEsc, onClose]);

  if (!open) return null;

  const isHero = variant === "hero";

  const headerWrapperClasses = isHero
    ? "relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary to-secondary px-7 pt-7 pb-8 text-white"
    : "flex items-start gap-4 px-7 pt-6 pb-5 border-b border-slate-200 bg-white";

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (closeOnBackdrop && e.target === overlayRef.current) onClose?.();
      }}
      role="presentation"
    >
      <div
        className={[
          "relative w-full rounded-2xl bg-white shadow-xl ring-1 ring-slate-200/70 animate-slide-up",
          "flex flex-col max-h-[calc(100vh-32px)] overflow-hidden",
          sizeClasses[size] ?? sizeClasses.md,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || eyebrow || icon) && (
          <header className={headerWrapperClasses}>
            {isHero && (
              <div
                className="pointer-events-none absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 0%, rgba(255,255,255,0.35), transparent 60%), radial-gradient(circle at 80% 100%, rgba(249,115,22,0.35), transparent 55%)",
                }}
              />
            )}

            <div className={isHero ? "relative flex items-start gap-4 pr-12" : "flex items-start gap-4 flex-1 min-w-0"}>
              {icon && (
                <div
                  className={[
                    "shrink-0 w-11 h-11 rounded-xl flex items-center justify-center",
                    isHero
                      ? "bg-white/15 ring-1 ring-white/25 text-white"
                      : "bg-primary-50 text-primary",
                  ].join(" ")}
                >
                  {icon}
                </div>
              )}
              <div className="min-w-0 flex-1">
                {eyebrow && (
                  <p
                    className={[
                      "text-[11px] font-semibold uppercase tracking-[0.14em] mb-1",
                      isHero ? "text-white/70" : "text-slate-500",
                    ].join(" ")}
                  >
                    {eyebrow}
                  </p>
                )}
                {title && (
                  <h2
                    className={[
                      "font-heading font-semibold leading-tight tracking-tight truncate",
                      isHero ? "text-white text-2xl" : "text-slate-900 text-xl",
                    ].join(" ")}
                  >
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p
                    className={[
                      "mt-1 text-sm leading-relaxed",
                      isHero ? "text-white/80" : "text-slate-500",
                    ].join(" ")}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {!hideClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className={[
                  "absolute top-4 right-4 inline-flex items-center justify-center rounded-lg p-2 transition-all duration-200 cursor-pointer",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2",
                  isHero
                    ? "text-white/85 hover:text-white bg-white/10 hover:bg-white/20 ring-1 ring-white/20"
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-200",
                ].join(" ")}
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            )}
          </header>
        )}

        <div
          className={[
            "flex-1 overflow-y-auto",
            isHero ? "bg-slate-50" : "bg-white",
            "px-7 py-6",
            bodyClassName,
          ].join(" ")}
        >
          {children}
        </div>

        {footer && (
          <footer
            className={[
              "px-7 py-4 border-t border-slate-200 bg-white flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3",
              footerSticky ? "shadow-[0_-4px_12px_-8px_rgba(15,23,42,0.15)]" : "",
            ].join(" ")}
          >
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

Modal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  eyebrow: PropTypes.node,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  icon: PropTypes.node,
  size: PropTypes.oneOf(["sm", "md", "lg", "xl", "2xl", "full"]),
  variant: PropTypes.oneOf(["panel", "hero"]),
  hideClose: PropTypes.bool,
  closeOnBackdrop: PropTypes.bool,
  closeOnEsc: PropTypes.bool,
  className: PropTypes.string,
  bodyClassName: PropTypes.string,
  footer: PropTypes.node,
  footerSticky: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

export { Button };
export default Modal;
