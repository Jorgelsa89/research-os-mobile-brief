# Deploy de las landing pages (GitHub Pages)

Esta guia explica como se publican las paginas estaticas de Axon a GitHub Pages
mediante GitHub Actions.

## URL publica

```
https://jorgelsa89.github.io/research-os-mobile-brief/
```

## Activar GitHub Pages (una sola vez)

1. Ve al repositorio en GitHub: `jorgelsa89/research-os-mobile-brief`.
2. Entra a **Settings → Pages**.
3. En **Build and deployment → Source**, selecciona **GitHub Actions**.
   (No uses "Deploy from a branch": el deploy lo maneja el workflow.)
4. Guarda. A partir de ahi, cada despliegue del workflow queda publicado.

## Deploy automatico

El workflow `.github/workflows/deploy-pages.yml` se ejecuta automaticamente
en **cada push a la rama `main`**. Construye el sitio y lo publica en la URL
de arriba sin intervencion manual.

## Deploy manual (workflow_dispatch)

Si quieres forzar un deploy sin hacer push:

1. Ve a la pestaña **Actions** del repo.
2. Selecciona el workflow **Deploy Pages** en la barra lateral.
3. Pulsa **Run workflow** → elige la rama `main` → **Run workflow**.

## Paginas que quedan publicas

| Ruta | Archivo origen | Descripcion |
|------|----------------|-------------|
| `/` (home) | `axon.html` | Landing principal del producto (copiada a `index.html`) |
| `/axon.html` | `axon.html` | Misma landing, con su nombre original |
| `/app.html` | `index.html` | PWA original de Research OS |
| `/pricing.html` | `pricing.html` | Pagina de precios |
| `/dashboard.html` | `dashboard.html` | Dashboard |
| `/jarvis.html` | `jarvis.html` | Interfaz Jarvis |
| `/brain.html` | `brain.html` | Vista del cerebro |

Assets publicos: `manifest.webmanifest`, `styles.css`, `sw.js`, `.nojekyll`
e iconos PWA en `/icons/*.png`.

> Nota: `admin.html` NO se publica intencionalmente (panel interno).

## Que NO se publica (seguridad)

El workflow usa una **allowlist explicita**: solo copia los archivos enumerados
arriba a un directorio `_site/` antes de subirlos. Nunca se publica:

- `brain/` — el cerebro digital (memoria, conocimiento, identidad).
- `monetize/` — claves (`*.pem`, `*.key`), `sales-log`, archivos `*.enc`, tokens.
- `test/`, `skills/`, `scripts/`, y cualquier codigo del backend (`*.mjs`).
- Cualquier credencial, token o dato sensible.

Si necesitas publicar un archivo nuevo, **agregalo explicitamente** al paso
`Build _site` del workflow. No hay copia masiva ni blocklist.

## Dominio custom (futuro)

Cuando exista un dominio propio (ej. `axon.app`):

1. Agrega un archivo `CNAME` con el dominio al paso `Build _site` del workflow
   (ej. `echo "axon.app" > _site/CNAME`), o configuralo en **Settings → Pages →
   Custom domain**.
2. Crea los registros DNS:
   - `CNAME` de `www` → `jorgelsa89.github.io`.
   - Para el apex, registros `A`/`AAAA` a las IPs de GitHub Pages.
3. Activa **Enforce HTTPS** en Settings → Pages una vez verificado el dominio.
