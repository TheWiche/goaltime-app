import LegalPage, { LegalList, LegalSection } from "features/public/components/LegalPage";

function TermsOfService() {
  return (
    <LegalPage title="Términos y Condiciones" updated="13 de octubre de 2025">
      <p className="text-sm leading-6 text-fg-muted">
        Bienvenido a GoalTime. Estos Términos y Condiciones rigen tu uso de nuestra plataforma. Al acceder o usar
        nuestro servicio, aceptas cumplir con estos términos.
      </p>

      <LegalSection title="1. Descripción del servicio">
        <p>
          GoalTime es una plataforma intermediaria que conecta a usuarios que desean reservar instalaciones
          deportivas con los dueños de dichas instalaciones. No somos propietarios ni operamos ninguna de las canchas
          listadas.
        </p>
      </LegalSection>

      <LegalSection title="2. Cuentas de usuario y roles">
        <LegalList>
          <li>
            <strong className="font-medium text-fg">Cliente:</strong> rol por defecto. Permite visualizar y solicitar
            reservas en canchas aprobadas.
          </li>
          <li>
            <strong className="font-medium text-fg">Asociado:</strong> rol asignado por un administrador. Permite
            registrar y gestionar instalaciones deportivas.
          </li>
          <li>
            <strong className="font-medium text-fg">Responsabilidad:</strong> eres responsable de mantener la
            confidencialidad de tu contraseña y de toda la actividad en tu cuenta.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="3. Proceso de reserva">
        <p>
          Las reservas realizadas a través de GoalTime son un acuerdo entre el Cliente y el Asociado. GoalTime
          facilita esta conexión pero no se hace responsable de cancelaciones, disponibilidad o calidad de las
          instalaciones.
        </p>
      </LegalSection>

      <LegalSection title="4. Limitación de responsabilidad">
        <p>
          El servicio se proporciona tal cual. GoalTime no será responsable por ningún daño directo o indirecto que
          surja del uso de la plataforma.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

export default TermsOfService;
