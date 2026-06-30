# Onboarding de Paola — Primera licencia Pro

> Guia para que Jorge prepare el paquete de Paola y ella arranque en minutos.
> Este es el flujo probado de extremo a extremo para cualquier usuario nuevo.

## Lo que recibe Paola

Un paquete completo que arranca de un click, con 5 skills configurados para ella:
**daily · email · relationships · learning · creative**.

---

## Parte 1 — Jorge prepara el paquete (2 min)

```bash
# 1. Generar el paquete de Paola (runtime del producto + su brain)
node scripts/package-user.mjs paola-template /tmp/paola-axon

# 2. Emitir su licencia Pro (1 mes, renovable)
node monetize/license.mjs issue paola@gmail.com pro 1
#    → copia la key "AXON-..." que imprime

# 3. Comprimir la carpeta y enviarsela
#    (zip de /tmp/paola-axon + la key por mensaje aparte)
```

La licencia queda registrada en tu CRM. Para ver renovaciones:
`node monetize/license.mjs renewals`

---

## Parte 2 — Paola arranca (5 min)

**Requisito unico:** tener Node.js v18+ instalado (https://nodejs.org).

```bash
# 1. Descomprimir el paquete que le envio Jorge

# 2. Activar su licencia (la key que Jorge le paso)
node monetize/license.mjs activate "AXON-...su-key..."

# 3. Arrancar Axon
#    Windows: doble-click en Axon.bat
#    Mac:     doble-click en Axon.command
#    Terminal: node axon.mjs
```

Eso verifica todo, muestra su plan (PRO), y arranca su dashboard.

**Primer comando en Claude Code:** abre la carpeta con `claude .` y di *"quien soy"*.
Axon responde con su perfil. Luego prueba *"que hay para hoy"*.

---

## Parte 3 — Sus 5 skills

| Skill | Para que | Dile... |
|-------|----------|---------|
| daily | Brief del dia | "que hay para hoy" |
| email | Triage de correo | "revisa mis correos" |
| relationships | CRM personal | "recuerda que hable con X" |
| learning | Aprender temas | "quiero aprender sobre Y" |
| creative | Escribir/crear | "ayudame con un articulo sobre Z" |

Como es **Pro**, tambien tiene conectores (Calendar/Gmail), auto-brief, y puede
crear/entrenar skills nuevos.

---

## Verificado

Este flujo fue probado end-to-end:
- `package-user.mjs` ensambla 19 archivos de runtime + el brain de Paola
- El paquete arranca con `node axon.mjs` (un click)
- Jorge emite → Paola activa → su plan pasa a PRO, validado 100% offline

## Para los proximos 5 beta users

Mismo flujo. Crea su template (copia `paola-template/`, ajusta CLAUDE.md y skills),
y corre `package-user.mjs <su-template> <salida>`. Registra cada uno en `BETA.md`.
