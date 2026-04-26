import PropTypes from "prop-types";
import PageLayout from "shared/components/layout/LayoutContainers/PageLayout";
import Footer from "features/auth/components/Footer";
import logo from "assets/images/Logo.png";

function CleanAuthLayout({ children }) {
  return (
    <PageLayout>
      <div className="absolute px-6 py-6">
        <img src={logo} alt="GoalTime Logo" className="h-16 w-auto object-contain" />
      </div>
      <div className="mx-auto flex min-h-screen w-full flex-col px-2">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-[92%] max-w-sm sm:max-w-md md:max-w-lg lg:max-w-md xl:max-w-sm">
            {children}
          </div>
        </div>
      </div>
      <Footer />
    </PageLayout>
  );
}

CleanAuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default CleanAuthLayout;
