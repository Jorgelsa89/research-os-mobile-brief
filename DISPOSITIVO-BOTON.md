# Dispositivo de un botón + teléfono como estación de procesamiento

Análisis de viabilidad y arquitectura.

---

## 1. Veredicto corto

**Sí es posible, y la parte difícil no es el hardware.**

El dispositivo físico (botón + micrófono + Bluetooth + batería) es ingeniería
resuelta: se puede tener un prototipo funcional en semanas con placas que ya
existen. Lo difícil, y donde se va el 90% del esfuerzo real, es:

1. Que el agente **acierte** al ejecutar tareas sin supervisión.
2. Que el teléfono **le deje** hacer esas tareas (permisos, APIs cerradas).
3. Que responda **rápido** (menos de 2 segundos o se siente roto).

La buena noticia: la decisión de fondo de la idea — que el teléfono sea la
estación de procesamiento y el dispositivo solo el disparador — es
exactamente la decisión correcta. Es lo que separa a los productos de esta
categoría que sobreviven de los que murieron.

---

## 2. Por qué esa decisión es la correcta

Los intentos previos de esta categoría dejaron una lección clara:

| Producto | Enfoque | Resultado |
|---|---|---|
| Humane AI Pin | Dispositivo autónomo, con su propia conexión celular y su propia pantalla proyectada | Fracaso comercial, descontinuado |
| Rabbit R1 | Dispositivo autónomo con pantalla, intentaba sustituir al teléfono | Muy criticado, funcionalidad por debajo de lo prometido |
| Limitless Pendant | Colgante que depende del teléfono | Sigue vivo |
| Plaud | Grabadora que depende del teléfono | Producto con ventas reales |
| Bee | Pulsera barata que depende del teléfono | Adquirida por Amazon |
| Omi / Friend | Open source, depende del teléfono | Comunidad activa |

El patrón es evidente. **Los que intentaron reemplazar al teléfono
fracasaron. Los que se apoyaron en él siguen en pie.**

La razón es económica antes que técnica: un dispositivo autónomo tiene que
pagar módem, batería grande, pantalla, plan de datos y cómputo propio. Un
disparador que se apoya en el teléfono cuesta 15 dólares en componentes y
hereda gratis la pantalla, la conexión, la identidad, las sesiones iniciadas
y todo el contexto personal del usuario.

Ese es el punto fuerte de la idea tal y como está planteada.

---

## 3. Las tres arquitecturas posibles

Hay tres formas de construir esto, con perfiles de esfuerzo muy distintos.

### Opción A — Botón tonto (sin micrófono)

El dispositivo es solo un botón Bluetooth HID. Al pulsarlo envía la tecla de
"asistente de voz". **El micrófono que se usa es el del teléfono.**

- Coste hardware: muy bajo. Consumo: mínimo (meses de batería).
- Complejidad: la más baja de las tres. No hay streaming de audio.
- Limitación real: hay que sacar el teléfono o hablarle de cerca. Si el
  teléfono está en el bolsillo o en el bolso, la captura es mala.

**Es la opción infravalorada.** Para validar todo el software vale, y se
puede comprar un mando Bluetooth genérico hoy mismo para probar el concepto
sin fabricar nada.

### Opción B — Perfil de auricular Bluetooth estándar (HFP)

El dispositivo se presenta al teléfono como unos auriculares manos libres
normales. El botón dispara el asistente igual que el de unos AirPods.

- Ventaja grande: **funciona en iOS y Android sin protocolo propio**. El
  sistema operativo ya sabe tratar con un auricular.
- Desventaja: audio de banda estrecha o ancha (8/16 kHz), suficiente para
  voz pero no para más; y se depende del gancho del asistente del sistema,
  que no siempre se puede redirigir a una app propia.

### Opción C — BLE propio con micrófono (control total)

El dispositivo tiene su micrófono MEMS, comprime la voz en Opus a bordo y la
manda por un servicio GATT propio a una app propia.

- Control total del formato, la latencia, el feedback háptico y el protocolo.
- Es la única que da la experiencia completa "hablo a mi solapa con el
  teléfono guardado".
- Es también la que más trabajo tiene: firmware, protocolo, gestión de
  reconexión, app en dos plataformas.

### Recomendación

**Empezar por A, terminar en C.** La opción A permite construir y validar
todo el cerebro del sistema sin fabricar nada. La C solo aporta valor cuando
el software ya funciona, y entonces la mejora es real y notable.

---

## 4. Arquitectura recomendada (destino final)

```
[DISPOSITIVO]                [TELÉFONO]                    [NUBE]
                             estación de procesamiento
 botón ─┐
        │  pulsar y hablar
 mic ───┼──► Opus ──BLE──► servicio en primer plano
        │                        │
 LED ◄──┤                        ├─► transcripción (voz a texto)
 vibra ◄┘                        │
        ◄── confirmación         ├─► clasificador de intención
                                 │      │
                                 │      ├── tarea instantánea
                                 │      │   └─► herramientas locales
                                 │      │       (agenda, contactos,
                                 │      │        recordatorios, ubicación)
                                 │      │
                                 │      └── tarea de investigación
                                 │          └───────────────────► agente
                                 │                                con
                                 │                                navegador
                                 │                                y búsqueda
                                 │                                    │
                                 ◄────── resultado (notificación) ◄────┘
                                 │
                                 └─► voz de vuelta / tarjeta en pantalla
```

La clave del diseño está en esa bifurcación entre tarea instantánea y tarea
de investigación. Es lo que hace que el producto se sienta rápido.

---

## 5. Las dos clases de tarea (esto es lo importante)

De los ejemplos planteados, no todos son la misma cosa. Se dividen en dos
grupos que necesitan tratamiento opuesto:

### Instantáneas — se responden en voz, en menos de 2 segundos

- "Recuérdame llamar al taller mañana a las 10."
- "Manda un mensaje a Ana diciendo que llego tarde."
- "¿Cuánto es 340 entre 12?"
- "Apúntame que el coche está en la planta 3."

Se resuelven en el teléfono, con datos locales, sin salir a Internet.
Respuesta hablada inmediata. El bucle se cierra ahí.

### Diferidas — se confirman al instante, se entregan después

- "Compárame los precios de estas dos cámaras."
- "Búscame el seguro más económico para el coche."
- "Averigua a qué hora abre y si hay que reservar."

Estas **no se pueden responder en 2 segundos y no se deben intentar.**
Requieren navegar varias webs, comparar, y producir una tabla. El
comportamiento correcto es:

1. Confirmación inmediata por voz: *"Voy a mirarlo, te aviso."*
2. Vibración corta. El usuario sigue con su vida.
3. El agente trabaja en segundo plano (en la nube, no en el teléfono).
4. Notificación cuando termina, con el resultado **en pantalla**, no en voz.

Aquí hay una idea de producto que merece la pena subrayar:

> El dispositivo no necesita pantalla **porque el teléfono ya es la
> pantalla**. Se captura la intención con la voz y se entrega el resultado
> con los ojos. Una comparativa de dos cámaras es una tabla, no un párrafo
> hablado.

Intentar leer en voz alta una comparativa de precios es exactamente el error
que hace que estos productos se sientan inútiles.

---

## 6. Hardware (para cuando toque la opción C)

### Prototipo — se puede montar ya

| Pieza | Elección | Aprox. |
|---|---|---|
| Placa | Seeed XIAO nRF52840 Sense | 25 USD |
| Micrófono | Ya incluido en la placa (PDM) | — |
| Batería | LiPo 150–250 mAh | 5 USD |
| Botón | Táctil + motor de vibración | 3 USD |
| Carcasa | Impresión 3D en resina | 10 USD |

Esa placa mide unos 21 × 17,5 mm, lleva Bluetooth de bajo consumo, micrófono
integrado y gestión de carga de batería. Es literalmente un iPod shuffle en
potencia. **Un prototipo real cuesta menos de 50 dólares.**

### Producción

- Microcontrolador: Nordic nRF52840 o nRF5340.
- Micrófono MEMS digital.
- Codificación Opus a bordo, entre 16 y 32 kbps. Mandar audio sin comprimir
  (256 kbps) satura el enlace y se come la batería.
- Carga por USB-C, imán o clip para la ropa.
- Acelerómetro opcional para despertar con un golpecito.

Costes no recurrentes realistas: entre 5.000 y 15.000 USD de diseño de
placa, entre 10.000 y 30.000 de molde de inyección para la carcasa, más
certificaciones de radio (FCC, CE) y cualificación Bluetooth, que suman
varios miles más. **La certificación sorprende a todo el mundo: no es
opcional para vender un producto con radio.**

---

## 7. El presupuesto de latencia

Es donde se gana o se pierde la sensación de magia. Objetivo: **primer
sonido de vuelta en menos de 1,5 segundos.**

| Etapa | Presupuesto |
|---|---|
| Conexión Bluetooth | 0 ms (se mantiene conectado siempre) |
| Audio en streaming mientras se habla | solapado |
| Transcripción tras dejar de hablar | 200–400 ms |
| Primera respuesta del modelo | 300–800 ms |
| Primer audio de vuelta | 150–250 ms |
| **Total** | **~1,2 s** |

Solo se consigue si **todo va en streaming**: no esperar a tener la
transcripción entera para empezar a pensar, ni la respuesta entera para
empezar a hablar. Si se hace por etapas completas, se van 4 o 5 segundos y
el producto se siente muerto.

Truco que ayuda mucho: la confirmación háptica al soltar el botón es
instantánea y compra unos cientos de milisegundos de percepción.

---

## 8. Qué puede hacer el teléfono realmente (la parte honesta)

Aquí es donde la mayoría de estos proyectos se estrellan. No todo lo que
suena razonable está permitido.

| Tarea | Android | iOS | Nota |
|---|---|---|---|
| Recordatorios y agenda | Sí | Sí | API oficial de calendario |
| Leer contactos | Sí | Sí | Con permiso |
| Enviar SMS | Sí, con fricción | No | Google restringe el permiso de SMS en Play Store salvo apps de mensajería por defecto |
| Enviar WhatsApp | Parcial | Parcial | **No hay API para cuentas personales.** Solo se puede abrir el chat con el texto ya escrito, y el usuario da a enviar |
| Enviar Telegram | Sí | Sí | Sí tiene API abierta |
| Llamadas | Sí | Parcial | |
| Ubicación | Sí | Sí | |
| Leer notificaciones | Sí | No | Android lo permite, iOS no |
| Búsqueda y navegación web | Sí | Sí | Mejor en la nube |
| Control de otras apps | Frágil | No | Vía accesibilidad; se rompe con cada actualización y es terreno resbaladizo |

**Las dos conclusiones incómodas:**

1. **Mandar un WhatsApp de forma totalmente automática no se puede.** No hay
   API para cuentas personales. Lo honesto es dejar el mensaje escrito y que
   el usuario solo tenga que confirmar. Telegram y SMS sí se pueden del
   todo. Conviene diseñar el producto asumiendo esto desde el principio en
   lugar de descubrirlo tarde.

2. **iOS es mucho más cerrado que Android.** Menos acceso en segundo plano,
   menos automatización, sin lectura de notificaciones. Lo sensato es
   **empezar por Android** y llevar a iOS una versión reducida después.

---

## 9. Dónde vive el cómputo

Conviene ser preciso con esto, porque la idea de "el teléfono lo procesa
todo" es romántica pero no del todo cierta.

**En el teléfono debe vivir:** el contexto personal. Contactos, agenda,
ubicación, hábitos, notificaciones, sesiones iniciadas. Eso es lo que el
teléfono tiene y la nube no. Ese es su valor irreemplazable.

**En la nube debe vivir:** el trabajo pesado. Comparar precios de cámaras
implica abrir muchas páginas, leerlas y contrastarlas. Hacer eso en el
teléfono es lento, se come la batería y falla con la pantalla apagada.

Así que la formulación exacta es: **el teléfono es el orquestador y la
puerta al contexto personal, no el músculo.** Decide qué hay que hacer,
aporta lo que solo él sabe, y delega lo caro. Que es justamente lo que hace
que valga la pena que el dispositivo hable con el teléfono y no directamente
con Internet.

---

## 10. Privacidad — a favor, no en contra

El botón es una ventaja de diseño, no una limitación.

Los productos de esta categoría que peor recepción han tenido son los que
escuchan siempre. Un dispositivo de pulsar para hablar tiene una respuesta
sencilla y verificable a la pregunta incómoda: **el micrófono solo se activa
cuando se pulsa, y el LED lo indica.**

Merece la pena que eso sea comprobable en el hardware, no solo en el
software: que la alimentación del micrófono dependa físicamente del botón.
Es un argumento de venta contundente y cuesta muy poco implementarlo.

Aviso legal: grabar conversaciones con terceros tiene reglas distintas según
el país. Un dispositivo de pulsar para hablar dirigido a uno mismo evita casi
todo ese problema; uno de escucha continua lo tiene de lleno.

---

## 11. Plan por fases

### Fase 0 — Validar el cerebro sin fabricar nada (días)

Sin hardware propio. Se dispara con un mando Bluetooth genérico, un widget o
un botón en pantalla. Se construye el bucle completo: voz → intención →
herramientas → respuesta.

**Es la fase más importante y la que casi todo el mundo se salta.** Si el
agente no acierta con las tareas, el hardware más bonito del mundo no lo
salva. Y si acierta, ya hay un producto útil antes de gastar un euro en
fabricación.

Criterio para pasar de fase: que se use a diario durante dos semanas por
gusto propio.

### Fase 1 — Dispositivo real, hecho a mano (semanas)

XIAO nRF52840 Sense, batería, botón, carcasa impresa en 3D. Menos de 50
dólares. Ya es el objeto: se lleva encima, se pulsa, funciona.

Aquí se aprende lo que ninguna simulación enseña: cuánto dura la batería de
verdad, si el botón se pulsa solo en el bolsillo, si el Bluetooth aguanta el
día, si molesta llevarlo.

### Fase 2 — Producto (meses)

Placa propia, carcasa moldeada, certificaciones, fabricación. Solo tiene
sentido con las fases 0 y 1 superadas.

---

## 12. Qué haría primero

La tentación natural es empezar por el objeto, porque es lo emocionante. Es
el orden equivocado.

**El primer paso correcto: una app en Android que, al pulsar un botón en
pantalla, escuche, entienda y ejecute las tareas de la lista de ejemplos.**
Sin Bluetooth, sin dispositivo, sin fabricación.

Si eso funciona bien, el resto es trabajo conocido y acotado. Si eso no
funciona bien, el dispositivo no arregla nada.

---

## 13. Resumen

| Pregunta | Respuesta |
|---|---|
| ¿Se puede construir? | Sí, sin duda |
| ¿Es la arquitectura correcta? | Sí — apoyarse en el teléfono es lo que distingue a los que sobreviven |
| ¿Cuál es la parte difícil? | La fiabilidad del agente y los permisos del teléfono, no el hardware |
| ¿Cuánto cuesta un prototipo? | Menos de 50 USD y unas semanas |
| ¿Cuánto cuesta un producto? | Decenas de miles, sobre todo en molde y certificación |
| ¿Por dónde empezar? | Por el software, en Android, sin hardware |
| ¿Mayor riesgo técnico? | Latencia y automatización de mensajería |
| ¿Mayor riesgo de producto? | Que el agente falle en tareas reales |
