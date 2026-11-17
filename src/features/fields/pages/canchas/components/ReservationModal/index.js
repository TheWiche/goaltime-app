import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { AlertTriangle, CalendarCheck2, CalendarX } from "lucide-react";
import {
  Button,
  EmptyState,
  Modal,
  Select,
  Skeleton,
  TextField,
  Textarea,
  cx,
  focusRing,
} from "shared/components/ui";
import { getAvailableTimeSlots, MAX_RESERVATION_HOURS } from "shared/services/firebaseService";
import {
  addDaysISO,
  addHoursToTime,
  compareISODate,
  formatDateEs,
  isValidISODate,
  isValidTime,
  minutesFromTime,
  todayLocalISO,
  tomorrowLocalISO,
} from "shared/utils/date";
import { formatCurrency } from "shared/utils/format";

const MAX_DAYS_AHEAD = 90;
/** Si la fecha es hoy, solo se ofrecen franjas que empiecen al menos con este margen (min). */
const TODAY_MARGIN_MINUTES = 30;

const DURATION_OPTIONS = Array.from({ length: MAX_RESERVATION_HOURS || 6 }, (_, i) => ({
  value: String(i + 1),
  label: i === 0 ? "1 hora" : `${i + 1} horas`,
}));

const DAY_PARTS = [
  { key: "morning", label: "Mañana", test: (m) => m < 12 * 60 },
  { key: "afternoon", label: "Tarde", test: (m) => m >= 12 * 60 && m < 18 * 60 },
  { key: "night", label: "Noche", test: (m) => m >= 18 * 60 },
];

const INITIAL_SLOTS = { status: "idle", times: [], error: "" };

function SlotsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-9" />
      ))}
    </div>
  );
}

function ReservationModal({ open, onClose, onSubmit, loading = false, field = null }) {
  const [date, setDate] = useState(tomorrowLocalISO);
  const [duration, setDuration] = useState("1");
  const [startTime, setStartTime] = useState("");
  const [notes, setNotes] = useState("");
  const [slots, setSlots] = useState(INITIAL_SLOTS);
  const [reloadKey, setReloadKey] = useState(0);
  const [formError, setFormError] = useState("");

  const fieldId = field?.id;
  const openingTime = field?.openingTime;
  const closingTime = field?.closingTime;
  const durationHours = Number(duration);
  const minDate = todayLocalISO();
  const maxDate = addDaysISO(minDate, MAX_DAYS_AHEAD);

  const hoursValid =
    isValidTime(openingTime) &&
    isValidTime(closingTime) &&
    minutesFromTime(openingTime) < minutesFromTime(closingTime);

  // Reinicia el formulario al abrir (o al cambiar de cancha).
  useEffect(() => {
    if (!open) return;
    setDate(tomorrowLocalISO());
    setDuration("1");
    setStartTime("");
    setNotes("");
    setFormError("");
    setSlots(INITIAL_SLOTS);
  }, [open, fieldId]);

  // Carga de horarios disponibles. Ignora respuestas tardías (flag `cancelled`).
  useEffect(() => {
    if (!open || !fieldId) return undefined;
    if (!hoursValid) {
      setSlots({ status: "error", times: [], error: "La cancha no tiene un horario válido configurado." });
      return undefined;
    }
    if (!isValidISODate(date) || compareISODate(date, minDate) < 0) {
      setSlots({ status: "error", times: [], error: "Selecciona una fecha a partir de hoy." });
      return undefined;
    }

    let cancelled = false;
    setSlots({ status: "loading", times: [], error: "" });
    getAvailableTimeSlots(fieldId, date, openingTime, closingTime, durationHours)
      .then((times) => {
        if (cancelled) return;
        const close = minutesFromTime(closingTime);
        // Defensa adicional: el fin (inicio + duración) no puede pasar del cierre.
        // Si es hoy, además se descartan las franjas cuyo inicio ya pasó (con margen).
        const now = new Date();
        const earliestToday = now.getHours() * 60 + now.getMinutes() + TODAY_MARGIN_MINUTES;
        const isToday = date === todayLocalISO();
        const valid = (Array.isArray(times) ? times : []).filter((t) => {
          const end = addHoursToTime(t, durationHours);
          if (end === null || minutesFromTime(end) > close) return false;
          return !isToday || minutesFromTime(t) >= earliestToday;
        });
        setSlots({ status: "ready", times: valid, error: "" });
        setStartTime((prev) => (valid.includes(prev) ? prev : ""));
      })
      .catch((error) => {
        if (cancelled) return;
        setSlots({
          status: "error",
          times: [],
          error: error?.message || "No se pudo consultar la disponibilidad.",
        });
        setStartTime("");
      });
    return () => {
      cancelled = true;
    };
  }, [open, fieldId, date, durationHours, openingTime, closingTime, hoursValid, minDate, reloadKey]);

  const endTime = startTime ? addHoursToTime(startTime, durationHours) : null;

  const pricePerHour = useMemo(() => {
    const n = Number(field?.pricePerHour);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [field?.pricePerHour]);
  const totalPrice = Math.round(pricePerHour * (Number.isFinite(durationHours) ? durationHours : 0));

  const groupedSlots = useMemo(
    () =>
      DAY_PARTS.map((part) => ({
        ...part,
        times: slots.times.filter((t) => part.test(minutesFromTime(t))),
      })).filter((g) => g.times.length > 0),
    [slots.times]
  );

  if (!field) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (loading) return;
    if (!startTime) {
      setFormError("Selecciona una hora de inicio.");
      return;
    }
    if (!endTime || minutesFromTime(endTime) > minutesFromTime(closingTime)) {
      setFormError(`La reserva debe terminar antes del cierre (${closingTime}).`);
      return;
    }
    setFormError("");
    onSubmit({
      fieldId: field.id,
      fieldName: field.name,
      date,
      startTime,
      endTime,
      duration: durationHours,
      notes: notes.trim() || undefined,
    });
  };

  const summary = [
    ["Fecha", formatDateEs(date, { weekday: "long", day: "numeric", month: "long" }, "—")],
    ["Horario", startTime && endTime ? `${startTime} – ${endTime}` : "Sin seleccionar"],
    ["Duración", DURATION_OPTIONS.find((o) => o.value === duration)?.label || "—"],
    ["Tarifa", pricePerHour ? `${formatCurrency(pricePerHour)} / h` : "—"],
  ];

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      size="xl"
      title={`Reservar ${field.name || "cancha"}`}
      subtitle={field.address}
      icon={<CalendarCheck2 className="h-4 w-4" aria-hidden />}
      footerSticky
      footer={
        <>
          {formError && (
            <p className="text-xs text-red-600 sm:mr-auto" role="alert">
              {formError}
            </p>
          )}
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="reservation-form"
            variant="cta"
            loading={loading}
            disabled={!startTime || slots.status !== "ready"}
          >
            Reservar · <span className="tabular">{formatCurrency(totalPrice)}</span>
          </Button>
        </>
      }
    >
      <form
        id="reservation-form"
        onSubmit={handleSubmit}
        noValidate
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]"
      >
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="reservation-date"
              label="Fecha"
              type="date"
              required
              value={date}
              min={minDate}
              max={maxDate}
              onChange={(e) => {
                setDate(e.target.value);
                setFormError("");
              }}
              hint="Desde hoy (horas futuras)."
              disabled={loading}
            />
            <Select
              id="reservation-duration"
              label="Duración"
              required
              value={duration}
              onChange={(e) => {
                setDuration(e.target.value);
                setFormError("");
              }}
              options={DURATION_OPTIONS}
              disabled={loading}
            />
          </section>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <p id="reservation-slots-label" className="text-[13px] font-medium leading-5 text-fg">
                Hora de inicio
              </p>
              {hoursValid && (
                <span className="tabular text-xs text-fg-subtle">
                  Abierto {openingTime} – {closingTime}
                </span>
              )}
            </div>
            <div role="group" aria-labelledby="reservation-slots-label" aria-busy={slots.status === "loading"}>
              {slots.status === "loading" || slots.status === "idle" ? (
                <SlotsSkeleton />
              ) : slots.status === "error" ? (
                <EmptyState
                  size="sm"
                  icon={AlertTriangle}
                  title="No pudimos cargar los horarios"
                  description={slots.error}
                  action={
                    hoursValid ? (
                      <Button type="button" size="sm" variant="secondary" onClick={() => setReloadKey((k) => k + 1)}>
                        Reintentar
                      </Button>
                    ) : null
                  }
                />
              ) : slots.times.length === 0 ? (
                <EmptyState
                  size="sm"
                  icon={CalendarX}
                  title="Sin horarios disponibles"
                  description="Prueba con otra fecha o una duración más corta."
                />
              ) : (
                <div className="space-y-3">
                  {groupedSlots.map((group) => (
                    <div key={group.key}>
                      <p className="mb-1.5 text-xs font-medium text-fg-subtle">{group.label}</p>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                        {group.times.map((time) => {
                          const active = startTime === time;
                          return (
                            <button
                              key={time}
                              type="button"
                              aria-pressed={active}
                              disabled={loading}
                              onClick={() => {
                                setStartTime(time);
                                setFormError("");
                              }}
                              className={cx(
                                "tabular h-9 rounded-md border text-sm font-medium transition-colors duration-150",
                                "disabled:cursor-not-allowed disabled:opacity-50",
                                focusRing,
                                active
                                  ? "border-primary-600 bg-primary-600 text-white"
                                  : "border-line-strong bg-white text-fg hover:border-zinc-400 hover:bg-zinc-50"
                              )}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Textarea
            id="reservation-notes"
            label="Notas para el dueño"
            optional
            rows={2}
            maxLength={500}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej. Necesitamos balón y petos."
            disabled={loading}
          />
        </div>

        <aside className="h-fit rounded-lg border border-line">
          <h3 className="border-b border-line px-4 py-3 text-sm font-semibold text-fg-strong">Resumen</h3>
          <dl className="space-y-2 px-4 py-3 text-[13px]">
            {summary.map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-3">
                <dt className="text-fg-muted">{label}</dt>
                <dd className="tabular text-right font-medium text-fg first-letter:uppercase">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="border-t border-line bg-zinc-50 px-4 py-3">
            <p className="text-xs text-fg-muted">Total</p>
            <p className="tabular text-2xl font-semibold tracking-tight text-fg-strong">
              {formatCurrency(totalPrice)}
            </p>
            <p className="mt-1 text-xs text-fg-subtle">Pago presencial en la cancha.</p>
          </div>
        </aside>
      </form>
    </Modal>
  );
}

ReservationModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  field: PropTypes.object,
};

export default ReservationModal;
