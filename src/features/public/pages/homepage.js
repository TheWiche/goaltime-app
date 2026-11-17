import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "shared/context/AuthContext";
import PublicLayout from "shared/components/layout/PublicLayout";
import { getHomePathForRole } from "shared/utils/url";
import HeroSection from "features/public/components/HeroSection";
import PlayersSection from "features/public/components/PlayersSection";
import OwnersSection from "features/public/components/OwnersSection";
import TestimonialsSection from "features/public/components/TestimonialsSection";
import ContactSection from "features/public/components/ContactSection";

function Homepage() {
  const { currentUser, userProfile, emailVerified, isSocialAuth, initialAuthLoading } = useAuth();
  const { state } = useLocation();
  const navigate = useNavigate();

  // DECISIÓN DE PRODUCTO PENDIENTE: hoy la home redirige a los usuarios con sesión a su panel
  // (verificados y con perfil). Si se quiere que puedan ver la home pública, basta con quitar este efecto.
  useEffect(() => {
    if (initialAuthLoading || !currentUser || !userProfile) return;
    if (currentUser.emailVerified || emailVerified || isSocialAuth) {
      navigate(getHomePathForRole(userProfile.role), { replace: true });
    }
  }, [initialAuthLoading, currentUser, userProfile, emailVerified, isSocialAuth, navigate]);

  // Navegación a una sección ancla desde otra página (state.scrollTo).
  const scrollTarget = state?.scrollTo;
  useEffect(() => {
    if (!scrollTarget) return;
    document.getElementById(scrollTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
    navigate("/", { replace: true, state: null });
  }, [scrollTarget, navigate]);

  return (
    <PublicLayout>
      <HeroSection />
      <PlayersSection />
      <OwnersSection />
      <TestimonialsSection />
      <ContactSection />
    </PublicLayout>
  );
}

export default Homepage;
