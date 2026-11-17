import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, Menu, User, X } from "lucide-react";
import logo from "assets/images/Logo.png";
import { Avatar, Button, IconButton, cx, focusRing } from "shared/components/ui";
import ButtonLink from "shared/components/layout/ButtonLink";
import { useAuth } from "shared/context/AuthContext";
import { logoutUser } from "shared/services/firebaseService";
import { getHomePathForRole } from "shared/utils/url";

const SECTION_LINKS = [
  { id: "jugadores", label: "Jugadores" },
  { id: "duenos", label: "Dueños" },
  { id: "testimonios", label: "Testimonios" },
  { id: "contacto", label: "Contacto" },
];

const PAGE_LINKS = [
  { to: "/sobre-nosotros", label: "Sobre nosotros" },
  { to: "/blog", label: "Blog" },
];

const navItem =
  "inline-flex h-8 items-center rounded-md px-2.5 text-sm font-medium text-fg-muted transition-colors hover:bg-zinc-100 hover:text-fg";

function Brand({ onClick }) {
  return (
    <Link to="/" onClick={onClick} className={cx("flex shrink-0 items-center gap-2 rounded-md", focusRing)}>
      <img src={logo} alt="" className="h-8 w-8 object-contain" />
      <span className="text-base font-semibold tracking-tight text-fg-strong">GoalTime</span>
    </Link>
  );
}

function HomepageHeader() {
  const { currentUser, userProfile } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isHomepage = pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  // Cierra menús al cambiar de ruta.
  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  // Escape cierra; clic fuera cierra el menú de cuenta.
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

  const goToSection = (e, id) => {
    e.preventDefault();
    setMobileOpen(false);
    if (isHomepage) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/", { state: { scrollTo: id } });
    }
  };

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

  const sectionLinks = SECTION_LINKS.map(({ id, label }) => (
    <a key={id} href={`/#${id}`} onClick={(e) => goToSection(e, id)} className={cx(navItem, focusRing)}>
      {label}
    </a>
  ));

  const pageLinks = PAGE_LINKS.map(({ to, label }) => (
    <NavLink
      key={to}
      to={to}
      className={({ isActive }) => cx(navItem, focusRing, isActive && "bg-zinc-100 text-fg-strong")}
    >
      {label}
    </NavLink>
  ));

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Brand />

        <nav className="ml-4 hidden items-center gap-0.5 lg:flex" aria-label="Principal">
          {sectionLinks}
          <span className="mx-2 h-4 w-px bg-line" aria-hidden="true" />
          {pageLinks}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          {currentUser ? (
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                className={cx(
                  "flex h-9 items-center gap-2 rounded-md border border-transparent pl-1 pr-2 transition-colors hover:bg-zinc-100",
                  focusRing
                )}
              >
                <Avatar src={userProfile?.photoURL} name={displayName} size="sm" />
                <span className="max-w-[140px] truncate text-sm font-medium text-fg">{displayName}</span>
              </button>
              {accountOpen && (
                <div
                  role="menu"
                  className="absolute right-0 z-50 mt-2 w-52 animate-slide-down overflow-hidden rounded-lg border border-line bg-white py-1 shadow-md"
                >
                  <Link
                    role="menuitem"
                    to={panelPath}
                    className="flex h-9 items-center gap-2 px-3 text-sm text-fg hover:bg-zinc-50"
                  >
                    <LayoutDashboard className="h-4 w-4 text-fg-subtle" aria-hidden="true" />
                    Mi panel
                  </Link>
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
        <div id="mobile-menu" className="animate-slide-down border-t border-line bg-white lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-0.5 px-4 py-3 sm:px-6" aria-label="Menú móvil">
            {SECTION_LINKS.map(({ id, label }) => (
              <a
                key={id}
                href={`/#${id}`}
                onClick={(e) => goToSection(e, id)}
                className={cx("flex h-10 items-center rounded-md px-2 text-sm text-fg hover:bg-zinc-100", focusRing)}
              >
                {label}
              </a>
            ))}
            <div className="my-1 border-t border-line-subtle" />
            {PAGE_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={cx("flex h-10 items-center rounded-md px-2 text-sm text-fg hover:bg-zinc-100", focusRing)}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-line px-4 py-4 sm:px-6 md:hidden">
            {currentUser ? (
              <>
                <div className="mb-1 flex items-center gap-3">
                  <Avatar src={userProfile?.photoURL} name={displayName} size="sm" />
                  <span className="min-w-0 truncate text-sm font-medium text-fg">{displayName}</span>
                </div>
                <ButtonLink to={panelPath} variant="secondary" size="lg" fullWidth>
                  Mi panel
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
