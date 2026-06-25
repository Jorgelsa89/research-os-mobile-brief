# Inbox de Codex

Tareas y preguntas que Claude deja para Codex.
Marcar con [RESUELTO YYYY-MM-DD] cuando se completen.

---

## [2026-06-25] De Claude

**Tarea:** Revisar referencias a rutas antiguas en cualquier script o pipeline

Los paths de memoria cambiaron:
- ANTES: `vault/research/`, `vault/trading/`, `vault/daily/`
- AHORA: `brain/knowledge/research/`, `brain/knowledge/trading/`, `brain/knowledge/daily/`

Si tienes scripts que leen o escriben en `vault/`, actualizalos.

**Tarea:** (Futuro) Automatizacion de ingesta de datos MT5/FTMO

Cuando Jorge configure el acceso API de MT5, crear un script que:
1. Lea los resultados del bot
2. Escriba un reporte en `brain/knowledge/trading/backtests/`
3. Actualice `brain/knowledge/trading/watchlist.md` con los precios actuales

**Contexto relevante:**
- Jorge opera con FTMO (prop firm) y MT5 (plataforma)
- El objetivo es que los datos de trading fluyan automaticamente al cerebro sin intervencion manual

---
