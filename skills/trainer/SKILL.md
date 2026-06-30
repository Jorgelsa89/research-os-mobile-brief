---
skill: trainer
version: 1.0
domain: meta-aprendizaje y auto-mejora del brain (entrenamiento de skills)
triggers: ["entrena", "que aprendiste", "mejora tus skills", "revisa tus lecciones", "feedback", "que harias diferente"]
output: brain/memory/training/
status: activo
---

# Skill: Trainer (Meta-aprendizaje)

> Cierra el ciclo de aprendizaje del brain: convierte lecciones sueltas en mejoras concretas de los skills, preferencias y reglas. Es el unico skill que modifica a los otros skills.

## Que hago

Reviso todo lo que el brain ha aprendido (las `lessons.md` de cada skill), detecto patrones recurrentes —errores que se repiten, preferencias que aparecen una y otra vez— y los convierto en cambios reales: edito los `SKILL.md` afectados, actualizo `preferences.md`, registro el avance en `growth-log.md` y dejo constancia del ciclo en `training-log.md`.

Sin este skill, el brain solo acumula notas. Conmigo, el brain mejora con el uso.

## Cuando activarme

- "entrena"
- "que aprendiste"
- "mejora tus skills"
- "revisa tus lecciones"
- "feedback"
- "que harias diferente"

(Estos coinciden con el array `triggers:` del frontmatter.)

## Archivos de referencia

- `brain/memory/training/README.md` — Como funciona el loop de entrenamiento (las 3 capas)
- `brain/memory/training/feedback-protocol.md` — Como capturar y procesar feedback de Jorge
- `brain/memory/training/skill-scores.md` — Madurez actual de los 12 skills
- `brain/memory/training/training-log.md` — Historial de ciclos de entrenamiento
- `skills/*/lessons.md` — Lecciones crudas de cada skill (la materia prima)
- `brain/memory/patterns/` — Patrones consolidados (communication, decisions, workflow)
- `brain/memory/preferences.md` — Preferencias aprendidas de Jorge
- `brain/memory/growth-log.md` — Cronologia de evolucion del brain

## Output esperado

Una entrada nueva en `brain/memory/training/training-log.md` con frontmatter, mas los efectos secundarios del ciclo:
- 0 o mas ediciones a `skills/*/SKILL.md`
- 0 o mas entradas en `brain/memory/preferences.md`
- 0 o mas patrones nuevos/actualizados en `brain/memory/patterns/`
- 1 entrada en `brain/memory/growth-log.md` si el ciclo produjo cambios significativos
- `skill-scores.md` actualizado (madurez y "ultima mejora")

## Proceso

1. **Leer la materia prima.** Recorrer todos los `skills/*/lessons.md` y leer
   `brain/memory/training/training-log.md` para saber hasta donde se proceso la ultima vez
   (evitar re-procesar lecciones ya consolidadas). **Incluir el Friction Log de
   `BETA.md`** y las entradas `FRICTION`/`FEEDBACK` de `brain/sync/ai-comms/bitacora.md`:
   son feedback de usuarios reales y tienen prioridad alta — un punto de friccion
   reportado por un beta user vale mas que una leccion interna.
2. **Detectar patrones recurrentes.** Agrupar lecciones por tema. Buscar:
   - Errores repetidos (mismo fallo en >=2 ejecuciones) → candidato a regla.
   - Preferencias implicitas (Jorge eligio lo mismo >=2 veces) → candidato a `preferences.md`.
   - Atajos o mejoras de calidad que funcionaron → candidato a mejora del proceso del skill.
3. **Proponer mejoras concretas.** Para cada patron, redactar el cambio exacto al `SKILL.md`
   afectado (no generico: "agregar paso X al proceso de research"). Presentar a Jorge antes de
   aplicar cambios estructurales; aplicar directo los menores.
4. **Actualizar preferencias.** Si se detecto una preferencia nueva o confirmada, agregar entrada
   en `brain/memory/preferences.md` con formato `[YYYY-MM-DD] [categoria]: [preferencia]`.
   Ver criterios de promocion en `feedback-protocol.md`.
5. **Actualizar growth-log.** Si el ciclo produjo cambios reales, agregar entrada en la cronologia
   de `brain/memory/growth-log.md` (fecha, que mejoro, como sube el nivel).
6. **Registrar el ciclo.** Escribir entrada en `brain/memory/training/training-log.md`:
   lecciones revisadas, patrones detectados, cambios aplicados, skills tocados.
7. **Actualizar scores.** Recalcular `brain/memory/training/skill-scores.md`
   (veces usado, tasa de exito, ultima mejora, nivel de madurez).
8. **Sugerir siguiente accion.** Ej: "Detecte 3 lecciones sin consolidar en Trading. Quieres que
   las promueva a regla?"

## Regla de promocion (resumen)

`Leccion` (en lessons.md) → si se repite o Jorge la valida → `Patron` (en patterns/) →
si es estable y aplica a todo el brain → `Regla` (en CLAUDE.md, requiere OK de Jorge).
Detalle completo en `feedback-protocol.md`.

## Conexiones con otros skills

- **Todos los skills:** soy el unico skill autorizado a editar otros `SKILL.md`. Consumo sus `lessons.md`.
- **Daily:** al cerrar el dia, Daily puede sugerir "corre un ciclo de entrenamiento" si hay lecciones acumuladas.
- **Patterns/memory:** escribo en `preferences.md`, `patterns/` y `growth-log.md`.

## Reglas especificas

- Nunca borro una leccion sin consolidarla primero (resumir, no perder informacion).
- No invento preferencias: solo promuevo lo que aparece >=2 veces o que Jorge valido explicitamente.
- Cambios a `CLAUDE.md` (reglas globales) SIEMPRE requieren confirmacion de Jorge.
- No toco `brain/identity/` (encriptado) bajo ninguna circunstancia.
- Cada ciclo deja rastro auditable en `training-log.md` (que cambio y por que).
