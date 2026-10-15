// Minimal static server with clean URLs (mirrors vercel.json cleanUrls). Usage: node serve.mjs <dir> <port>
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? 'dist');
const port = Number(process.argv[3] ?? 4400);
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.pdf': 'application/pdf', '.xml': 'application/xml',
  '.txt': 'text/plain', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.json': 'application/json',
};

http.createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const candidates = url === '/' ? ['index.html'] : [url, `${url}.html`, path.join(url, 'index.html')];
  for (const c of candidates) {
    const file = path.join(root, c);
    if (file.startsWith(root) && fs.existsSync(file) && fs.statSync(file).isFile()) {
      res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' });
      return fs.createReadStream(file).pipe(res);
    }
  }
  res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
  const nf = path.join(root, '404.html');
  res.end(fs.existsSync(nf) ? fs.readFileSync(nf) : 'Not found');
}).listen(port, () => console.log(`serving ${root} on http://localhost:${port}`));
