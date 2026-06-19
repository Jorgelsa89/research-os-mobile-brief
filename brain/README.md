# Brain — Cerebro Digital Personal

## Como funciona un cerebro real (y como lo replicamos)

Un cerebro humano tiene capas especializadas. Este sistema las replica:

```
CEREBRO HUMANO                    CEREBRO DIGITAL
─────────────────                 ─────────────────────────────
Corteza prefrontal                brain/memory/short-term/
  (memoria de trabajo)              → Contexto de la sesion activa
                                     Se limpia al cerrar

Hipocampo                         vault/daily/ + vault/research/
  (memoria episodica)               → Eventos, investigaciones
                                     Que paso y cuando

Neocortex                         vault/ (todo el vault)
  (memoria semantica)               → Hechos, conocimiento acumulado
                                     Lo que sabes

Cerebelo                          brain/memory/patterns/
  (memoria procedimental)           → Como haces las cosas
                                     Preferencias aprendidas

Amigdala                          brain/memory/priorities.md
  (sistema de prioridades)           → Que te importa mas
                                     Valores y prioridades

Identidad / Self                  brain/identity/ (ENCRIPTADO)
  (quien eres)                       → Datos personales, cuentas
                                     Cifrado AES-256-GCM
```

## Estructura del cerebro

```
brain/
├── identity/                    ← ENCRIPTADO: datos personales
│   ├── profile.json.enc         ← Info personal cifrada
│   ├── credentials.json.enc     ← Passwords, API keys cifrados
│   ├── financial.json.enc       ← Tarjetas, cuentas cifradas
│   └── contacts.json.enc        ← Contactos importantes cifrados
│
├── memory/
│   ├── short-term/              ← Contexto de sesion (temporal)
│   │   └── current-session.md   ← Que estamos haciendo ahora
│   ├── patterns/                ← Patrones detectados
│   │   ├── decisions.md         ← Como toma decisiones Jorge
│   │   ├── communication.md     ← Como se comunica Jorge
│   │   └── workflow.md          ← Flujos de trabajo preferidos
│   ├── preferences.md           ← Preferencias aprendidas
│   ├── priorities.md            ← Sistema de prioridades
│   └── growth-log.md            ← Crecimiento y aprendizaje
│
├── sync/
│   ├── shared-context.md        ← Contexto compartido entre proyectos
│   ├── session-log.md           ← Registro de todas las sesiones
│   └── cross-project.md         ← Conexiones entre proyectos
│
├── security/
│   └── crypto.mjs               ← Utilidad de encriptacion AES-256
│
└── README.md                    ← Este archivo
```

## Seguridad: Como funciona la encriptacion

Similar a WhatsApp: los datos se cifran con AES-256-GCM usando una clave
derivada de tu contrasena maestra (PBKDF2 con 100,000 iteraciones).

1. Tu defines una contrasena maestra (solo tu la conoces)
2. La contrasena genera una clave de cifrado via PBKDF2
3. Cada archivo se cifra con su propio IV (vector de inicializacion)
4. Ni el sistema ni la AI pueden leer los datos sin la contrasena
5. Para usar datos sensibles, tu desbloqueas con la contrasena
6. Los datos descifrados solo existen en memoria, nunca en disco

```
TU CONTRASENA
     │
     ▼
   PBKDF2 (100,000 iteraciones)
     │
     ▼
   CLAVE AES-256
     │
     ├──► Cifrar: datos + IV aleatorio → archivo .enc
     │
     └──► Descifrar: archivo .enc + IV → datos en memoria
                                          (nunca en disco)
```

## Aprendizaje: Como el cerebro aprende de ti

Cada interaccion alimenta tres sistemas:

1. **Patrones:** El sistema detecta como tomas decisiones, como te comunicas,
   y que flujos de trabajo prefieres. Esto se guarda en `memory/patterns/`.

2. **Preferencias:** Cuando corriges una respuesta o eliges una opcion,
   se registra en `memory/preferences.md`. Con el tiempo, el sistema
   anticipa lo que quieres.

3. **Crecimiento:** `memory/growth-log.md` registra nuevos temas que aprendes,
   habilidades que desarrollas, y como evoluciona tu conocimiento.

## Memoria compartida entre proyectos

Todos los proyectos AI (Claude Code, otros agentes) leen y escriben en:
- `brain/sync/shared-context.md` — Resumen de quien eres y que estas haciendo
- `brain/sync/session-log.md` — Registro de sesiones pasadas
- `brain/sync/cross-project.md` — Como se conectan tus proyectos

Cuando inicias un proyecto nuevo, el AI lee `shared-context.md` y ya sabe
quien eres, que has hecho, y que te importa.
