// MDBox shim — contenedor genérico. Las props MUI (p, mb, display…) se ignoran:
// usa className. Para código nuevo usa un <div> con Tailwind directamente.
import PropTypes from "prop-types";
import { stripSystemProps } from "./systemProps";

function MDBox({ children, className = "", component = "div", ...rest }) {
  const Component = component;
  return (
    <Component className={className || undefined} {...stripSystemProps(rest)}>
      {children}
    </Component>
  );
}

MDBox.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  sx: PropTypes.object,
  component: PropTypes.elementType,
};

export default MDBox;
