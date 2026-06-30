// Test de seguridad del webhook de Stripe
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHmac } from 'node:crypto';
import { existsSync, rmSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SECRET = 'whsec_test_secret_123';
const PORT = 4299;
const SALES = join(ROOT, 'monetize', 'sales-log.json');

let srv;
const cleanFiles = () => {
  for (const f of ['monetize/sales-log.json', 'monetize/.processed-sessions.json',
                   'monetize/pending-emails.log', 'brain/identity/license.key']) {
    try { rmSync(join(ROOT, f)); } catch {}
  }
};

before(async () => {
  cleanFiles();
  srv = spawn(process.execPath, ['monetize/stripe-webhook.mjs'], {
    cwd: ROOT, env: { ...process.env, PORT: String(PORT), STRIPE_WEBHOOK_SECRET: SECRET }, stdio: 'ignore',
  });
  await new Promise(r => setTimeout(r, 800));
});
after(() => { srv?.kill('SIGINT'); cleanFiles(); });

const sign = (body, ts) => `t=${ts},v1=${createHmac('sha256', SECRET).update(`${ts}.${body}`).digest('hex')}`;
const post = (body, sig) => fetch(`http://localhost:${PORT}/webhook`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', 'stripe-signature': sig }, body,
});
const EVENT = JSON.stringify({
  type: 'checkout.session.completed',
  data: { object: { id: 'cs_test_123', customer_details: { email: 'wh@cliente.com' }, metadata: { tier: 'pro' } } },
});

test('firma valida responde 200 y emite licencia', async () => {
  const now = Math.floor(Date.now() / 1000);
  const r = await post(EVENT, sign(EVENT, now));
  assert.equal(r.status, 200);
  await new Promise(res => setTimeout(res, 600));
  const emitted = existsSync(SALES) && JSON.parse(readFileSync(SALES, 'utf8')).some(s => s.email === 'wh@cliente.com');
  assert.ok(emitted, 'no se registro la licencia en el CRM');
});

test('firma falsa es rechazada (400)', async () => {
  const now = Math.floor(Date.now() / 1000);
  const r = await post(EVENT, `t=${now},v1=deadbeef`);
  assert.equal(r.status, 400);
});

test('timestamp viejo es rechazado (anti-replay)', async () => {
  const old = Math.floor(Date.now() / 1000) - 600;
  const r = await post(EVENT, sign(EVENT, old));
  assert.equal(r.status, 400);
});

test('sesion repetida no duplica (idempotencia)', async () => {
  const now = Math.floor(Date.now() / 1000);
  const prev = JSON.parse(readFileSync(SALES, 'utf8')).length;
  await post(EVENT, sign(EVENT, now));
  await new Promise(res => setTimeout(res, 400));
  const post2 = JSON.parse(readFileSync(SALES, 'utf8')).length;
  assert.equal(prev, post2);
});
