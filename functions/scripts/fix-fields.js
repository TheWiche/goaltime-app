#!/usr/bin/env node
/* eslint-disable no-console, require-jsdoc, valid-jsdoc, max-len */
// functions/scripts/fix-fields.js
//
// Normaliza las canchas (colección `canchas`) al esquema que exigen firestore.rules
// (`validFieldData`) y src/shared/services/fieldsService.js, y asigna una imagen de
// portada a las que no tienen una válida.
//
//   - name: string no vacío (trim, ≤120). Vacío → "Cancha de prueba N".
//   - address (≤250), description (≤3000), phone/city (≤120): string recortado o se elimina si es inválido.
//   - pricePerHour: número > 0. Texto "50.000" / "$60.000 COP" → 50000 / 60000. Vacío/0/inválido →
//     valor de prueba 60.000–120.000 COP según índice (se marca en el log).
//   - openingTime/closingTime: "HH:mm", apertura < cierre. "8:00"→"08:00", "8pm"→"20:00".
//     Inválidos → 08:00 / 22:00.
//   - ownerId: se conserva; si users/{ownerId} no existe se avisa (NO se inventa dueño).
//   - status: uno de pending|approved|rejected|disabled (sinónimos en español se mapean).
//     Inválido o ausente → "approved" (canchas de prueba) y se avisa.
//   - createdAt/updatedAt: Timestamp. updatedAt = serverTimestamp() en cada cancha modificada.
//   - Campos mal nombrados (precio, nombre, image, photo, horaApertura…) → campo correcto y se borra el alias.
//   - imageUrl: si falta o no es válida, sube functions/scripts/assets/fields/*.webp (round-robin
//     determinista por id) a Storage en fields/{fieldId}/cover.webp con token de descarga y guarda
//     la URL en `imageUrl` (el único campo de imagen que usa la app). No se guarda la ruta en otro
//     campo: el esquema de canchas no lo admite en altas y la ruta se deduce de la URL.
//     Idempotente: si ya hay una imagen de nuestro bucket (y el objeto existe) no se toca salvo
//     --force-images. Las URLs https externas se conservan (se avisa) salvo --force-images.
//
// Uso (desde functions/, con credenciales de administrador del proyecto):
//   gcloud auth application-default login     # o GOOGLE_APPLICATION_CREDENTIALS=/ruta/clave.json
//   node scripts/fix-fields.js                 # simulación: no escribe nada
//   node scripts/fix-fields.js --apply         # aplica cambios y sube imágenes
// Opciones:
//   --force-images     reemplaza también imágenes válidas existentes
//   --no-images        no toca imageUrl ni Storage
//   --only=id1,id2     limita a esas canchas
// Variables: GCLOUD_PROJECT (por defecto goaltime-68101), FIREBASE_STORAGE_BUCKET
//   (por defecto <proyecto>.appspot.com, el de la configuración web). Con
//   FIRESTORE_EMULATOR_HOST / FIREBASE_STORAGE_EMULATOR_HOST funciona contra los emuladores.
//
// No se despliega con las Functions (scripts/** está excluido en firebase.json).

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const admin = require("firebase-admin");

const argv = process.argv.slice(2);
const APPLY = argv.includes("--apply");
const FORCE_IMAGES = argv.includes("--force-images");
const NO_IMAGES = argv.includes("--no-images");
const onlyArg = argv.find((a) => a.startsWith("--only="));
const ONLY = onlyArg ? new Set(onlyArg.slice(7).split(",").map((s) => s.trim()).filter(Boolean)) : null;

const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "goaltime-68101";
const BUCKET = process.env.FIREBASE_STORAGE_BUCKET || `${PROJECT_ID}.appspot.com`;
const STORAGE_EMULATOR = process.env.FIREBASE_STORAGE_EMULATOR_HOST || process.env.STORAGE_EMULATOR_HOST || "";
const ASSETS_DIR = path.join(__dirname, "assets", "fields");

const FIELD_STATUSES = ["pending", "approved", "rejected", "disabled"];
const STATUS_SYNONYMS = {
  "aprobada": "approved", "aprobado": "approved", "activa": "approved", "activo": "approved", "active": "approved",
  "publicada": "approved", "published": "approved", "ok": "approved",
  "pendiente": "pending", "revision": "pending", "en revision": "pending", "review": "pending",
  "rechazada": "rejected", "rechazado": "rejected", "denied": "rejected",
  "deshabilitada": "disabled", "deshabilitado": "disabled", "inactiva": "disabled", "inactive": "disabled",
  "inhabilitada": "disabled",
};
const DEFAULT_OPENING = "08:00";
const DEFAULT_CLOSING = "22:00";
const MAX_PRICE = 100000000;
const LIMITS = {name: 120, address: 250, description: 3000, phone: 120, city: 120, imageUrl: 2048};

// Alias → campo correcto. Solo se usan si el campo correcto falta o no es válido.
const ALIASES = {
  name: ["nombre", "title", "titulo", "fieldName", "nombreCancha"],
  address: ["direccion", "dirección", "location", "ubicacion", "ubicación", "addr"],
  description: ["descripcion", "descripción", "desc", "details", "detalles"],
  pricePerHour: ["price", "precio", "precioHora", "precioPorHora", "price_per_hour", "pricePerHours", "valorHora", "tarifa"],
  openingTime: ["openTime", "opening", "horaApertura", "apertura", "opening_time", "startTime", "horarioInicio"],
  closingTime: ["closeTime", "closing", "horaCierre", "cierre", "closing_time", "endTime", "horarioFin"],
  imageUrl: ["image", "imageURL", "imageUri", "imagen", "img", "photo", "photoURL", "photoUrl", "foto", "picture", "coverUrl", "cover", "imagenUrl"],
  phone: ["telefono", "teléfono", "tel", "phoneNumber", "celular"],
  city: ["ciudad", "municipio"],
  ownerId: ["owner", "ownerID", "owner_id", "userId", "uid", "createdBy", "propietarioId", "duenoId", "asociadoId"],
};

const isObj = (v) => v !== null && typeof v === "object";
const isTimestamp = (v) => v instanceof admin.firestore.Timestamp;
const show = (v) => {
  if (v === undefined) return "∅";
  if (isTimestamp(v)) return `Timestamp(${v.toDate().toISOString()})`;
  if (v instanceof admin.firestore.DocumentReference) return `Ref(${v.path})`;
  if (v instanceof admin.firestore.FieldValue) return "serverTimestamp()";
  const s = JSON.stringify(v);
  return s && s.length > 70 ? `${s.slice(0, 67)}…` : String(s);
};

// ------------------------------------------------------------------ parsers
function parsePrice(v) {
  if (typeof v === "number") return Number.isFinite(v) ? v : NaN;
  if (typeof v !== "string") return NaN;
  let s = v.replace(/cop|\$|\s/gi, "");
  if (!s) return NaN;
  // Separador de miles colombiano: "50.000", "1.200.000", "50,000".
  if (/^\d{1,3}([.,]\d{3})+$/.test(s)) s = s.replace(/[.,]/g, "");
  else if (/^\d+,\d{1,2}$/.test(s)) s = s.replace(",", ".");
  return /^\d+(\.\d+)?$/.test(s) ? Number(s) : NaN;
}

const pad = (n) => String(n).padStart(2, "0");

function parseTime(v) {
  if (typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 23) return `${pad(v)}:00`;
  if (typeof v !== "string") return null;
  const s = v.trim().toLowerCase().replace(/\./g, "").replace(/\s+/g, " ");
  let m = /^(\d{1,2})(?::|h)?(\d{2})?\s*(am|pm|a m|p m)?$/.exec(s);
  if (!m) m = /^(\d{2})(\d{2})()$/.exec(s); // "0800"
  if (!m) return null;
  let h = Number(m[1]);
  const min = m[2] ? Number(m[2]) : 0;
  const ampm = (m[3] || "").replace(" ", "");
  if (ampm) {
    if (h < 1 || h > 12) return null;
    if (ampm === "pm" && h !== 12) h += 12;
    if (ampm === "am" && h === 12) h = 0;
  }
  if (h > 23 || min > 59) return null;
  return `${pad(h)}:${pad(min)}`;
}

function toTimestamp(v) {
  if (isTimestamp(v)) return v;
  if (v instanceof Date && !Number.isNaN(v.getTime())) return admin.firestore.Timestamp.fromDate(v);
  if (isObj(v) && typeof v._seconds === "number") return new admin.firestore.Timestamp(v._seconds, v._nanoseconds || 0);
  if (isObj(v) && typeof v.seconds === "number") return new admin.firestore.Timestamp(v.seconds, v.nanoseconds || 0);
  if (typeof v === "number" && v > 0) return admin.firestore.Timestamp.fromMillis(v < 1e12 ? v * 1000 : v);
  if (typeof v === "string" && v.trim()) {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return admin.firestore.Timestamp.fromDate(d);
  }
  return null;
}

const cleanString = (v) => {
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return null;
};

// Réplica de validFieldData (firestore.rules) para verificar el resultado.
const TIME_RE = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
function validFieldData(d) {
  const opt = (k, max) => !(k in d) || d[k] == null || (typeof d[k] === "string" && d[k].length <= max);
  const errors = [];
  if (!(typeof d.name === "string" && d.name.length > 0 && d.name.length <= 120)) errors.push("name");
  if (!(typeof d.pricePerHour === "number" && d.pricePerHour > 0)) errors.push("pricePerHour");
  if (!(typeof d.openingTime === "string" && TIME_RE.test(d.openingTime))) errors.push("openingTime");
  if (!(typeof d.closingTime === "string" && TIME_RE.test(d.closingTime))) errors.push("closingTime");
  if (!(d.openingTime < d.closingTime)) errors.push("openingTime<closingTime");
  ["address", "description", "imageUrl", "phone", "city"].forEach((k) => {
    if (!opt(k, LIMITS[k])) errors.push(k);
  });
  if (!FIELD_STATUSES.includes(d.status)) errors.push("status");
  return errors;
}

// ------------------------------------------------------------------ storage
const downloadUrl = (bucket, objectPath, token) => {
  const base = STORAGE_EMULATOR ? `http://${STORAGE_EMULATOR}` : "https://firebasestorage.googleapis.com";
  return `${base}/v0/b/${bucket}/o/${encodeURIComponent(objectPath)}?alt=media&token=${token}`;
};

/** Si url es una URL de descarga de NUESTRO bucket bajo fields/{fieldId}/, devuelve la ruta del objeto. */
function ourObjectPath(url, fieldId) {
  try {
    const u = new URL(url);
    const hostOk = u.hostname === "firebasestorage.googleapis.com" ||
      (STORAGE_EMULATOR && u.host === STORAGE_EMULATOR);
    const m = /^\/v0\/b\/([^/]+)\/o\/(.+)$/.exec(u.pathname);
    if (!hostOk || !m || m[1] !== BUCKET) return null;
    const objectPath = decodeURIComponent(m[2]);
    return objectPath.startsWith(`fields/${fieldId}/`) ? objectPath : null;
  } catch (e) {
    return null;
  }
}

/** Comprueba que una URL externa devuelva una imagen. @return {string|null} motivo del fallo o null. */
async function checkExternalImage(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, {headers: {Range: "bytes=0-0"}, redirect: "follow", signal: ctrl.signal});
    const type = res.headers.get("content-type") || "";
    if (res.body) res.body.cancel().catch(() => {});
    if (!res.ok) return `HTTP ${res.status}`;
    if (!type.startsWith("image/")) return `content-type ${type || "desconocido"}`;
    return null;
  } catch (e) {
    return e.name === "AbortError" ? "timeout" : e.message;
  } finally {
    clearTimeout(timer);
  }
}

function loadAssets() {
  if (!fs.existsSync(ASSETS_DIR)) return [];
  return fs.readdirSync(ASSETS_DIR).filter((f) => /\.webp$/i.test(f)).sort();
}

// ------------------------------------------------------------------ normalización
/**
 * Calcula los cambios de una cancha. No escribe nada.
 * @return {{set: object, del: string[], notes: string[], warnings: string[], final: object, needsImage: boolean}}
 */
function planField(id, data, index) {
  const set = {};
  const del = [];
  const notes = [];
  const warnings = [];
  const final = Object.assign({}, data);

  const change = (key, value, why) => {
    notes.push(`${key}: ${show(data[key])} → ${show(value)}${why ? `  (${why})` : ""}`);
    set[key] = value;
    final[key] = value;
  };
  const remove = (key, why) => {
    notes.push(`${key}: ${show(data[key])} → (eliminado)${why ? `  (${why})` : ""}`);
    del.push(key);
    delete final[key];
  };

  // 1) Alias → campo correcto (se usa el primer alias con valor si el campo correcto falta).
  const aliasValue = {};
  Object.keys(ALIASES).forEach((key) => {
    ALIASES[key].forEach((alias) => {
      if (!(alias in data) || alias === key) return;
      if (aliasValue[key] === undefined && data[alias] !== null && data[alias] !== "") {
        aliasValue[key] = {alias, value: data[alias]};
      }
      remove(alias, `alias de ${key}`);
    });
  });
  const raw = (key) => {
    const cur = data[key];
    const missing = cur === undefined || cur === null || cur === "";
    if (missing && aliasValue[key]) return {value: aliasValue[key].value, from: aliasValue[key].alias};
    return {value: cur, from: null};
  };
  const fromNote = (r) => (r.from ? `desde "${r.from}"` : "");

  // 2) name
  {
    const r = raw("name");
    let name = cleanString(r.value) || "";
    if (name.length > LIMITS.name) name = name.slice(0, LIMITS.name).trim();
    if (!name) {
      name = `Cancha de prueba ${index + 1}`;
      warnings.push(`name vacío → "${name}" (PRUEBA)`);
    }
    if (name !== data.name) change("name", name, fromNote(r));
  }

  // 3) textos opcionales
  ["address", "description", "phone", "city"].forEach((key) => {
    const r = raw(key);
    if (r.value === undefined) return;
    let v = cleanString(r.value);
    if (v !== null && v.length > LIMITS[key]) {
      v = v.slice(0, LIMITS[key]).trim();
      warnings.push(`${key} recortado a ${LIMITS[key]} caracteres`);
    }
    if (v === null) {
      // null está permitido por las reglas; otros tipos (objetos, booleanos…) no.
      if (data[key] !== null && key in data) remove(key, "no es texto");
      return;
    }
    if (v === "" && !(key in data)) return; // alias vacío: nada que copiar
    if (v !== data[key]) change(key, v, fromNote(r));
  });
  if (!final.address) warnings.push("sin dirección (el formulario la exigirá al editar)");

  // 4) pricePerHour
  {
    const r = raw("pricePerHour");
    let price = parsePrice(r.value);
    let why = fromNote(r);
    if (Number.isFinite(price) && price > 0 && price < 1000) {
      // p. ej. "50.000" guardado como Number("50.000") = 50.
      price = Math.round(price * 1000);
      why = `${why ? `${why}, ` : ""}parecía en miles (<1.000 COP)`;
      warnings.push(`pricePerHour ${show(r.value)} interpretado como ${price} COP — revisar`);
    }
    if (!Number.isFinite(price) || price <= 0 || price > MAX_PRICE) {
      price = 60000 + (index % 7) * 10000;
      why = "VALOR DE PRUEBA";
      warnings.push(`pricePerHour inválido ${show(r.value)} → ${price} COP (PRUEBA)`);
    }
    if (price !== data.pricePerHour) change("pricePerHour", price, why);
  }

  // 5) horario
  {
    const ro = raw("openingTime");
    const rc = raw("closingTime");
    let opening = parseTime(ro.value);
    let closing = parseTime(rc.value);
    if (!opening) {
      warnings.push(`openingTime inválido ${show(ro.value)} → ${DEFAULT_OPENING}`);
      opening = DEFAULT_OPENING;
    }
    if (!closing) {
      warnings.push(`closingTime inválido ${show(rc.value)} → ${DEFAULT_CLOSING}`);
      closing = DEFAULT_CLOSING;
    }
    if (opening >= closing) {
      warnings.push(`horario ${opening}-${closing} no válido (apertura ≥ cierre) → ${DEFAULT_OPENING}-${DEFAULT_CLOSING}`);
      opening = DEFAULT_OPENING;
      closing = DEFAULT_CLOSING;
    }
    if (!/:(00|30)$/.test(opening) || !/:(00|30)$/.test(closing)) {
      warnings.push(`horario ${opening}-${closing} no cae en franjas de 30 min (las reservas empiezan en :00/:30)`);
    }
    if (opening !== data.openingTime) change("openingTime", opening, fromNote(ro));
    if (closing !== data.closingTime) change("closingTime", closing, fromNote(rc));
  }

  // 6) ownerId (no se inventa)
  {
    const r = raw("ownerId");
    const owner = typeof r.value === "string" ? r.value.trim() :
      r.value instanceof admin.firestore.DocumentReference ? r.value.id : "";
    if (owner && owner !== data.ownerId) change("ownerId", owner, fromNote(r));
    if (!owner) warnings.push("SIN ownerId: asígnalo a mano (no se inventa dueño)");
  }

  // 7) status
  {
    const cur = data.status;
    let next = typeof cur === "string" ? cur.trim().toLowerCase() : "";
    next = next.normalize("NFD").replace(/[̀-ͯ]/g, "");
    if (STATUS_SYNONYMS[next]) next = STATUS_SYNONYMS[next];
    if (!FIELD_STATUSES.includes(next)) {
      warnings.push(`status inválido ${show(cur)} → "approved" (PRUEBA)`);
      next = "approved";
    }
    if (next !== cur) change("status", next);
  }

  // 8) imageUrl (alias / validez). La subida se decide luego.
  let needsImage = false;
  {
    const r = raw("imageUrl");
    const url = typeof r.value === "string" ? r.value.trim() : "";
    const valid = /^https?:\/\//i.test(url) && url.length <= LIMITS.imageUrl;
    if (valid && url !== data.imageUrl) change("imageUrl", url, fromNote(r));
    if (!valid) {
      needsImage = true;
      if (url) warnings.push(`imageUrl inválida ${show(url)}`);
    } else if (!ourObjectPath(url, id)) {
      if (FORCE_IMAGES) needsImage = true;
    } else if (FORCE_IMAGES) {
      needsImage = true;
    }
    if (!valid && data.imageUrl !== undefined && data.imageUrl !== null && NO_IMAGES) {
      change("imageUrl", null, "no válida");
    }
  }

  // 9) timestamps
  ["createdAt", "updatedAt"].forEach((key) => {
    const cur = data[key];
    if (isTimestamp(cur)) return;
    const ts = toTimestamp(cur);
    if (ts) change(key, ts, "convertido a Timestamp");
    else if (key === "createdAt") change(key, admin.firestore.FieldValue.serverTimestamp(), "faltaba");
  });

  return {set, del, notes, warnings, final, needsImage};
}

// ------------------------------------------------------------------ main
async function main() {
  admin.initializeApp({projectId: PROJECT_ID, storageBucket: BUCKET});
  const db = admin.firestore();
  const bucket = admin.storage().bucket(BUCKET);
  const assets = NO_IMAGES ? [] : loadAssets();

  console.log(`Proyecto: ${PROJECT_ID} · bucket: ${BUCKET}`);
  console.log(`Modo: ${APPLY ? "APLICAR" : "SIMULACIÓN (no escribe; usa --apply)"}` +
    `${FORCE_IMAGES ? " · --force-images" : ""}${NO_IMAGES ? " · --no-images" : ""}`);
  if (process.env.FIRESTORE_EMULATOR_HOST) console.log(`Firestore EMULADOR: ${process.env.FIRESTORE_EMULATOR_HOST}`);
  if (STORAGE_EMULATOR) console.log(`Storage EMULADOR: ${STORAGE_EMULATOR}`);
  if (!NO_IMAGES && assets.length === 0) throw new Error(`No hay imágenes .webp en ${ASSETS_DIR}`);

  const snap = await db.collection("canchas").get();
  const docs = snap.docs.slice().sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const userCache = new Map();
  const getUser = async (uid) => {
    if (!userCache.has(uid)) {
      const u = await db.collection("users").doc(uid).get();
      userCache.set(uid, u.exists ? u.data() : null);
    }
    return userCache.get(uid);
  };

  const totals = {revisadas: 0, conCambios: 0, imagenes: 0, escritas: 0, avisos: 0, errores: 0, invalidasTrasArreglo: 0};

  for (let i = 0; i < docs.length; i += 1) {
    const docSnap = docs[i];
    const id = docSnap.id;
    if (ONLY && !ONLY.has(id)) continue;
    totals.revisadas += 1;
    const data = docSnap.data();
    const plan = planField(id, data, i);

    // Dueño
    if (plan.final.ownerId) {
      // eslint-disable-next-line no-await-in-loop
      const owner = await getUser(plan.final.ownerId);
      if (!owner) {
        plan.warnings.push(`ownerId "${plan.final.ownerId}" no existe en users/ (se deja tal cual; nadie podrá editarla salvo admin)`);
      } else if (!["asociado", "admin"].includes(owner.role || "cliente")) {
        plan.warnings.push(`el dueño tiene rol "${owner.role || "cliente"}": no podrá editarla ni subir imágenes (hace falta asociado)`);
      }
    }

    // Imagen
    let imageAction = null;
    if (!NO_IMAGES && plan.needsImage === false && typeof plan.final.imageUrl === "string") {
      const objectPath = ourObjectPath(plan.final.imageUrl, id);
      if (objectPath) {
        // eslint-disable-next-line no-await-in-loop
        const [exists] = await bucket.file(objectPath).exists();
        if (!exists) {
          plan.warnings.push(`la imagen apunta a ${objectPath}, que no existe en Storage → se resube`);
          plan.needsImage = true;
        }
      } else {
        // URL externa: se conserva solo si responde con una imagen.
        // eslint-disable-next-line no-await-in-loop
        const problem = await checkExternalImage(plan.final.imageUrl);
        if (problem) {
          plan.warnings.push(`imagen externa rota (${problem}) → se reemplaza`);
          plan.needsImage = true;
        } else {
          plan.warnings.push("imagen externa válida: se conserva (--force-images la reemplaza)");
        }
      }
    }
    if (!NO_IMAGES && plan.needsImage) {
      const asset = assets[i % assets.length];
      const objectPath = `fields/${id}/cover.webp`;
      imageAction = {asset, objectPath};
      plan.notes.push(`imageUrl: ${show(data.imageUrl)} → ${objectPath} (assets/fields/${asset})`);
    }

    const changed = Object.keys(plan.set).length > 0 || plan.del.length > 0 || imageAction;
    const finalCheck = Object.assign({}, plan.final);
    if (imageAction) finalCheck.imageUrl = "https://placeholder";
    const ruleErrors = validFieldData(finalCheck);

    console.log(`\n■ ${id} — "${plan.final.name}" [${plan.final.status}]`);
    if (!changed) console.log("   sin cambios");
    plan.notes.forEach((n) => console.log(`   · ${n}`));
    plan.warnings.forEach((w) => console.log(`   ! ${w}`));
    console.log(`   validFieldData: ${ruleErrors.length ? `FALLA (${ruleErrors.join(", ")})` : "OK"}`);
    totals.avisos += plan.warnings.length;
    if (ruleErrors.length) totals.invalidasTrasArreglo += 1;
    if (!changed) continue;
    totals.conCambios += 1;
    if (!APPLY) {
      if (imageAction) totals.imagenes += 1;
      continue;
    }

    try {
      const update = Object.assign({}, plan.set);
      plan.del.forEach((k) => {
        update[k] = admin.firestore.FieldValue.delete();
      });
      if (imageAction) {
        const file = bucket.file(imageAction.objectPath);
        // eslint-disable-next-line no-await-in-loop
        const [exists] = await file.exists();
        let token = null;
        let reused = false;
        if (exists && !FORCE_IMAGES) {
          // Reintento tras una ejecución interrumpida: reutiliza el objeto y su token.
          // eslint-disable-next-line no-await-in-loop
          const [meta] = await file.getMetadata();
          const tokens = meta.metadata && meta.metadata.firebaseStorageDownloadTokens;
          token = tokens ? String(tokens).split(",")[0] : null;
          reused = Boolean(token);
        }
        if (!token) {
          token = crypto.randomUUID();
          // eslint-disable-next-line no-await-in-loop
          await file.save(fs.readFileSync(path.join(ASSETS_DIR, imageAction.asset)), {
            resumable: false,
            contentType: "image/webp",
            metadata: {
              cacheControl: "public, max-age=604800",
              metadata: {firebaseStorageDownloadTokens: token, source: "fix-fields"},
            },
          });
        }
        update.imageUrl = downloadUrl(BUCKET, imageAction.objectPath, token);
        totals.imagenes += 1;
        console.log(`   ✓ imagen${reused ? " (objeto ya existente reutilizado)" : ""}: ${update.imageUrl}`);
      }
      update.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      // eslint-disable-next-line no-await-in-loop
      await docSnap.ref.update(update);
      totals.escritas += 1;
      console.log("   ✓ guardada");
    } catch (error) {
      totals.errores += 1;
      console.log(`   ✗ ERROR: ${error.message}`);
    }
  }

  console.log("\n──────── Resumen");
  console.log(`Canchas revisadas:        ${totals.revisadas}`);
  console.log(`Con cambios:              ${totals.conCambios}`);
  console.log(`${APPLY ? "Imágenes asignadas:" : "Imágenes a subir:  "}       ${totals.imagenes}`);
  if (APPLY) console.log(`Documentos actualizados:  ${totals.escritas}`);
  console.log(`Avisos (!):               ${totals.avisos}`);
  if (totals.invalidasTrasArreglo) console.log(`Siguen sin pasar reglas:  ${totals.invalidasTrasArreglo}`);
  if (totals.errores) console.log(`Errores:                  ${totals.errores}`);
  if (!APPLY && totals.conCambios) console.log("\nSimulación: no se escribió nada. Repite con --apply para aplicar.");
  if (totals.errores) process.exitCode = 1;
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {parsePrice, parseTime, validFieldData, planField};
