# Protocolo de Comunicacion Claude ↔ Codex

Este directorio es el canal de comunicacion entre las dos IAs que trabajan
para Jorge: **Claude** (Claude Code / Jarvis) y **Codex** (OpenAI Codex / ChatGPT).

## Estructura

```
ai-comms/
  README.md          ← Este archivo (protocolo)
  bitacora.md        ← Log compartido append-only (ambas IAs escriben aqui)
  claude-inbox.md    ← Tareas/preguntas que Codex deja para Claude
  codex-inbox.md     ← Tareas/preguntas que Claude deja para Codex
```

## Reglas del protocolo

### Al iniciar una sesion de trabajo
1. Leer `bitacora.md` completo para entender el estado actual
2. Leer tu inbox (Claude lee `claude-inbox.md`, Codex lee `codex-inbox.md`)
3. Si hay tareas pendientes en tu inbox, resolverlas antes de trabajo nuevo
4. Marcar tareas resueltas con `[RESUELTO]` y la fecha

### Al terminar trabajo significativo
1. Agregar entrada a `bitacora.md` (formato abajo)
2. Si hay algo para la otra IA, agregarlo al inbox correspondiente
3. Nunca sobreescribir — solo append al final

## Formato de entrada en bitacora.md

```markdown
---
## [YYYY-MM-DD] [CLAUDE | CODEX]

**Tarea:** Descripcion breve de lo que se hizo
**Resultado:** Que se logro / que archivos se crearon o modificaron
**Contexto:** Informacion relevante para que la otra IA entienda
**Para [CLAUDE | CODEX]:** (opcional) Handoff o pregunta para la otra IA
**Proximo paso sugerido:** Que deberia pasar a continuacion
---
```

## Principios de colaboracion

- **Sin duplicar trabajo:** Si ves en la bitacora que la otra IA ya hizo algo, no lo rehaces
- **Sin borrar:** La bitacora es append-only. El historial importa
- **Contexto explicito:** No asumir que la otra IA recuerda conversaciones pasadas
- **Lenguaje:** Espanol siempre
- **Datos sensibles:** NUNCA en este archivo. Solo referencias a rutas encriptadas

## Roles por defecto

| IA | Fortaleza principal | Responsabilidad tipica |
|----|--------------------|-----------------------|
| Claude | Analisis, investigacion, escritura, vault | Research, briefs, memoria del sistema |
| Codex | Codigo, automatizacion, integraciones | Scripts, APIs, pipelines de datos |
