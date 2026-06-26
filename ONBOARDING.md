# Axon — Guia de Onboarding para Beta Users

**Version: 0.1 · Fecha: 2026-06-26**

---

## Seccion 1 — Que es Axon

- Un sistema operativo personal impulsado por IA que vive en tu computadora, no en la nube.
- Tiene memoria persistente: recuerda lo que investigas, decides, priorizas y aprendes entre sesiones.
- Se adapta a tu vida: puedes activar solo los dominios que uses (trading, email, salud, legal, etc.).

---

## Seccion 2 — Setup en 10 minutos

### Mac / Linux

**Paso 1 — Prerequisitos**

Instala estas herramientas si no las tienes:

| Herramienta | Link | Version minima |
|-------------|------|----------------|
| Git | https://git-scm.com | cualquiera |
| Node.js | https://nodejs.org | v18 LTS o superior |
| Claude Code | https://claude.ai/code | ultima |

Verifica en terminal:
```bash
git --version
node --version   # debe mostrar v18.x o superior
claude --version
```

**Paso 2 — Descargar e instalar**

```bash
# Descarga el instalador
curl -O https://raw.githubusercontent.com/jorgelsa89/research-os-mobile-brief/main/axon-init.sh

# Correlo
bash axon-init.sh
```

El wizard te va a preguntar:
- Tu nombre
- Zona horaria
- Si quieres conectar Google Calendar
- Que dominios activar (investigacion, email, salud, trading, etc.)

**Paso 3 — Abrir tu brain en Claude Code**

```bash
cd mi-axon-brain    # (o el nombre que elegiste en el wizard)
claude .
```

**Paso 4 — Primer comando de prueba**

Dentro de Claude Code, escribe:
```
Quien soy?
```

Si Axon responde con tu nombre y zona horaria, el setup esta completo.

---

### Windows

**Paso 1 — Prerequisitos**

Instala en este orden:

| Herramienta | Link | Notas |
|-------------|------|-------|
| Git for Windows | https://git-scm.com/download/win | Incluye Git Bash |
| Node.js | https://nodejs.org | Descarga el instalador LTS (v18+) |
| Claude Code | https://claude.ai/code | Sigue las instrucciones para Windows |

Verifica abriendo **PowerShell** o **Git Bash**:
```powershell
git --version
node --version   # debe mostrar v18.x o superior
claude --version
```

**Paso 2 — Instalar con Git Bash (recomendado)**

Abre **Git Bash** (viene con Git for Windows) y ejecuta:
```bash
curl -O https://raw.githubusercontent.com/jorgelsa89/research-os-mobile-brief/main/axon-init.sh
bash axon-init.sh
```

**Alternativa: PowerShell manual**

Si prefieres PowerShell nativo, crea la estructura manualmente:
```powershell
$BrainDir = "mi-axon-brain"
$Dirs = @(
  "brain/identity", "brain/memory/short-term", "brain/memory/patterns",
  "brain/security", "brain/sync/ai-comms",
  "brain/knowledge/research", "brain/knowledge/trading", "brain/knowledge/daily",
  "brain/knowledge/email", "brain/knowledge/social", "brain/knowledge/finance",
  "brain/knowledge/health", "brain/knowledge/relationships",
  "brain/knowledge/learning", "brain/knowledge/legal",
  "brain/knowledge/creative", "brain/knowledge/business",
  "skills"
)
foreach ($d in $Dirs) { New-Item -ItemType Directory -Force -Path "$BrainDir/$d" }
Set-Location $BrainDir
git init
git add -A
git commit -m "init: Axon brain"
```

Luego descarga manualmente `axon-init.sh` desde el repo y copia el contenido de `CLAUDE.md` al directorio de tu brain.

**Paso 3 — Abrir con Claude Code**

```powershell
cd mi-axon-brain
claude .
```

**Paso 4 — Primer comando de prueba**

```
Quien soy?
```

---

## Seccion 3 — Tus primeros 5 comandos

Una vez que Claude Code este abierto en tu brain, prueba estos comandos:

---

**1. "Que hay para hoy?"** — Daily brief

Activa el skill `Daily`. Axon revisa tus prioridades, eventos pendientes y contexto reciente, y genera un brief del dia.

Output esperado:
```
Brief del 2026-06-26

Prioridades de hoy:
- [ ] (lo que tengas en brain/memory/priorities.md)

Contexto reciente:
- Ultima sesion: [fecha]

Siguiente paso sugerido: Actualiza tus prioridades para la semana.
```

---

**2. "Investiga [TICKER]"** — Research de mercados

Ejemplo: "Investiga NVDA"

Axon busca informacion reciente, genera un scorecard de 8 metricas y guarda el reporte en `brain/knowledge/research/`.

Output esperado:
```
Research: NVIDIA (NVDA) — 2026-06-26

Scorecard:
- Truth: 8.5
- Confidence: 7.0
- Edge: 6.5
- Opportunity: 8.0
- Risk: 7.5 (10 = bajo riesgo)
- Timing: 7.0
- Actionability: 8.0
- Asymmetry: 7.5

Score compuesto: 7.5 — WATCH (ambar)

Guardado en: brain/knowledge/research/NVDA-[tema]-2026-06-26.md
```

---

**3. "Muestrame mi watchlist"** — Trading

Activa el skill `Trading`. Muestra los activos que estas siguiendo con sus niveles de entrada, alertas y notas.

Output esperado:
```
Watchlist actual (brain/knowledge/trading/watchlist.md)

[ vacia — agrega tu primer ticker con "Agrega AAPL a mi watchlist" ]
```

---

**4. "Genera un post sobre [tema]"** — Social Media

Ejemplo: "Genera un post sobre los resultados de NVDA para Instagram"

Activa el skill `Social`. Crea un borrador de post con caption, hashtags y formato adaptado a la red indicada.

Output esperado:
```
Post generado: 2026-06-26-NVDA-resultados-Instagram.md

Caption: [texto del post]
Hashtags: #NVDA #Nvidia #Inversiones ...
Formato: carrusel / post simple / reels (segun lo que pidas)

Guardado en: brain/knowledge/social/
```

---

**5. "Que tengo pendiente?"** — Email triage

Activa el skill `Email`. Resume los correos sin responder, clasifica por prioridad y sugiere acciones.

Output esperado:
```
Triage de correos — 2026-06-26

Alta prioridad:
- [Remitente]: [Asunto] → Accion sugerida

Media prioridad:
- ...

Para responder con Axon: "Redacta respuesta para el correo de [Remitente]"
```

---

## Seccion 4 — Como funciona la memoria

Axon guarda todo en `brain/knowledge/`. Cada tipo de contenido tiene su carpeta:

| Carpeta | Que guarda | Como buscarlo |
|---------|-----------|---------------|
| `research/` | Investigaciones de mercados y tech | "Busca mi research de NVDA" |
| `trading/` | Watchlist, alertas, backtests | "Muestrame mi watchlist" |
| `daily/` | Briefs diarios, notas del dia | "Que hice el 2026-06-20?" |
| `email/` | Resumenes de correos (gitignored) | "Que tengo pendiente?" |
| `social/` | Borradores de posts | "Muestrame mis posts de esta semana" |
| `finance/` | Patrimonio, cashflow, suscripciones | "Como va mi cashflow?" |
| `health/` | Sintomas, rutinas, medicamentos | "Como he dormido esta semana?" |
| `relationships/` | CRM personal, seguimientos | "Que hay pendiente con [nombre]?" |
| `learning/` | Mapas de conocimiento, insights | "Que aprendi sobre opciones?" |
| `legal/` | Contratos, obligaciones, IP | "Cuando vence mi contrato con X?" |
| `creative/` | Ideas, borradores, proyectos | "Muestrame mis ideas de newsletter" |
| `business/` | Clientes, proyectos, pipeline | "Como va mi pipeline?" |

**Todas las notas tienen frontmatter YAML** con titulo, fecha, skill, tags y status. Esto permite que Axon encuentre rapidamente informacion antigua y la conecte con nueva.

**Para buscar algo especifico:**
```
"Busca todo lo que tengo sobre [tema]"
"Que decia mi research de NVDA del mes pasado?"
"Resume lo que tengo en brain/knowledge/learning/"
```

**El mapa completo** esta en `brain/knowledge/_index.md` — Axon lo actualiza cada vez que crea una nota nueva.

---

## Seccion 5 — Feedback

Esta es una beta privada. Tu feedback es la prioridad numero uno.

### Donde reportar

**GitHub Issues (preferido):**
https://github.com/jorgelsa89/research-os-mobile-brief/issues

Usa estas etiquetas:
- `bug` — algo no funciona como deberia
- `friction` — algo fue confuso o dificil de entender
- `suggestion` — idea para mejorar

**Email directo a Jorge:**
jlmanga22@gmail.com

Asunto sugerido: `[Axon Beta] [tipo de feedback] — [resumen breve]`

### Que reportar (lo mas util)

1. Donde te trabaste durante el setup
2. Un comando que escribiste y Axon no entendio
3. Una respuesta que fue incorrecta o confusa
4. Una funcion que esperabas y no existe

### Registro rapido desde el brain

```bash
# Dentro del directorio de tu brain:
echo "FRICTION [$(date +%Y-%m-%d)]: [describe el problema]" >> brain/sync/ai-comms/bitacora.md
git add -A && git commit -m "feedback: [resumen]"
```

---

*Axon Beta v0.1 · Documentacion sujeta a cambios segun el feedback del grupo.*
