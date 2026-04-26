import LegalPage from "features/public/components/LegalPage";

function PrivacyPolicy() {
  return (
    <LegalPage title="Política de Privacidad">
      <h2 className="text-2xl font-bold text-goaltime mb-1">Política de Privacidad</h2>
      <p className="text-xs text-gray-400 mb-4">Fecha de última actualización: 13 de Octubre, 2025</p>
      <div className="border-b border-gray-100 mb-6" />

      <p className="text-gray-600 leading-relaxed mb-6">
        Bienvenido a GoalTime. Nos comprometemos a proteger tu privacidad. Esta política explica qué información recopilamos, cómo la usamos y qué derechos tienes en relación con ella.
      </p>

      <h3 className="font-bold text-dark text-lg mb-3">1. Información que Recopilamos</h3>
      <ul className="list-disc list-inside text-gray-600 text-sm leading-relaxed space-y-1 mb-6">
        <li><strong>Información de Registro:</strong> Nombre, dirección de correo electrónico y contraseña al crear una cuenta.</li>
        <li><strong>Información de Proveedores Sociales:</strong> Si usas Google, recibiremos la información que autorices (nombre, email, foto de perfil).</li>
        <li><strong>Datos de Asociado:</strong> Si solicitas ser asociado, información adicional sobre tu negocio (nombre comercial, teléfono).</li>
      </ul>

      <h3 className="font-bold text-dark text-lg mb-3">2. Cómo Usamos tu Información</h3>
      <ul className="list-disc list-inside text-gray-600 text-sm leading-relaxed space-y-1 mb-6">
        <li><strong>Para Proveer y Mejorar el Servicio:</strong> Crear y mantener tu cuenta, facilitar reservas y personalizar tu experiencia.</li>
        <li><strong>Comunicación:</strong> Enviarte notificaciones importantes sobre tus reservas, cuenta o cambios en los términos.</li>
        <li><strong>Seguridad:</strong> Proteger la plataforma y a nuestros usuarios contra el fraude y el abuso.</li>
      </ul>

      <h3 className="font-bold text-dark text-lg mb-3">3. Contacto</h3>
      <p className="text-gray-600 text-sm">
        Si tienes alguna pregunta sobre esta Política de Privacidad, contáctanos en{" "}
        <a href="mailto:soporte@goaltime.site" className="text-goaltime font-medium hover:underline">
          soporte@goaltime.site
        </a>.
      </p>
    </LegalPage>
  );
}

export default PrivacyPolicy;
