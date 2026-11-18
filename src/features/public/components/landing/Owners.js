import { ArrowRight, Check } from "lucide-react";
import ButtonLink from "shared/components/layout/ButtonLink";
import { useAuth } from "shared/context/AuthContext";
import { OwnerPanelMock } from "features/public/components/landing/mockups";
import { reveal, SampleTag, Section, SectionIntro } from "features/public/components/landing/primitives";

const CAPABILITIES = [
  "Publica tus canchas con nombre, dirección, descripción, imagen, precio por hora y horario de apertura y cierre.",
  "Recibe una notificación con cada reserva nueva y confírmala o recházala desde tu panel.",
  "Al confirmar, GoalTime comprueba que la franja siga libre; al rechazar, la libera para otros.",
  "El jugador recibe un correo con cada cambio de estado que hagas.",
  "Tu panel resume canchas aprobadas y en revisión, reservas por confirmar e ingresos de los últimos meses.",
];

const JOIN_STEPS = [
  { n: "1", title: "Crea tu cuenta", text: "Regístrate con tu correo o con Google o Facebook." },
  {
    n: "2",
    title: "Pide tu perfil de asociado",
    text: "Escríbenos desde el formulario de contacto: un administrador activa el rol de asociado en tu cuenta.",
  },
  {
    n: "3",
    title: "Publica tu cancha",
    text: "Queda en revisión y aparece en el catálogo cuando un administrador la aprueba.",
  },
];

function Owners() {
  const { currentUser, userProfile } = useAuth();
  const isAssociate = userProfile?.role === "asociado";

  return (
    <Section id="duenos" labelledBy="duenos-title">
      <SectionIntro
        index="03"
        eyebrow="Para dueños de canchas"
        titleId="duenos-title"
        title="Tu cancha, tus horarios, tus reservas. En un solo panel."
      >
        Las solicitudes llegan ordenadas y con la franja ya bloqueada. Tú decides cuáles confirmar.
      </SectionIntro>

      <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6" {...reveal()}>
          <ul className="divide-y divide-line border-y border-line">
            {CAPABILITIES.map((item) => (
              <li key={item} className="flex gap-3 py-4 text-[15px] leading-6 text-fg">
                <Check className="mt-1 h-4 w-4 shrink-0 text-primary-600" strokeWidth={2.5} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-6" {...reveal(100)}>
          <div className="rounded-lg border border-line bg-canvas p-3 sm:p-6">
            <SampleTag className="mb-3" />
            <OwnerPanelMock />
          </div>
        </div>
      </div>

      <div className="mt-16 rounded-lg border border-line" {...reveal()}>
        <div className="flex flex-col gap-1 border-b border-line px-5 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:px-6">
          <h3 className="text-base font-semibold tracking-tight text-fg-strong">Cómo empezar a publicar</h3>
          <p className="text-[13px] text-fg-muted">Las canchas se revisan antes de aparecer en el catálogo.</p>
        </div>
        <ol className="grid md:grid-cols-3">
          {JOIN_STEPS.map(({ n, title, text }, i) => (
            <li
              key={n}
              className={`flex gap-4 px-5 py-5 sm:px-6 ${i > 0 ? "border-t border-line md:border-l md:border-t-0" : ""}`}
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-line-strong font-mono text-xs font-medium text-fg-strong"
                aria-hidden="true"
              >
                {n}
              </span>
              <div>
                <p className="text-sm font-semibold text-fg-strong">{title}</p>
                <p className="mt-1 text-[13px] leading-5 text-fg-muted">{text}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="flex flex-col gap-3 border-t border-line bg-zinc-50 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          {isAssociate ? (
            <ButtonLink
              to="/associate/fields"
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
            >
              Ir a mis canchas
            </ButtonLink>
          ) : (
            <>
              {!currentUser && (
                <ButtonLink
                  to="/authentication/sign-up"
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
                >
                  Crear mi cuenta
                </ButtonLink>
              )}
              <ButtonLink href="#contacto" variant={currentUser ? "primary" : "secondary"} size="lg">
                Solicitar perfil de asociado
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </Section>
  );
}

export default Owners;
