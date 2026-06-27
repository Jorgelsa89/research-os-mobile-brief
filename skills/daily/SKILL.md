---
skill: daily
version: 1.0
domain: brief diario y cierre del dia
triggers: ["que hay para hoy", "brief del dia", "brief matutino", "cierra el dia", "resumen del dia", "que hice hoy", "pendientes"]
output: brain/knowledge/daily/
status: activo
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

Archivo en `brain/knowledge/daily/[YYYY-MM-DD].md` con resumen del dia.

## Proceso

### Brief matutino ("que hay para hoy"):
1. Leer `brain/knowledge/daily/` — buscar nota del dia anterior para contexto y pendientes
2. **Calendario en vivo:** ejecutar `node brain/sync/connectors/google-calendar/calendar.mjs today` — eventos de hoy (si el conector esta configurado)
3. **Correo en vivo:** ejecutar `node brain/sync/connectors/gmail/gmail.mjs triage` — correos urgentes y pendientes (si el conector esta configurado)
4. Leer `brain/knowledge/trading/watchlist.md` — acciones en seguimiento
5. Leer `brain/knowledge/trading/alertas.md` — alertas activas
6. Leer `brain/knowledge/social/borradores/` — posts pendientes de publicar
7. Leer `brain/knowledge/research/` — investigaciones recientes (ultimos 3 dias)
8. Compilar brief usando template (orden: calendario → correo urgente → mercados/watchlist → research → pendientes)
9. Guardar en `brain/knowledge/daily/[FECHA].md`
10. Presentar resumen a Jorge

**Nota:** Los conectores piden la contrasena maestra. Si Jorge no la da o el conector no esta configurado, omitir ese bloque del brief sin fallar — usar solo las fuentes locales.

### Cierre del dia ("cierra el dia"):
1. Revisar que se hizo hoy (notas creadas, modificadas)
2. Actualizar metricas del dia
3. Listar pendientes para manana
4. Guardar/actualizar nota diaria
5. Actualizar `brain/knowledge/_index.md`

## Conexiones con otros skills

- **Todos:** El daily lee de todos los demas skills
- **Conectores:** Integra datos en vivo de Google Calendar y Gmail
- Es el unico skill que tiene vista completa del sistema
