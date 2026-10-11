---
skill: daily
version: 1.0
domain: brief diario y cierre del dia
triggers: ["que hay para hoy", "brief del dia", "brief matutino", "cierra el dia", "resumen del dia", "pendientes"]
output: brain/knowledge/daily/
status: activo
---

# Skill: Daily

## Que hago

Genero el brief matutino consolidando informacion de todos los dominios (research, trading). Tambien genero el cierre del dia resumiendo actividades y listando pendientes. Soy el unico skill con vista completa del sistema.

## Cuando activarme

- "que hay para hoy" / "buenos dias"
- "brief del dia" / "brief matutino"
- "cierra el dia" / "resumen del dia"
- "pendientes"

## Output esperado

Archivo en `brain/knowledge/daily/[YYYY-MM-DD].md` con resumen del dia.

## Proceso

### Brief matutino ("que hay para hoy"):
1. Leer `brain/knowledge/daily/` — nota del dia anterior para contexto y pendientes
2. Leer `brain/knowledge/trading/watchlist.md` — acciones en seguimiento
3. Leer `brain/knowledge/research/` — investigaciones recientes (ultimos 3 dias)
4. Compilar brief (orden: pendientes → mercados/watchlist → research reciente)
5. Guardar en `brain/knowledge/daily/[FECHA].md`
6. Presentar resumen a Jorge

### Cierre del dia ("cierra el dia"):
1. Revisar que se hizo hoy (notas creadas, modificadas)
2. Listar pendientes para manana
3. Guardar/actualizar nota diaria
4. Actualizar `brain/knowledge/_index.md`

## Conexiones con otros skills

- **Todos:** El daily lee de todos los demas skills
