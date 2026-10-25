#!/usr/bin/env node
/* CXOrbia · reusable entrypoint integrity gate.
   Every relative <script src> in app/index-backend-dev.html must resolve to a real repo file,
   except the intentionally generated local-only auth helper. This prevents Firebase Hosting
   rewrites from returning index HTML (200) to a missing .js request and causing parse errors. */
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const htmlPath=path.join(root,'app','index-backend-dev.html');
const html=fs.readFileSync(htmlPath,'utf8');
const srcs=[...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(m=>m[1]);
const local=[...new Set(srcs.filter(s=>!/^https?:\/\//i.test(s)))];
const generated=new Set(['core/backend-dev-auth.local.js']);
const missing=[];
for(const src of local){
  if(generated.has(src)) continue;
  const p=path.join(root,'app',src.replace(/^\.\//,''));
  if(!fs.existsSync(p) || !fs.statSync(p).isFile()) missing.push(src);
}
const result={gate:'cxorbia-corte4-entrypoint-script-integrity',entrypoint:'app/index-backend-dev.html',relativeScripts:local.length,generatedExemptions:[...generated],missing,ok:missing.length===0};
console.log(JSON.stringify(result,null,2));
if(!result.ok) process.exit(1);
