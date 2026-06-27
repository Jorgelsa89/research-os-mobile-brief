---
title: "Especificacion de Skills de Axon"
version: 1.0
skill: skill-creator
tags: [spec, meta, skills]
status: activo
---

# Spec: Que hace valido a un skill en Axon

Documento de referencia normativo. Un skill solo se considera "completo" si cumple TODO
lo de abajo. El meta-skill `skill-creator` y el script `scaffold.mjs` se rigen por esta spec.

## 1. Estructura de carpeta obligatoria

```
skills/[nombre]/
  SKILL.md          ← OBLIGATORIO. Contrato del skill.
  lessons.md        ← OBLIGATORIO. Memoria de lecciones (max 10 entradas).
  [formato]-template.md  ← OPCIONAL. Uno o varios, si el skill produce formato repetible.
brain/knowledge/[nombre]/
  .gitkeep          ← OBLIGATORIO. Destino de los outputs del skill.
```

- `[nombre]` en **kebab-case**: minusculas, palabras separadas por guion (`fitness-coach`).
- Sin espacios, sin mayusculas, sin acentos, sin caracteres especiales.
- El nombre de la carpeta = el campo `skill:` del frontmatter = el segmento de `output:`.

## 2. Frontmatter de SKILL.md

Bloque YAML al inicio del archivo, entre `---`.

### Campos obligatorios

| Campo | Tipo | Descripcion | Ejemplo |
|-------|------|-------------|---------|
| `skill` | string | Nombre kebab-case. Igual al nombre de la carpeta. | `fitness-coach` |
| `version` | number/string | Version semantica del skill. Empieza en `1.0`. | `1.0` |
| `domain` | string | Una linea: que area cubre. | `entrenamiento y rutinas de gimnasio` |
| `triggers` | array | 3+ frases naturales que activan el skill. | `["arma mi rutina", "que entreno hoy"]` |
| `output` | string | Ruta destino de los outputs. | `brain/knowledge/fitness-coach/` |
| `status` | enum | Estado del skill. | `activo` |

`status` admite: `activo`, `archivado`, `borrador`.

### Campos opcionales

| Campo | Tipo | Cuando usarlo |
|-------|------|---------------|
| `author` | string | Si interesa atribuir quien lo creo. |
| `depends_on` | array | Si el skill requiere otros skills para funcionar. |
| `subdomains` | array | Si el skill tiene varios modos (ver `finance`). |

## 3. Convencion de naming de outputs

Los archivos que el skill guarda en `brain/knowledge/[nombre]/` siguen un patron explicito
documentado en la seccion "Output esperado" del SKILL.md. Patrones canonicos del sistema:

| Tipo de skill | Patron de naming |
|---------------|------------------|
| Research / por entidad | `[ENTIDAD]-[Tema]-[YYYY-MM-DD].md` |
| Diario / por fecha | `[YYYY-MM-DD].md` |
| Social / contenido | `[YYYY-MM-DD]-[Tema]-[Formato].md` |
| Recurso vivo (se actualiza) | `[nombre-fijo].md` (p.ej. `watchlist.md`) |

Reglas:
- Fechas siempre en `YYYY-MM-DD`.
- Tickers/entidades en MAYUSCULAS.
- Todo output lleva frontmatter YAML valido (`title`, `date`, `skill`, `tags`, `status`).

## 4. Como se conecta con otros skills

- Cada SKILL.md tiene una seccion **"Conexiones con otros skills"** que nombra los skills
  con los que coopera y como (handoffs, datos compartidos).
- Las notas se enlazan con `[[wikilinks]]` para construir el grafo de conocimiento.
- Si un skill depende de otro para operar, se declara en `depends_on` del frontmatter.
- Handoffs proactivos: al terminar, un skill puede ofrecer ejecutar otro
  (research → social, research → trading).

## 5. Reglas de privacidad

- Ningun skill guarda credenciales, numeros de cuenta, ni datos personales sensibles en
  `brain/knowledge/`.
- Datos sensibles van SOLO a `brain/identity/` (encriptado AES-256-GCM) via
  `brain/security/crypto.mjs`.
- Montos financieros sensibles se guardan en rangos o porcentajes, nunca exactos en claro.
- No inventar datos: lo no verificado se marca como "pendiente de verificar".

## 6. Checklist de validacion

Un skill esta "completo" cuando marca TODAS estas casillas:

- [ ] Existe `skills/[nombre]/SKILL.md`.
- [ ] El nombre es kebab-case y unico (no choca con otro skill).
- [ ] Frontmatter tiene los 6 campos obligatorios (`skill`, `version`, `domain`, `triggers`, `output`, `status`).
- [ ] `skill:` == nombre de la carpeta == segmento de `output:`.
- [ ] `triggers:` tiene 3+ frases y coinciden con la seccion "Cuando activarme".
- [ ] SKILL.md tiene las secciones: Que hago, Cuando activarme, Archivos de referencia, Output esperado, Proceso, Conexiones, Reglas.
- [ ] Existe `skills/[nombre]/lessons.md` con frontmatter inicial.
- [ ] Existe `brain/knowledge/[nombre]/` (con `.gitkeep` si esta vacia).
- [ ] El output tiene un patron de naming documentado.
- [ ] El skill esta registrado en la tabla de skills de `CLAUDE.md`.
- [ ] La carpeta esta listada en `brain/knowledge/_index.md`.
- [ ] No viola ninguna regla de privacidad.
