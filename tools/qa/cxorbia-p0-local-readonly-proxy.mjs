#!/usr/bin/env node
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(process.env.CXORBIA_P0_LOCAL_APP_ROOT||'app');
const host=String(process.env.CXORBIA_P0_LOCAL_HOST||'127.0.0.1');
const port=Number(process.env.CXORBIA_P0_LOCAL_PORT||4175);
const upstream=String(process.env.CXORBIA_P0_UPSTREAM_ROOT||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.mjs':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon'};
const proxyPrefixes=['/__/firebase/','/api/tya/cinepolis/hr-live'];

function safeLocalPath(urlPath){
  const decoded=decodeURIComponent(urlPath.split('?')[0]||'/');
  const relative=decoded==='/'?'index-backend-dev.html':decoded.replace(/^\/+/, '');
  const resolved=path.resolve(root,relative);
  if(resolved!==root&&!resolved.startsWith(root+path.sep))return null;
  return resolved;
}
async function proxy(req,res){
  const target=new URL(req.url||'/',upstream);
  const response=await fetch(target,{method:req.method,headers:{'cache-control':'no-cache, no-store','pragma':'no-cache'}});
  res.statusCode=response.status;
  for(const [key,value] of response.headers){
    if(['content-length','content-encoding','transfer-encoding','connection'].includes(key.toLowerCase()))continue;
    res.setHeader(key,value);
  }
  res.setHeader('cache-control','no-store');
  if(req.method==='HEAD'){res.end();return;}
  const body=Buffer.from(await response.arrayBuffer());
  res.end(body);
}
function local(req,res){
  const filePath=safeLocalPath(req.url||'/');
  if(!filePath){res.statusCode=400;res.end('bad path');return;}
  let target=filePath;
  try{if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');}catch{}
  if(!fs.existsSync(target)||!fs.statSync(target).isFile()){res.statusCode=404;res.end('not found');return;}
  res.statusCode=200;
  res.setHeader('content-type',mime[path.extname(target).toLowerCase()]||'application/octet-stream');
  res.setHeader('cache-control','no-store');
  if(req.method==='HEAD'){res.end();return;}
  fs.createReadStream(target).pipe(res);
}

const server=http.createServer(async(req,res)=>{
  try{
    if(!['GET','HEAD'].includes(String(req.method||'').toUpperCase())){res.statusCode=405;res.setHeader('allow','GET, HEAD');res.end('read only');return;}
    const pathname=new URL(req.url||'/',`http://${host}:${port}`).pathname;
    if(proxyPrefixes.some(prefix=>pathname.startsWith(prefix)))await proxy(req,res);
    else local(req,res);
  }catch(error){
    res.statusCode=502;res.setHeader('content-type','text/plain; charset=utf-8');res.end('readonly proxy error');
    console.error('[cxorbia-p0-local-readonly-proxy]',String(error?.message||error).replace(/[^A-Za-z0-9_.:-]+/g,'_').slice(0,180));
  }
});
server.listen(port,host,()=>console.log(JSON.stringify({decision:'PASS_P0_LOCAL_READONLY_PROXY_READY',host,port,appRoot:path.relative(process.cwd(),root),upstream,methods:['GET','HEAD'],providerWrites:0,deploys:0,production:false})));

for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>process.exit(0)));
