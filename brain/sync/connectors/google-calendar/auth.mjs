#!/usr/bin/env node
/**
 * Axon — Google Calendar OAuth Setup
 * Corre UNA SOLA VEZ en tu PC.
 *
 * Uso: node brain/sync/connectors/google-calendar/auth.mjs
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import readline from 'readline';
import { execSync } from 'child_process';
import { createCipheriv, randomBytes, pbkdf2Sync } from 'node:crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');
const CREDS_PATH = path.join(__dirname, 'client_secret.json');
const TOKEN_PATH = path.join(__dirname, 'tokens.enc');

if (!fs.existsSync(CREDS_PATH)) {
  console.error('\n No encontre client_secret.json');
  console.error('  Ponlo en:');
  console.error(`  ${CREDS_PATH}\n`);
  process.exit(1);
}

function encryptTokens(data, password) {
  const salt = randomBytes(32);
  const iv = randomBytes(16);
  const key = pbkdf2Sync(password, salt, 100_000, 32, 'sha512');
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(data), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([salt, iv, tag, encrypted]);
}

function askPassword() {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
    rl.question('\nContrasena maestra para encriptar los tokens: ', answer => {
      rl.close();
      resolve(answer);
    });
  });
}

const creds = JSON.parse(fs.readFileSync(CREDS_PATH, 'utf8'));
const { client_id, client_secret } = creds.installed || creds.web;
const REDIRECT = 'http://localhost:3000/oauth2callback';
const SCOPES = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events';

const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' +
  `client_id=${encodeURIComponent(client_id)}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT)}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent(SCOPES)}` +
  `&access_type=offline` +
  `&prompt=consent`;

console.log('\n Axon — Conectar Google Calendar\n');
console.log('Abriendo tu browser...\n');

try {
  if (process.platform === 'win32') execSync(`start "" "${authUrl}"`);
  else if (process.platform === 'darwin') execSync(`open "${authUrl}"`);
  else execSync(`xdg-open "${authUrl}"`);
} catch {
  console.log('Abre este URL en tu browser:\n');
  console.log('  ' + authUrl + '\n');
}

console.log('Autoriza con tu cuenta de Google y vuelve aqui...\n');

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:3000');
  const code = url.searchParams.get('code');

  if (!code) {
    res.writeHead(400);
    res.end('Error: no se recibio codigo');
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h2 style="font-family:sans-serif;color:green;padding:40px"> Autorizado. Cierra esta ventana y vuelve a la terminal.</h2>');
  server.close();

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id, client_secret, redirect_uri: REDIRECT, grant_type: 'authorization_code' })
  });

  const tokens = await tokenRes.json();

  if (!tokens.refresh_token) {
    console.error('\n Error: no se recibio refresh_token. Intenta de nuevo.\n');
    process.exit(1);
  }

  const tokenData = { client_id, client_secret, refresh_token: tokens.refresh_token, scope: SCOPES };

  const password = await askPassword();
  if (!password) {
    console.error('Contrasena requerida.');
    process.exit(1);
  }

  const encrypted = encryptTokens(tokenData, password);
  fs.writeFileSync(TOKEN_PATH, encrypted);

  console.log('\n Tokens encriptados y guardados en:');
  console.log(`   ${TOKEN_PATH}\n`);
  console.log(' Google Calendar conectado. Ya puedes decirle a Axon:');
  console.log('   "Que tengo hoy en el calendario?"');
  console.log('   "Agrega reunion el viernes a las 3pm"\n');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('\n Puerto 3000 ocupado. Cierra la app que lo usa e intenta de nuevo.\n');
  } else {
    console.error('\n Error:', err.message);
  }
  process.exit(1);
});

server.listen(3000, () => {
  console.log('Esperando autorizacion...\n');
});
