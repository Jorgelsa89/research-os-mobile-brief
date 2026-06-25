---
title: "Cortex Personal AI OS — Technical & Business Roadmap"
date: 2026-06-25
version: 1.0
status: activo
---

# CORTEX — Roadmap Tecnico y de Negocio

## Estado Actual (Baseline)

```
Lo que existe hoy:
  ✅ brain/ — cerebro digital con memoria persistente
  ✅ skills/ — 5 modulos especializados (research, trading, email, social, daily)
  ✅ brain/knowledge/ — conocimiento acumulado (antes vault/)
  ✅ jarvis.html — interfaz de voz con Ollama local
  ✅ index.html — PWA mobile con scorecard y watchlist
  ✅ brain.html — visualizacion del sistema
  ✅ AES-256-GCM — encriptacion de identidad
  ✅ Claude ↔ Codex — sistema de comunicacion entre IAs
  ✅ GitHub Pages — deployment publico

Lo que falta para ser un producto:
  ❌ Onboarding para usuarios nuevos
  ❌ Dashboard web
  ❌ Sync entre dispositivos
  ❌ Skills marketplace
  ❌ Integraciones reales (APIs de mercado, email, calendario)
  ❌ Cortex funcionando de forma autonoma (sin que el usuario lo active)
```

---

## FASE 0 — Consolidacion (Semanas 1-4) · Sin codigo nuevo

**Objetivo:** Solidificar lo que existe. Documentar el protocolo. Preparar para primeros beta users.

### Semana 1: Limpieza y documentacion
- [ ] Documentar el protocolo brain/ como spec publica (`BRAIN-PROTOCOL.md`)
- [ ] Escribir `CONTRIBUTING.md` para developers de skills
- [ ] Crear demo video de 90 segundos (Cortex generando un brief de NVDA)
- [ ] Landing page minimal en GitHub Pages

### Semana 2: Installer
- [ ] `cortex-init.sh` — script que clona el template y configura el cerebro inicial
- [ ] Wizard de onboarding en CLI: "Quien eres? Que dominios quieres activar?"
- [ ] Template de brain/ para nuevos usuarios (sin datos de Jorge)

### Semana 3: Testing con 5 usuarios
- [ ] Reclutar 5 beta users del circulo cercano
- [ ] Documentar friction points del onboarding
- [ ] Iterar en base a feedback real

### Semana 4: Metrics baseline
- [ ] Definir las metricas que van a importar: sesiones/semana, skills usados, retention
- [ ] Implementar logging anonimizado opt-in
- [ ] Preparar informe de fase 0

**Exit criteria:** 5 personas pueden instalar y usar Cortex sin ayuda de Jorge.

---

## FASE 1 — Producto (Meses 1-3) · El MVP real

**Objetivo:** Algo que la gente pague. $10K MRR.

### Mes 1: Skills expansion (8 nuevos skills)

**Finance skills:**
```
skills/finance/
  SKILL.md              ← CFO Personal
  net-worth-template.md
  subscription-audit-template.md
  cashflow-template.md
```

**Health skills:**
```
skills/health/
  SKILL.md              ← Symptom Journal + Fitness + Sleep
  symptom-template.md
  fitness-template.md
  sleep-template.md
```

**Relationships skills:**
```
skills/relationships/
  SKILL.md              ← Personal CRM + Network Intelligence
  contact-template.md
  relationship-health-template.md
```

**Learning skills:**
```
skills/learning/
  SKILL.md              ← Learning Accelerator + Spaced Repetition
  topic-map-template.md
  review-schedule-template.md
```

### Mes 2: Dashboard web

Un solo-page dashboard en `dashboard.html`:
```
┌─────────────────────────────────────────────────────┐
│  CORTEX · [nombre del usuario]                      │
│                                                     │
│  🧠 Brain Health                                    │
│  847 knowledge nodes · 23 skills · ✅ encrypted     │
│                                                     │
│  📊 Active Skills    │  📅 Today                   │
│  Research · Trading  │  3 briefs generados          │
│  Finance · Health    │  2 alertas pendientes        │
│  Email · Social      │  NVDA: $127.40 (+2.1%)       │
│                                                     │
│  🔔 Cortex Says:                                    │
│  "MSFT reporta earnings manana. Quieres brief?"     │
└─────────────────────────────────────────────────────┘
```

### Mes 3: Monetizacion

- [ ] Stripe integration para Pro ($29/mes)
- [ ] Feature flags: Free vs. Pro vs. Team
- [ ] Email de bienvenida y onboarding sequence
- [ ] Pagina de pricing publica

**Exit criteria:** $10K MRR. 50 usuarios Pro activos. Churn < 5%.

---

## FASE 2 — Plataforma (Meses 3-9) · Integraciones reales

**Objetivo:** Cortex se conecta con el mundo exterior automaticamente.

### Los conectores que cambian todo

#### Conector 1: Market Data (Mes 4)
```javascript
// Cortex Live — actualiza brain/knowledge/trading/watchlist.md en tiempo real
cortex.connect('polygon.io', {
  tickers: brain.knowledge.trading.watchlist,
  alerts: brain.knowledge.trading.alertas,
  onAlert: (alert) => cortex.notify(alert) + cortex.prepareResearch(alert.ticker)
})
```

**Que hace:** Watchlist se actualiza sola. Cortex te avisa cuando algo cruza tu precio objetivo y ofrece generar el brief automaticamente.

#### Conector 2: Email (Mes 4-5)
```javascript
cortex.connect('gmail', {
  rules: skills.email.triageRules,
  onNewEmail: (email) => cortex.triage(email) + cortex.draftResponse(email),
  dailySummary: '07:00'
})
```

**Que hace:** Triage automatico cada manana. Cortex lee, clasifica, sugiere respuestas. Tu solo apruebas.

#### Conector 3: Calendar (Mes 5)
```javascript
cortex.connect('google-calendar', {
  onMeeting: (meeting) => cortex.prepareMeetingBrief(meeting, {
    attendees: brain.knowledge.relationships,
    context: brain.knowledge.projects
  })
})
```

**Que hace:** 30 minutos antes de cada reunion, Cortex prepara un brief: quien es cada persona, historial de conversaciones, lo que prometiste, lo que quieres lograr.

#### Conector 4: Broker API (Mes 6-7)
```javascript
cortex.connect('schwab', {
  mode: 'read-only',
  onSync: (portfolio) => cortex.updateKnowledge('trading/portfolio', portfolio),
  alerts: brain.knowledge.trading.alertas
})
```

**Que hace:** Portfolio real en brain/knowledge/trading/. Cortex puede hacer analisis real porque tiene los numeros reales.

#### Conector 5: News & Research (Mes 7-8)
```javascript
cortex.connect('newsapi', {
  filters: brain.identity.interests + brain.knowledge.trading.watchlist,
  onRelevantNews: (news) => cortex.briefIfSignificant(news)
})
```

**Que hace:** Cortex lee las noticias pero solo te interrumpe si algo es realmente relevante para TI especificamente.

### La Feature Killer de Esta Fase: Cortex Overnight

```
22:00 Jorge duerme.

22:01 Cortex empieza a trabajar:
  → Lee noticias financieras
  → Actualiza watchlist con precios de cierre
  → Revisa inbox de email
  → Prepara brief del dia siguiente
  → Detecta si hay earnings de empresas en watchlist
  → Prepara research de los tickers con movimientos significativos

07:00 Jorge se despierta.

07:01 Notificacion de Cortex:
  "Buenos dias. Aqui el brief:
   • NVDA subio 8.2% after-hours (earnings). Brief listo.
   • 3 correos urgentes. Respuestas sugeridas preparadas.
   • Reunion con cliente a las 10am. Brief de prep listo.
   • 1 alerta de watchlist: MSFT cruzo $415 (tu precio objetivo)."
```

**Exit criteria:** $100K MRR. Churn < 3%. 3 conectores activos con 500+ usuarios.

---

## FASE 3 — Escala (Meses 9-18) · Verticales enterprise

**Objetivo:** Cortex se convierte en infraestructura para knowledge workers profesionales.

### Vertical 1: Cortex Research (Inversores)
**Precio:** $99/mes Pro · $499/mes Team
**Features exclusivas:**
- Scorecard de 8 metricas como estandar de la industria
- Deal flow tracking con brain persistente
- Comparte research briefs con tu equipo sin perder contexto
- Backtesting integrado con datos historicos
- Earnings calendar automatico con prep briefs

**Canal de adquisicion:** FinTwit, Seeking Alpha, comunidades de Discord de trading

### Vertical 2: Cortex Operations (Solopreneurs & Equipos)
**Precio:** $49/mes Pro · $25/user/mes Team (min 5)
**Features exclusivas:**
- Client intelligence (contexto completo antes de cada interaccion)
- Project OS (status, blockers, entregables de todos tus proyectos)
- Revenue tracker (lo que te deben, automatizacion de cobros)
- Hiring intelligence (candidatos, entrevistas, decisiones)

**Canal de adquisicion:** Product Hunt, Indie Hackers, Twitter/X creadores

### Vertical 3: Cortex Enterprise
**Precio:** $500-5,000/mes por equipo
**Features exclusivas:**
- On-premise deployment
- Custom skills development
- Compliance y audit trails
- SSO + LDAP
- SLA garantizado 99.9%
- Dedicated customer success

**Canal de adquisicion:** Directo, relaciones, referidos de usuarios Pro

---

## FASE 4 — Vision (Anos 2-3) · El OS Real

### Skills Marketplace
Cualquier developer puede crear y publicar skills:
```
cortex publish skill ./skills/myskill
# → Publicado en marketplace.cortex.ai
# → 70% revenue para el developer
# → Instalable en cualquier brain Cortex
```

**Ejemplos de skills de terceros:**
- Skill de Carta (cap table management para founders)
- Skill de PubMed (literatura medica para doctores)
- Skill de Bloomberg (datos financieros para traders institucionales)
- Skill de Clio (gestion de casos para abogados)
- Skill de HubSpot (CRM para equipos de ventas)

### Cortex Intelligence Layer
**Opt-in, anonimizado, poderoso:**
```
1,000 inversores en Cortex investigan NVDA esta semana
→ Cortex detecta el patron (sin ver datos individuales)
→ Alerta anonimizada: "Alta actividad de research en NVDA esta semana"
→ Eso es una senal que Bloomberg no tiene
```

### Personal Model Fine-Tuning
```
Tu brain de 2 anos entrena un modelo personal:
  → Aprende como escribes
  → Aprende como tomas decisiones
  → Aprende que informacion te importa
  → Genera contenido en tu voz, toma decisiones como tu
```

Esto NO sube tus datos. El fine-tuning ocurre localmente o en un enclave seguro. El modelo resultante es tuyo.

### Cortex Legacy
```
Configuracion de legado digital:
  → Si no accedes en 180 dias, ejecutar protocolo de legado
  → Transferir acceso a persona designada
  → Archivar brain con timestamp inmutable
  → Exportar "memorias esenciales" para herederos (opt-in)
```

---

## Stack Tecnico Recomendado

### Frontend
- **PWA** (ya existe) para mobile
- **Svelte** o **Solid.js** para dashboard — rapido, minimal
- **Canvas 2D** para visualizaciones (ya existe en brain.html)

### Backend (cuando sea necesario)
- **Node.js** + **Fastify** — ligero, rapido
- **SQLite** para metadata local
- **Postgres** para features cloud (sync, marketplace)
- **Redis** para rate limiting y cache

### AI Layer
- **Claude API** (Anthropic) — razonamiento, research, escritura
- **Ollama** — modelos locales para privacidad maxima
- **Embeddings** (Xenova/transformers.js) — busqueda semantica local

### Sync & Storage
- **CRDT** (Y.js o Automerge) — sync sin conflictos
- **Encrypted S3** — backup en la nube con zero-knowledge
- **Git** (ya existe) — historial de versiones del brain

### Integraciones
- **OAuth 2.0** para Gmail, Calendar, Broker APIs
- **Webhooks** para alertas en tiempo real
- **Zapier/Make webhooks** para automatizaciones sin codigo

### Seguridad
- **AES-256-GCM** (ya existe) para datos en reposo
- **TLS 1.3** para datos en transito
- **PBKDF2 SHA-512** para derivacion de llaves
- **Zero-knowledge proofs** para el intelligence layer (futuro)

---

## Metricas Clave por Fase

| Metrica | Fase 0 | Fase 1 | Fase 2 | Fase 3 |
|---------|--------|--------|--------|--------|
| Usuarios activos | 5 beta | 500 | 5,000 | 50,000 |
| MRR | $0 | $10K | $100K | $1M |
| Skills en uso | 5 | 12 | 30 | 50+ |
| Churn mensual | N/A | <5% | <3% | <2% |
| NPS | 70+ | 75+ | 80+ | 85+ |
| Conectores activos | 0 | 0 | 3 | 10+ |

---

## Fundraising Path

### Pre-seed (Ahora → $10K MRR)
- Bootstrapped o friends & family
- $150-300K si se necesita
- Para: equipo minimo (1 dev + Jorge), infra, marketing
- Valuacion: $1-2M

### Seed ($10K → $100K MRR)
- YC, a16z Seed, angels estrategicos
- $1-3M
- Para: equipo (5-8 personas), growth, conectores
- Valuacion: $10-15M

### Serie A ($100K MRR → escala enterprise)
- VCs tradicionales
- $5-15M
- Para: enterprise sales, marketplace, intelligence layer
- Valuacion: $50-100M

---

## El Equipo Ideal

| Rol | Cuando | Por que |
|-----|--------|---------|
| Jorge (CEO/Product) | Ahora | La vision, el producto, las relaciones |
| CTO / Lead Dev | Fase 1 | Convierte el concepto en producto escalable |
| Head of Growth | Fase 1-2 | Adquisicion y retention |
| AI Engineer | Fase 2 | Conectores, intelligence layer, fine-tuning |
| Enterprise Sales | Fase 3 | El vertical enterprise no se cierra solo |
| Head of Community | Fase 2 | El marketplace vive o muere por la comunidad |
