# Arranca el puente de voz en Windows comprobando primero los requisitos.
# Uso:  powershell -File server\start-windows.ps1
#       (variables opcionales: $env:OLLAMA_MODEL, $env:WHISPER_URL, $env:WHISPER_PATH, ...)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

function Fail($msg) { Write-Host "`n[X] $msg" -ForegroundColor Red; exit 1 }
function Ok($msg)   { Write-Host "[OK] $msg" -ForegroundColor Green }
function Warn($msg) { Write-Host "[!] $msg" -ForegroundColor Yellow }

# Node 20+
try { $v = (& node --version) -replace "^v", "" } catch { Fail "Node no está instalado. Instala Node 20+ (winget install OpenJS.NodeJS.LTS)." }
if ([int]($v.Split(".")[0]) -lt 20) { Fail "Node $v es muy viejo; hace falta 20 o superior." }
Ok "Node $v"

# Ollama
$ollamaUrl = if ($env:OLLAMA_URL) { $env:OLLAMA_URL } else { "http://127.0.0.1:11434" }
try {
  Invoke-RestMethod -Uri "$ollamaUrl/api/tags" -TimeoutSec 3 | Out-Null
  Ok "Ollama responde en $ollamaUrl"
} catch {
  Warn "Ollama no responde en $ollamaUrl. Arráncalo (o instala un modelo con: ollama pull llama3.1:8b)."
}

# Whisper
$whisperUrl = if ($env:WHISPER_URL) { $env:WHISPER_URL } else { "http://127.0.0.1:8000" }
try {
  Invoke-WebRequest -Uri $whisperUrl -TimeoutSec 3 -UseBasicParsing | Out-Null
  Ok "Whisper responde en $whisperUrl"
} catch {
  if ($_.Exception.Response) { Ok "Whisper responde en $whisperUrl" }
  else { Warn "Whisper no responde en $whisperUrl. Sin él no hay voz a texto (ver server/README.md, sección 2)." }
}

Write-Host "`nArrancando el puente (Ctrl+C para parar)...`n"
Set-Location $root
& node server/server.mjs
