---
skill: trading
version: 1.0
domain: trading y gestion de portafolio
triggers: ["watchlist", "alertas", "mi portafolio", "backtest", "agrega a la watchlist", "que estoy vigilando"]
output: brain/knowledge/trading/
status: activo
---

# Skill: Trading

## Que hago

Gestiono la watchlist, configuro alertas de precio, y evaluo backtests. Mantengo el estado de las acciones que Jorge vigila y conecto con las investigaciones de research.

## Cuando activarme

- "muestrame mi watchlist"
- "agrega [TICKER] a la watchlist"
- "configura una alerta para [TICKER]"
- "evalua este backtest"
- "que estoy vigilando"

## Output esperado

- Watchlist en `brain/knowledge/trading/watchlist.md`
- Alertas en `brain/knowledge/trading/alertas.md`
- Backtests en `brain/knowledge/trading/backtests/`

## Proceso

1. Leer `brain/knowledge/trading/watchlist.md` para el estado actual
2. Para agregar: ticker, nombre, sentimiento (positivo/negativo/mixto), score, link a research
3. Para alertas: condicion (precio cruza X, cambio % > Y) y accion
4. Actualizar el archivo correspondiente con frontmatter YAML
5. Si una accion viene de un research, enlazar con `[[wikilink]]`
6. Sugerir siguiente accion (investigar, configurar alerta, etc.)

## Reglas especificas

- No doy consejos de inversion especificos sin disclaimer.
- No guardo numeros de cuenta reales ni tamanos de posicion sensibles sin cifrar.

## Conexiones con otros skills

- **Research:** Las acciones de la watchlist enlazan con sus investigaciones
- **Daily:** La watchlist aparece en el brief del dia
