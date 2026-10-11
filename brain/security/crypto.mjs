import { createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32, IV_LENGTH = 16, SALT_LENGTH = 32, TAG_LENGTH = 16;
const PBKDF2_ITERATIONS = 100_000, PBKDF2_DIGEST = 'sha512';

function deriveKey(password, salt) {
  return pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, PBKDF2_DIGEST);
}

function encrypt(plaintext, password) {
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const key = deriveKey(password, salt);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([salt, iv, tag, encrypted]); // salt(32)+iv(16)+tag(16)+ciphertext
}

function decrypt(buf, password) {
  const salt = buf.subarray(0, SALT_LENGTH);
  const iv = buf.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = buf.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const ct = buf.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const key = deriveKey(password, salt);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
}

const IDENTITY_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'identity');
const CATEGORIES = {
  profile:     { file: 'profile.json.enc',     desc: 'Datos personales (nombre, email, direccion)' },
  credentials: { file: 'credentials.json.enc', desc: 'Credenciales y API keys' },
  financial:   { file: 'financial.json.enc',   desc: 'Tarjetas y cuentas bancarias' },
  contacts:    { file: 'contacts.json.enc',    desc: 'Contactos importantes' },
};

function prompt(q) {
  const rl = createInterface({ input: process.stdin, output: process.stderr });
  return new Promise(r => rl.question(q, a => { rl.close(); r(a); }));
}

async function main() {
  const [cmd, category] = process.argv.slice(2);
  if (!cmd) {
    console.log(`Brain Crypto — cifrado para datos personales (AES-256-GCM)

Uso:
  node crypto.mjs write <categoria>    Cifrar datos (pega JSON, Ctrl+D)
  node crypto.mjs read <categoria>     Leer datos descifrados (solo pantalla)
  node crypto.mjs list                 Listar categorias

Categorias: ${Object.keys(CATEGORIES).join(', ')}
Los datos descifrados NUNCA se escriben a disco. La contrasena no se guarda.`);
    return;
  }
  if (cmd === 'list') {
    for (const [n, c] of Object.entries(CATEGORIES)) {
      const exists = existsSync(join(IDENTITY_DIR, c.file)) ? 'cifrado' : 'vacio';
      console.log(`  ${n.padEnd(12)} ${c.desc} [${exists}]`);
    }
    return;
  }
  if (!CATEGORIES[category]) { console.error(`Categoria invalida: ${category}`); process.exit(1); }
  const filePath = join(IDENTITY_DIR, CATEGORIES[category].file);

  // Entrada robusta (funciona interactivo y por pipe):
  // primera linea = contrasena; el resto (solo en 'write') = el JSON.
  let password, jsonPayload = '';
  if (process.stdin.isTTY) {
    password = await prompt('Contrasena maestra: ');
    if (cmd === 'write') {
      console.error('Pega el JSON y presiona Ctrl+D:');
      const chunks = [];
      for await (const c of process.stdin) chunks.push(c);
      jsonPayload = Buffer.concat(chunks).toString('utf8');
    }
  } else {
    const chunks = [];
    for await (const c of process.stdin) chunks.push(c);
    const all = Buffer.concat(chunks).toString('utf8');
    const nl = all.indexOf('\n');
    password = (nl === -1 ? all : all.slice(0, nl)).trim();
    jsonPayload = nl === -1 ? '' : all.slice(nl + 1);
  }
  if (!password) { console.error('Contrasena requerida.'); process.exit(1); }

  if (cmd === 'read') {
    if (!existsSync(filePath)) { console.error(`${category} no existe.`); process.exit(1); }
    try { console.log(decrypt(readFileSync(filePath), password)); }
    catch { console.error('Contrasena incorrecta o archivo corrupto.'); process.exit(1); }
    return;
  }
  if (cmd === 'write') {
    const txt = (jsonPayload || '').trim();
    if (!txt) { console.error('No se recibio JSON. Pega el JSON despues de la contrasena.'); process.exit(1); }
    try {
      JSON.parse(txt); // validar
      if (!existsSync(IDENTITY_DIR)) mkdirSync(IDENTITY_DIR, { recursive: true });
      writeFileSync(filePath, encrypt(txt, password));
      console.log(`${category} cifrado y guardado.`);
    } catch (e) { console.error(`JSON invalido: ${e.message}`); process.exit(1); }
    return;
  }
  console.error(`Comando desconocido: ${cmd}`);
  process.exit(1);
}

main().catch(e => { console.error(e.message); process.exit(1); });
