#!/usr/bin/env node
/**
 * scaffold.mjs — Generador de skills para Axon.
 *
 * Uso:
 *   node skills/skill-creator/scaffold.mjs <nombre> "<dominio>" "<trigger1,trigger2,trigger3>"
 *
 * Ejemplo:
 *   node skills/skill-creator/scaffold.mjs fitness-coach "rutinas de gimnasio" "arma mi rutina,que entreno hoy,registra mi entrenamiento"
 *
 * Que hace:
 *   - Valida el nombre y que el skill no exista ya.
 *   - Clona skills/_TEMPLATE/SKILL.md y sustituye los placeholders.
 *   - Crea skills/<nombre>/lessons.md con frontmatter inicial.
 *   - Crea brain/knowledge/<nombre>/.gitkeep.
 *   - Imprime los siguientes pasos manuales.
 *
 * Sin dependencias externas: solo node built-ins (fs, path, url).
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// --- Rutas base -----------------------------------------------------------
// El script vive en skills/skill-creator/ → la raiz del repo esta dos niveles arriba.
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");
const TEMPLATE_PATH = join(ROOT, "skills", "_TEMPLATE", "SKILL.md");

// --- Utilidades de salida -------------------------------------------------
const error = (msg) => {
  console.error(`\n❌ Error: ${msg}\n`);
  process.exit(1);
};
const ok = (msg) => console.log(`✅ ${msg}`);
const info = (msg) => console.log(`   ${msg}`);

// --- Validacion de argumentos --------------------------------------------
const [, , nombreRaw, dominioRaw, triggersRaw] = process.argv;

if (!nombreRaw || !dominioRaw || !triggersRaw) {
  error(
    'Faltan argumentos.\n' +
      '   Uso: node skills/skill-creator/scaffold.mjs <nombre> "<dominio>" "<trigger1,trigger2,trigger3>"\n' +
      '   Ej:  node skills/skill-creator/scaffold.mjs fitness-coach "rutinas de gimnasio" "arma mi rutina,que entreno hoy,registra entrenamiento"'
  );
}

const nombre = nombreRaw.trim();
const dominio = dominioRaw.trim();

// El nombre debe ser kebab-case: minusculas, numeros y guiones.
if (!/^[a-z][a-z0-9-]*$/.test(nombre)) {
  error(
    `El nombre "${nombre}" no es valido.\n` +
      "   Debe ser kebab-case: minusculas, numeros y guiones, empezando por letra.\n" +
      "   Ejemplos validos: fitness-coach, travel, tax-helper"
  );
}

// Triggers: separados por coma, al menos uno no vacio.
const triggers = triggersRaw
  .split(",")
  .map((t) => t.trim())
  .filter((t) => t.length > 0);

if (triggers.length === 0) {
  error("No se proporciono ningun trigger valido. Pasa al menos uno, idealmente 3+.");
}
if (triggers.length < 3) {
  info(`⚠️  Aviso: solo ${triggers.length} trigger(s). La spec recomienda 3+. Continuo de todos modos.`);
}

// --- Verificar que el template canonico exista ---------------------------
if (!existsSync(TEMPLATE_PATH)) {
  error(`No encuentro el template canonico en ${TEMPLATE_PATH}`);
}

// --- Verificar que el skill no exista ya ---------------------------------
const skillDir = join(ROOT, "skills", nombre);
if (existsSync(skillDir)) {
  error(`Ya existe un skill en skills/${nombre}/. Elige otro nombre o edita el existente.`);
}

const knowledgeDir = join(ROOT, "brain", "knowledge", nombre);

// --- Helpers de plantilla -------------------------------------------------
// Nombre legible: "fitness-coach" -> "Fitness Coach"
const titulo = nombre
  .split("-")
  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
  .join(" ");

// Array de triggers en formato YAML inline: ["a", "b", "c"]
const triggersYaml = "[" + triggers.map((t) => JSON.stringify(t)).join(", ") + "]";

// Lista markdown de triggers para la seccion "Cuando activarme".
const triggersMd = triggers.map((t) => `- "${t}"`).join("\n");

const outputPath = `brain/knowledge/${nombre}/`;

// --- Construir SKILL.md desde el template canonico -----------------------
let skillMd = readFileSync(TEMPLATE_PATH, "utf8");

// Sustituir el bloque de frontmatter por completo (robusto frente a cambios de orden).
const frontmatter = `---
skill: ${nombre}
version: 1.0
domain: ${dominio}
triggers: ${triggersYaml}
output: ${outputPath}
status: activo
---`;

skillMd = skillMd.replace(/^---[\s\S]*?---/, frontmatter);

// Titulo legible.
skillMd = skillMd.replace("# Skill: Nombre Legible", `# Skill: ${titulo}`);

// Seccion "Cuando activarme": reemplazar los 3 placeholders de trigger por los reales.
skillMd = skillMd.replace(
  /- "trigger natural 1"\n- "trigger natural 2"\n- "trigger natural 3"/,
  triggersMd
);

// Reemplazar el placeholder de carpeta de output en el cuerpo.
skillMd = skillMd.replace(/brain\/knowledge\/\[carpeta\]\//g, outputPath);

// Reemplazar referencias a [nombre] en las rutas de archivos de referencia y lessons.
skillMd = skillMd.replace(/skills\/\[nombre\]\//g, `skills/${nombre}/`);

// --- Construir lessons.md -------------------------------------------------
const fecha = new Date().toISOString().slice(0, 10);
const lessonsMd = `---
title: "${titulo} — Lecciones aprendidas"
updated: ${fecha}
skill: ${nombre}
tags: [lessons, ${nombre}]
---

# Lecciones aprendidas — ${titulo}

Maximo 10 entradas. Las mas antiguas se resumen o archivan.

## Entradas

(Sin entradas todavia.)
`;

// --- Escribir todo a disco -----------------------------------------------
try {
  mkdirSync(skillDir, { recursive: true });
  writeFileSync(join(skillDir, "SKILL.md"), skillMd, "utf8");
  writeFileSync(join(skillDir, "lessons.md"), lessonsMd, "utf8");

  mkdirSync(knowledgeDir, { recursive: true });
  writeFileSync(join(knowledgeDir, ".gitkeep"), "", "utf8");
} catch (err) {
  error(`Fallo al escribir archivos: ${err.message}`);
}

// --- Reporte y siguientes pasos ------------------------------------------
console.log("");
ok(`Skill "${nombre}" creado.`);
info(`skills/${nombre}/SKILL.md`);
info(`skills/${nombre}/lessons.md`);
info(`brain/knowledge/${nombre}/.gitkeep`);
console.log("");
console.log("📋 Siguientes pasos (manuales):");
console.log(`   1. Edita skills/${nombre}/SKILL.md y completa las secciones`);
console.log(`      "Que hago", "Output esperado", "Proceso", "Conexiones" y "Reglas".`);
console.log(`   2. Si el skill produce un formato repetible, crea`);
console.log(`      skills/${nombre}/[formato]-template.md.`);
console.log(`   3. Registra el skill en la tabla de skills de CLAUDE.md.`);
console.log(`   4. Anade brain/knowledge/${nombre}/ a brain/knowledge/_index.md.`);
console.log(`   5. Valida contra skills/skill-creator/skill-spec.md (checklist).`);
console.log("");
console.log(`💡 Primer uso sugerido: di uno de tus triggers, p.ej. "${triggers[0]}".`);
console.log("");
