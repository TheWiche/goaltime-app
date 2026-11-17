// src/shared/components/routing/GuestRoute.js

import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "shared/context/AuthContext";
import { FullScreenLoader } from "shared/components/loaders/FullScreenLoader";
import { getHomePathForRole } from "shared/utils/url";

const VERIFY_EMAIL_PATH = "/authentication/verify-email";
const SIGN_UP_PATH = "/authentication/sign-up";
// Tras login social el perfil se crea justo después del evento de auth: se espera
// un poco antes de considerar que el perfil "no existe".
const PROFILE_GRACE_MS = 3000;

/**
 * Ruta solo para invitados (sign-in, sign-up, reset...).
 * - Nunca devuelve pantalla en blanco: muestra FullScreenLoader mientras espera.
 * - `allowAuthenticated`: renderiza siempre (p.ej. confirmar reset de contraseña desde el
 *   enlace del correo aunque haya una sesión abierta).
 * - verify-email y sign-up se muestran aunque haya sesión (gestionan su propia redirección).
 * - Con sesión y email verificado → home del rol; perfil ausente de forma permanente → /canchas.
 */
function GuestRoute({ children, allowAuthenticated = false }) {
  const { currentUser, userProfile, emailVerified, isSocialAuth, initialAuthLoading } = useAuth();
  const location = useLocation();
  const [profileTimedOut, setProfileTimedOut] = useState(false);

  const isVerifyEmailPage = location.pathname === VERIFY_EMAIL_PATH;
  const isSignUpPage = location.pathname === SIGN_UP_PATH;
  const passthrough = allowAuthenticated || isVerifyEmailPage || isSignUpPage;
  const isEmailVerified = Boolean(currentUser && (currentUser.emailVerified || emailVerified));
  const waitingProfile =
    !initialAuthLoading &&
    !passthrough &&
    Boolean(currentUser) &&
    (isEmailVerified || isSocialAuth) &&
    !userProfile;

  useEffect(() => {
    if (!waitingProfile) {
      setProfileTimedOut(false);
      return undefined;
    }
    const t = setTimeout(() => setProfileTimedOut(true), PROFILE_GRACE_MS);
    return () => clearTimeout(t);
  }, [waitingProfile]);

  if (initialAuthLoading) return <FullScreenLoader />;
  if (!currentUser || passthrough) return children;

  if (!isEmailVerified && !isSocialAuth) {
    return <Navigate to={VERIFY_EMAIL_PATH} replace />;
  }

  if (userProfile) {
    return <Navigate to={getHomePathForRole(userProfile.role)} replace />;
  }

  return profileTimedOut ? <Navigate to="/canchas" replace /> : <FullScreenLoader />;
}

GuestRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowAuthenticated: PropTypes.bool,
};

export default GuestRoute;
