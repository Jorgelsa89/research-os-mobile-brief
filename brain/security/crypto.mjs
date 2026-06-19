import { createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { createInterface } from 'node:readline';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const TAG_LENGTH = 16;
const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_DIGEST = 'sha512';

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

  // Format: salt(32) + iv(16) + tag(16) + ciphertext
  return Buffer.concat([salt, iv, tag, encrypted]);
}

function decrypt(encryptedBuffer, password) {
  const salt = encryptedBuffer.subarray(0, SALT_LENGTH);
  const iv = encryptedBuffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = encryptedBuffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const ciphertext = encryptedBuffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

  const key = deriveKey(password, salt);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

function encryptFile(inputPath, outputPath, password) {
  const plaintext = readFileSync(inputPath, 'utf8');
  const encrypted = encrypt(plaintext, password);
  writeFileSync(outputPath, encrypted);
  return outputPath;
}

function decryptFile(encryptedPath, password) {
  const data = readFileSync(encryptedPath);
  return decrypt(data, password);
}

function encryptJson(data, password) {
  return encrypt(JSON.stringify(data, null, 2), password);
}

function decryptJson(encryptedBuffer, password) {
  return JSON.parse(decrypt(encryptedBuffer, password));
}

function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stderr });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

const IDENTITY_DIR = join(dirname(new URL(import.meta.url).pathname), '..', 'identity');

const CATEGORIES = {
  profile: {
    file: 'profile.json.enc',
    description: 'Informacion personal (nombre, email, direccion, etc.)',
    template: {
      nombre: '',
      email: '',
      telefono: '',
      direccion: '',
      fecha_nacimiento: '',
      notas: ''
    }
  },
  credentials: {
    file: 'credentials.json.enc',
    description: 'Credenciales y API keys',
    template: {
      servicios: [
        { nombre: '', usuario: '', password: '', url: '', notas: '' }
      ],
      api_keys: [
        { servicio: '', key: '', notas: '' }
      ]
    }
  },
  financial: {
    file: 'financial.json.enc',
    description: 'Tarjetas y cuentas bancarias',
    template: {
      tarjetas: [
        { banco: '', tipo: '', ultimos_4: '', vencimiento: '', notas: '' }
      ],
      cuentas: [
        { banco: '', tipo: '', numero_parcial: '', notas: '' }
      ]
    }
  },
  contacts: {
    file: 'contacts.json.enc',
    description: 'Contactos importantes',
    template: {
      contactos: [
        { nombre: '', relacion: '', telefono: '', email: '', notas: '' }
      ]
    }
  }
};

async function main() {
  const command = process.argv[2];
  const category = process.argv[3];

  if (!command) {
    console.log(`
Brain Crypto — Utilidad de cifrado para datos personales

Uso:
  node crypto.mjs init <categoria>     Crear archivo cifrado con template
  node crypto.mjs read <categoria>     Leer datos descifrados (solo en pantalla)
  node crypto.mjs write <categoria>    Escribir datos nuevos (desde stdin JSON)
  node crypto.mjs add <categoria>      Agregar entrada a una categoria
  node crypto.mjs list                 Listar categorias disponibles
  node crypto.mjs verify               Verificar que la contrasena funciona

Categorias: ${Object.keys(CATEGORIES).join(', ')}

Seguridad:
  - AES-256-GCM con PBKDF2 (100K iteraciones)
  - Cada archivo tiene su propio salt e IV
  - Los datos descifrados NUNCA se escriben a disco
  - La contrasena no se guarda en ningun lado
`);
    return;
  }

  if (command === 'list') {
    console.log('\nCategorias disponibles:\n');
    for (const [name, cat] of Object.entries(CATEGORIES)) {
      const path = join(IDENTITY_DIR, cat.file);
      const exists = existsSync(path) ? 'cifrado' : 'no inicializado';
      console.log(`  ${name.padEnd(15)} ${cat.description} [${exists}]`);
    }
    return;
  }

  if (!category || !CATEGORIES[category]) {
    console.error(`Categoria invalida: ${category}`);
    console.error(`Opciones: ${Object.keys(CATEGORIES).join(', ')}`);
    process.exit(1);
  }

  const cat = CATEGORIES[category];
  const filePath = join(IDENTITY_DIR, cat.file);
  const password = await prompt('Contrasena maestra: ');

  if (!password) {
    console.error('Contrasena requerida.');
    process.exit(1);
  }

  if (command === 'init') {
    if (existsSync(filePath)) {
      console.error(`${category} ya existe. Usa "write" para reemplazar.`);
      process.exit(1);
    }
    const encrypted = encryptJson(cat.template, password);
    writeFileSync(filePath, encrypted);
    console.log(`${category} inicializado con template. Usa "write" para agregar tus datos.`);
    console.log(`Template:\n${JSON.stringify(cat.template, null, 2)}`);
    return;
  }

  if (command === 'read') {
    if (!existsSync(filePath)) {
      console.error(`${category} no existe. Usa "init" primero.`);
      process.exit(1);
    }
    try {
      const data = decryptFile(filePath, password);
      console.log(data);
    } catch {
      console.error('Contrasena incorrecta o archivo corrupto.');
      process.exit(1);
    }
    return;
  }

  if (command === 'write') {
    console.error('Pega el JSON y presiona Ctrl+D cuando termines:');
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    const jsonStr = Buffer.concat(chunks).toString('utf8').trim();
    try {
      const data = JSON.parse(jsonStr);
      const encrypted = encryptJson(data, password);
      writeFileSync(filePath, encrypted);
      console.log(`${category} cifrado y guardado.`);
    } catch (e) {
      console.error(`JSON invalido: ${e.message}`);
      process.exit(1);
    }
    return;
  }

  if (command === 'verify') {
    if (!existsSync(filePath)) {
      console.error(`${category} no existe.`);
      process.exit(1);
    }
    try {
      decryptFile(filePath, password);
      console.log('Contrasena correcta. Archivo accesible.');
    } catch {
      console.error('Contrasena incorrecta.');
      process.exit(1);
    }
    return;
  }

  console.error(`Comando desconocido: ${command}`);
  process.exit(1);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
