/*
 * Mockups del producto hechos en HTML/CSS. Son ILUSTRATIVOS: usan textos genéricos
 * ("Cancha de ejemplo", "$ —") y no representan canchas, precios ni reservas reales.
 * Se ocultan a lectores de pantalla como figuras con una descripción breve (role="img").
 */
import PropTypes from "prop-types";
import { Check, Clock, Heart, MapPin, Printer, Mail, X } from "lucide-react";
import { cx } from "shared/components/ui";

function Frame({ label, className, children }) {
  return (
    <div role="img" aria-label={label} className={cx("rounded-lg border border-line bg-white", className)}>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}

Frame.propTypes = { label: PropTypes.string.isRequired, className: PropTypes.string, children: PropTypes.node };

function Pill({ tone, children }) {
  const tones = {
    success: "border-green-200 bg-green-50 text-green-700",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    danger: "border-red-200 bg-red-50 text-red-700",
    neutral: "border-line bg-zinc-50 text-fg-muted",
  };
  const dots = { success: "bg-green-600", warning: "bg-amber-500", danger: "bg-red-600", neutral: "bg-zinc-400" };
  return (
    <span className={cx("inline-flex h-5 items-center gap-1.5 rounded border px-1.5 text-2xs font-medium", tones[tone])}>
      <span className={cx("h-1.5 w-1.5", dots[tone])} />
      {children}
    </span>
  );
}

Pill.propTypes = { tone: PropTypes.string.isRequired, children: PropTypes.node };

/** Bloque gris que sustituye un texto que no queremos inventar. */
const Bar = ({ className }) => <span className={cx("block h-2 rounded-sm bg-zinc-200", className)} />;
Bar.propTypes = { className: PropTypes.string };

/* ------------------------------------------------------------------ */

export function FieldCardMock({ className }) {
  return (
    <Frame
      label="Ilustración: tarjeta de una cancha con nombre, dirección, horario y precio por hora"
      className={cx("overflow-hidden", className)}
    >
      <div className="relative aspect-[16/9] border-b border-line bg-zinc-100">
        <svg viewBox="0 0 160 90" className="absolute inset-0 h-full w-full text-zinc-300" fill="none" stroke="currentColor">
          <rect x="12" y="10" width="136" height="70" />
          <line x1="80" y1="10" x2="80" y2="80" />
          <rect x="12" y="28" width="18" height="34" />
          <rect x="130" y="28" width="18" height="34" />
          <circle cx="80" cy="45" r="11" />
        </svg>
        <span className="absolute left-2.5 top-2.5">
          <Pill tone="success">Aprobada</Pill>
        </span>
        <span className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-md border border-line bg-white text-red-500">
          <Heart className="h-3.5 w-3.5" fill="currentColor" />
        </span>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-sm font-semibold text-fg-strong">Cancha de ejemplo</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-fg-subtle">
            <MapPin className="h-3.5 w-3.5" />
            Dirección de ejemplo · Riohacha
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-fg-muted">
          <Clock className="h-3.5 w-3.5 text-fg-subtle" />
          Apertura — Cierre
        </div>
        <div className="flex items-end justify-between border-t border-line-subtle pt-3">
          <div>
            <p className="text-2xs text-fg-subtle">Precio por hora</p>
            <p className="text-base font-semibold tabular text-fg-strong">$ —</p>
          </div>
          <span className="inline-flex h-8 items-center rounded-md bg-primary-600 px-3 text-xs font-medium text-white">
            Reservar
          </span>
        </div>
      </div>
    </Frame>
  );
}

FieldCardMock.propTypes = { className: PropTypes.string };

/* ------------------------------------------------------------------ */

const SLOT_ROWS = [
  { label: "Tarde", times: [["16:00"], ["16:30"], ["17:00", "taken"], ["17:30", "taken"]] },
  { label: "Noche", times: [["18:00", "pick"], ["18:30"], ["19:00"], ["19:30"]] },
];

export function SlotPickerMock({ className, compact = false }) {
  return (
    <Frame
      label="Ilustración: selector de horarios con franjas de 30 minutos; dos franjas ocupadas y la de las 18:00 seleccionada"
      className={className}
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-fg-strong">Reservar · Cancha de ejemplo</p>
          {!compact && <p className="mt-0.5 text-2xs text-fg-subtle">Franjas de 30 minutos</p>}
        </div>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-fg-subtle">
          <X className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="space-y-3 p-4">
        {!compact && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-2xs font-medium text-fg-muted">Fecha</p>
              <div className="mt-1 flex h-8 items-center rounded-md border border-line-strong px-2 text-xs text-fg">
                Mañana
              </div>
            </div>
            <div>
              <p className="text-2xs font-medium text-fg-muted">Duración</p>
              <div className="mt-1 flex h-8 items-center rounded-md border border-line-strong px-2 text-xs text-fg">
                1 hora
              </div>
            </div>
          </div>
        )}
        {SLOT_ROWS.map((row) => (
          <div key={row.label}>
            <p className="text-2xs font-medium text-fg-subtle">{row.label}</p>
            <div className="mt-1.5 grid grid-cols-4 gap-1.5">
              {row.times.map(([t, state]) => (
                <span
                  key={t}
                  className={cx(
                    "flex h-8 items-center justify-center rounded-md border text-xs tabular",
                    state === "taken" && "border-line bg-zinc-50 text-fg-faint line-through",
                    state === "pick" && "lp-slot-pick border-primary-600 bg-primary-600 font-medium text-white",
                    !state && "border-line-strong bg-white text-fg"
                  )}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 rounded-md border border-line bg-zinc-50 px-3 py-2 text-xs">
          <span className="whitespace-nowrap tabular text-fg-muted">18:00 – 19:00</span>
          <span className="whitespace-nowrap font-medium text-fg-strong">Pendiente de confirmar</span>
        </div>
      </div>
    </Frame>
  );
}

SlotPickerMock.propTypes = { className: PropTypes.string, compact: PropTypes.bool };

/* ------------------------------------------------------------------ */

export function TicketMock({ className }) {
  return (
    <Frame
      label="Ilustración: ticket de una reserva confirmada con opciones para imprimir y enviar por correo"
      className={className}
    >
      <div className="flex items-center justify-between border-b border-dashed border-line-strong px-4 py-3">
        <p className="text-[13px] font-semibold text-fg-strong">Ticket de reserva</p>
        <Pill tone="success">Confirmada</Pill>
      </div>
      <dl className="grid grid-cols-[88px_1fr] gap-x-3 gap-y-2 px-4 py-4 text-xs">
        <dt className="text-fg-subtle">Cancha</dt>
        <dd className="font-medium text-fg">Cancha de ejemplo</dd>
        <dt className="text-fg-subtle">Fecha</dt>
        <dd className="text-fg">
          <Bar className="mt-0.5 w-20" />
        </dd>
        <dt className="text-fg-subtle">Horario</dt>
        <dd className="tabular text-fg">18:00 – 19:00</dd>
        <dt className="text-fg-subtle">Total</dt>
        <dd className="tabular text-fg">$ —</dd>
      </dl>
      <div className="grid grid-cols-2 gap-2 border-t border-line px-4 py-3">
        <span className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-line-strong text-xs font-medium text-fg">
          <Printer className="h-3.5 w-3.5" />
          Imprimir
        </span>
        <span className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-line-strong text-xs font-medium text-fg">
          <Mail className="h-3.5 w-3.5" />
          Por correo
        </span>
      </div>
    </Frame>
  );
}

TicketMock.propTypes = { className: PropTypes.string };

/* ------------------------------------------------------------------ */

const OWNER_ROWS = [
  { name: "Reserva de ejemplo A", time: "18:00 – 19:00", tone: "warning", status: "Pendiente", actions: true },
  { name: "Reserva de ejemplo B", time: "19:00 – 20:30", tone: "success", status: "Confirmada" },
  { name: "Reserva de ejemplo C", time: "20:30 – 21:30", tone: "danger", status: "Rechazada" },
];

export function OwnerPanelMock({ className }) {
  return (
    <Frame
      label="Ilustración: panel del asociado con resumen y lista de reservas por confirmar"
      className={cx("overflow-hidden", className)}
    >
      <div className="flex items-center justify-between border-b border-line bg-zinc-50 px-4 py-3">
        <p className="text-[13px] font-semibold text-fg-strong">Reservas de mis canchas</p>
        <span className="hidden font-mono text-2xs text-fg-subtle sm:inline">Panel del asociado</span>
      </div>
      <div className="grid grid-cols-3 divide-x divide-line border-b border-line">
        {["Mis canchas", "Por confirmar", "Ingresos"].map((k) => (
          <div key={k} className="px-3 py-3 sm:px-4">
            <p className="text-2xs leading-4 text-fg-subtle">{k}</p>
            <p className="mt-1 text-lg font-semibold tabular text-fg-strong">—</p>
          </div>
        ))}
      </div>
      <ul className="divide-y divide-line-subtle">
        {OWNER_ROWS.map((r) => (
          <li key={r.name} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
            <div className="min-w-[11rem] flex-1">
              <p className="text-xs font-medium text-fg">{r.name}</p>
              <p className="mt-0.5 text-2xs tabular text-fg-subtle">Cancha de ejemplo · {r.time}</p>
            </div>
            {r.actions ? (
              <div className="flex items-center gap-1.5">
                <span className="inline-flex h-7 items-center gap-1 rounded-md bg-primary-600 px-2 text-2xs font-medium text-white">
                  <Check className="h-3 w-3" />
                  Confirmar
                </span>
                <span className="inline-flex h-7 items-center rounded-md border border-line-strong px-2 text-2xs font-medium text-fg">
                  Rechazar
                </span>
              </div>
            ) : (
              <Pill tone={r.tone}>{r.status}</Pill>
            )}
          </li>
        ))}
      </ul>
    </Frame>
  );
}

OwnerPanelMock.propTypes = { className: PropTypes.string };
