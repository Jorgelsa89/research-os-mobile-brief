# Watchlist Template

Estructura para mantener la watchlist en `vault/trading/watchlist.md`.

## Formato de entrada

```markdown
| Ticker | Nombre | Sentimiento | Score | Research | Notas |
|--------|--------|-------------|-------|----------|-------|
| [TICKER] | [Nombre] | [positivo/negativo/mixto] | X.X | [[nota-research]] | [1 linea de contexto] |
```

## Campos

- **Ticker:** Simbolo de la accion (NVDA, MSFT, etc.)
- **Nombre:** Nombre completo de la empresa
- **Sentimiento:** positivo, negativo, o mixto basado en el ultimo research
- **Score:** Score de impacto del ultimo research (no es el score compuesto)
- **Research:** Wikilink a la nota de investigacion mas relevante
- **Notas:** Contexto breve de por que esta en la watchlist

## Reglas

- Maximo 15 acciones en la watchlist activa
- Cuando se supere el maximo, sugerir archivar las de menor score
- Siempre incluir link a research cuando exista
- Actualizar sentimiento cuando haya nueva investigacion
