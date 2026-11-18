import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, LogOut, Menu, User, X } from "lucide-react";
import logo from "assets/images/Logo.png";
import { Avatar, Button, IconButton, cx, focusRing } from "shared/components/ui";
import ButtonLink from "shared/components/layout/ButtonLink";
import { useAuth } from "shared/context/AuthContext";
import { logoutUser } from "shared/services/firebaseService";
import { getHomePathForRole } from "shared/utils/url";

/** Anclas de la landing (ids definidos en features/public/components/landing/*). */
export const SECTION_LINKS = [
  { id: "como-funciona", label: "Cómo funciona", index: "01" },
  { id: "funciones", label: "Funciones", index: "02" },
  { id: "duenos", label: "Para dueños", index: "03" },
  { id: "preguntas", label: "Preguntas", index: "05" },
  { id: "contacto", label: "Contacto", index: "06" },
];

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Desplaza a una sección de la home o navega a la home con la sección como destino. */
export function useSectionNavigation() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isHomepage = pathname === "/";

  return (e, id, after) => {
    e.preventDefault();
    after?.();
    if (isHomepage) {
      // Espera un frame: si se cerró el menú móvil, el header ya tiene su altura final.
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (!el) return;
        el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
        // Mueve el foco a la sección para lectores de pantalla y teclado.
        el.setAttribute("tabindex", "-1");
        el.focus({ preventScroll: true });
      });
    } else {
      navigate("/", { state: { scrollTo: id } });
    }
  };
}

/** Sección visible ahora mismo (solo en la home). */
function useActiveSection(enabled) {
  const [active, setActive] = useState(null);
  useEffect(() => {
    if (!enabled || !("IntersectionObserver" in window)) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    const ids = ["inicio", ...SECTION_LINKS.map((l) => l.id)];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [enabled]);
  return enabled ? active : null;
}

const navItem =
  "relative inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-fg-muted transition-colors hover:bg-zinc-100 hover:text-fg-strong";

function Brand({ onClick }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className={cx("flex shrink-0 items-center gap-2 rounded-md", focusRing)}
      aria-label="GoalTime, inicio"
    >
      <img src={logo} alt="" width="32" height="32" className="h-8 w-8 object-contain" />
      <span className="text-[17px] font-bold tracking-[-0.03em] text-fg-strong">GoalTime</span>
    </Link>
  );
}

function skipToContent(e) {
  const main = document.querySelector("main");
  if (!main) return;
  e.preventDefault();
  main.setAttribute("tabindex", "-1");
  main.focus();
  main.scrollIntoView({ block: "start" });
}

function HomepageHeader() {
  const { currentUser, userProfile } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const goToSection = useSectionNavigation();
  const activeSection = useActiveSection(pathname === "/");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setAccountOpen(false);
      }
    };
    const onPointer = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, []);

  const handleLogout = async () => {
    setAccountOpen(false);
    setMobileOpen(false);
    try {
      await logoutUser();
    } finally {
      navigate("/", { replace: true });
    }
  };

  const displayName = userProfile?.name || currentUser?.displayName || currentUser?.email || "Mi cuenta";
  const panelPath = getHomePathForRole(userProfile?.role);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <a
        href="#contenido"
        onClick={skipToContent}
        className="sr-only z-50 rounded-md bg-fg-strong px-3 py-2 text-sm font-medium text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:outline-none focus:ring-2 focus:ring-primary-500/60"
      >
        Saltar al contenido
      </a>

      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:border-x sm:border-line sm:px-8 lg:px-12">
        <Brand />

        <nav className="ml-6 hidden items-center lg:flex" aria-label="Secciones de la página">
          {SECTION_LINKS.map(({ id, label }) => {
            const isActive = activeSection === id;
            return (
              <a
                key={id}
                href={`/#${id}`}
                onClick={(e) => goToSection(e, id)}
                aria-current={isActive ? "location" : undefined}
                className={cx(navItem, focusRing, isActive && "text-fg-strong")}
              >
                {label}
                <span
                  className={cx(
                    "absolute inset-x-3 -bottom-[13px] h-0.5 bg-primary-600 transition-opacity",
                    isActive ? "opacity-100" : "opacity-0"
                  )}
                  aria-hidden="true"
                />
              </a>
            );
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          {currentUser ? (
            <>
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => setAccountOpen((o) => !o)}
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  aria-label={`Cuenta de ${displayName}`}
                  className={cx(
                    "flex h-9 items-center gap-2 rounded-md border border-transparent pl-1 pr-2 transition-colors hover:bg-zinc-100",
                    focusRing
                  )}
                >
                  <Avatar src={userProfile?.photoURL} name={displayName} size="sm" />
                  <span className="hidden max-w-[120px] truncate text-sm font-medium text-fg xl:inline">
                    {displayName}
                  </span>
                </button>
                {accountOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 z-50 mt-2 w-52 animate-slide-down overflow-hidden rounded-lg border border-line bg-white py-1 shadow-md"
                  >
                    <Link
                      role="menuitem"
                      to="/profile"
                      className="flex h-9 items-center gap-2 px-3 text-sm text-fg hover:bg-zinc-50"
                    >
                      <User className="h-4 w-4 text-fg-subtle" aria-hidden="true" />
                      Mi perfil
                    </Link>
                    <div className="my-1 border-t border-line-subtle" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex h-9 w-full items-center gap-2 px-3 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
              <ButtonLink
                to={panelPath}
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
              >
                Ir a mi panel
              </ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink to="/authentication/sign-in" variant="ghost" size="md">
                Iniciar sesión
              </ButtonLink>
              <ButtonLink to="/authentication/sign-up" variant="primary" size="md">
                Registrarse
              </ButtonLink>
            </>
          )}
        </div>

        <IconButton
          label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          size="lg"
          className="ml-auto md:ml-0 lg:hidden"
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <X /> : <Menu />}
        </IconButton>
      </div>

      {mobileOpen && (
        <div
          id="mobile-menu"
          className="max-h-[calc(100dvh-4rem)] animate-slide-down overflow-y-auto border-t border-line bg-white lg:hidden"
        >
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-2 sm:px-8" aria-label="Menú de secciones">
            {SECTION_LINKS.map(({ id, label, index }, i) => (
              <a
                key={id}
                href={`/#${id}`}
                onClick={(e) => goToSection(e, id, () => setMobileOpen(false))}
                className={cx(
                  "flex h-12 items-center justify-between rounded-md px-1 text-[15px] font-medium text-fg hover:bg-zinc-50",
                  i > 0 && "border-t border-line-subtle",
                  focusRing
                )}
              >
                {label}
                <span className="font-mono text-2xs text-fg-subtle" aria-hidden="true">
                  {index}
                </span>
              </a>
            ))}
          </nav>
          <div className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-line px-4 py-4 sm:px-8 md:hidden">
            {currentUser ? (
              <>
                <div className="mb-1 flex items-center gap-3">
                  <Avatar src={userProfile?.photoURL} name={displayName} size="sm" />
                  <span className="min-w-0 truncate text-sm font-medium text-fg">{displayName}</span>
                </div>
                <ButtonLink to={panelPath} variant="primary" size="lg" fullWidth>
                  Ir a mi panel
                </ButtonLink>
                <ButtonLink to="/profile" variant="secondary" size="lg" fullWidth>
                  Mi perfil
                </ButtonLink>
                <Button type="button" variant="ghost" size="lg" fullWidth onClick={handleLogout}>
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <ButtonLink to="/authentication/sign-in" variant="secondary" size="lg" fullWidth>
                  Iniciar sesión
                </ButtonLink>
                <ButtonLink to="/authentication/sign-up" variant="primary" size="lg" fullWidth>
                  Registrarse
                </ButtonLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default HomepageHeader;
