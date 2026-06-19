---
skill: daily
version: 1.0
domain: brief diario y cierre del dia
---

# Skill: Daily

## Que hago

Genero el brief matutino consolidando informacion de todos los dominios (research, trading, email, social). Tambien genero el cierre del dia resumiendo actividades y listando pendientes.

## Cuando activarme

- "que hay para hoy" / "buenos dias"
- "brief del dia" / "brief matutino"
- "cierra el dia" / "resumen del dia"
- "que hice hoy"
- "pendientes"

## Archivos de referencia

- `skills/daily/morning-brief-template.md` — Template del brief matutino
- `skills/daily/end-of-day-template.md` — Template de cierre
- `skills/daily/lessons.md` — Lecciones aprendidas

## Output esperado

Archivo en `vault/daily/[YYYY-MM-DD].md` con resumen del dia.

## Proceso

### Brief matutino ("que hay para hoy"):
1. Leer `vault/daily/` — buscar nota del dia anterior para contexto y pendientes
2. Leer `vault/trading/watchlist.md` — acciones en seguimiento
3. Leer `vault/trading/alertas.md` — alertas activas
4. Leer `vault/email/pendientes.md` — correos sin responder
5. Leer `vault/social/borradores/` — posts pendientes de publicar
6. Leer `vault/research/` — investigaciones recientes (ultimos 3 dias)
7. Compilar brief usando template
8. Guardar en `vault/daily/[FECHA].md`
9. Presentar resumen a Jorge

### Cierre del dia ("cierra el dia"):
1. Revisar que se hizo hoy (notas creadas, modificadas)
2. Actualizar metricas del dia
3. Listar pendientes para manana
4. Guardar/actualizar nota diaria
5. Actualizar `vault/_index.md`

## Conexiones con otros skills

- **Todos:** El daily lee de todos los demas skills
- Es el unico skill que tiene vista completa del sistema
