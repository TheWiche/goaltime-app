import { MDBox } from "shared/components/md-shims";
// src/layouts/authentication/components/BasicLayout/index.js

import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import PageLayout from "shared/components/layout/LayoutContainers/PageLayout";
import Footer from "features/auth/components/Footer";

function BasicLayout({ image, children }) {
  return (
    <PageLayout>
      <MDBox
        position="absolute"
        width="100%"
        minHeight="100vh"
        sx={{
          backgroundImage: ({ functions: { linearGradient, rgba }, palette: { gradients } }) =>
            image &&
            `${linearGradient(
              rgba(gradients.dark.main, 0.6),
              rgba(gradients.dark.state, 0.6)
            )}, url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* 👇 Este es el nuevo contenedor principal con Flexbox */}
      <MDBox px={1} width="100%" height="100vh" mx="auto" display="flex" flexDirection="column">
        {/* Este Grid ahora crece para ocupar el espacio disponible, empujando al footer */}
        <Grid
          container
          spacing={1}
          justifyContent="center"
          alignItems="center"
          sx={{ height: "100%", flexGrow: 1 }} // 👈 Se añade flexGrow
        >
          <Grid item xs={11} sm={9} md={5} lg={4} xl={3}>
            {children}
          </Grid>
        </Grid>
        {/* El footer ahora es el último elemento del contenedor Flexbox */}
        <Footer light />
      </MDBox>
    </PageLayout>
  );
}

BasicLayout.propTypes = {
  image: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default BasicLayout;
