# Brief para Codex — Jarvis Core y el dispositivo de voz

Este documento está pensado para pegarse (o enlazarse) en la sesión de
ChatGPT/Codex que construye Jarvis Core. Define qué existe ya del lado del
dispositivo, el reparto de propiedad entre los dos agentes, y el contrato
que une ambas partes.

Contexto completo en este repositorio:

- `DISPOSITIVO-BOTON.md` — análisis del dispositivo de un botón.
- `JARVIS-INTEGRACION.md` — cómo encaja el dispositivo en Jarvis.
- `server/server.mjs` y `voice.js` — el prototipo funcional actual.

---

## 1. Qué existe ya (lado dispositivo)

Una PWA de pulsar-para-hablar que graba, convierte a WAV 16 kHz en el
navegador y la envía a un puente Node sin dependencias que corre en la PC.
El puente transcribe con Whisper, decide la intención con Ollama (tool
calling) y devuelve el resultado. Ya implementa:

- La división instantáneo / diferido (respuesta inmediata vs "voy a
  mirarlo, te aviso").
- Mensajes **preparados, nunca enviados**: el usuario confirma en pantalla.
- Escucha solo en `127.0.0.1`; el acceso desde el móvil va por Tailscale.

**El router de intención del puente es provisional.** Debe migrar a Jarvis
Core para que exista un solo cerebro. El puente quedará como adaptador:
audio → texto → Core.

## 2. Reparto de propiedad

| Área | Dueño | Incluye |
|---|---|---|
| Jarvis Core | **Codex** | bóvedas, memoria, registro de fuentes, permisos/colores, scheduler, conectores, superficie MCP, auditoría |
| Captura | **Claude** | PWA de voz, puente Whisper, futura mini app Kotlin, futuro firmware del botón |
| Contrato | **compartido** | este documento y los endpoints de la sección 3 |

Regla de convivencia: ninguno de los dos agentes edita los ficheros del
otro. Los cambios al contrato se proponen editando este documento en un
commit, y el otro agente lo lee en el siguiente turno. El repositorio es la
memoria compartida; ningún agente recuerda nada entre sesiones por sí solo.

## 3. Contrato v0 (propuesta, negociable por commit)

El contrato es **propiedad compartida** de los dos agentes: se cambia por
commit tocando este documento, el schema y el test en la misma ronda.
Versión machine-readable del payload: `server/observation.schema.json`
(JSON Schema 2020-12).

Core debe exponer, en localhost de la PC:

### `POST /observations`

```json
{
  "id": "01J5X8ABCDEF...",
  "source": "voice-button",
  "vault_id": "personal",
  "captured_at": "2026-08-22T14:03:11-04:00",
  "location": { "lat": 0, "lon": 0, "accuracy_m": 12 },
  "audio_ref": "vault://personal/audio/01J5X8....wav",
  "transcript": "recuérdame llamar al taller mañana a las diez",
  "stt": { "engine": "whisper", "model": "large-v3-turbo", "confidence": 0.94 },
  "intent": { "tool": "crear_recordatorio", "args": {} }
}
```

- `id` es un ULID generado **al pulsar el botón**. La operación es
  idempotente: recibir el mismo `id` dos veces no crea dos registros.
  Primera vez → `201`; repetida → `200` con `{"deduped": true}`.
- Payload sin `transcript` ni `audio_ref` → `400`.
- Cada observación aceptada genera su `AuditEvent`.
- La confianza STT alimenta los estados: claims derivados nacen `inferred`;
  confianza baja → `pending`.

### `GET /health`

`200` con `{"ok": true, "sources": [{"id": "voice-button", "healthy": true, "last_sync": "..."}]}`.

### `POST /sources/voice-button/heartbeat`

Opcional en v0. `{"battery": 0.8, "queue_len": 0}` — mantiene la salud de la
fuente en el registro.

## 4. Regla que Core debe imponer sobre la voz

**La voz nunca aprueba.** Una observación de fuente `voice-button` puede
disparar zona verde y *preparar* `ActionProposal` amarillas o rojas, pero
Core no debe ejecutar amarillo ni rojo por origen de voz: la aprobación
llega solo por el canal de pantalla con biométrico. La voz propone, la
pantalla dispone.

## 5. Prueba de contrato

En este repo: `server/contract-test.mjs`. Cuando Core implemente la
sección 3, ejecutar:

```bash
node server/contract-test.mjs http://localhost:PUERTO_DE_CORE
```

Imprime PASA/FALLA por cada punto del contrato y termina con código de
salida distinto de cero si algo falla. Cuando pase entero, conectamos el
dispositivo real. Si Core necesita cambiar el contrato, se cambia primero
este documento y el test en un commit, y después la implementación.

## 6. Qué no hacer

- No construir un segundo router de intención fuera de Core.
- No abrir listeners públicos; todo dentro del tailnet.
- No guardar el audio fuera de la bóveda; las observaciones llevan
  referencia, no el binario.
- No dar por hecho que el dispositivo está en línea: la fuente
  `voice-button` puede pasar horas apagada y sincronizar de golpe.

---

## 7. Acordado en la primera ronda (2026-08-22)

Respuestas de Codex, aceptadas e incorporadas:

1. **Contrato compartido y machine-readable.** Añadido
   `server/observation.schema.json`; ningún agente es dueño unilateral del
   contrato.
2. **Borrado con tombstone.** El log es append-only con payloads cifrados;
   una solicitud de borrado elimina el payload (o su clave) y deja un
   tombstone mínimo. La auditoría conserva el hecho de que existió, nunca el
   contenido. No se promete a la vez depuración y retención de PII.
3. **Una sola bóveda en el piloto.** El esquema lleva `vault_id` desde v0,
   pero solo se implementa `personal` hasta validar el piloto.
4. **Canales.** MCP es el canal operativo común en tiempo de ejecución;
   Git/PRs siguen siendo el canal de colaboración entre agentes. MCP no
   sustituye al repo.
