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

if(c.version!=='3.0.0') fail('checkpoint contract version drift');
if(c.lastFrozenBaseline?.status!=='active_baseline_frozen'||c.lastFrozenBaseline?.visualValidated!==true) fail('last frozen baseline not preserved');
if(c.lastFrozenBaseline?.version!==r.activeBaseline?.version||c.lastFrozenBaseline?.sourceZipSha256!==r.activeBaseline?.sourceZipSha256) fail('checkpoint/registry frozen baseline mismatch');
if(c.currentRuntime?.version!==r.currentRuntime?.version||c.currentRuntime?.status!==r.currentRuntime?.status) fail('checkpoint/registry current runtime mismatch');
if(c.currentRuntime?.sourceZipSha256!==r.currentRuntime?.sourceZipSha256||c.currentRuntime?.manifestFile!==r.currentRuntime?.manifestFile||c.currentRuntime?.aggregateSha256!==r.currentRuntime?.aggregateSha256) fail('checkpoint/registry runtime evidence mismatch');
if(c.candidate?.version!==r.candidate?.version||c.candidate?.status!==r.candidate?.status) fail('candidate state mismatch');
if(c.promotionPolicy?.invariant!==invariant||r.invariant!==invariant) fail('promotion invariant mismatch');
if(c.plan?.[0]!==c.activeBlock?.id||c.activeBlock?.id!=='CORTE_0_V159_POST_EMPALME') fail('Corte 0 must remain the active first block');
if(c.mandatoryCloseSections?.length!==12) fail('mandatory close sections drift');
if(c.gates?.production!=='hold'||c.gates?.firestoreWrites!=='hold'||c.gates?.authWrites!=='hold'||c.gates?.storageWrites!=='hold'||c.gates?.hrWrites!=='hold'||c.gates?.realImports!=='hold'||c.gates?.make!=='hold'||c.gates?.gemini!=='hold'||c.gates?.payments!=='hold') fail('unauthorized gate enabled');

for(const marker of ['V159 empalmada','d47ea700f7e48a2b0ba31574a84b89c6a20f3449','ACTIVE_BASELINE','pendiente']) if(!checkpoint.includes(marker)) fail(`canonical checkpoint missing marker: ${marker}`);
for(const marker of ['CORTE 0','V159 post-empalme','TECHNICAL_PASS_PENDING_VISUAL','Hosting DEV V159']) if(!plan.includes(marker)) fail(`canonical plan missing marker: ${marker}`);
if(/V159[^\n]{0,80}ACTIVE_BASELINE[^\n]{0,30}(cerrad|congelad|activo)/i.test(checkpoint)) fail('checkpoint prematurely claims V159 active baseline');

console.log(JSON.stringify({
  ok:true,
  decision:'PASS_PHASE_A_LIVE_EXECUTION_CHECKPOINT',
  lastFrozenBaseline:c.lastFrozenBaseline.version,
  currentRuntime:c.currentRuntime.version,
  currentRuntimeStatus:c.currentRuntime.status,
  activeBlock:c.activeBlock.id,
  hostingDev:c.gates.hostingDev,
  production:c.gates.production
},null,2));
