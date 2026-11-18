import { Plus } from "lucide-react";
import { reveal, Section, SectionIntro } from "features/public/components/landing/primitives";

/* Respuestas basadas en el funcionamiento actual del código (ReservationModal,
   reservationsService, fieldsService, roles de usuario). */
const FAQS = [
  {
    q: "¿Cómo reservo una cancha?",
    a: [
      "Crea una cuenta (con correo o con Google o Facebook) y entra a Canchas. Elige una cancha y pulsa Reservar.",
      "Selecciona la fecha (desde mañana y hasta 90 días después), la duración (de 1 a 6 horas) y una hora de inicio entre las franjas libres. Puedes añadir una nota para el dueño antes de enviar.",
    ],
  },
  {
    q: "¿Quién confirma mi reserva?",
    a: [
      "El dueño de la cancha. Mientras tu reserva está pendiente, sus franjas quedan retenidas para ti y nadie más puede reservarlas.",
      "Cuando el dueño la confirma o la rechaza recibes una notificación en la app y un correo con el nuevo estado.",
    ],
  },
  {
    q: "¿Puedo cancelar una reserva?",
    a: [
      "Una reserva pendiente o confirmada puede pasar a cancelada, y en ese momento sus franjas vuelven a quedar libres. El dueño puede rechazarla o cancelarla desde su panel.",
      "Si necesitas cancelar la tuya, habla con el dueño de la cancha (su teléfono aparece en el detalle de la cancha cuando lo ha publicado) o escríbenos desde el formulario de contacto.",
    ],
  },
  {
    q: "¿Se paga en línea?",
    a: [
      "No. GoalTime muestra el precio por hora que define el dueño y el total estimado de tu reserva; el pago es presencial en la cancha.",
    ],
  },
  {
    q: "¿Cómo publico mi cancha?",
    a: [
      "Crea tu cuenta y pídenos el perfil de asociado desde el formulario de contacto: un administrador asigna ese rol. Después, en Mis canchas, registra el nombre, la dirección, la descripción, una imagen, el precio por hora y el horario de apertura y cierre.",
    ],
  },
  {
    q: "¿Mi cancha aparece de inmediato?",
    a: [
      "No. Toda cancha nueva pasa por la revisión de un administrador y solo aparece en el catálogo, y acepta reservas, cuando está aprobada. Recibirás una notificación con la decisión.",
      "Si editas una cancha que ya estaba aprobada o rechazada, vuelve a revisión.",
    ],
  },
  {
    q: "¿Dónde veo mi ticket?",
    a: [
      "En Mis reservaciones. Desde el ticket puedes imprimirlo, guardarlo como PDF o enviarlo a tu correo.",
    ],
  },
];

function Faq() {
  return (
    <Section id="preguntas" labelledBy="preguntas-title">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
        <SectionIntro
          index="05"
          eyebrow="Preguntas frecuentes"
          titleId="preguntas-title"
          title="Lo que suele preguntarse antes de reservar."
          stacked
          className="lg:sticky lg:top-24 lg:col-span-5 lg:self-start"
        />

        <div className="divide-y divide-line border-y border-line lg:col-span-7" {...reveal(80)}>
          {FAQS.map(({ q, a }) => (
            <details key={q} className="group">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 rounded-sm py-5 text-left text-base font-semibold tracking-tight text-fg-strong transition-colors hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 [&::-webkit-details-marker]:hidden">
                <span>{q}</span>
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-line text-fg-muted group-open:border-line-strong group-open:text-fg-strong">
                  <Plus className="h-3.5 w-3.5 transition-transform duration-200 group-open:rotate-45" aria-hidden="true" />
                </span>
              </summary>
              <div className="space-y-3 pb-6 pr-10 text-[15px] leading-7 text-fg-muted">
                {a.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}

export default Faq;
