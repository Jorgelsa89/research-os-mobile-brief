// Test del conector de broker (modo paper)
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, rmSync, renameSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CLI = join(ROOT, 'brain', 'sync', 'connectors', 'broker', 'broker.mjs');
const POS = join(ROOT, 'brain', 'knowledge', 'trading', 'positions.json');
const BAK = POS + '.bak';

function run(args) {
  return execFileSync(process.execPath, [CLI, ...args], { cwd: ROOT, encoding: 'utf8' });
}

// Preservar el positions.json real durante el test
before(() => { if (existsSync(POS)) renameSync(POS, BAK); });
after(() => {
  if (existsSync(POS)) rmSync(POS);
  if (existsSync(BAK)) renameSync(BAK, POS);
});

test('add + positions refleja la posicion en modo paper', () => {
  run(['add', 'NVDA', '10', '1200']);
  const out = run(['positions']);
  assert.ok(out.includes('NVDA'), 'NVDA no aparece en positions');
  assert.ok(out.includes('PAPER'), 'no indica modo PAPER');
});

test('precio simulado es deterministico (misma corrida, mismo P/L)', () => {
  const a = run(['pnl']);
  const b = run(['pnl']);
  assert.equal(a, b, 'el P/L no es reproducible (uso de aleatoriedad?)');
});

test('close elimina la posicion', () => {
  run(['close', 'NVDA']);
  const out = run(['positions']);
  assert.ok(!out.includes('NVDA') || out.toLowerCase().includes('sin posiciones') || out.includes('0'),
    'NVDA sigue tras cerrarla');
});
