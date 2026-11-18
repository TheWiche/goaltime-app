import { FieldCardMock, SlotPickerMock, TicketMock } from "features/public/components/landing/mockups";
import { reveal, SampleTag, Section, SectionIntro } from "features/public/components/landing/primitives";

const STEPS = [
  {
    n: "01",
    title: "Busca la cancha",
    text: "Busca por nombre, dirección o ciudad, ordena por precio o por nombre y guarda en favoritas las que más usas.",
    Mock: FieldCardMock,
  },
  {
    n: "02",
    title: "Elige fecha y franja",
    text: "Escoge el día y la duración. Las horas libres aparecen en franjas de 30 minutos; las ocupadas no se pueden elegir.",
    Mock: SlotPickerMock,
  },
  {
    n: "03",
    title: "Espera la confirmación",
    text: "Tu reserva queda pendiente y la franja retenida para ti hasta que el dueño la confirme o la rechace. Te avisamos en la app y por correo.",
    Mock: TicketMock,
  },
];

function HowItWorks() {
  return (
    <Section id="como-funciona" labelledBy="como-funciona-title">
      <SectionIntro
        index="01"
        eyebrow="Para jugadores"
        titleId="como-funciona-title"
        title="Del “¿hay cancha?” al partido en tres pasos."
      >
        Todo ocurre dentro de GoalTime: no necesitas llamar para preguntar qué horas quedan libres.
      </SectionIntro>

      <SampleTag className="mt-12" />

      <ol className="mt-4 grid border-t border-line md:grid-cols-3">
        {STEPS.map(({ n, title, text, Mock }, i) => (
          <li
            key={n}
            className={`flex flex-col pt-8 md:pb-2 ${
              i > 0 ? "mt-10 border-t border-line md:mt-0 md:border-l md:border-t-0 md:pl-6 lg:pl-8" : ""
            } ${i < STEPS.length - 1 ? "md:pr-6 lg:pr-8" : ""}`}
            {...reveal(i * 90)}
          >
            <span className="font-mono text-xs text-primary-700" aria-hidden="true">
              Paso {n}
            </span>
            <h3 className="mt-3 text-xl font-semibold tracking-tight text-fg-strong">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-fg-muted">{text}</p>
            <div className="mt-6 flex-1 rounded-lg border border-line bg-canvas p-3 sm:p-4">
              <Mock className="mx-auto max-w-sm" />
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export default HowItWorks;
