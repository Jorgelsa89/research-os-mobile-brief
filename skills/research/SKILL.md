---
skill: research
version: 1.0
domain: investigacion financiera y tecnologica
triggers: ["investiga", "analiza [TICKER]", "brief de", "que sabes de", "que paso con", "research"]
output: brain/knowledge/research/
status: activo
---

# Skill: Research

## Que hago

Investigo noticias, acciones, y temas tecnologicos. Genero briefs completos con scorecard de 8 metricas, analisis de acciones vinculadas, decision (Buy/Watch/Skip), y senales a vigilar.

## Cuando activarme

- "investiga [tema/ticker]"
- "analiza [TICKER]"
- "brief de [tema]"
- "que sabes de [tema]"
- "que paso con [TICKER/tema]"
- "research [tema]"

## Archivos de referencia

- `skills/research/scorecard-template.md` — Template y criterios de las 8 metricas
- `skills/research/brief-template.md` — Estructura completa del brief
- `skills/research/stock-impact-template.md` — Template de acciones vinculadas
- `skills/research/lessons.md` — Lecciones aprendidas de ejecuciones previas

## Output esperado

Archivo en `brain/knowledge/research/[TICKER]-[Tema]-[YYYY-MM-DD].md` con:
- Frontmatter YAML completo
- Resultado principal con score y decision
- Resumen de investigacion
- Scorecard de 8 metricas
- Acciones vinculadas (positivo/negativo/mixto)
- Insights clave
- Senales a vigilar
- Links `[[wikilinks]]` a notas relacionadas

## Proceso

1. Buscar informacion sobre el tema usando fuentes disponibles
2. Verificar si ya existe una nota en `brain/knowledge/research/` sobre el mismo tema
3. Si existe, ofrecer actualizar en vez de crear nueva
4. Evaluar cada una de las 8 metricas del scorecard (0-10)
5. Calcular score compuesto (promedio)
6. Determinar decision: Buy (8.0+), Watch (6.0-7.9), Skip (<6.0)
7. Identificar acciones vinculadas con sentimiento e impacto
8. Generar insights y senales a vigilar
9. Guardar en vault con frontmatter y wikilinks
10. Actualizar `brain/knowledge/_index.md` con la nueva nota
11. Ofrecer: "Quieres que actualice la watchlist?" o "Quieres un post sobre esto?"

## Conexiones con otros skills

- **Trading:** Despues de un research, ofrecer agregar acciones a la watchlist
- **Social:** Ofrecer generar post basado en los hallazgos
- **Daily:** Las investigaciones del dia aparecen en el brief diario
