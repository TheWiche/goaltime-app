// functions/index.js
//
// Cloud Functions de GoalTime.
// - Autorización: el rol se lee SIEMPRE de Firestore users/{uid}.role (no de custom claims).
// - Fallo cerrado: cualquier error al comprobar permisos → 403/500, nunca se continúa.
// - CORS con lista blanca de orígenes.
// - Los emails se generan en el servidor con datos de Firestore y todo valor dinámico
//   se escapa con escapeHtml().
// - No se registran datos personales (emails, tokens, claves) en los logs.

const functions = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

// ---------------------------------------------------------------------------
// Configuración
// ---------------------------------------------------------------------------

// Secret de SendGrid: firebase functions:secrets:set SENDGRID_API_KEY
const sendgridApiKey = defineSecret("SENDGRID_API_KEY");
const SENDGRID_FROM_EMAIL = "noreply@goaltime.site";

const ALLOWED_ORIGINS = [
  "https://goaltime.site",
  "https://www.goaltime.site",
  "http://localhost:3000",
];

const cors = require("cors")({
  origin: (origin, callback) => {
    // Peticiones sin Origin (curl, server-to-server) no reciben cabeceras CORS: el
    // navegador nunca las acepta, pero siguen necesitando un ID token válido.
    callback(null, !origin || ALLOWED_ORIGINS.includes(origin));
  },
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 3600,
});

const ALLOWED_ROLES = ["admin", "asociado", "cliente"];

// Único usuario que puede cambiar el rol / estado de otros administradores.
const SUPER_ADMIN_ID = "roFWFs8Iq5MCzJ9tyn1zk0u5GnY2";

const APP_TIME_ZONE = "America/Bogota";

const RESERVATION_STATUS_LABELS = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
};

const RESERVATION_STATUS_COLORS = {
  pending: "#FF9800",
  confirmed: "#4CAF50",
  cancelled: "#F44336",
  completed: "#2196F3",
};

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "`": "&#96;",
};

/** Escapa cualquier valor para insertarlo en HTML. */
function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[&<>"'`]/g, (ch) => HTML_ESCAPES[ch]);
}

/** Texto plano de una línea (asuntos de email, etc.). */
function oneLine(value, max = 150) {
  return String(value || "")
    .replace(/[\r\n\t]+/g, " ")
    .trim()
    .slice(0, max);
}

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function formatCurrency(amount) {
  const n = Number(amount);
  return currencyFormatter.format(Number.isFinite(n) ? n : 0);
}

/** 'YYYY-MM-DD' → "10 de enero de 2025" (sin desfase de zona horaria). */
function formatDateEs(isoDate) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(isoDate || ""));
  if (!m) return "N/A";
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return d.toLocaleDateString("es-CO", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Fecha de hoy 'YYYY-MM-DD' en la zona horaria de la app (Colombia). */
function todayISOInAppZone() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function isNonEmptyString(v, max = 500) {
  return typeof v === "string" && v.trim().length > 0 && v.length <= max;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Verifica el ID token del header Authorization. Lanza 401 si falta o no es válido. */
async function verifyRequestToken(request) {
  const header = request.headers.authorization || "";
  const match = /^Bearer (.+)$/.exec(header);
  if (!match) throw new HttpError(401, "Unauthorized: No token provided.");
  try {
    return await admin.auth().verifyIdToken(match[1], true);
  } catch (error) {
    throw new HttpError(401, "Unauthorized: Invalid token.");
  }
}

/**
 * Perfil del llamante desde Firestore. Lanza 403 si no existe o está deshabilitado.
 * @returns {Promise<{uid: string, role: string, data: object}>}
 */
async function getCaller(decodedToken) {
  const snap = await db.collection("users").doc(decodedToken.uid).get();
  if (!snap.exists) throw new HttpError(403, "Forbidden: User not found.");
  const data = snap.data() || {};
  if (data.status === "disabled") throw new HttpError(403, "Forbidden: User disabled.");
  const role = ALLOWED_ROLES.includes(data.role) ? data.role : "cliente";
  return { uid: decodedToken.uid, role, data };
}

/** Autentica + exige uno de los roles indicados. */
async function requireRole(request, roles) {
  const decodedToken = await verifyRequestToken(request);
  const caller = await getCaller(decodedToken);
  if (!roles.includes(caller.role)) {
    throw new HttpError(403, "Forbidden: Insufficient permissions.");
  }
  return { decodedToken, caller };
}

function sendError(response, error, context) {
  if (error instanceof HttpError) {
    return response.status(error.status).json({ error: error.message });
  }
  logger.error(`${context} failed`, { code: error && error.code, message: error && error.message });
  return response.status(500).json({ error: "Internal Server Error." });
}

/**
 * Envuelve un handler HTTP con CORS (lista blanca), método POST y manejo de errores.
 * Mantiene la generación de función (functions.https.onRequest) que ya estaba desplegada.
 */
function httpPost(context, handler) {
  return functions.https.onRequest((request, response) => {
    cors(request, response, async () => {
      if (request.method !== "POST") {
        return response.status(405).json({ error: "Method Not Allowed" });
      }
      try {
        return await handler(request, response);
      } catch (error) {
        return sendError(response, error, context);
      }
    });
  });
}

// --- Email ---------------------------------------------------------------

async function sendEmail({ to, subject, html, text }) {
  const apiKey = sendgridApiKey.value();
  if (!apiKey || !apiKey.startsWith("SG.")) {
    throw new HttpError(500, "El servicio de correo no está configurado.");
  }
  const sgMail = require("@sendgrid/mail");
  sgMail.setApiKey(apiKey);
  try {
    await sgMail.send({
      to,
      from: { email: SENDGRID_FROM_EMAIL, name: "GoalTime" },
      subject: oneLine(subject),
      html,
      text,
    });
  } catch (error) {
    const statusCode = error && (error.code || (error.response && error.response.statusCode));
    logger.error("SendGrid send failed", { statusCode });
    throw new HttpError(502, "No se pudo enviar el correo. Inténtalo más tarde.");
  }
}

function emailLayout(subtitle, innerHtml) {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1976d2; margin: 0;">GoalTime</h1>
      <p style="color: #666; margin: 5px 0 0 0;">${escapeHtml(subtitle)}</p>
    </div>
    ${innerHtml}
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 12px;">
      <p style="margin: 5px 0;">© ${year} GoalTime. Todos los derechos reservados.</p>
    </div>
  </body>
</html>`;
}

function detailRow(label, valueHtml) {
  return `<tr>
    <td style="padding: 8px 0; color: #666; font-weight: bold; width: 40%; vertical-align: top;">${escapeHtml(
      label
    )}</td>
    <td style="padding: 8px 0; color: #333;">${valueHtml}</td>
  </tr>`;
}

function reservationCode(id) {
  return `#${String(id || "").substring(0, 8).toUpperCase()}`;
}

/** Email + nombre de un usuario: email desde Firebase Auth (fuente de verdad), nombre de Firestore. */
async function getUserContact(userId) {
  let email = "";
  let name = "";
  try {
    const record = await admin.auth().getUser(userId);
    email = record.email || "";
    name = record.displayName || "";
  } catch (error) {
    // usuario de Auth inexistente: se intenta con Firestore
  }
  const snap = await db.collection("users").doc(userId).get();
  if (snap.exists) {
    const data = snap.data() || {};
    name = data.name || name;
    if (!email) email = data.email || "";
  }
  return { email, name: name || "Cliente" };
}

// ---------------------------------------------------------------------------
// Administración de usuarios (solo admin)
// ---------------------------------------------------------------------------

exports.createUser = httpPost("createUser", async (request, response) => {
  await requireRole(request, ["admin"]);

  const { name, email, password, role } = request.body || {};
  if (!isNonEmptyString(name, 120) || !isNonEmptyString(email, 254) || !EMAIL_RE.test(email)) {
    throw new HttpError(400, "Bad Request: Nombre o email no válidos.");
  }
  if (typeof password !== "string" || password.length < 6 || password.length > 128) {
    throw new HttpError(400, "Bad Request: La contraseña debe tener al menos 6 caracteres.");
  }
  if (!ALLOWED_ROLES.includes(role)) {
    throw new HttpError(400, "Bad Request: Invalid role specified.");
  }

  let userRecord;
  try {
    userRecord = await admin.auth().createUser({
      email: email.trim().toLowerCase(),
      password,
      displayName: name.trim(),
    });
  } catch (error) {
    if (error.code === "auth/email-already-exists") {
      throw new HttpError(409, "Conflict: Email already exists.");
    }
    if (error.code === "auth/invalid-password" || error.code === "auth/invalid-email") {
      throw new HttpError(400, "Bad Request: Email o contraseña no válidos.");
    }
    throw error;
  }

  try {
    await admin.auth().setCustomUserClaims(userRecord.uid, { role });
    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      name: name.trim(),
      email: userRecord.email,
      role,
      status: "active",
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    // Rollback para no dejar un usuario de Auth sin perfil.
    await admin.auth().deleteUser(userRecord.uid).catch(() => {});
    throw error;
  }

  return response.status(200).json({ success: true, message: `Usuario ${name.trim()} creado con éxito.` });
});

exports.toggleUserStatus = httpPost("toggleUserStatus", async (request, response) => {
  const { caller } = await requireRole(request, ["admin"]);

  const { userId } = request.body || {};
  if (!isNonEmptyString(userId, 128)) {
    throw new HttpError(400, "Bad Request: userId is required.");
  }
  if (caller.uid === userId) {
    throw new HttpError(400, "Bad Request: Admin cannot disable self.");
  }

  const targetSnap = await db.collection("users").doc(userId).get();
  const targetRole = targetSnap.exists ? targetSnap.data().role : null;
  if (targetRole === "admin" && caller.uid !== SUPER_ADMIN_ID) {
    throw new HttpError(403, "Forbidden: Only the super administrator can disable administrators.");
  }

  let userRecord;
  try {
    userRecord = await admin.auth().getUser(userId);
  } catch (error) {
    throw new HttpError(404, "Not Found: User does not exist.");
  }
  const disable = !userRecord.disabled;

  await admin.auth().updateUser(userId, { disabled: disable });
  if (disable) await admin.auth().revokeRefreshTokens(userId);
  if (targetSnap.exists) {
    await db
      .collection("users")
      .doc(userId)
      .update({ status: disable ? "disabled" : "active", updatedAt: FieldValue.serverTimestamp() });
  }

  const actionText = disable ? "deshabilitado" : "habilitado";
  return response.status(200).json({
    success: true,
    message: `Usuario ${userRecord.displayName || ""} ${actionText} correctamente.`.replace(/\s+/g, " "),
  });
});

exports.setUserRole = httpPost("setUserRole", async (request, response) => {
  const { caller } = await requireRole(request, ["admin"]);

  const { userId, newRole } = request.body || {};
  if (!isNonEmptyString(userId, 128) || !newRole) {
    throw new HttpError(400, "Bad Request: userId and newRole are required.");
  }
  if (!ALLOWED_ROLES.includes(newRole)) {
    throw new HttpError(400, "Bad Request: Invalid role specified.");
  }
  if (caller.uid === userId) {
    throw new HttpError(400, "Bad Request: Admin cannot change own role.");
  }

  // Fallo cerrado: si no se puede leer el usuario objetivo, no se continúa.
  const targetSnap = await db.collection("users").doc(userId).get();
  if (!targetSnap.exists) throw new HttpError(404, "Not Found: User does not exist.");
  const targetRole = targetSnap.data().role;

  if (targetRole === "admin" && caller.uid !== SUPER_ADMIN_ID) {
    throw new HttpError(
      403,
      "Forbidden: Only the super administrator can change roles of other administrators."
    );
  }

  await admin.auth().setCustomUserClaims(userId, { role: newRole });
  await db
    .collection("users")
    .doc(userId)
    .update({ role: newRole, updatedAt: FieldValue.serverTimestamp() });

  return response.status(200).json({ success: true, message: `Rol actualizado a ${newRole}.` });
});

// ---------------------------------------------------------------------------
// Canchas
// ---------------------------------------------------------------------------

exports.approveField = httpPost("approveField", async (request, response) => {
  const { caller } = await requireRole(request, ["admin"]);

  const { fieldId, action } = request.body || {};
  if (!isNonEmptyString(fieldId, 128) || !action) {
    throw new HttpError(400, "Bad Request: fieldId and action are required.");
  }
  if (action !== "approve" && action !== "reject") {
    throw new HttpError(400, "Bad Request: action must be 'approve' or 'reject'.");
  }

  const fieldRef = db.collection("canchas").doc(fieldId);
  const fieldDoc = await fieldRef.get();
  if (!fieldDoc.exists) throw new HttpError(404, "Not Found: Field does not exist.");

  const fieldData = fieldDoc.data();
  const newStatus = action === "approve" ? "approved" : "rejected";
  if (fieldData.status === newStatus) {
    throw new HttpError(400, `La cancha ya está ${action === "approve" ? "aprobada" : "rechazada"}.`);
  }

  await fieldRef.update({
    status: newStatus,
    reviewedAt: FieldValue.serverTimestamp(),
    reviewedBy: caller.uid,
    updatedAt: FieldValue.serverTimestamp(),
  });

  try {
    const fieldName = oneLine(fieldData.name || "tu cancha", 120);
    await db.collection("notifications").add({
      userId: fieldData.ownerId,
      type: action === "approve" ? "field_approved" : "field_rejected",
      title: action === "approve" ? "Cancha Aprobada" : "Cancha Rechazada",
      message:
        action === "approve"
          ? `Tu cancha "${fieldName}" ha sido aprobada y ahora está visible para los clientes.`
          : `Tu cancha "${fieldName}" ha sido rechazada. Revisa la información y vuelve a enviarla, o contacta al administrador.`,
      relatedId: fieldId,
      actionUrl: "/associate/fields",
      icon: action === "approve" ? "check_circle" : "cancel",
      color: action === "approve" ? "success" : "error",
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    logger.warn("approveField: notification failed", { code: error.code });
  }

  return response.status(200).json({
    success: true,
    message: `Cancha ${action === "approve" ? "aprobada" : "rechazada"} correctamente.`,
  });
});

// Deshabilitar/habilitar una cancha APROBADA (dueño asociado o admin).
// Solo approved ↔ disabled: una cancha pending/rejected nunca pasa a approved por aquí.
exports.toggleFieldStatus = httpPost("toggleFieldStatus", async (request, response) => {
  const { caller } = await requireRole(request, ["asociado", "admin"]);

  const { fieldId } = request.body || {};
  if (!isNonEmptyString(fieldId, 128)) {
    throw new HttpError(400, "Bad Request: fieldId is required.");
  }

  const fieldRef = db.collection("canchas").doc(fieldId);
  const fieldDoc = await fieldRef.get();
  if (!fieldDoc.exists) throw new HttpError(404, "Not Found: Field does not exist.");

  const field = fieldDoc.data();
  if (caller.role !== "admin" && field.ownerId !== caller.uid) {
    throw new HttpError(403, "Forbidden: You can only modify your own fields.");
  }

  let newStatus;
  if (field.status === "approved") newStatus = "disabled";
  else if (field.status === "disabled") newStatus = "approved";
  else {
    throw new HttpError(
      400,
      "Solo se pueden deshabilitar/habilitar canchas aprobadas. Esta cancha está pendiente de revisión o fue rechazada."
    );
  }

  if (newStatus === "disabled") {
    const futureReservations = await db
      .collection("reservations")
      .where("fieldId", "==", fieldId)
      .where("status", "==", "confirmed")
      .where("date", ">=", todayISOInAppZone())
      .get();
    if (!futureReservations.empty) {
      throw new HttpError(
        400,
        `No se puede deshabilitar la cancha porque tiene ${futureReservations.size} reserva(s) confirmada(s) en el futuro. Cancela o completa estas reservas antes de deshabilitarla.`
      );
    }
  }

  await fieldRef.update({ status: newStatus, updatedAt: FieldValue.serverTimestamp() });

  return response.status(200).json({
    success: true,
    message: `Cancha ${newStatus === "disabled" ? "deshabilitada" : "habilitada"} correctamente.`,
  });
});

// Notifica a todos los admins cuando una cancha queda "pending" (nueva o reenviada).
// Sustituye a notifyAdminsFieldPending del cliente (un asociado no puede listar admins).
exports.onFieldPendingNotifyAdmins = onDocumentWritten("canchas/{fieldId}", async (event) => {
  const after = event.data && event.data.after && event.data.after.exists ? event.data.after.data() : null;
  const before =
    event.data && event.data.before && event.data.before.exists ? event.data.before.data() : null;
  if (!after || after.status !== "pending") return;
  if (before && before.status === "pending") return;

  const fieldId = event.params.fieldId;
  let ownerName = "un asociado";
  try {
    const ownerSnap = await db.collection("users").doc(after.ownerId).get();
    if (ownerSnap.exists && ownerSnap.data().name) ownerName = ownerSnap.data().name;
  } catch (error) {
    // no crítico
  }

  const admins = await db.collection("users").where("role", "==", "admin").get();
  if (admins.empty) return;

  const fieldName = oneLine(after.name || "Nueva cancha", 120);
  const isResubmission = Boolean(before);
  const batch = db.batch();
  admins.docs.forEach((adminDoc) => {
    batch.set(db.collection("notifications").doc(), {
      userId: adminDoc.id,
      type: "field_pending",
      title: isResubmission ? "Cancha Reenviada a Revisión" : "Nueva Cancha Pendiente",
      message: `La cancha "${fieldName}" de ${oneLine(ownerName, 120)} está pendiente de aprobación.`,
      relatedId: fieldId,
      actionUrl: `/canchas?fieldId=${fieldId}&status=pending`,
      icon: "pending_actions",
      color: "warning",
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
  await batch.commit();
});

// ---------------------------------------------------------------------------
// Emails de reservas
// ---------------------------------------------------------------------------

const EMAIL_FUNCTION_OPTIONS = { secrets: [sendgridApiKey], cors: ALLOWED_ORIGINS };
const TICKET_EMAIL_COOLDOWN_MS = 60 * 1000;

function buildTicketHtml(reservationId, r, userName) {
  const status = RESERVATION_STATUS_LABELS[r.status] || r.status || "N/A";
  const inner = `
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0;">Hola <strong>${escapeHtml(userName)}</strong>,</p>
      <p style="margin: 0;">Este es el ticket de tu reserva. Preséntalo en la cancha.</p>
    </div>
    <div style="margin: 30px 0; padding: 20px; background-color: white; border: 2px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #333; margin-top: 0;">Reserva ${escapeHtml(reservationCode(reservationId))}</h2>
      <table style="width: 100%; border-collapse: collapse;">
        ${detailRow("Cancha:", escapeHtml(r.fieldName || "N/A"))}
        ${r.fieldAddress ? detailRow("Dirección:", escapeHtml(r.fieldAddress)) : ""}
        ${detailRow("Fecha:", escapeHtml(formatDateEs(r.date)))}
        ${detailRow("Hora:", `${escapeHtml(r.startTime || "N/A")} - ${escapeHtml(r.endTime || "N/A")}`)}
        ${detailRow("Estado:", escapeHtml(status))}
        ${detailRow(
          "Total:",
          `<strong style="color: #4CAF50;">${escapeHtml(formatCurrency(r.totalPrice))}</strong>`
        )}
      </table>
    </div>
    <p style="color: #666; font-size: 12px; text-align: center;">Este ticket es válido para la fecha y hora indicadas.</p>`;
  return emailLayout("Ticket de Reserva Deportiva", inner);
}

function buildTicketText(reservationId, r, userName) {
  return [
    "Ticket de Reserva GoalTime",
    "",
    `Hola ${userName},`,
    "",
    `- Número: ${reservationCode(reservationId)}`,
    `- Cancha: ${r.fieldName || "N/A"}`,
    `- Fecha: ${formatDateEs(r.date)}`,
    `- Hora: ${r.startTime || "N/A"} - ${r.endTime || "N/A"}`,
    `- Estado: ${RESERVATION_STATUS_LABELS[r.status] || r.status || "N/A"}`,
    `- Total: ${formatCurrency(r.totalPrice)}`,
    "",
    "Gracias por usar GoalTime.",
  ].join("\n");
}

// Envía el ticket de una reserva SOLO al email del usuario autenticado, que debe ser el
// cliente de la reserva. Se ignoran ticketHTML/email/reservationData del body.
exports.sendTicketByEmail = onRequest(EMAIL_FUNCTION_OPTIONS, async (request, response) => {
  if (request.method !== "POST") return response.status(405).json({ error: "Method Not Allowed" });
  try {
    const decodedToken = await verifyRequestToken(request);
    await getCaller(decodedToken);

    const { reservationId } = request.body || {};
    if (!isNonEmptyString(reservationId, 128)) {
      throw new HttpError(400, "Bad Request: reservationId is required.");
    }

    const reservationRef = db.collection("reservations").doc(reservationId);
    const reservationSnap = await reservationRef.get();
    if (!reservationSnap.exists) throw new HttpError(404, "Reserva no encontrada.");
    const reservation = reservationSnap.data();

    if (reservation.clientId !== decodedToken.uid) {
      throw new HttpError(403, "Forbidden: You can only send tickets of your own reservations.");
    }
    if (reservation.status === "cancelled") {
      throw new HttpError(400, "No se puede enviar el ticket de una reserva cancelada.");
    }

    const lastSent = reservation.ticketEmailSentAt && reservation.ticketEmailSentAt.toMillis
      ? reservation.ticketEmailSentAt.toMillis()
      : 0;
    if (Date.now() - lastSent < TICKET_EMAIL_COOLDOWN_MS) {
      throw new HttpError(429, "Ya enviamos el ticket hace un momento. Espera un minuto e inténtalo de nuevo.");
    }

    const contact = await getUserContact(decodedToken.uid);
    const to = decodedToken.email || contact.email;
    if (!to) {
      throw new HttpError(400, "Tu cuenta no tiene un correo electrónico asociado.");
    }

    await sendEmail({
      to,
      subject: `Ticket de Reserva - ${reservation.fieldName || "Cancha"}`,
      html: buildTicketHtml(reservationId, reservation, contact.name),
      text: buildTicketText(reservationId, reservation, contact.name),
    });

    await reservationRef.update({ ticketEmailSentAt: FieldValue.serverTimestamp() });

    return response.status(200).json({
      success: true,
      message: "Ticket enviado exitosamente a tu correo electrónico.",
    });
  } catch (error) {
    return sendError(response, error, "sendTicketByEmail");
  }
});

// Notifica por email al CLIENTE el estado actual de su reserva.
// Solo el asociado dueño de la cancha o un admin. Destinatario: users/{clientId}
// (email de Firebase Auth). Estado y datos se leen de Firestore, no del body.
exports.sendReservationStatusChangeEmail = onRequest(
  EMAIL_FUNCTION_OPTIONS,
  async (request, response) => {
    if (request.method !== "POST") return response.status(405).json({ error: "Method Not Allowed" });
    try {
      const { caller } = await requireRole(request, ["asociado", "admin"]);

      const { reservationId, reason: bodyReason } = request.body || {};
      if (!isNonEmptyString(reservationId, 128)) {
        throw new HttpError(400, "Bad Request: reservationId and newStatus are required.");
      }

      const reservationSnap = await db.collection("reservations").doc(reservationId).get();
      if (!reservationSnap.exists) throw new HttpError(404, "Reservation not found.");
      const r = reservationSnap.data();

      if (caller.role !== "admin") {
        let ownerId = r.ownerId;
        if (!ownerId) {
          const fieldSnap = await db.collection("canchas").doc(r.fieldId).get();
          ownerId = fieldSnap.exists ? fieldSnap.data().ownerId : null;
        }
        if (!ownerId || ownerId !== caller.uid) {
          throw new HttpError(403, "Forbidden: You do not own this field.");
        }
      }

      if (!r.clientId) throw new HttpError(400, "La reserva no tiene cliente asociado.");
      const contact = await getUserContact(r.clientId);
      if (!contact.email) {
        throw new HttpError(400, "No se pudo obtener el correo electrónico del cliente de la reserva.");
      }

      const status = r.status;
      const statusText = RESERVATION_STATUS_LABELS[status] || status || "N/A";
      const previousText = r.previousStatus
        ? RESERVATION_STATUS_LABELS[r.previousStatus] || r.previousStatus
        : "";
      const reason = oneLine(r.statusChangeReason || bodyReason || "", 500);
      const color = RESERVATION_STATUS_COLORS[status] || "#757575";

      const inner = `
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;">Hola <strong>${escapeHtml(contact.name)}</strong>,</p>
          <p style="margin: 0;">Te informamos que el estado de tu reserva ha sido actualizado.</p>
        </div>
        <div style="margin: 30px 0; padding: 20px; background-color: white; border: 2px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #333; margin-top: 0;">Detalles de la Reserva</h2>
          <table style="width: 100%; border-collapse: collapse;">
            ${detailRow("Cancha:", escapeHtml(r.fieldName || "N/A"))}
            ${detailRow("Fecha:", escapeHtml(formatDateEs(r.date)))}
            ${detailRow("Hora:", `${escapeHtml(r.startTime || "N/A")} - ${escapeHtml(r.endTime || "N/A")}`)}
            ${previousText ? detailRow("Estado anterior:", escapeHtml(previousText)) : ""}
            ${detailRow(
              "Nuevo estado:",
              `<span style="background-color: ${color}; color: white; padding: 4px 12px; border-radius: 12px; font-weight: bold; font-size: 0.875rem;">${escapeHtml(
                statusText
              )}</span>`
            )}
            ${reason ? detailRow("Razón:", escapeHtml(reason)) : ""}
            ${detailRow(
              "Total:",
              `<strong style="color: #4CAF50;">${escapeHtml(formatCurrency(r.totalPrice))}</strong>`
            )}
          </table>
        </div>`;

      const text = [
        "Notificación de Cambio de Estado - GoalTime",
        "",
        `Hola ${contact.name},`,
        "",
        "Te informamos que el estado de tu reserva ha sido actualizado.",
        "",
        `- Cancha: ${r.fieldName || "N/A"}`,
        `- Fecha: ${formatDateEs(r.date)}`,
        `- Hora: ${r.startTime || "N/A"} - ${r.endTime || "N/A"}`,
        previousText ? `- Estado anterior: ${previousText}` : null,
        `- Nuevo estado: ${statusText}`,
        reason ? `- Razón: ${reason}` : null,
        `- Total: ${formatCurrency(r.totalPrice)}`,
      ]
        .filter((l) => l !== null)
        .join("\n");

      await sendEmail({
        to: contact.email,
        subject: `Cambio de Estado - Reserva ${r.fieldName || "Cancha"}`,
        html: emailLayout("Notificación de Cambio de Estado", inner),
        text,
      });

      return response.status(200).json({ success: true, message: "Notificación enviada exitosamente." });
    } catch (error) {
      return sendError(response, error, "sendReservationStatusChangeEmail");
    }
  }
);

// Exportado para pruebas unitarias.
exports._internal = { escapeHtml, formatCurrency, formatDateEs, todayISOInAppZone };
