# Alert Rules Template

Formato para configurar alertas de precio en `vault/trading/alertas.md`.

## Tipos de alerta

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| precio_cruza | Ticker cruza $PRECIO | NVDA cruza $150 |
| cambio_pct | Ticker cambia > X% en un dia | MSFT cambia > 3% |
| score_update | Nueva info requiere re-evaluar scorecard | QCOM score_update |

## Estructura

```markdown
| Ticker | Tipo | Valor | Accion sugerida | Estado |
|--------|------|-------|-----------------|--------|
| [TICKER] | [tipo] | [valor] | [que hacer si se activa] | activa/disparada/cancelada |
```

## Reglas

- Maximo 10 alertas activas
- Cuando una alerta se dispara, moverla a "disparada" y notificar en el brief diario
- Sugerir accion basada en el research existente
