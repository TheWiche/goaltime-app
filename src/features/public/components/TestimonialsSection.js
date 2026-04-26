import { motion } from "framer-motion";
import { useSectionEntrance } from "shared/hooks/useGSAPAnimations";
import team2 from "assets/images/team-2.jpg";
import team3 from "assets/images/team-3.jpg";
import team4 from "assets/images/team-4.jpg";

const testimonials = [
  {
    quote: "GoalTime me ha facilitado mucho organizar partidos con mis amigos. La reserva es instantánea y siempre encuentro canchas cerca de mi zona.",
    author: "Carlos Mendoza",
    title: "Jugador Amateur",
    avatar: team2,
  },
  {
    quote: "Desde que uso GoalTime, mis canchas tienen un 40% más de ocupación. La plataforma es muy fácil de usar y el soporte es excelente.",
    author: "María González",
    title: "Propietaria - Complejo Deportivo",
    avatar: team3,
  },
  {
    quote: "Perfecto para mis entrenamientos semanales. Puedo reservar con anticipación y sé que siempre tendré un espacio asegurado para mi equipo.",
    author: "Roberto Silva",
    title: "Entrenador de Fútbol",
    avatar: team4,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

function TestimonialsSection() {
  const headerRef = useSectionEntrance({ y: 20 });

  return (
    <section
      id="testimonios"
      className="py-16"
      style={{ background: "linear-gradient(180deg, #fff 0%, #f0f2f5 100%)" }}
    >
      <div className="container mx-auto px-4">
        {/* Cabecera */}
        <div ref={headerRef} className="text-center mb-12">
          <span className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
            Historias de Éxito
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-dark mb-3">
            Opiniones Reales, Resultados Reales
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Descubre cómo GoalTime transforma la experiencia de jugadores y dueños de canchas en toda la comunidad deportiva.
          </p>
        </div>

        {/* Testimonios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              whileHover={{ y: -4 }}
            >
              <div className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 h-full flex flex-col">
                {/* Estrellas */}
                <div className="flex gap-0.5 text-yellow-400 mb-3">
                  {"★★★★★".split("").map((s, j) => <span key={j}>{s}</span>)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-4">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="border-t border-gray-100 pt-4 flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.author}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div>
                    <p className="font-semibold text-dark text-sm">{t.author}</p>
                    <p className="text-xs text-gray-400">{t.title}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Rating promedio */}
        <div className="flex justify-center items-center gap-2 mt-10">
          <span className="text-yellow-400 text-xl">★</span>
          <p className="text-sm text-gray-500">
            Calificación promedio: <strong className="text-dark">4.9/5</strong> de 2,500+ reseñas
          </p>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
