import { Link } from "react-router-dom";
import PublicLayout from "shared/components/layout/PublicLayout";
import ButtonLink from "shared/components/layout/ButtonLink";

function Blog() {
  return (
    <PublicLayout>
      <div className="border-b border-line bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight text-fg-strong">Blog de GoalTime</h1>
          <p className="mt-2 max-w-xl text-[15px] leading-6 text-fg-muted">
            Consejos para jugadores y novedades para dueños de canchas.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 md:py-12 lg:px-8">
        <div className="rounded-lg border border-dashed border-line-strong bg-white px-6 py-14 text-center">
          <h2 className="text-base font-semibold text-fg-strong">Aún no hay artículos publicados</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-fg-muted">
            Estamos preparando contenido útil para jugadores y dueños de canchas. Mientras tanto, puedes explorar las
            canchas disponibles o escribirnos.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <ButtonLink to="/authentication/sign-up">Crear cuenta</ButtonLink>
            <Link to="/" className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary-600 hover:underline">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

export default Blog;
