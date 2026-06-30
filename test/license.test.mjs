// Tests del sistema de licencias (firma Ed25519, validacion offline)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CLI = join(ROOT, 'monetize', 'license.mjs');
const SALES = join(ROOT, 'monetize', 'sales-log.json');

function run(args) {
  return execFileSync(process.execPath, [CLI, ...args], { cwd: ROOT, encoding: 'utf8' });
}
function keyFrom(out) {
  return out.split('\n').map(l => l.trim()).find(l => l.startsWith('AXON-'));
}

const hadSales = existsSync(SALES);
test.after(() => { if (!hadSales && existsSync(SALES)) rmSync(SALES); });

test('las claves existen (keygen previo)', () => {
  assert.ok(existsSync(join(ROOT, 'monetize', 'keys', 'public.pem')), 'falta public.pem');
  assert.ok(existsSync(join(ROOT, 'monetize', 'keys', 'private.pem')),
    'falta private.pem — corre: node monetize/license.mjs keygen');
});

test('issue genera una key valida que verify acepta', () => {
  const key = keyFrom(run(['issue', 'tester@axon.com', 'pro', '12']));
  assert.ok(key, 'no se genero key');
  const v = JSON.parse(run(['verify', key]));
  assert.equal(v.valid, true);
  assert.equal(v.payload.tier, 'pro');
  assert.equal(v.payload.email, 'tester@axon.com');
});

test('una key alterada es rechazada (anti-falsificacion)', () => {
  const key = keyFrom(run(['issue', 'x@y.com', 'pro', '1']));
  const tampered = key.replace('AXON-', 'AXON-X');
  let res;
  try { res = JSON.parse(run(['verify', tampered])); }
  catch (e) { res = JSON.parse(e.stdout); } // verify sale con code 1
  assert.equal(res.valid, false);
});

test('tier invalido se rechaza al emitir', () => {
  assert.throws(() => execFileSync(process.execPath, [CLI, 'issue', 'a@b.com', 'superadmin', '1'],
    { cwd: ROOT, stdio: 'pipe' }));
});
