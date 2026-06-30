#!/usr/bin/env node
/**
 * Axon — Sistema de licencias (firma Ed25519, validacion offline)
 *
 * Local-first de verdad: las licencias se firman con tu clave privada y se
 * validan con la clave publica embebida. Sin servidor, sin telemetria, sin
 * internet. Imposible de falsificar sin la clave privada.
 *
 * Flujo de negocio:
 *   1. (una vez) node monetize/license.mjs keygen      → genera tu par de claves
 *   2. Cliente paga via Stripe Payment Link
 *   3. node monetize/license.mjs issue <email> <tier> [meses]  → generas su key
 *   4. Le envias la key. El cliente la guarda en su brain.
 *   5. El producto valida la key offline en cada arranque.
 *
 * Tiers: free | pro | team | enterprise
 */

import {
  generateKeyPairSync, sign as edSign, verify as edVerify,
  createPrivateKey, createPublicKey,
} from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const KEYS = join(DIR, 'keys');
const PRIV_PATH = join(KEYS, 'private.pem');        // SECRETO — gitignored
const PUB_PATH = join(KEYS, 'public.pem');          // se distribuye con el producto
const SALES_LOG = join(DIR, 'sales-log.json');      // CRM de ventas — gitignored (emails de clientes)

const b64u = (buf) => Buffer.from(buf).toString('base64url');
const unb64u = (str) => Buffer.from(str, 'base64url');

// ─── keygen: crea el par de claves (una sola vez) ───────────────────────────
function keygen() {
  if (existsSync(PRIV_PATH)) {
    console.error('Ya existe una clave privada. Borra monetize/keys/ para regenerar (invalida TODAS las licencias).');
    process.exit(1);
  }
  if (!existsSync(KEYS)) mkdirSync(KEYS, { recursive: true });
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  writeFileSync(PRIV_PATH, privateKey.export({ type: 'pkcs8', format: 'pem' }));
  writeFileSync(PUB_PATH, publicKey.export({ type: 'spki', format: 'pem' }));
  console.log('Par de claves generado:');
  console.log(`  Privada (SECRETA, nunca subir): ${PRIV_PATH}`);
  console.log(`  Publica (distribuir):           ${PUB_PATH}`);
}

// ─── issue: genera una licencia firmada para un cliente ─────────────────────
function issue(email, tier = 'pro', months = 1) {
  if (!existsSync(PRIV_PATH)) {
    console.error('No hay clave privada. Corre primero: node monetize/license.mjs keygen');
    process.exit(1);
  }
  const validTiers = ['free', 'pro', 'team', 'enterprise'];
  if (!validTiers.includes(tier)) {
    console.error(`Tier invalido: ${tier}. Opciones: ${validTiers.join(', ')}`);
    process.exit(1);
  }
  const issued = new Date().toISOString().slice(0, 10);
  // expires: months desde hoy (0 = perpetua)
  let expires = 'never';
  if (months > 0) {
    const d = new Date();
    d.setMonth(d.getMonth() + Number(months));
    expires = d.toISOString().slice(0, 10);
  }
  const payload = { email, tier, issued, expires, v: 1 };
  const payloadB64 = b64u(JSON.stringify(payload));
  const priv = createPrivateKey(readFileSync(PRIV_PATH));
  const signature = edSign(null, Buffer.from(payloadB64), priv);
  const key = `AXON-${payloadB64}.${b64u(signature)}`;

  // Registrar la venta en el CRM local (para no perder renovaciones)
  let log = [];
  if (existsSync(SALES_LOG)) { try { log = JSON.parse(readFileSync(SALES_LOG, 'utf8')); } catch {} }
  log.push({ email, tier, issued, expires });
  writeFileSync(SALES_LOG, JSON.stringify(log, null, 2));

  console.log(`\nLicencia para ${email} (${tier}, expira ${expires}):\n`);
  console.log(key);
  console.log(`\nRegistrada en el CRM. Enviasela al cliente.`);
  console.log(`El cliente la activa con: node monetize/license.mjs activate "<key>"\n`);
  return key;
}

// ─── list: muestra todas las licencias emitidas ────────────────────────────
function list() {
  if (!existsSync(SALES_LOG)) { console.log('No hay licencias emitidas todavia.'); return; }
  const log = JSON.parse(readFileSync(SALES_LOG, 'utf8'));
  if (!log.length) { console.log('No hay licencias emitidas todavia.'); return; }
  console.log(`\nLicencias emitidas (${log.length}):\n`);
  for (const l of log) {
    console.log(`  ${l.email.padEnd(28)} ${l.tier.padEnd(6)} emitida ${l.issued}  expira ${l.expires}`);
  }
  // MRR estimado (solo licencias vigentes)
  const today = new Date().toISOString().slice(0, 10);
  const prices = { pro: 29, team: 19, enterprise: 0, free: 0 };
  const active = log.filter(l => l.expires === 'never' || l.expires >= today);
  const mrr = active.reduce((s, l) => s + (prices[l.tier] || 0), 0);
  console.log(`\n  Activas: ${active.length}  ·  MRR estimado: $${mrr}\n`);
}

// ─── renewals: licencias que vencen pronto ─────────────────────────────────
function renewals(days = 7) {
  if (!existsSync(SALES_LOG)) { console.log('No hay licencias emitidas.'); return; }
  const log = JSON.parse(readFileSync(SALES_LOG, 'utf8'));
  const now = new Date();
  const limit = new Date(now.getTime() + Number(days) * 86400000).toISOString().slice(0, 10);
  const today = now.toISOString().slice(0, 10);
  const soon = log.filter(l => l.expires !== 'never' && l.expires >= today && l.expires <= limit);
  const expired = log.filter(l => l.expires !== 'never' && l.expires < today);
  if (soon.length) {
    console.log(`\n⏰ Vencen en los proximos ${days} dias (${soon.length}):\n`);
    for (const l of soon) console.log(`  ${l.email.padEnd(28)} ${l.tier}  expira ${l.expires} → renovar: node monetize/license.mjs issue ${l.email} ${l.tier} 1`);
  }
  if (expired.length) {
    console.log(`\n❌ Ya vencidas (${expired.length}) — recupera estos clientes:\n`);
    for (const l of expired) console.log(`  ${l.email.padEnd(28)} ${l.tier}  vencio ${l.expires}`);
  }
  if (!soon.length && !expired.length) console.log('\n✓ Ninguna licencia vence pronto. Todo al dia.\n');
  else console.log('');
}

// ─── verify: valida una key (offline, con clave publica) ────────────────────
function verify(key) {
  try {
    if (!key.startsWith('AXON-')) return { valid: false, reason: 'formato' };
    const body = key.slice(5);
    const [payloadB64, sigB64] = body.split('.');
    if (!payloadB64 || !sigB64) return { valid: false, reason: 'formato' };
    const pub = createPublicKey(readFileSync(PUB_PATH));
    const ok = edVerify(null, Buffer.from(payloadB64), pub, unb64u(sigB64));
    if (!ok) return { valid: false, reason: 'firma invalida (falsificada o alterada)' };
    const payload = JSON.parse(unb64u(payloadB64).toString('utf8'));
    if (payload.expires !== 'never' && payload.expires < new Date().toISOString().slice(0, 10)) {
      return { valid: false, reason: 'expirada', payload };
    }
    return { valid: true, payload };
  } catch (e) {
    return { valid: false, reason: 'error: ' + e.message };
  }
}

// ─── activate: guarda la licencia del cliente en su brain ───────────────────
function activate(key) {
  const result = verify(key);
  if (!result.valid) {
    console.error(`Licencia invalida: ${result.reason}`);
    process.exit(1);
  }
  const dest = join(DIR, '..', 'brain', 'identity', 'license.key');
  if (!existsSync(dirname(dest))) mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, key);
  console.log(`Licencia ${result.payload.tier} activada para ${result.payload.email}.`);
  console.log(`Expira: ${result.payload.expires}. Guardada en brain/identity/license.key`);
}

// ─── status: que tier tiene el usuario actual ───────────────────────────────
function status() {
  const lic = join(DIR, '..', 'brain', 'identity', 'license.key');
  if (!existsSync(lic)) {
    console.log(JSON.stringify({ tier: 'free', reason: 'sin licencia' }));
    return;
  }
  const result = verify(readFileSync(lic, 'utf8').trim());
  if (!result.valid) {
    console.log(JSON.stringify({ tier: 'free', reason: result.reason }));
    return;
  }
  console.log(JSON.stringify({ tier: result.payload.tier, email: result.payload.email, expires: result.payload.expires }));
}

// ─── CLI ────────────────────────────────────────────────────────────────────
const [,, cmd, ...args] = process.argv;
switch (cmd) {
  case 'keygen': keygen(); break;
  case 'issue': issue(args[0], args[1], args[2] ? Number(args[2]) : 1); break;
  case 'activate': activate(args[0]); break;
  case 'verify': {
    const r = verify(args[0]);
    console.log(JSON.stringify(r, null, 2));
    process.exit(r.valid ? 0 : 1);
  }
  case 'status': status(); break;
  case 'list': list(); break;
  case 'renewals': renewals(args[0] ? Number(args[0]) : 7); break;
  default:
    console.log(`Axon — Sistema de licencias

Para vender (tu):
  node monetize/license.mjs keygen                       Genera tu par de claves (una vez)
  node monetize/license.mjs issue <email> <tier> [meses]   Emite una licencia firmada
  node monetize/license.mjs list                         Lista licencias emitidas + MRR
  node monetize/license.mjs renewals [dias]              Que licencias vencen pronto

Para el cliente:
  node monetize/license.mjs activate "<key>"             Guarda su licencia
  node monetize/license.mjs status                       Muestra su tier actual
  node monetize/license.mjs verify "<key>"              Valida una licencia

Tiers: free | pro | team | enterprise`);
}
