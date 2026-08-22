# Research OS Mobile

Version publica sanitizada del dashboard para acceso desde telefono.

Tambien funciona como PWA instalable en Android.

## Social Composer

La pantalla inicial incluye un compositor rapido para Instagram y Facebook.

Puede:

- Generar caption/post desde una idea en bruto.
- Copiar el texto para pegarlo en Instagram o Facebook.
- Usar el menu compartir del telefono cuando el navegador lo soporte.
- Guardar borradores localmente en el telefono.

No publica automaticamente ni guarda credenciales.

No contiene:

- Portfolio real.
- Credenciales.
- Rutas locales privadas.
- Gmail.
- Llaves API.
- Datos financieros sensibles.

## Instalar En Android

1. Abrir la URL publica en Chrome.
2. Menu de tres puntos.
3. Tocar "Agregar a pantalla principal" o "Instalar app".
4. Abrir desde el icono Research OS.

## Voice (prototipo Fase 0)

`voice.html` es el prototipo del dispositivo de un boton: mantener pulsado,
hablar, y el telefono ejecuta la tarea.

- Whisper transcribe la voz en tu PC.
- Ollama decide que hacer.
- El movil ejecuta o prepara la accion.

El puente que une ambos esta en [`server/`](server/README.md), sin dependencias.

Requiere `https://` para que el navegador de acceso al microfono. Ver
[`server/README.md`](server/README.md).

Analisis completo del dispositivo: [`DISPOSITIVO-BOTON.md`](DISPOSITIVO-BOTON.md).

Integracion con el sistema Jarvis local-first: [`JARVIS-INTEGRACION.md`](JARVIS-INTEGRACION.md).

Brief para el agente que construye Jarvis Core: [`PARA-CODEX.md`](PARA-CODEX.md)
(incluye el test de contrato `server/contract-test.mjs`).

Puesta en marcha en la PC (o instrucciones para Codex): [`SETUP-PC.md`](SETUP-PC.md).
