import { useState } from "react";
import PropTypes from "prop-types";
import { Mail, Printer, QrCode, Ticket, XCircle } from "lucide-react";
import { Button, Modal, StatusPill } from "shared/components/ui";
import { sendTicketByEmail } from "shared/services/firebaseService";
import { formatDateEs, formatDateTimeEs } from "shared/utils/date";
import { escapeHtml, formatCurrency, formatReservationCode } from "shared/utils/format";
import { canClientCancelReservation, getStatusMeta } from "shared/utils/reservationStatus";

const LONG_DATE = { weekday: "long", year: "numeric", month: "long", day: "numeric" };

const PRINT_TONES = {
  success: { bg: "#F0FDF4", fg: "#15803D", border: "#BBF7D0" },
  warning: { bg: "#FFFBEB", fg: "#92400E", border: "#FDE68A" },
  danger: { bg: "#FEF2F2", fg: "#B91C1C", border: "#FECACA" },
  info: { bg: "#EFF6FF", fg: "#1D4ED8", border: "#BFDBFE" },
  neutral: { bg: "#FAFAFA", fg: "#3F3F46", border: "#E4E4E7" },
};

/** Filas del ticket (texto plano; se escapan al generar el HTML). */
function getTicketRows(reservation, userProfile) {
  return [
    {
      title: "Reserva",
      rows: [
        ["Número", formatReservationCode(reservation.id)],
        ["Fecha", formatDateEs(reservation.date, LONG_DATE)],
        ["Horario", `${reservation.startTime || "N/A"} – ${reservation.endTime || "N/A"}`],
      ],
    },
    {
      title: "Cancha",
      rows: [
        ["Nombre", reservation.fieldName || "N/A"],
        ["Dirección", reservation.fieldAddress || "N/A"],
      ],
    },
    {
      title: "Cliente",
      rows: [
        ["Nombre", userProfile?.name || reservation.clientName || "N/A"],
        ["Correo", userProfile?.email || "N/A"],
      ],
    },
    {
      title: "Pago",
      rows: [
        ["Total", formatCurrency(reservation.totalPrice)],
        ["Creada", formatDateTimeEs(reservation.createdAt)],
      ],
    },
  ];
}

/** HTML imprimible. TODA interpolación de datos pasa por escapeHtml. */
function buildPrintableTicket(reservation, userProfile) {
  const status = getStatusMeta(reservation.status);
  const tone = PRINT_TONES[status.tone] || PRINT_TONES.neutral;
  const sections = getTicketRows(reservation, userProfile)
    .map(
      (s) => `<section><h3>${escapeHtml(s.title)}</h3>${s.rows
        .map(
          ([label, value]) =>
            `<div class="row"><span class="lbl">${escapeHtml(label)}</span><span class="val">${escapeHtml(value)}</span></div>`
        )
        .join("")}</section>`
    )
    .join("");
  const code = escapeHtml(formatReservationCode(reservation.id));

  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><title>Ticket ${code} · GoalTime</title>
<style>
  @page { size: A4; margin: 14mm }
  * { box-sizing: border-box }
  body { font-family: Inter, system-ui, -apple-system, "Segoe UI", sans-serif; color: #18181B; margin: 0; font-size: 13px }
  .wrap { max-width: 600px; margin: 0 auto; border: 1px solid #E4E4E7; border-radius: 8px; overflow: hidden }
  .head { display: flex; justify-content: space-between; align-items: flex-end; padding: 20px 24px; border-bottom: 1px solid #E4E4E7 }
  .brand { font-weight: 600; font-size: 18px; margin: 0; color: #0A0A0A }
  .lead { margin: 2px 0 0; color: #71717A; font-size: 12px }
  .code { font-family: ui-monospace, Menlo, monospace; font-size: 13px; color: #0A0A0A }
  .body { padding: 20px 24px }
  section { margin-bottom: 16px }
  h3 { font-size: 12px; font-weight: 600; color: #52525B; margin: 0 0 6px; padding-bottom: 6px; border-bottom: 1px solid #F4F4F5 }
  .row { display: flex; justify-content: space-between; gap: 16px; padding: 4px 0 }
  .lbl { color: #71717A }
  .val { font-weight: 500; text-align: right; font-variant-numeric: tabular-nums }
  .status { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 500;
            background: ${tone.bg}; color: ${tone.fg}; border: 1px solid ${tone.border} }
  .qr { margin: 8px auto 0; width: 120px; height: 120px; border: 1px dashed #D4D4D8; border-radius: 6px;
        display: flex; align-items: center; justify-content: center; color: #A1A1AA; font-size: 11px; text-align: center }
  .foot { background: #FAFAFA; padding: 12px 24px; border-top: 1px solid #E4E4E7; text-align: center; font-size: 11px; color: #71717A }
</style></head>
<body>
  <div class="wrap">
    <div class="head">
      <div><p class="brand">GoalTime</p><p class="lead">Ticket de reserva</p></div>
      <div style="text-align:right"><div class="code">${code}</div><span class="status">${escapeHtml(status.label)}</span></div>
    </div>
    <div class="body">${sections}<div class="qr">QR · ${code}</div></div>
    <div class="foot">© ${new Date().getFullYear()} GoalTime · Válido solo para la fecha y hora indicadas.</div>
  </div>
</body></html>`;
}

function TicketModal({ open, onClose, reservation, userProfile, onNotify, onCancel, now }) {
  const [sendingEmail, setSendingEmail] = useState(false);

  if (!reservation) return null;

  const status = getStatusMeta(reservation.status);
  const code = formatReservationCode(reservation.id);

  const handleSendEmail = async () => {
    if (sendingEmail) return;
    setSendingEmail(true);
    try {
      // El servidor genera el HTML y usa el email del usuario autenticado.
      await sendTicketByEmail({ reservationId: reservation.id });
      onNotify?.("Ticket enviado a tu correo.", "success");
    } catch (error) {
      onNotify?.(error.message || "No se pudo enviar el ticket.", "error");
    } finally {
      setSendingEmail(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      onNotify?.("Permite las ventanas emergentes para imprimir el ticket.", "warning");
      return;
    }
    printWindow.opener = null;
    printWindow.document.write(buildPrintableTicket(reservation, userProfile));
    printWindow.document.close();
    printWindow.focus();
    printWindow.setTimeout(() => printWindow.print(), 250);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={`Ticket ${code}`}
      subtitle={reservation.fieldName}
      icon={<Ticket className="h-4 w-4" aria-hidden />}
      bodyClassName="space-y-5"
      footer={
        <>
          {onCancel && canClientCancelReservation(reservation, now) && (
            <Button
              type="button"
              variant="ghost"
              leftIcon={<XCircle className="h-4 w-4" />}
              onClick={() => onCancel(reservation)}
              className="sm:mr-auto"
            >
              Cancelar reserva
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
          <Button
            type="button"
            variant="secondary"
            loading={sendingEmail}
            leftIcon={<Mail className="h-4 w-4" />}
            onClick={handleSendEmail}
          >
            Enviar por correo
          </Button>
          <Button type="button" leftIcon={<Printer className="h-4 w-4" />} onClick={handlePrint}>
            Imprimir / PDF
          </Button>
        </>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <StatusPill tone={status.tone} dot>
          {status.label}
        </StatusPill>
        <span className="text-xs text-fg-subtle">Creada {formatDateTimeEs(reservation.createdAt)}</span>
      </div>

      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_160px]">
        <div className="space-y-4">
          {getTicketRows(reservation, userProfile).map((section) => (
            <section key={section.title}>
              <h3 className="border-b border-line-subtle pb-1.5 text-xs font-medium text-fg-muted">{section.title}</h3>
              <dl className="mt-1.5 space-y-1 text-sm">
                {section.rows.map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4">
                    <dt className="text-fg-muted">{label}</dt>
                    <dd className="tabular min-w-0 break-words text-right font-medium text-fg first-letter:uppercase">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
          {reservation.status === "cancelled" && reservation.statusChangeReason && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
              Motivo de cancelación: {reservation.statusChangeReason}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 self-start rounded-lg border border-line p-4">
          <div className="flex aspect-square w-full max-w-[128px] items-center justify-center rounded-md border border-dashed border-line-strong bg-zinc-50 text-fg-faint">
            <QrCode className="h-12 w-12" strokeWidth={1.25} aria-hidden />
          </div>
          <p className="font-mono text-xs text-fg-muted">{code}</p>
          <p className="text-center text-xs text-fg-subtle">Muéstralo al llegar a la cancha.</p>
        </div>
      </div>
    </Modal>
  );
}

TicketModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  reservation: PropTypes.object,
  userProfile: PropTypes.object,
  onNotify: PropTypes.func,
  onCancel: PropTypes.func,
  now: PropTypes.number,
};

export default TicketModal;
