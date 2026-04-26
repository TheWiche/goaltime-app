import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import Icon from "@mui/material/Icon";
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
    <Card sx={{ height: "100%", boxShadow: !shadow && "none" }}>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" pt={2} px={2}>
        <MDTypography variant="h6" fontWeight="medium" textTransform="capitalize">
          {title}
        </MDTypography>
        <MDTypography component={Link} to={action.route} variant="body2" color="secondary">
          <Tooltip title={action.tooltip} placement="top">
            <Icon>edit</Icon>
          </Tooltip>
        </MDTypography>
      </MDBox>
      <MDBox p={2}>
        <MDBox mb={2} lineHeight={1}>
          <MDTypography variant="button" color="text" fontWeight="light">
            {description}
          </MDTypography>
        </MDBox>
        <MDBox opacity={0.3}>
          <Divider />
        </MDBox>
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
    </Card>
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
