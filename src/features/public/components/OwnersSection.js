import { Bell, BarChart3, CalendarDays, Check, Eye, Smartphone, TrendingUp } from "lucide-react";
import ownersImage from "assets/images/bg-sign-in.png";
import ButtonLink from "shared/components/layout/ButtonLink";
import SectionHeader from "features/public/components/SectionHeader";

const ownerFeatures = [
  { icon: Eye, title: "Más visibilidad", description: "Llega a jugadores que buscan canchas en tu zona." },
  {
    icon: CalendarDays,
    title: "Gestión de reservas",
    description: "Confirma, rechaza y organiza todas tus reservas desde un panel centralizado.",
  },
  {
    icon: BarChart3,
    title: "Estadísticas",
    description: "Sigue el rendimiento de tus canchas con los reportes del panel.",
  },
  {
    icon: Smartphone,
    title: "Desde cualquier dispositivo",
    description: "Administra tu negocio desde el computador o desde el celular.",
  },
  {
    icon: TrendingUp,
    title: "Mejor ocupación",
    description: "Reduce los espacios vacíos y optimiza el uso de tus canchas.",
  },
  {
    icon: Bell,
    title: "Avisos de nuevas reservas",
    description: "Recibe notificaciones cuando llegue una reserva y no pierdas clientes.",
  },
];

const benefits = [
  "Sin comisiones iniciales: empieza gratis",
  "Configuración rápida en menos de 24 horas",
  "Soporte dedicado para tu negocio",
];

function OwnersSection() {
  return (
    <section id="duenos" className="scroll-mt-14 border-y border-line bg-white py-16 md:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <SectionHeader
              eyebrow="Para dueños de canchas"
              title="Impulsa tu negocio deportivo"
              description="Simplifica la administración de tus instalaciones y atrae más clientes con una plataforma todo en uno."
            />
            <ul className="mt-6 space-y-2.5">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2.5 text-sm text-fg">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" strokeWidth={2.5} aria-hidden="true" />
                  {benefit}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink to="/authentication/sign-up" variant="primary" size="lg">
                Registrarme como dueño
              </ButtonLink>
              <p className="text-xs text-fg-subtle">
                Nuestro equipo activa tu cuenta de asociado tras el registro.
              </p>
            </div>
          </div>

          <figure className="overflow-hidden rounded-lg border border-line bg-zinc-100">
            <img
              src={ownersImage}
              alt="Estadio de fútbol con luces al atardecer"
              className="aspect-[4/3] w-full object-cover"
              loading="lazy"
            />
          </figure>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ownerFeatures.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-lg border border-line bg-canvas p-5 transition-colors hover:border-line-strong"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-white text-primary-600">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-fg-strong">{title}</h3>
              <p className="mt-1.5 text-[13px] leading-5 text-fg-muted">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default OwnersSection;
