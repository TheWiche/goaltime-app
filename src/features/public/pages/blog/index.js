import { motion } from "framer-motion";
import PublicLayout from "shared/components/layout/PublicLayout";

const blogPosts = [
  {
    title: "5 Consejos para Elegir la Cancha Sintética Perfecta",
    excerpt: "Aprende a identificar el tipo de césped, la iluminación y otros factores clave para que tu próximo partido sea inolvidable.",
    image: "https://firebasestorage.googleapis.com/v0/b/goaltime-334a0.appspot.com/o/cancha1.jpg?alt=media&token=8540445f-4a00-4a81-9878-0d0505876402",
    date: "05 de Octubre, 2025",
  },
  {
    title: "Conviértete en Asociado GoalTime: Digitaliza tus Reservas",
    excerpt: "Descubre cómo nuestra plataforma te ayuda a maximizar la ocupación de tus canchas y reducir las llamadas.",
    image: "https://firebasestorage.googleapis.com/v0/b/goaltime-334a0.appspot.com/o/cancha2.jpg?alt=media&token=d14605e5-f481-4b13-a444-245842817d33",
    date: "28 de Septiembre, 2025",
  },
  {
    title: "Beneficios del Fútbol para la Salud",
    excerpt: "No es solo un juego. Conoce los beneficios físicos y mentales de jugar fútbol regularmente con tus amigos.",
    image: "https://firebasestorage.googleapis.com/v0/b/goaltime-334a0.appspot.com/o/cancha3.jpg?alt=media&token=98a3c89b-1e24-425b-a7e8-8a8d1681a9c3",
    date: "15 de Septiembre, 2025",
  },
];

function Blog() {
  return (
    <PublicLayout>
      <div className="bg-dark min-h-[25vh] flex items-center justify-center">
        <h1 className="text-white font-bold text-3xl md:text-4xl">Blog de GoalTime</h1>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <motion.div
              key={post.title}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="h-full"
            >
              <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover overflow-hidden flex flex-col h-full transition-shadow duration-200">
                <div className="overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-xs text-gray-400 mb-2">{post.date}</p>
                  <h3 className="font-bold text-dark text-lg mb-2 leading-snug">{post.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">{post.excerpt}</p>
                  <button
                    type="button"
                    className="w-full block text-center py-2.5 bg-goaltime hover:bg-goaltime-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-goaltime"
                  >
                    Leer Más
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}

export default Blog;
