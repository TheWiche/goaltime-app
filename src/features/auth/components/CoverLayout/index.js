import PropTypes from "prop-types";
import PageLayout from "shared/components/layout/LayoutContainers/PageLayout";
import Footer from "features/auth/components/Footer";

function CoverLayout({ coverHeight, image, children }) {
  return (
    <PageLayout>
      <div
        className="mx-4 my-4 rounded-2xl bg-cover bg-center bg-no-repeat pt-12 pb-28"
        style={{
          width: "calc(100% - 2rem)",
          minHeight: coverHeight,
          backgroundImage: image
            ? `linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.45)), url(${image})`
            : undefined,
        }}
      />
      <div
        className="mx-auto w-[calc(100%-2rem)] px-2"
        style={{ marginTop: "clamp(-5rem, -12vw, -4rem)" }}
      >
        <div className="flex justify-center">
          <div className="w-[92%] max-w-sm sm:max-w-md md:max-w-lg lg:max-w-md xl:max-w-sm">
            {children}
          </div>
        </div>
      </div>
      <Footer />
    </PageLayout>
  );
}

CoverLayout.defaultProps = {
  coverHeight: "35vh",
};

CoverLayout.propTypes = {
  coverHeight: PropTypes.string,
  image: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default CoverLayout;
