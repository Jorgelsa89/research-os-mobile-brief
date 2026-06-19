# Stock Impact Template

Formato para analizar acciones vinculadas a una investigacion.

## Clasificacion de sentimiento

| Sentimiento | Criterio | Color |
|-------------|----------|-------|
| positivo | La accion se beneficia directamente del evento/tendencia | verde |
| negativo | La accion se ve perjudicada o enfrenta nuevo riesgo competitivo | rojo |
| mixto | Efectos positivos y negativos se compensan parcialmente | ambar |

## Estructura por accion

```markdown
- **[TICKER]** ([Nombre]) — Score: X.X — [Analisis en 1-2 oraciones
  explicando el impacto y las condiciones].
```

## Criterios de scoring para acciones vinculadas

| Score | Significado |
|-------|-------------|
| 8.0+ | Impacto fuerte y directo, alta probabilidad |
| 6.0-7.9 | Impacto moderado, depende de condiciones |
| <6.0 | Impacto incierto o marginal |

## Reglas

- Incluir entre 3 y 8 acciones vinculadas por investigacion
- Siempre tener al menos 1 positiva y 1 negativa si es posible
- Priorizar acciones que Jorge ya tiene en su [[watchlist]]
- Incluir el link a la nota de research en cada entrada de watchlist
