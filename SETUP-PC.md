# Puesta en marcha en la PC (Windows)

Para ejecutar en la PC — por ti cuando llegues, o por Codex ahora mismo,
que sí tiene manos en esa máquina.

---

## Bloque para pegar a Codex

> Pon en marcha el puente de voz de este repo en esta PC. Pasos:
>
> 1. Clona o actualiza el repo, rama exacta:
>    `git clone --branch claude/ai-assistant-device-button-tz69jj https://github.com/Jorgelsa89/research-os-mobile-brief.git`
>    (si ya existe, `git fetch && git checkout claude/ai-assistant-device-button-tz69jj && git pull`)
> 2. Verifica Node 20+ (`node --version`); si falta, instálalo (winget: `OpenJS.NodeJS.LTS`).
> 3. Verifica que Ollama corre (`ollama list`) y que hay un modelo con tool
>    calling; si no: `ollama pull llama3.1:8b`.
> 4. Levanta un servidor Whisper local en el puerto 8000. Sin Docker, la vía
>    más simple en Windows es el binario `whisper-server` de whisper.cpp
>    (releases de su GitHub) con un modelo `large-v3-turbo`; en ese caso el
>    puente necesita `WHISPER_PATH=/inference`. Con Docker Desktop, la imagen
>    de speaches expone directamente la ruta OpenAI por defecto. Consulta el
>    README del proyecto elegido; lo único que importa es puerto y ruta.
> 5. Arranca el puente desde la raíz del repo:
>    `node server/server.mjs`  (o `server\start-windows.ps1`, que hace las
>    comprobaciones por ti). Variables en `server/README.md`.
> 6. Comprueba `http://localhost:8788/api/health` — debe dar
>    `{"whisper":true,"ollama":true,...}`. Si algo da false, arregla ese
>    servicio antes de seguir.
> 7. Si Tailscale está instalado: `tailscale serve --bg 8788` y reporta la
>    URL `https://…ts.net` resultante.
> 8. Reporta: salida de /api/health, la URL de Tailscale, y cómo dejaste
>    corriendo los procesos (ventanas, servicios, tareas programadas).
>
> No toques nada fuera de la carpeta del repo salvo instalar lo listado.
> El puente escucha solo en 127.0.0.1; no abras puertos públicos.

---

## Si lo haces tú a mano

Los mismos pasos, en corto:

```powershell
git clone --branch claude/ai-assistant-device-button-tz69jj https://github.com/Jorgelsa89/research-os-mobile-brief.git
cd research-os-mobile-brief
ollama pull llama3.1:8b        # si no lo tienes ya
# + servidor Whisper en :8000 (ver server/README.md, sección 2)
powershell -File server\start-windows.ps1
tailscale serve --bg 8788      # URL https para el móvil
```

Abre la URL de Tailscale en Chrome del móvil → menú ⋮ → "Instalar app".
Esa es la app del botón.

## Qué debe quedar encendido

| Proceso | Para qué |
|---|---|
| Ollama | el cerebro |
| Whisper (puerto 8000) | voz a texto |
| `node server/server.mjs` | el puente y los encargos en el fondo |
| Tailscale | HTTPS hasta el móvil, dentro y fuera de casa |

Si la PC se reinicia, los encargos que estaban en cola se retoman solos al
arrancar el puente; lo único que hay que relanzar son estos procesos.
