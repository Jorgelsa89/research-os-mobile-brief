---
title: "Scoring de madurez de skills"
updated: 2026-06-26
tags: [brain, training, scoring, skills]
---

# Scoring de madurez de skills

Cada uno de los 12 skills tiene metricas de madurez. Esto permite ver de un
vistazo que skills estan probados y cuales necesitan mas entrenamiento.
Lo recalcula el skill `trainer` en cada ciclo.

## Metricas

| Metrica | Que mide |
|---------|----------|
| **Usos** | Veces que el skill se ha ejecutado (entradas/ejecuciones registradas). |
| **Tasa de exito** | % de ejecuciones que Jorge no corrigio (feedback `[+]` o sin `[-]`). |
| **Lecciones** | Lecciones acumuladas en su `lessons.md`. |
| **Ultima mejora** | Fecha del ultimo cambio aplicado a su `SKILL.md`. |
| **Nivel** | `experimental` (poco/nada usado) · `estable` (usado y corregido varias veces) · `maduro` (usado mucho, tasa alta, proceso afinado). |

### Criterios de nivel

- **experimental:** 0-2 usos. Aun sin datos suficientes para confiar.
- **estable:** 3-9 usos y tasa de exito >= 70%. Funciona, sigue afinandose.
- **maduro:** >= 10 usos y tasa de exito >= 85%. Proceso probado y consolidado.

## Tabla de skills (estado inicial — 2026-06-26)

### Nucleo

| Skill | Usos | Tasa exito | Lecciones | Ultima mejora | Nivel |
|-------|------|-----------|-----------|---------------|-------|
| research | 1 | s/d | 1 | 2026-06-08 | experimental |
| trading | 0 | s/d | 0 | — | experimental |
| email | 0 | s/d | 0 | — | experimental |
| social | 0 | s/d | 0 | — | experimental |
| daily | 0 | s/d | 0 | — | experimental |

### Expansion (Cortex v2)

| Skill | Usos | Tasa exito | Lecciones | Ultima mejora | Nivel |
|-------|------|-----------|-----------|---------------|-------|
| finance | 0 | s/d | 0 | — | experimental |
| health | 0 | s/d | 0 | — | experimental |
| relationships | 0 | s/d | 0 | — | experimental |
| learning | 0 | s/d | 0 | — | experimental |
| legal | 0 | s/d | 0 | — | experimental |
| creative | 0 | s/d | 0 | — | experimental |
| business | 0 | s/d | 0 | — | experimental |

> `s/d` = sin datos (aun no hay feedback registrado).
> `trainer` (meta-skill) no se puntua a si mismo: orquesta el scoring del resto.

## Lectura del estado actual

- Todos los skills arrancan en **experimental**: el sistema acaba de instalar el
  loop de entrenamiento. Solo `research` tiene un uso real registrado.
- **Prioridad de entrenamiento** (segun prioridades de Jorge: Research > Trading
  > Email > Social): empujar `research` a estable consolidando su leccion, y
  generar primeros usos de `trading` y `email`.
- Los 7 skills de expansion estan dormidos hasta que Jorge los active con sus
  triggers; subiran de nivel a medida que se usen.

## Como se actualiza

En cada ciclo de training el `trainer`:
1. Cuenta usos (ejecuciones registradas en `brain/knowledge/` y feedback).
2. Recalcula tasa de exito a partir de marcas `[+]` / `[-]` en `lessons.md`.
3. Actualiza "ultima mejora" si toco ese `SKILL.md`.
4. Reasigna nivel segun los criterios de arriba.
5. Refleja el ciclo en `training-log.md`.
