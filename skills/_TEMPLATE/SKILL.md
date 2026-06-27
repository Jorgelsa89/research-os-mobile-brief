---
skill: nombre-del-skill
version: 1.0
domain: descripcion corta del dominio (una linea)
triggers: ["frase 1", "frase 2", "frase 3"]
output: brain/knowledge/[carpeta]/
status: activo
---

# Skill: Nombre Legible

> Una frase que resume que hace este skill y para quien.

## Que hago

Descripcion clara de la capacidad. Que problema resuelve para Jorge.

## Cuando activarme

- "trigger natural 1"
- "trigger natural 2"
- "trigger natural 3"

(Estos deben coincidir con el array `triggers:` del frontmatter.)

## Archivos de referencia

- `skills/[nombre]/[template].md` — para que sirve
- `skills/[nombre]/lessons.md` — Lecciones aprendidas de ejecuciones previas

## Output esperado

Archivo en `brain/knowledge/[carpeta]/[naming-pattern].md` con:
- Frontmatter YAML completo
- [estructura especifica del skill]

## Proceso

1. Leer `brain/knowledge/[carpeta]/` para contexto existente
2. Verificar si ya existe nota sobre el mismo tema (no duplicar)
3. [pasos especificos]
4. Guardar nota con frontmatter y `[[wikilinks]]`
5. Actualizar `brain/knowledge/_index.md`
6. Registrar leccion en `skills/[nombre]/lessons.md` si aprendi algo nuevo
7. Sugerir siguiente accion logica

## Conexiones con otros skills

- **[Skill]:** como se conecta

## Reglas especificas

- [reglas de privacidad, validacion, o limites del skill]
