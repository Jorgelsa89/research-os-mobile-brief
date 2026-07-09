# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es este proyecto

Versión pública **sanitizada** del dashboard "Research OS" para acceso desde teléfono, instalable como PWA en Android. Es un sitio estático de vanilla HTML/CSS/JS: no hay package.json, build, framework, linter ni tests.

**Regla crítica de contenido:** este repo es la versión pública de un sistema privado. Nunca agregar aquí portfolio real, credenciales, llaves API, rutas locales privadas, datos de Gmail ni información financiera sensible. Todo el contenido de usuario está en español (mayormente sin tildes, siguiendo el estilo existente).

## Desarrollo local

No hay comandos de build. Para probar (el service worker requiere servidor HTTP, no `file://`):

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Despliegue

- Método principal: **GitHub Pages desde la raíz de la rama `main`** → https://jorgelsa89.github.io/research-os-mobile-brief/
- `vercel.json` existe como configuración alternativa (headers `noindex` y cache); el sitio está deliberadamente marcado noindex/nofollow también en los meta tags.
- Las rutas de `manifest.webmanifest` (`start_url`, `scope`, `id`) son absolutas a `/research-os-mobile-brief/` porque GitHub Pages sirve el sitio en un subpath. Si cambia el hosting, hay que ajustarlas.

## Arquitectura

- **`index.html`** — pantalla principal: Social Composer (genera captions para Instagram/Facebook, copia/comparte vía Web Share API, guarda borradores en `localStorage` bajo la clave `research-os-social-mobile-v1`) + brief de investigación estático (scorecard, acciones vinculadas, señales). Todo el JS está inline en este archivo; `styles.css` solo estiliza esta página. La generación de posts es 100% local con plantillas (`makeCTA`, `makeTags`, `buildPosts`) — no llama a ninguna API ni publica automáticamente.
- **`brain.html`** — visualización canvas del "brain map" del sistema completo (nodos + force layout). Es totalmente autocontenido (CSS y JS inline propios, no usa `styles.css`) y no está enlazado desde `index.html`; se accede por URL directa. Los datos de nodos/enlaces están hardcodeados en los arrays `NODES` y `LINKS`.
- **`sw.js`** — service worker cache-first. Al modificar assets hay que **incrementar `CACHE_NAME`** (`research-os-mobile-vN`) para invalidar la caché de instalaciones existentes, y al agregar archivos nuevos, sumarlos al array `ASSETS` (nota: `brain.html` no está precacheado actualmente).
- El brief de investigación (scores, acciones, fecha del footer) es contenido estático editado a mano en `index.html`; los datos "reales" viven en el sistema privado, no aquí.
