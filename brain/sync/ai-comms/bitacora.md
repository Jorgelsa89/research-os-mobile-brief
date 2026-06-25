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
