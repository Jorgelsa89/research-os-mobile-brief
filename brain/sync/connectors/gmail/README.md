# Conector: Gmail

Permite a Axon leer correos, hacer triage del inbox y enviar mensajes desde tu Gmail.

## Setup (una sola vez, desde tu PC)

### Paso 1 — Habilitar Gmail API en Google Cloud

1. Ve a https://console.cloud.google.com
2. Selecciona el proyecto **"Axon Brain"** (el mismo que usas para Calendar)
3. En el menu lateral: **APIs y servicios → Biblioteca**
4. Busca "Gmail API" → Habilitar

> **Nota:** Si ya tienes el proyecto "Axon Brain" configurado para Google Calendar, solo necesitas habilitar la Gmail API. No hace falta crear un proyecto nuevo.

### Paso 2 — Credenciales OAuth

**Opcion A — Mismo client_secret.json que Calendar (recomendado):**

Si ya tienes `brain/sync/connectors/google-calendar/client_secret.json`, puedes usar el mismo archivo:

```bash
cp brain/sync/connectors/google-calendar/client_secret.json \
   brain/sync/connectors/gmail/client_secret.json
```

El archivo OAuth ya incluye los permisos necesarios — Google valida los scopes en el momento de la autorizacion, no en las credenciales.

**Opcion B — Credenciales separadas:**

1. Ve a **APIs y servicios → Credenciales**
2. Click "Crear credenciales" → **ID de cliente OAuth 2.0**
3. Tipo de aplicacion: **App de escritorio**
4. Nombre: "Axon Brain Gmail"
5. Click Crear → **Descargar JSON**
6. Renombra como `client_secret.json`
7. Ponlo en: `brain/sync/connectors/gmail/client_secret.json`

### Paso 3 — Pantalla de consentimiento OAuth

Si es la primera vez (proyecto nuevo):

1. Ve a **APIs y servicios → Pantalla de consentimiento OAuth**
2. Tipo de usuario: **Externo**
3. Nombre de la app: "Axon Brain"
4. Email de soporte: tu email
5. Agregar tu Gmail en "Usuarios de prueba"
6. Guardar

Si ya configuraste esto para Calendar, no necesitas repetirlo.

### Paso 4 — Autorizar (corre esto en tu PC)

```bash
# En la raiz del proyecto:
node brain/sync/connectors/gmail/auth.mjs
```

- Se abre una URL en tu browser
- Autoriza con tu cuenta de Google
- El script captura el token automaticamente en puerto 3001 (distinto al de Calendar que usa 3000)
- Ingresa tu contrasena maestra cuando te la pida
- Los tokens quedan encriptados en `tokens.enc`

### Paso 5 — Verificar que funciona

```bash
node brain/sync/connectors/gmail/gmail.mjs unread
```

## Comandos disponibles

```bash
# Ver los ultimos 10 correos del inbox
node brain/sync/connectors/gmail/gmail.mjs list

# Ver los ultimos N correos
node brain/sync/connectors/gmail/gmail.mjs list 20

# Leer el contenido completo de un correo (usa el ID que muestra list)
node brain/sync/connectors/gmail/gmail.mjs read <id>

# Ver solo los correos no leidos
node brain/sync/connectors/gmail/gmail.mjs unread

# Triage del inbox con categorias automaticas
node brain/sync/connectors/gmail/gmail.mjs triage

# Enviar un correo
node brain/sync/connectors/gmail/gmail.mjs send "destino@email.com" "Asunto" "Cuerpo del mensaje"
```

## Categorias del triage

| Categoria | Criterio |
|-----------|----------|
| URGENTE | Palabras clave: urgente, error, alerta, critico, security, suspension |
| SEGUIMIENTO | Re:, Fwd:, recordatorio, follow up, actualizacion |
| SPAM | noreply, newsletter, marketing, promocion, notificacion automatica |
| INFORMATIVO | Todo lo demas |

## Uso desde Axon

Una vez configurado, puedes decirle a Axon:
- "Revisa mis correos"
- "Que tengo sin leer en el inbox?"
- "Haz triage de mi inbox"
- "Lee el correo con ID 18abc123"
- "Envia un correo a jorge@email.com con asunto Prueba"

## Seguridad

- El token de acceso nunca se guarda en texto plano
- El refresh token vive en `tokens.enc` encriptado con AES-256-GCM
- La clave se deriva con PBKDF2 SHA-512 (100,000 iteraciones) de tu contrasena maestra
- Si pierdes acceso: revocar en https://myaccount.google.com/permissions y repetir el setup desde el Paso 4
- Scopes usados: `gmail.readonly` (leer) y `gmail.compose` (enviar) — no tiene acceso a borrar correos
