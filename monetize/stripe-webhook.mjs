#!/usr/bin/env node
/**
 * Axon — Webhook de Stripe (emision + envio automatico de licencias)
 *
 * Servidor HTTP minimo (solo built-ins de Node, sin express, sin la libreria
 * de Stripe) que escucha pagos de Stripe y emite la licencia firmada del
 * cliente automaticamente, sin intervencion manual.
 *
 * Flujo:
 *   Cliente paga (Stripe Payment Link / Checkout)
 *     → Stripe dispara "checkout.session.completed" a POST /webhook
 *     → Verificamos la firma del webhook (HMAC-SHA256, anti-replay)
 *     → Extraemos email + tier del evento
 *     → Emitimos la licencia con license.mjs issue <email> <tier> 1
 *     → Enviamos la key por email (Resend) o la dejamos en pending-emails.log
 *     → Respondemos 200 a Stripe (idempotente: no duplica por session.id)
 *
 * OJO: esto corre en un servidor con internet publico y acceso a tu
 * private.pem. Rompe el "cero servidor" del lado de OPERACIONES, pero NO el
 * local-first del producto: el cliente sigue validando offline. El servidor
 * solo emite; nunca valida.
 *
 * Variables de entorno:
 *   PORT                   Puerto de escucha (default 4242)
 *   STRIPE_WEBHOOK_SECRET  Secreto del endpoint del webhook (whsec_...). OBLIGATORIO.
 *   STRIPE_PRICE_PRO       price_id de Stripe que mapea al tier "pro"
 *   STRIPE_PRICE_TEAM      price_id de Stripe que mapea al tier "team"
 *   RESEND_API_KEY         (opcional) API key de Resend para enviar el correo
 *   RESEND_FROM            (opcional) remitente, ej "Axon <licencias@tudominio.com>"
 *
 * Arranque:
 *   node monetize/stripe-webhook.mjs
 *
 * Ver monetize/WEBHOOK-SETUP.md para la guia completa.
 */

import { createServer } from 'node:http';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { execFile } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const LICENSE_CLI = join(DIR, 'license.mjs');
const PROCESSED_PATH = join(DIR, '.processed-sessions.json');   // idempotencia
const PENDING_EMAILS = join(DIR, 'pending-emails.log');         // fallback de envio

const PORT = Number(process.env.PORT) || 4242;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const TOLERANCE_SECONDS = 5 * 60; // anti-replay: rechaza eventos de >5 min

// ─── log con timestamp, en espanol ──────────────────────────────────────────
const log = (...m) => console.log(`[${new Date().toISOString()}]`, ...m);
const err = (...m) => console.error(`[${new Date().toISOString()}]`, ...m);

// ─── Verificacion manual de la firma del webhook de Stripe ──────────────────
/**
 * Stripe firma cada webhook. El header `stripe-signature` tiene formato:
 *   t=1610000000,v1=hexsig,v1=hexsig2,...
 * Se firma la cadena `${t}.${rawBody}` con HMAC-SHA256 usando el webhook
 * secret. Comparamos en tiempo constante contra cada firma v1 presente
 * (Stripe puede enviar varias durante rotacion de secreto). Ademas validamos
 * que el timestamp no sea viejo (anti-replay).
 *
 * @param {Buffer} rawBody  cuerpo crudo, sin parsear (critico: byte-exacto)
 * @param {string} sigHeader  valor del header stripe-signature
 * @param {string} secret  STRIPE_WEBHOOK_SECRET
 * @returns {{ok: boolean, reason?: string}}
 */
function verifyStripeSignature(rawBody, sigHeader, secret) {
  if (!secret) return { ok: false, reason: 'falta STRIPE_WEBHOOK_SECRET' };
  if (!sigHeader) return { ok: false, reason: 'falta header stripe-signature' };

  // Parsear t=... y todos los v1=...
  let timestamp = null;
  const v1sigs = [];
  for (const part of sigHeader.split(',')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (k === 't') timestamp = val;
    else if (k === 'v1') v1sigs.push(val);
  }
  if (!timestamp || !/^\d+$/.test(timestamp)) return { ok: false, reason: 'timestamp ausente o invalido' };
  if (!v1sigs.length) return { ok: false, reason: 'sin firmas v1 en el header' };

  // Anti-replay: el timestamp no puede ser muy viejo (ni del futuro lejano)
  const now = Math.floor(Date.now() / 1000);
  const ts = Number(timestamp);
  if (Math.abs(now - ts) > TOLERANCE_SECONDS) {
    return { ok: false, reason: `timestamp fuera de tolerancia (${now - ts}s) — posible replay` };
  }

  // Firmar `${t}.${rawBody}` con HMAC-SHA256
  const signedPayload = Buffer.concat([
    Buffer.from(`${timestamp}.`, 'utf8'),
    rawBody,
  ]);
  const expected = createHmac('sha256', secret).update(signedPayload).digest();

  // Comparacion en tiempo constante contra cada v1 (cualquiera que cuadre vale)
  for (const sigHex of v1sigs) {
    let provided;
    try { provided = Buffer.from(sigHex, 'hex'); } catch { continue; }
    if (provided.length !== expected.length) continue;
    if (timingSafeEqual(provided, expected)) return { ok: true };
  }
  return { ok: false, reason: 'firma no coincide (falsificada o secreto incorrecto)' };
}

// ─── Mapeo de precio/producto del evento → tier de Axon ─────────────────────
/**
 * Determina el tier de tres formas, en orden de preferencia:
 *   1. session.metadata.tier (si lo seteaste explicitamente en Stripe)
 *   2. price_id contra STRIPE_PRICE_PRO / STRIPE_PRICE_TEAM
 *   3. null si no se puede determinar (no emitimos a ciegas)
 */
function resolveTier(session) {
  const valid = ['pro', 'team', 'enterprise'];

  // 1. metadata.tier explicito
  const metaTier = session?.metadata?.tier;
  if (metaTier && valid.includes(String(metaTier).toLowerCase())) {
    return String(metaTier).toLowerCase();
  }

  // 2. por price_id. Stripe envia el price en varios lugares segun la config;
  //    cubrimos los habituales sin expandir line_items (que no viene por default).
  const priceCandidates = new Set();
  // a) checkout session con un solo precio recurrente expuesto en metadata/price
  if (session?.metadata?.price_id) priceCandidates.add(session.metadata.price_id);
  // b) line_items expandidos (si configuraste expand)
  const lineItems = session?.line_items?.data || [];
  for (const li of lineItems) {
    if (li?.price?.id) priceCandidates.add(li.price.id);
  }

  const PRO = process.env.STRIPE_PRICE_PRO;
  const TEAM = process.env.STRIPE_PRICE_TEAM;
  for (const pid of priceCandidates) {
    if (PRO && pid === PRO) return 'pro';
    if (TEAM && pid === TEAM) return 'team';
  }

  return null;
}

// ─── Extraer email del cliente del evento ───────────────────────────────────
function resolveEmail(session) {
  return (
    session?.customer_details?.email ||
    session?.customer_email ||
    null
  );
}

// ─── Idempotencia: registro de session.id ya procesados ─────────────────────
function loadProcessed() {
  if (!existsSync(PROCESSED_PATH)) return {};
  try { return JSON.parse(readFileSync(PROCESSED_PATH, 'utf8')); } catch { return {}; }
}
function markProcessed(sessionId, info) {
  const data = loadProcessed();
  data[sessionId] = { ...info, at: new Date().toISOString() };
  writeFileSync(PROCESSED_PATH, JSON.stringify(data, null, 2));
}
function isProcessed(sessionId) {
  return Object.prototype.hasOwnProperty.call(loadProcessed(), sessionId);
}

// ─── Emitir licencia via license.mjs (child_process) ────────────────────────
/**
 * Ejecuta `node monetize/license.mjs issue <email> <tier> 1` y extrae la key
 * de stdout. La key es la linea que empieza por "AXON-".
 * Reutilizamos el CLI existente para no duplicar la logica de firma Ed25519
 * ni el registro en sales-log.json (CRM).
 */
function issueLicense(email, tier) {
  return new Promise((resolve, reject) => {
    execFile(
      process.execPath,
      [LICENSE_CLI, 'issue', email, tier, '1'],
      { cwd: join(DIR, '..'), timeout: 20000 },
      (error, stdout, stderr) => {
        if (error) {
          return reject(new Error(`license.mjs fallo: ${stderr || error.message}`));
        }
        const line = String(stdout)
          .split('\n')
          .map((l) => l.trim())
          .find((l) => l.startsWith('AXON-'));
        if (!line) {
          return reject(new Error(`no se encontro la key en la salida de license.mjs:\n${stdout}`));
        }
        resolve(line);
      }
    );
  });
}

// ─── Envio del correo con la licencia ───────────────────────────────────────
/**
 * Dos caminos, desacoplados de cualquier dependencia pesada:
 *
 *   A) Si existe RESEND_API_KEY: envia via la API de Resend con fetch nativo
 *      (POST https://api.resend.com/emails). Sin SDK.
 *   B) Si NO hay RESEND_API_KEY (o el envio falla): deja la key en
 *      monetize/pending-emails.log para que la envies a mano. Nunca perdemos
 *      una licencia emitida.
 *
 * Devuelve { sent: boolean, via: 'resend'|'pending-log' }.
 */
async function sendLicenseEmail(email, key, tier) {
  const subject = 'Tu licencia de Axon';
  const text =
    `Hola,\n\n` +
    `Gracias por suscribirte a Axon (${tier}). Esta es tu licencia:\n\n` +
    `${key}\n\n` +
    `Para activarla, en tu instalacion de Axon corre:\n\n` +
    `  node monetize/license.mjs activate "${key}"\n\n` +
    `Y verifica con:\n\n` +
    `  node monetize/license.mjs status\n\n` +
    `La licencia se valida 100% offline en tu maquina. Cualquier duda, responde a este correo.\n\n` +
    `— Axon`;

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const from = process.env.RESEND_FROM || 'Axon <onboarding@resend.dev>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from, to: [email], subject, text }),
      });
      if (res.ok) {
        log(`Correo enviado a ${email} via Resend.`);
        return { sent: true, via: 'resend' };
      }
      const body = await res.text().catch(() => '');
      err(`Resend respondio ${res.status}: ${body}. Caigo al pending-log.`);
    } catch (e) {
      err(`Fallo el envio via Resend: ${e.message}. Caigo al pending-log.`);
    }
  }

  // Fallback: registrar para envio manual. Nunca perdemos la key.
  const entry =
    `\n=== ${new Date().toISOString()} ===\n` +
    `para: ${email}\n` +
    `tier: ${tier}\n` +
    `asunto: ${subject}\n` +
    `key: ${key}\n` +
    `--- cuerpo ---\n${text}\n`;
  appendFileSync(PENDING_EMAILS, entry);
  log(`Sin RESEND_API_KEY (o fallo): key de ${email} guardada en pending-emails.log para envio manual.`);
  return { sent: false, via: 'pending-log' };
}

// ─── Procesar checkout.session.completed ────────────────────────────────────
async function handleCheckoutCompleted(session) {
  const sessionId = session?.id || `unknown-${Date.now()}`;

  // Idempotencia: si ya emitimos para esta session, no duplicamos.
  if (isProcessed(sessionId)) {
    log(`Sesion ${sessionId} ya procesada antes. Ignoro (idempotente).`);
    return;
  }

  const email = resolveEmail(session);
  const tier = resolveTier(session);

  if (!email) {
    err(`Sesion ${sessionId} sin email del cliente. No puedo emitir. Revisa "Collect customer email" en Stripe.`);
    markProcessed(sessionId, { status: 'error', reason: 'sin email' });
    return;
  }
  if (!tier) {
    err(`Sesion ${sessionId} (${email}): no pude determinar el tier. ` +
        `Configura STRIPE_PRICE_PRO/STRIPE_PRICE_TEAM o metadata.tier. No emito a ciegas.`);
    markProcessed(sessionId, { status: 'error', reason: 'tier indeterminado', email });
    return;
  }

  log(`Emitiendo licencia ${tier} para ${email} (sesion ${sessionId})...`);
  let key;
  try {
    key = await issueLicense(email, tier);
  } catch (e) {
    err(`No se pudo emitir la licencia para ${email}: ${e.message}`);
    // No marcamos como procesada: queremos poder reintentar si Stripe reenvia.
    return;
  }
  log(`Licencia emitida para ${email}.`);

  const mail = await sendLicenseEmail(email, key, tier);

  // Marcamos procesada despues de emitir (con o sin correo enviado: la key ya
  // esta en el sales-log y/o pending-emails.log, no debe re-emitirse).
  markProcessed(sessionId, { status: 'ok', email, tier, mailed: mail.sent, via: mail.via });
  log(`Sesion ${sessionId} completada. tier=${tier} email=${email} correo=${mail.via}.`);
}

// ─── Router de eventos ──────────────────────────────────────────────────────
async function handleEvent(event) {
  switch (event?.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data?.object || {});
      break;
    default:
      log(`Evento ignorado: ${event?.type}`);
  }
}

// ─── Lee el body crudo (Buffer) — NO parsear antes de verificar la firma ────
function readRawBody(req, maxBytes = 1_000_000) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > maxBytes) {
        reject(new Error('body demasiado grande'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// ─── Servidor HTTP ──────────────────────────────────────────────────────────
const server = createServer(async (req, res) => {
  // Healthcheck simple
  if (req.method === 'GET' && (req.url === '/' || req.url === '/health')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, service: 'axon-stripe-webhook' }));
    return;
  }

  if (req.method !== 'POST' || req.url !== '/webhook') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not found' }));
    return;
  }

  let rawBody;
  try {
    rawBody = await readRawBody(req);
  } catch (e) {
    err(`Error leyendo el body: ${e.message}`);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'bad request' }));
    return;
  }

  // 1. Verificar la firma ANTES de confiar en nada del cuerpo.
  const sigHeader = req.headers['stripe-signature'];
  const verdict = verifyStripeSignature(rawBody, sigHeader, WEBHOOK_SECRET);
  if (!verdict.ok) {
    err(`Firma rechazada: ${verdict.reason}`);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'firma invalida' }));
    return;
  }

  // 2. Parsear el evento (ya verificado).
  let event;
  try {
    event = JSON.parse(rawBody.toString('utf8'));
  } catch (e) {
    err(`JSON invalido tras verificar firma: ${e.message}`);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'json invalido' }));
    return;
  }

  // 3. Responder 200 rapido y procesar. Stripe reintenta si no recibe 2xx,
  //    asi que respondemos en cuanto la firma es valida y procesamos el
  //    evento de forma idempotente. Si el procesamiento falla, lo logueamos;
  //    Stripe puede reenviar y nuestra idempotencia lo cubre.
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ received: true }));

  try {
    await handleEvent(event);
  } catch (e) {
    err(`Error procesando evento ${event?.type}: ${e.message}`);
  }
});

server.listen(PORT, () => {
  log(`Webhook de Axon escuchando en http://0.0.0.0:${PORT}/webhook`);
  if (!WEBHOOK_SECRET) {
    err('ADVERTENCIA: STRIPE_WEBHOOK_SECRET no esta seteado. Todos los webhooks seran rechazados.');
  }
  if (!process.env.STRIPE_PRICE_PRO && !process.env.STRIPE_PRICE_TEAM) {
    err('ADVERTENCIA: ni STRIPE_PRICE_PRO ni STRIPE_PRICE_TEAM estan seteados. ' +
        'Solo podras determinar el tier via metadata.tier.');
  }
  if (!process.env.RESEND_API_KEY) {
    log('Nota: sin RESEND_API_KEY. Las keys se guardaran en monetize/pending-emails.log para envio manual.');
  }
});

// Cierre limpio
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    log(`Recibido ${sig}, cerrando servidor...`);
    server.close(() => process.exit(0));
  });
}
