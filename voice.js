/* Voice — press-to-talk capture, Whisper transcription, Ollama intent routing.
   Phase 0 of the one-button device: the phone is the processing station. */

(() => {
  "use strict";

  const CFG_KEY = "ros.voice.cfg";
  const LOG_KEY = "ros.voice.log";
  const TAP_MS = 400;   // shorter than this latches instead of stopping
  const MIN_MS = 350;   // shorter than this is discarded as an accidental touch
  const SR = 16000;     // Whisper works at 16 kHz mono

  const $ = (id) => document.getElementById(id);
  const el = {
    body: document.body,
    dot: $("dot"), brand: $("brand"), mic: $("mic"), micWrap: $("micWrap"),
    main: $("statusMain"), sub: $("statusSub"), heard: $("heard"),
    feed: $("feed"), empty: $("empty"), sheet: $("sheet"), diag: $("diag"),
    cfgBase: $("cfgBase"), cfgModel: $("cfgModel"),
    cfgSpeak: $("cfgSpeak"), cfgHaptic: $("cfgHaptic")
  };

  const cfg = Object.assign(
    { base: "", model: "", speak: true, haptic: true },
    load(CFG_KEY, {})
  );

  let state = "idle";        // idle | rec | busy
  let latched = false;
  let pressedAt = 0;
  let media, recorder, chunks = [], audioCtx, analyser, levelRAF, tick;

  /* ---------- storage ---------- */

  function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* full or blocked */ }
  }

  /* ---------- ui ---------- */

  function setState(next, main, sub) {
    state = next;
    el.body.classList.toggle("rec", next === "rec");
    el.body.classList.toggle("busy", next === "busy");
    el.body.classList.toggle("latched", latched);
    if (main !== undefined) el.main.textContent = main;
    if (sub !== undefined) el.sub.textContent = sub;
  }

  function idle() {
    latched = false;
    setState("idle", "Mantén pulsado para hablar", "Un toque corto deja la grabación fija");
    el.micWrap.style.setProperty("--level", 0);
  }

  function buzz(pattern) {
    if (cfg.haptic && navigator.vibrate) { try { navigator.vibrate(pattern); } catch { /* denied */ } }
  }

  function say(text) {
    if (!cfg.speak || !text || !window.speechSynthesis) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "es-ES";
      u.rate = 1.05;
      speechSynthesis.speak(u);
    } catch { /* unavailable */ }
  }

  function stamp() {
    return new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  }

  const KINDS = {
    instant: "Hecho",
    deferred: "En cola",
    reply: "Respuesta",
    error: "Error"
  };

  function card(result) {
    if (el.empty) { el.empty.remove(); el.empty = null; }

    const node = document.createElement("article");
    node.className = "v-card " + (result.kind || "reply");

    const head = document.createElement("div");
    head.className = "v-card-head";
    const kind = document.createElement("span");
    kind.className = "v-kind";
    kind.textContent = result.title || KINDS[result.kind] || "Respuesta";
    const time = document.createElement("span");
    time.className = "v-time";
    time.textContent = stamp();
    head.append(kind, time);
    node.append(head);

    if (result.said) {
      const said = document.createElement("p");
      said.className = "said";
      said.textContent = "“" + result.said + "”";
      node.append(said);
    }

    const body = document.createElement("p");
    body.textContent = result.body || "";
    node.append(body);

    if (result.links && result.links.length) {
      const row = document.createElement("div");
      row.className = "v-links";
      for (const link of result.links) {
        if (!/^https?:|^sms:|^tel:|^mailto:/i.test(link.url || "")) continue;
        const a = document.createElement("a");
        a.href = link.url;
        a.textContent = link.label || "Abrir";
        a.rel = "noopener noreferrer";
        a.target = "_blank";
        row.append(a);
      }
      if (row.children.length) node.append(row);
    }

    el.feed.prepend(node);
    return { node, body };
  }

  function remember(entry) {
    const log = load(LOG_KEY, []);
    log.unshift(entry);
    save(LOG_KEY, log.slice(0, 40));
  }

  function restore() {
    const log = load(LOG_KEY, []);
    for (let i = log.length - 1; i >= 0; i--) card(log[i]);
  }

  /* ---------- audio ---------- */

  function pickMime() {
    const options = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
    for (const type of options) {
      if (window.MediaRecorder && MediaRecorder.isTypeSupported(type)) return type;
    }
    return "";
  }

  function meter() {
    const buf = new Uint8Array(analyser.fftSize);
    let smooth = 0;
    const step = () => {
      analyser.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / buf.length);
      smooth = smooth * 0.75 + Math.min(1, rms * 4.2) * 0.25;
      el.micWrap.style.setProperty("--level", smooth.toFixed(3));
      levelRAF = requestAnimationFrame(step);
    };
    step();
  }

  async function startRec() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return fail(
        "Micrófono no disponible",
        "El navegador solo permite grabar en contexto seguro. Abre esta app por https:// " +
        "o desde localhost. Una dirección http://192.168.x.x no vale."
      );
    }

    try {
      media = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
    } catch (err) {
      return fail(
        "Sin acceso al micrófono",
        err && err.name === "NotAllowedError"
          ? "Permiso denegado. Actívalo en los ajustes del sitio."
          : "No se pudo abrir el micrófono: " + (err && err.message ? err.message : err)
      );
    }

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") await audioCtx.resume();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 1024;
    audioCtx.createMediaStreamSource(media).connect(analyser);
    meter();

    chunks = [];
    const mime = pickMime();
    recorder = new MediaRecorder(media, mime ? { mimeType: mime } : undefined);
    recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    recorder.start();

    pressedAt = Date.now();
    setState("rec", "Escuchando", "0:00");
    tick = setInterval(() => {
      const s = Math.floor((Date.now() - pressedAt) / 1000);
      el.sub.textContent = Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
    }, 250);
    buzz(12);
  }

  function teardown() {
    clearInterval(tick);
    cancelAnimationFrame(levelRAF);
    if (media) media.getTracks().forEach((t) => t.stop());
    if (audioCtx) audioCtx.close().catch(() => {});
    media = audioCtx = analyser = null;
  }

  function stopRec() {
    return new Promise((resolve) => {
      if (!recorder || recorder.state === "inactive") return resolve(null);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        teardown();
        resolve(blob);
      };
      recorder.stop();
    });
  }

  /* ---------- wav encoding (browser side, so any Whisper server accepts it) ---------- */

  async function toWav(blob) {
    const ctx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 1, 44100);
    const decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
    const src = decoded.getChannelData(0);
    const ratio = decoded.sampleRate / SR;
    const out = new Int16Array(Math.floor(src.length / ratio));

    // box-average downsample; cheap and clean enough for speech
    for (let i = 0; i < out.length; i++) {
      const from = Math.floor(i * ratio);
      const to = Math.min(src.length, Math.floor((i + 1) * ratio));
      let sum = 0;
      for (let j = from; j < to; j++) sum += src[j];
      const v = Math.max(-1, Math.min(1, sum / Math.max(1, to - from)));
      out[i] = v < 0 ? v * 0x8000 : v * 0x7fff;
    }

    const buf = new ArrayBuffer(44 + out.length * 2);
    const view = new DataView(buf);
    const tag = (off, s) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };

    tag(0, "RIFF");
    view.setUint32(4, 36 + out.length * 2, true);
    tag(8, "WAVEfmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, SR, true);
    view.setUint32(28, SR * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    tag(36, "data");
    view.setUint32(40, out.length * 2, true);
    new Int16Array(buf, 44).set(out);

    return new Blob([buf], { type: "audio/wav" });
  }

  /* ---------- network ---------- */

  function api(path) {
    const base = (cfg.base || "").replace(/\/+$/, "");
    return base + path;
  }

  async function post(path, body, headers) {
    const res = await fetch(api(path), { method: "POST", body, headers });
    if (!res.ok) throw new Error("HTTP " + res.status + " — " + (await res.text()).slice(0, 200));
    return res.json();
  }

  function fail(main, sub) {
    teardown();
    idle();
    card({ kind: "error", title: main, body: sub });
    el.main.textContent = "Mantén pulsado para hablar";
    el.sub.textContent = "Un toque corto deja la grabación fija";
  }

  /* ---------- pipeline ---------- */

  async function handle(blob) {
    if (!blob || blob.size < 1200) { idle(); return; }

    setState("busy", "Transcribiendo", "");
    let text = "";
    try {
      const wav = await toWav(blob);
      const out = await post("/api/transcribe", wav, { "Content-Type": "audio/wav" });
      text = (out.text || "").trim();
    } catch (err) {
      return fail("No se pudo transcribir", String(err.message || err));
    }

    if (!text) { idle(); el.main.textContent = "No se oyó nada"; return; }

    el.heard.textContent = text;
    el.heard.classList.add("on");

    setState("busy", "Pensando", "");
    let result;
    try {
      result = await post("/api/agent", JSON.stringify({ text, model: cfg.model || undefined }),
                          { "Content-Type": "application/json" });
    } catch (err) {
      return fail("El agente no respondió", String(err.message || err));
    }

    result.said = text;
    const shown = card(result);
    remember(result);
    buzz(result.kind === "deferred" ? [12, 60, 12] : 18);
    say(result.speech);
    idle();

    if (result.kind === "deferred" && result.query) {
      shown.body.textContent = result.body;
      const working = document.createElement("p");
      working.className = "v-working";
      working.textContent = "Trabajando…";
      shown.node.append(working);

      try {
        const done = await post("/api/research", JSON.stringify({ query: result.query, model: cfg.model || undefined }),
                                { "Content-Type": "application/json" });
        working.remove();
        shown.body.textContent = done.body || "Sin resultado.";
        result.body = done.body;
        remember(result);
        buzz([14, 50, 14]);
        say("Ya lo tengo.");
      } catch (err) {
        working.textContent = "No se pudo completar: " + (err.message || err);
      }
    }
  }

  /* ---------- press handling ---------- */

  async function onDown(e) {
    e.preventDefault();
    if (state === "busy") return;

    if (latched && state === "rec") {   // second tap ends a latched recording
      latched = false;
      const held = Date.now() - pressedAt;
      const blob = await stopRec();
      return held < MIN_MS ? idle() : handle(blob);
    }

    if (state === "idle") await startRec();
  }

  async function onUp(e) {
    e.preventDefault();
    if (state !== "rec" || latched) return;

    const held = Date.now() - pressedAt;
    if (held < TAP_MS) {              // short tap latches instead of stopping
      latched = true;
      setState("rec", "Escuchando", el.sub.textContent);
      buzz([8, 40, 8]);
      return;
    }

    const blob = await stopRec();
    if (held < MIN_MS) return idle();
    await handle(blob);
  }

  el.mic.addEventListener("pointerdown", onDown);
  el.mic.addEventListener("pointerup", onUp);
  el.mic.addEventListener("pointercancel", async () => {
    if (state === "rec" && !latched) { await stopRec(); idle(); }
  });
  el.mic.addEventListener("contextmenu", (e) => e.preventDefault());

  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !e.repeat && state === "idle") { e.preventDefault(); onDown(e); }
  });
  document.addEventListener("keyup", (e) => {
    if (e.code === "Space" && state === "rec") { e.preventDefault(); onUp(e); }
  });

  /* ---------- health ---------- */

  async function health() {
    el.dot.className = "v-dot";
    try {
      const res = await fetch(api("/api/health"), { cache: "no-store" });
      const out = await res.json();
      const ok = out.whisper && out.ollama;
      el.dot.classList.add(ok ? "ok" : "bad");
      el.brand.textContent = ok ? "Voice" : "Sin motor";
      el.diag.textContent =
        "Whisper: " + (out.whisper ? "ok" : "no responde") +
        " · Ollama: " + (out.ollama ? "ok (" + (out.model || "?") + ")" : "no responde");
      return ok;
    } catch (err) {
      el.dot.classList.add("bad");
      el.brand.textContent = "Sin servidor";
      el.diag.textContent = "No se llega al servidor: " + (err.message || err);
      return false;
    }
  }

  /* ---------- settings ---------- */

  function syncForm() {
    el.cfgBase.value = cfg.base;
    el.cfgModel.value = cfg.model;
    el.cfgSpeak.checked = cfg.speak;
    el.cfgHaptic.checked = cfg.haptic;
  }

  function readForm() {
    cfg.base = el.cfgBase.value.trim().replace(/\/+$/, "");
    cfg.model = el.cfgModel.value.trim();
    cfg.speak = el.cfgSpeak.checked;
    cfg.haptic = el.cfgHaptic.checked;
    save(CFG_KEY, cfg);
  }

  $("openSettings").addEventListener("click", () => { syncForm(); el.sheet.classList.add("on"); health(); });
  $("btnClose").addEventListener("click", () => { readForm(); el.sheet.classList.remove("on"); health(); });
  $("btnCheck").addEventListener("click", () => { readForm(); el.diag.textContent = "Comprobando…"; health(); });
  el.sheet.addEventListener("click", (e) => { if (e.target === el.sheet) { readForm(); el.sheet.classList.remove("on"); } });

  $("btnClear").addEventListener("click", () => {
    save(LOG_KEY, []);
    el.feed.textContent = "";
    const p = document.createElement("p");
    p.className = "v-empty";
    p.textContent = "Historial vacío.";
    el.feed.append(p);
    el.empty = p;
  });

  syncForm();
  restore();
  idle();
  health();
})();
