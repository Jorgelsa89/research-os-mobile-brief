---
title: "Metodologia de Options Trading — Framework Institucional"
date: 2026-06-18
ticker: SPX
score: 9.0
decision: Buy
status: activo
skill: trading
tags: [opciones, trading, methodology, spx, qqq, iwm, nvda, tlt, framework]
---

# Options Trading — Framework Institucional Completo

## Filosofia central

> El dinero serio no se hace por "tener razon" en direccion; se hace por
> comprar barato lo que otros subestiman y vender caro lo que otros
> sobrepagan, controlando el dano cuando estas equivocado.

## Universo base: 5 activos principales

| Activo | Por que lo miro | Que busco |
|--------|----------------|-----------|
| **SPX/SPY** | Termometro macro, mercado mas limpio para 0DTE/1DTE | Gamma, VIX, rango esperado, niveles de dealer, skew de puts |
| **QQQ** | Tech/growth beta, sensible a tasas y momentum | Divergencia vs SPX, liderazgo/debilidad, calls/puts con mejor convexidad |
| **IWM** | Small caps, breadth, riesgo ciclico | Confirmacion o divergencia del rally, sensibilidad a tasas/credit |
| **NVDA** | Single-name liquido con volatilidad, narrativa y flujo | Event risk, call skew, IV extrema, setups de spreads/butterflies |
| **TLT** | Proxy de tasas, conecta con macro, Fed, inflacion | Reaccion a yields, CPI/FOMC/NFP, convexidad en bonos |

SPX es especial: cash settlement, ejercicio europeo, expiraciones diarias/weekly.

---

## Logica central: Regimen -> Estructura -> Trade

### Pregunta antes de mirar cualquier cadena:

> **El mercado esta pagando demasiado o demasiado poco por el movimiento
> que probablemente viene?**

---

## 1. Regimen del dia

Clasificar a las 7:30-9:15 ET:

| Regimen | Condiciones | Estrategia |
|---------|------------|-----------|
| **Trend day** | Futuros direccionales, yields/dolar apoyando, noticias claras, breadth fuerte | Comprar gamma direccional, verticals |
| **Range day** | Sin catalizador, VIX bajando, dentro del rango previo, OI cerca | Vender premium con riesgo definido |
| **Event day** | CPI, FOMC, NFP, earnings, subasta de bonos, Powell | No vender premium sin saber si el evento esta bien pagado |
| **Stress day** | VIX sube, spreads se abren, correlaciones a 1 | Comprar convexidad o esperar, evitar short gamma |

---

## 2. Rango esperado

> **Expected Move ≈ precio del straddle ATM**

Ejemplo: SPX en 5,500, straddle ATM 0DTE cuesta 45 puntos → mercado dice ±45 puntos.

| Si veo esto | Entonces |
|-------------|----------|
| Expected move barato + catalizador real | Comprar gamma: straddle, strangle, debit spread |
| Expected move caro + mercado atrapado | Vender premium con riesgo definido |
| Expected move caro + posible ruptura violenta | No vender; esperar o comprar cola barata |
| Expected move barato pero sin catalizador | Cuidado: barato puede seguir barato |

---

## 3. Volatilidad: IV vs RV, skew y term structure

| Dimension | Que miro |
|-----------|----------|
| **IV vs RV** | IV por encima o debajo de movimiento real? |
| **Term structure** | IV corto plazo mas cara que largo? (eventos/estres) |
| **Skew** | Puts OTM mas caros que calls? (institucionales compran proteccion) |

### Greeks en trading diario

| Greek | Que significa |
|-------|-------------|
| Delta | Direccion: sube/baja |
| Gamma | Aceleracion: cuanto explota delta si se mueve el subyacente |
| Theta | Tiempo: lo que pagas o cobras por esperar |
| Vega | Sensibilidad a cambios de IV |

---

## 4. Matriz de decision

| Vista | IV | Estructura preferida |
|-------|----|--------------------|
| Alcista fuerte | barata | Call debit spread / call diagonal |
| Alcista fuerte | cara | Put credit spread / broken-wing call butterfly |
| Bajista fuerte | barata | Put debit spread |
| Bajista fuerte | cara | Call credit spread / put butterfly |
| Sin direccion | cara | Iron condor / iron fly con riesgo definido |
| Sin direccion | barata | No trade o calendario si hay evento futuro |
| Evento subestimado | barata | Straddle / strangle / backspread |
| Evento sobrepagado | cara | Calendar, diagonal o esperar post-evento |

**Regla: no vender naked premium.**

---

## 5. Setups por activo

### SPX — Setup A: dia de rango
- SPX abre dentro del rango anterior
- VIX plano o bajando
- Sin catalizador fuerte
- Expected move alto vs movimiento real
- **Trade:** Iron condor 0DTE/1DTE, alas fuera del expected move
- **Entrada:** despues de primeros 15-30 min
- **Stop:** si rompe rango con volumen o perdida 1.5x-2x credito
- **Gestion:** cerrar al 50%-70% de ganancia

### SPX — Setup B: dia de ruptura
- Futuros fuertes/debiles, QQQ confirma
- VIX no cae en rally o sube en selloff
- Apertura rompe nivel clave y retestea
- **Trade:** Debit spread 0DTE/1DTE en la direccion

### QQQ — Confirmacion tech
- Comparar QQQ vs SPX
- Si QQQ lidera + yields bajan + mega caps empujan → call spread
- Si QQQ debil + SPX plano → put debit spread

### IWM — Detector de verdad
- Si SPX y QQQ suben + IWM rompe fuerte → mercado sano, mas agresivo
- Si SPX en maximos + IWM debil → rally estrecho, puts baratos en IWM

### NVDA — Volatilidad con esteroides
- No comprar calls OTM despues de gap con IV inflada
- Si alcista pero calls caras → call butterfly o broken-wing butterfly
- Si movimiento grande + IV barata → straddle/strangle
- Si IV carisima → esperar post-vol crush

### TLT — Ventana de tasas
- Catalizadores: CPI, FOMC, NFP, subastas, Fed
- Evento subestimado + straddle barato → long straddle/strangle
- Evento sobrepagado → calendar spread

---

## 6. Framework de puntuacion (0-10)

| Factor | Puntos |
|--------|--------|
| Direccion clara | 0-2 |
| Volatilidad mal valorada | 0-2 |
| Catalizador limpio | 0-2 |
| Liquidez excelente | 0-1 |
| Estructura con riesgo definido | 0-1 |
| Buen timing de entrada | 0-1 |
| Invalidez clara | 0-1 |

| Score | Accion |
|-------|--------|
| 8-10 | Trade A, tamano normal |
| 6-7 | Trade pequeno o esperar confirmacion |
| 0-5 | No trade |

---

## 7. Checklist antes de entrar

1. Cual es mi edge? (direccion, volatilidad, skew, tiempo, flujo)
2. Que Greek me puede matar?
3. Donde invalido la idea?
4. Estoy pagando demasiado spread?
5. Hay evento pendiente?
6. Mi tamano permite sobrevivir?
7. La estructura expresa exactamente mi tesis?
8. Que pasa si el mercado no se mueve?

---

## 8. Reglas duras de riesgo ($10,000 cuenta)

- Riesgo por trade: $100-$200 maximo
- Trades por dia: 0-2
- Perdida maxima diaria: $300-$400
- Perdida maxima semanal: $700-$1,000
- 3 trades seguidos perdidos → parar
- No naked options
- No 0DTE sin supervision
- No market orders en opciones
- Cerrar ganadores parciales

---

## 9. El anti-trade

Cada manana buscar la operacion obvia que todos quieren hacer y que probablemente esta sobrepagada:

- Todos compran calls NVDA post-gap → call skew caro
- Todos compran puts SPX post-caida → put skew caro
- Todos venden 0DTE "porque expira" → gamma peligrosa
- Todos operan FOMC antes del statement → edge esta despues

---

## 10. Proyecciones para $10,000

| Estilo | Mensual | 3 meses | Riesgo |
|--------|---------|---------|--------|
| Conservador | 2-4% ($200-$400) | $612-$1,249 | bajo/medio |
| Moderado | 5-8% ($500-$800) | $1,576-$2,597 | medio/alto |
| Agresivo | 10-20% ($1,000-$2,000) | $3,310-$7,280 | alto/muy alto |

**Meta razonable:** $500-$800/mes = 5-8% mensual.

### Expectativa matematica ejemplo:
- 30 trades en 3 meses, 55% win rate
- Ganancia promedio: $180, perdida promedio: $120
- Expectativa = 30 × [(0.55 × 180) - (0.45 × 120)] = **$1,350** (13.5% en 3 meses)

---

## Conexiones

- Ver [[watchlist]] para acciones monitoreadas
- Proyecto relacionado: Robin Hood Agent (opciones scanner)
- Framework: Regimen → Expected Move → IV/RV → Skew → Catalyst → Liquidez → Estructura → Riesgo
