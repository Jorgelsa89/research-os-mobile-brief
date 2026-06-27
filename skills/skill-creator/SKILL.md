---
skill: skill-creator
version: 1.0
domain: meta-skill que crea nuevos skills para Axon
triggers: ["crea un skill", "nuevo skill", "necesito un skill para", "agrega la habilidad de"]
output: skills/[nombre]/ + brain/knowledge/[nombre]/
status: activo
---

# Skill: Skill Creator (Meta-Skill)

> El skill que crea skills. Convierte una idea ("necesito que sepas hacer X") en un skill funcional y registrado en Axon, sin que Jorge tenga que tocar plantillas a mano.

## Que hago

Genero nuevos skills completos a partir del template canonico (`skills/_TEMPLATE/SKILL.md`).
Recojo la intencion de Jorge, creo la estructura de carpetas, lleno el `SKILL.md` con sus
datos, dejo lista la memoria del skill (`lessons.md`), preparo el destino de outputs en
`brain/knowledge/`, y registro el skill nuevo en `CLAUDE.md` y en el indice del vault.

Resuelve el problema de que crear un skill manualmente implica copiar plantillas, recordar
los campos de frontmatter, crear varias carpetas y actualizar dos archivos de registro — todo
propenso a errores. Este meta-skill lo automatiza y lo deja consistente.

## Cuando activarme

- "crea un skill"
- "nuevo skill"
- "necesito un skill para"
- "agrega la habilidad de"

(Estos deben coincidir con el array `triggers:` del frontmatter.)

## Archivos de referencia

- `skills/_TEMPLATE/SKILL.md` — el formato canonico que se clona para cada skill nuevo
- `skills/skill-creator/skill-spec.md` — especificacion formal de que hace valido a un skill
- `skills/skill-creator/scaffold.mjs` — script Node que automatiza el scaffolding
- `skills/skill-creator/lessons.md` — Lecciones aprendidas de ejecuciones previas

## Output esperado

No genera una nota en `brain/knowledge/`. Su output es un **skill nuevo y funcional**:

```
skills/[nombre]/
  SKILL.md          ← desde el template canonico, lleno con los datos
  lessons.md        ← memoria vacia con frontmatter inicial
  [template].md     ← opcional, si el skill produce un formato repetible
brain/knowledge/[nombre]/
  .gitkeep          ← destino de los outputs del skill
```

Mas dos registros actualizados: la tabla de skills en `CLAUDE.md` y `brain/knowledge/_index.md`.

## Proceso

1. **Preguntar a Jorge los datos del skill** (si no los dio ya):
   - Nombre del skill (kebab-case, p.ej. `fitness-coach`)
   - Dominio (una linea: que area cubre)
   - Que problema resuelve (para que sirve)
   - Triggers naturales (3+ frases que lo activan)
   - Que output genera (nota, lista, reporte, formato repetible)
2. **Crear la carpeta** `skills/[nombre]/`.
3. **Generar `SKILL.md`** clonando `skills/_TEMPLATE/SKILL.md` y sustituyendo los placeholders
   con los datos recogidos (skill, domain, triggers, output, "Que hago", "Cuando activarme").
4. **Generar templates de referencia** si el skill produce un formato repetible
   (p.ej. `skills/[nombre]/[formato]-template.md`). Si no aplica, omitir.
5. **Crear `skills/[nombre]/lessons.md`** vacio con frontmatter inicial.
6. **Crear la carpeta** `brain/knowledge/[nombre]/` con un `.gitkeep`.
7. **Registrar el skill** en la tabla de skills de `CLAUDE.md` (seccion Nucleo o Expansion).
8. **Actualizar `brain/knowledge/_index.md`** anadiendo la nueva carpeta a la tabla de estructura.
9. **Confirmar y sugerir el primer uso** del skill recien creado.

> Atajo: para el scaffolding mecanico (pasos 2, 3, 5, 6) se puede ejecutar
> `node skills/skill-creator/scaffold.mjs <nombre> "<dominio>" "<trigger1,trigger2,trigger3>"`
> y luego completar a mano los pasos 4, 7, 8 y 9.

## Conexiones con otros skills

- **Todos:** este es el meta-skill; cualquier skill futuro nace de aqui.
- **Daily:** la creacion de un skill nuevo puede registrarse en el brief del dia.

## Reglas especificas

- El nombre del skill debe ser unico: si ya existe `skills/[nombre]/`, abortar y avisar.
- Nombres en kebab-case, sin espacios ni mayusculas.
- Todo skill nuevo debe pasar el checklist de validacion de `skill-spec.md` antes de
  considerarse "completo".
- No registrar un skill a medias en `CLAUDE.md`: primero existe la carpeta, luego se registra.
- Respetar las reglas de privacidad del sistema: ningun skill nuevo guarda credenciales ni
  datos sensibles fuera de `brain/identity/` (encriptado).
