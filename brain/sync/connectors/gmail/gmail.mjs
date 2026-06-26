#!/usr/bin/env node
/**
 * Axon — Gmail Connector
 *
 * Uso:
 *   node gmail.mjs list [N]           — ultimos N correos del inbox (default 10)
 *   node gmail.mjs read <id>          — contenido completo de un correo
 *   node gmail.mjs unread             — correos no leidos
 *   node gmail.mjs triage             — inbox con categoria [URGENTE/INFORMATIVO/SPAM/SEGUIMIENTO]
 *   node gmail.mjs send <para> <asunto> <cuerpo>  — envia un correo
 *
 * Requiere: tokens encriptados en tokens.enc (generado por auth.mjs)
 */

import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { createDecipheriv, pbkdf2Sync } from 'node:crypto';
import { readFileSync } from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKEN_PATH = path.join(__dirname, 'tokens.enc');

const TZ = 'America/New_York';
const BASE_URL = 'https://gmail.googleapis.com/gmail/v1/users/me';

// ── Encriptacion ─────────────────────────────────────────────────────────────

function decryptTokens(buffer, password) {
  const salt = buffer.subarray(0, 32);
  const iv = buffer.subarray(32, 48);
  const tag = buffer.subarray(48, 64);
  const ciphertext = buffer.subarray(64);
  const key = pbkdf2Sync(password, salt, 100_000, 32, 'sha512');
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return JSON.parse(Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8'));
}

async function getTokens() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
  const password = await new Promise(r => rl.question('Contrasena maestra: ', r));
  rl.close();
  try {
    return decryptTokens(readFileSync(TOKEN_PATH), password);
  } catch {
    console.error('Error al desencriptar. Verifica tu contrasena o reconecta con: node brain/sync/connectors/gmail/auth.mjs');
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function decodeBase64Url(str) {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

function encodeBase64Url(str) {
  return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function getHeader(headers, name) {
  return headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';
}

function formatDate(internalDate) {
  if (!internalDate) return '—';
  return new Date(parseInt(internalDate)).toLocaleString('es', {
    timeZone: TZ,
    dateStyle: 'short',
    timeStyle: 'short'
  });
}

// Extrae el cuerpo de texto plano o HTML del mensaje
function extractBody(payload) {
  // Caso: body directo
  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }
  // Caso: multipart — buscar text/plain primero, luego text/html
  if (payload.parts) {
    const plain = payload.parts.find(p => p.mimeType === 'text/plain');
    if (plain?.body?.data) return decodeBase64Url(plain.body.data);
    const html = payload.parts.find(p => p.mimeType === 'text/html');
    if (html?.body?.data) {
      // Limpieza basica de HTML
      return decodeBase64Url(html.body.data).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    }
    // Buscar recursivamente en partes anidadas
    for (const part of payload.parts) {
      if (part.parts) {
        const body = extractBody(part);
        if (body) return body;
      }
    }
  }
  return '(sin contenido)';
}

// ── Clasificador de triage ────────────────────────────────────────────────────

function clasificarCorreo(from, subject) {
  const fromLower = from.toLowerCase();
  const subjectLower = subject.toLowerCase();

  // SPAM: newsletters, promociones, notificaciones automaticas
  const spamPatterns = [
    'noreply', 'no-reply', 'newsletter', 'unsubscribe', 'marketing',
    'promotion', 'offer', 'deal', 'sale', 'discount', 'notificacion',
    'notification', 'automated', 'donotreply', 'no_reply'
  ];
  if (spamPatterns.some(p => fromLower.includes(p) || subjectLower.includes(p))) {
    return 'SPAM';
  }

  // URGENTE: palabras clave de urgencia
  const urgentPatterns = [
    'urgente', 'urgent', 'asap', 'inmediato', 'critico', 'critical',
    'fallo', 'error', 'alerta', 'alert', 'problema', 'vence hoy',
    'vencimiento', 'suspension', 'suspended', 'account', 'security'
  ];
  if (urgentPatterns.some(p => subjectLower.includes(p))) {
    return 'URGENTE';
  }

  // SEGUIMIENTO: respuestas, re:, fwd:, seguimiento
  const followPatterns = [
    're:', 'fwd:', 'fw:', 'seguimiento', 'follow up', 'recordatorio',
    'reminder', 'pendiente', 'actualizacion', 'update'
  ];
  if (followPatterns.some(p => subjectLower.includes(p))) {
    return 'SEGUIMIENTO';
  }

  // Por defecto: INFORMATIVO
  return 'INFORMATIVO';
}

// ── Comandos ──────────────────────────────────────────────────────────────────

async function listMessages(n = 10, labelIds = ['INBOX']) {
  const tokens = await getTokens();
  const accessToken = await getAccessToken(tokens);

  const params = new URLSearchParams({
    maxResults: String(n),
    labelIds: labelIds.join(',')
  });

  const res = await fetch(`${BASE_URL}/messages?${params}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  const data = await res.json();
  if (data.error) throw new Error(JSON.stringify(data.error));

  if (!data.messages?.length) {
    console.log('\nNo hay correos en el inbox.\n');
    return;
  }

  console.log(`\nInbox — ultimos ${n} correos:\n`);

  for (const msg of data.messages) {
    const detail = await fetch(`${BASE_URL}/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const m = await detail.json();
    const headers = m.payload?.headers || [];
    const from = getHeader(headers, 'From');
    const subject = getHeader(headers, 'Subject') || '(sin asunto)';
    const date = formatDate(m.internalDate);
    const unread = m.labelIds?.includes('UNREAD') ? ' [NO LEIDO]' : '';

    console.log(`  ID: ${msg.id}${unread}`);
    console.log(`  De: ${from}`);
    console.log(`  Asunto: ${subject}`);
    console.log(`  Fecha: ${date}`);
    console.log('  ─────────────────────────────────');
  }
  console.log();
}

async function readMessage(id) {
  const tokens = await getTokens();
  const accessToken = await getAccessToken(tokens);

  const res = await fetch(`${BASE_URL}/messages/${id}?format=full`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  const m = await res.json();
  if (m.error) throw new Error(JSON.stringify(m.error));

  const headers = m.payload?.headers || [];
  const from = getHeader(headers, 'From');
  const to = getHeader(headers, 'To');
  const subject = getHeader(headers, 'Subject') || '(sin asunto)';
  const date = formatDate(m.internalDate);
  const body = extractBody(m.payload);

  console.log('\n' + '═'.repeat(60));
  console.log(`De:     ${from}`);
  console.log(`Para:   ${to}`);
  console.log(`Asunto: ${subject}`);
  console.log(`Fecha:  ${date}`);
  console.log('═'.repeat(60));
  console.log('\n' + body + '\n');
}

async function unreadMessages() {
  const tokens = await getTokens();
  const accessToken = await getAccessToken(tokens);

  const params = new URLSearchParams({
    maxResults: '20',
    labelIds: 'INBOX,UNREAD'
  });

  const res = await fetch(`${BASE_URL}/messages?${params}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  const data = await res.json();
  if (data.error) throw new Error(JSON.stringify(data.error));

  if (!data.messages?.length) {
    console.log('\nNo hay correos sin leer.\n');
    return;
  }

  console.log(`\nCorreos no leidos (${data.messages.length}):\n`);

  for (const msg of data.messages) {
    const detail = await fetch(`${BASE_URL}/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const m = await detail.json();
    const headers = m.payload?.headers || [];
    const from = getHeader(headers, 'From');
    const subject = getHeader(headers, 'Subject') || '(sin asunto)';
    const date = formatDate(m.internalDate);

    console.log(`  ID: ${msg.id}`);
    console.log(`  De: ${from}`);
    console.log(`  Asunto: ${subject}`);
    console.log(`  Fecha: ${date}`);
    console.log('  ─────────────────────────────────');
  }
  console.log();
}

async function triageInbox() {
  const tokens = await getTokens();
  const accessToken = await getAccessToken(tokens);

  const params = new URLSearchParams({
    maxResults: '20',
    labelIds: 'INBOX'
  });

  const res = await fetch(`${BASE_URL}/messages?${params}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  const data = await res.json();
  if (data.error) throw new Error(JSON.stringify(data.error));

  if (!data.messages?.length) {
    console.log('\nInbox vacio.\n');
    return;
  }

  const categorias = { URGENTE: [], SEGUIMIENTO: [], INFORMATIVO: [], SPAM: [] };

  for (const msg of data.messages) {
    const detail = await fetch(`${BASE_URL}/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const m = await detail.json();
    const headers = m.payload?.headers || [];
    const from = getHeader(headers, 'From');
    const subject = getHeader(headers, 'Subject') || '(sin asunto)';
    const date = formatDate(m.internalDate);
    const categoria = clasificarCorreo(from, subject);
    const unread = m.labelIds?.includes('UNREAD') ? ' *' : '';

    categorias[categoria].push({ id: msg.id, from, subject, date, unread });
  }

  console.log('\nTriage de inbox:\n');

  const orden = ['URGENTE', 'SEGUIMIENTO', 'INFORMATIVO', 'SPAM'];
  for (const cat of orden) {
    const items = categorias[cat];
    if (!items.length) continue;
    console.log(`[${cat}] (${items.length})`);
    for (const item of items) {
      console.log(`  ${item.unread ? '• [NO LEIDO]' : '•'} ID: ${item.id}`);
      console.log(`    De: ${item.from}`);
      console.log(`    Asunto: ${item.subject}`);
      console.log(`    Fecha: ${item.date}`);
    }
    console.log();
  }
}

async function sendEmail(to, subject, body) {
  const tokens = await getTokens();
  const accessToken = await getAccessToken(tokens);

  // Construir el mensaje en formato RFC 2822
  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: text/plain; charset=utf-8`,
    ``,
    body
  ].join('\r\n');

  const encoded = encodeBase64Url(message);

  const res = await fetch(`${BASE_URL}/messages/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: encoded })
  });

  const data = await res.json();
  if (data.error) throw new Error(JSON.stringify(data.error));

  console.log(`\nCorreo enviado.`);
  console.log(`  Para: ${to}`);
  console.log(`  Asunto: ${subject}`);
  console.log(`  ID: ${data.id}\n`);
}

// ── CLI ───────────────────────────────────────────────────────────────────────

const [,, cmd, ...args] = process.argv;

try {
  switch (cmd) {
    case 'list':
      await listMessages(parseInt(args[0]) || 10);
      break;

    case 'read': {
      const id = args[0];
      if (!id) {
        console.error('Uso: node gmail.mjs read <id>');
        process.exit(1);
      }
      await readMessage(id);
      break;
    }

    case 'unread':
      await unreadMessages();
      break;

    case 'triage':
      await triageInbox();
      break;

    case 'send': {
      const [to, subject, ...bodyParts] = args;
      const body = bodyParts.join(' ');
      if (!to || !subject || !body) {
        console.error('Uso: node gmail.mjs send <para> <asunto> <cuerpo>');
        process.exit(1);
      }
      await sendEmail(to, subject, body);
      break;
    }

    default:
      console.log('\nUso:');
      console.log('  node gmail.mjs list [N]                         — ultimos N correos (default 10)');
      console.log('  node gmail.mjs read <id>                        — leer correo completo');
      console.log('  node gmail.mjs unread                           — solo no leidos');
      console.log('  node gmail.mjs triage                           — inbox categorizado');
      console.log('  node gmail.mjs send <para> <asunto> <cuerpo>    — enviar correo\n');
  }
} catch (err) {
  console.error('\nError:', err.message, '\n');
  process.exit(1);
}
