#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process');
const root=path.resolve(__dirname,'..','..'),E='RC15-M3-MECHANISM-20260825-02';
const fail=m=>{console.error(`CONTINUITY_DRIFT_BLOCKED: ${m}`);process.exit(2);};
const j=p=>{try{return JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));}catch(e){fail(`json:${p}:${e.message}`);}};
const lock=j('backend/config/cxorbia-phase-a-continuity-lock.json'),ledger=j('backend/config/cxorbia-consumed-one-shot-gates.json'),aliases=j('backend/config/cxorbia-evidence-aliases.json'),m3=j('app/docs/evidence/RC15-M3-F1-F2-CANONICAL-AUTHORITY-LATEST.json'),cert=j('app/docs/evidence/RC15-M3-MECHANISM-CERTIFICATION-LATEST.json'),tomb=j('backend/config/cxorbia-historical-authority-tombstones.json'),authority=j('backend/config/cxorbia-validator-authority.json'),q=j('backend/config/cxorbia-m3-quiescence-lock.json'),direct=j('backend/config/cxorbia-m3-direct-readback-gate.json');
const current=Number(tomb.progress?.currentResidualHolds),next=String(lock.masterPlan?.next||'');
if(Number(String(lock.schemaVersion||'0').split('.')[0])<2||lock.planId!=='CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE'||lock.masterPlan?.id!=='CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1'||lock.masterPlan?.status!=='FROZEN'||lock.masterPlan?.currentPhase!=='M3_F1_F2_INERTIZATION_CANONICAL_AUTHORITY')fail('plan_identity');
if(lock.repository!=='paulaosoriof86/demoCXOrbia'||lock.branch!=='docs-tya-v6-v71-audit'||Number(lock.pullRequest)!==7)fail('repository_lane');
if(Number(lock.formalProgress?.completed)!==98||Number(lock.productionRealReadiness?.completed)!==69)fail('progress_metrics');
if(lock.m1ExecutionControl?.status!=='CLOSED_PASS'||lock.m2ExecutionControl?.status!=='CLOSED_PASS'||q.status!=='CLOSED_PASS')fail('prior_or_quiescence_state');
if(lock.m3MechanismEpoch!==E||lock.m3ExecutionControl?.mechanismEpoch!==E||Number(lock.m3ExecutionControl?.currentResidualHolds)!==current||lock.m3ExecutionControl?.next!==next||direct.next!==next||lock.m3ExecutionControl?.finiteQueueFrozen!==false||lock.m3ExecutionControl?.quiescenceStatus!=='CLOSED_PASS')fail('m3_lock_state');
if(lock.resumeProtocol?.canonicalStateMustAdvanceAtomically!==true||lock.resumeProtocol?.oneAtomicGitCommitPerM3Materialization!==true||lock.resumeProtocol?.historicalValidatorsNeverOverrideM3!==true||lock.resumeProtocol?.historicalWorkflowPushMustBeInert!==true||lock.resumeProtocol?.directGitHubReadbackRequiredAfterM3Materialization!==true||lock.resumeProtocol?.githubActionsRunsAreTelemetryNotExecutionAuthorityDuringM3!==true||lock.resumeProtocol?.pr7MustRemainClosedDuringM3FiniteQueue!==true||lock.resumeProtocol?.onMismatch!=='CONTINUITY_DRIFT_BLOCKED')fail('resume_protocol');
if(lock.masterPlan?.providerMutationAuthorizedNow!==false||lock.productionState?.businessDataWritesAuthorized!==false)fail('write_authority');
const p0=lock.g2Acceptance?.p0WritePathRecovery;if(p0?.p0Id!=='G2B_CANONICAL_WRITE_PATH_DISABLED_OR_UNROUTED'||p0.p0Proven!==true||p0.latestRecoveryDecision!=='RECOVERY_NO_PROVIDER_SIDE_EFFECT'||p0.replayAuthorized!==false||p0.automaticRetryAllowed!==false||Number(p0.providerMutationExecutions)!==0)fail('g2b_recovery');
if(ledger.m3MechanismEpoch!==E||ledger.policy?.consumedRequestsAreImmutable!==true||Number(ledger.coverage?.currentResidualHolds)!==current)fail('ledger_policy');
if(aliases.m3MechanismEpoch!==E||aliases.policy?.aliasesNeverAuthorizeExecution!==true)fail('alias_policy');
if(m3.m3MechanismEpoch!==E||cert.m3MechanismEpoch!==E||authority.m3MechanismEpoch!==E||Number(m3.f1?.currentResidualHolds)!==current||authority.activeSourceOnlyGate?.mode!=='DIRECT_GITHUB_READBACK')fail('m3_authority');
for(const s of ['tools/continuity/validate-cxorbia-canonical-authority.js','tools/continuity/validate-cxorbia-m3-direct-readback.js']){const r=cp.spawnSync(process.execPath,[path.join(root,s)],{cwd:root,encoding:'utf8'});if(r.status!==0)fail(`${path.basename(s)}:${(r.stderr||r.stdout||'').trim()}`);}
console.log('CONTINUITY_M3_ATOMIC_SYNC_PASS');
console.log('M3_BARRIER=CLOSED_PASS');
console.log('actionsAuthority=false');
console.log(`productionRealReadiness=${lock.productionRealReadiness.completed}/100`);
console.log(`nextAction=${next}`);
