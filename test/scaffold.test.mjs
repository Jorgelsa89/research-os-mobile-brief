// Test del scaffolder de skills
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, rmSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SCAFFOLD = join(ROOT, 'skills', 'skill-creator', 'scaffold.mjs');
const NAME = 'testscaffold';

function cleanup() {
  rmSync(join(ROOT, 'skills', NAME), { recursive: true, force: true });
  rmSync(join(ROOT, 'brain', 'knowledge', NAME), { recursive: true, force: true });
}

test.before(cleanup);
test.after(cleanup);

test('scaffold genera un skill con frontmatter canonico', () => {
  execFileSync(process.execPath, [SCAFFOLD, NAME, 'dominio de prueba', 'uno,dos,tres'],
    { cwd: ROOT, encoding: 'utf8' });
  const md = readFileSync(join(ROOT, 'skills', NAME, 'SKILL.md'), 'utf8');
  assert.ok(md.includes(`skill: ${NAME}`), 'falta skill:');
  assert.ok(md.includes('domain: dominio de prueba'), 'falta domain');
  assert.ok(md.includes('triggers:'), 'falta triggers');
  assert.ok(md.includes('status: activo'), 'falta status');
  assert.ok(existsSync(join(ROOT, 'skills', NAME, 'lessons.md')), 'falta lessons.md');
  assert.ok(existsSync(join(ROOT, 'brain', 'knowledge', NAME, '.gitkeep')), 'falta carpeta de conocimiento');
});

test('scaffold rechaza nombre duplicado', () => {
  assert.throws(() => execFileSync(process.execPath, [SCAFFOLD, NAME, 'x', 'a,b,c'],
    { cwd: ROOT, stdio: 'pipe' }));
});
