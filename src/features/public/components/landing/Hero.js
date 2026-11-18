import { ArrowRight, Search } from "lucide-react";
import heroImg from "assets/images/landing/cancha-aerea-1024.webp";
import heroImgSm from "assets/images/landing/cancha-aerea-640.webp";
import { useAuth } from "shared/context/AuthContext";
import { SlotPickerMock } from "features/public/components/landing/mockups";
import { CtaLink, reveal } from "features/public/components/landing/primitives";

/** Hechos del producto (tomados de las reglas de reserva del código, no métricas). */
const FACTS = [
  { value: "30 min", label: "Franjas de disponibilidad" },
  { value: "1–6 h", label: "Duración de la reserva" },
  { value: "90 días", label: "De anticipación máxima" },
];

function Hero() {
  const { currentUser, userProfile } = useAuth();
  const isAssociate = userProfile?.role === "asociado";

  return (
    <section id="inicio" aria-labelledby="hero-title" className="relative bg-white">
      <div className="relative mx-auto w-full max-w-7xl sm:border-x sm:border-line">
        <div className="lp-grid-lines pointer-events-none absolute inset-0" aria-hidden="true" />

        <div className="relative grid grid-cols-1 gap-12 px-4 pb-16 pt-12 sm:px-8 md:pb-20 md:pt-16 lg:grid-cols-12 lg:gap-10 lg:px-12 lg:pb-20 lg:pt-14">
          <div className="lg:col-span-7 lg:pt-4">
            <p
              className="inline-flex items-center gap-2 rounded border border-line bg-white px-2.5 py-1 font-mono text-xs text-fg-muted"
              {...reveal()}
            >
              <span className="h-1.5 w-1.5 bg-primary-600" aria-hidden="true" />
              <span>
                Riohacha<span className="hidden min-[360px]:inline">, La Guajira</span> · Canchas de fútbol
              </span>
            </p>

            <h1
              id="hero-title"
              className="mt-7 text-[2.5rem] font-bold leading-[1.02] tracking-[-0.045em] text-fg-strong min-[400px]:text-5xl sm:text-6xl lg:text-[4.25rem] xl:text-[4.75rem]"
              {...reveal(60)}
            >
              Encuentra cancha, elige la hora y reserva.
              <span className="mt-2 block text-zinc-500">Sin vueltas.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-fg-muted sm:text-lg sm:leading-8" {...reveal(120)}>
              GoalTime reúne las canchas que sus dueños publican en Riohacha. Mira las franjas libres de cada día,
              envía tu reserva y recibe la respuesta del dueño en la app y por correo.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row" {...reveal(180)}>
              <CtaLink
                to="/canchas"
                variant="cta"
                leftIcon={<Search className="h-4 w-4" aria-hidden="true" />}
                rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
              >
                Buscar canchas
              </CtaLink>
              {isAssociate ? (
                <CtaLink to="/associate/fields" variant="secondary">
                  Publicar mi cancha
                </CtaLink>
              ) : (
                <CtaLink href="#duenos" variant="secondary">
                  Publicar mi cancha
                </CtaLink>
              )}
            </div>
            {!currentUser && (
              <p className="mt-3 text-[13px] text-fg-subtle" {...reveal(200)}>
                Para ver las canchas y reservar necesitas una cuenta.
              </p>
            )}

            <dl
              className="mt-12 grid max-w-xl grid-cols-3 border-y border-line bg-white sm:mt-14"
              {...reveal(240)}
            >
              {FACTS.map(({ value, label }, i) => (
                <div
                  key={label}
                  className={`flex flex-col ${i > 0 ? "border-l border-line px-3 py-4 sm:px-5" : "py-4 pr-3 sm:pr-5"}`}
                >
                  <dt className="text-2xs leading-4 text-fg-subtle sm:text-xs">{label}</dt>
                  <dd className="order-first mt-1 text-xl font-bold tabular tracking-tight text-fg-strong sm:text-2xl">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative lg:col-span-5" {...reveal(120)}>
            <figure className="relative ml-auto max-w-lg lg:max-w-none">
              <div className="overflow-hidden rounded-lg border border-line bg-zinc-900">
                <img
                  src={heroImg}
                  srcSet={`${heroImgSm} 640w, ${heroImg} 1024w`}
                  sizes="(min-width: 1024px) 480px, (min-width: 640px) 512px, 100vw"
                  width="1024"
                  height="1024"
                  alt="Vista aérea de una cancha de fútbol sintética iluminada de noche"
                  className="aspect-[5/4] w-full object-cover object-[50%_70%] lg:aspect-[4/5]"
                  loading="eager"
                  decoding="async"
                  fetchpriority="high"
                />
              </div>
              <div className="relative -mt-24 px-3 sm:-mt-28 sm:px-6 lg:absolute lg:-left-6 lg:bottom-12 lg:mt-0 lg:w-[19rem] lg:px-0 xl:-left-20">
                <SlotPickerMock compact className="shadow-md" />
              </div>
              <figcaption className="mt-3 font-mono text-2xs text-fg-subtle lg:mt-2">Imagen ilustrativa</figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
