import PropTypes from "prop-types";
import { cx } from "shared/components/ui";

/** Cabecera de sección pública: eyebrow + título + descripción. */
function SectionHeader({ eyebrow, title, description, align = "left", className = "" }) {
  return (
    <div className={cx("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className="text-xs font-medium text-primary-700">{eyebrow}</p>}
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-fg-strong sm:text-3xl">{title}</h2>
      {description && <p className="mt-3 text-[15px] leading-6 text-fg-muted">{description}</p>}
    </div>
  );
}

SectionHeader.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  align: PropTypes.oneOf(["left", "center"]),
  className: PropTypes.string,
};

export default SectionHeader;
