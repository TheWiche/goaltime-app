import { Link as RouterLink } from "react-router-dom";
import logo from "assets/images/Logo.png";

function HomepageFooter() {
  return (
    <footer className="bg-dark py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
          {/* Logo + descripción */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src={logo} alt="GoalTime Logo" className="w-8 h-8 object-contain" />
              <span className="text-white font-bold text-lg">GoalTime</span>
            </div>
            <p className="text-white/70 text-sm max-w-xs leading-relaxed">
              Tu plataforma de confianza para encontrar y gestionar canchas deportivas.
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/60 text-xs">
            © {new Date().getFullYear()} GoalTime. Todos los derechos reservados.
          </p>
          <div className="flex gap-5">
            <RouterLink
              to="/politica-de-privacidad"
              className="text-white/60 text-xs hover:text-white transition-colors"
            >
              Política de Privacidad
            </RouterLink>
            <RouterLink
              to="/terminos-y-condiciones"
              className="text-white/60 text-xs hover:text-white transition-colors"
            >
              Términos y Condiciones
            </RouterLink>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default HomepageFooter;
