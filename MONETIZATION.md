---
title: "Axon — Playbook de Monetizacion"
date: 2026-06-30
status: activo
owner: Jorge
meta: $10K MRR (Fase 1 del AXON-ROADMAP.md)
---

# Axon — Playbook de Monetizacion

Manual operativo para ganar dinero con Axon sin montar infraestructura.
Local-first de verdad: sin servidor, sin telemetria, sin backend que mantener.

---

## 1. El modelo en una frase

**Cobras una suscripcion (Stripe), generas una license key firmada con Ed25519, el cliente la activa y el producto funciona offline para siempre. Sin backend, sin servidor que validar, sin nube.**

El truco: la validacion de la licencia ocurre **en la maquina del cliente** usando criptografia de clave publica. Tu firmas con tu clave privada (que solo tu tienes), el producto verifica con la clave publica embebida. Nadie puede falsificar una licencia sin tu clave privada, y nada necesita "llamar a casa".

Tu unica chamba operativa por cliente: cobrar (Stripe lo hace) y correr un comando de una linea para emitir la key.

---

## 2. Los 4 tiers

| Tier | Precio | Que incluye | Usuarios |
|------|--------|-------------|----------|
| **Free** | $0 | 3 skills core (research, trading, daily), dashboard basico, 100% local | 1 |
| **Pro** | $29/mes | 12 skills, conectores (Calendar/Gmail), auto-brief, skill-creator + trainer, dashboard completo | 1 |
| **Team** | $19/usuario/mes | Todo Pro + multi-usuario, brain compartido, AI-comms (Claude ↔ Codex) | min. 5 |
| **Enterprise** | Custom | Verticales a medida, fine-tuning, on-premise, SLA, soporte dedicado | N |

Estos tiers coinciden exactamente con los valores que acepta `license.mjs`: `free | pro | team | enterprise`. El comando `issue` solo emite licencias para `pro`, `team` o `enterprise`; `free` es el estado por defecto cuando no hay licencia (lo ves en `status`, que devuelve `tier: free` si no existe `brain/identity/license.key`).

**Regla de oro:** Free siempre debe entregar valor real por si solo. Es tu mejor canal de adquisicion. Pro se vende solo cuando alguien ya vive en Free.

---

## 3. Setup inicial (una sola vez)

Esto se hace **una vez** y nunca mas. Despues solo emites licencias.

### 3.1 Generar tu par de claves

```bash
node monetize/license.mjs keygen
```

Esto crea dos archivos en `monetize/keys/`:

- **`private.pem`** — Tu clave privada. Es **el activo mas importante del negocio**. Quien la tenga puede emitir licencias gratis de cualquier tier. Ya esta en `.gitignore` (`monetize/keys/private.pem`), asi que **nunca** se sube a git. Guardala ademas en un gestor de contrasenas o un backup cifrado offline.
- **`public.pem`** — Tu clave publica. Se **distribuye con el producto** (va incluida en el repo/release). Sirve para que el producto verifique licencias. Es segura de compartir: con la publica no se puede firmar nada, solo verificar.

> Si ya corriste `keygen` y existe `private.pem`, el comando se niega a regenerar (para no invalidar licencias ya emitidas). Si borras `monetize/keys/` y regeneras, **todas las licencias existentes dejan de validar**. No lo hagas salvo rotacion de emergencia (ver seccion 7).

### 3.2 Crear cuenta Stripe

1. Entra a [stripe.com](https://stripe.com) y crea una cuenta.
2. Completa la verificacion del negocio (datos fiscales, cuenta bancaria para los payouts).
3. Activa el modo **Live** cuando estes listo para cobrar de verdad (usa **Test mode** primero para probar el flujo sin dinero real).

### 3.3 Crear 2 Payment Links en Stripe

No necesitas integrar la API de Stripe ni escribir codigo. Usa **Payment Links** (paginas de pago hospedadas por Stripe).

**Link 1 — Pro mensual ($29):**
1. Stripe Dashboard → **Payment Links** → **New** (o **+ Create payment link**).
2. **Product:** crea uno nuevo llamado "Axon Pro".
3. **Price:** $29.00 USD, modelo **Recurring** (recurrente), intervalo **Monthly**.
4. (Opcional) Activa **Collect customer email** para tener el correo del cliente automaticamente — lo necesitas para emitir la licencia.
5. Guarda. Stripe te da una URL tipo `https://buy.stripe.com/xxxxxxxx`. Copiala.

**Link 2 — Team ($19/usuario):**
1. Mismo proceso. Producto "Axon Team", precio $19.00 USD recurrente mensual.
2. (Opcional) Configura **Adjustable quantity** para que el cliente elija cuantos asientos (min. 5).
3. Copia la URL.

### 3.4 Pegar los links en pricing.html

En tu pagina de pricing (`pricing.html`), reemplaza los placeholders por las URLs reales:

```html
<!-- Boton Pro -->
<a href="STRIPE_PAYMENT_LINK_PRO">Suscribirme a Pro — $29/mes</a>

<!-- Boton Team -->
<a href="STRIPE_PAYMENT_LINK_TEAM">Empezar con Team — $19/usuario</a>
```

Sustituye `STRIPE_PAYMENT_LINK_PRO` y `STRIPE_PAYMENT_LINK_TEAM` por las dos URLs de Stripe que copiaste. Sube `pricing.html` a GitHub Pages y ya tienes tu funnel de venta publico.

> Si `pricing.html` aun no existe, creala con dos botones que apunten a esos links. Enterprise no lleva Payment Link: pon un boton "Contactar" con tu email.

---

## 4. El flujo de venta (por cada cliente)

Este es el loop que repites con cada venta. Tarda ~2 minutos manuales.

1. **El cliente paga.** Entra a `pricing.html`, hace clic en el boton de su tier y paga via el Stripe Payment Link.
2. **Stripe te notifica.** Recibes un email de Stripe y aparece el pago en tu Dashboard (Payments). De ahi sacas el **email del cliente** y el tier que compro.
3. **Emites su licencia:**

   ```bash
   node monetize/license.mjs issue cliente@email.com pro 1
   ```

   - `cliente@email.com` → el email del cliente (queda dentro de la licencia firmada).
   - `pro` → el tier (`pro`, `team` o `enterprise`).
   - `1` → meses de validez (1 mes para una suscripcion mensual). Si pones `0`, la licencia es **perpetua** (`expires: never`) — usalo solo para deals especiales o lifetime, nunca para suscripciones.

   El comando imprime una key tipo:

   ```
   AXON-<payload-base64url>.<firma-base64url>
   ```

4. **Le envias la key por email.** Copia-pega la key completa en un correo. Incluye la instruccion de activacion (paso 5).
5. **El cliente la activa:**

   ```bash
   node monetize/license.mjs activate "<key>"
   ```

   Esto valida la firma offline y guarda la licencia en `brain/identity/license.key`. Desde ese momento el producto le da su tier. Puede verificar cuando quiera con:

   ```bash
   node monetize/license.mjs status
   ```

6. **Renovacion.** Cada mes que Stripe le cobre con exito (te llega el email de "payment succeeded"), emites una **nueva key** con la nueva expiracion y se la mandas:

   ```bash
   node monetize/license.mjs issue cliente@email.com pro 1
   ```

   El cliente la vuelve a activar (sobrescribe la anterior). Si **no** paga, no emites nada: la licencia vieja expira sola en la fecha `expires` y `verify` la marca como `expirada` → el producto cae a Free automaticamente. No tienes que "apagar" nada.

> **Tip operativo:** lleva una hoja de calculo simple (email, tier, fecha de pago, fecha de expiracion). Es tu CRM hasta que automatices. Revisala 1 vez por semana para ver quien renueva.

---

## 5. Automatizacion futura (cuando escales)

El flujo manual aguanta bien **hasta ~50 clientes** (la meta de Fase 1). A ~3 min por cliente/mes, son ~2.5 horas mensuales. Manejable.

Cuando el volumen lo justifique, automatizas con un **Stripe webhook**:

```
Cliente paga
   → Stripe dispara webhook "checkout.session.completed" / "invoice.paid"
   → Tu pequeño servidor recibe el evento
   → Corre la logica de issue() con email + tier del evento
   → Envia la key por email automaticamente (Resend, Postmark, SES)
```

**Importante:** esto requiere un servidor minimo (una funcion serverless en Vercel/Cloudflare Workers o un mini-Fastify) que tenga acceso a tu `private.pem`. Eso **rompe el "cero servidor"** del lado de operaciones, pero **no** rompe el local-first del producto: el cliente sigue validando offline. El servidor solo emite; nunca valida.

Reglas si montas el webhook:
- La `private.pem` vive solo en el entorno del servidor como secreto cifrado (variable de entorno o secret manager). Jamas en el repo.
- Verifica la firma del webhook de Stripe (`Stripe-Signature`) para que nadie falsee pagos.
- Maneja `invoice.paid` para renovaciones (re-emite cada mes) y `customer.subscription.deleted` para cancelaciones (dejas de re-emitir; la licencia expira sola).

**No lo construyas antes de tiempo.** Hasta 50 clientes, manual gana: cero infra, cero superficie de ataque, y te obliga a hablar con tus primeros clientes.

---

## 6. Proyeccion de ingresos

MRR = Monthly Recurring Revenue. Para Pro a $29/mes:

| Clientes Pro | MRR | ARR (x12) | Nota |
|--------------|-----|-----------|------|
| 10 | $290 | $3,480 | Validacion: gente paga |
| 25 | $725 | $8,700 | Product-market fit incipiente |
| 50 | $1,450 | $17,400 | Tope comodo del flujo manual |
| 100 | $2,900 | $34,800 | Hora de automatizar (webhook) |
| 200 | $5,800 | $69,600 | |
| **350** | **$10,150** | **$121,800** | **🎯 Meta Fase 1: $10K MRR** |

> Nota de realidad vs. roadmap: el `AXON-ROADMAP.md` (Fase 1) fija la meta en **$10K MRR**. Solo con Pro a $29, eso son ~350 clientes. El roadmap menciona "50 usuarios Pro activos" como exit criteria — 50 Pro = $1,450 MRR. La diferencia se cierra mezclando tiers: cada cuenta **Team** (5 asientos x $19 = $95/mes) vale como ~3.3 cuentas Pro. Camino realista a $10K: ~150 Pro ($4,350) + ~60 asientos Team ($1,140) + 2-3 deals Enterprise ($4,500+). Mezcla tiers; no dependas solo de Pro.

Regla mental: **cada cliente Pro = $29 MRR = $348 ARR.** Cada Team de 5 = $95 MRR. Optimiza por retencion (churn bajo) antes que por adquisicion: un cliente que se queda 12 meses vale 12x uno que se va al mes 1.

---

## 7. Seguridad del modelo

### Por que las licencias NO se pueden falsificar

Cada licencia es un payload (`{email, tier, issued, expires, v}`) **firmado con Ed25519** usando tu `private.pem`. La firma es una prueba matematica de que el payload salio de tu clave privada y no fue alterado ni un byte.

- El producto verifica con `public.pem` (`edVerify`). Si alguien cambia el tier de `pro` a `enterprise`, o la fecha de expiracion, la firma **deja de cuadrar** y `verify` devuelve `firma invalida (falsificada o alterada)`.
- **Solo tu clave privada puede producir firmas validas.** La clave publica solo verifica; con ella es computacionalmente inviable forjar una firma. No hay "crack" practico de Ed25519.
- La expiracion tambien va firmada, asi que nadie puede extenderse la licencia editando el JSON.

Resultado: imposible piratear sin tu `private.pem`. No hay keygen que valga.

### Que pasa si filtras la clave privada (el escenario catastrofe)

Si `private.pem` se filtra (la subiste a git por error, te hackearon, se te escapo en un screenshot), **cualquiera puede emitir licencias gratis de cualquier tier**. Es el peor caso del modelo. Plan de rotacion:

1. **Genera un par nuevo:** mueve/borra `monetize/keys/` y corre `keygen`. Esto produce una `public.pem` nueva.
2. **Distribuye la nueva `public.pem`** con un release nuevo del producto. A partir de esa version, las licencias firmadas con la clave vieja **ya no validan** (la firma no cuadra con la nueva publica).
3. **Re-emite licencias** a todos tus clientes legitimos con la nueva privada y enviaselas. Usa tu hoja de CRM (seccion 4) para saber a quien.
4. **Considera versionar la clave:** el payload ya tiene `v: 1`. En una rotacion seria puedes embeber multiples claves publicas en el producto y un `keyId` en el payload, para migrar sin romper a todos de golpe. (Mejora futura; hoy la rotacion es "version nueva = clave nueva".)

Moraleja: trata `private.pem` como trataria un banco su llave maestra. Backup cifrado, nunca en repos, nunca en chats.

### Por que es local-first de verdad

- **No hay servidor de validacion.** `verify` y `status` leen `public.pem` y la `license.key` del disco local. Cero llamadas de red. El cliente puede validar en un avion sin wifi.
- **No hay telemetria.** El producto no reporta quien activo que ni cuando. Lo unico que sale a internet es el pago (en Stripe, lado del cliente, antes de que entres tu).
- **La licencia vive en `brain/identity/license.key`**, dentro del cerebro del usuario, junto a sus datos cifrados. Es suyo, offline, portatil.

Esto es lo que te deja prometer "sin servidor, sin telemetria" sin mentir.

---

## 8. Que NO hacer

- ❌ **Nunca subas `private.pem`.** Ni a git, ni a un gist, ni a un screenshot, ni a un chat de IA. Esta gitignored por una razon. Es el fin del negocio si se filtra.
- ❌ **No regeneres las claves a la ligera.** Borrar `monetize/keys/` invalida **todas** las licencias emitidas. Solo en rotacion de emergencia (seccion 7).
- ❌ **No prometas features que no existen.** Vende lo que el producto entrega hoy. Los conectores avanzados, Axon Overnight y el marketplace son roadmap (Fases 2-4), no realidad. Promesas vacias = churn y reembolsos.
- ❌ **No cobres antes de entregar valor.** Free debe ser util por si solo. Cobra Pro cuando el cliente ya saco provecho de Free y quiere mas. Cobrar antes del valor = desconfianza.
- ❌ **No emitas licencias perpetuas (`0` meses) para suscripciones.** Una perpetua nunca expira y pierdes el ingreso recurrente. Usala solo para deals lifetime conscientes.
- ❌ **No hagas el webhook antes de tiempo.** Hasta 50 clientes, manual. Automatizar temprano es montar infra y superficie de ataque sin necesidad.

---

## Siguiente paso sugerido

1. Corre `node monetize/license.mjs keygen` si aun no lo hiciste (verifica que `monetize/keys/private.pem` quedo fuera de git con `git status`).
2. Crea los 2 Payment Links en Stripe (Test mode primero).
3. Crea/actualiza `pricing.html` con los links y subela a GitHub Pages.
4. Haz una venta de prueba contigo mismo: paga en Test mode → `issue` → `activate` → `status`. Si el ciclo completo funciona, estas listo para cobrar de verdad.

Meta inmediata (Fase 1): primeros 10 clientes Pro = **$290 MRR**. Eso prueba que la gente paga. De ahi a $10K es ejecucion.
