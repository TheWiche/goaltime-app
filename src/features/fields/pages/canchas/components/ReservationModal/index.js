import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import {
  CalendarCheck2,
  Clock,
  CircleCheck,
  Info,
  Calendar,
  Banknote,
  MapPin,
  Zap,
} from "lucide-react";
import Spinner from "shared/components/ui/Spinner";
import { Modal, Button, TextField, SelectField, SectionCard } from "shared/components/ui";
import { getAvailableTimeSlots } from "shared/services/firebaseService";

const DURATION_OPTIONS = [
  { value: "1", label: "1 hora" },
  { value: "2", label: "2 horas" },
  { value: "3", label: "3 horas" },
  { value: "4", label: "4 horas" },
  { value: "5", label: "5 horas" },
  { value: "6", label: "6 horas" },
];

function getTomorrowISO() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
}

function ReservationModal({ open, onClose, onSubmit, loading, field }) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState("1");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedDate(getTomorrowISO());
      setSelectedTime("");
      setDuration("1");
      setAvailableTimes([]);
    } else if (open && !selectedDate) {
      setSelectedDate(getTomorrowISO());
    }
  }, [open, selectedDate]);

  useEffect(() => {
    const loadAvailableTimes = async () => {
      if (!open || !field || !selectedDate || !field.openingTime || !field.closingTime) {
        setAvailableTimes([]);
        return;
      }
      setLoadingTimes(true);
      try {
        const times = await getAvailableTimeSlots(
          field.id,
          selectedDate,
          field.openingTime,
          field.closingTime
        );
        setAvailableTimes(times);
        if (selectedTime && !times.includes(selectedTime)) setSelectedTime("");
      } catch (error) {
        console.error("Error al cargar horas disponibles:", error);
        setAvailableTimes([]);
      } finally {
        setLoadingTimes(false);
      }
    };
    loadAvailableTimes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, field, selectedDate]);

  const totalPrice = useMemo(
    () => (field ? field.pricePerHour * parseInt(duration, 10) : 0),
    [field, duration]
  );

  const endTime = useMemo(() => {
    if (!selectedTime) return null;
    const [hours, minutes] = selectedTime.split(":").map(Number);
    const start = new Date();
    start.setHours(hours, minutes, 0);
    start.setHours(start.getHours() + parseInt(duration, 10));
    return `${start.getHours().toString().padStart(2, "0")}:${start
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  }, [selectedTime, duration]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (loading || !selectedDate || !selectedTime || !field) return;
    onSubmit({
      fieldId: field.id,
      fieldName: field.name,
      date: selectedDate,
      startTime: selectedTime,
      endTime,
      duration: parseInt(duration, 10),
      totalPrice,
    });
  };

  if (!field) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="2xl"
      variant="hero"
      eyebrow="Reservar cancha"
      title={field.name}
      subtitle={field.address}
      icon={<CalendarCheck2 className="h-6 w-6 shrink-0" strokeWidth={2} aria-hidden />}
      bodyClassName="bg-slate-50 px-0 py-0"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="reservation-form"
            variant="primary"
            loading={loading}
            disabled={loading || !selectedTime}
          >
            <CircleCheck className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
            Confirmar reserva · ${totalPrice.toFixed(2)}
          </Button>
        </>
      }
    >
      <form
        id="reservation-form"
        onSubmit={handleSubmit}
        className="px-6 sm:px-8 py-7 grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        <div className="lg:col-span-8 space-y-5">
          <SectionCard
            eyebrow="Paso 1"
            title="Fecha y duración"
            icon={<Calendar className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <TextField
                id="reservation-date"
                label="Fecha de reserva"
                type="date"
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getTomorrowISO()}
                hint="Solo a partir de mañana."
              />
              <SelectField
                id="reservation-duration"
                label="Duración"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                options={DURATION_OPTIONS}
              />
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Paso 2"
            title="Hora de inicio"
            subtitle={
              loadingTimes
                ? "Cargando horarios disponibles..."
                : `${availableTimes.length} hora(s) disponible(s) para esta fecha.`
            }
            icon={<Clock className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />}
          >
            {loadingTimes ? (
              <div className="flex items-center justify-center py-10 text-slate-500 gap-3">
                <Spinner size="sm" />
                <span className="text-sm">Cargando horas disponibles…</span>
              </div>
            ) : availableTimes.length === 0 ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-4 flex items-start gap-3">
                <Info className="h-[22px] w-[22px] shrink-0 text-rose-700" strokeWidth={2} aria-hidden />
                <div>
                  <p className="text-sm font-semibold text-rose-900">
                    Sin horarios disponibles
                  </p>
                  <p className="text-xs text-rose-800 mt-0.5">
                    Selecciona otra fecha para ver opciones.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 max-h-72 overflow-y-auto pr-1 -mr-1">
                {availableTimes.map((time) => {
                  const active = selectedTime === time;
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={[
                        "relative flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 cursor-pointer",
                        "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20",
                        active
                          ? "bg-primary text-white border-primary shadow-md"
                          : "bg-white text-slate-700 border-slate-200 hover:border-primary/50 hover:text-primary hover:bg-primary-50/40",
                      ].join(" ")}
                    >
                      <Clock
                        className={active ? "h-3.5 w-3.5 opacity-90" : "h-3.5 w-3.5 opacity-60"}
                        strokeWidth={2}
                        aria-hidden
                      />
                      {time}
                    </button>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>

        <aside className="lg:col-span-4 space-y-5">
          <SectionCard
            eyebrow="Resumen"
            title="Tu reserva"
            icon={<Zap className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />}
          >
            <SummaryRow
              icon={<MapPin className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />}
              label="Cancha"
              value={field.name}
            />
            <SummaryRow
              icon={<Calendar className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />}
              label="Fecha"
              value={
                selectedDate
                  ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString("es-ES", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })
                  : "—"
              }
            />
            <SummaryRow
              icon={<Clock className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />}
              label="Horario"
              value={selectedTime ? `${selectedTime} – ${endTime}` : "Sin selección"}
            />
            <SummaryRow
              icon={<Clock className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />}
              label="Duración"
              value={`${duration} hora(s)`}
            />
            <SummaryRow
              icon={<Banknote className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />}
              label="Tarifa"
              value={`$${field.pricePerHour}/h`}
            />

            <div className="mt-4 rounded-xl bg-gradient-to-br from-primary-900 via-primary to-secondary text-white p-4">
              <p className="text-[11px] uppercase tracking-wider text-white/70 font-semibold">
                Total a pagar
              </p>
              <p className="text-3xl font-bold font-heading mt-0.5">
                ${totalPrice.toFixed(2)}
              </p>
              <p className="text-xs text-white/70 mt-1">
                Pago presencial al llegar a la cancha.
              </p>
            </div>
          </SectionCard>
        </aside>
      </form>
    </Modal>
  );
}

function SummaryRow({ icon, label, value }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
        {icon}
        {label}
      </span>
      <span className="text-sm font-medium text-slate-900 text-right ml-2 truncate max-w-[55%]">
        {value}
      </span>
    </div>
  );
}

SummaryRow.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
};

ReservationModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  field: PropTypes.object,
};

ReservationModal.defaultProps = { loading: false, field: null };

export default ReservationModal;
