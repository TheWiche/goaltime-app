import { Bell, CalendarCheck, Clock, Heart, ListChecks, Search } from "lucide-react";
import ButtonLink from "shared/components/layout/ButtonLink";
import { useAuth } from "shared/context/AuthContext";
import SectionHeader from "features/public/components/SectionHeader";

const features = [
  {
    icon: Search,
    title: "Encuentra tu cancha",
    description: "Explora las canchas disponibles con su información, fotos y precio por hora.",
  },
  {
    icon: CalendarCheck,
    title: "Reserva en línea",
    description: "Elige fecha y horario y envía tu solicitud sin llamadas ni mensajes.",
  },
  {
    icon: Clock,
    title: "Disponibilidad real",
    description: "Los horarios ocupados se bloquean al instante para evitar dobles reservas.",
  },
  {
    icon: Heart,
    title: "Tus favoritas",
    description: "Guarda las canchas que más usas y vuelve a ellas en un clic.",
  },
  {
    icon: Bell,
    title: "Avisos de tu reserva",
    description: "Recibe notificaciones y correos cuando cambie el estado de tu reserva.",
  },
  {
    icon: ListChecks,
    title: "Todo en un lugar",
    description: "Consulta, gestiona y cancela tus reservas desde tu cuenta.",
  },
];

function PlayersSection() {
  const { currentUser } = useAuth();

  return (
    <section id="jugadores" className="scroll-mt-14 bg-canvas py-16 md:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Para jugadores"
          title="Juega, reserva y disfruta"
          description="Encuentra, reserva y juega en las mejores canchas cerca de ti. Tu partido ideal comienza aquí."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-lg border border-line bg-white p-5 transition-colors hover:border-line-strong"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-zinc-50 text-primary-600">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-fg-strong">{title}</h3>
              <p className="mt-1.5 text-[13px] leading-5 text-fg-muted">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <ButtonLink to={currentUser ? "/canchas" : "/authentication/sign-in"} variant="primary" size="lg">
            Explorar canchas
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

export default PlayersSection;
