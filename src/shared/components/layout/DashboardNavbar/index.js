import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  BellOff,
  User,
  Settings,
  LogOut,
  Menu,
  Shield,
  Briefcase,
  CircleCheck,
  Info,
  TriangleAlert,
  CircleAlert,
  CheckCheck,
  CalendarDays,
  CircleHelp,
} from "lucide-react";
import { useAuth } from "shared/context/AuthContext";
import { useMaterialUIController, setMiniSidenav } from "shared/context";
import { Button } from "shared/components/ui";
import {
  logoutUser,
  subscribeToNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "shared/services/firebaseService";

const accountActionClass =
  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-semibold text-[#1e3a8a] transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20 font-sans";

const ROUTE_LABELS = {
  "/dashboard": { eyebrow: "Panel", title: "Dashboard" },
  "/admin/users": { eyebrow: "Administración", title: "Usuarios" },
  "/admin/fields": { eyebrow: "Administración", title: "Canchas" },
  "/associate/fields": { eyebrow: "Asociado", title: "Mis canchas" },
  "/associate/reservations": { eyebrow: "Asociado", title: "Reservas" },
  "/canchas": { eyebrow: "Explorar", title: "Canchas" },
  "/reservations": { eyebrow: "Mi cuenta", title: "Mis reservaciones" },
  "/profile": { eyebrow: "Mi cuenta", title: "Perfil" },
};

const ROLE_CONFIG = {
  admin: { Icon: Shield, label: "Administrador", tone: "primary" },
  asociado: { Icon: Briefcase, label: "Asociado", tone: "cta" },
  cliente: { Icon: User, label: "Cliente", tone: "emerald" },
};

const NOTIF_TONES = {
  success: { Icon: CircleCheck, bg: "bg-emerald-50", text: "text-emerald-600" },
  error: { Icon: CircleAlert, bg: "bg-rose-50", text: "text-rose-600" },
  warning: { Icon: TriangleAlert, bg: "bg-amber-50", text: "text-amber-600" },
  info: { Icon: Info, bg: "bg-primary-50", text: "text-primary-700" },
};

const icn = "h-[22px] w-[22px] shrink-0";
const icnMd = "h-5 w-5 shrink-0";

const dropdownPanelClass =
  "absolute right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200/90 bg-white text-left shadow-xl ring-1 ring-slate-200/60";

function DashboardNavbar() {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, currentUser } = useAuth();

  const accountWrapRef = useRef(null);
  const notifWrapRef = useRef(null);

  const [scrolled, setScrolled] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!currentUser?.uid) {
      setNotifications([]);
      setUnreadCount(0);
      return undefined;
    }
    const unsubscribe = subscribeToNotifications(currentUser.uid, (notifs) => {
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.read).length);
    });
    return () => unsubscribe && unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (!accountMenuOpen && !notifMenuOpen) return undefined;
    const onPointerDown = (e) => {
      const el = e.target;
      if (accountWrapRef.current?.contains(el)) return;
      if (notifWrapRef.current?.contains(el)) return;
      setAccountMenuOpen(false);
      setNotifMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [accountMenuOpen, notifMenuOpen]);

  useEffect(() => {
    if (!accountMenuOpen && !notifMenuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setAccountMenuOpen(false);
        setNotifMenuOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [accountMenuOpen, notifMenuOpen]);

  const handleToggleSidenav = () => setMiniSidenav(dispatch, !miniSidenav);

  const handleLogout = async () => {
    setAccountMenuOpen(false);
    try {
      await logoutUser();
      navigate("/authentication/sign-in");
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  const handleNotificationClick = async (n) => {
    if (!n.read) {
      try {
        await markNotificationAsRead(n.id);
      } catch (err) {
        console.error("Error:", err);
      }
    }
    setNotifMenuOpen(false);
    if (n.actionUrl) navigate(n.actionUrl);
  };

  const handleMarkAll = async () => {
    if (!currentUser?.uid || unreadCount === 0) return;
    try {
      await markAllNotificationsAsRead(currentUser.uid);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return "Ahora";
    const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    const diff = Date.now() - date.getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1) return "Ahora";
    if (m < 60) return `Hace ${m} min`;
    if (h < 24) return `Hace ${h} h`;
    if (d < 7) return `Hace ${d} d`;
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  const role = ROLE_CONFIG[userProfile?.role] || ROLE_CONFIG.cliente;
  const RoleIcon = role.Icon;

  const reservationsHref = useMemo(() => {
    if (userProfile?.role === "asociado") return "/associate/reservations";
    if (userProfile?.role === "cliente") return "/reservations";
    return null;
  }, [userProfile?.role]);

  const pageMeta = useMemo(() => {
    const path = location.pathname;
    if (ROUTE_LABELS[path]) return ROUTE_LABELS[path];
    const match = Object.keys(ROUTE_LABELS).find((p) => path.startsWith(p));
    return match ? ROUTE_LABELS[match] : null;
  }, [location.pathname]);

  const initial = userProfile?.name ? userProfile.name[0].toUpperCase() : "U";

  return (
    <header
      className={[
        "sticky top-0 z-40 -mx-4 sm:-mx-6 lg:-mx-8 mb-6",
        "transition-all duration-200",
        scrolled
          ? "bg-white/85 backdrop-blur-md border-b border-slate-200 shadow-sm"
          : "bg-transparent border-b border-transparent",
      ].join(" ")}
    >
      <div className="px-4 sm:px-6 lg:px-8 h-[68px] flex items-center gap-3">
        <button
          type="button"
          onClick={handleToggleSidenav}
          aria-label="Abrir menú"
          className="xl:hidden w-10 h-10 grid place-items-center rounded-xl text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        >
          <Menu className={icn} strokeWidth={2} aria-hidden />
        </button>

        <div className="min-w-0 flex-1 hidden sm:block">
          {pageMeta && (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary leading-none">
                {pageMeta.eyebrow}
              </p>
              <h2 className="mt-1 text-base font-semibold font-heading text-slate-900 truncate">
                {pageMeta.title}
              </h2>
            </>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Notificaciones — panel Tailwind puro (sin MUI Menu) */}
          <div className="relative" ref={notifWrapRef}>
            <button
              type="button"
              aria-label="Notificaciones"
              aria-expanded={notifMenuOpen}
              aria-haspopup="true"
              onClick={() => {
                setNotifMenuOpen((o) => !o);
                setAccountMenuOpen(false);
              }}
              className="relative grid h-10 w-10 place-items-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
            >
              {unreadCount > 0 ? (
                <Bell className={icn} strokeWidth={2} aria-hidden />
              ) : (
                <BellOff className={icn} strokeWidth={2} aria-hidden />
              )}
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full border-2 border-white bg-cta px-1 text-[10px] font-bold leading-none text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {notifMenuOpen && (
              <div
                className={`${dropdownPanelClass} w-[min(440px,calc(100vw-2rem))] min-w-[300px]`}
                role="dialog"
                aria-label="Notificaciones"
              >
                <div className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary to-secondary px-5 py-4 text-left text-white">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-30"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 20% 0%, rgba(255,255,255,0.35), transparent 55%), radial-gradient(circle at 85% 100%, rgba(249,115,22,0.4), transparent 50%)",
                    }}
                  />
                  <div className="relative flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                        <Bell className={icn} strokeWidth={2} aria-hidden />
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
                          Centro de actividad
                        </p>
                        <h3 className="mt-1 font-heading text-base font-semibold leading-tight">
                          Notificaciones
                        </h3>
                        {unreadCount > 0 ? (
                          <p className="mt-1 text-sm text-white/90">
                            Tienes{" "}
                            <span className="font-semibold text-white">{unreadCount}</span> sin leer
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-white/75">Todo al día</p>
                        )}
                      </div>
                    </div>
                    {unreadCount > 0 && (
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        className="!shadow-md shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAll();
                        }}
                      >
                        <CheckCheck className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
                        Marcar todas
                      </Button>
                    )}
                  </div>
                </div>

                <div className="max-h-[420px] overflow-y-auto bg-slate-50/90 p-3 text-left">
                  {notifications.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-10 text-left shadow-sm">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50 text-primary ring-1 ring-primary-100">
                        <BellOff className="h-7 w-7 shrink-0" strokeWidth={2} aria-hidden />
                      </div>
                      <p className="font-heading text-base font-semibold text-slate-900">
                        Sin notificaciones
                      </p>
                      <p className="mt-1 max-w-[280px] text-sm leading-relaxed text-slate-600">
                        Te avisaremos cuando haya novedades en tu cuenta.
                      </p>
                    </div>
                  ) : (
                    <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-left">
                      {notifications.map((n) => {
                        const tone = NOTIF_TONES[n.color] || NOTIF_TONES.info;
                        const ToneIcon = tone.Icon;
                        return (
                          <li key={n.id} className="w-full text-left">
                            <button
                              type="button"
                              onClick={() => handleNotificationClick(n)}
                              className={[
                                "flex w-full cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-shadow duration-200",
                                "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25",
                                "hover:border-primary/25 hover:shadow-md",
                                !n.read
                                  ? "border-l-[4px] border-l-primary border-slate-200 bg-white shadow-sm ring-1 ring-slate-100"
                                  : "border-slate-200 bg-white shadow-sm",
                              ].join(" ")}
                            >
                              <span
                                className={[
                                  "grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1 ring-black/5",
                                  tone.bg,
                                  tone.text,
                                ].join(" ")}
                              >
                                <ToneIcon className={icn} strokeWidth={2} aria-hidden />
                              </span>
                              <div className="min-w-0 flex-1 text-left">
                                <p
                                  className={[
                                    "font-heading text-[15px] leading-snug",
                                    n.read
                                      ? "font-medium text-slate-700"
                                      : "font-semibold text-slate-900",
                                  ].join(" ")}
                                >
                                  {n.title}
                                </p>
                                {n.message && (
                                  <p className="mt-1.5 line-clamp-3 text-left text-sm leading-relaxed text-primary-800/90">
                                    {n.message}
                                  </p>
                                )}
                                <p className="mt-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                  {formatDate(n.createdAt)}
                                </p>
                              </div>
                              {!n.read && (
                                <span
                                  aria-hidden="true"
                                  className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cta"
                                  title="No leída"
                                />
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {notifications.length > 0 && (
                  <footer className="border-t border-slate-100 bg-white px-5 py-3 text-left">
                    <p className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-800">{notifications.length}</span>{" "}
                      {notifications.length === 1 ? "notificación" : "notificaciones"} en total
                    </p>
                  </footer>
                )}
              </div>
            )}
          </div>

          {/* Cuenta / avatar — panel Tailwind puro (sin MUI Menu) */}
          <div className="relative" ref={accountWrapRef}>
            <button
              type="button"
              aria-label="Cuenta"
              aria-expanded={accountMenuOpen}
              aria-haspopup="true"
              onClick={() => {
                setAccountMenuOpen((o) => !o);
                setNotifMenuOpen(false);
              }}
              className="flex items-center gap-2 rounded-xl py-1 pl-1.5 pr-2.5 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
            >
              {userProfile?.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt={userProfile?.name || "Usuario"}
                  className="h-9 w-9 rounded-full border-2 border-white object-cover shadow-sm"
                />
              ) : (
                <span
                  className="grid h-9 w-9 place-items-center rounded-full border-2 border-white text-sm font-semibold text-white shadow-sm"
                  style={{ background: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)" }}
                >
                  {initial}
                </span>
              )}
              <span className="hidden max-w-[160px] min-w-0 text-left md:block">
                <span className="block text-xs leading-none text-slate-500">{role.label}</span>
                <span className="mt-0.5 block truncate text-sm font-semibold leading-tight text-slate-900">
                  {userProfile?.name || "Usuario"}
                </span>
              </span>
            </button>

            {accountMenuOpen && (
              <div
                className={`${dropdownPanelClass} w-[min(360px,calc(100vw-2rem))] min-w-[280px]`}
                role="dialog"
                aria-label="Menú de cuenta"
              >
                <div className="border-b border-slate-100 bg-white px-4 py-4 text-left sm:px-5">
                  <div className="flex items-start gap-4 text-left">
                    <div className="shrink-0 rounded-full p-0.5 ring-2 ring-blue-100">
                      {userProfile?.photoURL ? (
                        <img
                          src={userProfile.photoURL}
                          alt={userProfile?.name || "Usuario"}
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <span
                          className="flex h-16 w-16 items-center justify-center rounded-full font-heading text-xl font-semibold text-white"
                          style={{
                            background: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)",
                          }}
                        >
                          {initial}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="break-words font-heading text-xl font-semibold leading-snug text-blue-950">
                        {userProfile?.name || "Usuario"}
                      </p>
                      {userProfile?.role && (
                        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800">
                          <RoleIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                          {role.label}
                        </span>
                      )}
                      <p className="mt-1 break-all text-left text-sm text-gray-600">
                        {userProfile?.email || ""}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-b border-slate-100 bg-white px-2 py-2">
                  <Link
                    to="/profile"
                    className={accountActionClass}
                    onClick={() => setAccountMenuOpen(false)}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary ring-1 ring-primary-100">
                      <User className={icnMd} strokeWidth={2} aria-hidden />
                    </span>
                    Mi perfil
                  </Link>
                  {reservationsHref && (
                    <Link
                      to={reservationsHref}
                      className={accountActionClass}
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary ring-1 ring-primary-100">
                        <CalendarDays className={icnMd} strokeWidth={2} aria-hidden />
                      </span>
                      Mis Reservas
                    </Link>
                  )}
                  <button
                    type="button"
                    className={accountActionClass}
                    onClick={() => {
                      setAccountMenuOpen(false);
                      window.dispatchEvent(new CustomEvent("openSettingsModal"));
                    }}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary ring-1 ring-primary-100">
                      <Settings className={icnMd} strokeWidth={2} aria-hidden />
                    </span>
                    Configuración
                  </button>
                  <Link
                    to="/sobre-nosotros"
                    className={accountActionClass}
                    onClick={() => setAccountMenuOpen(false)}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary ring-1 ring-primary-100">
                      <CircleHelp className={icnMd} strokeWidth={2} aria-hidden />
                    </span>
                    Ayuda
                  </Link>
                </div>

                <div className="bg-slate-50/80 px-2 py-2">
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-semibold text-rose-700 transition-colors duration-200 hover:bg-rose-50 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-rose-200 font-sans"
                    onClick={handleLogout}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600">
                      <LogOut className={icnMd} strokeWidth={2} aria-hidden />
                    </span>
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default DashboardNavbar;
