---
title: "Sistema de entrenamiento de Axon"
updated: 2026-06-26
tags: [brain, training, learning, meta]
---

# Sistema de entrenamiento de Axon

Axon no es estatico: mejora con el uso. Este directorio es el motor de esa
mejora. Aqui vive el loop que convierte el uso diario en skills mas afilados.

## El loop de aprendizaje

```
   Uso  ──▶  Leccion  ──▶  Patron  ──▶  Mejora del skill
    ▲                                          │
    └──────────────────────────────────────────┘
              (el skill mejorado se usa de nuevo)
```

1. **Uso.** Jorge usa un skill (research, trading, email, etc.).
2. **Leccion.** Si algo se aprende —un error, un atajo, una preferencia— se
   anota en `skills/[skill]/lessons.md`. Esto es feedback crudo e inmediato.
3. **Patron.** Cuando una leccion se repite o Jorge la valida, el skill
   `trainer` la consolida en `brain/memory/patterns/` (communication,
   decisions, workflow) o en `brain/memory/preferences.md`.
4. **Mejora del skill.** El `trainer` edita el `SKILL.md` afectado para que el
   comportamiento aprendido sea permanente. El siguiente uso ya es mejor.

El ciclo lo dispara Jorge diciendo "entrena", "que aprendiste" o "mejora tus
skills" (ver `skills/trainer/SKILL.md`).

## Las 3 capas de aprendizaje

| Capa | Donde vive | Velocidad | Que captura |
|------|-----------|-----------|-------------|
| **1. Feedback inmediato** | `skills/*/lessons.md` | instantanea (cada ejecucion) | Observaciones crudas, sin filtrar. Max 10 por skill. |
| **2. Consolidacion** | `brain/memory/patterns/` + `preferences.md` | media (ciclo de training) | Lecciones repetidas que se vuelven patrones estables. |
| **3. Evolucion** | `brain/memory/growth-log.md` | lenta (hitos) | Saltos de nivel de conocimiento del brain. |

Cada capa filtra a la siguiente: lo que se repite sube de capa; lo anecdotico
se queda abajo y se archiva. Asi el brain no se ahoga en ruido.

## Como Jorge da feedback explicito

No hace falta abrir archivos. Basta hablar:

- **"eso estuvo perfecto"** → el trainer refuerza el patron usado.
- **"no, asi no" / "esto esta mal"** → registra un antipatron.
- **"prefiero que..."** → actualiza `preferences.md`.
- **"entrena" / "que aprendiste"** → corre un ciclo completo de consolidacion.

El protocolo exacto esta en `feedback-protocol.md`.

## Como el sistema se auto-evalua

- `skill-scores.md` mide la madurez de cada uno de los 12 skills (veces usado,
  tasa de exito, ultima mejora, nivel: experimental / estable / maduro).
  Permite ver de un vistazo que skills necesitan mas entrenamiento.
- `training-log.md` registra cada ciclo: que se reviso, que patrones
  emergieron, que cambios se aplicaron. Es la auditoria del aprendizaje.
- En cada ciclo, el trainer compara lecciones nuevas vs. ya consolidadas para
  no reprocesar y para detectar lecciones huerfanas (anotadas pero nunca
  promovidas).

## Archivos de este directorio

| Archivo | Funcion |
|---------|---------|
| `README.md` | Este documento: explica el sistema completo. |
| `training-log.md` | Historial de ciclos de entrenamiento. |
| `feedback-protocol.md` | Como capturar y procesar feedback de Jorge. |
| `skill-scores.md` | Scoring de madurez de los 12 skills. |

## Relacion con el resto del brain

```
skills/*/lessons.md   (capa 1: feedback)
        │
        ▼  trainer consolida
brain/memory/patterns/ + preferences.md   (capa 2: consolidacion)
        │
        ▼  trainer registra hito
brain/memory/growth-log.md   (capa 3: evolucion)
        │
        ▼  si es regla global (con OK de Jorge)
CLAUDE.md   (regla permanente del brain)
```
