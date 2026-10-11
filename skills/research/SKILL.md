---
skill: research
version: 1.0
domain: investigacion financiera y tecnologica
triggers: ["investiga", "analiza", "brief de", "que sabes de", "que paso con", "research"]
output: brain/knowledge/research/
status: activo
---

# Skill: Research

## Que hago

Investigo noticias, acciones y temas tecnologicos. Genero briefs completos con scorecard de 8 metricas, analisis de acciones vinculadas, decision (Buy/Watch/Skip), y senales a vigilar.

## Cuando activarme

- "investiga [tema/ticker]"
- "analiza [TICKER]"
- "brief de [tema]"
- "que sabes de [tema]"
- "que paso con [TICKER/tema]"

## Output esperado

Archivo en `brain/knowledge/research/[TICKER]-[Tema]-[YYYY-MM-DD].md` con:
- Frontmatter YAML completo
- Resultado principal con score y decision
- Resumen de investigacion
- Scorecard de 8 metricas (ver CLAUDE.md)
- Acciones vinculadas (positivo/negativo/mixto)
- Insights clave y senales a vigilar
- Links `[[wikilinks]]` a notas relacionadas

## Proceso

1. Buscar informacion sobre el tema usando fuentes disponibles
2. Verificar si ya existe una nota en `brain/knowledge/research/` sobre el mismo tema
3. Si existe, ofrecer actualizar en vez de crear nueva
4. Evaluar cada una de las 8 metricas del scorecard (0-10)
5. Calcular score compuesto (promedio)
6. Determinar decision: Buy (8.0+), Watch (6.0-7.9), Skip (<6.0)
7. Identificar acciones vinculadas con sentimiento e impacto
8. Guardar en el knowledge base con frontmatter y wikilinks
9. Actualizar `brain/knowledge/_index.md`
10. Ofrecer: "Quieres que actualice la watchlist?" o "Quieres un post sobre esto?"

## Reglas aprendidas

1. **Beneficiarios secundarios > principal:** al analizar un catalizador, evaluar
   la cadena de valor completa. El beneficiario secundario puede tener mejor edge
   que el directo, porque el consenso ya descuenta al obvio. Incluir al menos uno
   en cada analisis de acciones vinculadas.

## Conexiones con otros skills

- **Trading:** Despues de un research, ofrecer agregar acciones a la watchlist
- **Daily:** Las investigaciones del dia aparecen en el brief diario
