import { useEffect } from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import HomepageHeader from "features/public/components/HomepageHeader";
import HomepageFooter from "features/public/components/HomepageFooter";
import { useMaterialUIController, setLayout } from "shared/context";

function HomepageLayout({ children }) {
  const { pathname } = useLocation();
  const [, dispatch] = useMaterialUIController();

  useEffect(() => {
    setLayout(dispatch, "page");
  }, [pathname, dispatch]);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  const isHeaderLight = pathname !== "/";

  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      <HomepageHeader light={isHeaderLight} />
      {children}
      <HomepageFooter />
    </div>
  );
}

HomepageLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default HomepageLayout;
