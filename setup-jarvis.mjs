import { execSync } from 'node:child_process';

const CHECK = '\x1b[32m✓\x1b[0m';
const CROSS = '\x1b[31m✗\x1b[0m';
const WARN  = '\x1b[33m!\x1b[0m';

console.log(`
╔══════════════════════════════════════════╗
║        JARVIS — Verificacion de Setup    ║
╚══════════════════════════════════════════╝
`);

let allGood = true;

// 1. Node.js
try {
  const v = process.version;
  console.log(`${CHECK} Node.js ${v}`);
} catch {
  console.log(`${CROSS} Node.js no encontrado`);
  allGood = false;
}

// 2. Ollama installed
let ollamaInstalled = false;
try {
  const v = execSync('ollama --version 2>&1', { encoding: 'utf8' }).trim();
  console.log(`${CHECK} Ollama instalado: ${v}`);
  ollamaInstalled = true;
} catch {
  console.log(`${CROSS} Ollama no instalado`);
  console.log(`    Instalar: curl -fsSL https://ollama.ai/install.sh | sh`);
  allGood = false;
}

// 3. Ollama running
let ollamaRunning = false;
if (ollamaInstalled) {
  try {
    const res = execSync('curl -sf http://localhost:11434/api/tags 2>&1', { encoding: 'utf8' });
    const data = JSON.parse(res);
    ollamaRunning = true;
    const models = data.models?.map(m => m.name) || [];
    console.log(`${CHECK} Ollama corriendo (${models.length} modelos)`);

    if (models.length === 0) {
      console.log(`${WARN} No hay modelos descargados`);
      console.log(`    Recomendado: ollama pull llama3.1:8b`);
      console.log(`    Alternativas:`);
      console.log(`      ollama pull mistral       (7B, rapido)`);
      console.log(`      ollama pull llama3.1:70b   (70B, mas inteligente, necesita +40GB RAM)`);
      console.log(`      ollama pull phi3:mini      (3.8B, ultra rapido, menos preciso)`);
      allGood = false;
    } else {
      models.forEach(m => console.log(`    - ${m}`));

      const hasGood = models.some(m =>
        m.includes('llama3') || m.includes('mistral') || m.includes('phi3') ||
        m.includes('gemma') || m.includes('qwen')
      );
      if (!hasGood) {
        console.log(`${WARN} Ningun modelo recomendado detectado`);
        console.log(`    Recomendado: ollama pull llama3.1:8b`);
      }
    }
  } catch {
    console.log(`${CROSS} Ollama no esta corriendo`);
    console.log(`    Iniciar: ollama serve`);
    allGood = false;
  }
}

// 4. CORS check
if (ollamaRunning) {
  try {
    const headers = execSync(
      'curl -sf -I -X OPTIONS http://localhost:11434/api/tags -H "Origin: http://localhost:3000" 2>&1',
      { encoding: 'utf8' }
    );
    if (headers.includes('access-control-allow-origin') || headers.includes('Access-Control-Allow-Origin')) {
      console.log(`${CHECK} CORS habilitado en Ollama`);
    } else {
      console.log(`${WARN} CORS puede necesitar configuracion`);
      console.log(`    En Mac/Linux: OLLAMA_ORIGINS="*" ollama serve`);
      console.log(`    En Windows: set OLLAMA_ORIGINS=* && ollama serve`);
    }
  } catch {
    console.log(`${WARN} No se pudo verificar CORS (probablemente OK)`);
  }
}

// 5. Files check
import { existsSync } from 'node:fs';
const files = ['jarvis.html', 'serve.mjs', 'index.html', 'styles.css', 'manifest.webmanifest', 'sw.js'];
const missing = files.filter(f => !existsSync(f));
if (missing.length === 0) {
  console.log(`${CHECK} Todos los archivos del PWA presentes`);
} else {
  console.log(`${CROSS} Archivos faltantes: ${missing.join(', ')}`);
  allGood = false;
}

// Summary
console.log('');
if (allGood) {
  console.log(`\x1b[32m══ Todo listo. Ejecuta: node serve.mjs ══\x1b[0m`);
  console.log(`    Luego abre: http://localhost:3000/jarvis.html`);
} else {
  console.log(`\x1b[33m══ Hay items pendientes. Revisa arriba. ══\x1b[0m`);
}
console.log('');
