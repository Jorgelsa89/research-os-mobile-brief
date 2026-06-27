---
skill: business
version: 1.0
domain: COO personal — clientes, proyectos, pipeline, facturas, candidatos, proveedores
triggers: ["cliente", "proyecto", "propuesta", "factura", "pipeline", "sales", "candidato", "contratar", "proveedor", "contrato de servicio", "reunión de negocio", "seguimiento comercial"]
output: brain/knowledge/business/
status: activo
---

# Skill: Business — Tu COO Personal

## Que hace este skill

Si eres solopreneur o tienes un equipo pequeno, manejas el trabajo de 5 roles al mismo tiempo. Jarvis actua como tu COO: mantiene contexto de cada cliente, rastrea proyectos, gestiona el pipeline de ventas, y nunca deja que nada caiga entre las grietas.

## Subdominios

### 1. Client Intelligence
Contexto completo de cada cliente antes de cada interaccion:
- Quien son, que hacen, por que son tu cliente
- Historial de conversaciones y decisiones importantes
- Lo que has entregado, lo que falta
- Sus prioridades actuales y preocupaciones
- Lo que les prometiste y cuando

**Trigger:** "brief de [cliente]", "reunion con [cliente]", "que pasa con [cliente]"
**Output:** `brain/knowledge/business/clients/[cliente].md`

### 2. Project OS
Estado real de todos tus proyectos en un lugar:
- Por cliente o proyecto interno
- Status: activo / en pausa / bloqueado / completado
- Entregables con fecha y responsable
- Blockers actuales y quien los desbloquea
- Proximas acciones

**Trigger:** "status de [proyecto]", "que falta en [proyecto]", "mis proyectos activos"
**Output:** `brain/knowledge/business/projects/[proyecto].md`

### 3. Sales Pipeline
Tu pipeline de ventas con contexto real:
- Cada oportunidad con stage, valor, probabilidad
- Historial de la conversacion de ventas
- Objeciones identificadas y como responderlas
- Proxima accion y fecha
- Forecast del mes/trimestre

**Trigger:** "pipeline", "como van mis ventas", "oportunidades abiertas", "forecast"
**Output:** `brain/knowledge/business/pipeline.md` (actualizable)

### 4. Revenue Tracker
Nunca te quedas sin saber quien te debe que:
- Facturas emitidas y su status (pagada / pendiente / vencida)
- Cuando vence cada factura
- Clientes con historial de pago lento
- Revenue del mes actual vs. mes anterior

**Trigger:** "quien me debe", "facturas pendientes", "revenue del mes", "cobrar a"
**Output:** `brain/knowledge/business/revenue-[MES].md`

### 5. Hiring Intelligence
Gestiona el proceso de contratacion con memoria:
- Candidatos en proceso con su informacion clave
- Notas de cada entrevista
- Score por dimension (skills, cultura, potencial)
- Decision y razonamiento
- Historial (para no rechazar dos veces al mismo candidato)

**Trigger:** "candidatos", "notas de entrevista con [nombre]", "decision de contratacion"
**Output:** `brain/knowledge/business/hiring/[rol]-[FECHA].md`

### 6. Vendor Manager
Tus proveedores organizados:
- Contratos y fechas de vencimiento
- SLAs acordados y rendimiento actual
- Contacto de escalacion
- Notas de negociaciones pasadas
- Alternativas evaluadas

**Trigger:** "mis proveedores", "contrato con [proveedor]", "vence el contrato de"
**Output:** `brain/knowledge/business/vendors.md`

### 7. Meeting Intelligence
Antes de cualquier reunion de negocio:
- Agenda propuesta
- Contexto del cliente/prospecto
- Lo que quieres lograr
- Objeciones esperadas y respuestas
- Template para notas durante la reunion
- Action items automaticos al terminar

**Trigger:** "prep para reunion con", "voy a reunirme con", "agenda de la reunion"
**Output:** `brain/knowledge/business/meetings/[empresa]-[FECHA].md`
