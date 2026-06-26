# Conector: Google Calendar

Permite a Axon leer y escribir eventos en tu Google Calendar.

## Setup (una sola vez, desde tu PC)

### Paso 1 — Crear proyecto en Google Cloud (5 minutos)

1. Ve a https://console.cloud.google.com
2. Click "Nuevo proyecto" → nombra "Axon Brain" → Crear
3. En el menu lateral: **APIs y servicios → Biblioteca**
4. Busca "Google Calendar API" → Habilitar
5. Ve a **APIs y servicios → Credenciales**
6. Click "Crear credenciales" → **ID de cliente OAuth 2.0**
7. Tipo de aplicacion: **App de escritorio**
8. Nombre: "Axon Brain"
9. Click Crear → **Descargar JSON**
10. Renombra el archivo descargado como `client_secret.json`
11. Ponlo en: `brain/sync/connectors/google-calendar/client_secret.json`

### Paso 2 — Pantalla de consentimiento OAuth

En la misma consola:
1. Ve a **APIs y servicios → Pantalla de consentimiento OAuth**
2. Tipo de usuario: **Externo** (aunque sea solo para ti)
3. Nombre de la app: "Axon Brain"
4. Email de soporte: tu email
5. Agregar correo en "Usuarios de prueba": tu Gmail
6. Guardar

### Paso 3 — Autorizar (corre esto en tu PC)

```bash
# En la raiz del proyecto:
node brain/sync/connectors/google-calendar/auth.mjs
```

- Se abre una URL en tu browser
- Autoriza con tu cuenta de Google
- El script captura el token automaticamente
- Sigue las instrucciones para encriptarlo

### Paso 4 — Encriptar el token

```bash
node brain/security/crypto.mjs write google-calendar
# Ingresa tu contraseña maestra cuando te la pida
# Pega el contenido del archivo .tokens_temp.json
```

```bash
# Borrar el archivo temporal (IMPORTANTE)
rm brain/sync/connectors/google-calendar/.tokens_temp.json
```

### Paso 5 — Verificar que funciona

```bash
node brain/sync/connectors/google-calendar/calendar.mjs today
```

## Uso desde Claude Code

Una vez configurado, puedes decirle a Axon:
- "Agrega al calendario: reunion con cliente el viernes a las 3pm"
- "Que tengo hoy en el calendario?"
- "Muéstrame los eventos de esta semana"

Claude Code ejecuta el conector internamente y responde con los resultados.

## Comandos directos

```bash
# Agregar evento
node brain/sync/connectors/google-calendar/calendar.mjs add "Salida Boho" "2026-06-27T21:30:00" 120

# Ver hoy
node brain/sync/connectors/google-calendar/calendar.mjs today

# Ver manana
node brain/sync/connectors/google-calendar/calendar.mjs tomorrow

# Ver proximos N dias
node brain/sync/connectors/google-calendar/calendar.mjs list 7
```

## Seguridad

- El token de acceso nunca se guarda en texto plano
- El refresh token vive en `brain/identity/` encriptado con tu contraseña maestra
- Si pierdes acceso: revocar en https://myaccount.google.com/permissions y repetir el setup
