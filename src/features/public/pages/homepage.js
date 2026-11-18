import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import PublicLayout from "shared/components/layout/PublicLayout";
import Hero from "features/public/components/landing/Hero";
import HowItWorks from "features/public/components/landing/HowItWorks";
import Features from "features/public/components/landing/Features";
import Owners from "features/public/components/landing/Owners";
import TrustFlow from "features/public/components/landing/TrustFlow";
import Faq from "features/public/components/landing/Faq";
import FinalCta from "features/public/components/landing/FinalCta";
import Contact from "features/public/components/landing/Contact";
import { useReveal } from "features/public/components/landing/primitives";
import "features/public/landing.css";

const DOC_TITLE = "GoalTime · Reserva canchas de fútbol en Riohacha";

/**
 * Landing pública. Decisión de producto: NO redirige a los usuarios con sesión; el header
 * les ofrece "Ir a mi panel".
 */
function Homepage() {
  const { state, hash } = useLocation();
  const rootRef = useRef(null);

  useReveal(rootRef);

  useEffect(() => {
    const previous = document.title;
    document.title = DOC_TITLE;
    return () => {
      document.title = previous;
    };
  }, []);

  // Navegación a una sección desde otra página (state.scrollTo) o por URL con #ancla.
  // No se limpia el state: App.js vuelve arriba cuando cambia y anularía el desplazamiento.
  const scrollTarget = state?.scrollTo || (hash ? decodeURIComponent(hash.slice(1)) : null);
  useEffect(() => {
    if (!scrollTarget) return undefined;
    const frame = requestAnimationFrame(() => {
      document.getElementById(scrollTarget)?.scrollIntoView({ block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [scrollTarget]);

  return (
    <PublicLayout>
      <div ref={rootRef}>
        <Hero />
        <HowItWorks />
        <Features />
        <Owners />
        <TrustFlow />
        <Faq />
        <FinalCta />
        <Contact />
      </div>
    </PublicLayout>
  );
}

export default Homepage;
