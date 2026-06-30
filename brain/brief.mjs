#!/usr/bin/env node
/**
 * Axon — Auto-Brief
 *
 * Compila tu dia desde el cerebro, sin que tengas que preguntar nada.
 * Lee solo fuentes locales (no pide contrasena), asi puede correr al arrancar.
 *
 * Uso:
 *   node brain/brief.mjs          → imprime el brief del dia
 *   node brain/brief.mjs --json   → devuelve el brief como JSON (para el dashboard)
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const K = join(ROOT, 'brain', 'knowledge');
const AS_JSON = process.argv.includes('--json');

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  green: '\x1b[32m', blue: '\x1b[36m', yellow: '\x1b[33m', red: '\x1b[31m',
};

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  const meta = {};
  if (m) {
    for (const line of m[1].split('\n')) {
      const kv = line.match(/^(\w+):\s*(.*)$/);
      if (kv) meta[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
    }
  }
  return meta;
}

function latestNotes(dir, n) {
  const full = join(K, dir);
  if (!existsSync(full)) return [];
  return readdirSync(full)
    .filter(f => f.endsWith('.md'))
    .sort().reverse().slice(0, n)
    .map(f => ({ file: f, ...parseFrontmatter(readFileSync(join(full, f), 'utf8')) }));
}

// --- Compilar las secciones ---
const brief = { fecha: null, ayer: null, watchlist: [], research: [], pendientes: [] };

// Nota diaria mas reciente (contexto de ayer + pendientes)
const lastDaily = latestNotes('daily', 1)[0];
if (lastDaily) {
  brief.ayer = lastDaily.date || lastDaily.file.replace('.md', '');
  const body = readFileSync(join(K, 'daily', lastDaily.file), 'utf8');
  const pend = body.match(/## Pendientes[^\n]*\n([\s\S]*?)(?:\n##|$)/);
  if (pend) {
    brief.pendientes = pend[1].split('\n')
      .filter(l => l.trim().startsWith('-'))
      .map(l => l.replace(/^\s*-\s*/, '').trim())
      .filter(Boolean);
  }
}

// Watchlist
const wlPath = join(K, 'trading', 'watchlist.md');
if (existsSync(wlPath)) {
  const wl = readFileSync(wlPath, 'utf8');
  for (const line of wl.split('\n')) {
    const row = line.match(/^\|\s*([A-Z0-9.]+)\s*\|\s*([^|]+?)\s*\|\s*(positivo|negativo|mixto)\s*\|\s*([\d.]+)\s*\|/i);
    if (row) brief.watchlist.push({ ticker: row[1], nombre: row[2].trim(), sentimiento: row[3], score: row[4] });
  }
}

// Research reciente
brief.research = latestNotes('research', 3).map(r => ({
  titulo: r.title || r.file, ticker: r.ticker || '', score: r.score || '', decision: r.decision || '',
}));

if (AS_JSON) {
  console.log(JSON.stringify(brief, null, 2));
  process.exit(0);
}

// --- Render bonito ---
const hora = new Date().getHours();
const saludo = hora < 12 ? 'Buenos dias' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

console.log(`\n${C.blue}${C.bold}  ${saludo}, Jorge.${C.reset} ${C.dim}Esto es lo que tienes:${C.reset}\n`);

if (brief.research.length) {
  console.log(`${C.bold}  📊 Research reciente${C.reset}`);
  for (const r of brief.research) {
    const band = parseFloat(r.score) >= 8 ? C.green : parseFloat(r.score) >= 6 ? C.yellow : C.red;
    const tk = r.ticker ? `${C.dim}[${r.ticker}]${C.reset} ` : '';
    const sc = r.score ? ` ${band}${r.score}${C.reset}` : '';
    const dc = r.decision ? ` ${C.dim}·${C.reset} ${r.decision}` : '';
    console.log(`    ${tk}${r.titulo}${sc}${dc}`);
  }
  console.log('');
}

if (brief.watchlist.length) {
  console.log(`${C.bold}  📈 Watchlist${C.reset}`);
  for (const w of brief.watchlist) {
    const col = w.sentimiento === 'positivo' ? C.green : w.sentimiento === 'negativo' ? C.red : C.yellow;
    console.log(`    ${col}●${C.reset} ${w.ticker.padEnd(8)} ${C.dim}${w.score}${C.reset}  ${w.nombre}`);
  }
  console.log('');
}

if (brief.pendientes.length) {
  console.log(`${C.bold}  ✅ Pendientes ${C.dim}(de ${brief.ayer})${C.reset}`);
  for (const p of brief.pendientes) console.log(`    ${C.yellow}○${C.reset} ${p}`);
  console.log('');
}

if (!brief.research.length && !brief.watchlist.length && !brief.pendientes.length) {
  console.log(`${C.dim}  Tu cerebro esta limpio. Di "investiga [algo]" para empezar.${C.reset}\n`);
}

console.log(`${C.dim}  Para el brief completo con calendario y correo, di "que hay para hoy" en Claude Code.${C.reset}\n`);
