// Chạy local không cần Vercel CLI: node server.js  → http://localhost:3000
const http = require('http'), fs = require('fs'), path = require('path');
try { // nạp .env (không cần thư viện)
  fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split(/\r?\n/).forEach((l) => {
    const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/); if (m && !m[1].startsWith('#') && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
} catch {}
const handler = require('./api/generate.js');
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
const HIDDEN = new Set(['server.js', 'test.js']);

http.createServer((req, res) => {
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (o) => { res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(o)); };
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/api/generate') {
    let raw = ''; req.on('data', (d) => { raw += d; if (raw.length > 20000) req.destroy(); });
    return req.on('end', () => { try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = {}; } handler(req, res); });
  }
  const rel = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname).replace(/^\/+/, '');
  const file = path.join(__dirname, rel);
  const ok = file.startsWith(__dirname + path.sep) && MIME[path.extname(file)] && !HIDDEN.has(rel) && !rel.startsWith('api/');
  if (!ok) return res.status(404).end('Not found');
  fs.readFile(file, (e, d) => { if (e) return res.status(404).end('Not found'); res.setHeader('Content-Type', MIME[path.extname(file)]); res.end(d); });
}).listen(process.env.PORT || 3000, () => console.log('Caption AI: http://localhost:' + (process.env.PORT || 3000), process.env.AI_API_KEY ? '(AI đã cấu hình)' : '(chưa có AI_API_KEY → dùng nội dung mẫu)'));
