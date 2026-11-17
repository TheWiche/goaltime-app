// src/shared/components/routing/ProtectedRoute.js

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "shared/context/AuthContext";
import { FullScreenLoader } from "shared/components/loaders/FullScreenLoader";
import { getHomePathForRole } from "shared/utils/url";

/**
 * Ruta protegida.
 * - Sin sesión → /authentication/sign-in (con state.from).
 * - Email sin verificar (no social) → /authentication/verify-email.
 * - `roles` (opcional): si el rol del perfil no está incluido → home del rol
 *   (admin/asociado → /dashboard, cliente → /canchas).
 * NOTA: esto es solo UX; la autorización real la imponen firestore.rules y las Functions.
 */
function ProtectedRoute({ children, roles }) {
  const { currentUser, userProfile, emailVerified, isSocialAuth, initialAuthLoading } = useAuth();
  const location = useLocation();

  if (initialAuthLoading) return <FullScreenLoader />;

  if (!currentUser) {
    return <Navigate to="/authentication/sign-in" state={{ from: location }} replace />;
  }

  const isEmailVerified = currentUser.emailVerified || emailVerified;
  if (!isEmailVerified && !isSocialAuth) {
    return <Navigate to="/authentication/verify-email" state={{ from: location }} replace />;
  }

  if (Array.isArray(roles) && roles.length > 0) {
    const role = userProfile?.role || null;
    if (!role || !roles.includes(role)) {
      const home = getHomePathForRole(role);
      // Evita bucles si la home del rol es justo esta ruta.
      return <Navigate to={home === location.pathname ? "/" : home} replace />;
    }
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  roles: PropTypes.arrayOf(PropTypes.oneOf(["admin", "asociado", "cliente"])),
};

export default ProtectedRoute;
