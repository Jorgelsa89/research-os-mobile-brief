---
skill: creative
version: 1.0
domain: OS de proyectos creativos — libros, podcast, newsletter, articulos, guiones
triggers: ["escribe", "libro", "capitulo", "podcast", "episodio", "newsletter", "articulo", "idea de contenido", "blog", "guion", "brief creativo", "proyecto creativo"]
output: brain/knowledge/creative/
status: activo
---

# Skill: Creative — Tu OS de Proyectos Creativos

## Que hace este skill

Los proyectos creativos mueren porque las ideas no tienen un hogar. Jarvis es el archivo vivo de todos tus proyectos creativos: notas de libros en progreso, episodios de podcast, newsletters, guiones, ideas sin desarrollar. Todo conectado, todo buscable, todo evolucionando.

## Subdominios

### 1. Book / Writing OS
Gestiona proyectos de escritura larga:
- Outline del libro/articulo con capitulos
- Research vinculado a cada seccion
- Borradores de cada capitulo
- Notas de "lo que quiero decir" cuando una idea llega
- Tracking de progreso (palabras escritas, % completado)

**Trigger:** "nota para mi libro", "capitulo [N]", "idea para [proyecto]", "outline de"
**Output:** `brain/knowledge/creative/[proyecto]/` (estructura de proyecto)

### 2. Podcast Intelligence
El OS completo para un podcast:
- Banco de ideas de episodios
- Research de invitados (quien son, sus ideas principales, preguntas unicas)
- Estructura de cada episodio (hooks, puntos clave, cierre)
- Show notes generadas automaticamente
- Calendario editorial

**Trigger:** "episodio sobre", "investigar a [invitado]", "prep para podcast", "show notes de"
**Output:** `brain/knowledge/creative/podcast/[episodio]-[FECHA].md`

### 3. Newsletter Engine
Produce newsletters de calidad consistentemente:
- Banco de ideas con fuentes
- Estructura del issue (hook, cuerpo, cierre, CTA)
- Tono de voz guardado en brand voice
- Performance de issues anteriores (opens, clicks, respuestas)
- Calendario editorial

**Trigger:** "idea para newsletter", "draft del issue", "newsletter de esta semana"
**Output:** `brain/knowledge/creative/newsletter/[FECHA]-[tema].md`

### 4. Idea Archive
El lugar donde las ideas no se pierden:
- Captura rapida de ideas sin desarrollar
- Etiquetado por tipo (negocio, contenido, producto, investigacion)
- Conexiones automaticas con ideas relacionadas
- Revisado mensualmente para rescatar lo valioso

**Trigger:** "tengo una idea:", "idea:", "que tal si", "y si construimos"
**Output:** Agrega a `brain/knowledge/creative/ideas.md`

### 5. Design Brief Generator
Convierte tu vision en briefs accionables para disenadores:
- Objetivo del proyecto
- Audiencia objetivo
- Mood board en palabras (estilo, colores, referencias)
- Entregables especificos
- Timeline y contexto

**Trigger:** "necesito un diseno para", "brief de diseno", "explicale al disenador que"
**Output:** `brain/knowledge/creative/design-brief-[proyecto]-[FECHA].md`

## La Filosofia Creativa

Los mejores proyectos creativos no nacen de una sesion de inspiracion. Nacen de ideas que se acumulan, se conectan, y maduran con el tiempo. Jarvis hace que cada pensamiento casual sobre un proyecto sea capturado y conectado. Cuando finalmente te sientas a crear, el trabajo esta 60% hecho.
