/* Voice bridge — runs on the PC. Serves the PWA and joins Whisper to Ollama.
   Zero dependencies. Requires Node 20+ (global fetch, FormData, Blob).

   Whisper does speech-to-text. Ollama does the reasoning. Ollama cannot do
   speech-to-text, so both services must be running. */

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

const PORT = Number(process.env.PORT || 8788);
const WHISPER_URL = (process.env.WHISPER_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");
const WHISPER_MODEL = process.env.WHISPER_MODEL || "Systran/faster-whisper-large-v3";
// some builds expose /inference instead of the OpenAI-compatible route
const WHISPER_PATH = process.env.WHISPER_PATH || "/v1/audio/transcriptions";
const OLLAMA_URL = (process.env.OLLAMA_URL || "http://127.0.0.1:11434").replace(/\/+$/, "");
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1:8b";
const LANGUAGE = process.env.LANGUAGE || "es";

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
      name: "investigar",
      description:
        "Tarea de investigación que necesita comparar, buscar precios o revisar varias fuentes. " +
        "No se puede responder al instante.",
      parameters: {
        type: "object",
        properties: { consulta: { type: "string", description: "Qué hay que investigar." } },
        required: ["consulta"]
      }
    }
  }
];

const SYSTEM = `Eres el cerebro de un dispositivo de voz. Recibes lo que el usuario acaba de dictar y eliges UNA herramienta.

Reglas:
- Si es un recordatorio o una cita, usa crear_recordatorio.
- Si es un dato que quiere guardar sin fecha, usa crear_nota.
- Si quiere mandar un mensaje a una persona, usa preparar_mensaje y redacta tú el texto.
- Si hay que comparar productos, buscar precios, seguros u ofertas, o revisar varias fuentes, usa investigar. Nunca intentes contestar eso de memoria.
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

  if (name === "investigar") {
    return {
      kind: "deferred",
      title: "Investigando",
      body: args.consulta || spoken,
      speech: "Voy a mirarlo, te aviso.",
      query: args.consulta || spoken
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
    return json(res, 200, route(call, text));
  }

  if (path === "/api/research" && req.method === "POST") {
    const { query, model } = JSON.parse((await body(req)).toString() || "{}");
    if (!query) return json(res, 400, { error: "consulta vacía" });

    const out = await chat([
      {
        role: "system",
        content:
          "Eres un investigador. Responde en español, breve y en viñetas, con los criterios que " +
          "de verdad deciden la elección y una recomendación final clara. " +
          "Termina siempre con la línea: 'Sin datos de web en vivo — verifica los precios actuales.'"
      },
      { role: "user", content: query }
    ], { model, temperature: 0.4 });

    return json(res, 200, { body: (out?.message?.content || "").trim() });
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
}).listen(PORT, "0.0.0.0", () => {
  console.log("Voice bridge  →  http://localhost:" + PORT);
  console.log("  Whisper      " + WHISPER_URL + WHISPER_PATH + "  (" + WHISPER_MODEL + ")");
  console.log("  Ollama       " + OLLAMA_URL + "  (" + OLLAMA_MODEL + ")");
  console.log("\nDesde el móvil necesitas https. Con Tailscale:  tailscale serve --bg " + PORT + "\n");
});
