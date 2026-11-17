import { ArrowRight, Check, Search } from "lucide-react";
import heroImage from "assets/images/bg-sign-up-cover.png";
import ButtonLink from "shared/components/layout/ButtonLink";
import { useAuth } from "shared/context/AuthContext";

const highlights = [
  "Sin llamadas ni mensajes",
  "Disponibilidad en tiempo real",
  "Avisos por correo",
];

function HeroSection() {
  const { currentUser } = useAuth();

  return (
    <section id="hero" className="border-b border-line bg-white">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:py-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded border border-primary-100 bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700">
            <span className="h-1.5 w-1.5 bg-primary-600" aria-hidden="true" />
            Reserva de canchas en Riohacha
          </p>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-fg-strong sm:text-5xl lg:text-[3.5rem] lg:leading-[1.05]">
            Tu cancha perfecta, a solo un clic
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-fg-muted sm:text-lg">
            Encuentra y reserva canchas de fútbol cerca de ti en segundos. Reserva con confianza, juega sin estrés.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink
              to={currentUser ? "/canchas" : "/authentication/sign-in"}
              variant="cta"
              size="xl"
              leftIcon={<Search className="h-4 w-4" aria-hidden="true" />}
              rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
            >
              Buscar canchas
            </ButtonLink>
            <ButtonLink to="/authentication/sign-up" variant="secondary" size="xl">
              Soy dueño de cancha
            </ButtonLink>
          </div>

          <ul className="mt-8 flex flex-col gap-2 text-sm text-fg-muted sm:flex-row sm:flex-wrap sm:gap-x-6">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary-600" strokeWidth={2.5} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <figure className="overflow-hidden rounded-lg border border-line bg-zinc-100">
          <img
            src={heroImage}
            alt="Cancha de fútbol sintética iluminada al atardecer"
            className="aspect-[4/3] w-full object-cover"
            loading="eager"
          />
        </figure>
      </div>
    </section>
  );
}

export default HeroSection;
