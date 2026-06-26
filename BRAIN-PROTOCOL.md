# BRAIN PROTOCOL — Especificacion Abierta v1.0

**Axon Personal AI OS · Open Standard**

Este documento define el protocolo abierto para brains de Axon. Cualquier herramienta, IA, o developer puede implementar o extender este protocolo. El brain es tuyo — en formato que cualquiera puede leer.

---

## Principios

1. **Markdown-first.** Todos los archivos son `.md` legibles por humanos sin herramientas especiales.
2. **Local-first.** El brain vive en tu dispositivo. Ninguna herramienta compatible deberia requerir un servidor para funcionar.
3. **AI-agnostic.** El protocolo funciona con Claude, GPT, Gemini, modelos locales via Ollama, o cualquier IA futura.
4. **Open.** Este spec es publico. Puedes construir herramientas compatibles sin permiso.

---

## Estructura de Directorios

```
brain/                        ← Raiz del cerebro digital
  identity/                   ← Nucleo de identidad (privado, encriptado)
    profile.json.enc           ← Perfil personal cifrado AES-256-GCM
    credentials.json.enc       ← Credenciales cifradas
    financial.json.enc         ← Datos financieros cifrados
    contacts.json.enc          ← Contactos privados cifrados
  memory/                     ← Memoria persistente entre sesiones
    short-term/
      current-session.md       ← Contexto de la sesion activa
    patterns/
      workflow.md              ← Como trabaja el usuario
      decisions.md             ← Patrones de decision detectados
      communication.md         ← Estilo de comunicacion
    preferences.md             ← Preferencias aprendidas
    priorities.md              ← Que le importa mas al usuario
    growth-log.md              ← Evolucion y aprendizajes del sistema
  knowledge/                  ← Memoria de largo plazo (todo el conocimiento)
    research/                  ← Investigaciones financieras y de mercado
    trading/                   ← Watchlist, alertas, backtests
    daily/                     ← Notas diarias y briefs matutinos
    email/                     ← (gitignored por privacidad)
    social/                    ← Posts y borradores de contenido
    finance/                   ← CFO personal, patrimonio, cashflow
    health/                    ← Sintomas, medicamentos, fitness
    relationships/             ← CRM personal, familia, red
    learning/                  ← Mapas de conocimiento, insights
    legal/                     ← Contratos, obligaciones, IP
    creative/                  ← Proyectos de escritura y contenido
    business/                  ← Clientes, proyectos, pipeline
    _index.md                  ← Mapa de todo el knowledge (MOC)
  security/                   ← Herramientas de encriptacion
    crypto.mjs                 ← CLI de encriptacion AES-256-GCM
  sync/                       ← Comunicacion entre proyectos e IAs
    shared-context.md          ← Tarjeta de identidad del usuario (no sensible)
    session-log.md             ← Log de sesiones pasadas
    cross-project.md           ← Mapa de proyectos conectados
    ai-comms/                  ← Canal de comunicacion multi-IA
      bitacora.md              ← Log compartido append-only
      claude-inbox.md          ← Mensajes para Claude
      codex-inbox.md           ← Mensajes para Codex

skills/                       ← Capacidades del sistema (fuera del nucleo)
  [nombre-del-skill]/
    SKILL.md                   ← Definicion del skill (spec abajo)
    [templates]/               ← Templates especificos del skill
    lessons.md                 ← Aprendizajes acumulados

CLAUDE.md                     ← Instrucciones centrales para la IA
```

---

## Spec: Nota de Knowledge

Toda nota en `brain/knowledge/` debe tener frontmatter YAML valido:

```yaml
---
title: "Nombre descriptivo de la nota"
date: YYYY-MM-DD
skill: research | trading | email | social | daily | finance | health | relationships | learning | legal | creative | business
tags: [tag1, tag2, tag3]
status: activo | archivado | borrador | publicado
---
```

**Campos obligatorios:** `title`, `date`, `skill`, `status`
**Campos opcionales:** `tags`, `ticker`, `score`, `decision`, `source`

---

## Spec: Naming Conventions

| Tipo de nota | Patron de nombre | Ejemplo |
|--------------|-----------------|---------|
| Research de ticker | `[TICKER]-[Tema]-[YYYY-MM-DD].md` | `NVDA-RTX-Spark-2026-06-08.md` |
| Nota diaria | `[YYYY-MM-DD].md` | `2026-06-25.md` |
| Post social | `[YYYY-MM-DD]-[Tema]-[Formato].md` | `2026-06-25-NVDA-Research-post.md` |
| Contacto | `[nombre-apellido].md` | `john-doe.md` |
| Proyecto | `[empresa-proyecto].md` | `acme-rediseno-web.md` |
| Contrato | `contract-[empresa]-[YYYY-MM-DD].md` | `contract-aws-2026-01-15.md` |

---

## Spec: Wikilinks

Los wikilinks conectan notas entre si. Formato: `[[nombre-del-archivo-sin-extension]]`

```markdown
Basado en la investigacion de [[NVDA-RTX-Spark-2026-06-08]].
Ver watchlist en [[watchlist]].
Relacionado con [[2026-06-25]] (nota diaria de hoy).
```

Las herramientas compatibles con Axon deben resolver wikilinks dentro de `brain/knowledge/`.

---

## Spec: Skill (SKILL.md)

Cada skill define como la IA debe comportarse para un dominio especifico:

```yaml
---
skill: [nombre]
version: [semver]
triggers: ["lista", "de", "frases", "que", "activan", "este", "skill"]
output: brain/knowledge/[directorio]/
---
```

El cuerpo del SKILL.md describe:
1. Que hace el skill
2. Subdominios y sus triggers
3. Proceso paso a paso
4. Templates de output
5. Reglas de privacidad y limitaciones

---

## Spec: Encriptacion (brain/identity/)

Los archivos `.enc` usan AES-256-GCM con PBKDF2 (SHA-512, 100,000 iteraciones).

**Formato de archivo encriptado:**
```json
{
  "algorithm": "aes-256-gcm",
  "kdf": "pbkdf2",
  "kdfParams": {
    "hash": "sha512",
    "iterations": 100000,
    "saltLen": 32
  },
  "iv": "[base64]",
  "salt": "[base64]",
  "tag": "[base64]",
  "ciphertext": "[base64]"
}
```

La implementacion de referencia esta en `brain/security/crypto.mjs`.

**Regla critica:** Los datos descifrados nunca se escriben a disco. Existen solo en memoria durante la sesion.

---

## Spec: shared-context.md

El archivo `brain/sync/shared-context.md` es la tarjeta de identidad del usuario para proyectos externos. **No debe contener datos sensibles.** Solo informacion que el usuario elige compartir:

```markdown
---
owner: [nombre o alias]
timezone: [America/Mexico_City]
languages: [es, en]
last-updated: YYYY-MM-DD
---

# Quien soy
[Descripcion general: profesion, proyectos activos, estilo de trabajo]

# Proyectos activos
[Lista de proyectos y su estado]

# Como prefiero trabajar
[Preferencias de comunicacion y ritmo]

# Skills activos
[Lista de skills del brain]
```

---

## Compatibilidad y Extension

**Herramientas compatibles con Axon Brain Protocol:**
- Deben leer frontmatter YAML segun esta spec
- Deben respetar wikilinks internos
- No deben modificar archivos en `brain/identity/` o `brain/security/`
- No deben subir contenido de `brain/knowledge/email/` (gitignored por privacidad)

**Para publicar una herramienta compatible:**
Abre un issue en el repo principal con el tag `compatible-tool`.

**Para proponer cambios al protocolo:**
Pull request al repo principal con el tag `protocol-change`. Cualquier cambio al spec requiere version bump.

---

## Version History

| Version | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2026-06-25 | Version inicial. Estructura base, naming, frontmatter, encriptacion, wikilinks |
