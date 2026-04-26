import { Link } from "react-router-dom";
import { useAuth } from "shared/context/AuthContext";
import {
  useHeroTimeline,
  useFloatingDecor,
  useNumberCount,
  usePitchDraw,
} from "shared/hooks/useGSAPAnimations";
import PitchSVG from "shared/components/decor/PitchSVG";
import SoccerBallSVG from "shared/components/decor/SoccerBallSVG";

const stats = [
  { value: 20, suffix: "+", label: "Canchas Disponibles" },
  { value: 1000, suffix: "+", label: "Usuarios Activos", divisor: 1000, suffixOverride: "K+" },
  { value: 5000, suffix: "+", label: "Reservas Realizadas", divisor: 1000, suffixOverride: "K+" },
];

function StatItem({ value, label, suffix, divisor, suffixOverride }) {
  const formatter = (n) => {
    if (divisor) return `${Math.round(n / divisor)}${suffixOverride}`;
    return `${Math.round(n)}${suffix}`;
  };
  const ref = useNumberCount(value, formatter);
  return (
    <div data-hero="stat" className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
      <p className="text-3xl md:text-4xl font-extrabold text-white" ref={ref}>0</p>
      <p className="text-xs md:text-sm text-white/70 mt-1 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function HeroSection() {
  const { currentUser } = useAuth();
  const heroRef = useHeroTimeline();
  const floatRef = useFloatingDecor();
  const pitchRef = usePitchDraw();

  // Title split en palabras (para stagger animation)
  const title = ["Tu", "Cancha", "Perfecta,"];
  const titleAccent = ["A", "Solo", "un", "Clic"];

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative overflow-hidden min-h-screen flex items-center"
      style={{
        background:
          "radial-gradient(ellipse at top right, #0f9b4e 0%, transparent 50%), radial-gradient(ellipse at bottom left, #14b85f 0%, transparent 55%), linear-gradient(135deg, #0a1f1a 0%, #0d2e1f 50%, #0a1f1a 100%)",
      }}
    >
      {/* Pitch SVG background — gigante, sutil, drawn por GSAP */}
      <div ref={pitchRef} className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
        <PitchSVG className="w-[140%] max-w-none" stroke="rgba(25, 212, 112, 0.4)" strokeWidth={1.2} />
      </div>

      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 pointer-events-none" />

      {/* Floating soccer balls */}
      <div ref={floatRef} className="absolute inset-0 pointer-events-none">
        <div data-float className="absolute top-[12%] left-[8%] opacity-80">
          <SoccerBallSVG size={48} />
        </div>
        <div data-float className="absolute top-[20%] right-[10%] opacity-60">
          <SoccerBallSVG size={36} />
        </div>
        <div data-float className="absolute bottom-[18%] left-[12%] opacity-50">
          <SoccerBallSVG size={28} />
        </div>
        <div data-float className="absolute bottom-[28%] right-[14%] opacity-70 hidden md:block">
          <SoccerBallSVG size={56} />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div data-hero="badge" className="inline-flex items-center gap-2 bg-goaltime/15 border border-goaltime/30 backdrop-blur-sm text-goaltime-200 text-xs font-semibold px-4 py-2 rounded-full mb-7">
            <span className="w-2 h-2 rounded-full bg-goaltime animate-pulse" />
            <span className="uppercase tracking-wider">⚽ La plataforma #1 de canchas en Riohacha</span>
          </div>

          {/* Title con words split */}
          <h1 data-hero="title" className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white leading-[1.05] mb-6 tracking-tight">
            <div className="overflow-hidden">
              {title.map((w, i) => (
                <span key={i} className="word inline-block mr-3">{w}</span>
              ))}
            </div>
            <div className="overflow-hidden">
              {titleAccent.map((w, i) => (
                <span key={i} className="word inline-block mr-3 bg-gradient-to-r from-goaltime to-green-300 bg-clip-text text-transparent">
                  {w}
                </span>
              ))}
            </div>
          </h1>

          {/* Subtitle */}
          <p data-hero="subtitle" className="text-base md:text-lg text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed">
            Encuentra y reserva canchas de fútbol cerca de ti en segundos. Reserva con confianza, juega sin estrés.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              data-hero="cta"
              to={currentUser ? "/canchas" : "/authentication/sign-in"}
              className="group inline-flex items-center gap-2 bg-goaltime hover:bg-goaltime-500 text-white font-bold px-8 py-4 rounded-2xl shadow-goaltime hover:shadow-2xl hover:shadow-goaltime/40 transition-all duration-300 hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar Canchas Ahora
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link
              data-hero="cta"
              to="/become-associate"
              className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white text-white font-semibold px-8 py-4 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
            >
              <span className="text-lg">🏟️</span> Soy Dueño de Cancha
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {stats.map((s) => (
              <StatItem key={s.label} {...s} />
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2 text-white/50">
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <div className="w-5 h-8 border-2 border-white/40 rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-2 bg-white/70 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
