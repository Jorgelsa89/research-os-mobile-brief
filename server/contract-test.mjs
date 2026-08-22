/* Contract test for Jarvis Core's voice ingest (PARA-CODEX.md §3).
   Zero dependencies, Node 20+.

   Usage:  node server/contract-test.mjs http://localhost:PORT

   This is the meeting point between the two agents: Codex implements Core
   until this passes; the device side trusts whatever passes it. Change the
   contract by changing PARA-CODEX.md and this file in the same commit. */

const base = (process.argv[2] || "").replace(/\/+$/, "");
if (!base) {
  console.error("uso: node server/contract-test.mjs http://localhost:PUERTO");
  process.exit(2);
}

let failures = 0;

function report(ok, name, detail) {
  console.log((ok ? "  PASA " : "  FALLA") + "  " + name + (detail ? "  — " + detail : ""));
  if (!ok) failures++;
}

// minimal ULID: 48-bit time + 80 random bits, Crockford base32
function ulid() {
  const ABC = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  let t = Date.now();
  let out = "";
  for (let i = 9; i >= 0; i--) { out = ABC[t % 32] + out; t = Math.floor(t / 32); }
  for (let i = 0; i < 16; i++) out += ABC[Math.floor(Math.random() * 32)];
  return out;
}

function observation(id) {
  return {
    id,
    source: "voice-button",
    vault_id: "personal",
    captured_at: new Date().toISOString(),
    location: { lat: 25.76, lon: -80.19, accuracy_m: 15 },
    audio_ref: "vault://personal/audio/" + id + ".wav",
    transcript: "recuérdame llamar al taller mañana a las diez",
    stt: { engine: "whisper", model: "large-v3-turbo", confidence: 0.94 },
    intent: { tool: "crear_recordatorio", args: { texto: "llamar al taller", cuando: "" } }
  };
}

async function call(method, path, body) {
  const res = await fetch(base + path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(5000)
  });
  let data = null;
  try { data = await res.json(); } catch { /* non-JSON body */ }
  return { status: res.status, data };
}

console.log("\nContrato v0 contra " + base + "\n");

// 1 — health
try {
  const { status, data } = await call("GET", "/health");
  report(status === 200 && data && data.ok === true, "GET /health responde ok",
         "status " + status);
  const src = data && Array.isArray(data.sources)
    ? data.sources.find((s) => s.id === "voice-button") : null;
  report(!!src, "la fuente voice-button figura en el registro",
         src ? "healthy=" + src.healthy : "ausente");
} catch (err) {
  report(false, "GET /health alcanzable", err.message);
}

// 2 — create
const id = ulid();
try {
  const { status, data } = await call("POST", "/observations", observation(id));
  report(status === 201, "POST /observations crea (201)", "status " + status);
  report(!data || !data.deduped, "la primera entrega no viene marcada deduped");
} catch (err) {
  report(false, "POST /observations alcanzable", err.message);
}

// 3 — idempotency: same ULID again must not create a second record
try {
  const { status, data } = await call("POST", "/observations", observation(id));
  report(status === 200, "reentrega del mismo id devuelve 200", "status " + status);
  report(!!(data && data.deduped === true), "la reentrega viene marcada {deduped: true}");
} catch (err) {
  report(false, "reentrega alcanzable", err.message);
}

// 4 — validation: no transcript and no audio_ref must be rejected
try {
  const bad = observation(ulid());
  delete bad.transcript;
  delete bad.audio_ref;
  const { status } = await call("POST", "/observations", bad);
  report(status === 400, "payload sin transcript ni audio_ref → 400", "status " + status);
} catch (err) {
  report(false, "validación alcanzable", err.message);
}

// 5 — heartbeat (optional in v0: a 404 warns, any 2xx passes)
try {
  const { status } = await call("POST", "/sources/voice-button/heartbeat",
                                { battery: 0.8, queue_len: 0 });
  if (status === 404) {
    console.log("  AVISO  heartbeat sin implementar (opcional en v0)");
  } else {
    report(status >= 200 && status < 300, "heartbeat aceptado", "status " + status);
  }
} catch (err) {
  console.log("  AVISO  heartbeat no alcanzable (opcional en v0): " + err.message);
}

console.log("\n" + (failures === 0
  ? "Contrato v0: TODO PASA. El dispositivo se puede conectar."
  : "Contrato v0: " + failures + " fallo(s). Core aún no está listo para el dispositivo.") + "\n");
process.exit(failures === 0 ? 0 : 1);
