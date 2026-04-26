import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useFloatingDecor, usePitchDraw } from "shared/hooks/useGSAPAnimations";
import PitchSVG from "shared/components/decor/PitchSVG";
import SoccerBallSVG from "shared/components/decor/SoccerBallSVG";
import logo from "assets/images/Logo.png";

/**
 * Panel izquierdo decorativo para login/register.
 * Tema fútbol: gradient verde profundo + cancha animada + balones flotantes.
 */
function AuthFootballPanel({ title, subtitle, footnote }) {
  const floatRef = useFloatingDecor();
  const pitchRef = usePitchDraw();

  return (
    <div
      className="relative w-full h-full overflow-hidden flex flex-col justify-between p-8 md:p-10"
      style={{
        background:
          "radial-gradient(ellipse at top right, #14b85f 0%, transparent 55%), radial-gradient(ellipse at bottom left, #0f9b4e 0%, transparent 60%), linear-gradient(135deg, #051710 0%, #0a2918 60%, #051710 100%)",
      }}
    >
      {/* Pitch SVG bg */}
      <div ref={pitchRef} className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
        <PitchSVG className="w-[130%] max-w-none" stroke="rgba(25,212,112,0.5)" strokeWidth={1.4} />
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-transparent pointer-events-none" />

      {/* Floating balls */}
      <div ref={floatRef} className="absolute inset-0 pointer-events-none">
        <div data-float className="absolute top-[15%] right-[10%] opacity-80">
          <SoccerBallSVG size={56} />
        </div>
        <div data-float className="absolute bottom-[28%] right-[20%] opacity-50">
          <SoccerBallSVG size={32} />
        </div>
        <div data-float className="absolute top-[55%] left-[8%] opacity-60">
          <SoccerBallSVG size={42} />
        </div>
      </div>

      {/* Top: Brand */}
      <Link to="/" className="relative z-10 inline-flex items-center gap-2 self-start group">
        <img src={logo} alt="GoalTime" className="w-9 h-9 object-contain group-hover:scale-110 transition-transform" />
        <span className="text-white font-bold text-xl">GoalTime</span>
      </Link>

      {/* Bottom: Title block */}
      <div className="relative z-10 max-w-md">
        <div className="inline-flex items-center gap-2 bg-goaltime/20 border border-goaltime/40 backdrop-blur-sm text-goaltime-100 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-goaltime animate-pulse" />
          Plataforma deportiva
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-3">
          {title}
        </h2>
        <p className="text-white/75 text-sm md:text-base leading-relaxed">
          {subtitle}
        </p>
        {footnote && (
          <p className="text-white/40 text-xs mt-6">{footnote}</p>
        )}
      </div>
    </div>
  );
}

AuthFootballPanel.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  footnote: PropTypes.string,
};

export default AuthFootballPanel;
