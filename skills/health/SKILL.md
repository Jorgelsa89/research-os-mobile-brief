---
skill: health
version: 1.0
triggers: ["sintomas", "dolor", "medico", "cita medica", "medicamento", "ejercicio", "sueno", "comi", "me siento", "energia", "salud"]
output: brain/knowledge/health/
---

# Skill: Health — Tu Historial de Bienestar

## Que hace este skill

Cortex actua como un diario de salud inteligente. No diagnostica — registra, detecta patrones y te prepara para conversaciones con medicos. Convierte datos fragmentados (como te sentiste, que comiste, como dormiste) en un historial coherente que cualquier medico agradece recibir.

## Subdominios

### 1. Symptom Journal
Registra sintomas con contexto:
- Fecha, hora, intensidad (1-10), duracion
- Contexto: que comiste, horas de sueno, nivel de estres
- Patrones automaticamente detectados
- Prep para consulta medica: resumen de los ultimos 30 dias

**Trigger:** "me duele", "tengo sintomas", "prepara mi consulta", "historial de sintomas"
**Output:** `brain/knowledge/health/symptoms-[FECHA].md`

### 2. Medication Manager
Gestiona tu regimen de medicamentos:
- Lista de medicamentos activos (nombre, dosis, frecuencia)
- Alertas de interacciones (informativas, no medicas)
- Tracking de refills necesarios
- Historial de cambios de medicamentos

**Trigger:** "mis medicamentos", "tomar pastilla", "refill", "interacciones"
**Output:** `brain/knowledge/health/medications.md` (nota permanente, se actualiza)

### 3. Fitness Intelligence
Analiza tus patrones de entrenamiento:
- Registro de sesiones (tipo, duracion, intensidad)
- Deteccion de patrones: cuando rindes mejor, recuperacion
- Correlacion con sueno, nutricion, estres
- Sugerencias de ajuste basadas en tus propios datos

**Trigger:** "entrene", "ejercicio de hoy", "como voy con fitness", "mi rendimiento"
**Output:** `brain/knowledge/health/fitness-[MES].md`

### 4. Sleep Optimizer
Rastrea y mejora la calidad del sueno:
- Horas dormidas, hora de acostarse/levantarse
- Calidad subjetiva (1-10)
- Factores que afectan el sueno (cafeina, ejercicio, estres)
- Correlacion sueno → energia del dia siguiente

**Trigger:** "dormi", "calidad de sueno", "me levante", "insomnio"
**Output:** `brain/knowledge/health/sleep-[MES].md`

### 5. Doctor Prep Brief
Genera un resumen medico completo para consultas:
- Sintomas actuales con historial de los ultimos 30 dias
- Medicamentos activos
- Preguntas a hacerle al medico
- Cambios notables desde la ultima visita

**Trigger:** "tengo cita con el medico", "prepara mi consulta", "brief medico"
**Output:** `brain/knowledge/health/doctor-brief-[FECHA].md`

## Reglas

- Los datos de salud son de los mas sensibles. Pregunta antes de guardar detalles especificos.
- Nunca diagnosticar. Siempre recomendar consultar con un profesional.
- Para datos muy sensibles (condiciones cronicas, medicamentos especificos), ofrecer encriptacion: `brain/security/crypto.mjs write health`
- Los patrones detectados son observaciones, no conclusiones medicas.
