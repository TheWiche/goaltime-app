import { CircleAlert, CircleCheck } from "lucide-react";
import PublicLayout from "shared/components/layout/PublicLayout";
import { Avatar } from "shared/components/ui";

const values = [
  {
    icon: CircleAlert,
    title: "El problema",
    description:
      "Llamadas interminables, mensajes sin respuesta y dudas sobre la disponibilidad. Los jugadores pierden tiempo buscando, y los dueños pierden potenciales clientes.",
  },
  {
    icon: CircleCheck,
    title: "La solución GoalTime",
    description:
      "Un puente que une ambos mundos. Ofrecemos una interfaz limpia y en tiempo real para reservar en segundos, y un panel de control intuitivo para los dueños.",
  },
];

const team = [{ name: "Nelson Cotes", title: "Desarrollador" }];

function AboutUs() {
  return (
    <PublicLayout>
      <div className="border-b border-line bg-white">
        <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 md:py-14">
          <h1 className="text-3xl font-semibold tracking-tight text-fg-strong">Sobre nosotros</h1>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-10 sm:px-6 md:py-12">
        <section className="rounded-lg border border-line bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight text-fg-strong">
            Nuestra misión: conectar tu pasión por el fútbol
          </h2>
          <p className="mt-3 text-sm leading-6 text-fg-muted">
            Bienvenido a <strong className="font-medium text-fg">GoalTime</strong>, la plataforma para los amantes del
            fútbol en Riohacha y más allá. Nacimos de una simple pregunta: ¿por qué es tan complicado encontrar y
            reservar una cancha para jugar un partido con amigos?
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          {values.map(({ icon: Icon, title, description }) => (
            <section key={title} className="rounded-lg border border-line bg-white p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-zinc-50 text-primary-600">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <h3 className="text-sm font-semibold text-fg-strong">{title}</h3>
              </div>
              <p className="mt-3 text-[13px] leading-5 text-fg-muted">{description}</p>
            </section>
          ))}
        </div>

        <section>
          <h2 className="text-lg font-semibold tracking-tight text-fg-strong">Conoce al equipo</h2>
          <div className="mt-4 flex flex-wrap gap-4">
            {team.map(({ name, title }) => (
              <div key={name} className="flex w-full items-center gap-4 rounded-lg border border-line bg-white p-4 sm:w-64">
                <Avatar name={name} size="lg" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-fg-strong">{name}</p>
                  <p className="text-[13px] text-fg-muted">{title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}

export default AboutUs;
