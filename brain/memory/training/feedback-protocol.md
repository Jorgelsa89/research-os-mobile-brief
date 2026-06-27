---
title: "Protocolo de feedback"
updated: 2026-06-26
tags: [brain, training, feedback, protocol]
---

# Protocolo de feedback

Como Axon captura lo que Jorge dice y lo convierte en mejora. El feedback es
el combustible del loop de entrenamiento (ver `README.md`).

## Tipos de feedback

### 1. Feedback positivo — "eso estuvo perfecto"

Senales: "perfecto", "asi me gusta", "exacto", "eso es", "buen trabajo".

Accion:
1. Identificar el patron que se uso (que skill, que decision, que formato).
2. Reforzarlo: anotar leccion positiva en `skills/[skill]/lessons.md` marcada
   con `[+]`.
3. Si el mismo patron ya recibio refuerzo antes → promoverlo a
   `brain/memory/patterns/` como patron confirmado.

### 2. Feedback negativo — "no, asi no"

Senales: "no", "asi no", "esto esta mal", "no era eso", "te equivocaste".

Accion:
1. Registrar un **antipatron** en `skills/[skill]/lessons.md` marcado con `[-]`:
   describe que se hizo, por que estuvo mal, y que se debio hacer.
2. Si el antipatron se repite (>=2 veces) → escribir regla de "no hacer X" en el
   `SKILL.md` afectado.
3. Nunca borrar el antipatron: el error documentado evita repetirlo.

### 3. Feedback de preferencia — "prefiero que..."

Senales: "prefiero", "de ahora en adelante", "siempre hazlo asi", "mejor usa".

Accion:
1. Actualizar `brain/memory/preferences.md` con formato
   `[YYYY-MM-DD] [categoria]: [preferencia detectada]`.
2. Si la preferencia afecta el comportamiento de un skill concreto → reflejarla
   tambien en su `SKILL.md`.
3. Si es transversal a todo el brain (tono, idioma, formato) → candidata a regla
   en `CLAUDE.md` (con OK de Jorge).

## Formato estandar de una entrada de feedback

Toda entrada de leccion (en `skills/*/lessons.md`) sigue este formato:

```
N. **YYYY-MM-DD** [tipo]: [descripcion]. Causa/contexto: [...]. Accion: [que cambiar].
```

Donde `[tipo]` es uno de:
- `[+]` refuerzo (algo salio bien, repetirlo)
- `[-]` antipatron (algo salio mal, evitarlo)
- `[pref]` preferencia detectada
- `[obs]` observacion neutra (aun sin clasificar)

Ejemplo:
```
2. **2026-06-26** [+]: Jorge aprobo el scorecard de 8 metricas en NVDA. Causa: el
   formato numerico le permite decidir rapido. Accion: mantener scorecard como
   default en todo research.
```

## Cuando promover: leccion → patron → regla

Tres niveles, cada uno con un umbral mas alto:

| De | A | Cuando | Donde se escribe |
|----|---|--------|------------------|
| **Leccion** | **Patron** | La leccion se repite >=2 veces, O Jorge la valida explicitamente | `brain/memory/patterns/` o `preferences.md` |
| **Patron** | **Regla** | El patron es estable, aplica a todo el brain (no a un solo skill) y Jorge confirma | `CLAUDE.md` |
| **Leccion** | **Mejora de skill** | La leccion es especifica de un skill y ya esta validada | el `SKILL.md` de ese skill |

Reglas de oro:
- **Una sola vez ≠ patron.** Una leccion aislada se queda en `lessons.md`.
- **Patron ≠ regla global** hasta que aplica transversalmente y Jorge dice OK.
- **Cambios a `CLAUDE.md` SIEMPRE requieren confirmacion de Jorge** (son las
  reglas que gobiernan todo el sistema).
- Al promover, **resumir** la leccion original, no copiarla literal: el patron es
  la version destilada.

## Quien ejecuta esto

El skill `trainer` (`skills/trainer/SKILL.md`) aplica este protocolo cuando
Jorge dispara un ciclo ("entrena", "que aprendiste"). El feedback puntual
(positivo/negativo/preferencia) se puede capturar en cualquier momento durante
la conversacion y se anota de inmediato en el `lessons.md` correspondiente; la
promocion a patron/regla ocurre en el siguiente ciclo de training.
