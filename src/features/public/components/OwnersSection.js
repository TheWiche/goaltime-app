import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ownersImage from "assets/images/bg-sign-up-cover.png";
import { useSectionEntrance, useFieldCardsStagger } from "shared/hooks/useGSAPAnimations";

const ownerFeatures = [
  { emoji: "👁️", title: "Aumenta tu Visibilidad", description: "Llega a miles de jugadores activos buscando canchas en tu área.", color: "blue" },
  { emoji: "📅", title: "Gestión de Reservas", description: "Administra todas tus reservas desde un panel intuitivo y centralizado.", color: "blue" },
  { emoji: "📊", title: "Estadísticas en Tiempo Real", description: "Analiza el rendimiento de tu negocio con reportes detallados.", color: "dark" },
  { emoji: "📱", title: "Acceso Móvil", description: "Gestiona tu negocio desde cualquier lugar con nuestra app móvil.", color: "green" },
  { emoji: "💰", title: "Maximiza Ingresos", description: "Reduce espacios vacíos y optimiza la ocupación de tus canchas.", color: "orange" },
  { emoji: "⚙️", title: "Automatización", description: "Confirma reservas automáticamente y reduce el trabajo manual.", color: "red" },
];

const benefits = [
  "Sin comisiones iniciales - Empieza gratis",
  "Configuración rápida en menos de 24 horas",
  "Soporte dedicado para tu negocio",
];

function OwnersSection() {
  const headerRef = useSectionEntrance({ y: 20 });
  const cardsRef = useFieldCardsStagger(".owner-card");

  return (
    <section id="duenos" className="py-16 bg-surface">
      <div className="container mx-auto px-4">
        {/* Intro */}
        <div ref={headerRef} className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-16">
          {/* Texto */}
          <div>
            <span className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
              Soluciones para Dueños
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              Impulsa tu Negocio Deportivo
            </h2>
            <p className="text-gray-500 mb-6 leading-relaxed">
              Simplifica la administración de tus instalaciones deportivas y atrae más clientes con nuestra plataforma todo en uno.
            </p>
            <ul className="space-y-2 mb-7">
              {benefits.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm text-dark">
                  <span className="text-goaltime font-bold">✓</span>
                  {b}
                </li>
              ))}
            </ul>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} style={{ display: "inline-block" }}>
              <Link
                to="/become-associate"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200"
              >
                Conoce Más para Dueños
              </Link>
            </motion.div>
          </div>

          {/* Imagen */}
          <div className="relative rounded-2xl overflow-hidden shadow-card-hover">
            <img
              src={ownersImage}
              alt="Panel de control de GoalTime"
              className="w-full h-80 object-cover"
            />
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-5">
              <p className="text-white font-semibold">Panel de Control Intuitivo</p>
              <p className="text-white/75 text-sm">Reseñas | Analytics</p>
            </div>
          </div>
        </div>

        {/* Grid características con GSAP stagger */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ownerFeatures.map((feature) => (
            <div
              key={feature.title}
              className="owner-card bg-white border border-gray-100 rounded-2xl p-5 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200"
            >
              <div className="text-2xl mb-3">{feature.emoji}</div>
              <h3 className="font-semibold text-dark mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default OwnersSection;
