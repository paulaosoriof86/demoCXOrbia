#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const root=process.cwd();
const appDir=path.join(root,'app');
const oldManifestPath=path.join(appDir,'docs/MANIFEST-V174-CORTE2A-EMPALME-DIRECTO-20260722.json');
const outDir=path.resolve(process.env.CXORBIA_SOURCE_LOCK_PROPOSAL_OUT||'.tmp/tya-v174-r20-source-lock-proposal');
const excluded=new Set([
  'app/core/build-lock.js',
  'app/docs/MANIFEST-V174-CORTE2A-EMPALME-DIRECTO-20260722.json'
]);

function fail(message){throw new Error(`V174_R20_SOURCE_LOCK_PROPOSAL_HOLD: ${message}`);}
function sha256(data){return crypto.createHash('sha256').update(data).digest('hex');}
function git(...args){const result=spawnSync('git',args,{cwd:root,encoding:'utf8'});if(result.status!==0)fail(`git ${args.join(' ')}: ${String(result.stderr||result.stdout).trim()}`);return String(result.stdout||'').trim();}
function walk(dir){const out=[];for(const entry of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const abs=path.join(dir,entry.name);if(entry.isDirectory()){if(['node_modules','.git','.tmp'].includes(entry.name))continue;out.push(...walk(abs));}else if(entry.isFile())out.push(abs);}return out;}

if(!fs.existsSync(oldManifestPath))fail(`manifest missing: ${oldManifestPath}`);
const previous=JSON.parse(fs.readFileSync(oldManifestPath,'utf8'));
const files=[];
for(const abs of walk(appDir)){
  const rel=path.relative(root,abs).replaceAll('\\','/');
  if(excluded.has(rel))continue;
  const data=fs.readFileSync(abs);
  files.push({path:rel,size:data.length,sha256:sha256(data)});
}
files.sort((a,b)=>a.path.localeCompare(b.path));
const aggregateSha256=sha256(Buffer.from(files.map(item=>`${item.sha256}  ${item.path}`).join('\n'),'utf8'));
const sourceHead=git('rev-parse','HEAD^');
const requestCommit=git('rev-parse','HEAD');
const manifest={
  schema:'cxorbia.runtime-manifest.v1',
  version:'V174-CORTE2A-R20-SOURCE-IDENTITY-FIX',
  generatedAt:new Date().toISOString(),
  repository:'paulaosoriof86/demoCXOrbia',
  branch:'docs-tya-v6-v71-audit',
  sourceHead,
  requestCommit,
  headBefore:previous.headBefore,
  empalmeCommit:previous.empalmeCommit,
  priorDocumentationCommit:previous.priorDocumentationCommit,
  holdFixCommit:previous.holdFixCommit,
  r20SourceIdentityFixCommits:[
    '396efcf3cc98fb196a756067ef23dba13f348f61',
    'd78f4f79821755ec705a7ef7aacdf8a1f2fcbc20'
  ],
  packageZip:previous.packageZip,
  packageSha256:previous.packageSha256,
  candidatePackage:previous.candidatePackage,
  fileCount:files.length,
  aggregateSha256,
  excludedFromHash:[...excluded].sort(),
  appliedDelta:previous.appliedDelta||[],
  holdFixDelta:previous.holdFixDelta||[],
  r20FixDelta:[
    'tools/hr-source/tya-build-live-hr-source-safe-r20-inventory.mjs',
    'tools/qa/tya-hr-header-variants-r20-gate.mjs',
    'tools/release/cxorbia-readonly-post-gates-runner.mjs'
  ],
  methodologyRootCause:'R20_INVENTORY_BUILDER_NOT_USING_CANONICAL_HEADER_VARIANT_RESOLVER',
  sourceIdentity:'public_gviz_gid_verified_inventory',
  expectedInventory:{periods:14,tabs:28,visits:616,byCountry:{GT:476,HN:140}},
  gates:{status:'PENDING_FINAL_RERUN_AFTER_LOCK_APPLY',pass:[],hold:[]},
  safeState:{production:false,deploy:false,writes:false,imports:false,payments:false,merge:false},
  files
};
const buildLock=`/* CXOrbia source lock runtime V174 Corte 2A R20 source identity fix */\nvar CX_SOURCE_LOCK=${JSON.stringify({
  manifestFile:'docs/MANIFEST-V174-CORTE2A-EMPALME-DIRECTO-20260722.json',
  aggregateSha256,
  fileCount:files.length,
  generatedAt:manifest.generatedAt,
  candidateSha256:previous.packageSha256,
  packageSha256:previous.packageSha256,
  headBefore:previous.headBefore,
  empalmeCommit:previous.empalmeCommit,
  holdFixCommit:previous.holdFixCommit,
  r20SourceIdentityFixCommits:manifest.r20SourceIdentityFixCommits,
  sourceAccessMode:'public_gviz_gid_verified_inventory',
  status:'V174_R20_SOURCE_IDENTITY_FIX_PENDING_FINAL_GATES',
  note:'BUILD_ID = primeros 16 hex del aggregateSha256; app/ excluye build-lock y manifest V174.'
},null,2)};\nvar CX_BUILD_ID=CX_SOURCE_LOCK.aggregateSha256.slice(0,16);\nif(typeof window!=='undefined'){window.CX=window.CX||{};window.CX.BUILD_ID=CX_BUILD_ID;window.CX.SOURCE_LOCK=CX_SOURCE_LOCK;}\n`;
fs.mkdirSync(outDir,{recursive:true});
fs.writeFileSync(path.join(outDir,'MANIFEST-V174-CORTE2A-EMPALME-DIRECTO-20260722.json'),JSON.stringify(manifest,null,2)+'\n','utf8');
fs.writeFileSync(path.join(outDir,'build-lock.js'),buildLock,'utf8');
fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify({decision:'PASS_V174_R20_SOURCE_LOCK_PROPOSAL',sourceHead,requestCommit,fileCount:files.length,aggregateSha256,excluded:[...excluded],safeState:manifest.safeState},null,2)+'\n','utf8');
console.log(JSON.stringify({decision:'PASS_V174_R20_SOURCE_LOCK_PROPOSAL',sourceHead,requestCommit,fileCount:files.length,aggregateSha256,outDir:path.relative(root,outDir).replaceAll('\\','/'),safeState:manifest.safeState},null,2));
