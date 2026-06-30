#!/usr/bin/env node
/**
 * Axon — Empaquetador de usuarios
 *
 * Ensambla el paquete completo y listo-para-arrancar de un usuario nuevo,
 * combinando:
 *   - el RUNTIME del producto (launcher, server, monetize, conectores, crypto)
 *   - el BRAIN del usuario (su CLAUDE.md, memoria, conocimiento, skills activos)
 *
 * Asi no duplicamos el codigo del producto en git: el paquete se genera
 * on-demand. Escala a 1,000 usuarios sin 1,000 copias del runtime versionadas.
 *
 * Uso:
 *   node scripts/package-user.mjs <template-dir> <output-dir>
 *
 * Ejemplo:
 *   node scripts/package-user.mjs paola-template /tmp/paola-axon
 */

import { existsSync, mkdirSync, cpSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Archivos/carpetas del RUNTIME del producto (compartidos por todos los usuarios)
const RUNTIME = [
  'axon.mjs',
  'serve.mjs',
  'dashboard.html',
  'admin.html',
  'pricing.html',
  'index.html',
  'jarvis.html',
  'brain.html',
  'axon.html',
  'Axon.bat',
  'Axon.command',
  'BRAIN-PROTOCOL.md',
  'ONBOARDING.md',
  'monetize/license.mjs',
  'monetize/tiers.mjs',
  'monetize/keys/public.pem',     // valida licencias; la private NUNCA se incluye
  'brain/security/crypto.mjs',
  'brain/brief.mjs',
  'brain/sync/connectors',         // conectores Calendar + Gmail (sin tokens)
];

function copy(src, dest) {
  if (!existsSync(src)) return false;
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest, { recursive: true });
  return true;
}

function main() {
  const [, , templateArg, outArg] = process.argv;
  if (!templateArg || !outArg) {
    console.error('Uso: node scripts/package-user.mjs <template-dir> <output-dir>');
    process.exit(1);
  }
  const template = resolve(ROOT, templateArg);
  const out = resolve(outArg);

  if (!existsSync(template)) {
    console.error(`No existe el template: ${template}`);
    process.exit(1);
  }
  if (!existsSync(join(template, 'CLAUDE.md'))) {
    console.error(`El template no tiene CLAUDE.md: ${template}`);
    process.exit(1);
  }

  console.log(`\nEmpaquetando usuario:`);
  console.log(`  Template (brain): ${basename(template)}`);
  console.log(`  Destino:          ${out}\n`);

  mkdirSync(out, { recursive: true });

  // 1. Runtime del producto
  let runtimeOk = 0;
  for (const item of RUNTIME) {
    if (copy(join(ROOT, item), join(out, item))) runtimeOk++;
    else console.warn(`  ! runtime ausente (omitido): ${item}`);
  }
  console.log(`  Runtime copiado: ${runtimeOk}/${RUNTIME.length} items`);

  // 2. Brain del usuario (sobrescribe lo que aplique)
  const brainItems = readdirSync(template).filter(f => f !== '.git');
  for (const item of brainItems) {
    copy(join(template, item), join(out, item));
  }
  console.log(`  Brain del usuario aplicado: ${brainItems.length} items`);

  // 3. Verificacion minima
  const mustExist = ['axon.mjs', 'CLAUDE.md', 'monetize/keys/public.pem'];
  const missing = mustExist.filter(f => !existsSync(join(out, f)));
  if (missing.length) {
    console.error(`\n  FALLO: faltan archivos criticos: ${missing.join(', ')}`);
    process.exit(1);
  }

  console.log(`\n  Paquete listo en: ${out}`);
  console.log(`  Probar:  cd ${out} && node axon.mjs --status --no-pull`);
  console.log(`  Enviar:  comprime la carpeta y mandala al usuario.`);
  console.log(`  Licencia: node monetize/license.mjs issue <su-email> pro 1\n`);
}

main();
