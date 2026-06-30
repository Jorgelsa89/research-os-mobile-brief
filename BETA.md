# Axon Beta — Grupo v0.1

**Beta privada v0.1 · 7 slots · Inicio: 2026-06-25**

---

## Estado de los brains

| Usuario | Brain | Skills activos | Skill principal | Estado |
|---------|-------|----------------|-----------------|--------|
| Jorge | `research-os-mobile-brief/` (este repo) | 12 skills completos | Research / Trading | ✅ Calendario conectado |
| Paola | paquete enviado (Pro) | daily, email, relationships, learning, creative | Daily / Email | ✅ Pro pre-activado, expira 2026-09-30 |
| Beta-3 | TBD | Por configurar | TBD | ⬜ Slot disponible |
| Beta-4 | TBD | Por configurar | TBD | ⬜ Slot disponible |
| Beta-5 | TBD | Por configurar | TBD | ⬜ Slot disponible |
| Beta-6 | TBD | Por configurar | TBD | ⬜ Slot disponible |
| Beta-7 | TBD | Por configurar | TBD | ⬜ Slot disponible |

---

## Para Jorge — Tu brain ya esta listo

Tu brain esta en este repositorio. Para usarlo:

```bash
# En cualquier terminal dentro de este directorio:
claude .

# Luego habla normalmente:
# "investiga NVDA"
# "que hay para hoy?"
# "genera un post para Instagram sobre opciones"
```

**Tus skills activos:** Research · Trading · Email · Social · Daily · Finance · Health · Relationships · Learning · Legal · Creative · Business

**Tu brain:** `brain/knowledge/` — todo lo que Jarvis recuerda sobre ti

---

## Flujo de onboarding (probado, mismo para todos)

Agregar un beta user es un comando por paso. Detalle completo en `PAOLA-ONBOARDING.md`.

```bash
# 1. Crear el template del usuario (nombre + sus skills)
node scripts/new-user.mjs <nombre> "daily,email,learning"

# 2. Empaquetar (runtime del producto + su brain)
node scripts/package-user.mjs <nombre>-template /tmp/<nombre>-axon

# 3. Emitir su licencia Pro
node monetize/license.mjs issue <su-email> pro 1

# 4. Comprimir /tmp/<nombre>-axon, enviarlo + la key. Registrar en la tabla de arriba.
```

El usuario solo descomprime, corre `node monetize/license.mjs activate "<key>"`,
y arranca con doble-click en `Axon.bat` (Windows) o `Axon.command` (Mac).

**Paola** ya tiene su template (`paola-template/`) con 5 skills: daily, email,
relationships, learning, creative. Falta generar su paquete y enviarselo.

---

## Friction Log

Registro de donde se trabaron los usuarios durante el beta. Cada entrada incluye usuario, fecha y descripcion del problema.

| Fecha | Usuario | Punto de friccion | Resuelto |
|-------|---------|-------------------|----------|
| — | — | *(sin registros aun)* | — |

**Como agregar una entrada:**
```bash
# Dentro del directorio del brain:
echo "FRICTION [YYYY-MM-DD] [usuario]: [descripcion del problema]" >> brain/sync/ai-comms/bitacora.md
git add -A && git commit -m "friction: [resumen]"
```

O reporta directamente en GitHub Issues con la etiqueta `friction`.

---

## Feedback de beta

Para reportar lo que no funciona o lo que podria mejorar:

```bash
# Dentro del directorio del brain:
echo "FEEDBACK: [tu comentario]" >> brain/sync/ai-comms/bitacora.md
git add -A && git commit -m "feedback: [resumen]"
```

O simplemente dile a Jorge directamente (jlmanga22@gmail.com).

---

## Proximos pasos del beta

- [ ] Paola instala su brain
- [ ] Primera semana: usar Daily y Email todos los dias
- [ ] Semana 2: identificar el skill mas util para cada uno
- [ ] Semana 3: reportar 3 cosas que no funcionan
- [ ] Semana 4: decision de continuar en Pro o ajustar
