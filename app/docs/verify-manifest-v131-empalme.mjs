#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const app=path.resolve(here,'..');
const m=JSON.parse(fs.readFileSync(path.join(here,'MANIFEST-V131-EMPALME-RUNTIME-R1.json'),'utf8'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const bad=[];
for(const f of m.files){const p=path.join(app,f.path);if(!fs.existsSync(p)){bad.push({path:f.path,error:'missing'});continue;}const h=sha(fs.readFileSync(p));if(h!==f.sha256)bad.push({path:f.path,error:'hash',expected:f.sha256,actual:h});}
const canon=m.files.map(f=>`${f.path}\0${f.sha256}\n`).join('');
const agg=sha(Buffer.from(canon));
if(agg!==m.aggregateSha256)bad.push({path:'<aggregate>',error:'hash',expected:m.aggregateSha256,actual:agg});
if(bad.length){console.error(JSON.stringify({ok:false,bad},null,2));process.exit(1);}
console.log(JSON.stringify({ok:true,fileCount:m.fileCount,aggregateSha256:m.aggregateSha256},null,2));
