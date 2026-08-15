#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(here,'../..');
const rel=p=>path.relative(repo,p).replace(/\\/g,'/');
const P={
  checkpoint:path.join(repo,'app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md'),
  index:path.join(repo,'app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md'),
  forensic:path.join(repo,'app/docs/AUDITORIA-FORENSE-INTEGRAL-PREPRODUCCION-CXORBIA-TYA-20260814.md'),
  plan:path.join(repo,'app/docs/ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md'),
  tracker:path.join(repo,'app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md'),
  handoff:path.join(repo,'app/docs/SOURCE-LOCK-C6-STAFF-PRIVATE-EXECUTION-HANDOFF-PASS-20260811.md'),
  v2Contract:path.join(repo,'backend/contracts/c6-staff-repair-bootstrap-exact-write-v2.json'),
  v2Request:path.join(repo,'.github/cxorbia-firebase-requests/c6-staff-repair-bootstrap-exact-write-v2.json'),
  iteration1:path.join(repo,'tools/qa/verify-root-cause-correction-iteration1.mjs'),
  iteration2:path.join(repo,'tools/qa/verify-root-cause-correction-iteration2.mjs'),
  historicalHarness:path.join(repo,'tools/qa/cxorbia-p0-shopper-real-auth-e2e.mjs')
};
const read=p=>fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'');
const ensure=(v,c)=>{if(!v)throw new Error(c);};
for(const p of Object.values(P))ensure(fs.existsSync(p),`CURRENT_AUTHORITY_MISSING:${rel(p)}`);

const cp=read(P.checkpoint),idx=read(P.index),audit=read(P.forensic),plan=read(P.plan),tracker=read(P.tracker),lock=read(P.handoff),harness=read(P.historicalHarness);
const c=JSON.parse(read(P.v2Contract)),r=JSON.parse(read(P.v2Request));

for(const marker of ['paulaosoriof86/demoCXOrbia','docs-tya-v6-v71-audit','PR #7'])ensure(cp.includes(marker),`CURRENT_CHECKPOINT_MARKER_MISSING:${marker}`);
ensure(idx.includes('ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md'),'DURABLE_PLAN_NOT_INDEXED');
ensure(idx.includes('CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md'),'CURRENT_CHECKPOINT_NOT_INDEXED');
ensure(idx.includes('FORENSIC_ROOT_CAUSE_LOCKED'),'SOURCE_INDEX_FORENSIC_LOCK_MISSING');
ensure(audit.includes('P0_AUTH_CONTROL_PLANE_FRAGMENTATION'),'FORENSIC_AUTH_ROOT_CAUSE_MISSING');
ensure(audit.includes('P0_PERSISTENCE_SPLIT_BRAIN'),'FORENSIC_PERSISTENCE_ROOT_CAUSE_MISSING');
ensure(plan.includes('MISMA_CANDIDATA')&&plan.includes('NO REPROCESO'),'DURABLE_SAME_CANDIDATE_LOCK_DRIFT');
ensure(plan.includes('5 iteraciones')||plan.includes('cinco iteraciones'),'DURABLE_ITERATION_COUNT_DRIFT');
ensure(plan.includes('ITERACIÓN 3')&&plan.includes('Auth/Firestore Shopper persistence'),'DURABLE_I3_CONTRACT_MISSING');
ensure(lock.includes('PASS_C6_STAFF_PRIVATE_EXECUTION_HANDOFF'),'HANDOFF_LOCK_DRIFT');

const i1Pass=/I1[^\n]*(?:PASS|15\/15)/i.test(cp)&&/I1[^\n]*(?:PASS|15\/15)/i.test(tracker);
const i2Pass=/I2[^\n]*(?:PASS|20\/20)/i.test(cp)&&/I2[^\n]*(?:PASS|20\/20)/i.test(tracker);
ensure(i1Pass,'ITERATION_1_CURRENT_PASS_MARKER_MISSING');
ensure(i2Pass,'ITERATION_2_CURRENT_PASS_MARKER_MISSING');
ensure(/35%\s*(?:completado|completo|completed)/i.test(cp),'CURRENT_PROGRESS_35_MISSING');
ensure(/65%\s*(?:pendiente|remaining)/i.test(cp),'CURRENT_REMAINING_65_MISSING');
ensure(/35%\s*(?:completado|completed)/i.test(tracker),'TRACKER_PROGRESS_35_MISSING');
ensure(/65%\s*(?:pendiente|remaining)/i.test(tracker),'TRACKER_REMAINING_65_MISSING');
ensure(/I3[^\n]*(?:0\/25|EN CURSO|pendiente)/i.test(tracker),'TRACKER_I3_PENDING_MISSING');
ensure(/I3/i.test(cp)&&/request/i.test(cp),'CURRENT_I3_CONTINUATION_STATE_MISSING');
ensure(idx.includes('SOURCE-LOCK-ITERATION3-'),'CURRENT_I3_SOURCE_LOCK_NOT_INDEXED');

ensure(!/^\s*import\s+.+\s+from\s+['"]playwright['"]\s*;?\s*$/m.test(harness),'HISTORICAL_HARNESS_STATIC_PLAYWRIGHT_IMPORT');
ensure(harness.includes("await import('playwright')"),'HISTORICAL_HARNESS_DYNAMIC_PLAYWRIGHT_IMPORT_MISSING');
ensure(harness.includes("pending('shopper')")&&harness.includes('acceptanceAutomated:false'),'HISTORICAL_HARNESS_LEGAL_GATE_DRIFT');

const exactWritePass=r.enabled===false&&r.consumed===true&&r.decision==='PASS_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE_V2_READBACK';
const exactWritePrepared=r.enabled===false&&r.consumed===false;
ensure(exactWritePass||exactWritePrepared,'V2_REQUEST_STATE_INVALID');
ensure(c.schemaVersion==='cxorbia.c6.staff-repair-bootstrap.exact-write.v2','V2_CONTRACT_SCHEMA');
ensure(c.firebaseProjectId==='cxorbia-backend-dev'&&c.tenantId==='tya'&&c.canonicalProjectId==='cinepolis','V2_TARGET_DRIFT');
ensure(c.authorization?.providerWritesAuthorizedByThisContract===false,'V2_SOURCE_ONLY_AUTHORIZATION_DRIFT');
ensure(r.schemaVersion==='cxorbia.c6.staff-repair-bootstrap.exact-write.request.v2','V2_REQUEST_SCHEMA');

const result={
  ok:true,
  decision:'PASS_PHASE_A_CURRENT_OPERATIONAL_CHECKPOINT_FORENSIC_PLAN',
  authority:'app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md',
  progress:{goLiveCorrectionCompletedPct:35,goLiveCorrectionRemainingPct:65,iteration:'I3-open',basis:'durable-root-cause-go-live-plan'},
  priorTechnicalProgress:{retained:true,authoritativeForProductionReadiness:false},
  exactWriteV2:{preserved:true,consumed:r.consumed===true,decision:r.decision||null},
  i3HistoricalHarness:{sourceOnlyReady:true,playwrightDeferred:true,legalGateAware:true,legalConsentAutomated:false},
  locks:{sameCandidate:true,noGeneralRediagnosis:true,noAuthRebuild:true,noNewBranchOrPr:true},
  safety:{authWrites:false,firestoreWrites:false,hrWrites:false,rulesWrites:false,storageWrites:false,deploy:false,merge:false,production:false}
};
console.log(JSON.stringify(result,null,2));
