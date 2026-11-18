import LegalPage, { LegalList, LegalSection } from "features/public/components/LegalPage";

function PrivacyPolicy() {
  return (
    <LegalPage title="Política de Privacidad" updated="13 de octubre de 2025">
      <p className="text-sm leading-6 text-fg-muted">
        Bienvenido a GoalTime. Nos comprometemos a proteger tu privacidad. Esta política explica qué información
        recopilamos, cómo la usamos y qué derechos tienes en relación con ella.
      </p>

      <LegalSection title="1. Información que recopilamos">
        <LegalList>
          <li>
            <strong className="font-medium text-fg">Información de registro:</strong> nombre, dirección de correo
            electrónico y contraseña al crear una cuenta.
          </li>
          <li>
            <strong className="font-medium text-fg">Información de proveedores sociales:</strong> si usas Google,
            recibiremos la información que autorices (nombre, correo, foto de perfil).
          </li>
          <li>
            <strong className="font-medium text-fg">Datos de asociado:</strong> si solicitas ser asociado,
            información adicional sobre tu negocio (nombre comercial, teléfono).
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="2. Cómo usamos tu información">
        <LegalList>
          <li>
            <strong className="font-medium text-fg">Proveer y mejorar el servicio:</strong> crear y mantener tu
            cuenta, facilitar reservas y personalizar tu experiencia.
          </li>
          <li>
            <strong className="font-medium text-fg">Comunicación:</strong> enviarte notificaciones importantes sobre
            tus reservas, tu cuenta o cambios en los términos.
          </li>
          <li>
            <strong className="font-medium text-fg">Seguridad:</strong> proteger la plataforma y a nuestros usuarios
            contra el fraude y el abuso.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="3. Contacto">
        <p>
          Si tienes alguna pregunta sobre esta Política de Privacidad, contáctanos en{" "}
          <a href="mailto:equipo@goaltime.site" className="font-medium text-primary-600 hover:underline">
            equipo@goaltime.site
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}

export default PrivacyPolicy;
