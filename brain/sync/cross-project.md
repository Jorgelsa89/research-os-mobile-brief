---
title: "Conexiones entre proyectos"
updated: 2026-06-18
tags: [brain, sync, projects]
---

# Conexiones entre proyectos

Mapa de como se conectan los diferentes proyectos y sistemas de Jorge.
Cuando un proyecto necesita datos de otro, este archivo dice donde encontrarlos.

## Mapa de proyectos

```
                    ┌─────────────────┐
                    │   BRAIN (este)  │
                    │  Memoria central│
                    │  Encriptacion   │
                    │  Aprendizaje    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼──────┐ ┌────▼────┐ ┌───────▼───────┐
     │  Research OS   │ │ Trading │ │    Email       │
     │  (este repo)   │ │  MT5    │ │  Assistant     │
     │  Dashboard PWA │ │  FTMO   │ │               │
     │  Skills        │ │  Bot    │ │               │
     └────────────────┘ └─────────┘ └───────────────┘
```

## Tabla de conexiones

| Desde | Hacia | Que comparten | Como |
|-------|-------|--------------|------|
| Research OS | Trading | Watchlist, scorecards | vault/trading/watchlist.md |
| Research OS | Social | Briefs → posts | vault/research/ → vault/social/ |
| Trading | Research OS | Senales → investigacion | Trigger manual |
| Email | Research OS | Temas mencionados | vault/email/ → skills/research/ |
| Brain | Todos | Identidad, preferencias | brain/sync/shared-context.md |

## Como agregar un proyecto nuevo

1. Crear una entrada en esta tabla
2. Definir que datos comparte y en que direccion
3. Agregar referencia en `brain/sync/shared-context.md`
4. Si el proyecto tiene su propio repo, copiar `shared-context.md`
   como punto de partida para su CLAUDE.md

## Proyectos futuros (planeados)

| Proyecto | Proposito | Dependencias |
|----------|-----------|-------------|
| Robinhood Agent | Portfolio snapshot read-only | Research OS (watchlist) |
| MT5/FTMO Bot | Backtests automaticos, senales | Trading skill |
| Voz local | STT + TTS para el sistema | Brain (todos los skills) |
| Dashboard v2 | PWA dinamica con datos del vault | Research OS + Brain |
