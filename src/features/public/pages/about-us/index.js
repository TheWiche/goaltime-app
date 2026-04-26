import PublicLayout from "shared/components/layout/PublicLayout";
import { useSectionEntrance } from "shared/hooks/useGSAPAnimations";

const values = [
  {
    emoji: "⚠️",
    title: "El Problema",
    description: "Llamadas interminables, mensajes sin respuesta y dudas sobre la disponibilidad. Los jugadores pierden tiempo buscando, y los dueños pierden potenciales clientes.",
  },
  {
    emoji: "✅",
    title: "La Solución GoalTime",
    description: "Un puente que une ambos mundos. Ofrecemos una interfaz limpia y en tiempo real para reservar en segundos, y un panel de control intuitivo para los dueños.",
  },
];

const team = [
  { name: "Nelson Cotes", title: "Desarrollador" },
];

function getInitials(fullName) {
  const parts = fullName.trim().split(" ");
  return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : fullName.slice(0, 2).toUpperCase();
}

function AboutUs() {
  const ref = useSectionEntrance({ y: 24 });

  return (
    <PublicLayout>
      {/* Hero */}
      <div className="bg-dark min-h-[25vh] flex items-center justify-center">
        <h1 className="text-white font-bold text-3xl md:text-4xl">Sobre Nosotros</h1>
      </div>

      {/* Content */}
      <div ref={ref} className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Misión */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-8">
          <h2 className="text-2xl font-bold text-goaltime mb-4">
            Nuestra Misión: Conectar tu Pasión por el Fútbol
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Bienvenido a <strong>GoalTime</strong>, la plataforma definitiva para los amantes del fútbol en Riohacha y más allá. Nacimos de una simple pregunta: ¿por qué es tan complicado encontrar y reservar una cancha para jugar un partido con amigos?
          </p>
        </div>

        {/* Problema / Solución */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          {values.map(({ emoji, title, description }) => (
            <div key={title} className="bg-white rounded-2xl shadow-card p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{emoji}</span>
                <h3 className="font-bold text-dark text-lg">{title}</h3>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        {/* Equipo */}
        <h2 className="text-2xl font-bold text-dark text-center mb-6">Conoce al Equipo</h2>
        <div className="flex justify-center gap-5 flex-wrap">
          {team.map(({ name, title }) => (
            <div key={name} className="bg-white rounded-2xl shadow-card p-6 text-center w-48">
              <div className="w-20 h-20 rounded-full bg-goaltime-100 text-goaltime-700 text-2xl font-bold flex items-center justify-center mx-auto mb-3">
                {getInitials(name)}
              </div>
              <p className="font-bold text-dark">{name}</p>
              <p className="text-sm text-goaltime font-medium">{title}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}

export default AboutUs;
