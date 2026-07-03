import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..', '..');
const appDir = path.join(repoRoot, 'app');
const outDir = path.join(repoRoot, 'tmp', 'cx-data-contract-scan');

function walk(dir){
  if(!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>{
    const p=path.join(dir,d.name);
    return d.isDirectory()?walk(p):(p.endsWith('.js')?[p]:[]);
  });
}

const files = walk(appDir);
const calls = new Map();
const fields = new Map();
const localKeys = new Set();

for(const file of files){
  const rel = path.relative(repoRoot,file).replace(/\\/g,'/');
  const txt = fs.readFileSync(file,'utf8');
  for(const m of txt.matchAll(/CX\.data\.([A-Za-z_$][\w$]*)\s*\(/g)){
    const k=m[1]; if(!calls.has(k)) calls.set(k,new Set()); calls.get(k).add(rel);
  }
  for(const m of txt.matchAll(/CX\.data\.([A-Za-z_$][\w$]*)\b(?!\s*\()/g)){
    const k=m[1]; if(!fields.has(k)) fields.set(k,new Set()); fields.get(k).add(rel);
  }
  for(const m of txt.matchAll(/localStorage\.(?:getItem|setItem|removeItem)\(['"]([^'"]+)['"]/g)){
    localKeys.add(m[1]);
  }
}

fs.mkdirSync(outDir,{recursive:true});
const json = {
  generatedAt:new Date().toISOString(),
  filesScanned:files.length,
  methods:[...calls].sort().map(([name,refs])=>({name,refs:[...refs].sort()})),
  fields:[...fields].sort().map(([name,refs])=>({name,refs:[...refs].sort()})),
  localStorageKeys:[...localKeys].sort(),
  safety:{writes:0,imports:0,deploy:0}
};
fs.writeFileSync(path.join(outDir,'cxDataContractScan.json'),JSON.stringify(json,null,2),'utf8');
const md=[];
md.push('# CX.data contract scan');
md.push('');
md.push(`Generated at: ${json.generatedAt}`);
md.push(`Files scanned: ${json.filesScanned}`);
md.push('');
md.push('## Methods referenced');
json.methods.forEach(x=>md.push(`- ${x.name}: ${x.refs.join(', ')}`));
md.push('');
md.push('## Fields referenced');
json.fields.forEach(x=>md.push(`- ${x.name}: ${x.refs.join(', ')}`));
md.push('');
md.push('## localStorage keys');
json.localStorageKeys.forEach(k=>md.push(`- ${k}`));
md.push('');
md.push('## Safety');
md.push('- Writes: 0');
md.push('- Imports: 0');
md.push('- Deploy: 0');
fs.writeFileSync(path.join(outDir,'cxDataContractScan.md'),md.join('\n'),'utf8');
console.log('CX.data contract scan OK');
console.log(path.join(outDir,'cxDataContractScan.md'));
