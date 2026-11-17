// src/shared/context/AuthContext.js

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import PropTypes from "prop-types";
import { auth, db } from "shared/services/firebaseApp";
import { FullScreenLoader } from "shared/components/loaders/FullScreenLoader";
import { logger } from "shared/utils/logger";

const AuthContext = createContext(null);
AuthContext.displayName = "AuthContext";

const SOCIAL_PROVIDERS = ["google.com", "facebook.com"];
const VERIFICATION_POLL_MS = 5000;

/** true si el usuario inició sesión con Google/Facebook (no requiere verificar email). */
export const isSocialAuthUser = (user) =>
  Boolean(user?.providerData?.some((p) => SOCIAL_PROVIDERS.includes(p.providerId)));

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
  }
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [initialAuthLoading, setInitialAuthLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // 1) Estado de auth + perfil en tiempo real.
  useEffect(() => {
    // Contador de ejecución: descarta resultados de un usuario anterior (logout/login rápido).
    let runId = 0;
    let unsubscribeProfile = null;

    const stopProfile = () => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      runId += 1;
      const myRun = runId;
      stopProfile();

      setCurrentUser(user);
      // Valor inmediato; el reload() se hace fuera del camino crítico (efecto 2).
      setEmailVerified(Boolean(user?.emailVerified));

      if (!user) {
        setUserProfile(null);
        setInitialAuthLoading(false);
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      const finish = (snap) => {
        if (myRun !== runId) return;
        setUserProfile(snap && snap.exists() ? { uid: snap.id, ...snap.data() } : null);
        setInitialAuthLoading(false);
      };

      unsubscribeProfile = onSnapshot(userDocRef, finish, (error) => {
        // p.ej. extensiones que bloquean el canal en tiempo real: intento único con getDoc.
        logger.warn("AuthContext: listener de perfil falló, usando getDoc", error);
        getDoc(userDocRef)
          .then(finish)
          .catch((fallbackError) => {
            logger.error("AuthContext: no se pudo leer el perfil", fallbackError);
            finish(null);
          });
      });
    });

    return () => {
      runId += 1;
      unsubscribeAuth();
      stopProfile();
    };
  }, []);

  // 2) Mientras el email NO esté verificado (solo email/contraseña), recargar periódicamente.
  //    El intervalo se limpia en cuanto se verifica, al cambiar de usuario o al desmontar.
  useEffect(() => {
    if (!currentUser || emailVerified || isSocialAuthUser(currentUser)) return undefined;

    let cancelled = false;
    let interval = null;

    const stop = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const check = async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        await currentUser.reload();
      } catch (error) {
        logger.debug("AuthContext: reload falló", error);
      }
      if (cancelled || auth.currentUser?.uid !== currentUser.uid) return;
      if (currentUser.emailVerified) {
        stop();
        setEmailVerified(true);
        // Token nuevo con email_verified=true.
        currentUser.getIdToken(true).catch(() => {});
      }
    };

    check();
    interval = setInterval(check, VERIFICATION_POLL_MS);

    return () => {
      cancelled = true;
      stop();
    };
  }, [currentUser, emailVerified]);

  /** Recarga el usuario bajo demanda (p.ej. botón "Ya verifiqué mi correo"). */
  const refreshEmailVerification = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return false;
    try {
      await user.reload();
    } catch (error) {
      logger.debug("refreshEmailVerification: reload falló", error);
    }
    setEmailVerified(Boolean(user.emailVerified));
    return Boolean(user.emailVerified);
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      userProfile,
      role: userProfile?.role || null,
      emailVerified,
      isSocialAuth: isSocialAuthUser(currentUser),
      initialAuthLoading,
      isActionLoading,
      setIsActionLoading,
      refreshEmailVerification,
    }),
    [
      currentUser,
      userProfile,
      emailVerified,
      initialAuthLoading,
      isActionLoading,
      refreshEmailVerification,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {/* Overlay solo para acciones del usuario */}
      {isActionLoading && <FullScreenLoader />}
      {/* Carga inicial bloqueante */}
      {initialAuthLoading ? <FullScreenLoader /> : children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
