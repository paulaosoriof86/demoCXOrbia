#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root=process.cwd();
const registryPath=path.join(root,'backend/contracts/prototype-baseline-registry-v1.json');
const buildLockPath=path.join(root,'app/core/build-lock.js');
const checkpointPath=path.join(root,'app/docs/PHASE-A-LIVE-EXECUTION-CHECKPOINT-TYA-20260713.md');

function fail(message){ console.error(`BASELINE_ATOMICITY_FAIL: ${message}`); process.exit(1); }
for(const p of [registryPath,buildLockPath,checkpointPath]) if(!fs.existsSync(p)) fail(`missing ${path.relative(root,p)}`);

let registry;
try{registry=JSON.parse(fs.readFileSync(registryPath,'utf8'));}catch(e){fail(`invalid registry JSON: ${e.message}`);}
const build=fs.readFileSync(buildLockPath,'utf8');
const checkpoint=fs.readFileSync(checkpointPath,'utf8');
const active=registry.activeBaseline||{};
const candidate=registry.candidate||{};

if(registry.invariant!=='acceptedCandidateVersion == empalmedVersion == activeBaselineVersion') fail('invariant changed');
if(active.status!=='accepted_and_empalmed'||active.accepted!==true||active.empalmed!==true) fail('active baseline is not accepted_and_empalmed');
if(!active.version||!active.sourceZipSha256||!active.manifestFile||!active.aggregateSha256) fail('active baseline evidence incomplete');
if(!build.includes(`sourceZipSha256:'${active.sourceZipSha256}'`)&&!build.includes(`sourceZipSha256: '${active.sourceZipSha256}'`)) fail('build lock source ZIP differs from registry');
if(!build.includes(`manifestFile:'${active.manifestFile}'`)&&!build.includes(`manifestFile: '${active.manifestFile}'`)) fail('build lock manifest differs from registry');
if(!build.includes(`aggregateSha256:'${active.aggregateSha256}'`)&&!build.includes(`aggregateSha256: '${active.aggregateSha256}'`)) fail('build lock aggregate differs from registry');

const allowed=new Set(registry.allowedCandidateStatuses||[]);
if(!allowed.has(candidate.status)) fail(`unsupported candidate status: ${candidate.status}`);
if(candidate.status==='accepted_and_empalmed'){
  if(candidate.accepted!==true||candidate.empalmed!==true) fail('accepted candidate is not empalmed');
  if(candidate.version!==active.version) fail('accepted candidate and active baseline differ');
  if(candidate.sourceZipSha256!==active.sourceZipSha256) fail('accepted candidate ZIP and active baseline differ');
}else{
  if(candidate.accepted===true||candidate.empalmed===true) fail('unaccepted candidate cannot be accepted or empalmed');
  if(candidate.version===active.version) fail('rejected/pending candidate cannot replace active baseline');
}

for(const forbidden of registry.promotionRule?.forbiddenIntermediateStates||[]){
  if(checkpoint.includes(forbidden)) fail(`forbidden intermediate state documented: ${forbidden}`);
}
for(const phrase of ['baseline auditada de continuidad','continuity baseline','source lock vigente: V110.\n- V111']){
  if(checkpoint.toLowerCase().includes(phrase.toLowerCase())) fail(`ambiguous baseline phrase present: ${phrase}`);
}
if(!checkpoint.includes('Última candidata aceptada = candidata empalmada = baseline activa')) fail('atomic rule missing from checkpoint');

console.log(JSON.stringify({
  ok:true,
  decision:'PASS_PROTOTYPE_BASELINE_ATOMICITY',
  activeBaseline:active.version,
  activeStatus:active.status,
  candidate:candidate.version,
  candidateStatus:candidate.status,
  invariant:registry.invariant
},null,2));
