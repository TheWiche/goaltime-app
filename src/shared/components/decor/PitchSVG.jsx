import PropTypes from "prop-types";

/**
 * SVG estilizado de cancha de fútbol vista de arriba.
 * Paths con data-draw para que GSAP los dibuje progresivamente.
 */
function PitchSVG({ className = "", stroke = "rgba(255,255,255,0.35)", strokeWidth = 1.5 }) {
  const props = { fill: "none", stroke, strokeWidth, "data-draw": true };
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet" className={className}>
      {/* outer field */}
      <rect {...props} x="20" y="20" width="760" height="460" rx="4" />
      {/* halfway line */}
      <line {...props} x1="400" y1="20" x2="400" y2="480" />
      {/* center circle */}
      <circle {...props} cx="400" cy="250" r="60" />
      <circle fill={stroke} cx="400" cy="250" r="3" />
      {/* left penalty area */}
      <rect {...props} x="20" y="125" width="100" height="250" />
      <rect {...props} x="20" y="190" width="40" height="120" />
      <circle {...props} cx="100" cy="250" r="40" />
      {/* right penalty area */}
      <rect {...props} x="680" y="125" width="100" height="250" />
      <rect {...props} x="740" y="190" width="40" height="120" />
      <circle {...props} cx="700" cy="250" r="40" />
      {/* goals */}
      <rect {...props} x="10" y="220" width="10" height="60" />
      <rect {...props} x="780" y="220" width="10" height="60" />
      {/* corner arcs */}
      <path {...props} d="M20 30 A 10 10 0 0 1 30 20" />
      <path {...props} d="M770 20 A 10 10 0 0 1 780 30" />
      <path {...props} d="M30 480 A 10 10 0 0 1 20 470" />
      <path {...props} d="M780 470 A 10 10 0 0 1 770 480" />
    </svg>
  );
}

PitchSVG.propTypes = {
  className: PropTypes.string,
  stroke: PropTypes.string,
  strokeWidth: PropTypes.number,
};

export default PitchSVG;
