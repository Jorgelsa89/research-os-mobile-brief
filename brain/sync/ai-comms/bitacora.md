# Bitacora Compartida — Claude & Codex

Canal de comunicacion entre IAs. Append-only. Ver README.md para el protocolo.

---

## 2026-06-25 CLAUDE

**Tarea:** Reorganizacion fisica del sistema Research OS / Jarvis

**Resultado:**
- `vault/` movido a `brain/knowledge/` — toda la memoria de largo plazo ahora vive dentro del cerebro
- `CLAUDE.md` actualizado con nueva arquitectura y referencias a `brain/knowledge/`
- `.gitignore` actualizado (`vault/email/` → `brain/knowledge/email/`)
- Sistema de comunicacion Claude ↔ Codex creado en `brain/sync/ai-comms/`

**Contexto:**
Jorge decidio reorganizar la arquitectura para que refleje un modelo mental de cerebro real:
- `brain/` = todo lo interno (identidad, memoria, conocimiento)
- `skills/` = capacidades externas (corteza)
- `jarvis.html` = interfaz neural entre mundo exterior y cerebro

La estructura fisica ahora coincide con la metafora del cerebro que Jorge visualiza.

**Para CODEX:**
Cuando trabajes en este proyecto, la memoria de largo plazo ya NO esta en `vault/`.
Ahora esta en `brain/knowledge/`. Actualiza cualquier referencia que tengas a rutas antiguas.
Rutas clave:
- Research: `brain/knowledge/research/`
- Trading/Watchlist: `brain/knowledge/trading/watchlist.md`
- Daily notes: `brain/knowledge/daily/`

**Proximo paso sugerido:**
Actualizar `brain.html` (visualizacion) para reflejar nueva jerarquia donde `knowledge/`
aparece como capa interna del cerebro, no como nodo separado al mismo nivel que `brain/`.

---

## 2026-06-25 CLAUDE

**Tarea:** Beta launch — onboarding de Jorge y Paola como primeros 2 usuarios

**Resultado:**
- Brain de Jorge: operativo con 12 skills, perfil completo en shared-context.md
- Template de Paola creado en `paola-template/` con 5 skills iniciales
- `BETA.md`: guia de onboarding para ambos usuarios
- Fase 0 Semana 1 completa: protocolo abierto + installer + landing page

**Para CODEX:**
El beta de 2 usuarios comenzo hoy. Si trabajas en integraciones o scripts,
coordina con jorge usando este canal. Las rutas de memoria son `brain/knowledge/`
(ya no `vault/` — eso fue cambiado esta semana).

**Proximo paso sugerido:**
Paola sigue el setup en `BETA.md`. Jorge usa el brain diariamente esta semana.
Primera iteracion: identificar el skill mas util para cada usuario.

---

## 2026-06-26 CLAUDE

**Tarea:** Google Calendar conectado + simplificacion del flujo de auth

**Resultado:**
- Conector Google Calendar operativo: `brain/sync/connectors/google-calendar/`
- `auth.mjs` reescrito: abre browser automaticamente, encripta tokens inline con AES-256-GCM, sin dependencia de crypto.mjs
- `calendar.mjs` actualizado: lee `tokens.enc` directamente con misma clave derivada (PBKDF2 + SHA-512)
- `.gitignore` actualizado: `tokens.enc` protegido
- Jorge puede decirle a Axon "agrega al calendario" y ejecuta directamente

**Para CODEX:**
El conector de Google Calendar esta activo en `brain/sync/connectors/google-calendar/`. Los tokens estan en `tokens.enc` (gitignored). Para operaciones de calendario usa el CLI del conector, no accedas al archivo directamente.

**Proximo paso sugerido:**
- Conectar Gmail para cerrar el loop de email
- Fase 0 Semana 2: onboarding con 5 beta users adicionales

---

## 2026-06-26 CLAUDE

**Tarea:** Capacidades de auto-mejora — crear skills, entrenar, y limpieza de consistencia

**Resultado:**
- **Gmail connector** (`brain/sync/connectors/gmail/`): auth + CLI (list/read/unread/triage/send) via Gmail REST API, mismo patron de encriptacion que Calendar
- **Dashboard en vivo** (`dashboard.html` + `serve.mjs` extendido): 6 paneles que leen el brain via `/api/brain/*` en tiempo real. Verificado funcionando.
- **Skill Creator** (`skills/skill-creator/`): meta-skill + `scaffold.mjs` ejecutable que genera skills nuevos con formato canonico. PROBADO: crea SKILL.md valido, lessons.md, y carpeta en brain/knowledge.
- **Trainer** (`skills/trainer/` + `brain/memory/training/`): cierra el loop Uso→Leccion→Patron→Mejora. Incluye feedback-protocol, training-log, skill-scores (madurez de los 12 skills).
- **Estandar canonico** (`skills/_TEMPLATE/SKILL.md`): formato unico para todos los skills
- **Limpieza**: branding Cortex→Jarvis/Axon corregido en 7 skills; frontmatter unificado en los 12 skills (todos con skill/version/domain/triggers/output/status)
- **ONBOARDING.md** + BETA.md actualizado (7 slots, friction log)

**Para CODEX:**
Ahora Axon puede crear sus propios skills y entrenarse. Para crear un skill: `node skills/skill-creator/scaffold.mjs <nombre> "<dominio>" "<triggers>"`. Para el loop de aprendizaje, lee `brain/memory/training/README.md`. El formato canonico de todo skill esta en `skills/_TEMPLATE/SKILL.md` — respetalo si creas skills.

**Proximo paso sugerido:**
- Correr el primer ciclo real de entrenamiento ("entrena")
- Conectar broker API (Schwab/thinkorswim) para Robin Hood Agent
- Fase 1 monetizacion: dashboard como producto

---

## 2026-06-30 CLAUDE

**Tarea:** North Star grabado + arranque de un solo paso (eliminar friccion)

**Resultado:**
- **`brain/memory/north-star.md`**: la mision de Axon grabada como norte permanente.
  Jarvis la lee al inicio de cada sesion. Regla de oro: resolver, probar, mostrar.
- **`axon.mjs`**: launcher de UN comando. Reemplaza los 5-6 pasos manuales que Jorge
  sufrio (cd, git stash, git pull, pop, renombrar). Auto-ubica raiz, verifica Node 18+,
  sincroniza con auto-stash, detecta conectores configurados, arranca dashboard.
  PROBADO desde otra carpeta: funciona end-to-end.
- **`Axon.bat` / `Axon.command`**: doble-click para Windows/Mac (sin abrir terminal).
- `CLAUDE.md` + `ONBOARDING.md` actualizados con el arranque de un paso.

**Por que:** El goal de Jorge (north-star punto 2) exige "facil para humanos, no para
ingenieros — un click, no diez comandos". Esta es la primera ejecucion directa hacia
ese norte: la friccion de onboarding que el vivio en vivo, eliminada.

**Para CODEX:**
El arranque oficial ahora es `node axon.mjs` (o doble-click en Axon.bat/.command).
Si agregas conectores, registralos en el array `connectors` de `axon.mjs` para que
el launcher los detecte automaticamente.

**Proximo paso sugerido:**
- Auto-brief al arrancar (que "que hay para hoy" se dispare solo al iniciar)
- Onboarding de Paola + 5 beta users con el nuevo flujo de un click

---

## 2026-06-30 CLAUDE

**Tarea:** Auto-brief + instalador que entrega producto funcional (no cascaron)

**Resultado:**
- **`brain/brief.mjs`**: auto-brief que compila tu dia desde el cerebro sin pedir
  contrasena (research, watchlist, pendientes). Lee el nombre del dueño de
  shared-context.md → funciona para cualquier persona, no solo Jorge.
- **`axon.mjs`**: ahora muestra el auto-brief al arrancar. Doble-click = tu dia.
- **`axon-init.sh` ARREGLADO (bug critico de producto):** antes creaba un brain con
  carpetas VACIAS — sin skills, sin launcher, sin crypto. Un usuario nuevo recibia
  un cascaron inutil. Ahora copia: skills activados + meta-skills (skill-creator,
  trainer, _TEMPLATE) + axon.mjs + brief.mjs + crypto.mjs + serve.mjs + dashboard +
  Axon.bat/.command + conectores (sin tokens). Detecta su fuente (repo local o
  git clone temporal en modo curl). Arreglado tambien el exit code 1 del trap.
- **PROBADO end-to-end:** instale un brain de "MariaTest" desde cero, EXIT 0, y el
  usuario nuevo pudo correr `node axon.mjs` con skills reales operativos.

**Por que:** El goal exige que "cualquier persona" tenga un cerebro que actue por
ella. El instalador roto entregaba carpetas vacias — el camino de cualquier persona
estaba roto. Ahora entrega un producto funcional desde el minuto cero.

**Para CODEX:**
El instalador oficial copia assets desde el repo. Si agregas un skill o conector
nuevo al repo, el instalador lo incluira automaticamente (skills activados por el
usuario + todo lo de skills/_TEMPLATE, skill-creator, trainer).

**Proximo paso sugerido:**
- Onboarding real de Paola con el instalador arreglado
- Monetizacion: empaquetar el dashboard como producto

---
