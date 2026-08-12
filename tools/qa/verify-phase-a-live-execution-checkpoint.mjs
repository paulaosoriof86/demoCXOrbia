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

const read=p=>fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'');
const ensure=(v,c)=>{if(!v)throw new Error(c);};
for(const p of [currentCheckpoint,tracker,plan,handoffLock,v2Contract,v2Request])ensure(fs.existsSync(p),`CURRENT_AUTHORITY_MISSING:${path.relative(repo,p)}`);

const cp=read(currentCheckpoint),tr=read(tracker),pl=read(plan),lock=read(handoffLock);
const c=JSON.parse(read(v2Contract)),r=JSON.parse(read(v2Request));
const requiredCp=[
  'paulaosoriof86/demoCXOrbia','docs-tya-v6-v71-audit','PR #7','cxorbia-backend-dev',
  'M5=4/8','84%','16%','31518927950','Auth 228','Auth=14','Firestore=16','deletes=0',
  'C6 STAFF REPAIR/BOOTSTRAP EXACT WRITE V2 AUTHORIZATION'
];
for(const marker of requiredCp)ensure(cp.includes(marker),`CURRENT_CHECKPOINT_MARKER_MISSING:${marker}`);
ensure(tr.includes('M5=4/8')&&tr.includes('84%')&&tr.includes('16%'),'TRACKER_PROGRESS_DRIFT');
ensure(pl.includes('M5=4/8')&&pl.includes('84%')&&pl.includes('16%'),'PLAN_PROGRESS_DRIFT');
ensure(lock.includes('PASS_C6_STAFF_PRIVATE_EXECUTION_HANDOFF')&&lock.includes('C6 STAFF REPAIR/BOOTSTRAP EXACT WRITE V2 AUTHORIZATION'),'HANDOFF_LOCK_DRIFT');
ensure(c.schemaVersion==='cxorbia.c6.staff-repair-bootstrap.exact-write.v2','V2_CONTRACT_SCHEMA');
ensure(c.snapshotAuthority?.workflowRunId===31518927950&&c.snapshotAuthority?.expectedAuthPopulationBefore===228,'V2_SNAPSHOT_DRIFT');
ensure(c.forwardWriteBudget?.authWritesMax===14&&c.forwardWriteBudget?.firestoreWritesMax===16&&c.forwardWriteBudget?.authDeletes===0&&c.forwardWriteBudget?.firestoreDeletes===0,'V2_BUDGET_DRIFT');
ensure(c.authorization?.providerWritesAuthorizedByThisContract===false,'V2_SOURCE_ONLY_AUTHORIZATION_DRIFT');
ensure(r.schemaVersion==='cxorbia.c6.staff-repair-bootstrap.exact-write.request.v2','V2_REQUEST_SCHEMA');
ensure(r.enabled===false&&r.consumed===false&&r.production===false&&r.deploy===false&&r.merge===false,'V2_REQUEST_MUST_REMAIN_DISABLED_SOURCE_ONLY');
ensure(r.authWritesMax===14&&r.firestoreWritesMax===16&&r.authDeletes===0&&r.firestoreDeletes===0,'V2_REQUEST_BUDGET_DRIFT');

const result={
  ok:true,
  decision:'PASS_PHASE_A_CURRENT_OPERATIONAL_CHECKPOINT',
  authority:'app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md',
  progress:{phaseACompletedPct:84,phaseARemainingPct:16,m5:'4/8'},
  exactWriteV2:{preparedSource:true,authorized:false,snapshotWorkflowRunId:31518927950,expectedAuthPopulationBefore:228,authWritesMax:14,firestoreWritesMax:16,deletes:0},
  historicalCompatibility:{legacyCheckpointContractAuthoritative:false,prototypeBaselineRegistryAuthoritative:false},
  safety:{providerWrites:false,authWrites:false,firestoreWrites:false,hrWrites:false,deploy:false,merge:false,production:false}
};
console.log(JSON.stringify(result,null,2));
