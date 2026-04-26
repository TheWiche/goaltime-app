// MDBox shim - Wrapper temporal para migración progresiva
import PropTypes from "prop-types";

function MDBox({ children, className = "", sx, component = "div", ...rest }) {
  const Component = component;
  return (
    <Component className={`${className}`} {...rest}>
      {children}
    </Component>
  );
}

MDBox.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  sx: PropTypes.object,
  component: PropTypes.string,
};

export default MDBox;
