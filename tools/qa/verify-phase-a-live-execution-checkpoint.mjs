#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(here,'../..');
const currentCheckpoint=path.join(repo,'app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md');
const tracker=path.join(repo,'app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md');
const plan=path.join(repo,'app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md');
const handoffLock=path.join(repo,'app/docs/SOURCE-LOCK-C6-STAFF-PRIVATE-EXECUTION-HANDOFF-PASS-20260811.md');
const v2Contract=path.join(repo,'backend/contracts/c6-staff-repair-bootstrap-exact-write-v2.json');
const v2Request=path.join(repo,'.github/cxorbia-firebase-requests/c6-staff-repair-bootstrap-exact-write-v2.json');
const v2Evidence=path.join(repo,'app/docs/evidence/C6-STAFF-REPAIR-BOOTSTRAP-EXACT-WRITE-V2-LATEST.json');

const read=p=>fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'');
const ensure=(v,c)=>{if(!v)throw new Error(c);};
for(const p of [currentCheckpoint,tracker,plan,handoffLock,v2Contract,v2Request])ensure(fs.existsSync(p),`CURRENT_AUTHORITY_MISSING:${path.relative(repo,p)}`);

const cp=read(currentCheckpoint),tr=read(tracker),pl=read(plan),lock=read(handoffLock);
const c=JSON.parse(read(v2Contract)),r=JSON.parse(read(v2Request));
const exactWritePass=r.enabled===false&&r.consumed===true&&r.decision==='PASS_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE_V2_READBACK';
const exactWritePrepared=r.enabled===false&&r.consumed===false;
ensure(exactWritePass||exactWritePrepared,'V2_REQUEST_STATE_INVALID');

for(const marker of ['paulaosoriof86/demoCXOrbia','docs-tya-v6-v71-audit','PR #7','31518927950'])ensure(cp.includes(marker),`CURRENT_CHECKPOINT_MARKER_MISSING:${marker}`);
ensure(/Auth (?:máximo|maximo) 14\s*\/\s*Firestore (?:máximo|maximo) 16\s*\/\s*deletes 0/i.test(cp),'CURRENT_CHECKPOINT_WRITE_BUDGET_MISSING');
ensure(lock.includes('PASS_C6_STAFF_PRIVATE_EXECUTION_HANDOFF'),'HANDOFF_LOCK_DRIFT');
ensure(c.schemaVersion==='cxorbia.c6.staff-repair-bootstrap.exact-write.v2','V2_CONTRACT_SCHEMA');
ensure(c.firebaseProjectId==='cxorbia-backend-dev'&&c.tenantId==='tya'&&c.canonicalProjectId==='cinepolis','V2_TARGET_DRIFT');
ensure(c.snapshotAuthority?.workflowRunId===31518927950&&c.snapshotAuthority?.expectedAuthPopulationBefore===228,'V2_SNAPSHOT_DRIFT');
ensure(c.forwardWriteBudget?.authWritesMax===14&&c.forwardWriteBudget?.firestoreWritesMax===16&&c.forwardWriteBudget?.authDeletes===0&&c.forwardWriteBudget?.firestoreDeletes===0,'V2_BUDGET_DRIFT');
ensure(c.authorization?.providerWritesAuthorizedByThisContract===false,'V2_SOURCE_ONLY_AUTHORIZATION_DRIFT');
ensure(r.schemaVersion==='cxorbia.c6.staff-repair-bootstrap.exact-write.request.v2','V2_REQUEST_SCHEMA');
ensure(r.authWritesMax===14&&r.firestoreWritesMax===16&&r.authDeletes===0&&r.firestoreDeletes===0,'V2_REQUEST_BUDGET_DRIFT');

let progress;
if(exactWritePass){
  ensure(fs.existsSync(v2Evidence),'V2_PASS_EVIDENCE_MISSING');
  const e=JSON.parse(read(v2Evidence));
  ensure(e.decision==='PASS_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE_V2_READBACK','V2_EVIDENCE_DECISION');
  ensure(e.writes?.authWritesTotal===14&&e.writes?.firestoreWritesTotal===16&&e.writes?.authDeletes===0&&e.writes?.firestoreDeletes===0,'V2_EVIDENCE_BUDGET');
  ensure(e.preflight?.allCanonicalReadbackBeforeRetire===true&&Object.values(e.targetReadback||{}).every(Boolean),'V2_CANONICAL_READBACK');
  ensure(Object.values(e.historicalReadback||{}).every(v=>v===2),'V2_HISTORICAL_READBACK');
  ensure(e.rollback?.executed===false&&e.rollback?.required===false,'V2_UNEXPECTED_ROLLBACK');
  ensure(cp.includes('PASS_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE_V2_READBACK')&&cp.includes('M5=8/8'),'CURRENT_CHECKPOINT_V2_PASS_MISSING');
  ensure(/TOTAL=88%\s*\|\s*RESTANTE=12%/i.test(cp),'CURRENT_CHECKPOINT_PROGRESS_MISSING');
  ensure(tr.includes('M5=8/8')&&tr.includes('88%')&&tr.includes('12%'),'TRACKER_PROGRESS_DRIFT');
  ensure(pl.includes('M5=8/8')&&pl.includes('88%')&&pl.includes('12%'),'PLAN_PROGRESS_DRIFT');
  progress={phaseACompletedPct:88,phaseARemainingPct:12,m5:'8/8'};
}else{
  ensure(cp.includes('M5=4/8')&&cp.includes('C6 STAFF REPAIR/BOOTSTRAP EXACT WRITE V2 AUTHORIZATION'),'CURRENT_CHECKPOINT_PREPARED_STATE_MISSING');
  ensure(/TOTAL=84%\s*\|\s*RESTANTE=16%/i.test(cp),'CURRENT_CHECKPOINT_PROGRESS_MISSING');
  ensure(tr.includes('M5=4/8')&&tr.includes('84%')&&tr.includes('16%'),'TRACKER_PROGRESS_DRIFT');
  ensure(pl.includes('M5=4/8')&&pl.includes('84%')&&pl.includes('16%'),'PLAN_PROGRESS_DRIFT');
  progress={phaseACompletedPct:84,phaseARemainingPct:16,m5:'4/8'};
}

const result={
  ok:true,
  decision:'PASS_PHASE_A_CURRENT_OPERATIONAL_CHECKPOINT',
  authority:'app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md',
  progress,
  exactWriteV2:{preparedSource:true,authorized:exactWritePass,consumed:r.consumed===true,decision:r.decision||null,snapshotWorkflowRunId:31518927950,expectedAuthPopulationBefore:228,authWritesMax:14,firestoreWritesMax:16,deletes:0},
  historicalCompatibility:{legacyCheckpointContractAuthoritative:false,prototypeBaselineRegistryAuthoritative:false},
  safety:{hrWrites:false,rulesWrites:false,storageWrites:false,deploy:false,merge:false,production:false}
};
console.log(JSON.stringify(result,null,2));
