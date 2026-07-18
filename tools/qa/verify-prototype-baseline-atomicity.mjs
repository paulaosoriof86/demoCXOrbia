#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root=process.cwd();
const registryPath=path.join(root,'backend/contracts/prototype-baseline-registry-v1.json');
const buildLockPath=path.join(root,'app/core/build-lock.js');
const checkpointPath=path.join(root,'app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md');

function fail(message){ console.error(`BASELINE_ATOMICITY_FAIL: ${message}`); process.exit(1); }
for(const p of [registryPath,buildLockPath,checkpointPath]) if(!fs.existsSync(p)) fail(`missing ${path.relative(root,p)}`);

let registry;
try{registry=JSON.parse(fs.readFileSync(registryPath,'utf8'));}catch(e){fail(`invalid registry JSON: ${e.message}`);}
const build=fs.readFileSync(buildLockPath,'utf8');
const checkpoint=fs.readFileSync(checkpointPath,'utf8');
const active=registry.activeBaseline||{};
const runtime=registry.currentRuntime||{};
const candidate=registry.candidate||{};
const invariant='empalmedRuntimeVersion == candidateVersion; activeBaselineVersion advances only after postGatesAndVisualFreeze';

if(registry.invariant!==invariant) fail('transition invariant changed');
if(active.status!=='active_baseline_frozen'||active.accepted!==true||active.empalmed!==true||active.active!==true||active.visualValidated!==true) fail('last frozen baseline evidence is incomplete');
if(!active.version||!active.sourceZipSha256||!active.manifestFile||!active.aggregateSha256) fail('last frozen baseline identity incomplete');
if(!runtime.version||!runtime.sourceZipSha256||!runtime.manifestFile||!runtime.aggregateSha256||!runtime.empalmeCommit) fail('current empalmed runtime evidence incomplete');
if(runtime.version!==candidate.version||runtime.sourceZipSha256!==candidate.sourceZipSha256||runtime.manifestFile!==candidate.manifestFile||runtime.aggregateSha256!==candidate.aggregateSha256) fail('current runtime and candidate registry differ');
if(runtime.accepted!==true||runtime.empalmed!==true||candidate.accepted!==true||candidate.empalmed!==true) fail('current runtime is not physically accepted and empalmed');

const allowed=new Set(registry.allowedCandidateStatuses||[]);
if(!allowed.has(candidate.status)) fail(`unsupported candidate status: ${candidate.status}`);
if(candidate.status!==runtime.status) fail('candidate and current runtime statuses differ');

const manifestPath=path.join(root,runtime.manifestFile);
if(!fs.existsSync(manifestPath)) fail(`current runtime manifest missing: ${runtime.manifestFile}`);
let manifest;
try{manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));}catch(e){fail(`invalid current runtime manifest: ${e.message}`);}
if(manifest.version!==runtime.version||manifest.candidateSha256!==runtime.sourceZipSha256||manifest.aggregateSha256!==runtime.aggregateSha256) fail('manifest and current runtime registry differ');

for(const [label,value] of [['sourceZipSha256',runtime.sourceZipSha256],['manifestFile',runtime.manifestFile],['aggregateSha256',runtime.aggregateSha256]]){
  if(!build.includes(`${label}:'${value}'`)&&!build.includes(`${label}: '${value}'`)) fail(`build lock ${label} differs from current runtime`);
}

if(runtime.status==='empalmed_pending_post_gates'){
  if(runtime.active!==false||candidate.active!==false) fail('pending runtime cannot be active baseline');
  if(runtime.postGatesPassed!==false||candidate.postGatesPassed!==false) fail('pending runtime falsely marks post-gates passed');
  if(runtime.visualValidated!==false||candidate.visualValidated!==false) fail('pending runtime falsely marks visual validation');
  if(runtime.version===active.version) fail('pending runtime must remain distinct from the last frozen rollback baseline');
  if(!checkpoint.includes(`${runtime.version} empalmada`)) fail('canonical checkpoint does not record current empalmed runtime');
  if(!checkpoint.includes('ACTIVE_BASELINE')||!checkpoint.toLowerCase().includes('pendiente')) fail('canonical checkpoint does not keep freeze pending');
}else if(runtime.status==='active_baseline_frozen'){
  if(runtime.active!==true||candidate.active!==true||runtime.postGatesPassed!==true||runtime.visualValidated!==true) fail('frozen runtime lacks completed post-gates/visual evidence');
  if(active.version!==runtime.version||active.sourceZipSha256!==runtime.sourceZipSha256) fail('frozen runtime and active baseline differ');
}else{
  fail(`unsupported current runtime status: ${runtime.status}`);
}

console.log(JSON.stringify({
  ok:true,
  decision:'PASS_PROTOTYPE_BASELINE_ATOMICITY',
  lastFrozenBaseline:active.version,
  currentRuntime:runtime.version,
  currentRuntimeStatus:runtime.status,
  candidate:candidate.version,
  candidateStatus:candidate.status,
  invariant:registry.invariant
},null,2));
