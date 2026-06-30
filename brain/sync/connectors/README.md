# Conectores de Axon

Los conectores enlazan a Axon con el mundo exterior (calendario, correo, broker).
Todos siguen el mismo patron probado y guardan sus tokens cifrados localmente.

## Conectores activos

| Conector | Estado | Comandos | Tokens |
|----------|--------|----------|--------|
| **google-calendar** | ✅ Operativo | `today`, `tomorrow`, `list`, `add` | `tokens.enc` (cifrado) |
| **gmail** | ✅ Operativo | `list`, `read`, `unread`, `triage`, `send` | `tokens.enc` (cifrado) |
| **broker** | 🟡 Paper mode | `positions`, `balance`, `add`, `close`, `pnl` | `tokens.enc` (cuando haya API real) |

## El patron (como agregar un conector nuevo)

Cada conector vive en `brain/sync/connectors/<nombre>/` y tiene:

1. **`auth.mjs`** — OAuth de una sola vez. Abre el browser, captura el token, lo
   cifra con AES-256-GCM (salt 32 + iv 16 + tag 16 + ciphertext, PBKDF2 SHA-512
   100K) y lo guarda en `tokens.enc`. Copia el de `google-calendar/auth.mjs`.
2. **`<nombre>.mjs`** — el CLI. Lee `tokens.enc` (pide la contrasena maestra),
   refresca el access token, y expone comandos. Copia el de `gmail/gmail.mjs`.
3. **`README.md`** — guia de setup en español.

Reglas:
- Solo node built-ins, sin dependencias externas.
- `tokens.enc` esta cubierto por `.gitignore` (`brain/sync/connectors/**/tokens.enc`).
- Puerto local distinto por conector para el callback OAuth (Calendar 3000, Gmail 3001).
- Registra el conector en el array `connectors` de `axon.mjs` para que el launcher
  lo detecte.

## Roadmap de conectores

Conectores planificados, en orden de valor. Cada uno sigue el patron de arriba.

### WhatsApp (mensajeria)
- **Camino A (oficial):** WhatsApp Business API (Meta). Requiere cuenta de Business
  y aprobacion. Mejor para envio de notificaciones (ej. el brief diario a tu WhatsApp).
- **Camino B (personal):** `whatsapp-web.js` con un navegador headless. Lee/envia
  desde tu numero personal. Rompe el "cero dependencias" — evaluar.
- **Valor:** recibir el brief y alertas de trading en WhatsApp; "agrega al calendario"
  por mensaje.

### Banco / Finanzas (Plaid)
- **Camino:** Plaid API (https://plaid.com). OAuth bancario estandar, soporta miles
  de bancos. Tokens cifrados igual que los demas.
- **Valor:** el skill `finance` (CFO personal) lee balances, transacciones y
  suscripciones reales en vez de datos manuales. Detecta suscripciones invisibles
  de verdad.
- **Privacidad:** Plaid es un tercero. Documentar claramente que esto sale del
  local-first puro (los datos pasan por Plaid). Hacerlo opt-in explicito.

### Broker real (Schwab / thinkorswim)
- Ya existe el conector en modo paper. Falta `fetchRealPositions()` + `auth.mjs`
  contra developer.schwab.com cuando Jorge tenga las API keys. Ver
  `brain/sync/connectors/broker/README.md`.

## Voz

El control por voz ya funciona en el **dashboard** via Web Speech API del navegador
(STT + TTS en español, boton de microfono). Sin dependencias, sin modelos pesados.

**Upgrade futuro — voz local pura (Whisper + Kokoro):**
- **Whisper** (OpenAI, local via whisper.cpp): transcripcion offline de alta calidad,
  sin enviar audio a la nube. Mejor que Web Speech para privacidad y precision.
- **Kokoro** (TTS local): voz sintetica natural offline.
- **Cuando:** cuando se quiera una experiencia de voz 100% local y manos-libres
  (ej. hablarle a Axon sin abrir el navegador). Requiere correr los modelos
  localmente (estilo Ollama). Es un upgrade del camino actual, no un reemplazo.
- **Valor:** el "Jarvis" completo — hablar y escuchar sin tocar nada, todo offline.
