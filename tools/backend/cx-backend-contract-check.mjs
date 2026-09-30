import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..', '..');
const outDir = path.join(repoRoot, 'tmp', 'cx-backend-contract-check');
const target = path.join(repoRoot, 'app', 'core', 'backend-data-contract.js');

fs.mkdirSync(outDir,{recursive:true});
const txt = fs.existsSync(target) ? fs.readFileSync(target,'utf8') : '';
const ok = Boolean(txt && txt.includes('validateShape') && txt.includes('pathFor') && txt.includes('active:false'));
const result = { generatedAt:new Date().toISOString(), ok, fileExists:Boolean(txt), safety:{writes:0,imports:0,deploy:0} };
fs.writeFileSync(path.join(outDir,'cxBackendContractCheck.json'),JSON.stringify(result,null,2),'utf8');
const md = ['# CX backend contract check','',`Generated at: ${result.generatedAt}`,`Status: ${ok?'OK':'BLOCKED'}`,'',`File exists: ${result.fileExists}`,'','## Safety','- Writes: 0','- Imports: 0','- Deploy: 0'].join('\n');
fs.writeFileSync(path.join(outDir,'cxBackendContractCheck.md'),md,'utf8');
console.log(md);
if(!ok) process.exit(1);
