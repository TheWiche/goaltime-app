import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Stagger entrance de cards en scroll. Devuelve container ref.
 * Versión mejorada con wave effect más pronunciado.
 */
export function useFieldCardsStagger(selector) {
  const containerRef = useRef(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray(selector, containerRef.current);
      if (!cards.length) return;
      
      // Check reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      if (prefersReducedMotion) {
        gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
        return;
      }
      
      gsap.set(cards, { opacity: 0, y: 60, scale: 0.9, willChange: "transform, opacity" });
      
      ScrollTrigger.batch(cards, {
        start: "top 90%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            stagger: 0.15,
            ease: "power3.out",
            clearProps: "all"
          }),
      });
    },
    { scope: containerRef, dependencies: [selector] }
  );

  return containerRef;
}

/**
 * Micro-interacción hover/press en botón. Devuelve ref.
 */
export function useReserveButtonPulse() {
  const btnRef = useRef(null);

  useGSAP(
    (_, contextSafe) => {
      const btn = btnRef.current;
      if (!btn) return;
      const onEnter = contextSafe(() => gsap.to(btn, { scale: 1.05, duration: 0.18, ease: "power1.out" }));
      const onLeave = contextSafe(() => gsap.to(btn, { scale: 1, duration: 0.22, ease: "power1.inOut" }));
      const onDown = contextSafe(() => gsap.to(btn, { scale: 0.96, duration: 0.1, ease: "power1.in" }));
      const onUp = contextSafe(() => gsap.to(btn, { scale: 1.04, duration: 0.12, ease: "power1.out" }));

      btn.addEventListener("mouseenter", onEnter);
      btn.addEventListener("mouseleave", onLeave);
      btn.addEventListener("mousedown", onDown);
      btn.addEventListener("mouseup", onUp);
      return () => {
        btn.removeEventListener("mouseenter", onEnter);
        btn.removeEventListener("mouseleave", onLeave);
        btn.removeEventListener("mousedown", onDown);
        btn.removeEventListener("mouseup", onUp);
      };
    },
    { scope: btnRef }
  );

  return btnRef;
}

/**
 * Fade + slide-up de sección al entrar viewport.
 */
export function useSectionEntrance(opts = {}) {
  const { delay = 0, y = 30, duration = 0.6 } = opts;
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      const el = sectionRef.current;
      if (!el) return;
      gsap.from(el, {
        opacity: 0,
        y,
        duration,
        delay,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    },
    { scope: sectionRef }
  );

  return sectionRef;
}

/**
 * Timeline maestro de entrada del hero. Anima por data-hero=`badge|title|subtitle|cta|stats|decor`.
 * Respeta prefers-reduced-motion.
 */
export function useHeroTimeline() {
  const heroRef = useRef(null);

  useGSAP(
    () => {
      const root = heroRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          isReduced: "(prefers-reduced-motion: reduce)",
          isMotion: "(prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          const { isReduced } = ctx.conditions;
          if (isReduced) {
            gsap.set(root.querySelectorAll("[data-hero]"), { opacity: 1, y: 0, scale: 1 });
            return;
          }

          const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
          tl.from('[data-hero="badge"]', { opacity: 0, y: -20, scale: 0.85, duration: 0.55, ease: "back.out(1.6)" })
            .from('[data-hero="title"] .word', { opacity: 0, y: 40, stagger: 0.08, duration: 0.7 }, "-=0.2")
            .from('[data-hero="subtitle"]', { opacity: 0, y: 20, duration: 0.55 }, "-=0.35")
            .from('[data-hero="cta"]', { opacity: 0, y: 24, scale: 0.94, duration: 0.5, stagger: 0.1 }, "-=0.3")
            .from('[data-hero="stat"]', { opacity: 0, y: 28, duration: 0.5, stagger: 0.12 }, "-=0.25")
            .from('[data-hero="decor"]', { opacity: 0, scale: 0.6, duration: 0.9, ease: "elastic.out(1, 0.6)" }, "-=0.6");
        },
        root
      );
    },
    { scope: heroRef }
  );

  return heroRef;
}

/**
 * Loop flotante (decoraciones balones, etc.). Aplica a elementos con data-float.
 * Cada elemento flota distinto por offset random.
 */
export function useFloatingDecor() {
  const ref = useRef(null);

  useGSAP(
    () => {
      const items = gsap.utils.toArray("[data-float]", ref.current);
      items.forEach((el) => {
        const dur = 3 + Math.random() * 3;
        const yAmp = 15 + Math.random() * 20;
        const rotAmp = 8 + Math.random() * 12;
        gsap.to(el, {
          y: `+=${yAmp}`,
          rotation: `+=${rotAmp}`,
          duration: dur,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      });
    },
    { scope: ref }
  );

  return ref;
}

/**
 * Anima contador numérico de 0 → target cuando entra al viewport.
 * Adjunta a span con ref que devuelve. Pasa target y formato opcional.
 */
export function useNumberCount(target, formatter = (n) => Math.round(n).toLocaleString()) {
  const elRef = useRef(null);

  useGSAP(
    () => {
      const el = elRef.current;
      if (!el) return;
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1.8,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
        onUpdate: () => {
          el.textContent = formatter(obj.val);
        },
      });
    },
    { scope: elRef, dependencies: [target] }
  );

  return elRef;
}

/**
 * Dibuja paths SVG (pitch markings). Aplica a paths con data-draw.
 */
export function usePitchDraw() {
  const ref = useRef(null);

  useGSAP(
    () => {
      const paths = gsap.utils.toArray("[data-draw]", ref.current);
      paths.forEach((p) => {
        const len = p.getTotalLength?.() ?? 1000;
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.to(paths, {
        strokeDashoffset: 0,
        duration: 1.6,
        stagger: 0.1,
        ease: "power2.inOut",
        delay: 0.2,
      });
    },
    { scope: ref }
  );

  return ref;
}

/**
 * Parallax suave en scroll. Adjunta a elemento con data-parallax y atributo data-speed (default 0.3).
 */
export function useParallax() {
  const ref = useRef(null);

  useGSAP(
    () => {
      const items = gsap.utils.toArray("[data-parallax]", ref.current);
      items.forEach((el) => {
        const speed = parseFloat(el.dataset.speed) || 0.3;
        gsap.to(el, {
          y: () => -window.innerHeight * speed,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    },
    { scope: ref }
  );

  return ref;
}

/**
 * Card Tilt 3D Effect - Las tarjetas siguen el mouse con perspectiva 3D.
 * Solo funciona en desktop (no touch devices).
 */
export function useCardTilt() {
  const cardRef = useRef(null);
  
  useGSAP(
    (_, contextSafe) => {
      const card = cardRef.current;
      if (!card) return;
      
      // Detectar touch device
      const isTouchDevice = 'ontouchstart' in window;
      if (isTouchDevice) return;
      
      const handleMouseMove = contextSafe((e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        gsap.to(card, {
          rotateX: rotateX,
          rotateY: rotateY,
          transformPerspective: 1000,
          duration: 0.4,
          ease: "power2.out"
        });
      });
      
      const handleMouseLeave = contextSafe(() => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.4)"
        });
      });
      
      card.addEventListener("mousemove", handleMouseMove);
      card.addEventListener("mouseleave", handleMouseLeave);
      
      return () => {
        card.removeEventListener("mousemove", handleMouseMove);
        card.removeEventListener("mouseleave", handleMouseLeave);
      };
    },
    { scope: cardRef }
  );
  
  return cardRef;
}

/**
 * Empty State animado - SVG y texto aparecen con animación secuencial.
 */
export function useEmptyState() {
  const ref = useRef(null);
  
  useGSAP(() => {
    const root = ref.current;
    if (!root) return;
    
    const svg = root.querySelector("svg");
    const heading = root.querySelector("h3");
    const paragraph = root.querySelector("p");
    const button = root.querySelector("button");
    
    const tl = gsap.timeline();
    
    if (svg) {
      tl.from(svg, {
        scale: 0,
        rotation: -180,
        duration: 0.8,
        ease: "back.out(1.7)"
      });
    }
    
    if (heading) {
      tl.from(heading, {
        opacity: 0,
        y: 20,
        duration: 0.5
      }, "-=0.3");
    }
    
    if (paragraph) {
      tl.from(paragraph, {
        opacity: 0,
        y: 15,
        duration: 0.4
      }, "-=0.2");
    }
    
    if (button) {
      tl.from(button, {
        opacity: 0,
        scale: 0.8,
        duration: 0.4,
        ease: "back.out(1.5)"
      }, "-=0.1");
    }
  }, { scope: ref });
  
  return ref;
}

/**
 * Search Pulse - Indicador visual cuando se está buscando.
 */
export function useSearchPulse(isSearching) {
  const ref = useRef(null);
  
  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    
    if (isSearching) {
      gsap.to(el, {
        boxShadow: "0 0 0 4px rgba(25, 212, 112, 0.2)",
        duration: 0.6,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1
      });
    } else {
      gsap.killTweensOf(el);
      gsap.to(el, {
        boxShadow: "none",
        duration: 0.3
      });
    }
  }, { dependencies: [isSearching], scope: ref });
  
  return ref;
}

/**
 * Magnetic Button - El botón "sigue" sutilmente el cursor cuando está cerca.
 * Solo en desktop.
 */
export function useMagneticButton(strength = 0.3) {
  const btnRef = useRef(null);
  
  useGSAP(
    (_, contextSafe) => {
      const btn = btnRef.current;
      if (!btn) return;
      
      const isTouchDevice = 'ontouchstart' in window;
      if (isTouchDevice) return;
      
      const handleMouseMove = contextSafe((e) => {
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (e.clientX - centerX) * strength;
        const deltaY = (e.clientY - centerY) * strength;
        
        gsap.to(btn, {
          x: deltaX,
          y: deltaY,
          duration: 0.4,
          ease: "power2.out"
        });
      });
      
      const handleMouseLeave = contextSafe(() => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.4)"
        });
      });
      
      btn.addEventListener("mousemove", handleMouseMove);
      btn.addEventListener("mouseleave", handleMouseLeave);
      
      return () => {
        btn.removeEventListener("mousemove", handleMouseMove);
        btn.removeEventListener("mouseleave", handleMouseLeave);
      };
    },
    { scope: btnRef }
  );
  
  return btnRef;
}

/**
 * Toast Entrance - Toast entra con elastic bounce.
 */
export function useToastEntrance() {
  const toastRef = useRef(null);
  
  useGSAP(() => {
    const toast = toastRef.current;
    if (!toast) return;
    
    gsap.from(toast, {
      y: -100,
      opacity: 0,
      scale: 0.8,
      duration: 0.6,
      ease: "elastic.out(1, 0.5)"
    });
  }, { scope: toastRef });
  
  return toastRef;
}
