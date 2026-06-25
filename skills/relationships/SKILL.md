---
skill: relationships
version: 1.0
triggers: ["hablar con", "llamar a", "reunion con", "como esta", "remember", "recuerda que", "le dije a", "personal CRM", "cumpleanos", "seguimiento con"]
output: brain/knowledge/relationships/
---

# Skill: Relationships — Tu CRM Personal

## Que hace este skill

La mayoria de las relaciones importantes decaen por falta de mantenimiento, no por falta de interes. Cortex es tu sistema de memoria relacional: recuerda lo que importa a cada persona, cuando hablaron por ultima vez, lo que prometiste, y te avisa cuando una relacion importante necesita atencion.

## Subdominios

### 1. Contact Intelligence
Perfil completo de cada persona importante:
- Quien son (rol, empresa, contexto de la relacion)
- Lo que les importa (familia, proyectos, intereses)
- Historial de conversaciones clave
- Lo que prometiste o te prometieron
- Fechas importantes (cumpleanos, aniversarios, hitos)
- Cuando fue la ultima interaccion

**Trigger:** "quien es [nombre]", "que se de [nombre]", "antes de hablar con [nombre]"
**Output:** `brain/knowledge/relationships/[nombre].md`

### 2. Relationship Health Monitor
Detecta cuales relaciones necesitan atencion:
- Ordenadas por "dias desde ultimo contacto"
- Alertas de fechas importantes proximas
- Relaciones que se han "enfriado" sin razon aparente
- Personas con quienes tienes follow-ups pendientes

**Trigger:** "a quien no le he hablado", "seguimientos pendientes", "relaciones"
**Output:** Brief de relaciones que necesitan atencion

### 3. Meeting Brief Generator
Prep completo antes de reunirte con alguien:
- Quien es la persona / el equipo
- Ultima interaccion: cuando, que se dijo, que quedaste de hacer
- Lo que quieres lograr en esta reunion
- Contexto actual de su empresa / situacion
- Preguntas que deberias hacer

**Trigger:** "me reunio con [nombre]", "prep para llamada con", "brief de reunion con"
**Output:** `brain/knowledge/relationships/meeting-brief-[nombre]-[FECHA].md`

### 4. Network Intelligence
Mapea quien en tu red puede ayudar con que:
- "Quien conoce al CEO de [empresa]?"
- "Quien tiene experiencia en [tema]?"
- "Quien podria presentarme a alguien en [industria]?"

**Trigger:** "necesito conectar con alguien que", "quien en mi red", "introduccion a"
**Output:** Mapa de conexiones relevantes + sugerencia de como llegar

### 5. Family OS
Contexto compartido para la familia:
- Agenda familiar (quien tiene que estar donde)
- Fechas importantes de todos los miembros
- Compromisos familiares pendientes
- Notas de conversaciones familiares importantes

**Trigger:** "agenda familiar", "fechas de [familiar]", "que pasa esta semana en familia"
**Output:** `brain/knowledge/relationships/family-[FECHA].md`

## Reglas

- Los datos de relaciones son extremadamente sensibles. Nunca incluir informacion comprometedora.
- Nombres reales de contactos personales: solo guardar con permiso explicito del usuario
- Para contactos con informacion muy sensible, usar encriptacion: `brain/security/crypto.mjs write contacts`
- El objetivo es AYUDAR relaciones, nunca analizarlas de forma invasiva
