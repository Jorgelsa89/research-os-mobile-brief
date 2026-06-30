#!/usr/bin/env node
/**
 * Axon — Scaffolder de usuarios beta
 *
 * Crea el template de brain de un usuario nuevo a partir del de Paola,
 * personalizando nombre y skills. Despues, package-user.mjs lo ensambla
 * en un paquete listo para enviar.
 *
 * Uso:
 *   node scripts/new-user.mjs <nombre> "<skill1,skill2,...>"
 *
 * Ejemplo:
 *   node scripts/new-user.mjs carlos "daily,trading,finance,learning"
 *
 * Luego:
 *   node scripts/package-user.mjs carlos-template /tmp/carlos-axon
 *   node monetize/license.mjs issue carlos@email.com pro 1
 */

import { existsSync, mkdirSync, cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = join(ROOT, 'paola-template');

const VALID_SKILLS = ['research','trading','email','social','daily','finance','health','relationships','learning','legal','creative','business'];

function main() {
  const [, , nameArg, skillsArg] = process.argv;
  if (!nameArg) {
    console.error('Uso: node scripts/new-user.mjs <nombre> "<skill1,skill2,...>"');
    console.error(`Skills validos: ${VALID_SKILLS.join(', ')}`);
    process.exit(1);
  }
  const name = nameArg.toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (!name) { console.error('Nombre invalido.'); process.exit(1); }

  const skills = (skillsArg || 'daily,email,learning')
    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  const invalid = skills.filter(s => !VALID_SKILLS.includes(s));
  if (invalid.length) {
    console.error(`Skills invalidos: ${invalid.join(', ')}`);
    console.error(`Validos: ${VALID_SKILLS.join(', ')}`);
    process.exit(1);
  }

  const dest = join(ROOT, `${name}-template`);
  if (existsSync(dest)) { console.error(`Ya existe ${name}-template. Borralo para regenerar.`); process.exit(1); }
  if (!existsSync(BASE)) { console.error('No existe paola-template como base.'); process.exit(1); }

  // 1. Clonar la base (sin los skills, los ponemos selectivos)
  cpSync(BASE, dest, { recursive: true });
  rmSync(join(dest, 'skills'), { recursive: true, force: true });
  mkdirSync(join(dest, 'skills'), { recursive: true });

  // 2. Copiar solo los skills elegidos desde el repo principal
  let copied = 0;
  for (const s of skills) {
    const src = join(ROOT, 'skills', s);
    if (existsSync(src)) { cpSync(src, join(dest, 'skills', s), { recursive: true }); copied++; }
    // carpeta de conocimiento del skill
    mkdirSync(join(dest, 'brain', 'knowledge', s), { recursive: true });
    writeFileSync(join(dest, 'brain', 'knowledge', s, '.gitkeep'), '');
  }

  // 3. Personalizar CLAUDE.md (nombre + lista de skills)
  const Name = name.charAt(0).toUpperCase() + name.slice(1);
  const claudePath = join(dest, 'CLAUDE.md');
  if (existsSync(claudePath)) {
    let md = readFileSync(claudePath, 'utf8');
    md = md.replace(/Paola/g, Name).replace(/paola/g, name);
    writeFileSync(claudePath, md);
  }

  console.log(`\n  Template creado: ${name}-template`);
  console.log(`  Skills (${copied}): ${skills.join(', ')}`);
  console.log(`\n  Siguientes pasos:`);
  console.log(`    1. Revisa/ajusta ${name}-template/CLAUDE.md y shared-context.md`);
  console.log(`    2. node scripts/package-user.mjs ${name}-template /tmp/${name}-axon`);
  console.log(`    3. node monetize/license.mjs issue <su-email> pro 1`);
  console.log(`    4. Comprime /tmp/${name}-axon, envialo + la key. Registralo en BETA.md\n`);
}

main();
