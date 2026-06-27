---
skill: email
version: 1.0
domain: gestion de correo electronico
triggers: ["correos", "triage", "resume este correo", "responde a", "que pendientes de correo tengo", "seguimiento de"]
output: brain/knowledge/email/
status: activo
---

# Skill: Email

## Que hago

Clasifico correos por urgencia e importancia, genero resumenes concisos, sugiero respuestas, y mantengo seguimiento de conversaciones activas.

## Cuando activarme

- "correos" / "mis correos"
- "triage" / "clasifica estos correos"
- "resume este correo"
- "responde a [persona/asunto]"
- "que pendientes de correo tengo"
- "seguimiento de [persona]"

## Archivos de referencia

- `skills/email/triage-rules.md` — Reglas de clasificacion
- `skills/email/response-templates.md` — Templates de respuesta por tipo
- `skills/email/lessons.md` — Lecciones aprendidas

## Output esperado

- Actualizaciones en `brain/knowledge/email/pendientes.md`
- Seguimiento en `brain/knowledge/email/seguimiento.md`

## Proceso

### Para triage:
1. Recibir correos (pegados por Jorge o importados)
2. Clasificar cada uno usando la matriz urgencia/importancia
3. Generar resumen de 1-2 lineas por correo
4. Sugerir accion para los de alta prioridad
5. Actualizar `brain/knowledge/email/pendientes.md`

### Para respuesta sugerida:
1. Leer el correo y contexto
2. Verificar si hay historial en `brain/knowledge/email/seguimiento.md`
3. Aplicar el template de respuesta apropiado
4. Presentar borrador para aprobacion de Jorge
5. Nunca enviar automaticamente

### Para seguimiento:
1. Revisar `brain/knowledge/email/seguimiento.md`
2. Identificar conversaciones sin respuesta
3. Sugerir follow-up si han pasado mas de 3 dias

## Conexiones con otros skills

- **Daily:** Los correos pendientes aparecen en el brief matutino
- **Research:** Si un correo menciona una accion o tema de mercado, ofrecer investigar

## Reglas de privacidad

- No guardar contenido completo de correos en el vault, solo resumenes
- No incluir datos sensibles (passwords, tokens, numeros de cuenta)
- Los archivos de email se excluyen del repositorio via .gitignore
