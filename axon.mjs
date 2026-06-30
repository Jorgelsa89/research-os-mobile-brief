#!/usr/bin/env node
/**
 * Axon — Launcher de un solo comando
 *
 * Hace TODO lo que antes eran 5-6 comandos manuales:
 *   - Se ubica solo en la raiz del repo (no importa desde donde corras)
 *   - Verifica Node.js v18+
 *   - Sincroniza con GitHub (auto-stash si hay cambios locales)
 *   - Detecta que conectores estan configurados
 *   - Arranca el dashboard
 *   - Te dice exactamente que decir para empezar
 *
 * Uso:
 *   node axon.mjs            → arranca todo
 *   node axon.mjs --no-pull  → arranca sin sincronizar con GitHub
 *   node axon.mjs --status   → solo muestra el estado, no arranca el server
 */

import { execSync, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const NO_PULL = args.includes('--no-pull');
const STATUS_ONLY = args.includes('--status');

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  green: '\x1b[32m', blue: '\x1b[36m', yellow: '\x1b[33m', red: '\x1b[31m',
};
const ok = (s) => console.log(`  ${C.green}✓${C.reset} ${s}`);
const warn = (s) => console.log(`  ${C.yellow}!${C.reset} ${s}`);
const info = (s) => console.log(`  ${C.dim}·${C.reset} ${s}`);

function run(cmd, opts = {}) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: 'pipe', ...opts }).trim();
}

console.log(`
${C.blue}${C.bold}  ▄▀█ ▀▄▀ █▀█ █▄░█
  █▀█ █░█ █▄█ █░▀█${C.reset}  ${C.dim}tu cerebro digital${C.reset}
`);

// 1. Node version
const major = parseInt(process.versions.node.split('.')[0], 10);
if (major < 18) {
  console.log(`${C.red}  ✗ Necesitas Node.js v18+. Tienes v${process.versions.node}.${C.reset}`);
  console.log(`    Descarga: https://nodejs.org\n`);
  process.exit(1);
}
ok(`Node.js v${process.versions.node}`);

// 2. Sincronizar con GitHub
if (!NO_PULL) {
  try {
    const branch = run('git rev-parse --abbrev-ref HEAD');
    let stashed = false;
    const dirty = run('git status --porcelain');
    if (dirty) {
      run('git stash push -u -m "axon-launcher-autostash"');
      stashed = true;
      info('Cambios locales guardados temporalmente');
    }
    try {
      run(`git pull --ff-only origin ${branch}`);
      ok(`Sincronizado con GitHub (${branch})`);
    } catch {
      warn('No se pudo sincronizar (sin internet o conflicto). Sigo con lo local.');
    }
    if (stashed) {
      try {
        run('git stash pop');
        info('Cambios locales restaurados');
      } catch {
        warn('Tus cambios locales estan en "git stash" — recuperalos con: git stash pop');
      }
    }
  } catch {
    warn('No es un repo git o git no esta instalado. Sigo sin sincronizar.');
  }
} else {
  info('Sincronizacion omitida (--no-pull)');
}

// 3. Detectar conectores configurados
const connectors = [
  { name: 'Google Calendar', token: 'brain/sync/connectors/google-calendar/tokens.enc',
    setup: 'node brain/sync/connectors/google-calendar/auth.mjs' },
  { name: 'Gmail', token: 'brain/sync/connectors/gmail/tokens.enc',
    setup: 'node brain/sync/connectors/gmail/auth.mjs' },
];
console.log('');
const pending = [];
for (const c of connectors) {
  if (existsSync(join(ROOT, c.token))) ok(`${c.name} conectado`);
  else { warn(`${c.name} sin conectar`); pending.push(c); }
}

// 4. Contar el cerebro
try {
  const count = run('git ls-files brain/knowledge | grep -c ".md$" || true', { stdio: ['pipe','pipe','ignore'] });
  if (count) info(`${count} notas en el cerebro`);
} catch { /* opcional */ }

// 5. Auto-brief: tu dia, sin preguntar
if (existsSync(join(ROOT, 'brain', 'brief.mjs'))) {
  try {
    const brief = run('node brain/brief.mjs');
    console.log(brief);
  } catch { /* si falla el brief, no bloquea el arranque */ }
}

// 6. Resumen y arranque
console.log(`${C.bold}  Listo para usar.${C.reset}\n`);

if (pending.length) {
  console.log(`${C.dim}  Para conectar lo que falta (una sola vez):${C.reset}`);
  for (const c of pending) console.log(`    ${C.blue}${c.setup}${C.reset}`);
  console.log('');
}

console.log(`${C.dim}  En Claude Code, prueba decir:${C.reset}`);
console.log(`    ${C.green}"que hay para hoy"${C.reset}        → tu brief del dia`);
console.log(`    ${C.green}"investiga NVDA"${C.reset}          → analisis con score`);
console.log(`    ${C.green}"crea un skill para..."${C.reset}   → nueva habilidad`);
console.log('');

if (STATUS_ONLY) process.exit(0);

// 7. Arrancar el dashboard
if (existsSync(join(ROOT, 'serve.mjs'))) {
  console.log(`${C.dim}  Arrancando dashboard...${C.reset}\n`);
  const server = spawn(process.execPath, ['serve.mjs'], { cwd: ROOT, stdio: 'inherit' });
  process.on('SIGINT', () => { server.kill('SIGINT'); process.exit(0); });
}
