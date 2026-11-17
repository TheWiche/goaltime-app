import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  LogOut,
  Settings,
  Shield,
  User,
} from "lucide-react";
import { useAuth } from "shared/context/AuthContext";
import { Avatar, StatusPill, Toast, cx, focusRing } from "shared/components/ui";
import { logoutUser } from "shared/services/firebaseService";
import { logger } from "shared/utils/logger";
import useDismissable from "shared/components/notifications/useDismissable";
import { openSettingsModal } from "shared/components/notifications/GlobalSettingsModal";

const ROLE_CONFIG = {
  admin: { Icon: Shield, label: "Administrador", tone: "info" },
  asociado: { Icon: Briefcase, label: "Asociado", tone: "cta" },
  cliente: { Icon: User, label: "Cliente", tone: "neutral" },
};

const itemClass = cx(
  "flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-left text-sm text-fg transition-colors duration-150",
  "hover:bg-zinc-100 focus:bg-zinc-100",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500/40"
);

const iconClass = "h-4 w-4 shrink-0 text-fg-subtle";

function AccountMenu() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "" });

  const role = ROLE_CONFIG[userProfile?.role] || ROLE_CONFIG.cliente;
  const displayName = userProfile?.name || "Usuario";

  const reservationsHref = useMemo(() => {
    if (userProfile?.role === "asociado") return "/associate/reservations";
    if (userProfile?.role === "cliente") return "/reservations";
    return null;
  }, [userProfile?.role]);

  useDismissable({
    open,
    onDismiss: () => setOpen(false),
    refs: [wrapRef],
    returnFocusRef: triggerRef,
  });

  const getItems = () =>
    menuRef.current ? Array.from(menuRef.current.querySelectorAll('[role="menuitem"]')) : [];

  // Al abrir, el foco va al primer elemento del menú.
  useEffect(() => {
    if (open) getItems()[0]?.focus({ preventScroll: true });
  }, [open]);

  const closeAndRestoreFocus = () => {
    triggerRef.current?.focus({ preventScroll: true });
    setOpen(false);
  };

  const onMenuKeyDown = (e) => {
    const items = getItems();
    if (items.length === 0) return;
    const idx = items.indexOf(document.activeElement);
    let next = null;
    if (e.key === "ArrowDown") next = items[(idx + 1) % items.length];
    else if (e.key === "ArrowUp") next = items[(idx - 1 + items.length) % items.length];
    else if (e.key === "Home") next = items[0];
    else if (e.key === "End") next = items[items.length - 1];
    if (next) {
      e.preventDefault();
      next.focus();
    }
  };

  const onTriggerKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      setOpen(true);
    }
  };

  const handleSettings = () => {
    // Devolver el foco al disparador antes de abrir el modal: así el modal lo restaura al cerrar.
    closeAndRestoreFocus();
    openSettingsModal();
  };

  const handleLogout = async () => {
    setOpen(false);
    try {
      await logoutUser();
      navigate("/authentication/sign-in");
    } catch (err) {
      logger.error("logoutUser", err);
      setToast({ open: true, message: "No se pudo cerrar la sesión. Inténtalo de nuevo." });
    }
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Cuenta de ${displayName}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onTriggerKeyDown}
        className={cx(
          "flex h-9 items-center gap-2 rounded-md py-0 pl-1 pr-1.5 transition-colors duration-150 hover:bg-zinc-100 md:pr-2",
          open && "bg-zinc-100",
          focusRing
        )}
      >
        <Avatar src={userProfile?.photoURL} name={displayName} size="sm" />
        <span className="hidden min-w-0 max-w-[160px] text-left md:block">
          <span className="block truncate text-[13px] font-medium leading-4 text-fg-strong">
            {displayName}
          </span>
          <span className="block truncate text-xs leading-4 text-fg-subtle">{role.label}</span>
        </span>
        <ChevronDown
          className={cx("hidden h-4 w-4 text-fg-subtle transition-transform md:block", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-line bg-white text-left shadow-md animate-slide-down">
          <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <Avatar src={userProfile?.photoURL} name={displayName} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-fg-strong">{displayName}</p>
              <p className="truncate text-xs text-fg-muted">{userProfile?.email || ""}</p>
              {userProfile?.role && (
                <StatusPill tone={role.tone} size="sm" className="mt-1.5" icon={<role.Icon aria-hidden />}>
                  {role.label}
                </StatusPill>
              )}
            </div>
          </div>

          <div
            ref={menuRef}
            role="menu"
            aria-label="Menú de cuenta"
            onKeyDown={onMenuKeyDown}
            className="p-1.5"
          >
            <Link to="/profile" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
              <User className={iconClass} aria-hidden />
              Mi perfil
            </Link>
            {reservationsHref && (
              <Link
                to={reservationsHref}
                role="menuitem"
                className={itemClass}
                onClick={() => setOpen(false)}
              >
                <CalendarDays className={iconClass} aria-hidden />
                Mis reservas
              </Link>
            )}
            <button type="button" role="menuitem" className={itemClass} onClick={handleSettings}>
              <Settings className={iconClass} aria-hidden />
              Configuración
            </button>
            <Link to="/sobre-nosotros" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
              <CircleHelp className={iconClass} aria-hidden />
              Ayuda
            </Link>
            <div role="separator" className="my-1.5 h-px bg-line" />
            <button
              type="button"
              role="menuitem"
              className={cx(itemClass, "text-red-700 hover:bg-red-50 focus:bg-red-50")}
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 shrink-0 text-red-600" aria-hidden />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}

      <Toast
        open={toast.open}
        type="error"
        message={toast.message || " "}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </div>
  );
}

export default AccountMenu;
