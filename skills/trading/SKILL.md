---
skill: trading
version: 1.0
domain: trading y gestion de portafolio
---

# Skill: Trading

## Que hago

Gestiono la watchlist de acciones, configuro alertas de precio, evaluo resultados de backtests, y mantengo el seguimiento de posiciones y senales de trading para MT5/FTMO.

## Cuando activarme

- "watchlist" / "muestrame mi watchlist"
- "agrega [TICKER] a la watchlist"
- "quita [TICKER] de la watchlist"
- "alerta en [TICKER] a [PRECIO]"
- "backtest de [estrategia]"
- "como van mis posiciones"
- "senales de hoy"

## Archivos de referencia

- `skills/trading/watchlist-template.md` — Estructura de watchlist
- `skills/trading/alert-rules-template.md` — Formato de alertas
- `skills/trading/backtest-template.md` — Evaluacion de backtests
- `skills/trading/lessons.md` — Lecciones aprendidas

## Output esperado

- Actualizaciones en `brain/knowledge/trading/watchlist.md`
- Alertas en `brain/knowledge/trading/alertas.md`
- Backtests en `brain/knowledge/trading/backtests/[ESTRATEGIA]-[FECHA].md`

## Proceso

### Para watchlist:
1. Leer `brain/knowledge/trading/watchlist.md`
2. Aplicar la operacion (agregar/quitar/actualizar)
3. Si es una accion nueva, buscar si hay research en `brain/knowledge/research/`
4. Actualizar la fecha de ultima modificacion
5. Mostrar watchlist actualizada

### Para alertas:
1. Leer `brain/knowledge/trading/alertas.md`
2. Agregar/modificar/eliminar alerta
3. Confirmar la configuracion

### Para backtests:
1. Recibir datos o descripcion de la estrategia
2. Evaluar usando el template de backtest
3. Guardar en `brain/knowledge/trading/backtests/`

## Conexiones con otros skills

- **Research:** Cuando se agrega una accion, ofrecer hacer research si no existe nota
- **Daily:** La watchlist y alertas aparecen en el brief diario
