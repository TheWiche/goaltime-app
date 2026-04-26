import PropTypes from "prop-types";
import PageLayout from "shared/components/layout/LayoutContainers/PageLayout";
import Footer from "features/auth/components/Footer";

function BasicLayout({ image, children }) {
  return (
    <PageLayout>
      <div
        className="pointer-events-none absolute inset-0 min-h-screen w-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: image
            ? `linear-gradient(rgba(15, 23, 42, 0.62), rgba(15, 23, 42, 0.62)), url(${image})`
            : undefined,
        }}
        aria-hidden
      />
      <div className="relative mx-auto flex min-h-screen w-full max-w-full flex-col px-2">
        <div className="flex min-h-0 flex-1 items-center justify-center py-6">
          <div className="w-[92%] max-w-sm sm:max-w-md md:max-w-lg lg:max-w-md xl:max-w-sm">
            {children}
          </div>
        </div>
        <Footer light />
      </div>
    </PageLayout>
  );
}

BasicLayout.propTypes = {
  image: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default BasicLayout;
