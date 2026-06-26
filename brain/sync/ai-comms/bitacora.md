# Bitacora Compartida — Claude & Codex

Canal de comunicacion entre IAs. Append-only. Ver README.md para el protocolo.

---

## 2026-06-25 CLAUDE

**Tarea:** Reorganizacion fisica del sistema Research OS / Jarvis

**Resultado:**
- `vault/` movido a `brain/knowledge/` — toda la memoria de largo plazo ahora vive dentro del cerebro
- `CLAUDE.md` actualizado con nueva arquitectura y referencias a `brain/knowledge/`
- `.gitignore` actualizado (`vault/email/` → `brain/knowledge/email/`)
- Sistema de comunicacion Claude ↔ Codex creado en `brain/sync/ai-comms/`

**Contexto:**
Jorge decidio reorganizar la arquitectura para que refleje un modelo mental de cerebro real:
- `brain/` = todo lo interno (identidad, memoria, conocimiento)
- `skills/` = capacidades externas (corteza)
- `jarvis.html` = interfaz neural entre mundo exterior y cerebro

La estructura fisica ahora coincide con la metafora del cerebro que Jorge visualiza.

**Para CODEX:**
Cuando trabajes en este proyecto, la memoria de largo plazo ya NO esta en `vault/`.
Ahora esta en `brain/knowledge/`. Actualiza cualquier referencia que tengas a rutas antiguas.
Rutas clave:
- Research: `brain/knowledge/research/`
- Trading/Watchlist: `brain/knowledge/trading/watchlist.md`
- Daily notes: `brain/knowledge/daily/`

**Proximo paso sugerido:**
Actualizar `brain.html` (visualizacion) para reflejar nueva jerarquia donde `knowledge/`
aparece como capa interna del cerebro, no como nodo separado al mismo nivel que `brain/`.

---

## 2026-06-25 CLAUDE

**Tarea:** Beta launch — onboarding de Jorge y Paola como primeros 2 usuarios

**Resultado:**
- Brain de Jorge: operativo con 12 skills, perfil completo en shared-context.md
- Template de Paola creado en `paola-template/` con 5 skills iniciales
- `BETA.md`: guia de onboarding para ambos usuarios
- Fase 0 Semana 1 completa: protocolo abierto + installer + landing page

**Para CODEX:**
El beta de 2 usuarios comenzo hoy. Si trabajas en integraciones o scripts,
coordina con jorge usando este canal. Las rutas de memoria son `brain/knowledge/`
(ya no `vault/` — eso fue cambiado esta semana).

**Proximo paso sugerido:**
Paola sigue el setup en `BETA.md`. Jorge usa el brain diariamente esta semana.
Primera iteracion: identificar el skill mas util para cada usuario.

---

## 2026-06-26 CLAUDE

**Tarea:** Google Calendar conectado + simplificacion del flujo de auth

**Resultado:**
- Conector Google Calendar operativo: `brain/sync/connectors/google-calendar/`
- `auth.mjs` reescrito: abre browser automaticamente, encripta tokens inline con AES-256-GCM, sin dependencia de crypto.mjs
- `calendar.mjs` actualizado: lee `tokens.enc` directamente con misma clave derivada (PBKDF2 + SHA-512)
- `.gitignore` actualizado: `tokens.enc` protegido
- Jorge puede decirle a Axon "agrega al calendario" y ejecuta directamente

**Para CODEX:**
El conector de Google Calendar esta activo en `brain/sync/connectors/google-calendar/`. Los tokens estan en `tokens.enc` (gitignored). Para operaciones de calendario usa el CLI del conector, no accedas al archivo directamente.

**Proximo paso sugerido:**
- Conectar Gmail para cerrar el loop de email
- Fase 0 Semana 2: onboarding con 5 beta users adicionales

---
