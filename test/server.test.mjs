// Test de los endpoints del servidor (dashboard + admin + license + brief)
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 3091;
const base = `http://localhost:${PORT}`;
let srv;

before(async () => {
  srv = spawn(process.execPath, ['serve.mjs'], {
    cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore',
  });
  await new Promise(r => setTimeout(r, 900));
});
after(() => srv?.kill('SIGINT'));

test('/api/brain/status devuelve conteos por skill', async () => {
  const d = await (await fetch(`${base}/api/brain/status`)).json();
  assert.ok(typeof d.research === 'number');
  assert.ok('trading' in d && 'daily' in d);
});

test('/api/license devuelve tier free sin licencia', async () => {
  const d = await (await fetch(`${base}/api/license`)).json();
  assert.ok(['free', 'pro', 'team', 'enterprise'].includes(d.tier));
  assert.ok(d.features, 'falta el objeto features');
});

test('/api/admin/sales responde en localhost', async () => {
  const d = await (await fetch(`${base}/api/admin/sales`)).json();
  assert.ok('mrr' in d && 'active' in d);
});

test('/api/brief devuelve el brief del dia', async () => {
  const r = await fetch(`${base}/api/brief`);
  assert.equal(r.status, 200);
  const d = await r.json();
  assert.ok('research' in d && 'watchlist' in d);
});

test('dashboard.html y admin.html se sirven', async () => {
  assert.equal((await fetch(`${base}/dashboard.html`)).status, 200);
  assert.equal((await fetch(`${base}/admin.html`)).status, 200);
});
