#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';

const root=path.resolve(process.cwd());
const manifestPath='app/docs/MANIFEST-A-B-CUMULATIVE-CANDIDATE-20260802.json';
const indexPath='app/index-backend-dev.html';
const adapterPath='app/adapters/tya-ab-cumulative-composition-v1.js';
const failures=[];
const passes=[];
const fail=(id,detail)=>failures.push({id,detail});
const pass=(id,detail)=>passes.push({id,detail});
const read=p=>fs.readFileSync(path.join(root,p));
const text=p=>read(p).toString('utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const gitBlob=buf=>crypto.createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${buf.length}\0`),buf])).digest('hex');

for(const p of [manifestPath,indexPath,adapterPath]){
  if(exists(p))pass('FILE_PRESENT',p);else fail('FILE_MISSING',p);
}
if(failures.length){console.log(JSON.stringify({status:'FAIL',failures,passes},null,2));process.exit(1);}

let manifest=null;
try{manifest=JSON.parse(text(manifestPath));pass('MANIFEST_JSON_VALID',manifest.candidateId);}catch(error){fail('MANIFEST_JSON_INVALID',error.message);}

if(manifest){
  if(manifest.schema==='cxorbia.cumulative-candidate-provenance.v1')pass('MANIFEST_SCHEMA',manifest.schema);else fail('MANIFEST_SCHEMA',manifest.schema);
  if(manifest.status==='SOURCE_ASSEMBLED_PENDING_GATES_AND_VISUAL')pass('HONEST_STATUS',manifest.status);else fail('HONEST_STATUS',manifest.status);
  if(manifest.compositionRules?.singleCandidate===true&&manifest.compositionRules?.singleBranch===true)pass('SINGLE_CANDIDATE_CONTRACT','true');else fail('SINGLE_CANDIDATE_CONTRACT','false');
  if(manifest.compositionRules?.deployAuthorized===false&&manifest.compositionRules?.providerWrites===false&&manifest.compositionRules?.production===false)pass('SAFE_STATE_DECLARED','no deploy/writes/production');else fail('SAFE_STATE_DECLARED','unsafe');
  const seen=new Set();
  for(const file of manifest.files||[]){
    if(seen.has(file.path))fail('MANIFEST_DUPLICATE_PATH',file.path);
    seen.add(file.path);
    if(!exists(file.path)){fail('MANIFEST_FILE_MISSING',file.path);continue;}
    const actual=gitBlob(read(file.path));
    if(actual===file.gitBlob)pass('GIT_BLOB_MATCH',file.path);else fail('GIT_BLOB_MISMATCH',`${file.path}:${actual}!=${file.gitBlob}`);
    if(!file.origin||!file.status||!file.action)fail('PROVENANCE_FIELDS_MISSING',file.path);
  }
  const required=[
    'app/index.html','app/index-backend-dev.html','app/app.js','app/styles/layout.css',
    'app/core/config.js','app/core/router.js','app/core/store.js','app/core/data.js',
    'app/core/data-source.js','app/core/permissions.js','app/modules/dashboard.js',
    'app/modules/crm.js','app/modules/clientes.js','app/modules/comercial.js',
    'app/modules/marketing.js','app/modules/rutas.js',adapterPath,
    'app/adapters/tya-c6-domain-consistency-bridge.js',
    'app/adapters/tya-c6-unified-human-runtime-v1.js',
    'app/adapters/tya-project-financial-model-contract-v1.js'
  ];
  required.forEach(p=>seen.has(p)?pass('REQUIRED_PROVENANCE',p):fail('REQUIRED_PROVENANCE_MISSING',p));
}

const index=text(indexPath);
const order=[
  'modules/dashboard.js','modules/clientes.js','modules/comercial.js','modules/crm.js','modules/marketing.js',
  'adapters/tya-ab-cumulative-composition-v1.js',
  'adapters/tya-c6-domain-consistency-bridge.js',
  'adapters/tya-c6-unified-human-runtime-v1.js','app.js'
];
let previous=-1;
for(const token of order){
  const pos=index.indexOf(token);
  if(pos<0)fail('INDEX_SCRIPT_MISSING',token);
  else if(pos<=previous)fail('INDEX_SCRIPT_ORDER',token);
  else{pass('INDEX_SCRIPT_ORDER',token);previous=pos;}
}
const adapterOccurrences=(index.match(/tya-ab-cumulative-composition-v1\.js/g)||[]).length;
if(adapterOccurrences===1)pass('AB_ADAPTER_SINGLE_LOAD','1');else fail('AB_ADAPTER_SINGLE_LOAD',String(adapterOccurrences));

const adapter=text(adapterPath);
try{new vm.Script(adapter,{filename:adapterPath});pass('ADAPTER_SYNTAX','PASS');}catch(error){fail('ADAPTER_SYNTAX',error.message);}
const requiredMarkers=[
  "version:'tya-ab-cumulative-composition-v1'",
  "lane:'authenticated-human-canonical'",
  'fixtureAuthority:false','localStorageAuthority:false','makeEnabled:false','geminiEnabled:false',
  'providerWrites:0','production:false',
  "new Set(['cl-prospecto-norte','cl-prospecto-salud'])",
  's.seed=()=>[]',
  "modulePolicy:'preserve-approved-ui-compose-canonical-runtime'"
];
for(const marker of requiredMarkers){adapter.includes(marker)?pass('ADAPTER_MARKER',marker):fail('ADAPTER_MARKER_MISSING',marker);}
const forbidden=[
  /firebase\.(firestore|auth|storage)\s*\(/,
  /fetch\s*\(/,
  /XMLHttpRequest/,
  /localStorage\.(setItem|removeItem|clear)\s*\(/,
  /location\.reload\s*\(/,
  /\.deploy\s*\(/,
  /https?:\/\/[^'"\s]*make\.com/i,
  /(?:GoogleGenerativeAI|generativelanguage\.googleapis|CX\.gemini\s*[.(])/i
];
for(const pattern of forbidden){
  if(pattern.test(adapter))fail('ADAPTER_FORBIDDEN_EXECUTABLE',String(pattern));
  else pass('ADAPTER_FORBIDDEN_EXECUTABLE_ABSENT',String(pattern));
}

const modulePaths=['dashboard','crm','clientes','comercial','marketing','rutas'].map(n=>`app/modules/${n}.js`);
for(const p of modulePaths){
  const entry=(manifest?.files||[]).find(x=>x.path===p);
  if(entry&&['APPROVED_UI_PRESENT_RUNTIME_RECONCILIATION_REQUIRED','BEST_TECHNICAL_PENDING_VISUAL'].includes(entry.status))pass('MODULE_STATUS_HONEST',`${p}:${entry.status}`);
  else fail('MODULE_STATUS_INVALID',p);
}

const buildLock=(manifest?.files||[]).find(x=>x.path==='app/core/build-lock.js');
if(buildLock?.status==='REPLACE_AFTER_SOURCE_GATES')pass('BUILD_LOCK_NOT_FALSELY_FROZEN',buildLock.status);else fail('BUILD_LOCK_STATUS',buildLock?.status||'missing');

const result={
  schema:'cxorbia.tya.ab-source-gate.v1',
  candidateId:manifest?.candidateId||null,
  status:failures.length?'FAIL':'PASS_SOURCE_ONLY_PENDING_RUNTIME_AND_VISUAL',
  summary:{pass:passes.length,fail:failures.length},
  passes,
  failures,
  safeState:{providerWrites:0,deploy:0,merge:false,production:false},
  next:failures.length?'STOP_RETRY_FIX_SOURCE':'RUNTIME_SMOKE_THEN_SINGLE_DEV_AUTHORIZATION'
};
console.log(JSON.stringify(result,null,2));
if(failures.length)process.exit(1);
