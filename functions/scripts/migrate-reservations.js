#!/usr/bin/env node
/* eslint-disable no-console */
// functions/scripts/migrate-reservations.js
//
// Migración única para reservas creadas antes de la Fase 2:
//   1) Rellena `ownerId` (dueño de la cancha) en reservas que no lo tienen.
//   2) Crea los locks de disponibilidad en `slots` para reservas pending/confirmed
//      de hoy en adelante (slots/{fieldId}_{date}_{HHmm}, franjas de 30 min).
//
// Uso (desde la carpeta functions/, con credenciales de administrador):
//   gcloud auth application-default login      # o GOOGLE_APPLICATION_CREDENTIALS=...
//   node scripts/migrate-reservations.js            # simulación (no escribe nada)
//   node scripts/migrate-reservations.js --apply    # aplica los cambios
//
// No se despliega con las Functions (excluido en firebase.json).

const admin = require("firebase-admin");

const APPLY = process.argv.includes("--apply");
const PROJECT_ID = process.env.GCLOUD_PROJECT || "goaltime-68101";
const SLOT_MINUTES = 30;

admin.initializeApp({ projectId: PROJECT_ID });
const db = admin.firestore();

const toMinutes = (t) => {
  const m = /^(\d{2}):(\d{2})$/.exec(String(t || ""));
  return m ? Number(m[1]) * 60 + Number(m[2]) : NaN;
};
const toTime = (min) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

const todayISO = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
};

async function main() {
  console.log(`Proyecto: ${PROJECT_ID} — modo ${APPLY ? "APLICAR" : "SIMULACIÓN (usa --apply)"}`);
  const today = todayISO();
  const fieldOwners = new Map();
  const ownerOf = async (fieldId) => {
    if (!fieldId) return null;
    if (!fieldOwners.has(fieldId)) {
      const snap = await db.collection("canchas").doc(fieldId).get();
      fieldOwners.set(fieldId, snap.exists ? snap.data().ownerId || null : null);
    }
    return fieldOwners.get(fieldId);
  };

  const snap = await db.collection("reservations").get();
  let ownerFilled = 0;
  let slotsCreated = 0;
  const conflicts = [];
  let writer = APPLY ? db.bulkWriter() : null;

  for (const docSnap of snap.docs) {
    const r = docSnap.data();
    const ownerId = r.ownerId || (await ownerOf(r.fieldId));

    if (!r.ownerId && ownerId) {
      ownerFilled += 1;
      if (writer) writer.update(docSnap.ref, { ownerId });
    }

    const active = r.status === "pending" || r.status === "confirmed";
    if (!active || !r.date || r.date < today) continue;

    const start = toMinutes(r.startTime);
    const end = toMinutes(r.endTime);
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
      conflicts.push(`${docSnap.id}: horario inválido ${r.startTime}-${r.endTime}`);
      continue;
    }

    const first = Math.floor(start / SLOT_MINUTES) * SLOT_MINUTES;
    for (let m = first; m < end; m += SLOT_MINUTES) {
      const slotId = `${r.fieldId}_${r.date}_${toTime(m).replace(":", "")}`;
      const slotRef = db.collection("slots").doc(slotId);
      // eslint-disable-next-line no-await-in-loop
      const existing = await slotRef.get();
      if (existing.exists) {
        if (existing.data().reservationId !== docSnap.id) {
          conflicts.push(
            `${slotId}: ocupado por ${existing.data().reservationId}, también reclamado por ${docSnap.id} (${r.status})`
          );
        }
        continue;
      }
      slotsCreated += 1;
      if (writer) {
        writer.create(slotRef, {
          fieldId: r.fieldId,
          date: r.date,
          time: toTime(m),
          reservationId: docSnap.id,
          ownerId: ownerId || null,
          status: r.status,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }
  }

  if (writer) {
    await writer.close();
    writer = null;
  }

  console.log(`Reservas revisadas: ${snap.size}`);
  console.log(`ownerId rellenados: ${ownerFilled}`);
  console.log(`Locks creados: ${slotsCreated}`);
  if (conflicts.length) {
    console.log(`\nConflictos a revisar manualmente (${conflicts.length}):`);
    conflicts.forEach((c) => console.log(` - ${c}`));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
