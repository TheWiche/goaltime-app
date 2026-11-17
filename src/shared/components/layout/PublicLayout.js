import PropTypes from "prop-types";
import HomepageHeader from "features/public/components/HomepageHeader";
import HomepageFooter from "features/public/components/HomepageFooter";

/**
 * Marco de todas las páginas públicas (home, about, blog, legales): header + contenido + footer.
 * No muestra el Sidenav: App.js lo oculta por el `layout` de la ruta.
 */
function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-clip bg-canvas">
      <HomepageHeader />
      <main className="flex-1">{children}</main>
      <HomepageFooter />
    </div>
  );
}

PublicLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PublicLayout;
