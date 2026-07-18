#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const contractPath=path.join(root,'backend/contracts/phase-a-live-execution-checkpoint-v1.json');
const registryPath=path.join(root,'backend/contracts/prototype-baseline-registry-v1.json');
const checkpointPath=path.join(root,'app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md');
const planPath=path.join(root,'app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md');
const fail=m=>{console.error(`CHECKPOINT_FAIL: ${m}`);process.exit(1);};
for(const p of [contractPath,registryPath,checkpointPath,planPath]) if(!fs.existsSync(p)) fail(`missing ${path.relative(root,p)}`);
let c,r;
try{c=JSON.parse(fs.readFileSync(contractPath,'utf8'));r=JSON.parse(fs.readFileSync(registryPath,'utf8'));}catch(e){fail(`invalid JSON: ${e.message}`);}
const checkpoint=fs.readFileSync(checkpointPath,'utf8');
const plan=fs.readFileSync(planPath,'utf8');
const invariant='empalmedRuntimeVersion == candidateVersion; activeBaselineVersion advances only after postGatesAndVisualFreeze';
const visualPendingState='hosting_dev_remote_smoke_pass_pending_visual';

if(!['3.0.0','3.1.0'].includes(c.version)) fail('checkpoint contract version drift');
if(c.lastFrozenBaseline?.status!=='active_baseline_frozen'||c.lastFrozenBaseline?.visualValidated!==true) fail('last frozen baseline not preserved');
if(c.lastFrozenBaseline?.version!==r.activeBaseline?.version||c.lastFrozenBaseline?.sourceZipSha256!==r.activeBaseline?.sourceZipSha256) fail('checkpoint/registry frozen baseline mismatch');
if(c.currentRuntime?.version!==r.currentRuntime?.version||c.currentRuntime?.status!==r.currentRuntime?.status) fail('checkpoint/registry current runtime mismatch');
if(c.currentRuntime?.sourceZipSha256!==r.currentRuntime?.sourceZipSha256||c.currentRuntime?.manifestFile!==r.currentRuntime?.manifestFile||c.currentRuntime?.aggregateSha256!==r.currentRuntime?.aggregateSha256) fail('checkpoint/registry runtime evidence mismatch');
if(c.candidate?.version!==r.candidate?.version||c.candidate?.status!==r.candidate?.status) fail('candidate state mismatch');
if(c.promotionPolicy?.invariant!==invariant||r.invariant!==invariant) fail('promotion invariant mismatch');
if(c.plan?.[0]!==c.activeBlock?.id||c.activeBlock?.id!=='CORTE_0_V159_POST_EMPALME') fail('Corte 0 must remain the active first block');
if(c.mandatoryCloseSections?.length!==12) fail('mandatory close sections drift');
if(c.gates?.production!=='hold'||c.gates?.firestoreWrites!=='hold'||c.gates?.authWrites!=='hold'||c.gates?.storageWrites!=='hold'||c.gates?.hrWrites!=='hold'||c.gates?.realImports!=='hold'||c.gates?.make!=='hold'||c.gates?.gemini!=='hold'||c.gates?.payments!=='hold') fail('unauthorized gate enabled');

const runtime=c.currentRuntime||{};
if(runtime.status==='empalmed_pending_post_gates'){
  if(runtime.postGatesPassed!==false||runtime.visualValidated!==false||runtime.active!==false) fail('pre-gate runtime state mismatch');
  if(c.gates?.hostingDev!=='authorized_pending_execution'||c.gates?.browserSmoke!=='pending') fail('pre-gate contract gate mismatch');
}else if(runtime.status===visualPendingState){
  if(c.version!=='3.1.0') fail('visual-pending state requires checkpoint contract 3.1.0');
  if(runtime.postGatesPassed!==true||runtime.hostingDevPassed!==true||runtime.remoteSmokePassed!==true||runtime.visualValidated!==false||runtime.active!==false) fail('visual-pending runtime evidence mismatch');
  if(c.gates?.hostingDev!=='pass'||c.gates?.browserSmoke!=='pass'||c.gates?.remoteSmoke!=='pass'||c.gates?.visualValidation!=='pending'||c.gates?.activeBaselineFreeze!=='pending') fail('visual-pending contract gate mismatch');
  if(c.completedEvidence?.hostingDevWorkflowRun!==29626385151||c.completedEvidence?.hostingDevArtifactId!==8430697082) fail('Hosting DEV evidence identifiers mismatch');
  if(c.completedEvidence?.hostingDevArtifactDigest!=='sha256:fbe071cf34561df95c6e4cffa393f3c6851d742eb8f00776c28a3354e4365692') fail('Hosting DEV artifact digest mismatch');
  if(c.completedEvidence?.remoteProjectPeriodKpiHistory!=='PASS_TYA_PROJECT_PERIOD_KPI_HISTORY') fail('remote project/period gate evidence missing');
  if(c.completedEvidence?.paidConfirmedOrInferred!==0) fail('payment inference introduced');
}else if(runtime.status==='active_baseline_frozen'){
  if(runtime.postGatesPassed!==true||runtime.visualValidated!==true||runtime.active!==true) fail('frozen runtime evidence mismatch');
}else{
  fail(`unsupported checkpoint runtime state: ${runtime.status}`);
}

for(const marker of ['V159','ACTIVE_BASELINE']) if(!checkpoint.includes(marker)) fail(`canonical checkpoint missing marker: ${marker}`);
if(!checkpoint.toLowerCase().includes('visual')) fail('canonical checkpoint does not preserve visual gate');
for(const marker of ['CORTE 0','V159 post-empalme','TECHNICAL_PASS_PENDING_VISUAL','Hosting DEV V159']) if(!plan.includes(marker)) fail(`canonical plan missing marker: ${marker}`);
if(/V159[^\n]{0,80}ACTIVE_BASELINE[^\n]{0,30}(cerrad|congelad|activo)/i.test(checkpoint)) fail('checkpoint prematurely claims V159 active baseline');

console.log(JSON.stringify({
  ok:true,
  decision:'PASS_PHASE_A_LIVE_EXECUTION_CHECKPOINT',
  lastFrozenBaseline:c.lastFrozenBaseline.version,
  currentRuntime:runtime.version,
  currentRuntimeStatus:runtime.status,
  activeBlock:c.activeBlock.id,
  hostingDev:c.gates.hostingDev,
  remoteSmoke:c.gates.remoteSmoke||'not_applicable',
  visualValidation:c.gates.visualValidation,
  production:c.gates.production
},null,2));
