import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const port = Number(process.env.CXORBIA_STATIC_PREVIEW_PORT || 5179);
const host = '127.0.0.1';

const mime = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'],
  ['.txt', 'text/plain; charset=utf-8']
]);

function safePath(urlPath){
  const clean = decodeURIComponent(String(urlPath || '/').split('?')[0]).replace(/^\/+/, '');
  const resolved = path.resolve(repoRoot, clean || 'app/index-backend-dev.html');
  if(!resolved.startsWith(repoRoot)) return null;
  return resolved;
}

const server = http.createServer((req, res)=>{
  const file = safePath(req.url || '/');
  if(!file){
    res.writeHead(403, {'Content-Type': 'text/plain; charset=utf-8'});
    res.end('Forbidden');
    return;
  }
  const finalFile = fs.existsSync(file) && fs.statSync(file).isDirectory()
    ? path.join(file, 'index.html')
    : file;
  if(!fs.existsSync(finalFile) || !fs.statSync(finalFile).isFile()){
    res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
    res.end('Not found');
    return;
  }
  const ext = path.extname(finalFile).toLowerCase();
  res.writeHead(200, {
    'Content-Type': mime.get(ext) || 'application/octet-stream',
    'Cache-Control': 'no-store'
  });
  fs.createReadStream(finalFile).pipe(res);
});

server.listen(port, host, ()=>{
  console.log('CXOrbia static preview server listening');
  console.log(`URL: http://${host}:${port}/app/index-backend-dev.html`);
  console.log(`Root: ${repoRoot}`);
  console.log('Deploy: 0');
  console.log('Firestore writes: 0');
  console.log('Imports executed: 0');
});
