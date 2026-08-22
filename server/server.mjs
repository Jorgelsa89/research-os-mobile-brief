/* Voice bridge — runs on the PC. Serves the PWA and joins Whisper to Ollama.
   Zero dependencies. Requires Node 20+ (global fetch, FormData, Blob).

   Whisper does speech-to-text. Ollama does the reasoning. Ollama cannot do
   speech-to-text, so both services must be running. */

import { createServer } from "node:http";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

const PORT = Number(process.env.PORT || 8788);
// tailscale serve proxies from localhost, so there is no reason to listen on the LAN
const HOST = process.env.HOST || "127.0.0.1";
const WHISPER_URL = (process.env.WHISPER_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");
const WHISPER_MODEL = process.env.WHISPER_MODEL || "Systran/faster-whisper-large-v3";
// some builds expose /inference instead of the OpenAI-compatible route
const WHISPER_PATH = process.env.WHISPER_PATH || "/v1/audio/transcriptions";
const OLLAMA_URL = (process.env.OLLAMA_URL || "http://127.0.0.1:11434").replace(/\/+$/, "");
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1:8b";
const LANGUAGE = process.env.LANGUAGE || "es";

/* ---------- encargos: persistent job queue ---------- */

const JOBS_DIR = join(ROOT, "server", "data", "jobs");
await mkdir(JOBS_DIR, { recursive: true });

const WORKER_SYSTEM =
  "Eres un profesional que entrega trabajo terminado. Te llega un encargo " +
  "dictado por voz. Produce el entregable completo en Markdown, en español, " +
  "con estructura clara: títulos, secciones y listas (sin tablas). Empieza " +
  "directamente con un título de nivel 1; sin preámbulos ni despedidas. Si el " +
  "encargo requiere datos en vivo de internet que no tienes, complétalo con tu " +
  "mejor criterio y añade al final una sección 'Para verificar' con lo que " +
  "haya que comprobar.";

const jobPath = (id) => join(JOBS_DIR, id + ".json");
const newJobId = () => Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);

async function saveJob(job) {
  job.updated_at = new Date().toISOString();
  await writeFile(jobPath(job.id), JSON.stringify(job, null, 2));
}

async function loadJobs() {
  const jobs = [];
  for (const f of await readdir(JOBS_DIR)) {
    if (!f.endsWith(".json")) continue;
    try { jobs.push(JSON.parse(await readFile(join(JOBS_DIR, f), "utf8"))); } catch { /* corrupt file */ }
  }
  return jobs.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

const queue = [];
let working = false;

function pump() {
  if (working) return;
  const id = queue.shift();
  if (!id) return;
  working = true;

  (async () => {
    const job = JSON.parse(await readFile(jobPath(id), "utf8"));
    job.status = "working";
    await saveJob(job);
    console.log("· encargo en marcha:", job.title);
    try {
      const out = await chat([
        { role: "system", content: WORKER_SYSTEM },
        { role: "user", content: job.brief }
      ], { model: job.model, temperature: 0.4 });
      job.result = (out?.message?.content || "").trim();
      job.status = job.result ? "done" : "failed";
      if (!job.result) job.error = "el modelo no devolvió contenido";
    } catch (err) {
      job.status = "failed";
      job.error = String(err.message || err);
    }
    await saveJob(job);
    console.log("· encargo " + job.status + ":", job.title);
  })()
    .catch((err) => console.error("✗ encargo " + id + ":", err.message))
    .finally(() => { working = false; if (queue.length) pump(); });
}

async function createJob(brief, model) {
  const job = {
    id: newJobId(),
    kind: "encargo",
    title: brief.length > 80 ? brief.slice(0, 77) + "…" : brief,
    brief,
    status: "queued",
    created_at: new Date().toISOString(),
    model: model || OLLAMA_MODEL,
    result: "",
    error: ""
  };
  await saveJob(job);
  queue.push(job.id);
  pump();
  return job;
}

// resume anything interrupted by a restart
for (const j of await loadJobs()) {
  if (j.status === "queued" || j.status === "working") {
    j.status = "queued";
    await saveJob(j);
    queue.push(j.id);
  }
}
if (queue.length) pump();

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".md": "text/plain; charset=utf-8"
};

/* ---------- tools the model may pick ---------- */

const TOOLS = [
  {
    type: "function",
    function: {
      name: "responder",
      description: "Responder directamente a una pregunta simple, un cálculo o una charla breve.",
      parameters: {
        type: "object",
        properties: { texto: { type: "string", description: "La respuesta, en una o dos frases." } },
        required: ["texto"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "crear_recordatorio",
      description: "Crear un recordatorio o cita cuando el usuario pide que se le recuerde algo.",
      parameters: {
        type: "object",
        properties: {
          texto: { type: "string", description: "Qué hay que recordar." },
          cuando: { type: "string", description: "Fecha y hora en ISO 8601 si se puede deducir, si no texto libre." }
        },
        required: ["texto"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "crear_nota",
      description: "Guardar un dato suelto que el usuario quiere recordar sin fecha.",
      parameters: {
        type: "object",
        properties: { texto: { type: "string" } },
        required: ["texto"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "preparar_mensaje",
      description: "Redactar un mensaje para enviar a alguien por WhatsApp, SMS o Telegram.",
      parameters: {
        type: "object",
        properties: {
          destinatario: { type: "string" },
          texto: { type: "string", description: "El mensaje ya redactado, listo para enviar." },
          canal: { type: "string", enum: ["whatsapp", "sms", "telegram"] }
        },
        required: ["destinatario", "texto"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "encargar",
      description:
        "Encargar un trabajo que hay que PRODUCIR y entregar: un plan, un documento, un borrador, " +
        "una comparativa, una investigación. Todo lo que no se contesta en una frase sino que se " +
        "elabora y se revisa después.",
      parameters: {
        type: "object",
        properties: {
          trabajo: {
            type: "string",
            description: "El encargo completo, con todo el contexto que dio el usuario."
          },
          recordatorio_cuando: {
            type: "string",
            description: "Si el pedido además implica una cita o plazo, fecha y hora en ISO 8601."
          }
        },
        required: ["trabajo"]
      }
    }
  }
];

const SYSTEM = `Eres el cerebro de un dispositivo de voz. Recibes lo que el usuario acaba de dictar y eliges UNA herramienta.

Reglas:
- Si es un recordatorio o una cita, usa crear_recordatorio.
- Si es un dato que quiere guardar sin fecha, usa crear_nota.
- Si quiere mandar un mensaje a una persona, usa preparar_mensaje y redacta tú el texto.
- Si el pedido implica PRODUCIR algo — un plan, un documento, una comparativa, una investigación, un borrador — usa encargar, con el encargo completo en 'trabajo'. Si además implica una cita o plazo, ponlo en recordatorio_cuando. Nunca intentes producir el documento tú mismo en la respuesta.
- Para todo lo demás (preguntas simples, cálculos, conversación), usa responder.

Hoy es ${new Date().toISOString().slice(0, 10)}. Responde siempre en español.`;

/* ---------- helpers ---------- */

const json = (res, code, data) => {
  const payload = JSON.stringify(data);
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*"
  });
  res.end(payload);
};

const body = (req) =>
  new Promise((resolve, reject) => {
    const parts = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > 40 * 1024 * 1024) { reject(new Error("payload demasiado grande")); req.destroy(); return; }
      parts.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(parts)));
    req.on("error", reject);
  });

const esc = encodeURIComponent;

function calendarLink(texto, cuando) {
  const at = new Date(cuando);
  if (!cuando || Number.isNaN(at.getTime())) return null;
  const fmt = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const end = new Date(at.getTime() + 30 * 60000);
  return {
    label: "Añadir al calendario",
    url: "https://calendar.google.com/calendar/render?action=TEMPLATE" +
         "&text=" + esc(texto) + "&dates=" + fmt(at) + "/" + fmt(end)
  };
}

function messageLinks(texto, canal) {
  const links = [];
  if (canal !== "sms" && canal !== "telegram") {
    links.push({ label: "WhatsApp", url: "https://wa.me/?text=" + esc(texto) });
  }
  if (canal === "telegram") {
    links.push({ label: "Telegram", url: "https://t.me/share/url?url=&text=" + esc(texto) });
  }
  links.push({ label: "SMS", url: "sms:?body=" + esc(texto) });
  return links;
}

/* ---------- upstreams ---------- */

async function transcribe(wav) {
  const form = new FormData();
  form.append("file", new Blob([wav], { type: "audio/wav" }), "clip.wav");
  form.append("model", WHISPER_MODEL);
  form.append("language", LANGUAGE);
  form.append("response_format", "json");

  const res = await fetch(WHISPER_URL + WHISPER_PATH, { method: "POST", body: form });
  if (!res.ok) throw new Error("Whisper " + res.status + ": " + (await res.text()).slice(0, 300));
  const out = await res.json();
  return (out.text || "").trim();
}

async function chat(messages, { model, tools, temperature = 0.2 } = {}) {
  const res = await fetch(OLLAMA_URL + "/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: model || OLLAMA_MODEL,
      messages,
      ...(tools ? { tools } : {}),
      stream: false,
      options: { temperature }
    })
  });
  if (!res.ok) throw new Error("Ollama " + res.status + ": " + (await res.text()).slice(0, 300));
  return res.json();
}

/* ---------- intent routing ---------- */

function route(call, spoken) {
  const name = call?.function?.name;
  let args = call?.function?.arguments || {};
  if (typeof args === "string") { try { args = JSON.parse(args); } catch { args = {}; } }

  if (name === "crear_recordatorio") {
    const cal = calendarLink(args.texto || spoken, args.cuando);
    return {
      kind: "instant",
      title: "Recordatorio",
      body: (args.texto || spoken) + (args.cuando ? "\n" + args.cuando : ""),
      speech: "Apuntado.",
      links: cal ? [cal] : []
    };
  }

  if (name === "crear_nota") {
    return { kind: "instant", title: "Nota", body: args.texto || spoken, speech: "Guardado." };
  }

  if (name === "preparar_mensaje") {
    return {
      kind: "instant",
      title: "Mensaje para " + (args.destinatario || "alguien"),
      body: args.texto || "",
      speech: "Mensaje listo, solo falta enviarlo.",
      links: messageLinks(args.texto || "", args.canal)
    };
  }

  if (name === "encargar") {
    const trabajo = args.trabajo || spoken;
    const cal = calendarLink(trabajo, args.recordatorio_cuando);
    return {
      kind: "deferred",
      title: "Encargo",
      body: trabajo,
      speech: "Encargo recibido. Me pongo con ello y lo dejo en tu bandeja.",
      links: cal ? [cal] : [],
      encargo: trabajo
    };
  }

  return { kind: "reply", title: "Respuesta", body: args.texto || "", speech: args.texto || "" };
}

/* ---------- routes ---------- */

async function api(req, res, path) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    return res.end();
  }

  if (path === "/api/health") {
    // any HTTP answer counts as reachable; a 404 still proves the port is alive
    const reachable = async (url) => {
      try {
        await fetch(url, { signal: AbortSignal.timeout(2500) });
        return true;
      } catch { return false; }
    };
    const [whisper, ollama] = await Promise.all([
      reachable(WHISPER_URL),
      reachable(OLLAMA_URL + "/api/tags")
    ]);
    return json(res, 200, { whisper, ollama, model: OLLAMA_MODEL, whisperModel: WHISPER_MODEL });
  }

  if (path === "/api/transcribe" && req.method === "POST") {
    const wav = await body(req);
    if (!wav.length) return json(res, 400, { error: "audio vacío" });
    const text = await transcribe(wav);
    console.log("· oído:", text);
    return json(res, 200, { text });
  }

  if (path === "/api/agent" && req.method === "POST") {
    const { text, model } = JSON.parse((await body(req)).toString() || "{}");
    if (!text) return json(res, 400, { error: "texto vacío" });

    const out = await chat(
      [{ role: "system", content: SYSTEM }, { role: "user", content: text }],
      { model, tools: TOOLS }
    );

    const call = out?.message?.tool_calls?.[0];
    if (!call) {
      const said = (out?.message?.content || "").trim();
      console.log("· sin herramienta, respuesta directa");
      return json(res, 200, { kind: "reply", title: "Respuesta", body: said, speech: said });
    }

    console.log("· herramienta:", call.function?.name);
    const result = route(call, text);
    if (result.encargo) {
      const job = await createJob(result.encargo, model);
      result.job_id = job.id;
      delete result.encargo;
    }
    return json(res, 200, result);
  }

  if (path === "/api/jobs" && req.method === "GET") {
    const jobs = (await loadJobs()).map(({ id, kind, title, status, created_at, updated_at, error }) =>
      ({ id, kind, title, status, created_at, updated_at, error }));
    return json(res, 200, { jobs });
  }

  const jobMatch = path.match(/^\/api\/jobs\/([a-z0-9-]+)$/);
  if (jobMatch && req.method === "GET") {
    try {
      return json(res, 200, JSON.parse(await readFile(jobPath(jobMatch[1]), "utf8")));
    } catch {
      return json(res, 404, { error: "encargo no encontrado" });
    }
  }

  return json(res, 404, { error: "ruta desconocida" });
}

async function serveStatic(req, res, path) {
  let rel = path === "/" ? "/voice.html" : path;
  const file = normalize(join(ROOT, decodeURIComponent(rel)));
  if (!file.startsWith(ROOT)) return json(res, 403, { error: "fuera de raíz" });

  try {
    const info = await stat(file);
    if (info.isDirectory()) return json(res, 404, { error: "no encontrado" });
    const data = await readFile(file);
    res.writeHead(200, {
      "Content-Type": MIME[extname(file).toLowerCase()] || "application/octet-stream",
      "Content-Length": data.length,
      "Cache-Control": "no-store"
    });
    res.end(data);
  } catch {
    json(res, 404, { error: "no encontrado" });
  }
}

createServer(async (req, res) => {
  const path = new URL(req.url, "http://localhost").pathname;
  try {
    if (path.startsWith("/api/")) await api(req, res, path);
    else await serveStatic(req, res, path);
  } catch (err) {
    console.error("✗", err.message);
    json(res, 500, { error: err.message });
  }
}).listen(PORT, HOST, () => {
  console.log("Voice bridge  →  http://" + HOST + ":" + PORT);
  console.log("  Whisper      " + WHISPER_URL + WHISPER_PATH + "  (" + WHISPER_MODEL + ")");
  console.log("  Ollama       " + OLLAMA_URL + "  (" + OLLAMA_MODEL + ")");
  console.log("\nDesde el móvil necesitas https. Con Tailscale:  tailscale serve --bg " + PORT + "\n");
});
