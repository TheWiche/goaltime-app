import PropTypes from "prop-types";
import PublicLayout from "shared/components/layout/PublicLayout";

/** Marco de las páginas de texto legal (privacidad, términos, licencia). */
function LegalPage({ title, updated, children }) {
  return (
    <PublicLayout>
      <div className="border-b border-line bg-white">
        <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 md:py-14">
          <h1 className="text-3xl font-semibold tracking-tight text-fg-strong">{title}</h1>
          {updated && <p className="mt-2 text-[13px] text-fg-subtle">Última actualización: {updated}</p>}
        </div>
      </div>
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 md:py-12">
        <article className="rounded-lg border border-line bg-white p-5 sm:p-8">{children}</article>
      </div>
    </PublicLayout>
  );
}

LegalPage.propTypes = {
  title: PropTypes.string.isRequired,
  updated: PropTypes.string,
  children: PropTypes.node.isRequired,
};

/** Sección numerada de un texto legal. */
export function LegalSection({ title, children }) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="text-base font-semibold text-fg-strong">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-6 text-fg-muted">{children}</div>
    </section>
  );
}

LegalSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

/** Lista con viñetas para textos legales. */
export function LegalList({ children }) {
  return <ul className="list-disc space-y-1.5 pl-5">{children}</ul>;
}

LegalList.propTypes = { children: PropTypes.node.isRequired };

export default LegalPage;
