# Voice bridge

Corre en tu PC. Sirve la app y une Whisper con Ollama.

**Ollama no transcribe audio.** Ollama solo corre modelos de lenguaje. El motor
de voz a texto que usa ChatGPT es Whisper, así que hacen falta dos servicios:

| Servicio | Qué hace | Puerto por defecto |
|---|---|---|
| Whisper | Convierte tu voz en texto | 8000 |
| Ollama | Entiende y decide qué hacer | 11434 |
| Este puente | Une los dos y sirve la app | 8788 |

---

## 1. Ollama

Necesitas un modelo **con soporte de herramientas**, o el agente no podrá
elegir acciones:

```bash
ollama pull llama3.1:8b        # o qwen2.5:7b, mistral-nemo
```

## 2. Whisper

Cualquier servidor que exponga la ruta compatible con OpenAI
`POST /v1/audio/transcriptions` sirve. Opciones habituales:

- **speaches** (antes faster-whisper-server) — el más cómodo, imagen Docker con GPU.
- **whisper.cpp** — compilado en local, sin Docker, va bien también en CPU.

Consulta el README del proyecto que elijas para el comando exacto de arranque,
que cambia entre versiones. Lo único que importa aquí es el puerto y la ruta.

Modelo recomendado en español: **`large-v3-turbo`** — calidad casi idéntica a
`large-v3` y varias veces más rápido. En CPU sin GPU, baja a `small` o `medium`.

Si tu servidor usa `/inference` en vez de la ruta de OpenAI, cámbialo con
`WHISPER_PATH`.

## 3. El puente

```bash
node server/server.mjs
```

Requiere **Node 20 o superior**. Sin dependencias que instalar.

Variables de entorno, todas opcionales:

| Variable | Por defecto |
|---|---|
| `PORT` | `8788` |
| `HOST` | `127.0.0.1` — el puente solo escucha en localhost; `tailscale serve` hace proxy desde ahí. `HOST=0.0.0.0` solo si de verdad necesitas exponerlo a la LAN |
| `WHISPER_URL` | `http://127.0.0.1:8000` |
| `WHISPER_PATH` | `/v1/audio/transcriptions` |
| `WHISPER_MODEL` | `Systran/faster-whisper-large-v3` |
| `OLLAMA_URL` | `http://127.0.0.1:11434` |
| `OLLAMA_MODEL` | `llama3.1:8b` |
| `LANGUAGE` | `es` |

Ejemplo:

```bash
OLLAMA_MODEL=qwen2.5:7b WHISPER_MODEL=large-v3-turbo node server/server.mjs
```

Abre `http://localhost:8788` en el PC para probarlo antes de pasar al móvil.

---

## 4. Llegar desde el móvil (la parte que se atasca)

El navegador **solo da acceso al micrófono en contexto seguro**. `localhost`
vale, `https://` vale, pero `http://192.168.1.50:8788` **no**: el micrófono
queda bloqueado y la app no puede grabar. No es un fallo de la app, es una
regla del navegador y no se puede saltar.

La solución más simple es Tailscale, que da HTTPS gratis y además funciona
fuera de casa, no solo en tu WiFi:

```bash
tailscale serve --bg 8788
```

Te devuelve una URL `https://tu-pc.tu-tailnet.ts.net`. Ábrela en el móvil con
Tailscale instalado y ya graba. Esa misma URL se puede instalar como PWA desde
el menú de Chrome.

Alternativa: Cloudflare Tunnel, que también da HTTPS.

---

## 5. Qué esperar

El indicador de la esquina superior izquierda se pone verde cuando el puente
alcanza a Whisper y a Ollama. Si está rojo, abre Ajustes y pulsa **Probar
conexión**: te dice cuál de los dos falla.

Presupuesto de latencia realista con GPU decente: entre 1 y 3 segundos desde
que sueltas el botón hasta la respuesta. En CPU, bastante más — es normal, y es
justo el dato que la Fase 0 tiene que medir.

---

## 6. Encargos (trabajo en el fondo)

Cuando dictas algo que hay que **producir** — "prepárame un plan de estudio
para la clase del jueves" — el agente no intenta contestarlo al momento:

1. Crea un **encargo** y lo confirma en el acto ("me pongo con ello").
2. El servidor lo trabaja en el fondo, aunque cierres la app del móvil.
3. El resultado aparece en la **Bandeja** (icono junto a los ajustes),
   renderizado y listo para leer o copiar.

Los encargos se guardan en `server/data/jobs/` (fuera de git) y sobreviven
reinicios del servidor: lo que estaba en cola se retoma al arrancar.

Límites actuales del prototipo: no hay notificación push — te enteras al
abrir la app (el globito de la Bandeja se actualiza solo); y el redactor es
tu modelo de Ollama, sin acceso a la web en vivo, así que los encargos que
dependan de precios o datos actuales llevan una sección "Para verificar".
