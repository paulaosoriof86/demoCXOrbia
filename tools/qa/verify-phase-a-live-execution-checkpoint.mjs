#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(here,'../..');
const currentCheckpoint=path.join(repo,'app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md');
const sourceIndex=path.join(repo,'app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md');
const forensic=path.join(repo,'app/docs/AUDITORIA-FORENSE-INTEGRAL-PREPRODUCCION-CXORBIA-TYA-20260814.md');
const durablePlan=path.join(repo,'app/docs/ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md');
const handoffLock=path.join(repo,'app/docs/SOURCE-LOCK-C6-STAFF-PRIVATE-EXECUTION-HANDOFF-PASS-20260811.md');
const v2Contract=path.join(repo,'backend/contracts/c6-staff-repair-bootstrap-exact-write-v2.json');
const v2Request=path.join(repo,'.github/cxorbia-firebase-requests/c6-staff-repair-bootstrap-exact-write-v2.json');
const iteration1Gate=path.join(repo,'tools/qa/verify-root-cause-correction-iteration1.mjs');

const read=p=>fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'');
const ensure=(v,c)=>{if(!v)throw new Error(c);};
for(const p of [currentCheckpoint,sourceIndex,forensic,durablePlan,handoffLock,v2Contract,v2Request,iteration1Gate]){
  ensure(fs.existsSync(p),`CURRENT_AUTHORITY_MISSING:${path.relative(repo,p)}`);
}

const cp=read(currentCheckpoint),idx=read(sourceIndex),audit=read(forensic),plan=read(durablePlan),lock=read(handoffLock);
const c=JSON.parse(read(v2Contract)),r=JSON.parse(read(v2Request));

// Current authority after the 2026-08-14 forensic cut. Old M1-M10 percentages/run IDs are historical only.
for(const marker of ['paulaosoriof86/demoCXOrbia','docs-tya-v6-v71-audit','PR #7']){
  ensure(cp.includes(marker),`CURRENT_CHECKPOINT_MARKER_MISSING:${marker}`);
}
ensure(cp.includes('ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md'),'DURABLE_PLAN_NOT_REFERENCED');
ensure(cp.includes('NO REPROCESO'),'AUTH_NO_REPROCESS_LOCK_MISSING');
ensure(cp.includes('ITERACION_1_SOURCE_ONLY_ROOT_CAUSE_CONSOLIDATION'),'ITERATION_1_CONTRACT_MISSING');
ensure(cp.includes('ITERACION_5_EXACT_BUILD_PREPROD_AND_GO_LIVE'),'ITERATION_5_CONTRACT_MISSING');
ensure(idx.includes('FORENSIC_ROOT_CAUSE_LOCKED'),'SOURCE_INDEX_FORENSIC_LOCK_MISSING');
ensure(idx.includes('ROOT_CAUSE_CORRECTION_EXECUTION')||idx.includes('ITERACION_1'),'SOURCE_INDEX_CORRECTION_PATH_MISSING');
ensure(audit.includes('P0_AUTH_CONTROL_PLANE_FRAGMENTATION'),'FORENSIC_AUTH_ROOT_CAUSE_MISSING');
ensure(audit.includes('P0_PERSISTENCE_SPLIT_BRAIN'),'FORENSIC_PERSISTENCE_ROOT_CAUSE_MISSING');
ensure(plan.includes('MISMA_CANDIDATA')&&plan.includes('NO REPROCESO'),'DURABLE_SAME_CANDIDATE_LOCK_DRIFT');
ensure(plan.includes('5 iteraciones')||plan.includes('cinco iteraciones'),'DURABLE_ITERATION_COUNT_DRIFT');
ensure(lock.includes('PASS_C6_STAFF_PRIVATE_EXECUTION_HANDOFF'),'HANDOFF_LOCK_DRIFT');

// Exact Write V2 remains preserved historical evidence, not the current readiness percentage.
const exactWritePass=r.enabled===false&&r.consumed===true&&r.decision==='PASS_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE_V2_READBACK';
const exactWritePrepared=r.enabled===false&&r.consumed===false;
ensure(exactWritePass||exactWritePrepared,'V2_REQUEST_STATE_INVALID');
ensure(c.schemaVersion==='cxorbia.c6.staff-repair-bootstrap.exact-write.v2','V2_CONTRACT_SCHEMA');
ensure(c.firebaseProjectId==='cxorbia-backend-dev'&&c.tenantId==='tya'&&c.canonicalProjectId==='cinepolis','V2_TARGET_DRIFT');
ensure(c.authorization?.providerWritesAuthorizedByThisContract===false,'V2_SOURCE_ONLY_AUTHORIZATION_DRIFT');
ensure(r.schemaVersion==='cxorbia.c6.staff-repair-bootstrap.exact-write.request.v2','V2_REQUEST_SCHEMA');

const iteration1Pass=cp.includes('ITERATION_1_SOURCE_ONLY_PASS')||cp.includes('ITERACION_1_SOURCE_ONLY_PASS');
const progress=iteration1Pass
  ?{goLiveCorrectionCompletedPct:15,goLiveCorrectionRemainingPct:85,iteration:'1/5',basis:'durable-root-cause-go-live-plan'}
  :{goLiveCorrectionCompletedPct:0,goLiveCorrectionRemainingPct:100,iteration:'0/5',basis:'durable-root-cause-go-live-plan'};

if(iteration1Pass){
  ensure(cp.includes('PASS_ROOT_CAUSE_CORRECTION_ITERATION1_SOURCE_ONLY'),'ITERATION_1_PASS_EVIDENCE_MARKER_MISSING');
  ensure(cp.includes('ITERACION_2_CANONICAL_PERSISTENCE_AND_TRANSVERSAL_REGRESSION'),'ITERATION_2_NEXT_MISSING');
}

const result={
  ok:true,
  decision:'PASS_PHASE_A_CURRENT_OPERATIONAL_CHECKPOINT_FORENSIC_PLAN',
  authority:'app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md',
  progress,
  priorTechnicalProgress:{retained:true,authoritativeForProductionReadiness:false},
  exactWriteV2:{preserved:true,consumed:r.consumed===true,decision:r.decision||null},
  locks:{sameCandidate:true,noGeneralRediagnosis:true,noAuthRebuild:true,noNewBranchOrPr:true},
  safety:{authWrites:false,firestoreWrites:false,hrWrites:false,rulesWrites:false,storageWrites:false,deploy:false,merge:false,production:false}
};
console.log(JSON.stringify(result,null,2));
