# Scripts de mantenimiento (Admin SDK)

No se despliegan con las Functions (`scripts/**` está excluido en `firebase.json`). Ignoran las reglas de
seguridad, así que se ejecutan **siempre primero en simulación**.

## Credenciales

Necesitan una identidad con acceso de administrador a Firestore y Storage del proyecto `goaltime-68101`
(por ejemplo, rol *Firebase Admin* o *Editor*). Puedes usar cualquiera de estas dos opciones:

```bash
gcloud auth application-default login               # tu cuenta de Google (ADC)
# o bien
export GOOGLE_APPLICATION_CREDENTIALS=/ruta/fuera/del/repo/clave.json   # cuenta de servicio
```

No guardes claves en el repo (`.gitignore` ya excluye `*service-account*.json`, `*firebase-adminsdk*.json`).
Variables opcionales: `GCLOUD_PROJECT` (por defecto `goaltime-68101`) y `FIREBASE_STORAGE_BUCKET`
(por defecto `goaltime-68101.appspot.com`; si tu bucket es `goaltime-68101.firebasestorage.app`, defínela).

## fix-fields.js — normalizar canchas y asignar portada

```bash
cd functions && npm i
node scripts/fix-fields.js                 # simulación: lista por cancha lo que cambiaría
node scripts/fix-fields.js --apply         # escribe en Firestore y sube imágenes a Storage
```

Opciones: `--force-images` (reemplaza también imágenes válidas), `--no-images`, `--only=id1,id2`.

Qué hace: deja cada cancha válida según `validFieldData` de `firestore.rules` (nombre, precio numérico,
horario `HH:mm` con apertura < cierre, `status` válido, timestamps) y mapea campos mal nombrados
(`precio`, `nombre`, `image`, `photo`…). Los valores inventados se marcan como **PRUEBA** en el log
(precio 60.000–120.000 COP, `status: "approved"`, nombre). Nunca inventa dueño: si `users/{ownerId}` no
existe, solo avisa. Las canchas sin imagen válida (o con una URL externa que no responde) reciben una de
`scripts/assets/fields/` en `fields/{id}/cover.webp` y su URL de descarga en `imageUrl`. Es idempotente:
una segunda ejecución no cambia nada.

Probarlo en local contra emuladores (sin tocar producción):

```bash
firebase emulators:start --only firestore,storage --project demo-goaltime
GCLOUD_PROJECT=demo-goaltime FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199 node scripts/fix-fields.js --apply
```

## migrate-reservations.js

Rellena `ownerId` en reservas antiguas y crea los locks de `slots`. Mismo uso: sin flags simula, `--apply` escribe.
