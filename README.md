# Axon — Tu cerebro digital

> Un asistente personal con IA que vive en tu computadora, te conoce, actua por ti,
> y crece contigo. Local-first, privado, y tuyo.

Axon convierte a Claude Code en un asistente personal con memoria persistente.
Toda tu informacion vive en archivos markdown en tu maquina — sin nube, sin
telemetria, sin que nadie mas la vea.

## Arranque rapido

```bash
node axon.mjs          # o doble-click en Axon.bat (Windows) / Axon.command (Mac)
```

Eso sincroniza, verifica tu entorno, detecta tus conectores, te da tu brief del
dia, y arranca el dashboard. Un solo paso.

Para instalar desde cero (cualquier persona):

```bash
bash axon-init.sh      # wizard interactivo que crea tu brain personalizado
```

## Que puede hacer

Hablas con Claude Code en lenguaje natural. Axon entiende y actua:

- **"investiga NVDA"** → analisis completo con scorecard de 8 metricas
- **"que hay para hoy"** → brief del dia con calendario, correo, watchlist y pendientes
- **"agrega reunion el viernes 3pm"** → lo escribe en tu Google Calendar
- **"revisa mis correos"** → triage de Gmail (urgente / informativo / seguimiento)
- **"crea un skill para X"** → genera una habilidad nueva en segundos
- **"entrena"** → revisa lo aprendido y mejora sus propias reglas

## Arquitectura

```
brain/          ← el cerebro: identidad, memoria, conocimiento
  identity/     ← datos personales cifrados (AES-256-GCM)
  memory/       ← preferencias, patrones, north-star, training
  knowledge/    ← todo lo que acumulas (research, trading, daily...)
  sync/         ← conectores (Calendar, Gmail) y comunicacion entre IAs
skills/         ← las habilidades (corteza): 12 dominios + meta-skills
monetize/       ← sistema de licencias local-first
CLAUDE.md       ← el cerebro central que orquesta todo
```

## Skills

**Core:** research · trading · email · social · daily
**Expansion:** finance · health · relationships · learning · legal · creative · business
**Meta:** skill-creator (crea skills) · trainer (aprende y mejora)

## Conectores

- **Google Calendar** — leer y crear eventos (`brain/sync/connectors/google-calendar/`)
- **Gmail** — leer, triage y enviar (`brain/sync/connectors/gmail/`)

Los tokens se guardan cifrados localmente y nunca se suben a GitHub.

## Planes

| Plan | Precio | Incluye |
|------|--------|---------|
| Free | $0 | 3 skills core, dashboard, 100% local |
| Pro | $29/mes | Los 12 skills, conectores, auto-brief, crear/entrenar skills |
| Team | $19/usuario/mes | Todo Pro + multi-usuario, brain compartido |
| Enterprise | Custom | Verticales, fine-tuning, on-premise, SLA |

Las licencias se firman criptograficamente y se validan offline — sin servidor.
Ver [`MONETIZATION.md`](MONETIZATION.md) y [`pricing.html`](pricing.html).

## Documentacion

- [`CLAUDE.md`](CLAUDE.md) — como piensa y opera Axon
- [`BRAIN-PROTOCOL.md`](BRAIN-PROTOCOL.md) — especificacion del formato
- [`ONBOARDING.md`](ONBOARDING.md) — guia para nuevos usuarios
- [`AXON-VISION.md`](AXON-VISION.md) · [`AXON-ROADMAP.md`](AXON-ROADMAP.md) — la startup
- [`brain/memory/north-star.md`](brain/memory/north-star.md) — la mision

## Privacidad

- Todo es local. Tu informacion no sale de tu maquina.
- Datos sensibles cifrados con AES-256-GCM (`brain/security/crypto.mjs`).
- Sin telemetria, sin tracking, sin servidor que valide tu licencia.

---

*El dashboard movil original (PWA del Social Composer) sigue disponible en
[`index.html`](index.html).*
