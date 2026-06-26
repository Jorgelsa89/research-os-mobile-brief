#!/usr/bin/env node
/**
 * Axon — Google Calendar OAuth Setup
 * Corre UNA SOLA VEZ en tu PC para obtener el refresh token.
 *
 * Uso: node brain/sync/connectors/google-calendar/auth.mjs
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');
const CREDS_PATH = path.join(ROOT, 'brain', 'sync', 'connectors', 'google-calendar', 'client_secret.json');

if (!fs.existsSync(CREDS_PATH)) {
  console.error('\n❌ No encontre client_secret.json');
  console.error('   Ponlo en:');
  console.error(`   ${CREDS_PATH}\n`);
  process.exit(1);
}

const creds = JSON.parse(fs.readFileSync(CREDS_PATH, 'utf8'));
const { client_id, client_secret } = creds.installed || creds.web;
const REDIRECT = 'http://localhost:3000/oauth2callback';

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
].join(' ');

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${encodeURIComponent(client_id)}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT)}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent(SCOPES)}` +
  `&access_type=offline` +
  `&prompt=consent`;

console.log('\n Axon — Conectar Google Calendar\n');
console.log('Abriendo tu browser...\n');

// Abrir browser automaticamente segun el sistema operativo
try {
  if (process.platform === 'win32') {
    execSync(`start "" "${authUrl}"`);
  } else if (process.platform === 'darwin') {
    execSync(`open "${authUrl}"`);
  } else {
    execSync(`xdg-open "${authUrl}"`);
  }
} catch {
  console.log('No pude abrir el browser automaticamente.');
  console.log('Abre este URL manualmente:\n');
  console.log('  ' + authUrl + '\n');
}

console.log('-> Autoriza con tu cuenta de Google en el browser');
console.log('-> Vuelve aqui cuando termines (el servidor captura todo automaticamente)\n');

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:3000');
  const code = url.searchParams.get('code');

  if (!code) {
    res.writeHead(400);
    res.end('Error: no se recibio codigo');
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h2 style="font-family:sans-serif;color:green;padding:40px">Autorizado. Cierra esta ventana y vuelve a la terminal.</h2>');
  server.close();

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id,
      client_secret,
      redirect_uri: REDIRECT,
      grant_type: 'authorization_code'
    })
  });

  const tokens = await tokenRes.json();

  if (!tokens.refresh_token) {
    console.error('\n Error: no se recibio refresh_token.');
    console.error('Asegurate de que la pantalla de consentimiento OAuth este configurada correctamente.\n');
    process.exit(1);
  }

  const tokenData = {
    client_id,
    client_secret,
    refresh_token: tokens.refresh_token,
    token_type: 'Bearer',
    scope: SCOPES,
    saved_at: new Date().toISOString()
  };

  const tempPath = path.join(ROOT, 'brain', 'sync', 'connectors', 'google-calendar', '.tokens_temp.json');
  fs.writeFileSync(tempPath, JSON.stringify(tokenData, null, 2));

  console.log('\n Tokens recibidos y guardados temporalmente.\n');
  console.log('Ahora corre estos 2 comandos:\n');
  console.log('  1) node brain/security/crypto.mjs write google-calendar');
  console.log('     (cuando pida datos, pega el contenido de .tokens_temp.json)\n');
  console.log('  2) del brain\\sync\\connectors\\google-calendar\\.tokens_temp.json\n');
  console.log('Listo. Axon ya puede manejar tu Google Calendar.\n');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('\n El puerto 3000 esta ocupado. Cierra la app que lo usa e intenta de nuevo.\n');
  } else {
    console.error('\n Error del servidor:', err.message);
  }
  process.exit(1);
});

server.listen(3000, () => {
  console.log('Esperando autorizacion en localhost:3000...\n');
});
