import PropTypes from "prop-types";

/**
 * SVG balón de fútbol estilizado (pentágonos clásicos).
 */
function SoccerBallSVG({ size = 64, className = "" }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
      <defs>
        <radialGradient id="ball-grad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="80%" stopColor="#e8e8e8" />
          <stop offset="100%" stopColor="#b0b0b0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#ball-grad)" stroke="#1a1a1a" strokeWidth="2" />
      {/* central pentagon */}
      <polygon points="50,32 64,42 59,58 41,58 36,42" fill="#1a1a1a" />
      {/* surrounding stripes */}
      <path d="M50 32 L50 14" stroke="#1a1a1a" strokeWidth="2" fill="none" />
      <path d="M64 42 L82 38" stroke="#1a1a1a" strokeWidth="2" fill="none" />
      <path d="M59 58 L70 76" stroke="#1a1a1a" strokeWidth="2" fill="none" />
      <path d="M41 58 L30 76" stroke="#1a1a1a" strokeWidth="2" fill="none" />
      <path d="M36 42 L18 38" stroke="#1a1a1a" strokeWidth="2" fill="none" />
    </svg>
  );
}

SoccerBallSVG.propTypes = {
  size: PropTypes.number,
  className: PropTypes.string,
};

export default SoccerBallSVG;
