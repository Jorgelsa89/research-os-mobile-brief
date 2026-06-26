---
title: "Axon — Technical Specification & Data Architecture"
date: 2026-06-25
version: 1.0
status: activo
---

# Axon — Especificacion Tecnica

## Arquitectura de Datos: La Regla Zero-Compromise

La tension central de Axon: **privacidad radical vs. integraciones en tiempo real.**

La resolucion: **datos de primera clase nunca salen del dispositivo. Los conectores son puentes, no silos.**

```
                    ┌─────────────────┐
                    │  MUNDO EXTERIOR  │
                    │  Gmail, Broker,  │
                    │  Calendar, News  │
                    └────────┬────────┘
                             │ OAuth tokens
                             │ (solo en device)
                    ┌────────▼────────┐
                    │  AXON BRIDGE  │ ← Corre en tu dispositivo
                    │  (Node.js local)│   NUNCA en nuestros servers
                    │                 │
                    │  Lee API → procesa
                    │  localmente → escribe
                    │  a brain/knowledge/
                    └────────┬────────┘
                             │ Markdown encriptado
                    ┌────────▼────────┐
                    │  BRAIN LOCAL    │ ← Tus archivos, tu dispositivo
                    │  brain/         │
                    └─────────────────┘
```

**Lo que NUNCA toca nuestros servidores:**
- Contenido de tus emails
- Datos de tu portfolio
- Notas de salud o relaciones
- Conversaciones con IAs
- Tokens de OAuth (se guardan encriptados localmente)

**Lo que SÍ puede tocar nuestros servidores (con tu permiso):**
- Metadata anonimizada: "cuantos skills usa el usuario", "con que frecuencia"
- Sync encriptado E2E entre tus propios dispositivos
- En el futuro: modelos fine-tuned en enclaves seguros (SGX/TrustZone)

---

## Como Funciona "Axon Overnight"

"Axon trabaja mientras duermes" no es magia — es un scheduler local:

```javascript
// axon-scheduler.js — corre como proceso de background
// Activado al iniciar el OS del usuario, como cualquier app de menubar

const schedule = {
  '22:00': ['news-digest', 'email-triage'],
  '06:30': ['morning-brief', 'watchlist-update', 'calendar-prep'],
  'on-price-alert': ['generate-research-brief'],
  'on-new-email': ['triage-and-draft']
}
```

**Que modelos corren:**
- **Ollama local** (qwen3:8b o llama3.2:3b) para procesamiento nocturno sin costo
- **Claude API** solo cuando el usuario pide output de alta calidad
- Estimacion de costo: <$0.10/dia en API calls con uso inteligente

**Requisito hardware:**
- Mac M1/M2/M3: Ollama corre sin GPU, 3-8 tokens/segundo, suficiente
- Windows con RTX: Excelente, rapido
- Windows sin GPU: Ollama funciona en CPU, lento pero funcional
- Mobile (iOS/Android): Axon Overnight no disponible, brief se genera en la manana al abrir la app

**Lo que pasa mientras duermes:**
```
22:00 Axon inicia ciclo nocturno
  → Llama a NewsAPI con filtros de brain/knowledge/trading/watchlist.md
  → Procesa con Ollama local (sin costo de API)
  → Guarda solo lo relevante en brain/knowledge/daily/[FECHA].md
  → Si encuentra noticia critica de ticker en watchlist: genera brief con Claude API

06:30 Genera morning brief
  → Lee notas nuevas en brain/knowledge/
  → Lee calendar via OAuth (local)
  → Compila brain/knowledge/daily/[FECHA]-morning.md
  → Notificacion push al dispositivo

Sin una sola linea de tus datos en nuestros servidores.
```

---

## Pricing: Una Sola Estrategia

**Decision:** Pricing por capacidad del brain, no por vertical.

Las versiones de verticales (Axon Research, Axon Operations) son **marketing frames** del mismo producto — no versiones separadas. Simplifican la comunicacion, no la arquitectura.

| Plan | Precio | Brain | Skills | Sync | AI Models | Support |
|------|--------|-------|--------|------|-----------|---------|
| **Free** | $0 | 100 notas | 3 skills | Local only | Ollama only | Community |
| **Pro** | $29/mes | Ilimitado | Todos (50+) | E2E encrypted | Ollama + Claude | Email 48h |
| **Team** | $19/user/mes | Compartido | Todos + custom | E2E encrypted | Ollama + Claude | Email 24h |
| **Enterprise** | $500+/mes | On-premise | Custom | On-premise | Any model | Dedicated |

**Por que $29 y no $49 o $99:**
- Benchmark vs. competencia: Notion AI ($10), Mem.ai ($14.99), Obsidian Sync ($10)
- Axon es 3-5x el valor (multi-AI, mas skills, encriptacion, mas integraciones)
- Pero el usuario necesita convencerse antes de pagar 3x — $29 reduce friccion de prueba
- Increase a $49 en Fase 2 cuando los conectores esten activos

---

## Arquitectura de Conectores: Privacidad by Design

Cada conector sigue el mismo patron:

```javascript
class AxonConnector {
  constructor(service, oauthConfig) {
    // Token nunca sale del dispositivo
    this.token = localKeychain.get(service)
    this.brain = localBrain.open()
  }

  async sync() {
    // 1. Fetch desde API del servicio (en tu dispositivo)
    const raw = await this.fetch()

    // 2. Procesar localmente con modelo local o prompt minimo a Claude
    const processed = await localModel.process(raw, this.skillRules)

    // 3. Escribir al brain LOCAL
    await this.brain.write(processed)

    // 4. Nada mas. Sin telemetria. Sin upload.
  }
}
```

**Modelo de consentimiento:**
- Cada conector requiere aprobacion explicita ("Conectar Gmail")
- Se muestra exactamente que permisos se solicitan y por que
- Se puede desconectar con un click (revoca tokens, borra datos cacheados)
- Modo "read-only" por defecto (Axon nunca envia emails por su cuenta)
- Modo "draft" (Axon propone, tu apruebas)
- Modo "auto" (solo disponible para acciones de bajo riesgo, con audit trail)

---

## Competitive Landscape

| Herramienta | Que hace bien | Por que Axon gana |
|-------------|--------------|-------------------|
| **Notion AI** | Edicion de documentos, bases de datos | Sin memoria persistente de identidad, no multi-AI, no encriptado |
| **Mem.ai** | Memoria automatica de conversaciones | Sin skills especializados, sin identidad encriptada, un solo modelo |
| **Obsidian + plugins** | PKM tecnico, local-first | Setup complejo, no agentico, no multi-AI, no conectores nativos |
| **Personal.ai** | Chat con memoria | Consumer-grade, sin skills, sin integraciones reales, sin encriptacion |
| **Rewind AI** | Graba todo en pantalla | Privacidad cuestionable, pasivo (no actua), costoso en storage |
| **ChatGPT Memory** | Recuerda preferencias simples | Lock-in a OpenAI, memoria superficial, sin estructura, sin encriptacion |

**Por que nadie puede copiar el moat real:**
El moat no es la tecnologia. Es el **grafo de conocimiento personal acumulado**.

Despues de 6 meses de uso activo, tu brain tiene:
- 500+ notas conectadas con wikilinks
- Patrones de decision documentados
- Historial de research con scores
- Contexto de relaciones con decenas de personas
- Historial financiero y de salud

Ninguna herramienta puede importar ese grafo. Puedes exportar los archivos markdown — pero el sistema de conexiones, las convenciones, el historial — eso es unico. Y se vuelve mas valioso cada mes.

Eso es lock-in positivo: no porque no puedas salir, sino porque no quieres.

---

## Liability Framework para Skills Sensibles

**El problema:** Los skills de health, legal, y finance tocan dominios regulados.

**La solucion:** Tres capas de proteccion.

**Capa 1: Framing correcto**
Axon no es un medico, abogado, o asesor financiero. Es un sistema de organizacion de informacion personal. Cada output de skill sensible incluye disclaimer visible.

**Capa 2: Lenguaje de output**
- Health: "Registrado: dolor de cabeza 7/10 por 2 horas. Patron detectado: 3 veces en 2 semanas. Considera mencionarlo en tu proxima consulta." — No diagnostica.
- Legal: "Este contrato incluye clausula de renovacion automatica a 90 dias. Consulta con tu abogado antes de firmar." — No asesora.
- Finance: "Tu cashflow proyectado para julio muestra deficit de $X. Considera revisar con un asesor." — No recomienda inversiones.

**Capa 3: Terms of Service**
- Uso informativo, no sustituto de profesionales
- Axon no almacena datos de salud en servidores (HIPAA compliance no aplica porque no hay datos en servidor)
- Skills de terceros en marketplace requieren certification de que siguen el mismo framework

---

## Inteligencia Colectiva: Spec Real

**No es vaporware si lo especificamos:**

```
Mecanica real (sin differential privacy formal en MVP):

1. Usuario A investiga NVDA (opt-in activado)
   → Axon registra LOCALMENTE: {ticker: "NVDA", timestamp: "2026-06-25", skill: "research"}

2. Cada semana, Axon envia al servidor (solo si opt-in):
   → {tickers_investigated: ["NVDA", "MSFT", "AMD"], count: 5, week: "2026-W26"}
   → SIN contenido de notas. SIN scores. SIN razonamiento.

3. Servidor agrega de todos los usuarios opt-in:
   → "Esta semana, 847 usuarios investigaron NVDA"
   → Signal publicada como "Axon Research Pulse" (feature Pro)

4. Protecciones:
   → Minimo 100 usuarios para publicar un signal (evita re-identificacion)
   → Usuarios opt-in reciben el signal primero (24h antes)
   → No se vende a terceros nunca
   → Auditable: usuario puede ver exactamente que metadata envio
```

Esto NO es federated learning ni zero-knowledge proofs. Es simple agregacion de metadata con protecciones basicas. Lo importante: es honesto sobre lo que es.
