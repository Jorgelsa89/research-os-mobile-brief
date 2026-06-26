# Axon Beta — Grupo v0.1

**Beta privada v0.1 · 7 slots · Inicio: 2026-06-25**

---

## Estado de los brains

| Usuario | Brain | Skills activos | Skill principal | Estado |
|---------|-------|----------------|-----------------|--------|
| Jorge | `research-os-mobile-brief/` (este repo) | 12 skills completos | Research / Trading | ✅ Calendario conectado |
| Paola | `paola-axon-brain/` (su maquina) | Por configurar | Daily / Email | ⬜ Pendiente setup |
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

## Para Paola — Setup en 5 minutos

### Paso 1: Prerequisitos

Instala estas herramientas en tu computadora:

| Herramienta | Link | Para que sirve |
|-------------|------|----------------|
| **Git** | https://git-scm.com | Guardar historial del brain |
| **Node.js** | https://nodejs.org | Correr el instalador |
| **Claude Code** | https://claude.ai/code | La IA que vive en tu brain |
| **Ollama** (opcional) | https://ollama.ai | Modelos locales sin costo |

### Paso 2: Instalar tu brain

Abre una terminal y ejecuta:

```bash
# Descarga el instalador y correlo
curl -O https://raw.githubusercontent.com/jorgelsa89/research-os-mobile-brief/main/axon-init.sh
bash axon-init.sh
```

El wizard te va a preguntar:
- Tu nombre
- Tu zona horaria
- Que dominios quieres activar (elige los que uses en tu vida)

### Paso 3: Abrir con Claude Code

```bash
# Cuando termine el installer:
cd mi-axon-brain    # (o el nombre que elegiste)
claude .            # Abre Claude Code en tu brain
```

### Paso 4: Primera conversacion

Cuéntale a Axon quién eres:
```
"Hola, me llamo Paola. Trabajo en [tu trabajo]. 
 Mis proyectos actuales son [proyectos]. 
 Actualiza mi shared-context con esta información."
```

Eso es todo. Tu brain empieza a crecer desde aqui.

---

## Skills recomendados para Paola

Modifica esto segun lo que Paola necesite. Sugerencias iniciales:

```
daily        — Brief matutino, cierre del dia
email        — Triage de correos, respuestas
relationships — CRM personal, seguimiento
learning     — Aprender cualquier tema
creative     — Proyectos creativos, ideas
```

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
