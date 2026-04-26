// src/context/AuthContext.js

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "shared/services/firebaseService";
import PropTypes from "prop-types";
import { FullScreenLoader } from "shared/components/loaders/FullScreenLoader";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [initialAuthLoading, setInitialAuthLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    let unsubscribeProfile = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setCurrentUser(user);

        // Actualizar estado de verificación del email
        if (user) {
          // Recargar el usuario para obtener el estado más reciente
          try {
            await user.reload();
            setEmailVerified(user.emailVerified);
          } catch (error) {
            console.error("Error recargando usuario:", error);
            setEmailVerified(user.emailVerified);
          }
        } else {
          setEmailVerified(false);
        }

        // Limpiar listener anterior si existe
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }

        if (user) {
          const userDocRef = doc(db, "users", user.uid);

          // Usar listener en tiempo real para actualizaciones automáticas
          unsubscribeProfile = onSnapshot(
            userDocRef,
            (userDocSnap) => {
              if (userDocSnap.exists()) {
                setUserProfile(userDocSnap.data());
              } else {
                setUserProfile(null);
              }
              setInitialAuthLoading(false);
            },
            (error) => {
              // Ignorar errores de bloqueo por cliente (extensiones del navegador)
              if (
                error.code === "unavailable" ||
                error.message?.includes("ERR_BLOCKED_BY_CLIENT")
              ) {
                console.warn(
                  "Firestore bloqueado por extensión del navegador. Intentando obtener perfil de forma alternativa..."
                );
                // Intentar obtener el perfil de forma alternativa (una sola vez)
                getDoc(userDocRef)
                  .then((docSnap) => {
                    if (docSnap.exists()) {
                      setUserProfile(docSnap.data());
                    } else {
                      setUserProfile(null);
                    }
                    setInitialAuthLoading(false);
                  })
                  .catch((fallbackError) => {
                    console.error("Error al obtener perfil (fallback):", fallbackError);
                    setUserProfile(null);
                    setInitialAuthLoading(false);
                  });
                return;
              }
              console.error("Error al obtener el perfil de usuario:", error);
              setUserProfile(null);
              setInitialAuthLoading(false);
            }
          );
        } else {
          setUserProfile(null);
          setInitialAuthLoading(false);
        }
      } catch (error) {
        console.error("Error al obtener el perfil de usuario:", error);
        setUserProfile(null);
        setInitialAuthLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  // Actualizar emailVerified cuando el usuario cambia
  useEffect(() => {
    if (currentUser) {
      // Recargar el usuario periódicamente para obtener el estado más reciente de verificación
      const checkVerification = async () => {
        try {
          await currentUser.reload();
          const verified = currentUser.emailVerified;
          setEmailVerified(verified);
        } catch (error) {
          // Ignorar errores de red silenciosamente (pueden ser bloqueadores de anuncios)
          if (
            !error.message?.includes("ERR_BLOCKED_BY_CLIENT") &&
            !error.code?.includes("network")
          ) {
            console.error("Error recargando usuario:", error);
          }
          // Si falla el reload, usar el valor actual
          setEmailVerified(currentUser.emailVerified);
        }
      };

      // Verificar inmediatamente
      checkVerification();

      // Verificar cada 5 segundos si no está verificado (reducir frecuencia para evitar errores)
      const interval = currentUser.emailVerified ? null : setInterval(checkVerification, 5000);

      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    } else {
      setEmailVerified(false);
    }
  }, [currentUser]);

  const value = {
    currentUser,
    userProfile,
    emailVerified,
    initialAuthLoading,
    isActionLoading,
    setIsActionLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* 👇 LA LÓGICA HÍBRIDA DEFINITIVA 👇 */}

      {/* 1. Muestra el loader como overlay SOLO para acciones del usuario */}
      {isActionLoading && <FullScreenLoader />}

      {/* 2. Muestra el loader de forma bloqueante en la carga inicial, 
         o muestra la app si ya terminó. */}
      {initialAuthLoading ? <FullScreenLoader /> : children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
