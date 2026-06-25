---
skill: learning
version: 1.0
triggers: ["quiero aprender", "explicame", "como funciona", "ensenme", "estudiar", "dominar", "entender mejor", "repaso de", "que es", "cuales son los fundamentos de"]
output: brain/knowledge/learning/
---

# Skill: Learning — Tu Acelerador de Expertise

## Que hace este skill

El cerebro olvida el 80% de lo nuevo en 3 dias (curva de Ebbinghaus). Cortex convierte cada sesion de aprendizaje en conocimiento persistente, conectado con lo que ya sabes, y lo surfacea de vuelta en el momento exacto en que es relevante — no cuando lo pides, sino cuando lo necesitas.

## Subdominios

### 1. Topic Accelerator
Aprende cualquier tema de forma estructurada:
1. Mapa mental del tema (conceptos clave y como se relacionan)
2. Lo que ya sabes vs. lo que falta (gap analysis)
3. Recursos recomendados por nivel (articulos, libros, videos)
4. Ejercicios de aplicacion practica
5. Preguntas de autoevaluacion (tecnica Feynman)

**Trigger:** "quiero aprender [tema]", "explicame [concepto]", "mapa de [area]"
**Output:** `brain/knowledge/learning/[tema]-[FECHA].md`

### 2. Insight Capture
Guarda y conecta insights del dia a dia:
- Un insight de un libro, podcast, conversacion
- Cortex lo conecta con notas existentes automaticamente
- Genera las 3 preguntas que profundizarian el insight
- Lo agenda para repaso en 7 dias

**Trigger:** "aprendi que", "insight:", "nota mental:", "esto es interesante:"
**Output:** Agrega a `brain/knowledge/learning/insights.md`

### 3. Spaced Repetition Engine
Surfacea conocimiento pasado en el momento correcto:
- Revisa `brain/knowledge/` completo
- Identifica notas con mas de 30 dias sin revisitar
- Las presenta cuando son relevantes para una tarea actual
- "Hace 45 dias investigaste options trading — es relevante para lo que me preguntas ahora"

**Trigger:** Automatico cuando una pregunta tiene contexto en notas pasadas
**Output:** Referencia a notas relevantes con resumen

### 4. Decision Learning
Aprende de tus propias decisiones pasadas:
- Loguea la decision, el razonamiento, el contexto
- 30/90/180 dias despues: como resulto?
- Patrones: en que tipo de decisiones aciertas / te equivocas
- "En las ultimas 10 decisiones de inversion, tu sesgo fue..."

**Trigger:** "tome la decision de", "decidi que", "revisa mis decisiones de"
**Output:** `brain/knowledge/learning/decision-journal.md` (actualizable)

### 5. Skill Tree Builder
Mapea la ruta para dominar cualquier skill profesional:
- Nivel actual (0-10 autoevaluado)
- Nivel objetivo y timeline
- Skills prerequisito que faltan
- Recursos especificos para cada gap
- Milestones de progreso medible

**Trigger:** "quiero ser experto en", "como mejoro en", "ruta de aprendizaje para"
**Output:** `brain/knowledge/learning/skill-tree-[skill]-[FECHA].md`

## La Filosofia del Skill

El aprendizaje no es acumular informacion — es construir conexiones. Cada nueva nota en brain/knowledge/ debe conectarse con al menos dos notas existentes via [[wikilinks]]. El cerebro de Cortex aprende exactamente como aprende el cerebro humano: por asociacion y repeticion espaciada.
