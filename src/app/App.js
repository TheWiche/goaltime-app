// src/app/App.js

import { useState, useEffect, useMemo } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Sidenav } from "shared/components/layout";
import routes from "app/routes";
import { useMaterialUIController, setMiniSidenav } from "shared/context";
import { useAuth } from "shared/context/AuthContext";
import brandDark from "assets/images/Logo.png";
import GlobalSettingsModal from "shared/components/notifications/GlobalSettingsModal";

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    sidenavColor,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const { pathname } = useLocation();
  const { userProfile } = useAuth(); // AuthContext maneja el estado de carga inicial

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

  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  // Tu lógica de filteredRoutes está PERFECTA. No la cambiamos.
  const filteredRoutes = useMemo(() => {
    const publicKeys = [
      "homepage", // Asegúrate de que tu ruta "/" tenga key: "homepage" en routes.js
      "about-us",
      "blog",
      "license",
      "become-associate",
      "privacy-policy",
      "terms-of-service",
    ];

    if (!userProfile) {
      return routes.filter(
        (route) =>
          publicKeys.includes(route.key) ||
          route.key === "sign-in" ||
          route.key === "sign-up" ||
          route.key === "reset-password" ||
          route.key === "confirm-reset-password" ||
          route.key === "handle-firebase-action"
      );
    }

    let userRoutes = routes.filter(
      (route) =>
        route.key !== "sign-in" &&
        route.key !== "sign-up" &&
        route.key !== "rtl" &&
        route.key !== "reset-password" &&
        route.key !== "confirm-reset-password" &&
        route.key !== "handle-firebase-action"
    );

    if (userProfile.role === "cliente") {
      userRoutes = userRoutes.filter(
        (route) =>
          route.key !== "dashboard" &&
          route.key !== "admin-users" &&
          route.key !== "admin-fields" &&
          route.key !== "associate-fields" &&
          route.key !== "associate-reservations"
      );
    } else if (userProfile.role === "asociado") {
      userRoutes = userRoutes.filter(
        (route) =>
          route.key !== "admin-users" &&
          route.key !== "admin-fields" &&
          route.key !== "reservations"
      );
    } else if (userProfile.role === "admin") {
      // admin-fields ya no se muestra en el menú, la funcionalidad está en "Canchas"
      userRoutes = userRoutes.filter(
        (route) =>
          route.key !== "associate-fields" &&
          route.key !== "admin-fields" &&
          route.key !== "associate-reservations" &&
          route.key !== "reservations"
      );
    }

    return userRoutes;
  }, [userProfile]); // El 'userProfile' es provisto por AuthContext después de la carga inicial

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }
      if (route.route) {
        // React Router v6 no usa 'exact', las rutas se hacen coincidir automáticamente
        return <Route path={route.route} element={route.component} key={route.key} />;
      }
      return null;
    });

  // Determinar si se debe mostrar el sidebar
  // Solo mostrar en rutas protegidas del dashboard, excluyendo páginas públicas y de autenticación
  const shouldHideSidenav =
    pathname === "/" ||
    pathname.includes("/authentication") ||
    pathname.includes("/__/auth") ||
    pathname.includes("/politica-de-privacidad") ||
    pathname.includes("/terminos-y-condiciones") ||
    pathname.includes("/sobre-nosotros") ||
    pathname.includes("/blog") ||
    pathname.includes("/licencia") ||
    pathname.includes("/convertirse-en-asociado");

  const showSidenav = layout === "dashboard" && !shouldHideSidenav && userProfile;

  return (
    <>
      {showSidenav && (
        <Sidenav
          color={sidenavColor}
          brand={brandDark}
          brandName="GoalTime"
          routes={filteredRoutes.filter((route) => route.type === "collapse")}
          onMouseEnter={handleOnMouseEnter}
          onMouseLeave={handleOnMouseLeave}
        />
      )}
      <Routes>
        {getRoutes(filteredRoutes)}

        {/* Redirección catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {/* Modal de configuración global */}
      {userProfile && <GlobalSettingsModal />}
    </>
  );
}
