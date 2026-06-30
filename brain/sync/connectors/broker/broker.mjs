#!/usr/bin/env node
/**
 * Axon — Broker Connector
 *
 * Lee posiciones reales del broker para el skill de trading.
 *
 * Uso:
 *   node broker.mjs positions                 — posiciones actuales con P/L
 *   node broker.mjs balance                   — cash, equity, buying power
 *   node broker.mjs add <ticker> <cant> <precio_entrada>  — agrega posicion (paper)
 *   node broker.mjs close <ticker>            — cierra una posicion (paper)
 *   node broker.mjs pnl                        — resumen de P/L total
 *
 * MODOS:
 *   [PAPER] (default) — lee/escribe brain/knowledge/trading/positions.json.
 *                       Precio actual simulado de forma deterministica.
 *   [REAL]  (stub)    — si existe tokens.enc (credenciales Schwab encriptadas)
 *                       llamaria a la API de Schwab/thinkorswim. Pendiente de keys.
 *
 * Requiere: solo node built-ins.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKEN_PATH = path.join(__dirname, 'tokens.enc');
// brain/sync/connectors/broker -> sube 3 niveles a la raiz del proyecto
const ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const POSITIONS_PATH = path.join(ROOT, 'brain', 'knowledge', 'trading', 'positions.json');

// Balance base del modo paper (cash inicial de la cuenta simulada)
const PAPER_CASH = 25000;

// ── Helpers de archivo ──────────────────────────────────────────────────────

function loadPaperState() {
  if (!existsSync(POSITIONS_PATH)) {
    return { mode: 'paper', cash: PAPER_CASH, positions: [] };
  }
  try {
    const data = JSON.parse(readFileSync(POSITIONS_PATH, 'utf8'));
    if (typeof data.cash !== 'number') data.cash = PAPER_CASH;
    if (!Array.isArray(data.positions)) data.positions = [];
    return data;
  } catch {
    return { mode: 'paper', cash: PAPER_CASH, positions: [] };
  }
}

function savePaperState(state) {
  const dir = path.dirname(POSITIONS_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  state.updated = new Date().toISOString().slice(0, 10);
  writeFileSync(POSITIONS_PATH, JSON.stringify(state, null, 2) + '\n', 'utf8');
}

// ── Precio simulado deterministico (modo paper) ─────────────────────────────
//
// En modo REAL este precio vendria de la API de Schwab (quote endpoint).
// En modo PAPER usamos un hash simple del ticker + el dia para que la
// variacion sea reproducible y testeable (no Math.random).
function deterministicVariation(ticker, day = todayKey()) {
  const seed = ticker.toUpperCase() + '|' + day;
  let h = 2166136261; // FNV-1a 32-bit
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Normaliza a [0, 1)
  const norm = (h >>> 0) / 4294967296;
  // Variacion en rango [-3%, +3%]
  return (norm - 0.5) * 0.06;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function currentPricePaper(ticker, entryPrice) {
  const variation = deterministicVariation(ticker);
  return entryPrice * (1 + variation);
}

// ── Modo REAL (stub documentado) ────────────────────────────────────────────
//
// Si existe tokens.enc, aqui se integraria la API de Schwab/thinkorswim.
// Por ahora retorna null para que el flujo caiga a modo paper.
async function fetchRealPositions() {
  if (!existsSync(TOKEN_PATH)) return null;

  // TODO: integrar Schwab API cuando Jorge tenga las keys.
  //   1. Desencriptar tokens.enc con la contrasena maestra (patron de gmail/calendar:
  //      pbkdf2 + aes-256-gcm) para obtener { client_id, client_secret, refresh_token }.
  //   2. Refrescar el access_token contra https://api.schwabapi.com/v1/oauth/token.
  //   3. GET https://api.schwabapi.com/trader/v1/accounts?fields=positions
  //   4. Mapear la respuesta al mismo shape que el modo paper:
  //      { ticker, qty, entry, current } y { cash, equity, buyingPower }.
  //
  // Mientras no este implementado, avisamos y caemos a paper.
  console.error('⚠️  tokens.enc detectado pero la integracion Schwab aun no esta implementada. Usando modo PAPER.');
  return null;
}

// Detecta el modo activo segun la presencia de credenciales.
function detectMode() {
  return existsSync(TOKEN_PATH) ? 'real' : 'paper';
}

function modeTag() {
  return detectMode() === 'real' ? '[REAL]' : '[PAPER]';
}

// ── Enriquecimiento: agrega precio actual y P/L a cada posicion ─────────────

function enrichPositions(positions) {
  return positions.map(p => {
    const current = currentPricePaper(p.ticker, p.entry);
    const pl = (current - p.entry) * p.qty;
    const plPct = ((current - p.entry) / p.entry) * 100;
    return { ...p, current, pl, plPct };
  });
}

function fmt(n) {
  return n.toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function signFmt(n) {
  return (n >= 0 ? '+' : '') + fmt(n);
}

// ── Comandos ────────────────────────────────────────────────────────────────

async function cmdPositions() {
  const real = await fetchRealPositions();
  const state = loadPaperState();
  const raw = real ? real.positions : state.positions;

  console.log(`\n${modeTag()} Posiciones actuales:\n`);

  if (!raw.length) {
    console.log('  📭 No hay posiciones abiertas.\n');
    return;
  }

  const positions = enrichPositions(raw);

  console.log('  Ticker   Cant   Entrada    Actual     P/L          P/L%');
  console.log('  ' + '─'.repeat(60));
  for (const p of positions) {
    const arrow = p.pl >= 0 ? '🟢' : '🔴';
    console.log(
      `  ${arrow} ${p.ticker.padEnd(6)} ${String(p.qty).padStart(4)}  ` +
      `${fmt(p.entry).padStart(9)}  ${fmt(p.current).padStart(9)}  ` +
      `${signFmt(p.pl).padStart(11)}  ${signFmt(p.plPct).padStart(7)}%`
    );
  }
  console.log();
  if (detectMode() === 'paper') {
    console.log('  ℹ️  Precio actual simulado (deterministico). En modo REAL vendria de la API de Schwab.\n');
  }
}

async function cmdBalance() {
  const real = await fetchRealPositions();
  const state = loadPaperState();
  const cash = real ? real.cash : state.cash;
  const positions = enrichPositions(real ? real.positions : state.positions);

  const marketValue = positions.reduce((s, p) => s + p.current * p.qty, 0);
  const equity = cash + marketValue;
  // Buying power simple: cash + margen (asumimos cuenta cash, sin margen real)
  const buyingPower = cash;

  console.log(`\n${modeTag()} Balance de la cuenta:\n`);
  console.log(`  💵 Cash:           $${fmt(cash)}`);
  console.log(`  📊 Valor mercado:  $${fmt(marketValue)}`);
  console.log(`  💰 Equity:         $${fmt(equity)}`);
  console.log(`  🛒 Buying power:   $${fmt(buyingPower)}`);
  console.log();
}

async function cmdAdd(ticker, qty, entry) {
  if (detectMode() === 'real') {
    console.error('⚠️  En modo REAL no se agregan posiciones manualmente (las refleja el broker). Comando solo para modo PAPER.');
    process.exit(1);
  }
  ticker = ticker.toUpperCase();
  qty = Number(qty);
  entry = Number(entry);
  if (!ticker || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(entry) || entry <= 0) {
    console.error('Uso: node broker.mjs add <ticker> <cantidad> <precio_entrada>');
    process.exit(1);
  }

  const state = loadPaperState();
  const existing = state.positions.find(p => p.ticker === ticker);
  const cost = qty * entry;

  if (existing) {
    // Promedia el precio de entrada
    const totalQty = existing.qty + qty;
    existing.entry = (existing.entry * existing.qty + entry * qty) / totalQty;
    existing.qty = totalQty;
  } else {
    state.positions.push({ ticker, qty, entry, opened: todayKey() });
  }
  state.cash -= cost;
  savePaperState(state);

  console.log(`\n${modeTag()} ✅ Posicion agregada: ${qty} ${ticker} @ $${fmt(entry)} (costo $${fmt(cost)})`);
  console.log(`   Cash restante: $${fmt(state.cash)}\n`);
}

async function cmdClose(ticker) {
  if (detectMode() === 'real') {
    console.error('⚠️  En modo REAL no se cierran posiciones desde aqui. Comando solo para modo PAPER.');
    process.exit(1);
  }
  ticker = (ticker || '').toUpperCase();
  if (!ticker) {
    console.error('Uso: node broker.mjs close <ticker>');
    process.exit(1);
  }

  const state = loadPaperState();
  const idx = state.positions.findIndex(p => p.ticker === ticker);
  if (idx === -1) {
    console.error(`\n${modeTag()} ❌ No hay posicion abierta en ${ticker}.\n`);
    process.exit(1);
  }

  const pos = state.positions[idx];
  const current = currentPricePaper(pos.ticker, pos.entry);
  const proceeds = current * pos.qty;
  const pl = (current - pos.entry) * pos.qty;
  const plPct = ((current - pos.entry) / pos.entry) * 100;

  state.cash += proceeds;
  state.positions.splice(idx, 1);
  savePaperState(state);

  const arrow = pl >= 0 ? '🟢' : '🔴';
  console.log(`\n${modeTag()} ✅ Posicion cerrada: ${pos.qty} ${ticker} @ $${fmt(current)}`);
  console.log(`   ${arrow} P/L: ${signFmt(pl)} (${signFmt(plPct)}%)`);
  console.log(`   Cash actual: $${fmt(state.cash)}\n`);
}

async function cmdPnl() {
  const real = await fetchRealPositions();
  const state = loadPaperState();
  const positions = enrichPositions(real ? real.positions : state.positions);

  console.log(`\n${modeTag()} Resumen de P/L:\n`);

  if (!positions.length) {
    console.log('  📭 No hay posiciones abiertas.\n');
    return;
  }

  let totalPl = 0;
  let totalCost = 0;
  for (const p of positions) {
    const arrow = p.pl >= 0 ? '🟢' : '🔴';
    totalPl += p.pl;
    totalCost += p.entry * p.qty;
    console.log(`  ${arrow} ${p.ticker.padEnd(6)} ${signFmt(p.pl).padStart(11)}  (${signFmt(p.plPct)}%)`);
  }
  const totalPct = totalCost > 0 ? (totalPl / totalCost) * 100 : 0;
  console.log('  ' + '─'.repeat(40));
  const arrow = totalPl >= 0 ? '🟢' : '🔴';
  console.log(`  ${arrow} TOTAL  ${signFmt(totalPl).padStart(11)}  (${signFmt(totalPct)}%)`);
  console.log(`     Costo base: $${fmt(totalCost)}\n`);
}

// ── CLI ──────────────────────────────────────────────────────────────────────

const [,, cmd, ...args] = process.argv;

try {
  switch (cmd) {
    case 'positions':
      await cmdPositions();
      break;
    case 'balance':
      await cmdBalance();
      break;
    case 'add':
      await cmdAdd(args[0], args[1], args[2]);
      break;
    case 'close':
      await cmdClose(args[0]);
      break;
    case 'pnl':
      await cmdPnl();
      break;
    default:
      console.log('\nUso:');
      console.log('  node broker.mjs positions                              — posiciones con P/L');
      console.log('  node broker.mjs balance                                — cash, equity, buying power');
      console.log('  node broker.mjs add <ticker> <cantidad> <precio>       — agrega posicion (paper)');
      console.log('  node broker.mjs close <ticker>                         — cierra posicion (paper)');
      console.log('  node broker.mjs pnl                                    — resumen de P/L total');
      console.log(`\nModo actual: ${modeTag()}\n`);
  }
} catch (err) {
  console.error('\n❌ Error:', err.message, '\n');
  process.exit(1);
}
