import { MDBox, MDTypography, MDButton, MDSnackbar } from "shared/components/md-shims";
// src/layouts/authentication/verify-email/index.js

import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, CircleCheck, RefreshCw } from "lucide-react";
import Spinner from "shared/components/ui/Spinner";
import SplitScreenLayout from "features/auth/components/SplitScreenLayout";
import bgImage from "assets/images/bg-sign-up-cover.png";
import { auth, resendVerificationEmail, verifyEmailWithCode } from "shared/services/firebaseService";
import { useAuth } from "shared/context/AuthContext";

function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerified, setIsVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [errorSB, setErrorSB] = useState(false);
  const [successSB, setSuccessSB] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const checkIntervalRef = useRef(null);
  const cooldownIntervalRef = useRef(null);
  const { userProfile, initialAuthLoading, currentUser } = useAuth();

  const openErrorSB = () => setErrorSB(true);
  const closeErrorSB = () => setErrorSB(false);
  const openSuccessSB = () => setSuccessSB(true);
  const closeSuccessSB = () => setSuccessSB(false);

  // Cargar cooldown desde localStorage
  useEffect(() => {
    if (currentUser) {
      const storedCooldown = localStorage.getItem(`emailCooldown_${currentUser.uid}`);
      const storedTime = localStorage.getItem(`emailCooldownTime_${currentUser.uid}`);

      if (storedCooldown && storedTime) {
        const elapsed = Math.floor((Date.now() - parseInt(storedTime)) / 1000);
        const remaining = Math.max(0, parseInt(storedCooldown) - elapsed);

        if (remaining > 0) {
          setCooldownSeconds(remaining);
        } else {
          localStorage.removeItem(`emailCooldown_${currentUser.uid}`);
          localStorage.removeItem(`emailCooldownTime_${currentUser.uid}`);
        }
      }
    }
  }, [currentUser]);

  // Verificar estado del email y procesar oobCode si existe
  useEffect(() => {
    if (initialAuthLoading) return;

    const checkVerification = async () => {
      // PRIMERO: Si hay un oobCode en la URL, procesarlo
      const oobCode = searchParams.get("oobCode") || searchParams.get("oobcode");
      const mode = searchParams.get("mode");

      if (oobCode && mode === "verifyEmail") {
        console.log("Procesando código de verificación desde URL");
        setIsChecking(true);

        try {
          await verifyEmailWithCode(oobCode);
          console.log("Email verificado exitosamente");

          // Limpiar la URL removiendo los parámetros
          window.history.replaceState({}, "", window.location.pathname);

          // Esperar un momento para que Firebase actualice el estado
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Recargar el usuario para obtener el estado actualizado
          const user = auth.currentUser;
          if (user) {
            await user.reload();
          }
        } catch (error) {
          console.error("Error verificando email con código:", error);
          setErrorMessage(
            "El enlace de verificación no es válido o ha expirado. Por favor, solicita uno nuevo."
          );
          openErrorSB();
          setIsChecking(false);
          return;
        }
      }

      const user = auth.currentUser;

      if (!user) {
        navigate("/authentication/sign-up", { replace: true });
        return;
      }

      setUserEmail(user.email || "");

      try {
        // Recargar usuario para obtener estado más reciente
        await user.reload();
        const verified = user.emailVerified;

        setIsVerified(verified);
        setIsChecking(false);

        if (verified) {
          setSuccessMessage("¡Email verificado exitosamente! Redirigiendo...");
          openSuccessSB();

          // IMPORTANTE: Esperar a que el perfil se cargue antes de redirigir
          // Si userProfile no está disponible, esperar un poco más
          const redirectWithRole = () => {
            if (userProfile?.role === "cliente") {
              navigate("/canchas", { replace: true });
            } else if (userProfile?.role) {
              navigate("/dashboard", { replace: true });
            } else {
              // Si no tenemos el perfil aún, redirigir a dashboard por defecto
              // El ProtectedRoute o Dashboard manejará la redirección correcta
              navigate("/dashboard", { replace: true });
            }
          };

          // Redirigir inmediatamente si tenemos el perfil, sino esperar un poco
          if (userProfile?.role) {
            setTimeout(redirectWithRole, 1000);
          } else {
            // Esperar un poco más para que se cargue el perfil
            setTimeout(redirectWithRole, 2000);
          }
          return;
        }

        // Si no está verificado, verificar periódicamente cada 2 segundos
        checkIntervalRef.current = setInterval(async () => {
          try {
            await user.reload();
            if (user.emailVerified) {
              setIsVerified(true);
              setIsChecking(false);
              setSuccessMessage("¡Email verificado exitosamente! Redirigiendo...");
              openSuccessSB();

              if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
              }

              const redirectWithRole = () => {
                if (userProfile?.role === "cliente") {
                  navigate("/canchas", { replace: true });
                } else if (userProfile?.role) {
                  navigate("/dashboard", { replace: true });
                } else {
                  // Si no tenemos el perfil aún, redirigir a dashboard por defecto
                  navigate("/dashboard", { replace: true });
                }
              };

              // Redirigir inmediatamente si tenemos el perfil, sino esperar un poco
              if (userProfile?.role) {
                setTimeout(redirectWithRole, 1000);
              } else {
                setTimeout(redirectWithRole, 2000);
              }
            }
          } catch (error) {
            console.error("Error verificando email:", error);
          }
        }, 2000);
      } catch (error) {
        console.error("Error verificando email:", error);
        setIsChecking(false);
      }
    };

    checkVerification();

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [initialAuthLoading, navigate, userProfile, searchParams]);

  // Cooldown timer
  useEffect(() => {
    if (cooldownSeconds > 0 && currentUser) {
      localStorage.setItem(`emailCooldown_${currentUser.uid}`, cooldownSeconds.toString());
      localStorage.setItem(`emailCooldownTime_${currentUser.uid}`, Date.now().toString());

      cooldownIntervalRef.current = setInterval(() => {
        setCooldownSeconds((prev) => {
          const newValue = prev <= 1 ? 0 : prev - 1;

          if (currentUser) {
            if (newValue === 0) {
              localStorage.removeItem(`emailCooldown_${currentUser.uid}`);
              localStorage.removeItem(`emailCooldownTime_${currentUser.uid}`);
            } else {
              localStorage.setItem(`emailCooldown_${currentUser.uid}`, newValue.toString());
            }
          }

          return newValue;
        });
      }, 1000);
    } else {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
        cooldownIntervalRef.current = null;
      }

      if (cooldownSeconds === 0 && currentUser) {
        localStorage.removeItem(`emailCooldown_${currentUser.uid}`);
        localStorage.removeItem(`emailCooldownTime_${currentUser.uid}`);
      }
    }

    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, [cooldownSeconds, currentUser]);

  const handleResendEmail = async () => {
    if (cooldownSeconds > 0) {
      setErrorMessage(
        `Por favor, espera ${cooldownSeconds} segundo${
          cooldownSeconds !== 1 ? "s" : ""
        } antes de solicitar otro email.`
      );
      openErrorSB();
      return;
    }

    setIsResending(true);
    try {
      await resendVerificationEmail();
      setSuccessMessage("Email de verificación reenviado. Revisa tu bandeja de entrada.");
      openSuccessSB();
      setCooldownSeconds(60);
    } catch (error) {
      let message = error.message || "Error al reenviar el email. Por favor, inténtalo más tarde.";

      if (error.code === "auth/too-many-requests") {
        setCooldownSeconds(300);
        message =
          "Has enviado demasiados emails. Por favor, espera 5 minutos antes de intentar nuevamente.";
      } else if (error.code === "auth/unauthorized-continue-uri") {
        message = `El dominio no está autorizado en Firebase. Por favor, agrega "${window.location.hostname}" en Firebase Console > Authentication > Settings > Authorized domains.`;
      } else {
        setCooldownSeconds(60);
      }

      setErrorMessage(message);
      openErrorSB();
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToSignIn = () => {
    navigate("/authentication/sign-in");
  };

  // Right Panel Content
  const rightContent = (
    <MDBox
      width="100%"
      height="100%"
      sx={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        p: 4,
      }}
    >
      <MDBox sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <Mail className="mx-auto mb-4 h-20 w-20 text-white opacity-90" strokeWidth={1.5} aria-hidden />
        <MDTypography variant="h3" fontWeight="bold" color="white" mb={2}>
          Verifica tu Email
        </MDTypography>
        <MDTypography variant="body1" color="white" sx={{ opacity: 0.9, maxWidth: "300px" }}>
          Hemos enviado un enlace de verificación a tu correo electrónico. Haz clic en el enlace
          para completar tu registro.
        </MDTypography>
      </MDBox>
    </MDBox>
  );

  // Left Panel Content
  const leftContent = (
    <MDBox
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      px={{ xs: 3, sm: 6, md: 8 }}
      py={4}
      sx={{ position: "relative" }}
    >
      <MDBox maxWidth="480px" mx="auto" width="100%">
        {isChecking ? (
          <>
            <MDBox display="flex" justifyContent="center" mb={3}>
              <Spinner size="lg" className="border-primary" />
            </MDBox>
            <MDTypography variant="h4" fontWeight="bold" color="dark" mb={2} textAlign="center">
              Verificando...
            </MDTypography>
            <MDTypography variant="body1" color="text" mb={3} textAlign="center">
              Estamos verificando el estado de tu email. Por favor, espera un momento.
            </MDTypography>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-2/5 animate-pulse rounded-full bg-primary" />
            </div>
          </>
        ) : isVerified ? (
          <>
            <MDBox display="flex" justifyContent="center" mb={3}>
              <CircleCheck className="mx-auto h-20 w-20 text-emerald-600" strokeWidth={1.5} aria-hidden />
            </MDBox>
            <MDTypography variant="h4" className="mb-2 text-center font-bold text-emerald-600">
              ¡Email Verificado!
            </MDTypography>
            <MDTypography variant="body1" color="text" mb={4} textAlign="center">
              Tu email ha sido verificado exitosamente. Serás redirigido en breve...
            </MDTypography>
          </>
        ) : (
          <>
            <MDBox display="flex" justifyContent="center" mb={3}>
              <Mail className="mx-auto h-20 w-20 text-primary" strokeWidth={1.5} aria-hidden />
            </MDBox>
            <MDTypography variant="h4" fontWeight="bold" color="dark" mb={2} textAlign="center">
              Verifica tu Email
            </MDTypography>
            <MDTypography variant="body1" color="text" mb={3} textAlign="center">
              Hemos enviado un enlace de verificación a:
            </MDTypography>
            <div className="mb-3 rounded-xl border border-slate-300 bg-slate-100 p-4">
              <MDTypography variant="body1" className="text-center font-medium text-slate-900">
                {userEmail}
              </MDTypography>
            </div>
            <MDTypography variant="body2" color="text" mb={4} textAlign="center">
              Haz clic en el enlace del email para verificar tu cuenta. Esta página se actualizará
              automáticamente cuando verifiques tu email.
            </MDTypography>

            <MDButton
              variant="outlined"
              fullWidth
              onClick={handleResendEmail}
              disabled={isResending || cooldownSeconds > 0}
              className="mb-2 inline-flex w-full items-center justify-center gap-2 border-primary py-3 text-primary normal-case hover:bg-primary/10 disabled:border-slate-300 disabled:text-slate-500"
            >
              {isResending ? <Spinner size="sm" /> : <RefreshCw className="h-4 w-4 shrink-0" aria-hidden />}
              {isResending
                ? "Reenviando..."
                : cooldownSeconds > 0
                ? `Espera ${cooldownSeconds}s antes de reenviar`
                : "Reenviar Email de Verificación"}
            </MDButton>

            <MDButton
              variant="text"
              fullWidth
              onClick={handleGoToSignIn}
              className="normal-case text-slate-600 hover:bg-transparent hover:underline"
            >
              Ya verifiqué mi email, ir a iniciar sesión
            </MDButton>
          </>
        )}

        {!isVerified && !isChecking && (
          <div className="mt-6 rounded-xl border border-primary-200 bg-primary-50 p-4">
            <MDTypography variant="caption" className="mb-1 block font-medium text-primary-900">
              <strong>¿No recibiste el email?</strong>
            </MDTypography>
            <MDTypography variant="caption" className="text-primary-900/90">
              • Revisa tu carpeta de spam o correo no deseado
              <br />• Asegúrate de que el email sea correcto
              <br />• Espera unos minutos y haz clic en &quot;Reenviar Email de Verificación&quot;
            </MDTypography>
          </div>
        )}
      </MDBox>

      <MDSnackbar
        color="error"
        icon="warning"
        title="Error"
        content={errorMessage}
        dateTime="justo ahora"
        open={errorSB}
        onClose={closeErrorSB}
        close={closeErrorSB}
        bgWhite
      />
      <MDSnackbar
        color="success"
        icon="check"
        title="Éxito"
        content={successMessage}
        dateTime="justo ahora"
        open={successSB}
        onClose={closeSuccessSB}
        close={closeSuccessSB}
        bgWhite
      />
    </MDBox>
  );

  return (
    <SplitScreenLayout
      leftContent={leftContent}
      rightContent={rightContent}
      leftWidth="60%"
      rightWidth="40%"
      showLeftOnMobile={true}
    />
  );
}

export default VerifyEmail;
