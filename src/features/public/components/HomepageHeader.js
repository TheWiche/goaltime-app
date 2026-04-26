import { useState, useEffect, useRef } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import logo from "assets/images/Logo.png";
import { useAuth } from "shared/context/AuthContext";
import { logoutUser } from "shared/services/firebaseService";

const navLinks = ["jugadores", "duenos", "testimonios", "contacto"];
const navLabels = { jugadores: "Jugadores", duenos: "Dueños", testimonios: "Testimonios", contacto: "Contáctanos" };

function HomepageHeader({ light: initialLight }) {
  const { userProfile, currentUser } = useAuth();
  const [navbar, setNavbar] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const { pathname } = useLocation();
  const isHomepage = pathname === "/";
  const isScrolled = initialLight || navbar;

  useEffect(() => {
    const onChange = () => {
      if (isHomepage) setNavbar(window.scrollY >= 80);
      else setNavbar(true);
    };
    onChange();
    window.addEventListener("scroll", onChange);
    return () => window.removeEventListener("scroll", onChange);
  }, [isHomepage, pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  const handleLogout = () => {
    setAccountOpen(false);
    logoutUser();
  };

  const initial = userProfile?.name?.[0]?.toUpperCase() ?? "U";

  return (
    <>
      <header
        className={[
          "sticky top-0 z-40 w-full transition-all duration-300",
          isScrolled ? "bg-white shadow-card" : isHomepage ? "bg-transparent" : "bg-white shadow-card",
        ].join(" ")}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            {/* Hamburger (mobile) */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-dark hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo */}
            <RouterLink to="/" className="flex items-center gap-2">
              <img src={logo} alt="GoalTime Logo" className="w-8 h-8 object-contain" />
              <span className="hidden sm:block font-bold text-dark text-lg">GoalTime</span>
            </RouterLink>

            {/* Nav links (desktop) */}
            {isHomepage && (
              <nav className="hidden lg:flex items-center gap-1">
                {navLinks.map((id) => (
                  <button
                    key={id}
                    onClick={() => scrollTo(id)}
                    className="px-3 py-2 text-sm font-medium text-dark hover:text-goaltime rounded-lg hover:bg-goaltime-50 transition-colors"
                  >
                    {navLabels[id]}
                  </button>
                ))}
              </nav>
            )}

            {/* Auth / Avatar */}
            <div className="hidden md:flex items-center gap-2">
              {currentUser ? (
                <div className="relative" ref={accountRef}>
                  <button
                    onClick={() => setAccountOpen((o) => !o)}
                    className="w-9 h-9 rounded-full bg-goaltime-100 text-goaltime-700 font-bold flex items-center justify-center overflow-hidden border-2 border-goaltime-200 hover:border-goaltime transition-colors"
                  >
                    {userProfile?.photoURL ? (
                      <img src={userProfile.photoURL} alt={userProfile.name} className="w-full h-full object-cover" />
                    ) : (
                      initial
                    )}
                  </button>
                  {accountOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-100 shadow-card-hover overflow-hidden z-50">
                      <RouterLink
                        to={userProfile?.role === "cliente" ? "/canchas" : "/dashboard"}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-dark hover:bg-gray-50 transition-colors"
                        onClick={() => setAccountOpen(false)}
                      >
                        Mi Panel
                      </RouterLink>
                      <RouterLink
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-dark hover:bg-gray-50 transition-colors"
                        onClick={() => setAccountOpen(false)}
                      >
                        Mi Perfil
                      </RouterLink>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <RouterLink
                    to="/authentication/sign-in"
                    className="px-4 py-2 text-sm font-semibold text-goaltime border-2 border-goaltime rounded-xl hover:bg-goaltime-50 transition-colors"
                  >
                    Iniciar Sesión
                  </RouterLink>
                  <RouterLink
                    to="/authentication/sign-up"
                    className="px-4 py-2 text-sm font-semibold text-white bg-goaltime hover:bg-goaltime-500 rounded-xl shadow-goaltime transition-all"
                  >
                    Registrarse
                  </RouterLink>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 bg-white h-full shadow-xl flex flex-col p-5 overflow-y-auto animate-slide-up">
            {/* Header drawer */}
            <div className="flex items-center justify-between mb-6">
              <RouterLink to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                <img src={logo} alt="GoalTime" className="w-8 h-8" />
                <span className="font-bold text-dark text-lg">GoalTime</span>
              </RouterLink>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* User info */}
            {currentUser && (
              <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-goaltime-100 text-goaltime-700 font-bold flex items-center justify-center flex-shrink-0">
                  {initial}
                </div>
                <span className="font-medium text-dark text-sm truncate">{userProfile?.name || "Usuario"}</span>
              </div>
            )}

            {/* Nav links */}
            {isHomepage && (
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Navegación</p>
                {navLinks.map((id) => (
                  <button
                    key={id}
                    onClick={() => scrollTo(id)}
                    className="w-full text-left px-3 py-2.5 text-sm text-dark hover:bg-goaltime-50 hover:text-goaltime rounded-lg transition-colors"
                  >
                    {navLabels[id]}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-auto flex flex-col gap-2">
              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 px-4 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors"
                >
                  Cerrar Sesión
                </button>
              ) : (
                <>
                  <RouterLink
                    to="/authentication/sign-in"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center py-2.5 px-4 border-2 border-goaltime text-goaltime rounded-xl font-semibold text-sm hover:bg-goaltime-50 transition-colors"
                  >
                    Iniciar Sesión
                  </RouterLink>
                  <RouterLink
                    to="/authentication/sign-up"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center py-2.5 px-4 bg-goaltime text-white rounded-xl font-semibold text-sm hover:bg-goaltime-500 transition-colors"
                  >
                    Registrarse
                  </RouterLink>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

HomepageHeader.defaultProps = { light: false };
HomepageHeader.propTypes = { light: PropTypes.bool };

export default HomepageHeader;
