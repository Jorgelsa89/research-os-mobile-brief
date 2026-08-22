# El dispositivo de un botón dentro de Jarvis

Cómo encaja el dispositivo en la arquitectura Jarvis local-first de
continuidad personal, y qué añadir para que se apoyen mutuamente.

---

## 1. El encaje en una frase

El dispositivo es el **órgano de captura** de Jarvis: su trabajo es que crear
una `Observation` cueste cero — pulsar, hablar, soltar — y **nunca** tener
autoridad propia para actuar. Jarvis es el cerebro y la memoria; el
dispositivo es la puerta de entrada con la menor fricción física posible.

Esto conecta directo con el criterio de éxito del piloto: reducir carga
mental. Un pensamiento que puedes soltar en tres segundos con confirmación
háptica es un pensamiento que tu cabeza deja de sostener. El botón es la
válvula de escape de la mente — el principio de "capturarlo todo" llevado al
hardware.

Y en lo filosófico también encaja: la cadena de voz es 100% local (micro →
móvil → Whisper y Ollama en tu PC, todo dentro del tailnet). Si ChatGPT
Remote no está disponible, el canal de voz sigue funcionando igual, que es
exactamente el plan B que tu spec ya contempla.

---

## 2. El prototipo ya habla el idioma de Jarvis

El router de intención actual mapea 1:1 a tu modelo de datos:

| Herramienta del prototipo | Entidad Jarvis | Detalle |
|---|---|---|
| `crear_recordatorio` | `Commitment/Task` | responsable tú, fecha deducida, próxima acción |
| `crear_nota` | `MemoryClaim` | entra como `inferred`; pasa a `confirmed` cuando tú lo valides |
| `preparar_mensaje` | `ActionProposal` | el borrador **es** la vista previa; enviar es acción roja |
| `investigar` | cola verde de trabajo | confirmación inmediata, resultado diferido |
| `responder` | efímero + `AuditEvent` | |
| toda dictación | `Observation` | fuente `voice-button`, audio conservado como evidencia |

Conclusión: no hay que rediseñar el dispositivo para Jarvis. Hay que
conectar su salida al modelo de datos de Jarvis en vez de a tarjetas
locales, y migrar el router de intención del puente a Jarvis Core para que
haya **un solo cerebro**, no dos compitiendo.

---

## 3. El contrato de ingesta — la pieza a construir primero

Sugerencia concreta: antes que nada, definir el endpoint de ingesta en Core
y convertir el puente de voz en un adaptador suyo.

```
POST /observations
{
  "id": "01J5X8...",            // ULID generado AL PULSAR el botón
  "source": "voice-button",
  "captured_at": "2026-08-22T14:03:11-04:00",
  "location": { "lat": ..., "lon": ..., "accuracy_m": 12 },   // opcional
  "audio_ref": "vault://personal/audio/01J5X8....wav",
  "transcript": "recuérdame llamar al taller mañana a las diez",
  "stt": { "engine": "whisper", "model": "large-v3-turbo", "confidence": 0.94 },
  "intent": { "tool": "crear_recordatorio", "args": { ... } }
}
```

Detalles que importan:

- **El ULID se genera en el momento de pulsar**, no al sincronizar. Así los
  reintentos y las capturas duplicadas se deduplican por id en Core — que es
  exactamente tu prueba de "captura duplicada", resuelta por diseño.
- **La confianza de Whisper alimenta los estados de claim.** La Observation
  (que dijiste X) es un hecho con el audio como evidencia; los claims
  derivados entran como `inferred`; con confianza baja, `pending` con el
  audio como árbitro. Una corrección tuya crea `corrected` sin borrar el
  audio original — tu prueba de aceptación, cumplida por construcción.
- **El dispositivo se inscribe en tu registro de fuentes** con salud propia:
  última vez visto, batería, estado del micrófono, tamaño de la cola
  pendiente. Cuando la fuente está caída, Jarvis puede decir "no puedo
  confirmarlo actualmente" también sobre la voz.

---

## 4. Captura offline-first en el móvil

Tu spec de mini app ya lo pide ("confirmar primero la captura local y
sincronizar después"). El prototipo PWA actual exige PC alcanzable; hay que
alinearlo:

1. Grabar → guardar WAV + metadatos en IndexedDB → **vibración de
   "capturado" aunque no haya red**.
2. Cola con ULID, reintentos con backoff, dedupe en Core.
3. La confirmación háptica significa "capturado localmente", nunca
   "procesado". El procesamiento llega después como notificación.

Esto cubre de golpe varias de tus pruebas: PC offline, Tailscale caído,
Android en Doze, reboot, captura duplicada y almacenamiento casi lleno
(cuota + purga de lo ya sincronizado).

---

## 5. Techo de autoridad de la voz

La voz es un canal suplantable: cualquiera cerca del teléfono puede pulsar y
hablar, y la verificación de locutor es demasiado débil para confiarle
acciones. Regla sugerida, alineada con tus colores:

- La voz puede **capturar** (siempre) y disparar **verde** (leer,
  transcribir, clasificar, investigar, organizar).
- La voz puede **preparar** amarillo y rojo — borradores, propuestas — pero
  **jamás aprobarlos**.
- Toda acción roja se aprueba **en pantalla, con biométrico del teléfono**,
  viendo la vista previa completa. Nunca por voz.

En una frase: **la voz propone, la pantalla dispone.** Es la generalización
del principio que el prototipo ya practica con los mensajes (preparados, no
enviados), elevada a política de todo Jarvis.

Cadena de identidad: emparejamiento BLE con bonding para el botón físico,
claves del móvil en Android Keystore, TLS del tailnet entre móvil y Core —
"comunicaciones autenticadas por dispositivo", como pide tu spec, de punta a
punta.

---

## 6. Ubicación y contexto en el momento de pulsar

Tu `Observation` lleva ubicación; la captura de voz debería llevarla
también. La PWA puede pedir geolocalización al pulsar (opcional); la mini
app Kotlin, con su foreground service, la tendrá siempre. Se aplica tu misma
política de retención: GPS crudo 30 días, derivados indefinidos.

El lugar de una nota es contexto de recuperación potentísimo: "¿qué dicté
cuando estaba en el taller?" es una consulta que ninguna app de notas
responde y Jarvis sí podrá.

---

## 7. Rituales sobre el mismo botón

El plan matutino y el cierre diario de tu spec ganan un disparador físico:

- **Primera pulsación del día** → Jarvis ofrece el plan matutino, breve y
  por voz.
- **Gesto dedicado** (doble pulsación) → cierre del día dictado.
- **Preguntas acumuladas**: entregarlas justo después de una captura, cuando
  ya estás en interacción — respeta tu regla de que fuera de interacción se
  acumulan. El botón define de forma natural qué es "estar en interacción".
- **Conduciendo**: el botón físico es la única interfaz segura al volante.
  Respuestas de audio cortas, decisiones complejas aplazadas — tu regla,
  hecha practicable.

---

## 8. La privacidad, en el silicio

Tu spec promete "nunca grabación ambiental". El dispositivo puede hacer esa
promesa **verificable físicamente**: la alimentación del micrófono cortada
por el propio botón, y el LED cableado a la línea de alimentación del micro,
no a un GPIO que el firmware decida.

No es una política de software que haya que auditar: es un circuito. Para un
sistema cuyo primer capítulo se titula "recuperar confianza", es el
argumento más fuerte que existe.

---

## 9. Red y superficie de ataque

- Mismo tailnet para todo; ningún puerto público ni Funnel — tu regla, que
  ya era la nuestra.
- El puente de voz ahora escucha **solo en 127.0.0.1 por defecto**
  (`HOST` lo cambia si hiciera falta). `tailscale serve` hace proxy desde
  localhost, así que exponerlo a la LAN era superficie gratis. Coherente con
  tu "cerrar listeners públicos innecesarios".
- Los endpoints estables (`/api/transcribe`, `/api/agent`, futuro
  `/observations`) son el contrato: la PWA de hoy y la mini app Kotlin de
  mañana son intercambiables sin tocar Core. Construye la Kotlin contra el
  mismo contrato y la PWA queda como andamio del piloto.

---

## 10. Dónde entra en el piloto de 14 días

Propuesta: entrar como fuente **solo captura, zona verde** — recordatorios,
notas, investigación. Nada amarillo ni rojo desde voz durante el piloto.

Métricas propias del dispositivo dentro del piloto:

- Pensamientos capturados por día, y latencia pulsar → confirmación háptica
  (objetivo: menos de 1 segundo).
- Porcentaje de transcripciones correctas sin necesidad de edición — el dato
  que decide si Whisper local basta o hay que subir de modelo.
- Cero capturas perdidas con la PC apagada (la prueba offline de verdad).

Graduación tras el piloto: la voz puede pasar a encolar amarillo
(borradores). El rojo no se gradúa nunca.

---

## 11. Qué NO añadir

- **Altavoz en el dispositivo**: el teléfono ya habla. El dispositivo, como
  mucho, LED y vibración.
- **Wake word / escucha ambiental**: rompe la promesa central del sistema.
- **Aprobaciones por voz**: canal suplantable; ver sección 5.
- **Un segundo cerebro**: el router de intención del puente debe migrar a
  Core, no competir con él. Un solo modelo de datos, una sola memoria, una
  sola auditoría.
