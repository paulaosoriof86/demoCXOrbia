#!/usr/bin/env node
'use strict';
const fs = require('fs');
const cp = require('child_process');

function fail(msg){ console.error(`F3_PROVIDER_PROMOTION_VERIFIER=FAIL ${msg}`); process.exit(1); }
function ok(cond,msg){ if(!cond) fail(msg); }
function readJson(p){ return JSON.parse(fs.readFileSync(p,'utf8')); }
function git(...args){ return cp.execFileSync('git',args,{encoding:'utf8'}).trim(); }

const EXPECTED_HEAD_BEFORE='739c13a84df82bf3e24917422bfba27a19d17752';
const EXPECTED_CONTRACT_BLOB='f1c265164b7bc697ecb5cd9b247c334afd76a5f2';
const CONTRACT_PATH='backend/config/cxorbia-provider-promotion-mechanism-v1.json';
const EVIDENCE_PATH='app/docs/evidence/RC15-F3-PROVIDER-PROMOTION-MECHANISM-LATEST.json';
const LOCK_PATH='backend/config/cxorbia-phase-a-continuity-lock.json';
const NEXT='G2-B_WAITING_EXPLICIT_AUTHORIZATION';

const c=readJson(CONTRACT_PATH), e=readJson(EVIDENCE_PATH), l=readJson(LOCK_PATH);

ok(git('rev-parse','HEAD^')===EXPECTED_HEAD_BEFORE,'parent_head_mismatch');
ok(git('rev-parse',`HEAD:${CONTRACT_PATH}`)===EXPECTED_CONTRACT_BLOB,'contract_blob_mismatch');
ok(c.id==='PROVIDER_PROMOTION_MECHANISM_V1' && c.version===1,'contract_identity');
ok(c.target.repository==='paulaosoriof86/demoCXOrbia' && c.target.branch==='docs-tya-v6-v71-audit','target_repo_branch');
ok(c.target.head===EXPECTED_HEAD_BEFORE,'contract_head_binding');
ok(c.target.protectedSource==='f9802fdd498934a8e7729fa5c7d18341bec1cd71','functional_source_binding');
ok(c.target.knownGoodRevision==='cxorbia-live-hr-dev-00011-f2f','rollback_revision_binding');

ok(c.authorization.providerMutationAuthorized===false && c.authorization.leaseIssued===false,'authorization_or_lease_not_closed');
ok(c.authorization.leaseSingleUse===true && c.authorization.retryBudgetAfterExplicitAuthorization===1,'lease_retry_contract');
ok(c.authorization.requiresSeparateExplicitAuthorizationInCurrentConversation===true,'explicit_authorization_contract');
ok(c.authorization.noOpConsumesLease===false && c.authorization.noOpConsumesRetry===false,'noop_budget_contract');

ok(c.preflight.mode==='READ_ONLY' && c.preflight.failClosed===true,'preflight_not_fail_closed_readonly');
for(const x of ['repository','branch','head','provider','project','region','service','targetRevision','evidenceDigest']) {
  ok(c.preflight.requiredBindings.includes(x),`missing_required_binding_${x}`);
}
ok(c.idempotency.alreadyActiveAndVerifiedResult==='NO_OP_ALREADY_PROMOTED','idempotency_noop');
ok(c.idempotency.ambiguousOrMismatchResult==='FAIL_CLOSED_REVIEW_REQUIRED' && c.idempotency.autoFix===false,'ambiguity_not_fail_closed');
ok(c.rollback.revision==='cxorbia-live-hr-dev-00011-f2f' && c.rollback.automaticWithoutAuthorization===false,'rollback_contract');
ok(c.f3SafetyCounters.providerWrites===0 && c.f3SafetyCounters.deploys===0 && c.f3SafetyCounters.g2bAttempts===0,'contract_safety_counters');
ok(c.nextGate===NEXT,'contract_next_gate');

ok(e.decision==='G2B_PROVIDER_PROMOTION_MECHANISM_PASS' && e.recoveryLaneDecision==='G2B_RECOVERY_LANE_PASS','evidence_decision');
ok(e.mode==='READ_ONLY_CERTIFICATION' && e.providerReadExecuted===false && e.providerWriteExecuted===false && e.deployExecuted===false && e.g2bRecoveryAttemptExecuted===false,'evidence_side_effect');
ok(e.authorization.currentProviderMutationAuthorization===false && e.authorization.currentRecoveryAuthorization===false && e.authorization.leaseIssued===false,'evidence_authorization');
ok(e.f3SafetyCounters.providerWrites===0 && e.f3SafetyCounters.deploys===0 && e.f3SafetyCounters.g2bAttempts===0,'evidence_counters');
ok(e.next===NEXT,'evidence_next');

ok(l.productionRealReadiness.completed===76,'readiness_not_76');
ok(l.f3ExecutionControl.status==='CLOSED_PASS_PROVIDER_PROMOTION_MECHANISM_V1_G2B_RECOVERY_LANE_PASS','lock_f3_status');
ok(l.f3ExecutionControl.providerMutationAuthorizedNow===false && l.f3ExecutionControl.providerMutationLeaseIssued===false,'lock_authorization_lease');
ok(l.f3ExecutionControl.providerWrites===0 && l.f3ExecutionControl.deploys===0 && l.f3ExecutionControl.g2bAttempts===0,'lock_counters');
ok(l.nextNow.action===NEXT && l.nextNow.manualActionFromPaulaRequired===true,'lock_next');

const allowed=[
  'CAMBIOS-BACKEND-RC15-F3-PROVIDER-PROMOTION-MECHANISM-20260826.md',
  'PENDIENTES-PROTOTIPO.md',
  'RESUMEN-PARA-CLAUDE.md',
  'app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md',
  'app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md',
  'app/docs/PRODUCTION-REAL-PROGRESS-LOCK-CXORBIA-TYA.md',
  'app/docs/evidence/RC15-F3-PROVIDER-PROMOTION-MECHANISM-LATEST.json',
  'backend/config/cxorbia-phase-a-continuity-lock.json',
  'backend/config/cxorbia-provider-promotion-mechanism-v1.json',
  'tools/continuity/validate-cxorbia-f3-provider-promotion-mechanism-v1.js'
].sort();

const changed=git('diff-tree','--no-commit-id','--name-only','-r','HEAD').split(/\r?\n/).filter(Boolean).sort();
ok(JSON.stringify(changed)===JSON.stringify(allowed),`atomic_delta_mismatch:${changed.join(',')}`);

for(const p of [
  'app/docs/PRODUCTION-REAL-PROGRESS-LOCK-CXORBIA-TYA.md',
  'app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md',
  'app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md',
  'RESUMEN-PARA-CLAUDE.md',
  'PENDIENTES-PROTOTIPO.md'
]){
  const s=fs.readFileSync(p,'utf8');
  ok(s.includes('76/100') && s.includes(NEXT),`mirror_not_synced:${p}`);
}

console.log(JSON.stringify({
  status:'PASS',
  gate:'F3_PROVIDER_PROMOTION_MECHANISM_V1',
  head:git('rev-parse','HEAD'),
  headBefore:EXPECTED_HEAD_BEFORE,
  contractBlob:EXPECTED_CONTRACT_BLOB,
  providerWrites:0,
  deploys:0,
  g2bAttempts:0,
  leaseIssued:false,
  next:NEXT
},null,2));
