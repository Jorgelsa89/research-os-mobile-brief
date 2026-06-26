#!/usr/bin/env bash
# axon-init.sh — Instalador de Axon Personal AI OS
# Version: 1.0.0
# Uso: bash axon-init.sh

set -e

# ─── Colores ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ─── Banner ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}${BOLD}"
echo "  ▄▀█ ▀▄▀ █▀█ █▄░█"
echo "  █▀█ █░█ █▄█ █░▀█"
echo -e "${NC}${CYAN}  Personal AI OS — Brain Protocol v1.0${NC}"
echo ""

# ─── Verificar prerequisitos ──────────────────────────────────────────────────
echo -e "${BLUE}Verificando prerequisitos...${NC}"

if ! command -v git &> /dev/null; then
  echo -e "${RED}✗ git no encontrado. Instalar desde https://git-scm.com${NC}"
  exit 1
fi
echo -e "${GREEN}✓ git${NC}"

if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js no encontrado. Instalar desde https://nodejs.org${NC}"
  exit 1
fi

NODE_VERSION=$(node --version | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}✗ Node.js v$(node --version) detectado. Se requiere v18 o superior.${NC}"
  echo -e "${RED}  Actualiza en https://nodejs.org (descargar LTS)${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

if command -v ollama &> /dev/null; then
  echo -e "${GREEN}✓ Ollama detectado (modelos locales disponibles)${NC}"
  OLLAMA_AVAILABLE=true
else
  echo -e "${YELLOW}⚠ Ollama no encontrado. Puedes instalarlo despues en https://ollama.ai${NC}"
  OLLAMA_AVAILABLE=false
fi

echo ""

# ─── Google Calendar (opcional) ───────────────────────────────────────────────
echo -e "${BLUE}${BOLD}Integraciones opcionales${NC}"
echo ""
read -p "Quieres conectar Google Calendar? (s/N): " CONNECT_GCAL
if [[ "$CONNECT_GCAL" =~ ^[Ss]$ ]]; then
  GCAL_ENABLED=true
  echo ""
  echo -e "${CYAN}${BOLD}Instrucciones para Google Calendar:${NC}"
  echo ""
  echo -e "  1. Ve a ${YELLOW}https://console.cloud.google.com${NC}"
  echo -e "     → Crea un proyecto nuevo (o usa uno existente)"
  echo -e "     → APIs & Services → Enable APIs → busca 'Google Calendar API' → Habilitar"
  echo ""
  echo -e "  2. Credenciales:"
  echo -e "     → APIs & Services → Credentials → Create Credentials → OAuth client ID"
  echo -e "     → Application type: Desktop App"
  echo -e "     → Descarga el archivo JSON → renombralo a ${YELLOW}credentials.json${NC}"
  echo ""
  echo -e "  3. Coloca ${YELLOW}credentials.json${NC} en la raiz de tu brain ($(pwd | sed 's|.*||')/tu-brain/)"
  echo ""
  echo -e "  4. Primera vez que uses el skill Calendar, Axon abrira el navegador para autorizar."
  echo -e "     El token se guarda en ${YELLOW}brain/sync/gcal-token.json${NC} (gitignored)."
  echo ""
  echo -e "${YELLOW}⚠ Nunca subas credentials.json ni gcal-token.json a GitHub.${NC}"
  echo ""
  read -p "Presiona Enter para continuar..."
else
  GCAL_ENABLED=false
  echo -e "${YELLOW}⚠ Puedes conectar Google Calendar despues editando brain/sync/shared-context.md${NC}"
fi
echo ""

# ─── Directorio de instalacion ────────────────────────────────────────────────
echo -e "${BLUE}${BOLD}Donde quieres crear tu brain?${NC}"
read -p "Directorio [./mi-axon-brain]: " BRAIN_DIR
BRAIN_DIR="${BRAIN_DIR:-./mi-axon-brain}"

if [ -d "$BRAIN_DIR" ]; then
  echo -e "${RED}✗ El directorio '$BRAIN_DIR' ya existe.${NC}"
  read -p "Continuar de todos modos? (s/N): " OVERWRITE
  if [[ ! "$OVERWRITE" =~ ^[Ss]$ ]]; then
    echo "Instalacion cancelada."
    exit 0
  fi
fi

mkdir -p "$BRAIN_DIR"
cd "$BRAIN_DIR"
echo ""

# ─── Onboarding wizard ────────────────────────────────────────────────────────
echo -e "${CYAN}${BOLD}Cuéntame sobre ti (presiona Enter para saltar)${NC}"
echo ""

read -p "Tu nombre o alias: " USER_NAME
USER_NAME="${USER_NAME:-Usuario}"

read -p "Tu zona horaria [America/Mexico_City]: " USER_TZ
USER_TZ="${USER_TZ:-America/Mexico_City}"

read -p "Idioma principal [es]: " USER_LANG
USER_LANG="${USER_LANG:-es}"

echo ""
echo -e "${CYAN}${BOLD}Que dominios quieres activar? (Enter = si)${NC}"

declare -A SKILLS
for skill in "research:Investigacion de mercados y tecnologia" \
             "trading:Trading, watchlist, backtests" \
             "email:Gestion de correo y comunicacion" \
             "social:Contenido para redes sociales" \
             "daily:Brief matutino y cierre del dia" \
             "finance:CFO personal, patrimonio, cashflow" \
             "health:Salud, sintomas, fitness, sueno" \
             "relationships:CRM personal, familia, red de contactos" \
             "learning:Aprendizaje acelerado, insights, repaso" \
             "legal:Contratos, obligaciones, IP" \
             "creative:Escritura, podcast, newsletter, ideas" \
             "business:Clientes, proyectos, pipeline, ventas"; do
  key="${skill%%:*}"
  desc="${skill##*:}"
  read -p "  [$key] $desc? (S/n): " ACTIVATE
  if [[ ! "$ACTIVATE" =~ ^[Nn]$ ]]; then
    SKILLS[$key]=true
  fi
done

echo ""

# ─── Crear estructura del brain ────────────────────────────────────────────────
echo -e "${BLUE}Creando tu brain...${NC}"

# Directorios core
mkdir -p brain/{identity,memory/{short-term,patterns},security,sync/ai-comms}
mkdir -p brain/knowledge/{research,trading,daily,email,social,finance,health,relationships,learning,legal,creative,business}
mkdir -p skills

# Gitkeeps
for dir in brain/knowledge/*/; do
  touch "${dir}.gitkeep"
done

echo -e "${GREEN}✓ Estructura creada${NC}"

# ─── Generar CLAUDE.md personalizado ──────────────────────────────────────────
TODAY=$(date +%Y-%m-%d)

# Construir tabla de skills activos
SKILLS_TABLE="| Skill | Cuando activar | Output |\n|-------|----------------|--------|\n"
[[ "${SKILLS[research]}" == "true" ]] && SKILLS_TABLE+="| Research | \"investiga\", \"analiza\", \"brief de\" | \`brain/knowledge/research/\` |\n"
[[ "${SKILLS[trading]}" == "true" ]] && SKILLS_TABLE+="| Trading | \"watchlist\", \"alerta\", \"backtest\" | \`brain/knowledge/trading/\` |\n"
[[ "${SKILLS[email]}" == "true" ]] && SKILLS_TABLE+="| Email | \"correos\", \"triage\", \"responde a\" | \`brain/knowledge/email/\` |\n"
[[ "${SKILLS[social]}" == "true" ]] && SKILLS_TABLE+="| Social | \"genera post\", \"crea carrusel\" | \`brain/knowledge/social/\` |\n"
[[ "${SKILLS[daily]}" == "true" ]] && SKILLS_TABLE+="| Daily | \"que hay para hoy\", \"brief del dia\" | \`brain/knowledge/daily/\` |\n"
[[ "${SKILLS[finance]}" == "true" ]] && SKILLS_TABLE+="| Finance | \"patrimonio\", \"cashflow\", \"CFO\" | \`brain/knowledge/finance/\` |\n"
[[ "${SKILLS[health]}" == "true" ]] && SKILLS_TABLE+="| Health | \"sintomas\", \"medico\", \"ejercicio\" | \`brain/knowledge/health/\` |\n"
[[ "${SKILLS[relationships]}" == "true" ]] && SKILLS_TABLE+="| Relationships | \"hablar con\", \"CRM\", \"familia\" | \`brain/knowledge/relationships/\` |\n"
[[ "${SKILLS[learning]}" == "true" ]] && SKILLS_TABLE+="| Learning | \"quiero aprender\", \"explicame\" | \`brain/knowledge/learning/\` |\n"
[[ "${SKILLS[legal]}" == "true" ]] && SKILLS_TABLE+="| Legal | \"contrato\", \"deadline\", \"IP\" | \`brain/knowledge/legal/\` |\n"
[[ "${SKILLS[creative]}" == "true" ]] && SKILLS_TABLE+="| Creative | \"libro\", \"podcast\", \"newsletter\" | \`brain/knowledge/creative/\` |\n"
[[ "${SKILLS[business]}" == "true" ]] && SKILLS_TABLE+="| Business | \"cliente\", \"proyecto\", \"pipeline\" | \`brain/knowledge/business/\` |\n"

cat > CLAUDE.md << CLAUDEEOF
# Axon — AI Personal OS de ${USER_NAME}

Soy el asistente agéntico de ${USER_NAME}. Opero con memoria persistente, contexto acumulado, y proactividad.

## Personalidad

- Formal en reportes y briefs. Casual en conversacion rapida.
- Siempre en ${USER_LANG}.
- Despues de cada tarea, sugiero el siguiente paso logico.
- Leo \`brain/knowledge/daily/\` para contexto reciente antes de responder.

## Skills Activos

$(echo -e "$SKILLS_TABLE")

## Reglas

1. No invento datos. Si no tengo fuente, marco como "pendiente de verificar".
2. Guardo todo resultado en \`brain/knowledge/\` con frontmatter YAML valido.
3. Uso \`[[wikilinks]]\` para conectar notas relacionadas.
4. Nunca incluyo credenciales, datos sensibles o privados en notas de texto.
5. Para datos sensibles, uso \`brain/security/crypto.mjs\`.
6. Leo \`brain/sync/ai-comms/\` al iniciar para ver mensajes pendientes.
7. Actualizo \`brain/knowledge/_index.md\` al crear notas nuevas.

## Protocolo Brain

Ver \`BRAIN-PROTOCOL.md\` para la especificacion completa del formato.

## Encriptacion

Datos personales en \`brain/identity/\` cifrados con AES-256-GCM.
Para acceder: \`node brain/security/crypto.mjs read <categoria>\`
CLAUDEEOF

echo -e "${GREEN}✓ CLAUDE.md generado${NC}"

# ─── Archivos de memoria iniciales ────────────────────────────────────────────
cat > brain/memory/preferences.md << EOF
---
title: "Preferencias de ${USER_NAME}"
date: ${TODAY}
status: activo
---

# Preferencias

*Axon aprende tus preferencias con el uso. Este archivo se actualiza automaticamente.*

## Comunicacion
- Idioma preferido: ${USER_LANG}
- Zona horaria: ${USER_TZ}
- Tono preferido: formal en reportes, casual en conversacion

## Pendiente de aprender
- Estilo de escritura
- Horarios de trabajo
- Temas de mayor interes
EOF

cat > brain/memory/priorities.md << EOF
---
title: "Prioridades de ${USER_NAME}"
date: ${TODAY}
status: activo
---

# Prioridades

*Edita este archivo para decirle a Axon que es lo mas importante para ti.*

## Esta semana
- [ ] (agrega tu prioridad principal)

## Este mes
- [ ] (agrega tu objetivo del mes)

## Este ano
- [ ] (agrega tu meta anual)
EOF

cat > brain/sync/shared-context.md << EOF
---
owner: "${USER_NAME}"
timezone: "${USER_TZ}"
languages: ["${USER_LANG}"]
last-updated: ${TODAY}
---

# Quien soy

${USER_NAME}. Este archivo es mi tarjeta de identidad para proyectos externos.
Editame con informacion que quieras compartir entre proyectos.

# Proyectos activos

*(Agregar proyectos activos aqui)*

# Como prefiero trabajar

*(Agregar preferencias de trabajo aqui)*

# Skills activos

$(echo "${!SKILLS[@]}" | tr ' ' '\n' | sort | tr '\n' ', ')
EOF

cat > brain/sync/ai-comms/bitacora.md << EOF
# Bitacora Compartida — AI Comms

Canal append-only para comunicacion entre IAs que trabajan para ${USER_NAME}.

---

## ${TODAY} AXON-INIT

**Tarea:** Inicializacion del brain de ${USER_NAME}
**Resultado:** Brain creado con skills activos: $(echo "${!SKILLS[@]}" | tr ' ' ', ')
**Proximo paso:** Usuario conecta Claude Code y comienza a usar los skills activos.

---
EOF

cat > brain/sync/ai-comms/claude-inbox.md << EOF
# Inbox de Claude

Mensajes de otras IAs para Claude. Marcar [RESUELTO YYYY-MM-DD] al completar.

---

*Inbox vacio. Brain recien inicializado el ${TODAY}.*
EOF

cat > brain/knowledge/_index.md << EOF
---
title: "Mapa del Knowledge Base"
date: ${TODAY}
status: activo
---

# Mapa del Knowledge Base

*Actualizado automaticamente cuando se crean notas nuevas.*

## Research
*(vacio — agrega investigaciones aqui)*

## Trading
*(vacio — agrega watchlist y backtests)*

## Daily
*(vacio — el primer brief aparece aqui)*

## Por dominio activo
$(for skill in "${!SKILLS[@]}"; do echo "- [[${skill}/]] — *vacio*"; done)
EOF

echo -e "${GREEN}✓ Memoria inicial creada${NC}"

# ─── Git init ─────────────────────────────────────────────────────────────────
git init -q
cat > .gitignore << EOF
brain/identity/*.enc
brain/memory/short-term/
brain/knowledge/email/
.DS_Store
node_modules/
*.log
EOF

git add -A
git commit -q -m "init: Axon brain de ${USER_NAME} — $(date +%Y-%m-%d)"
echo -e "${GREEN}✓ Repositorio git inicializado${NC}"

# ─── Instrucciones finales ────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}${BOLD}✓ Tu brain está listo en: $(pwd)${NC}"
echo -e "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BOLD}Proximos pasos:${NC}"
echo ""
echo -e "  1. ${CYAN}Abre este directorio en Claude Code:${NC}"
echo -e "     ${YELLOW}claude$(pwd | xargs -I{} echo " --project {}")${NC}"
echo ""
echo -e "  2. ${CYAN}Dile a Claude quién eres:${NC}"
echo -e "     ${YELLOW}\"Soy [nombre]. Actualiza brain/sync/shared-context.md\"${NC}"
echo ""
echo -e "  3. ${CYAN}Empieza a usar tus skills:${NC}"
echo -e "     ${YELLOW}\"Investiga NVDA\" / \"Que hay para hoy?\" / \"Registra este sintoma\"${NC}"
echo ""

if [ "$OLLAMA_AVAILABLE" = false ]; then
  echo -e "  4. ${CYAN}Opcional: Instala Ollama para modelos locales:${NC}"
  echo -e "     ${YELLOW}https://ollama.ai → ollama pull qwen3:8b${NC}"
  echo ""
fi

if [ -f "serve.mjs" ]; then
  echo -e "  ${CYAN}Dashboard disponible:${NC}"
  echo -e "     ${YELLOW}node serve.mjs${NC}  →  http://localhost:3000"
  echo ""
fi

echo -e "${CYAN}Documentacion: BRAIN-PROTOCOL.md${NC}"
echo -e "${CYAN}Vision del producto: AXON-VISION.md${NC}"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# WINDOWS USERS — Equivalente en PowerShell
# Este script requiere bash. En Windows, usa Git Bash, WSL, o los comandos
# equivalentes de PowerShell que se muestran a continuacion:
#
# # Verificar Node.js v18+
# node --version
#
# # Crear la estructura de carpetas
# $BrainDir = "mi-axon-brain"
# New-Item -ItemType Directory -Force -Path "$BrainDir/brain/identity"
# New-Item -ItemType Directory -Force -Path "$BrainDir/brain/memory/short-term"
# New-Item -ItemType Directory -Force -Path "$BrainDir/brain/memory/patterns"
# New-Item -ItemType Directory -Force -Path "$BrainDir/brain/security"
# New-Item -ItemType Directory -Force -Path "$BrainDir/brain/sync/ai-comms"
# New-Item -ItemType Directory -Force -Path "$BrainDir/brain/knowledge/research"
# New-Item -ItemType Directory -Force -Path "$BrainDir/brain/knowledge/trading"
# New-Item -ItemType Directory -Force -Path "$BrainDir/brain/knowledge/daily"
# New-Item -ItemType Directory -Force -Path "$BrainDir/brain/knowledge/email"
# New-Item -ItemType Directory -Force -Path "$BrainDir/brain/knowledge/social"
# New-Item -ItemType Directory -Force -Path "$BrainDir/brain/knowledge/finance"
# New-Item -ItemType Directory -Force -Path "$BrainDir/brain/knowledge/health"
# New-Item -ItemType Directory -Force -Path "$BrainDir/brain/knowledge/relationships"
# New-Item -ItemType Directory -Force -Path "$BrainDir/brain/knowledge/learning"
# New-Item -ItemType Directory -Force -Path "$BrainDir/brain/knowledge/legal"
# New-Item -ItemType Directory -Force -Path "$BrainDir/brain/knowledge/creative"
# New-Item -ItemType Directory -Force -Path "$BrainDir/brain/knowledge/business"
# New-Item -ItemType Directory -Force -Path "$BrainDir/skills"
#
# # Inicializar git
# Set-Location $BrainDir
# git init
# git add -A
# git commit -m "init: Axon brain"
#
# # Abrir con Claude Code
# claude .
#
# Para el paso completo en Windows, revisa ONBOARDING.md — Seccion 2 (Windows).
# ─────────────────────────────────────────────────────────────────────────────
