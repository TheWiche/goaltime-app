import PublicLayout from "shared/components/layout/PublicLayout";

const blogPosts = [
  {
    title: "5 consejos para elegir la cancha sintética perfecta",
    excerpt:
      "Aprende a identificar el tipo de césped, la iluminación y otros factores clave para que tu próximo partido sea inolvidable.",
    image:
      "https://firebasestorage.googleapis.com/v0/b/goaltime-334a0.appspot.com/o/cancha1.jpg?alt=media&token=8540445f-4a00-4a81-9878-0d0505876402",
    date: "5 de octubre de 2025",
  },
  {
    title: "Conviértete en asociado GoalTime: digitaliza tus reservas",
    excerpt:
      "Descubre cómo nuestra plataforma te ayuda a maximizar la ocupación de tus canchas y reducir las llamadas.",
    image:
      "https://firebasestorage.googleapis.com/v0/b/goaltime-334a0.appspot.com/o/cancha2.jpg?alt=media&token=d14605e5-f481-4b13-a444-245842817d33",
    date: "28 de septiembre de 2025",
  },
  {
    title: "Beneficios del fútbol para la salud",
    excerpt:
      "No es solo un juego. Conoce los beneficios físicos y mentales de jugar fútbol regularmente con tus amigos.",
    image:
      "https://firebasestorage.googleapis.com/v0/b/goaltime-334a0.appspot.com/o/cancha3.jpg?alt=media&token=98a3c89b-1e24-425b-a7e8-8a8d1681a9c3",
    date: "15 de septiembre de 2025",
  },
];

function Blog() {
  return (
    <PublicLayout>
      <div className="border-b border-line bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight text-fg-strong">Blog de GoalTime</h1>
          <p className="mt-2 max-w-xl text-[15px] leading-6 text-fg-muted">
            Consejos para jugadores y novedades para dueños de canchas.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 md:py-12 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <article
              key={post.title}
              className="flex flex-col overflow-hidden rounded-lg border border-line bg-white"
            >
              <img src={post.image} alt="" className="aspect-[16/9] w-full border-b border-line object-cover" loading="lazy" />
              <div className="flex flex-1 flex-col p-5">
                <time className="text-xs text-fg-subtle">{post.date}</time>
                <h2 className="mt-2 text-base font-semibold leading-snug text-fg-strong">{post.title}</h2>
                <p className="mt-2 text-[13px] leading-5 text-fg-muted">{post.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}

export default Blog;
