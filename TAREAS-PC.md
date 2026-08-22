# Tareas en la PC

Lista viva de tareas que Claude (nube) no puede ejecutar en la PC por estar
en un contenedor aislado. Las ejecuta quien tenga manos en la máquina:
Codex, o Jorge cuando esté delante. Claude la actualiza por commit; marcar
lo hecho editando este archivo.

---

## Pendientes

### 1. Conectar el Claude Code de la PC (prioridad alta)

Objetivo: que la sesión de Claude en la PC sea alcanzable desde el teléfono
y desde las sesiones de Claude en la nube.

```powershell
claude --version
# Windows necesita 2.1.234 o superior; si es menor:  claude update

cd <carpeta del repo research-os-mobile-brief>
claude remote-control --name "PC de Jorge"
```

- El comando queda corriendo y muestra una URL de sesión (claude.ai/code/…)
  y un QR. **La ventana debe quedar abierta**: es lo que mantiene la PC
  alcanzable.
- No pide autenticación extra **si Claude Code ya tiene sesión iniciada**
  con la cuenta claude.ai de Jorge. Si pide login, parar y avisar a Jorge:
  ese paso es solo suyo.
- Reportar: la URL de sesión que imprime, y la versión de Claude Code.

### 2. Puente de voz (si aún no está hecho)

Seguir `SETUP-PC.md`: repo en la rama
`claude/ai-assistant-device-button-tz69jj`, Whisper en :8000, Ollama con
`llama3.1:8b`, `node server/server.mjs`, `tailscale serve --bg 8788`.
Reportar `/api/health` y la URL https de Tailscale.

---

## Reglas para quien ejecute

- Nada fuera de la carpeta del repo salvo instalar lo listado.
- Ningún puerto público; todo por Tailscale.
- Nunca introducir credenciales de Jorge: si algo pide login, se detiene y
  se le avisa.

## Hechas

(mover aquí las tareas completadas, con fecha y resultado)
