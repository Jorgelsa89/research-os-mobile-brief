#!/usr/bin/env node
/**
 * Axon — Google Calendar OAuth Setup
 * Corre UNA SOLA VEZ en tu PC para obtener el refresh token.
 * El token se guarda encriptado en brain/identity/credentials.json.enc
 *
 * Uso: node brain/sync/connectors/google-calendar/auth.mjs
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');
const CREDS_PATH = path.join(ROOT, 'brain', 'sync', 'connectors', 'google-calendar', 'client_secret.json');

// Verificar que existe el client_secret.json
if (!fs.existsSync(CREDS_PATH)) {
  console.error('\n❌ No encontré client_secret.json');
  console.error('   Descárgalo de Google Cloud Console y ponlo en:');
  console.error(`   ${CREDS_PATH}\n`);
  process.exit(1);
}

const creds = JSON.parse(fs.readFileSync(CREDS_PATH, 'utf8'));
const { client_id, client_secret, redirect_uris } = creds.installed || creds.web;
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

console.log('\n🔑 Axon — Conectar Google Calendar\n');
console.log('Paso 1: Abre este URL en tu browser:\n');
console.log('  ' + authUrl + '\n');
console.log('Paso 2: Autoriza el acceso a Google Calendar');
console.log('Paso 3: Espera... (el servidor capturará el código automáticamente)\n');

// Servidor local para capturar el callback OAuth
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:3000');
  const code = url.searchParams.get('code');

  if (!code) {
    res.end('Error: no se recibió código de autorización');
    return;
  }

  res.end('<h1>✅ Autorizado! Cierra esta ventana y vuelve a la terminal.</h1>');
  server.close();

  // Intercambiar code por tokens
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
    console.error('\n❌ No se recibió refresh_token. Intenta de nuevo.');
    process.exit(1);
  }

  // Guardar tokens en archivo temporal para que crypto.mjs los encripte
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

  console.log('\n✅ Tokens recibidos!\n');
  console.log('Paso 4: Encripta el token con tu contraseña maestra:\n');
  console.log('  node brain/security/crypto.mjs write google-calendar\n');
  console.log('  (Pega el contenido de brain/sync/connectors/google-calendar/.tokens_temp.json)\n');
  console.log('Paso 5: Borra el archivo temporal:\n');
  console.log('  rm brain/sync/connectors/google-calendar/.tokens_temp.json\n');
  console.log('Listo. Desde ahora puedes decirle a Axon "agrega al calendario" y lo hace.\n');
});

server.listen(3000, () => {
  console.log('Servidor OAuth escuchando en localhost:3000...\n');
});
