import { useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  Ticket,
  Mail,
  Download,
  Trophy,
  MapPin,
  User,
  Calendar,
  Clock,
  Banknote,
  QrCode,
  Loader2,
} from "lucide-react";
import { Modal, Button, SectionCard, StatusPill, Toast } from "shared/components/ui";
import { sendTicketByEmail } from "shared/services/firebaseService";

const STATUS_MAP = {
  pending: { label: "Pendiente", tone: "warning" },
  confirmed: { label: "Confirmada", tone: "success" },
  cancelled: { label: "Cancelada", tone: "danger" },
  completed: { label: "Completada", tone: "info" },
};

function formatDate(dateValue) {
  if (!dateValue) return "N/A";
  let date;
  if (dateValue.seconds) date = new Date(dateValue.seconds * 1000);
  else if (typeof dateValue === "string" && dateValue.includes("-")) date = new Date(dateValue);
  else if (dateValue instanceof Date) date = dateValue;
  else return "N/A";
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(timestamp) {
  if (!timestamp) return "N/A";
  const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildTicketHTML(reservation, userProfile) {
  const status = STATUS_MAP[reservation?.status]?.label || reservation?.status || "N/A";
  const statusBg = {
    success: "#16a34a",
    warning: "#f59e0b",
    danger: "#e11d48",
    info: "#3B82F6",
  }[STATUS_MAP[reservation?.status]?.tone] || "#94a3b8";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Ticket GoalTime</title>
<style>
  @page{ size:A4; margin:14mm }
  body{ font-family:'Open Sans',system-ui,-apple-system,sans-serif; color:#0f172a; margin:0; padding:0 }
  .wrap{ max-width:640px; margin:0 auto; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden }
  .head{ background:linear-gradient(135deg,#1e3a8a,#3b82f6); color:#fff; padding:24px 28px }
  .brand{ font-family:'Poppins',sans-serif; font-weight:700; font-size:22px; margin:0 }
  .lead{ font-size:12px; opacity:.85; margin:4px 0 0 }
  .body{ padding:24px 28px; background:#fff }
  h3{ font-family:'Poppins',sans-serif; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:#64748b; margin:0 0 10px; padding-bottom:6px; border-bottom:1px solid #e2e8f0 }
  .row{ display:flex; justify-content:space-between; padding:6px 0; font-size:13px }
  .lbl{ color:#64748b }
  .val{ color:#0f172a; font-weight:600; text-align:right }
  .pill{ display:inline-block; padding:3px 10px; border-radius:9999px; color:#fff; font-size:11px; font-weight:600; background:${statusBg} }
  .qr{ margin:18px auto; width:120px; height:120px; border:2px dashed #cbd5e1; border-radius:10px; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:11px; text-align:center }
  .total{ font-size:20px; font-weight:700; color:#16a34a }
  .foot{ background:#f8fafc; padding:14px 28px; border-top:1px solid #e2e8f0; text-align:center; font-size:11px; color:#64748b }
  section{ margin-bottom:18px }
</style></head>
<body>
  <div class="wrap">
    <div class="head">
      <p class="brand">GoalTime</p>
      <p class="lead">Ticket de reserva deportiva</p>
    </div>
    <div class="body">
      <section>
        <h3>Reserva</h3>
        <div class="row"><span class="lbl">Número</span><span class="val">#${
          reservation?.id?.substring(0, 8).toUpperCase() || "N/A"
        }</span></div>
        <div class="row"><span class="lbl">Fecha</span><span class="val">${formatDate(
          reservation?.date
        )}</span></div>
        <div class="row"><span class="lbl">Horario</span><span class="val">${
          reservation?.startTime || "N/A"
        } – ${reservation?.endTime || "N/A"}</span></div>
        <div class="row"><span class="lbl">Estado</span><span class="val"><span class="pill">${status}</span></span></div>
      </section>
      <section>
        <h3>Cancha</h3>
        <div class="row"><span class="lbl">Nombre</span><span class="val">${
          reservation?.fieldName || "N/A"
        }</span></div>
        <div class="row"><span class="lbl">Dirección</span><span class="val">${
          reservation?.fieldAddress || "N/A"
        }</span></div>
      </section>
      <section>
        <h3>Cliente</h3>
        <div class="row"><span class="lbl">Nombre</span><span class="val">${
          userProfile?.name || "N/A"
        }</span></div>
        <div class="row"><span class="lbl">Email</span><span class="val">${
          userProfile?.email || "N/A"
        }</span></div>
      </section>
      <section>
        <h3>Pago</h3>
        <div class="row"><span class="lbl">Total pagado</span><span class="val total">$${
          reservation?.totalPrice || "0"
        }</span></div>
        <div class="row"><span class="lbl">Creada</span><span class="val">${
          reservation?.createdAt ? formatDateTime(reservation.createdAt) : "N/A"
        }</span></div>
      </section>
      <div class="qr">QR · #${reservation?.id?.substring(0, 8).toUpperCase() || "N/A"}</div>
    </div>
    <div class="foot">© ${new Date().getFullYear()} GoalTime · Válido sólo para la fecha y hora indicadas.</div>
  </div>
</body></html>`;
}

function TicketModal({ open, onClose, reservation, userProfile }) {
  const ticketRef = useRef(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, severity: "info", message: "" });

  if (!reservation) return null;

  const statusInfo = STATUS_MAP[reservation.status] || { label: reservation.status, tone: "neutral" };

  const handleSendEmail = async () => {
    if (!userProfile?.email) {
      setSnackbar({ open: true, severity: "error", message: "No se puede enviar el ticket. Información incompleta." });
      return;
    }
    setSendingEmail(true);
    try {
      await sendTicketByEmail({
        email: userProfile.email,
        reservationId: reservation.id,
        reservationData: reservation,
        userProfile,
        ticketHTML: buildTicketHTML(reservation, userProfile),
      });
      setSnackbar({ open: true, severity: "success", message: "Ticket enviado a tu correo." });
    } catch (error) {
      console.error("Error al enviar ticket:", error);
      setSnackbar({
        open: true,
        severity: "error",
        message: error.message || "Error al enviar el ticket.",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(buildTicketHTML(reservation, userProfile));
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      variant="hero"
      eyebrow="Reserva"
      title={`Ticket #${reservation.id?.substring(0, 8).toUpperCase() || "N/A"}`}
      subtitle={reservation.fieldName}
      icon={<Ticket className="h-6 w-6 shrink-0" strokeWidth={2} aria-hidden />}
      bodyClassName="bg-slate-50 px-0 py-0"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleSendEmail}
            disabled={sendingEmail}
          >
            {sendingEmail ? (
              <Loader2
                className="h-[18px] w-[18px] shrink-0 animate-spin"
                strokeWidth={2}
                aria-hidden
              />
            ) : (
              <Mail className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
            )}
            {sendingEmail ? "Enviando…" : "Enviar por correo"}
          </Button>
          <Button type="button" variant="primary" onClick={handleDownloadPDF}>
            <Download className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
            Descargar PDF
          </Button>
        </>
      }
    >
      <div ref={ticketRef} className="px-6 sm:px-8 py-7 space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill tone={statusInfo.tone}>{statusInfo.label}</StatusPill>
          <span className="text-xs text-slate-500">
            Generado el {formatDateTime(reservation.createdAt)}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <SectionCard
              eyebrow="Detalle"
              title="Información de la reserva"
              icon={<Calendar className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />}
            >
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                <Field label="Fecha" value={formatDate(reservation.date)} />
                <Field
                  label="Horario"
                  value={`${reservation.startTime || "N/A"} – ${reservation.endTime || "N/A"}`}
                />
                <Field
                  label="Número de reserva"
                  value={`#${reservation.id?.substring(0, 8).toUpperCase() || "N/A"}`}
                  mono
                />
                <Field label="Estado" value={<StatusPill tone={statusInfo.tone}>{statusInfo.label}</StatusPill>} />
              </dl>
            </SectionCard>

            <SectionCard
              eyebrow="Cancha"
              title={reservation.fieldName || "—"}
              subtitle={reservation.fieldAddress || "Sin dirección"}
              icon={<Trophy className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />}
            >
              <dl className="space-y-3">
                <Field
                  icon={<MapPin className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />}
                  label="Dirección"
                  value={reservation.fieldAddress || "No disponible"}
                  inline
                />
              </dl>
            </SectionCard>

            <SectionCard
              eyebrow="Cliente"
              title={userProfile?.name || "Cliente"}
              icon={<User className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />}
            >
              <dl className="space-y-3">
                <Field
                  icon={<User className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />}
                  label="Nombre"
                  value={userProfile?.name || "N/A"}
                  inline
                />
                <Field
                  icon={<Mail className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />}
                  label="Correo"
                  value={userProfile?.email || "N/A"}
                  inline
                  breakAll
                />
              </dl>
            </SectionCard>
          </div>

          <aside className="space-y-5">
            <SectionCard
              eyebrow="Pago"
              title="Total"
              icon={<Banknote className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />}
            >
              <p className="text-3xl font-bold font-heading text-emerald-600">
                ${reservation.totalPrice || "0"}
              </p>
              <p className="text-xs text-slate-500 mt-1">Pago presencial en la cancha.</p>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <Field
                  icon={<Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />}
                  label="Generado"
                  value={formatDateTime(reservation.createdAt)}
                  inline
                  small
                />
              </div>
            </SectionCard>

            <SectionCard eyebrow="QR" title="Código de validación" icon={<QrCode className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />}>
              <div className="aspect-square w-full rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400">
                <div className="text-center px-2">
                  <QrCode className="h-14 w-14 shrink-0 opacity-60" strokeWidth={1.5} aria-hidden />
                  <p className="mt-2 text-xs font-mono">
                    #{reservation.id?.substring(0, 8).toUpperCase() || "N/A"}
                  </p>
                </div>
              </div>
            </SectionCard>
          </aside>
        </div>
      </div>

      <Toast
        open={snackbar.open}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        message={snackbar.message}
        type={
          snackbar.severity === "error"
            ? "error"
            : snackbar.severity === "success"
            ? "success"
            : snackbar.severity === "warning"
            ? "warning"
            : "info"
        }
        duration={4000}
      />
    </Modal>
  );
}

function Field({ label, value, mono = false, inline = false, breakAll = false, small = false, icon }) {
  if (inline) {
    return (
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
          {icon}
          {label}
        </span>
        <span
          className={[
            "text-right font-medium text-slate-900 truncate max-w-[60%]",
            mono ? "font-mono text-xs" : small ? "text-xs" : "text-sm",
            breakAll ? "break-all" : "",
          ].join(" ")}
        >
          {value}
        </span>
      </div>
    );
  }
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{label}</dt>
      <dd
        className={[
          "mt-0.5 font-semibold text-slate-900",
          mono ? "font-mono text-xs text-slate-700" : "text-sm",
        ].join(" ")}
      >
        {value}
      </dd>
    </div>
  );
}

Field.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  mono: PropTypes.bool,
  inline: PropTypes.bool,
  breakAll: PropTypes.bool,
  small: PropTypes.bool,
  icon: PropTypes.node,
};

TicketModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  reservation: PropTypes.object,
  userProfile: PropTypes.object,
};

export default TicketModal;
