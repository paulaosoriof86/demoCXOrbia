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
const technicalPassState='technical_pass_pending_dev_authorization';
const visualPendingState='hosting_dev_remote_smoke_pass_pending_visual';
const trustedTechnicalEvidence=new Map([
  ['V161C',{
    workflowRun:29712762494,
    workflowCommit:'7acc4e6c18355827df6ed649c3a537db07eec196',
    artifactId:8449340543,
    artifactDigest:'sha256:a2e4861610a1928bbf77ce34b790bad1765ff5bda91302669f7d14ad1ee75864',
    periods:14,
    visits:616,
    blockers:0
  }]
]);
const trustedHostingEvidence=new Map([
  [29626385151,{
    workflowCommit:'8cf166eea6a0ebd0b2c6221925671d04865999f0',
    artifactId:8430697082,
    artifactDigest:'sha256:fbe071cf34561df95c6e4cffa393f3c6851d742eb8f00776c28a3354e4365692',
    hostingVersion:'projects/87461567267/sites/cxorbia-backend-dev/versions/c8add179fb326b6a'
  }],
  [29649918631,{
    workflowCommit:'91aed5f9bdd54a396bd8758479888516dd1c3013',
    artifactId:8431164287,
    artifactDigest:'sha256:693d05ecfc4621c02321e13a0caf6f40ac2683356ee0893c02a04f027aa3539a',
    hostingVersion:'projects/87461567267/sites/cxorbia-backend-dev/versions/dbb0c50992aba5e2'
  }],
  [29716601804,{
    workflowCommit:'8950ef47a8dd0e6f86ad368ffb68b2be638accb6',
    artifactId:8450820491,
    artifactDigest:'sha256:f207df387fe0449fc8382093097cb9c316746b60fdc42d8feaa67abe098dc96f',
    buildLabel:'v161c-r21-source-safe-20260719-dev'
  }]
]);

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

const assertPendingIdentity=()=>{
  if(runtime.active!==false||candidate.active!==false) fail('non-frozen runtime cannot be active baseline');
  if(runtime.visualValidated!==false||candidate.visualValidated!==false) fail('non-frozen runtime falsely marks visual validation');
  if(runtime.version===active.version) fail('non-frozen runtime must remain distinct from rollback baseline');
  if(!checkpoint.includes(runtime.version)) fail('canonical checkpoint does not record current runtime');
  if(!checkpoint.includes('ACTIVE_BASELINE')) fail('canonical checkpoint does not preserve freeze boundary');
};

if(runtime.status==='empalmed_pending_post_gates'){
  assertPendingIdentity();
  if(runtime.postGatesPassed!==false||candidate.postGatesPassed!==false) fail('pre-gate runtime falsely marks post-gates passed');
}else if(runtime.status===technicalPassState){
  assertPendingIdentity();
  if(runtime.postGatesPassed!==true||candidate.postGatesPassed!==true) fail('technical-pass runtime lacks post-gate PASS');
  if(runtime.hostingDevPassed!==false||runtime.remoteSmokePassed!==false||candidate.hostingDevPassed!==false||candidate.remoteSmokePassed!==false) fail('technical-pass runtime falsely marks Hosting DEV or remote smoke');
  const evidence=runtime.technicalGateEvidence||{};
  const trusted=trustedTechnicalEvidence.get(runtime.version);
  if(!trusted) fail('technical gate evidence is not trusted');
  for(const [key,value] of Object.entries(trusted)) if(evidence[key]!==value) fail(`technical gate ${key} evidence mismatch`);
  if(!checkpoint.includes('TECHNICAL_PASS_PENDING_DEV_AUTHORIZATION')) fail('checkpoint does not record technical PASS boundary');
}else if(runtime.status===visualPendingState){
  assertPendingIdentity();
  if(runtime.postGatesPassed!==true||candidate.postGatesPassed!==true) fail('visual-pending runtime lacks post-gate PASS');
  if(runtime.hostingDevPassed!==true||runtime.remoteSmokePassed!==true) fail('visual-pending runtime lacks Hosting DEV or remote smoke PASS');
  const evidence=runtime.hostingDevEvidence||{};
  const trusted=trustedHostingEvidence.get(evidence.workflowRun);
  if(!trusted) fail('Hosting DEV workflow evidence is not trusted');
  for(const [key,value] of Object.entries(trusted)) if(evidence[key]!==value) fail(`Hosting DEV ${key} evidence mismatch`);
  if(evidence.blockers!==0) fail('Hosting DEV evidence contains blockers');
  if(evidence.shopperIdentitiesInvented!==0||evidence.paidConfirmedOrInferred!==0) fail('Hosting DEV evidence invents identities or payments');
  if(!checkpoint.toLowerCase().includes('visual')) fail('checkpoint does not preserve pending visual gate');
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
  trustedTechnicalRun:runtime.technicalGateEvidence?.workflowRun||null,
  trustedHostingRun:runtime.hostingDevEvidence?.workflowRun||null,
  candidate:candidate.version,
  candidateStatus:candidate.status,
  invariant:registry.invariant
},null,2));
