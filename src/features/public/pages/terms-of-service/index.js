import LegalPage from "features/public/components/LegalPage";

function TermsOfService() {
  return (
    <LegalPage title="Términos y Condiciones">
      <h2 className="text-2xl font-bold text-goaltime mb-1">Términos y Condiciones</h2>
      <p className="text-xs text-gray-400 mb-4">Fecha de última actualización: 13 de Octubre, 2025</p>
      <div className="border-b border-gray-100 mb-6" />

      <p className="text-gray-600 leading-relaxed mb-6">
        Bienvenido a GoalTime. Estos Términos y Condiciones rigen tu uso de nuestra plataforma. Al acceder o usar nuestro servicio, aceptas cumplir con estos términos.
      </p>

      <h3 className="font-bold text-dark text-lg mb-2">1. Descripción del Servicio</h3>
      <p className="text-gray-600 text-sm leading-relaxed mb-5">
        GoalTime es una plataforma intermediaria que conecta a usuarios que desean reservar instalaciones deportivas, con los dueños de dichas instalaciones. No somos propietarios ni operamos ninguna de las canchas listadas.
      </p>

      <h3 className="font-bold text-dark text-lg mb-2">2. Cuentas de Usuario y Roles</h3>
      <ul className="list-disc list-inside text-gray-600 text-sm leading-relaxed space-y-1 mb-5">
        <li><strong>Cliente:</strong> Rol por defecto. Permite visualizar y solicitar reservas en canchas aprobadas.</li>
        <li><strong>Asociado:</strong> Rol asignado por un administrador. Permite registrar y gestionar instalaciones deportivas.</li>
        <li><strong>Responsabilidad:</strong> Eres responsable de mantener la confidencialidad de tu contraseña y de toda la actividad en tu cuenta.</li>
      </ul>

      <h3 className="font-bold text-dark text-lg mb-2">3. Proceso de Reserva</h3>
      <p className="text-gray-600 text-sm leading-relaxed mb-5">
        Las reservas realizadas a través de GoalTime son un acuerdo entre el Cliente y el Asociado. GoalTime facilita esta conexión pero no se hace responsable de cancelaciones, disponibilidad o calidad de las instalaciones.
      </p>

      <h3 className="font-bold text-dark text-lg mb-2">4. Limitación de Responsabilidad</h3>
      <p className="text-gray-600 text-sm leading-relaxed">
        El servicio se proporciona tal cual. GoalTime no será responsable por ningún daño directo o indirecto que surja del uso de la plataforma.
      </p>
    </LegalPage>
  );
}

export default TermsOfService;
