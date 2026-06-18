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
        ┌────────────┬───────┼───────┬────────────┐
        │            │       │       │            │
   ┌────▼─────┐ ┌───▼───┐ ┌─▼──┐ ┌──▼───┐ ┌─────▼──────┐
   │Research  │ │Trading│ │Email│ │Social│ │Robin Hood  │
   │OS (repo) │ │MT5    │ │Asst│ │Media │ │Agent       │
   │Dashboard │ │FTMO   │ │    │ │IG/FB │ │Options     │
   │PWA+Skills│ │Bot    │ │    │ │      │ │Scanner     │
   └──────────┘ └───────┘ └────┘ └──────┘ │Schwab API  │
                                           └────────────┘
```

## Tabla de conexiones

| Desde | Hacia | Que comparten | Como |
|-------|-------|--------------|------|
| Research OS | Trading | Watchlist, scorecards | vault/trading/watchlist.md |
| Research OS | Social | Briefs → posts | vault/research/ → vault/social/ |
| Research OS | Robin Hood Agent | Watchlist, metodologia opciones | vault/trading/ + vault/research/ |
| Trading | Research OS | Senales → investigacion | Trigger manual |
| Robin Hood Agent | Trading | Escaner opciones, signals | options_universe_50.json → alertas |
| Robin Hood Agent | Research OS | Datos de opciones por activo | API Schwab → vault/research/ |
| Email | Research OS | Temas mencionados | vault/email/ → skills/research/ |
| Brain | Todos | Identidad, preferencias | brain/sync/shared-context.md |

## Como agregar un proyecto nuevo

1. Crear una entrada en esta tabla
2. Definir que datos comparte y en que direccion
3. Agregar referencia en `brain/sync/shared-context.md`
4. Si el proyecto tiene su propio repo, copiar `shared-context.md`
   como punto de partida para su CLAUDE.md

## Robin Hood Agent — Detalle

**Ubicacion:** Proyecto separado (local: `C:/Users/jlman/Documents/Robin Hood Agent`)

**Estado:** Infraestructura creada, pendiente conexion API Schwab

**Que tiene construido:**
- `options_universe_50.json` — Universo de 50 activos para escaneo diario
  - Indices: SPX, NDX, RUT, VIX, DJX
  - Mega caps: AAPL, MSFT, AMZN, GOOGL, META, NVDA, TSLA, NFLX, AMD, CRM
  - Semiconductores: AVGO, QCOM, MU, INTC, MRVL, AMAT
  - Finanzas: JPM, GS, BAC, MS, V, MA
  - Energia: XOM, CVX, SLB, OXY
  - Healthcare: UNH, JNJ, PFE, ABBV, LLY, MRK
  - ETFs: SPY, QQQ, IWM, TLT, GLD, XLF, XLE, XLK, ARKK
  - Volatilidad: UVXY, SVXY
- `options_strategy_memory.json` — Memoria de estrategias y resultados
- `options_risk_policy.json` — Politica de riesgo (max 5% por trade, max 15% diario)
- 111 tests pasando (infraestructura de testing completa)

**Metodologia:** Ver [[OPTIONS-Trading-Methodology-2026-06-18]]
- Framework: Regimen → Expected Move → IV/RV → Skew → Catalyst → Liquidez → Estructura → Riesgo
- Score 0-10 para cada oportunidad
- Cuenta base: $10,000

**Conexion Schwab/thinkorswim (pendiente):**
1. Cuenta Schwab con thinkorswim habilitado
2. Schwab Developer Portal → crear app → obtener API key + secret
3. OAuth2 flow para autenticacion
4. Modo paper trading primero (sin riesgo)
5. Endpoint principal: GET /marketdata/v1/chains (cadenas de opciones)

**Flujo futuro:**
```
Robin Hood Agent → escanea 50 activos diarios via API Schwab
    → filtra oportunidades con score 6+
    → genera alertas → vault/trading/alertas.md
    → Research OS puede profundizar en cualquier alerta
```

## Proyectos futuros (planeados)

| Proyecto | Proposito | Dependencias |
|----------|-----------|-------------|
| MT5/FTMO Bot | Backtests automaticos, senales | Trading skill |
| Voz local | STT + TTS para el sistema | Brain (todos los skills) |
| Dashboard v2 | PWA dinamica con datos del vault | Research OS + Brain |
