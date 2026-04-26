import PropTypes from "prop-types";

function SplitScreenLayout({ leftContent, rightContent, showLeftOnMobile = false }) {
  return (
    <div className="w-full min-h-screen flex overflow-hidden flex-col md:flex-row">
      {/* Left Panel - imagen/fondo (oculto en mobile por defecto) */}
      <div
        className={[
          "relative md:w-2/5 md:min-h-screen overflow-hidden",
          showLeftOnMobile ? "flex min-h-[40vh]" : "hidden md:flex",
        ].join(" ")}
      >
        {leftContent}
      </div>

      {/* Right Panel - formulario */}
      <div className="relative flex flex-col w-full md:w-3/5 min-h-screen bg-white overflow-auto">
        {rightContent}
      </div>
    </div>
  );
}

SplitScreenLayout.propTypes = {
  leftContent: PropTypes.node.isRequired,
  rightContent: PropTypes.node.isRequired,
  showLeftOnMobile: PropTypes.bool,
};

export default SplitScreenLayout;
