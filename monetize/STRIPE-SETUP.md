---
title: "Stripe en 5 minutos — Empieza a cobrar con Axon"
date: 2026-06-30
status: activo
owner: Jorge
audience: Jorge (no tecnico)
---

# Stripe en 5 minutos — Empieza a cobrar

Hola Jorge. Esta guia es para que pases de "tengo un producto" a "tengo un link
donde la gente paga y a mi me llega el dinero". Sin tecnicismos. Vas a hacer clic
en cosas, copiar dos links, y listo. Si algo se complica, me lo pides a mi (Claude)
y lo hago por ti.

---

## Antes de empezar (1 min)

**Que necesitas:**
- Una cuenta de banco (para que Stripe te deposite el dinero).
- Tu email.
- 5 minutos.

**Que vas a lograr al terminar:**
- Un link de pago para tu plan **Pro ($29/mes)**.
- Un link de pago para tu plan **Team ($19/usuario/mes)**.
- Esos links pegados en tu pagina de precios, listos para recibir clientes.

> Tip: lo primero lo puedes hacer en **modo prueba** (sin dinero real). Asi pruebas
> todo el flujo sin riesgo. Solo activas el cobro real cuando estes seguro.

---

## Paso 1 — Crear cuenta Stripe (2 min)

1. Abre tu navegador y entra a **stripe.com**.
2. Arriba a la derecha, haz clic en **"Sign up"** (Registrarse).
3. Escribe tu **email**, tu **nombre completo** y crea una **contrasena**.
4. Cuando te pregunte el **pais**, elige el tuyo (es donde esta tu banco).
5. Confirma tu email (Stripe te manda un correo, abrelo y haz clic en el boton).

**Importante — no te abrumes:** Stripe te va a pedir un monton de datos del negocio
(direccion, datos fiscales, cuenta bancaria). **NO necesitas llenar todo ahora.**
Puedes empezar en **modo prueba** (Test mode) y dejar la activacion completa para
despues. Si ves un boton **"Activate account"** o "Completa tu perfil", ignoralo
por ahora. Solo lo necesitas cuando vayas a cobrar dinero real.

Para asegurarte de estar en modo prueba: en el Dashboard, arriba a la derecha hay
un interruptor que dice **"Test mode"**. Deja que este **encendido (ON)** mientras
practicas.

---

## Paso 2 — Crear el link de pago de Pro ($29/mes) (1 min)

1. Ya dentro del Dashboard de Stripe, en el menu de la izquierda busca y haz clic en
   **"Payment Links"** (Enlaces de pago). Si no lo ves, entra directo a
   **dashboard.stripe.com/payment-links**.
2. Haz clic en el boton **"New"** o **"+ Create payment link"** (Crear enlace).
3. Te pide elegir un producto. Haz clic en **"+ New product"** (Nuevo producto) y llena:
   - **Name (Nombre):** `Axon Pro`
   - **Price (Precio):** `29.00`
   - **Currency (Moneda):** `USD`
   - Marca la opcion **"Recurring"** (Recurrente) — NO "One time".
   - **Billing period (Periodo):** `Monthly` (Mensual).
4. (Opcional pero recomendado) Busca la casilla **"Collect customers' emails"**
   (Recolectar email del cliente) y **marcala**. Asi sabras a quien le tienes que
   mandar su licencia.
5. Haz clic en **"Create link"** (Crear enlace).
6. Stripe te muestra una URL tipo `https://buy.stripe.com/xxxxxxxx`. Haz clic en
   **"Copy"** (Copiar) y **guardala** (pegala en una nota, la usaras en el Paso 4).
   Anotala como: **LINK PRO**.

---

## Paso 3 — Crear el link de pago de Team ($19/mes) (1 min)

Es exactamente lo mismo que el Paso 2, pero con otros datos:

1. **Payment Links** → **New** otra vez.
2. **"+ New product"** y llena:
   - **Name:** `Axon Team`
   - **Price:** `19.00`
   - **Currency:** `USD`
   - **Recurring** → **Monthly**.
3. (Opcional) Como Team se vende por asientos (minimo 5), busca
   **"Adjustable quantity"** (Cantidad ajustable) y actívala para que el cliente
   elija cuantos usuarios. Pon el minimo en `5` si te deja.
4. (Opcional) Marca tambien **"Collect customers' emails"**.
5. **"Create link"** → **Copy**. Guardala como: **LINK TEAM**.

Ahora tienes dos links copiados: **LINK PRO** y **LINK TEAM**.

---

## Paso 4 — Pegar los links en tu pagina de precios (1 min)

Tu pagina `pricing.html` tiene dos "huecos" con texto provisional que hay que
cambiar por tus links reales:

- `STRIPE_PAYMENT_LINK_PRO`  → se reemplaza con tu **LINK PRO**.
- `STRIPE_PAYMENT_LINK_TEAM` → se reemplaza con tu **LINK TEAM**.

### Opcion A — La facil: pidemelo a mi (recomendada)

Solo escribeme algo asi y yo lo hago:

> "Claude, pega estos links en pricing.html. Pro: https://buy.stripe.com/AAAA  
> Team: https://buy.stripe.com/BBBB"

Yo reemplazo los dos placeholders, guardo el archivo y, si quieres, hago el commit y
push a GitHub por ti.

### Opcion B — Hazlo tu mismo (comando exacto)

Abre una terminal en la carpeta del proyecto y corre estos dos comandos
(cambia las URLs por las tuyas reales):

```bash
sed -i 's|STRIPE_PAYMENT_LINK_PRO|https://buy.stripe.com/TU-LINK-PRO|' pricing.html
sed -i 's|STRIPE_PAYMENT_LINK_TEAM|https://buy.stripe.com/TU-LINK-TEAM|' pricing.html
```

Luego sube los cambios a GitHub (para que tu pagina publica se actualice):

```bash
git add pricing.html
git commit -m "Agregar Payment Links reales de Stripe"
git push
```

> Si nunca has usado `git push` o te marca error, no te pelees con ello: pidemelo a
> mi y lo subo yo.

---

## Paso 5 — Probar que funciona (modo prueba, sin dinero real)

Antes de cobrarle a un humano, cobrate a ti mismo con una tarjeta falsa de Stripe.

1. Asegurate de que **Test mode** este **encendido** en Stripe (Paso 1).
2. Abre tu propio **LINK PRO** en el navegador.
3. En el formulario de pago, usa esta **tarjeta de prueba** de Stripe:
   - **Numero:** `4242 4242 4242 4242`
   - **Fecha (MM/AA):** cualquiera futura, ej. `12/30`
   - **CVC:** cualquiera, ej. `123`
   - **Codigo postal:** cualquiera, ej. `12345`
4. Completa el "pago". Como es modo prueba, **no se cobra nada real.**
5. Ve a tu Dashboard de Stripe → **Payments** (Pagos). Debe aparecer el pago de
   prueba. Tambien deberia llegarte un email de Stripe.
6. Ahora simula entregar la licencia (esto es lo que harias con un cliente real).
   En la terminal corre:

   ```bash
   node monetize/license.mjs issue cliente@email.com pro 1
   ```

   Eso te imprime una "license key" larga (empieza con `AXON-...`). Esa es la llave
   que en la vida real le enviarias al cliente por correo.

Si llegaste hasta aqui y todo funciono: **estas listo para cobrar de verdad.**
Para cobrar real, apaga **Test mode** y completa la activacion de la cuenta que
saltaste en el Paso 1 (datos del negocio + cuenta bancaria).

---

## Cuando recibas tu primer pago real

El loop por cada cliente es de ~2 minutos:

1. **El cliente paga** en tu link. **Stripe te notifica** por email y lo ves en
   **Payments**. De ahi sacas el **email** del cliente y el **tier** que compro.
2. **Generas su licencia** (cambia el email y el tier por los reales):

   ```bash
   node monetize/license.mjs issue cliente@email.com pro 1
   ```

   El `1` final son los **meses** que dura (1 mes = una mensualidad). Nunca pongas
   `0` para suscripciones: `0` significa "para siempre" y dejarias de cobrarle.
3. **Le envias la key por correo.** Copia la linea `AXON-...` completa y mandasela
   con la instruccion de activar (el cliente corre
   `node monetize/license.mjs activate "<key>"`).
4. **Cada mes** que Stripe le vuelva a cobrar, le generas una key nueva con el mismo
   comando y se la mandas. Si no paga, no haces nada: la licencia vieja se vence
   sola y el producto baja a Free automaticamente.

> Cuando tengas muchos clientes (mas de ~50), esto se automatiza con un "webhook"
> para no hacerlo a mano. Eso lo veras en **WEBHOOK-SETUP.md** cuando llegue el
> momento. No lo necesitas ahora.

---

## Cuanto cobra Stripe

Stripe se queda con una comision por cada pago: **2.9% + $0.30** por transaccion.

- En un pago **Pro de $29**: comision ≈ **$1.14**. **Te queda ≈ $27.86.**
- En un pago **Team de $19** (por asiento): comision ≈ **$0.85**. Te queda ≈ $18.15.

No tienes que calcular nada: Stripe ya descuenta su parte y te deposita el neto en
tu banco.

---

## Errores comunes (y como salir de ellos)

**1. "Pegue los links pero los botones no hacen nada / dan error 404."**
Probablemente quedo mal pegada la URL (un espacio de mas, o no la copiaste completa).
Vuelve a copiar el link desde Stripe (boton **Copy**) y repite el Paso 4. O pidemelo
a mi y lo reviso.

**2. "Pague en mi propio link pero no veo el pago en Stripe."**
Casi siempre es por el interruptor **Test mode**. Si pagaste en modo prueba, el pago
sale en la vista de prueba; si pagaste en real, sale en la vista real. Revisa que
estes mirando el mismo modo en el que pagaste (interruptor arriba a la derecha).

**3. "La tarjeta 4242... me la rechaza."**
Esa tarjeta SOLO funciona en **Test mode**. Si tienes el modo real encendido, la va
a rechazar. Enciende Test mode para probar.

**4. "Stripe me pide activar la cuenta y no me deja cobrar real."**
Es normal: para mover dinero real, Stripe exige tus datos del negocio y tu cuenta
bancaria. Entra a **Dashboard → Activate account** (o "Completa tu perfil") y llena
lo que pida. Mientras tanto, puedes seguir probando todo en Test mode.

**5. "Cobre pero olvide marcar 'Collect email' y no se a quien mandarle la key."**
Entra al pago en **Payments**, abre el detalle: muchas veces el email igual aparece
ahi (Stripe lo pide para el recibo). Para futuros links, edita el Payment Link y
activa **Collect customers' emails**.

---

## Resumen ultra rapido

1. Crea cuenta en stripe.com (modo prueba esta bien para empezar).
2. Payment Links → New → producto "Axon Pro", $29, mensual recurrente → copia el link.
3. Lo mismo con "Axon Team", $19, mensual → copia el link.
4. Pega los dos links en `pricing.html` (o pidemelo a mi).
5. Prueba con la tarjeta `4242 4242 4242 4242` y emite la licencia con
   `node monetize/license.mjs issue ...`.

Listo. Cualquier paso que se trabe, me lo pasas y lo resuelvo yo.
