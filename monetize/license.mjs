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
  console.log(`\nLicencia para ${email} (${tier}, expira ${expires}):\n`);
  console.log(key);
  console.log(`\nEnviasela al cliente. La guarda con: node monetize/license.mjs activate "<key>"\n`);
  return key;
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
  default:
    console.log(`Axon — Sistema de licencias

Uso:
  node monetize/license.mjs keygen                      Genera tu par de claves (una vez)
  node monetize/license.mjs issue <email> <tier> [meses]  Emite una licencia firmada
  node monetize/license.mjs activate "<key>"            Guarda la licencia (cliente)
  node monetize/license.mjs verify "<key>"             Valida una licencia
  node monetize/license.mjs status                     Muestra tu tier actual

Tiers: free | pro | team | enterprise`);
}
