import { Bell, CalendarRange, Clock3, Heart, Lock, Mail, Search, Ticket } from "lucide-react";
import { reveal, Section, SectionIntro } from "features/public/components/landing/primitives";

/* Cada punto describe un comportamiento que existe hoy en el código de GoalTime. */
const FEATURES = [
  {
    icon: Search,
    title: "Búsqueda y orden",
    text: "Encuentra canchas por nombre, dirección, ciudad o descripción y ordénalas por precio o por nombre.",
  },
  {
    icon: Clock3,
    title: "Franjas de 30 minutos",
    text: "Las reservas empiezan en punto o y media y duran de 1 a 6 horas, siempre dentro del horario de la cancha.",
  },
  {
    icon: Lock,
    title: "Sin dobles reservas",
    text: "Al reservar, cada franja se bloquea en la misma operación. Si alguien la tomó antes, tu reserva no se crea.",
  },
  {
    icon: CalendarRange,
    title: "Reserva con tiempo",
    text: "Puedes reservar desde el día siguiente y hasta 90 días por adelantado.",
  },
  {
    icon: Heart,
    title: "Favoritas",
    text: "Marca las canchas que más usas y fíltralas con un clic en el catálogo.",
  },
  {
    icon: Ticket,
    title: "Ticket de reserva",
    text: "Cada reserva tiene su ticket: imprímelo, guárdalo como PDF o envíalo a tu correo.",
  },
  {
    icon: Bell,
    title: "Notificaciones en la app",
    text: "Avisos cuando creas una reserva y cuando el dueño la confirma, la rechaza o la completa.",
  },
  {
    icon: Mail,
    title: "Avisos por correo",
    text: "Cuando cambia el estado de tu reserva recibes un correo con el detalle.",
  },
];

function Features() {
  return (
    <Section id="funciones" labelledBy="funciones-title" tone="canvas">
      <SectionIntro
        index="02"
        eyebrow="Funciones"
        titleId="funciones-title"
        title={
          <>
            Lo que hace GoalTime.
            <span className="block text-zinc-500">Ni más, ni menos.</span>
          </>
        }
      >
        Sin promesas de relleno: esto es exactamente lo que la plataforma hace hoy por quien reserva.
      </SectionIntro>

      <ul className="mt-14 grid overflow-hidden rounded-lg border border-line bg-white sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, text }, i) => (
          <li
            key={title}
            className="-mb-px -mr-px border-b border-r border-line p-6 lg:p-7"
            {...reveal((i % 4) * 70)}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-zinc-50 text-primary-600">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-[15px] font-semibold tracking-tight text-fg-strong">{title}</h3>
            <p className="mt-2 text-[13px] leading-6 text-fg-muted">{text}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export default Features;
