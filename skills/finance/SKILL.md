---
skill: finance
version: 1.0
triggers: ["mi situacion financiera", "cuanto tengo", "suscripciones", "deudas", "patrimonio", "flujo de caja", "CFO", "presupuesto", "impuestos", "seguro"]
output: brain/knowledge/finance/
---

# Skill: Finance — CFO Personal

## Que hace este skill

Convierte a Cortex en tu CFO personal. Monitorea tu patrimonio neto, detecta subscripciones invisibles, proyecta flujo de caja, y prepara para la temporada de impuestos. No gestiona dinero — gestiona conocimiento financiero.

## Subdominios

### 1. Net Worth Tracker
Calcula y actualiza tu patrimonio neto real:
- Activos: cash, inversiones, inmuebles, vehiculos, otros
- Pasivos: deudas, hipotecas, creditos
- Net worth = Activos - Pasivos
- Tendencia: como cambio vs. el mes/trimestre/ano pasado

**Trigger:** "actualiza mi patrimonio" / "cuanto vale lo que tengo"
**Output:** `brain/knowledge/finance/net-worth-[FECHA].md`

### 2. Subscription Auditor
Detecta subscripciones invisibles y su costo real anualizado:
- Lista todas las suscripciones activas
- Calcula costo mensual y anual real
- Clasifica: esencial / util / prescindible / olvidada
- Identifica donde hay overlap (pagas por lo mismo dos veces)

**Trigger:** "que suscripciones tengo" / "auditoria de gastos" / "donde se va mi dinero"
**Output:** `brain/knowledge/finance/subscriptions-[FECHA].md`

### 3. Cashflow Projector
Proyecta tu flujo de caja a 30/60/90 dias:
- Ingresos esperados (salario, inversiones, clientes)
- Gastos fijos (renta, seguros, suscripciones)
- Gastos variables (estimados)
- Alerta si el saldo proyectado cae por debajo de umbral definido

**Trigger:** "como voy el mes" / "proyeccion financiera" / "cuando me queda dinero"
**Output:** `brain/knowledge/finance/cashflow-[FECHA].md`

### 4. Tax Intelligence
Prepara para la declaracion de impuestos todo el ano:
- Tracking de gastos deducibles
- Alertas de fechas limite
- Optimizacion de deducciones por tipo de ingreso
- Resumen de Q4 planning

**Trigger:** "deducciones" / "impuestos" / "declaracion" / "tax"
**Output:** `brain/knowledge/finance/tax-[ANO].md`

### 5. Insurance Auditor
Evalua si tus coberturas son correctas:
- Lista de polizas activas con cobertura y costo
- Brechas de proteccion identificadas
- Overlap (pagas dos veces por lo mismo)
- Recomendaciones de ajuste

**Trigger:** "mis seguros" / "estoy bien cubierto" / "auditoria de seguros"
**Output:** `brain/knowledge/finance/insurance-[FECHA].md`

## Proceso

1. Leer `brain/knowledge/finance/` para contexto existente
2. Solicitar datos al usuario si no estan en el brain
3. Calcular y analizar
4. Guardar nota con frontmatter YAML
5. Sugerir siguiente accion financiera

## Reglas

- NUNCA guardar numeros reales de cuentas bancarias o tarjetas
- Los montos se guardan en rangos o porcentajes cuando son sensibles
- Si el usuario quiere guardar datos exactos, usar `brain/security/crypto.mjs write financial`
- No hacer recomendaciones de inversion especificas sin disclaimer
