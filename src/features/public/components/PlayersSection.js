import { Link } from "react-router-dom";
import { useAuth } from "shared/context/AuthContext";
import { useSectionEntrance, useFieldCardsStagger } from "shared/hooks/useGSAPAnimations";

const iconColors = {
  info: "bg-blue-100 text-blue-600",
  success: "bg-goaltime-100 text-goaltime-700",
  primary: "bg-purple-100 text-purple-600",
  secondary: "bg-gray-100 text-gray-600",
  warning: "bg-orange-100 text-orange-600",
  error: "bg-red-100 text-red-600",
};

const features = [
  {
    emoji: "🔍",
    title: "Búsqueda Fácil",
    description: "Encuentra canchas por deporte, ubicación y disponibilidad en segundos.",
    color: "info",
  },
  {
    emoji: "⚡",
    title: "Reserva Instantánea",
    description: "Confirma tu reserva al instante sin llamadas ni esperas.",
    color: "success",
  },
  {
    emoji: "📍",
    title: "Cerca de Ti",
    description: "Descubre las mejores canchas en tu área con mapas integrados.",
    color: "primary",
  },
  {
    emoji: "🕐",
    title: "Horarios Flexibles",
    description: "Reserva en el horario que mejor se adapte a tu agenda.",
    color: "secondary",
  },
  {
    emoji: "⚽",
    title: "Múltiples Deportes",
    description: "Fútbol, pádel, baloncesto, tenis y más en una sola plataforma.",
    color: "warning",
  },
  {
    emoji: "✅",
    title: "Reseñas Verificadas",
    description: "Lee opiniones de otros jugadores para elegir la mejor opción.",
    color: "error",
  },
];

function PlayersSection() {
  const { currentUser } = useAuth();
  const headerRef = useSectionEntrance({ y: 20 });
  const cardsRef = useFieldCardsStagger(".feature-card");

  return (
    <section id="jugadores" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Cabecera */}
        <div ref={headerRef} className="text-center mb-12">
          <span className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
            Soluciones para Jugadores
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-dark mb-3">
            Juega, Reserva y Disfruta
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Encuentra, reserva y juega en las mejores canchas deportivas cerca de ti. ¡Tu partido
            ideal comienza aquí!
          </p>
        </div>

        {/* Grid de características con stagger GSAP */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="feature-card bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200"
            >
              <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-xl text-2xl ${
                  iconColors[feature.color]
                } mb-4`}
              >
                {feature.emoji}
              </div>
              <h3 className="font-semibold text-dark text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex justify-center mt-10">
          <Link
            to={currentUser ? "/canchas" : "/authentication/sign-in"}
            className="inline-flex items-center gap-2 bg-goaltime hover:bg-goaltime-500 text-white font-semibold px-7 py-3 rounded-xl shadow-goaltime transition-all duration-200 hover:scale-105 active:scale-95"
          >
            🌐 Explora Canchas
          </Link>
        </div>
      </div>
    </section>
  );
}

export default PlayersSection;
