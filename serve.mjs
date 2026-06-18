import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
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

const server = createServer((req, res) => {
  let url = req.url.split('?')[0];

  // Strip base path if present
  url = url.replace(/^\/research-os-mobile-brief/, '');

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
╔══════════════════════════════════════════╗
║           JARVIS — Servidor Local        ║
╠══════════════════════════════════════════╣
║                                          ║
║  Dashboard:  http://localhost:${PORT}        ║
║  JARVIS:     http://localhost:${PORT}/jarvis.html  ║
║                                          ║
║  Ctrl+C para detener                     ║
╚══════════════════════════════════════════╝
`);
});
