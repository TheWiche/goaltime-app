import PropTypes from "prop-types";
import { Trophy, ArrowRight } from "lucide-react";
import { Button } from "shared/components/ui";

function ClientWelcome({ onExplore }) {
  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
      <div className="w-full max-w-xl rounded-lg border border-line bg-white p-8 text-center sm:p-10">
        <div
          className="mx-auto mb-5 flex h-10 w-10 items-center justify-center rounded-md border border-primary-100 bg-primary-50 text-primary-700"
          aria-hidden="true"
        >
          <Trophy className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <p className="mb-1 text-xs font-medium text-fg-subtle">Bienvenido a GoalTime</p>
        <h1 className="text-2xl font-semibold tracking-tight text-fg-strong">
          Reserva canchas en segundos
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-fg-muted">
          Explora las canchas disponibles, elige fecha y horario y confirma tu reserva al instante.
        </p>
        <Button
          type="button"
          variant="cta"
          size="lg"
          className="mt-6"
          rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
          onClick={onExplore}
        >
          Ver canchas disponibles
        </Button>
      </div>
    </div>
  );
}

ClientWelcome.propTypes = { onExplore: PropTypes.func.isRequired };

export default ClientWelcome;
