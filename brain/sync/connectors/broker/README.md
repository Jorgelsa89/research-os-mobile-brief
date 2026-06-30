# Axon — Broker Connector

Conector de broker para que el skill de **trading** lea posiciones reales de la cuenta.

## Que hace

- **Ahora (modo PAPER):** lee y escribe posiciones en un archivo local
  (`brain/knowledge/trading/positions.json`). Funciona de verdad: agrega/cierra
  posiciones, calcula P/L y balance sobre numeros reales. El "precio actual" se
  simula de forma deterministica para que sea reproducible y testeable.
- **Despues (modo REAL):** cuando Jorge tenga las API keys de **Schwab /
  thinkorswim**, el conector leera las posiciones reales del broker. La estructura
  ya esta lista (ver `fetchRealPositions()` en `broker.mjs`), solo falta cablear
  la API.

El conector detecta el modo automaticamente y lo anuncia en cada salida:
`[PAPER]` o `[REAL]`.

## Comandos

```bash
# Posiciones actuales con P/L (ticker, cantidad, entrada, actual, P/L, P/L%)
node brain/sync/connectors/broker/broker.mjs positions

# Balance: cash, valor de mercado, equity, buying power
node brain/sync/connectors/broker/broker.mjs balance

# Agregar una posicion (solo modo paper)
node brain/sync/connectors/broker/broker.mjs add NVDA 10 1200

# Cerrar una posicion (solo modo paper)
node brain/sync/connectors/broker/broker.mjs close MSFT

# Resumen de P/L total de la cuenta
node brain/sync/connectors/broker/broker.mjs pnl
```

### Ejemplo

```
$ node broker.mjs positions

[PAPER] Posiciones actuales:

  Ticker   Cant   Entrada    Actual     P/L          P/L%
  ────────────────────────────────────────────────────────────
  🟢 NVDA     10    1200,00    1220,33      +203,32    +1,69%
  🔴 MSFT      5     480,00     474,52       -27,40    -1,14%
```

## Como funciona el modo PAPER

- **Estado local:** todo vive en `brain/knowledge/trading/positions.json`. Si no
  existe, se crea al primer `add`. Estructura:

  ```json
  {
    "mode": "paper",
    "cash": 10600,
    "positions": [
      { "ticker": "NVDA", "qty": 10, "entry": 1200, "opened": "2026-06-30" }
    ],
    "updated": "2026-06-30"
  }
  ```

- **Cash inicial:** la cuenta paper arranca con $25.000. Cada `add` descuenta el
  costo (`qty * entrada`) del cash; cada `close` suma lo recibido
  (`qty * precio_actual`).

- **Precio actual simulado:** en lugar de `Math.random`, se usa un hash FNV-1a
  del `ticker + dia`. Esto produce una variacion deterministica en el rango
  `[-3%, +3%]` sobre el precio de entrada. Misma entrada → mismo precio durante el
  mismo dia, asi que las pruebas son reproducibles. **En modo REAL este precio
  vendria del endpoint de quotes de Schwab.**

- **`add` repetido sobre el mismo ticker** promedia el precio de entrada y suma la
  cantidad.

## Setup de Schwab (cuando este disponible)

> Pendiente: requiere que Jorge cree las credenciales. Pasos previstos:

1. Crear una app en **developer.schwab.com** (Schwab Trader API) y obtener
   `client_id` (App Key) y `client_secret` (Secret).
2. Completar el flujo **OAuth** (authorization code → refresh token) con el
   redirect URI registrado.
3. Guardar `{ client_id, client_secret, refresh_token }` encriptados en
   `brain/sync/connectors/broker/tokens.enc` siguiendo el mismo patron que
   gmail/calendar (`pbkdf2` + `aes-256-gcm`, contrasena maestra).
4. A partir de ahi, `fetchRealPositions()` refrescara el access token contra
   `https://api.schwabapi.com/v1/oauth/token` y leera las posiciones de
   `https://api.schwabapi.com/trader/v1/accounts?fields=positions`.

Ver el TODO en `broker.mjs` (`fetchRealPositions`) para el detalle del mapeo.

> **Seguridad:** `tokens.enc` esta cubierto por `.gitignore`
> (`brain/sync/connectors/**/tokens.enc`). Nunca se commitea.

## Como lo usa el skill de trading

El skill de **trading** (`skills/trading/SKILL.md`) invoca este conector para
responder "como van mis posiciones", balance y P/L con datos reales del broker en
lugar de solo la watchlist estatica. Ejemplo:

```bash
node brain/sync/connectors/broker/broker.mjs positions
node brain/sync/connectors/broker/broker.mjs pnl
```
