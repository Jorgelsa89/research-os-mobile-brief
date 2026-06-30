---
title: "Axon — Guia del Webhook de Stripe (emision automatica de licencias)"
date: 2026-06-30
status: activo
owner: Jorge
---

# Webhook de Stripe — Emision automatica de licencias

Esta guia explica como activar `monetize/stripe-webhook.mjs`, el servidor que
emite y envia licencias **automaticamente** cuando un cliente paga.

---

## 1. Que es y por que es OPCIONAL

El webhook automatiza el loop manual del `MONETIZATION.md` (seccion 4):

```
Cliente paga
  → Stripe dispara "checkout.session.completed"
  → el webhook verifica la firma, extrae email + tier
  → corre license.mjs issue <email> <tier> 1
  → envia la key por email (Resend) o la deja en pending-emails.log
  → responde 200 a Stripe
```

**No lo construyas/actives antes de tiempo.** El flujo manual aguanta bien
hasta ~50 clientes (la meta de Fase 1). A ~3 min por cliente/mes son ~2.5
horas mensuales: manejable. Manual gana mientras tengas poco volumen: cero
infra, cero superficie de ataque, y te obliga a hablar con tus primeros
clientes.

Activa el webhook **cuando el volumen lo justifique** (~100+ clientes, o
cuando el trabajo manual te quite tiempo de cosas mas importantes).

Hasta entonces, el flujo manual sigue 100% valido:

```bash
node monetize/license.mjs issue cliente@email.com pro 1
```

---

## 2. Local-first: que rompe y que NO

El webhook **necesita correr en un servidor con internet publico** (Stripe
tiene que poder alcanzarlo por HTTPS). NO sirve correrlo solo en tu laptop
local detras de NAT.

Esto **rompe el "cero servidor" SOLO para la maquina que procesa pagos** (la
tuya, la del vendedor). **NO rompe el local-first del producto:**

- El cliente sigue validando su licencia **100% offline**, con `public.pem`,
  sin llamar a casa, sin telemetria.
- El servidor del webhook **solo emite** licencias; **nunca valida**. El
  cliente jamas habla con tu servidor.

Es decir: la superficie "con servidor" es exclusivamente tu lado de
operaciones de venta. La experiencia del cliente sigue siendo local-first de
verdad.

> **Seguridad critica:** ese servidor tiene acceso a tu `private.pem` (lo
> necesita para firmar). Tratalo como una caja fuerte: `private.pem` como
> secreto cifrado / variable de entorno protegida, nunca en el repo, acceso
> minimo, HTTPS siempre. Si se filtra la privada, cualquiera emite licencias
> gratis (ver MONETIZATION.md seccion 7, plan de rotacion).

---

## 3. Variables de entorno

| Variable | Obligatoria | Para que |
|----------|-------------|----------|
| `STRIPE_WEBHOOK_SECRET` | **Si** | Secreto del endpoint (`whsec_...`). Sin esto, **todos** los webhooks se rechazan. |
| `STRIPE_PRICE_PRO` | Recomendada | `price_id` de Stripe que mapea al tier `pro`. |
| `STRIPE_PRICE_TEAM` | Recomendada | `price_id` de Stripe que mapea al tier `team`. |
| `PORT` | No | Puerto de escucha (default `4242`). |
| `RESEND_API_KEY` | No | API key de Resend para enviar el correo. Sin esto, la key va a `pending-emails.log`. |
| `RESEND_FROM` | No | Remitente, ej `Axon <licencias@tudominio.com>`. Default `Axon <onboarding@resend.dev>`. |

El tier se determina, en orden:
1. `session.metadata.tier` (si lo seteaste explicitamente en Stripe).
2. `price_id` del evento contra `STRIPE_PRICE_PRO` / `STRIPE_PRICE_TEAM`.
3. Si no se puede determinar, **no emite** (evita emitir tier equivocado).

> Para que el `price_id` llegue en el evento puede que necesites configurar
> `expand: ['line_items']` en el Checkout, o setear `metadata.tier` /
> `metadata.price_id` en el Payment Link. La via mas robusta y simple es
> **setear `metadata.tier` = `pro` o `team` directamente en cada Payment
> Link** (Stripe Dashboard → Payment Link → Metadata).

---

## 4. Como correrlo

Primero asegurate de tener tus claves (`keygen` corrido una vez) y el
`private.pem` presente en el servidor.

```bash
export STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxxx"
export STRIPE_PRICE_PRO="price_xxxxxxxxxxxxPRO"
export STRIPE_PRICE_TEAM="price_xxxxxxxxxxxxTEAM"
export RESEND_API_KEY="re_xxxxxxxxxxxxx"        # opcional
export RESEND_FROM="Axon <licencias@tudominio.com>"  # opcional
# export PORT=4242                              # opcional

node monetize/stripe-webhook.mjs
```

Veras algo como:

```
[2026-06-30T...Z] Webhook de Axon escuchando en http://0.0.0.0:4242/webhook
```

Endpoints:
- `POST /webhook` — recibe los eventos de Stripe.
- `GET /` o `GET /health` — healthcheck (`{ "ok": true }`).

En produccion, ponlo detras de HTTPS (reverse proxy con nginx/Caddy, o una
plataforma como Fly.io / Render / un VPS con TLS). Stripe **exige HTTPS** para
endpoints en modo Live.

---

## 5. Registrar el webhook en Stripe Dashboard

1. Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**.
2. **Endpoint URL:** la URL publica HTTPS de tu servidor, terminada en
   `/webhook`. Ej: `https://pagos.tudominio.com/webhook`.
3. **Events to send:** selecciona **`checkout.session.completed`**.
   (Es el unico evento que procesa este webhook.)
4. Crea el endpoint. Stripe te muestra el **Signing secret** (`whsec_...`):
   copialo a `STRIPE_WEBHOOK_SECRET` y reinicia el servidor.

> Para encontrar los `price_id`: Stripe Dashboard → **Products** → tu producto
> → seccion **Pricing** → cada precio tiene un id `price_...`. Eso va en
> `STRIPE_PRICE_PRO` / `STRIPE_PRICE_TEAM`.

---

## 6. Probarlo con Stripe CLI (sin dinero real)

La Stripe CLI te deja probar en local antes de exponer nada publico.

1. Instala la CLI: https://stripe.com/docs/stripe-cli e inicia sesion:
   ```bash
   stripe login
   ```
2. Reenvia los eventos a tu servidor local:
   ```bash
   stripe listen --forward-to localhost:4242/webhook
   ```
   La CLI imprime un **webhook signing secret temporal** (`whsec_...`).
   Exportalo como `STRIPE_WEBHOOK_SECRET` y arranca el webhook en otra
   terminal:
   ```bash
   export STRIPE_WEBHOOK_SECRET="whsec_temporal_de_la_cli"
   node monetize/stripe-webhook.mjs
   ```
3. Dispara un evento de prueba:
   ```bash
   stripe trigger checkout.session.completed
   ```
   Deberias ver en los logs del webhook la verificacion de firma, el intento
   de emision y el envio (o el fallback a `pending-emails.log`).

> El payload de `stripe trigger` es sintetico: puede no traer un email real ni
> tu `price_id`. Para una prueba end-to-end real, haz un pago en **Test mode**
> con una tarjeta de prueba (`4242 4242 4242 4242`) usando tu Payment Link de
> test; ahi el email y el tier vienen de verdad.

---

## 7. Idempotencia y envio de correos

- **Idempotencia:** cada `session.id` procesado se registra en
  `monetize/.processed-sessions.json`. Si Stripe reenvia el mismo evento (lo
  hace ante timeouts), no se emite una segunda licencia.
- **Envio del correo:**
  - Con `RESEND_API_KEY`: se envia via la API de Resend
    (`POST https://api.resend.com/emails`) con `fetch` nativo, sin SDK.
  - Sin `RESEND_API_KEY` (o si Resend falla): la key + el cuerpo del correo se
    guardan en `monetize/pending-emails.log`. **Nunca se pierde una licencia
    emitida** — solo la envias a mano desde ese archivo.

Ambos archivos (`.processed-sessions.json`, `pending-emails.log`) contienen
emails de clientes y keys: trátalos como datos sensibles (no los subas a git;
añadelos a `.gitignore` si vas a operar el webhook).

---

## 8. Alternativa sin servidor (el flujo actual)

Si aun no quieres montar el servidor, **el flujo manual con `license.mjs`
sigue siendo la via recomendada** hasta tener volumen:

```bash
# 1. Cliente paga (te llega el email de Stripe con su correo y tier)
# 2. Emites la licencia:
node monetize/license.mjs issue cliente@email.com pro 1
# 3. Copias la key del output y se la envias por correo
# 4. El cliente la activa:
#    node monetize/license.mjs activate "<key>"
```

Mismo resultado, cero infraestructura. El webhook solo cambia *quien* corre el
`issue`: tu a mano, o el servidor automaticamente.
