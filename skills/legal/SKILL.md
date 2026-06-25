---
skill: legal
version: 1.0
triggers: ["contrato", "acuerdo", "clausula", "deadline legal", "compliance", "marca registrada", "ip", "propiedad intelectual", "demanda", "obligacion legal", "vencimiento de contrato", "renovacion"]
output: brain/knowledge/legal/
---

# Skill: Legal — Tu Guardian de Contratos y Obligaciones

## Que hace este skill

Los problemas legales casi siempre vienen de dos lugares: no leer los contratos que firmas, o olvidar las obligaciones que aceptaste. Cortex lee contratos contigo, extrae las clausulas que importan, rastrea deadlines, y te avisa antes de que venza algo importante.

**IMPORTANTE:** Cortex no es un abogado. Siempre consultar con un profesional legal para decisiones importantes.

## Subdominios

### 1. Contract Scanner
Analiza cualquier contrato y extrae lo esencial:
- **Partes:** Quien firma con quien
- **Objeto:** Que acuerdan exactamente
- **Duracion:** Cuando empieza, cuando vence, como se renueva
- **Obligaciones:** Que te comprometiste a hacer TU
- **Red flags:** Clausulas no estandar, penalidades ocultas, limitaciones de responsabilidad
- **Preguntas para tu abogado:** Lo que no queda claro

**Trigger:** pega o describe el contrato, "analiza este contrato", "que dice este acuerdo"
**Output:** `brain/knowledge/legal/contract-[empresa]-[FECHA].md`

### 2. Deadline Guardian
Nunca pierdas un plazo legal:
- Lista de todas las obligaciones con fecha limite
- Alertas a 30, 7, y 1 dia antes
- Renovaciones automaticas que podrian sorprenderte
- Filings regulatorios (declaraciones, reportes, licencias)

**Trigger:** "deadlines legales", "que vence pronto", "renovaciones", "obligaciones pendientes"
**Output:** Calendario de obligaciones legales en `brain/knowledge/legal/deadlines.md`

### 3. IP Shield
Protege tu propiedad intelectual:
- Registro de tus marcas, dominios, patentes
- Alertas cuando una marca similar se registra
- Landscape de patentes en tu area (informativo)
- Notas de acuerdos de confidencialidad (NDA)

**Trigger:** "mi ip", "proteger mi marca", "nda con", "patente"
**Output:** `brain/knowledge/legal/ip-registry.md`

### 4. Privacy Auditor
Que datos compartes y con quien:
- Apps y servicios con acceso a tu informacion
- Permisos que has dado (Google, Apple, etc.)
- Donde tienen tu SSN, datos financieros, de salud
- Pasos para ejercer tus derechos (GDPR, CCPA, etc.)

**Trigger:** "quien tiene mis datos", "privacidad", "revocar acceso", "mis derechos de privacidad"
**Output:** `brain/knowledge/legal/privacy-audit-[FECHA].md`

### 5. Obligation Tracker
Rastrea lo que prometiste y lo que te prometieron:
- Compromisos verbales y escritos
- Entregables con fecha
- Pagos pendientes en ambas direcciones
- Escalaciones si algo no se cumple

**Trigger:** "comprometi que", "me prometieron que", "que le debo a", "que me deben"
**Output:** Agrega a `brain/knowledge/legal/obligations.md`

## Reglas

- Siempre agregar disclaimer: "Esta no es asesoria legal. Consultar con un abogado."
- Nunca guardar numeros de caso legal activos o estrategias de litigio sin encriptacion
- Para datos legales muy sensibles: `brain/security/crypto.mjs write legal`
- Si el usuario describe una situacion urgente (demanda activa, plazo hoy), redirigir a abogado inmediatamente
