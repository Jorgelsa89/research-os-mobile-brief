import { createServer } from 'node:http';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

// ── Brain API helpers ────────────────────────────────────────────────────────

/** Parse YAML frontmatter from markdown text. Returns { meta, body }. */
function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: text };
  const raw = match[1];
  const body = match[2];
  const meta = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^(\w[\w-]*):\s*(.+)$/);
    if (!m) continue;
    let val = m[2].trim().replace(/^["']|["']$/g, '');
    // Parse arrays like [a, b, c]
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
    }
    meta[m[1]] = val;
  }
  return { meta, body };
}

/** Return first non-empty, non-heading paragraph from markdown body. */
function firstParagraph(body) {
  const lines = body.split('\n');
  let para = '';
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('#') || t.startsWith('|') || t.startsWith('---')) continue;
    if (t.startsWith('- ') || t.startsWith('* ')) { para = t.slice(2); break; }
    para = t;
    break;
  }
  return para.slice(0, 200);
}

/** Count .md files in a directory (non-recursive). */
function countMd(dir) {
  try {
    return readdirSync(dir).filter(f => f.endsWith('.md')).length;
  } catch { return 0; }
}

/** Read latest N .md files from a directory, sorted by name desc. */
function latestNotes(dir, n) {
  try {
    const files = readdirSync(dir)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse()
      .slice(0, n);
    return files.map(f => {
      const text = readFileSync(join(dir, f), 'utf8');
      const { meta, body } = parseFrontmatter(text);
      return { file: f, meta, excerpt: firstParagraph(body) };
    });
  } catch { return []; }
}

/** JSON response helper. */
function jsonOk(res, data) {
  const body = JSON.stringify(data);
  res.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache',
  });
  res.end(body);
}

// ── API route handlers ────────────────────────────────────────────────────────

const BRAIN = join(__dirname, 'brain');
const KNOWLEDGE = join(BRAIN, 'knowledge');

function apiStatus() {
  return {
    research: countMd(join(KNOWLEDGE, 'research')),
    trading:  countMd(join(KNOWLEDGE, 'trading')),
    daily:    countMd(join(KNOWLEDGE, 'daily')),
    social:   countMd(join(KNOWLEDGE, 'social', 'posts')),
    email:    countMd(join(KNOWLEDGE, 'email')),
    finance:  countMd(join(KNOWLEDGE, 'finance')),
    health:   countMd(join(KNOWLEDGE, 'health')),
    learning: countMd(join(KNOWLEDGE, 'learning')),
    legal:    countMd(join(KNOWLEDGE, 'legal')),
    creative: countMd(join(KNOWLEDGE, 'creative')),
    business: countMd(join(KNOWLEDGE, 'business')),
    relationships: countMd(join(KNOWLEDGE, 'relationships')),
  };
}

function apiResearch() {
  return latestNotes(join(KNOWLEDGE, 'research'), 5);
}

function apiWatchlist() {
  const path = join(KNOWLEDGE, 'trading', 'watchlist.md');
  if (!existsSync(path)) return { raw: '' };
  return { raw: readFileSync(path, 'utf8') };
}

function apiDaily() {
  return latestNotes(join(KNOWLEDGE, 'daily'), 3);
}

function apiMemory() {
  const prefsPath = join(BRAIN, 'memory', 'preferences.md');
  const priosPath = join(BRAIN, 'memory', 'priorities.md');
  return {
    preferences: existsSync(prefsPath) ? readFileSync(prefsPath, 'utf8') : '',
    priorities:  existsSync(priosPath) ? readFileSync(priosPath, 'utf8') : '',
  };
}

// ── HTTP server ───────────────────────────────────────────────────────────────

const server = createServer((req, res) => {
  let url = req.url.split('?')[0];

  // Strip base path if present
  url = url.replace(/^\/research-os-mobile-brief/, '');

  // ── Brain API routes ──
  if (url === '/api/brain/status')    { return jsonOk(res, apiStatus()); }
  if (url === '/api/brain/research')  { return jsonOk(res, apiResearch()); }
  if (url === '/api/brain/watchlist') { return jsonOk(res, apiWatchlist()); }
  if (url === '/api/brain/daily')     { return jsonOk(res, apiDaily()); }
  if (url === '/api/brain/memory')    { return jsonOk(res, apiMemory()); }

  // ── Static files ──
  if (url === '/' || url === '') url = '/index.html';

  const filePath = join(__dirname, url);

  if (!existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }

  const ext = extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';

  try {
    const content = readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': mime });
    res.end(content);
  } catch {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('500 Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║           AXON — Servidor Local                  ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  Index:      http://localhost:${PORT}                ║
║  JARVIS:     http://localhost:${PORT}/jarvis.html    ║
║  Dashboard:  http://localhost:${PORT}/dashboard.html ║
║                                                  ║
║  API Brain:  http://localhost:${PORT}/api/brain/*    ║
║                                                  ║
║  Ctrl+C para detener                             ║
╚══════════════════════════════════════════════════╝
`);
});
