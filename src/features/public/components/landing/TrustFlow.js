import { reveal, Section, SectionIntro } from "features/public/components/landing/primitives";

/* Flujo real: fieldsService (pending → approved), createReservation (pending + locks),
   updateReservationStatus (confirmed / cancelled) y los avisos de notificationsService + correo. */
const FLOW = [
  {
    actor: "Dueño",
    title: "Publica la cancha",
    text: "La cancha nueva queda en revisión. Si edita una ya aprobada, vuelve a revisión.",
  },
  {
    actor: "Administrador",
    title: "La aprueba o la rechaza",
    text: "Solo las canchas aprobadas aparecen en el catálogo y aceptan reservas. El dueño recibe el aviso.",
  },
  {
    actor: "Jugador",
    title: "Reserva una franja",
    text: "La reserva nace pendiente y bloquea sus franjas de 30 minutos en la misma operación.",
  },
  {
    actor: "Dueño",
    title: "Confirma o rechaza",
    text: "Si la rechaza, o la reserva se cancela, las franjas quedan libres otra vez.",
  },
  {
    actor: "GoalTime",
    title: "Avisa al jugador",
    text: "Notificación en la app y correo con el nuevo estado. El ticket queda disponible en su cuenta.",
  },
];

function TrustFlow() {
  return (
    <Section id="confianza" labelledBy="confianza-title" tone="canvas">
      <SectionIntro
        index="04"
        eyebrow="Aprobación y confianza"
        titleId="confianza-title"
        title="Cada paso tiene a alguien responsable."
      >
        Ninguna cancha aparece sin revisión y ninguna reserva se da por hecha sin que el dueño responda.
      </SectionIntro>

      <ol className="relative mt-14 grid gap-0 lg:grid-cols-5">
        {FLOW.map(({ actor, title, text }, i) => (
          <li key={title} className="relative flex gap-5 lg:block" {...reveal(i * 80)}>
            {/* Riel: vertical en móvil, horizontal en escritorio */}
            <div className="relative flex flex-col items-center lg:flex-row" aria-hidden="true">
              <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-fg-strong bg-white font-mono text-xs font-medium text-fg-strong">
                {i + 1}
              </span>
              {i < FLOW.length - 1 && (
                <span className="w-px flex-1 bg-line-strong lg:h-px lg:w-auto lg:flex-1" />
              )}
            </div>
            <div className="pb-10 lg:pb-0 lg:pr-6 lg:pt-6">
              <p className="font-mono text-2xs text-primary-700">{actor}</p>
              <h3 className="mt-1.5 text-base font-semibold tracking-tight text-fg-strong">{title}</h3>
              <p className="mt-1.5 text-[13px] leading-6 text-fg-muted">{text}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export default TrustFlow;
