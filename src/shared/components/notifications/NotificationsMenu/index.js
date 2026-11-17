import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
} from "lucide-react";
import { useAuth } from "shared/context/AuthContext";
import { Button, EmptyState, Skeleton, Toast, cx, focusRing } from "shared/components/ui";
import {
  subscribeToNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "shared/services/firebaseService";
import { toDate, formatDateEs } from "shared/utils/date";
import { logger } from "shared/utils/logger";
import useDismissable from "../useDismissable";

const TONES = {
  success: { Icon: CircleCheck, box: "border-green-200 bg-green-50 text-green-700" },
  error: { Icon: CircleAlert, box: "border-red-200 bg-red-50 text-red-700" },
  warning: { Icon: TriangleAlert, box: "border-amber-200 bg-amber-50 text-amber-700" },
  info: { Icon: Info, box: "border-primary-200 bg-primary-50 text-primary-700" },
};

/** "Ahora", "Hace 5 min", "Hace 3 h", "Hace 2 d" o fecha corta. */
function relativeTime(value) {
  const date = toDate(value);
  if (!date) return "Ahora";
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(diff / 86400000);
  if (days < 7) return `Hace ${days} d`;
  return formatDateEs(date, { day: "numeric", month: "short" });
}

/** Solo rutas internas (la regla de servicio ya lo exige al crear, se revalida al leer). */
const isInternalPath = (url) => typeof url === "string" && url.startsWith("/") && !url.startsWith("//");

function NotificationsMenu() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const uid = currentUser?.uid;

  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [toast, setToast] = useState({ open: false, type: "info", message: "" });

  useEffect(() => {
    if (!uid) {
      setNotifications([]);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    const unsubscribe = subscribeToNotifications(uid, (list) => {
      setNotifications(list);
      setLoading(false);
    });
    return () => unsubscribe && unsubscribe();
  }, [uid]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  useDismissable({
    open,
    onDismiss: () => setOpen(false),
    refs: [wrapRef],
    returnFocusRef: triggerRef,
  });

  // Foco al panel al abrir (el panel es un diálogo no modal).
  useEffect(() => {
    if (open) panelRef.current?.focus({ preventScroll: true });
  }, [open]);

  const showToast = (type, message) => setToast({ open: true, type, message });

  const handleItemClick = (n) => {
    setOpen(false);
    if (!n.read) {
      markNotificationAsRead(n.id).catch((err) => {
        logger.error("markNotificationAsRead", err);
        showToast("error", "No se pudo marcar la notificación como leída.");
      });
    }
    if (isInternalPath(n.actionUrl)) navigate(n.actionUrl);
  };

  const handleMarkAll = async () => {
    if (!uid || unreadCount === 0 || marking) return;
    setMarking(true);
    try {
      await markAllNotificationsAsRead(uid);
      showToast("success", "Todas las notificaciones quedaron como leídas.");
    } catch (err) {
      logger.error("markAllNotificationsAsRead", err);
      showToast("error", err?.message || "No se pudieron marcar las notificaciones.");
    } finally {
      setMarking(false);
    }
  };

  const bellLabel =
    unreadCount > 0
      ? `Notificaciones, ${unreadCount} sin leer`
      : "Notificaciones, sin novedades";

  return (
    <div className="relative" ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={bellLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cx(
          "relative inline-flex h-9 w-9 items-center justify-center rounded-md text-fg-muted transition-colors duration-150",
          "hover:bg-zinc-100 hover:text-fg",
          open && "bg-zinc-100 text-fg",
          focusRing
        )}
      >
        <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="tabular absolute right-0.5 top-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded bg-primary-600 px-1 text-2xs font-semibold leading-none text-white"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-label="Notificaciones"
          className={cx(
            "z-50 flex max-h-[min(520px,calc(100dvh-5rem))] flex-col overflow-hidden rounded-lg border border-line bg-white text-left shadow-md outline-none animate-slide-down",
            "max-sm:fixed max-sm:left-4 max-sm:right-4 max-sm:top-16",
            "sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:w-[400px]"
          )}
        >
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-3">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-fg-strong">Notificaciones</h2>
              <p className="text-xs text-fg-muted" aria-live="polite">
                {unreadCount > 0
                  ? `${unreadCount} sin leer`
                  : loading
                  ? "Cargando…"
                  : "Todo al día"}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                loading={marking}
                onClick={handleMarkAll}
                leftIcon={<CheckCheck className="h-3.5 w-3.5" aria-hidden />}
              >
                Marcar todas
              </Button>
            )}
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading ? (
              <div className="space-y-3 p-4" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <EmptyState
                size="sm"
                bordered={false}
                icon={Bell}
                title="Sin notificaciones"
                description="Te avisaremos cuando haya novedades en tu cuenta."
              />
            ) : (
              <ul className="m-0 list-none divide-y divide-line-subtle p-0">
                {notifications.map((n) => {
                  const tone = TONES[n.color] || TONES.info;
                  const ToneIcon = tone.Icon;
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => handleItemClick(n)}
                        className={cx(
                          "relative flex w-full items-start gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-zinc-50",
                          "focus:outline-none focus-visible:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500/40",
                          !n.read && "bg-primary-50/40"
                        )}
                      >
                        {!n.read && (
                          <span
                            aria-hidden="true"
                            className="absolute inset-y-0 left-0 w-0.5 bg-primary-600"
                          />
                        )}
                        <span
                          className={cx(
                            "mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border",
                            tone.box
                          )}
                          aria-hidden="true"
                        >
                          <ToneIcon className="h-4 w-4" strokeWidth={1.75} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={cx(
                              "block text-sm leading-5",
                              n.read ? "font-medium text-fg-muted" : "font-semibold text-fg-strong"
                            )}
                          >
                            {!n.read && <span className="sr-only">No leída: </span>}
                            {n.title}
                          </span>
                          {n.message && (
                            <span className="mt-0.5 line-clamp-3 block text-[13px] leading-5 text-fg-muted">
                              {n.message}
                            </span>
                          )}
                          <span className="mt-1 block text-xs text-fg-subtle">
                            {relativeTime(n.createdAt)}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message || " "}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </div>
  );
}

export default NotificationsMenu;
