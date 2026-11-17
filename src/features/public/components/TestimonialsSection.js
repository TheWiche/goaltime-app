import { Avatar } from "shared/components/ui";
import SectionHeader from "features/public/components/SectionHeader";

const testimonials = [
  {
    quote:
      "GoalTime me ha facilitado mucho organizar partidos con mis amigos. La reserva es instantánea y siempre encuentro canchas cerca de mi zona.",
    author: "Carlos Mendoza",
    title: "Jugador amateur",
  },
  {
    quote:
      "Desde que uso GoalTime, mis canchas tienen un 40% más de ocupación. La plataforma es muy fácil de usar y el soporte es excelente.",
    author: "María González",
    title: "Propietaria · Complejo deportivo",
  },
  {
    quote:
      "Perfecto para mis entrenamientos semanales. Puedo reservar con anticipación y sé que siempre tendré un espacio asegurado para mi equipo.",
    author: "Roberto Silva",
    title: "Entrenador de fútbol",
  },
];

function TestimonialsSection() {
  return (
    <section id="testimonios" className="scroll-mt-14 bg-canvas py-16 md:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Testimonios"
          title="Lo que dicen jugadores y dueños"
          description="Así describen su experiencia quienes ya usan GoalTime para jugar y administrar canchas."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.author} className="flex flex-col rounded-lg border border-line bg-white p-5">
              <blockquote className="flex-1 text-sm leading-6 text-fg">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-line-subtle pt-4">
                <Avatar name={t.author} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-fg-strong">{t.author}</p>
                  <p className="truncate text-xs text-fg-subtle">{t.title}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
