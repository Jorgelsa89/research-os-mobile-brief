// Test E2E de seguridad del webhook de Stripe
import { spawn } from 'node:child_process';
import { createHmac } from 'node:crypto';
import { existsSync, rmSync, readFileSync } from 'node:fs';

const ROOT = '/home/user/research-os-mobile-brief';
const SECRET = 'whsec_test_secret_123';
const PORT = 4299;

// limpiar estado previo
for (const f of ['monetize/sales-log.json','monetize/.processed-sessions.json','monetize/pending-emails.log']) {
  try { rmSync(`${ROOT}/${f}`); } catch {}
}

const srv = spawn(process.execPath, ['monetize/stripe-webhook.mjs'], {
  cwd: ROOT,
  env: { ...process.env, PORT: String(PORT), STRIPE_WEBHOOK_SECRET: SECRET },
  stdio: 'ignore',
});

await new Promise(r => setTimeout(r, 800));

function sign(body, ts) {
  const sig = createHmac('sha256', SECRET).update(`${ts}.${body}`).digest('hex');
  return `t=${ts},v1=${sig}`;
}

function post(body, sigHeader) {
  return fetch(`http://localhost:${PORT}/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'stripe-signature': sigHeader },
    body,
  });
}

const event = JSON.stringify({
  type: 'checkout.session.completed',
  data: { object: {
    id: 'cs_test_123',
    customer_details: { email: 'webhooktest@cliente.com' },
    metadata: { tier: 'pro' },
  } },
});

let pass = 0, fail = 0;
const check = (name, cond) => { if (cond) { console.log(`  PASS ${name}`); pass++; } else { console.log(`  FAIL ${name}`); fail++; } };

const now = Math.floor(Date.now() / 1000);

// 1. Firma valida → 200
const r1 = await post(event, sign(event, now));
check('firma valida responde 200', r1.status === 200);

await new Promise(r => setTimeout(r, 600)); // dar tiempo a emitir

// 2. La licencia se emitio (sales-log)
const salesPath = `${ROOT}/monetize/sales-log.json`;
const emitted = existsSync(salesPath) && JSON.parse(readFileSync(salesPath,'utf8')).some(s => s.email === 'webhooktest@cliente.com');
check('licencia emitida y registrada en CRM', emitted);

// 3. La key cayo a pending-emails.log (sin Resend)
const pending = existsSync(`${ROOT}/monetize/pending-emails.log`) && readFileSync(`${ROOT}/monetize/pending-emails.log`,'utf8').includes('webhooktest@cliente.com');
check('key guardada en pending-emails.log', pending);

// 4. Firma INVALIDA → 400 (ataque)
const r2 = await post(event, `t=${now},v1=deadbeef`);
check('firma falsa rechazada (400)', r2.status === 400);

// 5. Timestamp viejo (replay) → 400
const old = now - 600; // 10 min
const r3 = await post(event, sign(event, old));
check('timestamp viejo rechazado (anti-replay, 400)', r3.status === 400);

// 6. Idempotencia: reenviar misma sesion no duplica
const before = JSON.parse(readFileSync(salesPath,'utf8')).length;
await post(event, sign(event, now));
await new Promise(r => setTimeout(r, 400));
const after = JSON.parse(readFileSync(salesPath,'utf8')).length;
check('idempotente: sesion repetida no duplica licencia', before === after);

srv.kill('SIGINT');
// limpiar
for (const f of ['monetize/sales-log.json','monetize/.processed-sessions.json','monetize/pending-emails.log','brain/identity/license.key']) {
  try { rmSync(`${ROOT}/${f}`); } catch {}
}

console.log(`\n  RESULTADO: ${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
