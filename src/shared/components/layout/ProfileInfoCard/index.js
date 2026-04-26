import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Pencil } from "lucide-react";
import { MDBox, MDTypography } from "shared/components/md-shims";

function ProfileInfoCard({ title, description, info, social, action, shadow }) {
  const labels = [];
  const values = [];

  Object.keys(info).forEach((el) => {
    if (el.match(/[A-Z\s]+/)) {
      const uppercaseLetter = Array.from(el).find((i) => i.match(/[A-Z]+/));
      const newElement = el.replace(uppercaseLetter, ` ${uppercaseLetter.toLowerCase()}`);
      labels.push(newElement);
    } else {
      labels.push(el);
    }
  });

  Object.values(info).forEach((el) => values.push(el));

  const renderItems = labels.map((label, key) => (
    <MDBox key={label} display="flex" py={1} pr={2}>
      <MDTypography variant="button" fontWeight="bold" textTransform="capitalize">
        {label}: &nbsp;
      </MDTypography>
      <MDTypography variant="button" fontWeight="regular" color="text">
        &nbsp;{values[key]}
      </MDTypography>
    </MDBox>
  ));

  const renderSocial =
    social && social.length > 0
      ? social.map(({ link, icon, color }) => (
          <MDBox
            key={color}
            component="a"
            href={link}
            target="_blank"
            rel="noreferrer"
            fontSize="large"
            color={color}
            pr={1}
            pl={0.5}
            lineHeight={1}
          >
            {icon}
          </MDBox>
        ))
      : null;

  return (
    <div
      className={[
        "h-full overflow-hidden rounded-xl border border-slate-200/80 bg-white",
        shadow ? "shadow-sm" : "shadow-none",
      ].join(" ")}
    >
      <MDBox display="flex" justifyContent="space-between" alignItems="center" pt={2} px={2}>
        <MDTypography variant="h6" fontWeight="medium" textTransform="capitalize">
          {title}
        </MDTypography>
        <Link
          to={action.route}
          title={action.tooltip}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary"
        >
          <Pencil className="h-5 w-5" strokeWidth={2} aria-hidden />
          <span className="sr-only">{action.tooltip}</span>
        </Link>
      </MDBox>
      <MDBox p={2}>
        <MDBox mb={2} lineHeight={1}>
          <MDTypography variant="button" color="text" fontWeight="light">
            {description}
          </MDTypography>
        </MDBox>
        <div className="opacity-30">
          <hr className="border-slate-200" />
        </div>
        <MDBox>
          {renderItems}
          {social && social.length > 0 && (
            <MDBox display="flex" py={1} pr={2}>
              <MDTypography variant="button" fontWeight="bold" textTransform="capitalize">
                social: &nbsp;
              </MDTypography>
              {renderSocial}
            </MDBox>
          )}
        </MDBox>
      </MDBox>
    </div>
  );
}

ProfileInfoCard.defaultProps = {
  shadow: true,
  social: [],
};

ProfileInfoCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  info: PropTypes.objectOf(PropTypes.string).isRequired,
  social: PropTypes.arrayOf(PropTypes.object),
  action: PropTypes.shape({
    route: PropTypes.string.isRequired,
    tooltip: PropTypes.string.isRequired,
  }).isRequired,
  shadow: PropTypes.bool,
};

export default ProfileInfoCard;
