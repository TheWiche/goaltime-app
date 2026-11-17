// src/app/App.js

import { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, matchPath, useLocation } from "react-router-dom";
import { Sidenav } from "shared/components/layout";
import routes from "app/routes";
import { useMaterialUIController, setMiniSidenav } from "shared/context";
import { useAuth } from "shared/context/AuthContext";
import brandDark from "assets/images/Logo.png";
import GlobalSettingsModal from "shared/components/notifications/GlobalSettingsModal";

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, sidenavColor } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const { pathname, state } = useLocation();
  const { userProfile } = useAuth();
  const role = userProfile?.role || null;

  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Al cambiar de ruta vuelve arriba, salvo que se navegue a una sección ancla (state.scrollTo).
  useEffect(() => {
    if (state?.scrollTo) return;
    window.scrollTo(0, 0);
  }, [pathname, state]);

  // Todas las rutas se registran siempre: el acceso lo imponen ProtectedRoute (sesión, email y
  // rol) y GuestRoute. Filtrar aquí por perfil provocaba rutas "inexistentes" mientras el
  // perfil cargaba (p. ej. verify-email justo tras el registro).
  const routeElements = useMemo(
    () => routes.map((route) => <Route key={route.key} path={route.route} element={route.component} />),
    []
  );

  // Menú lateral: lista blanca por rol (cada ruta declara los `roles` que la ven).
  const sidenavRoutes = useMemo(
    () => routes.filter((route) => route.type === "collapse" && role && route.roles?.includes(role)),
    [role]
  );

  // El Sidenav solo se muestra en rutas con layout "dashboard" y con perfil cargado.
  const activeRoute = useMemo(
    () => routes.find((route) => matchPath({ path: route.route, end: true }, pathname)),
    [pathname]
  );
  const showSidenav = Boolean(userProfile) && activeRoute?.layout === "dashboard";

  return (
    <>
      {showSidenav && (
        <Sidenav
          color={sidenavColor}
          brand={brandDark}
          brandName="GoalTime"
          routes={sidenavRoutes}
          onMouseEnter={handleOnMouseEnter}
          onMouseLeave={handleOnMouseLeave}
        />
      )}
      <Routes>
        {routeElements}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {userProfile && <GlobalSettingsModal />}
    </>
  );
}
