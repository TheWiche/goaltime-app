import { useEffect, useId, useRef } from "react";
import PropTypes from "prop-types";
import Button from "./Button";
import { cx, focusRing } from "./cx";

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  "2xl": "max-w-5xl",
  full: "max-w-7xl",
};

const FOCUSABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

// Pila de modales abiertos: Escape y el focus trap solo actúan sobre el superior.
const modalStack = [];
let scrollLocks = 0;
let previousOverflow = "";

function lockBodyScroll() {
  if (scrollLocks === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  scrollLocks += 1;
}

function unlockBodyScroll() {
  scrollLocks = Math.max(0, scrollLocks - 1);
  if (scrollLocks === 0) document.body.style.overflow = previousOverflow;
}

function CloseIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" {...props}>
      <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
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
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const closeOnEscRef = useRef(closeOnEsc);
  closeOnEscRef.current = closeOnEsc;

  const uid = useId();
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;

  // Montaje: pila, bloqueo de scroll, foco inicial, trap y restauración del foco.
  useEffect(() => {
    if (!open) return undefined;
    const token = {};
    modalStack.push(token);
    lockBodyScroll();

    const previouslyFocused = document.activeElement;
    const dialog = dialogRef.current;
    const focusables = () =>
      dialog
        ? Array.from(dialog.querySelectorAll(FOCUSABLE)).filter(
            (el) => el.offsetParent !== null || el === document.activeElement
          )
        : [];

    // Foco inicial: elemento con [data-autofocus] o, si no, el propio diálogo.
    const raf = requestAnimationFrame(() => {
      if (!dialog || dialog.contains(document.activeElement)) return;
      (dialog.querySelector("[data-autofocus]") || dialog).focus({ preventScroll: true });
    });

    const onKeyDown = (e) => {
      if (modalStack[modalStack.length - 1] !== token) return;
      if (e.key === "Escape" && closeOnEscRef.current) {
        e.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        dialog.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === dialog)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (!dialog.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown);
      const idx = modalStack.indexOf(token);
      if (idx !== -1) modalStack.splice(idx, 1);
      unlockBodyScroll();
      if (
        previouslyFocused &&
        typeof previouslyFocused.focus === "function" &&
        document.contains(previouslyFocused)
      ) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [open]);

  if (!open) return null;

  const isHero = variant === "hero";
  const hasHeader = Boolean(title || eyebrow || icon);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-zinc-950/40 p-0 animate-fade-in sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose?.();
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={cx(
          "relative flex w-full flex-col overflow-hidden bg-white outline-none animate-scale-in",
          "max-h-[calc(100dvh-16px)] rounded-t-lg border border-line shadow-lg sm:max-h-[calc(100vh-32px)] sm:rounded-lg",
          sizeClasses[size] ?? sizeClasses.md,
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={subtitle ? descId : undefined}
        aria-label={!title ? (typeof eyebrow === "string" ? eyebrow : "Diálogo") : undefined}
      >
        {hasHeader && (
          <header
            className={cx(
              "flex shrink-0 items-start gap-3 border-b border-line",
              isHero ? "bg-zinc-50 px-6 pb-5 pt-6" : "px-6 py-4",
              !hideClose && "pr-14"
            )}
          >
            {icon && (
              <div
                className={cx(
                  "flex shrink-0 items-center justify-center rounded-md",
                  isHero
                    ? "h-10 w-10 bg-primary-600 text-white"
                    : "h-8 w-8 border border-line bg-zinc-50 text-fg-muted"
                )}
                aria-hidden="true"
              >
                {icon}
              </div>
            )}
            <div className="min-w-0 flex-1">
              {eyebrow && (
                <p className={cx("mb-0.5 text-xs font-medium", isHero ? "text-primary-700" : "text-fg-subtle")}>
                  {eyebrow}
                </p>
              )}
              {title && (
                <h2
                  id={titleId}
                  className={cx(
                    "truncate font-semibold leading-tight tracking-tight text-fg-strong",
                    isHero ? "text-xl" : "text-base"
                  )}
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p id={descId} className="mt-1 text-[13px] leading-5 text-fg-muted">
                  {subtitle}
                </p>
              )}
            </div>
          </header>
        )}

        {hasHeader && !hideClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className={cx(
              "absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-fg-subtle transition-colors",
              "hover:bg-zinc-100 hover:text-fg",
              focusRing
            )}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        )}

        <div className={cx("flex-1 overflow-y-auto px-6 py-5", bodyClassName)}>
          {children}
        </div>

        {footer && (
          <footer
            className={cx(
              "flex shrink-0 flex-col-reverse gap-2 border-t border-line bg-zinc-50 px-6 py-3 sm:flex-row sm:items-center sm:justify-end",
              footerSticky && "sticky bottom-0"
            )}
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
