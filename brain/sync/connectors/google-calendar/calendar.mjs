#!/usr/bin/env node
/**
 * Axon — Google Calendar Connector
 *
 * Uso:
 *   node calendar.mjs add "Salida Boho" "2026-06-27T21:30:00" [duracion_min] [notas]
 *   node calendar.mjs list [dias_adelante]
 *   node calendar.mjs today
 *   node calendar.mjs tomorrow
 *
 * Requiere: tokens encriptados en brain/identity/ (categoría: google-calendar)
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');

// Lee tokens desencriptados (pide contraseña si es necesario)
async function getTokens() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const password = await new Promise(r => rl.question('🔑 Contraseña maestra: ', r));
  rl.close();

  try {
    const result = execSync(
      `node "${path.join(ROOT, 'brain/security/crypto.mjs')}" read google-calendar`,
      { input: password + '\n', encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    );
    return JSON.parse(result.trim());
  } catch {
    console.error('❌ Error al desencriptar tokens. Verifica tu contraseña.');
    process.exit(1);
  }
}

// Obtiene access token fresco usando el refresh token
async function getAccessToken(tokens) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: tokens.client_id,
      client_secret: tokens.client_secret,
      refresh_token: tokens.refresh_token,
      grant_type: 'refresh_token'
    })
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('No se pudo refrescar el token: ' + JSON.stringify(data));
  return data.access_token;
}

// Timezone de Jorge (Florida = Eastern)
const TZ = 'America/New_York';

async function addEvent(title, datetime, durationMin = 60, notes = '') {
  const tokens = await getTokens();
  const accessToken = await getAccessToken(tokens);

  const start = new Date(datetime);
  const end = new Date(start.getTime() + durationMin * 60000);

  const event = {
    summary: title,
    description: notes ? `${notes}\n\nAgregado por Axon` : 'Agregado por Axon',
    start: { dateTime: start.toISOString(), timeZone: TZ },
    end: { dateTime: end.toISOString(), timeZone: TZ }
  };

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(event)
  });

  const data = await res.json();
  if (data.error) throw new Error(JSON.stringify(data.error));

  console.log(`\n✅ Evento creado: ${data.summary}`);
  console.log(`   📅 ${new Date(data.start.dateTime).toLocaleString('es', { timeZone: TZ })}`);
  console.log(`   🔗 ${data.htmlLink}\n`);
  return data;
}

async function listEvents(daysAhead = 7) {
  const tokens = await getTokens();
  const accessToken = await getAccessToken(tokens);

  const now = new Date();
  const future = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    timeMin: now.toISOString(),
    timeMax: future.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '20'
  });

  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  const data = await res.json();
  if (data.error) throw new Error(JSON.stringify(data.error));

  if (!data.items?.length) {
    console.log('\n📅 No hay eventos proximos.\n');
    return [];
  }

  console.log(`\n📅 Proximos ${daysAhead} dias:\n`);
  for (const ev of data.items) {
    const start = ev.start.dateTime || ev.start.date;
    const dt = new Date(start);
    const label = isNaN(dt) ? start : dt.toLocaleString('es', { timeZone: TZ, dateStyle: 'short', timeStyle: 'short' });
    console.log(`  • ${label} — ${ev.summary}`);
  }
  console.log();
  return data.items;
}

async function todayEvents() {
  const tokens = await getTokens();
  const accessToken = await getAccessToken(tokens);

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const params = new URLSearchParams({
    timeMin: startOfDay.toISOString(),
    timeMax: endOfDay.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime'
  });

  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  const data = await res.json();
  if (!data.items?.length) {
    console.log('\n📅 Hoy no hay eventos en Google Calendar.\n');
    return [];
  }

  console.log('\n📅 Hoy:\n');
  for (const ev of data.items) {
    const start = ev.start.dateTime || ev.start.date;
    const dt = new Date(start);
    const time = isNaN(dt) ? 'Todo el dia' : dt.toLocaleTimeString('es', { timeZone: TZ, timeStyle: 'short' });
    console.log(`  • ${time} — ${ev.summary}`);
  }
  console.log();
  return data.items;
}

// CLI
const [,, cmd, ...args] = process.argv;

try {
  switch (cmd) {
    case 'add': {
      const [title, datetime, duration, notes] = args;
      if (!title || !datetime) {
        console.error('Uso: node calendar.mjs add "Titulo" "YYYY-MM-DDTHH:MM:SS" [duracion_min] [notas]');
        process.exit(1);
      }
      await addEvent(title, datetime, parseInt(duration) || 60, notes || '');
      break;
    }
    case 'list':
      await listEvents(parseInt(args[0]) || 7);
      break;
    case 'today':
      await todayEvents();
      break;
    case 'tomorrow': {
      const tokens = await getTokens();
      const accessToken = await getAccessToken(tokens);
      const tom = new Date();
      tom.setDate(tom.getDate() + 1);
      tom.setHours(0, 0, 0, 0);
      const tomEnd = new Date(tom);
      tomEnd.setHours(23, 59, 59, 999);
      const params = new URLSearchParams({
        timeMin: tom.toISOString(),
        timeMax: tomEnd.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime'
      });
      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const data = await res.json();
      if (!data.items?.length) { console.log('\n📅 Manana no hay eventos.\n'); break; }
      console.log('\n📅 Manana:\n');
      for (const ev of data.items) {
        const dt = new Date(ev.start.dateTime || ev.start.date);
        const time = isNaN(dt) ? 'Todo el dia' : dt.toLocaleTimeString('es', { timeZone: TZ, timeStyle: 'short' });
        console.log(`  • ${time} — ${ev.summary}`);
      }
      console.log();
      break;
    }
    default:
      console.log('\nUso:');
      console.log('  node calendar.mjs add "Titulo" "2026-06-27T21:30:00" [minutos] [notas]');
      console.log('  node calendar.mjs today');
      console.log('  node calendar.mjs tomorrow');
      console.log('  node calendar.mjs list [dias]\n');
  }
} catch (err) {
  console.error('\n❌ Error:', err.message, '\n');
  process.exit(1);
}
