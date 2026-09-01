#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..','..');
const EPOCH='CXORBIA-20260821-I5-G2B-FORENSIC-PROVIDER-LANE-READY-50';
const PLAN='CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE';
const RECOVERY_ID='i5-g2b-p0-writepath-recovery-20260821-02';
const fail=m=>{console.error(`CONTINUITY_DRIFT_BLOCKED: ${m}`);process.exit(2);};
const abs=p=>path.join(root,p);
const read=p=>{try{return fs.readFileSync(abs(p),'utf8');}catch(e){fail(`cannot read ${p}: ${e.message}`);}};
const json=p=>{try{return JSON.parse(read(p));}catch(e){fail(`cannot parse ${p}: ${e.message}`);}};

const lock=json('backend/config/cxorbia-phase-a-continuity-lock.json');
const ledger=json('backend/config/cxorbia-consumed-one-shot-gates.json');
const aliases=json('backend/config/cxorbia-evidence-aliases.json');
const r4=json('backend/config/cxorbia-r4-root-cause-closure.json');
const g1=json('backend/config/cxorbia-g1-production-cutover.json');
const g2a=json('backend/config/cxorbia-g2a-production-readonly-smoke.json');
const g2bAuth=json('backend/config/cxorbia-g2b-live-synthetic-acceptance-request.json');
const recovery=json('backend/config/cxorbia-g2b-p0-writepath-deploy-recovery-request.json');
const recoveryEvidence=json('app/docs/evidence/I5-G2B-P0-WRITEPATH-RECOVERY-LATEST.json');
const executeArtifact=json('backend/config/cxorbia-g2b-p0-writepath-deploy-recovery-execute.json');
const forensic=json('app/docs/evidence/I5-G2B-PROVIDER-FORENSIC-READINESS-LATEST.json');
const reconciliation=json('app/docs/evidence/I5-G2B-PROVIDER-READONLY-RECONCILIATION-LATEST.json');
const syncReceipt=json('app/docs/evidence/I5-G2B-ATOMIC-CONTINUITY-SYNC-LATEST.json');

if(lock.schemaVersion!=='1.7.0'||lock.syncEpoch!==EPOCH||lock.planId!==PLAN)fail('lock identity/epoch invalid');
if(lock.repository!=='paulaosoriof86/demoCXOrbia'||lock.branch!=='docs-tya-v6-v71-audit'||Number(lock.pullRequest)!==7)fail('repository lane drifted');
if(lock.currentIteration!=='I5-G2'||Number(lock.formalProgress?.completed)!==98||Number(lock.formalProgress?.pending)!==2)fail('formal progress drifted');
if(lock.resumeProtocol?.canonicalStateMustAdvanceAtomically!==true||lock.resumeProtocol?.eventArtifactsDoNotOverrideTerminalReceipts!==true||lock.resumeProtocol?.onMismatch!=='CONTINUITY_DRIFT_BLOCKED')fail('atomic resume protocol invalid');

const iterations=Array.isArray(lock.iterations)?lock.iterations:[];
const ids=['I5-R1','I5-R2','I5-R3','I5-R4','I5-G1','I5-G2'];
if(JSON.stringify(iterations.map(x=>x.id))!==JSON.stringify(ids)||iterations.reduce((s,x)=>s+Number(x.weight||0),0)!==15)fail('bounded plan drifted');
for(const id of ['I5-R1','I5-R2','I5-R3','I5-R4','I5-G1'])if(iterations.find(x=>x.id===id)?.status!=='PASS')fail(`${id} must remain PASS`);
if(iterations.find(x=>x.id==='I5-G2')?.status!=='ACTIVE')fail('I5-G2 must remain ACTIVE');

if(lock.productionState?.active!==true||lock.productionState?.providerRedeployExecuted!==false||lock.productionState?.rebuildExecuted!==false||lock.productionState?.businessDataWritesAuthorized!==false)fail('production state unsafe');
if(lock.productionState?.syntheticAcceptanceExecutionBlockedUntilRecoveryPass!==true||lock.productionState?.syntheticAcceptanceScope!=='CXORBIA_E2E_SYNTH_*')fail('synthetic boundary lost');
if(g1.decision!=='PRODUCTION_CUTOVER_EXECUTED'||g1.providerDeployExecuted!==false||g1.rebuildExecuted!==false)fail('G1 frozen receipt drifted');
if(g2a.decision!=='PRODUCTION_REMOTE_READONLY_SMOKE_PASS_WITH_FROZEN_SHOPPER_REUSE'||g2a.productP0Proven!==false)fail('G2-A frozen receipt drifted');
for(const k of ['providerWrites','authWrites','passwordChanges','passwordResets','firestoreWrites','hrWrites','rulesWrites','storageWrites','makeCalls','geminiCalls','paymentWrites','hostingDeploys','cloudRunDeploys'])if(Number(g2a.safety?.[k]||0)!==0)fail(`G2-A unsafe ${k}`);
if(r4.decision!=='ROOT_CAUSE_CLOSED_PASS')fail('R4 frozen receipt drifted');

const p0=lock.g2Acceptance?.p0WritePathRecovery;
if(p0?.p0Id!=='G2B_CANONICAL_WRITE_PATH_DISABLED_OR_UNROUTED'||p0.p0Proven!==true)fail('G2-B P0 identity lost');
if(p0.status!=='RECOVERY_NO_PROVIDER_SIDE_EFFECT_FORENSIC_PROVIDER_LANE_READY_NEW_EXPLICIT_DECISION_REQUIRED')fail('G2-B current recovery status drifted');
if(p0.latestRecoveryId!==RECOVERY_ID||p0.latestRecoveryDecision!=='RECOVERY_NO_PROVIDER_SIDE_EFFECT')fail('G2-B terminal recovery lineage drifted');
if(p0.recoveryEnabled!==false||p0.recoveryConsumed!==true||Number(p0.executionCount)!==1||Number(p0.providerMutationExecutions)!==0||p0.automaticRetryAllowed!==false||p0.replayAuthorized!==false)fail('G2-B terminal recovery safety drifted');

if(recovery.recoveryId!==RECOVERY_ID||recovery.status!=='recovery_no_provider_side_effect'||recovery.decision!=='RECOVERY_NO_PROVIDER_SIDE_EFFECT')fail('recovery request terminal state invalid');
if(recovery.enabled!==false||recovery.consumed!==true||Number(recovery.executionCount)!==1||Number(recovery.providerMutationExecutions)!==0||recovery.automaticRetryAllowed!==false||recovery.merge!==false)fail('recovery request replay/provider mutation boundary invalid');
for(const k of ['firestoreWrites','authWrites','storageWrites','externalHrWrites','realDataWrites','realCredentialWrites','realPaymentWrites','rulesWrites','makeCalls','geminiCalls'])if(Number(recovery[k]||0)!==0)fail(`recovery forbidden budget ${k}`);

if(recoveryEvidence.schemaVersion!=='cxorbia.g2b.p0-writepath-deploy.recovery-evidence.v1'||recoveryEvidence.recoveryId!==RECOVERY_ID||recoveryEvidence.decision!=='RECOVERY_NO_PROVIDER_SIDE_EFFECT')fail('terminal recovery evidence invalid');
if(recoveryEvidence.cloudRunChanged!==false||recoveryEvidence.hostingChanged!==false||recoveryEvidence.automaticRetryAllowed!==false||recoveryEvidence.merge!==false)fail('terminal evidence unsafe');
for(const k of ['firestoreWrites','authWrites','storageWrites','externalHrWrites','realDataWrites','realCredentialWrites','realPaymentWrites','rulesWrites','makeCalls','geminiCalls'])if(Number(recoveryEvidence[k]||0)!==0)fail(`terminal evidence forbidden write ${k}`);
if(recoveryEvidence.providerBaseline?.cloudRunRevision!==recoveryEvidence.providerAfter?.cloudRunRevision||recoveryEvidence.providerBaseline?.hostingReleaseName!==recoveryEvidence.providerAfter?.hostingReleaseName)fail('terminal no-side-effect provider readback mismatch');

if(executeArtifact.recoveryId!==RECOVERY_ID)fail('execute event artifact lineage mismatch');
const event=p0.recoveryExecuteArtifact;
if(event?.path!=='backend/config/cxorbia-g2b-p0-writepath-deploy-recovery-execute.json'||event.eventArtifactImmutable!==true||event.stateAuthority!==false||event.terminalizedByReceipt!==true||event.replayAuthorized!==false)fail('execute event-artifact semantics invalid');

if(forensic.schemaVersion!=='cxorbia.provider-forensic-readiness.v3.2'||forensic.decision!=='FORENSIC_PROVIDER_LANE_READY'||forensic.gates?.recoveryProviderLaneReady!==true)fail('provider forensic lane not READY');
for(const k of ['providerWrites','cloudBuildExecutions','hostingDeploys','cloudRunDeploys','firestoreWrites','authWrites','storageWrites','hrWrites','externalHrWrites','paymentWrites','makeCalls','geminiCalls'])if(Number(forensic.safety?.[k]||0)!==0)fail(`forensic readiness unsafe ${k}`);
if(forensic.safety?.merge!==false)fail('forensic readiness merge unsafe');

if(reconciliation.decision!=='A_NO_G2B_PROVIDER_DEPLOY_OBSERVED'||reconciliation.cloudRun?.changedFromBaseline!==false||reconciliation.hosting?.releaseAfterExecute!==false)fail('provider frozen baseline reconciliation lost');

if(ledger.schemaVersion!=='1.2.0'||ledger.syncEpoch!==EPOCH||ledger.planId!==PLAN)fail('consumed ledger epoch drifted');
if(ledger.policy?.consumedRequestsAreImmutable!==true||ledger.policy?.rerunSameRequestIdAllowed!==false||ledger.policy?.terminalReceiptOverridesHistoricalEventArtifactFlags!==true||ledger.policy?.eventArtifactDoesNotAuthorizeReplay!==true)fail('consumed ledger policy invalid');
for(const id of ['i5-g2b-p0-writepath-recovery-20260820-01',RECOVERY_ID]){
  const row=ledger.consumedRequests?.find(x=>x.requestId===id);
  if(!row||row.decision!=='RECOVERY_NO_PROVIDER_SIDE_EFFECT'||Number(row.providerMutationExecutions)!==0||row.automaticRetryAllowed!==false||row.rerunSameRequestId!==false||row.merge!==false)fail(`recovery not terminal/immutable in ledger: ${id}`);
}

const stage=lock.g2Acceptance?.liveInPlatformSyntheticAcceptance;
if(stage?.status!=='BLOCKED_UNTIL_VERIFIED_G2B_P0_RECOVERY_PASS'||stage.executionPhase!=='WAIT_FOR_VERIFIED_G2B_P0_RECOVERY_PASS')fail('synthetic stage is not blocked');
if(stage.authorizationArtifactIsStateAuthority!==false||stage.syntheticDataOnly!==true||stage.syntheticTagPrefix!=='CXORBIA_E2E_SYNTH_'||stage.cleanupAndPostCleanReadbackRequired!==true)fail('synthetic stage authority/scope drifted');
if(stage.businessDataWritesAuthorizedNow!==false||stage.externalHrWritesAuthorizedNow!==false||stage.paymentExecutionAuthorizedNow!==false||stage.makeGeminiAuthorizedNow!==false||stage.deployAuthorizedNow!==false||stage.rebuildAuthorizedNow!==false||stage.mergeAuthorizedNow!==false)fail('synthetic stage unsafe current authority');

if(g2bAuth.schemaVersion!=='cxorbia.g2b.live-synthetic-acceptance-request.v1'||g2bAuth.enabled!==true||g2bAuth.consumed!==false||g2bAuth.status!=='authorized_stage_pending_execution'||g2bAuth.automaticRetryAllowed!==false)fail('historical synthetic authorization artifact drifted');
if(lock.canonicalStateAuthority?.executeAndAuthorizationArtifactsAreHistoricalEventsAfterTerminalReceipt!==true||lock.canonicalStateAuthority?.prBodyIsMirrorOnly!==true)fail('canonical authority model invalid');

if(syncReceipt.schemaVersion!=='cxorbia.g2b.atomic-continuity-sync.v1'||syncReceipt.syncEpoch!==EPOCH||syncReceipt.planId!==PLAN||syncReceipt.currentIteration!=='I5-G2'||syncReceipt.terminalRecovery?.recoveryId!==RECOVERY_ID||syncReceipt.terminalRecovery?.decision!=='RECOVERY_NO_PROVIDER_SIDE_EFFECT')fail('atomic sync receipt invalid');
if(syncReceipt.safety?.providerWrites!==0||syncReceipt.safety?.cloudBuildExecutions!==0||syncReceipt.safety?.cloudRunDeploys!==0||syncReceipt.safety?.hostingDeploys!==0||syncReceipt.safety?.merge!==false)fail('atomic sync receipt unsafe');

const canonicalDocs=[
  'app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md',
  'app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md',
  'app/docs/EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md',
  'app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md',
  'app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md',
  'CAMBIOS-BACKEND.md',
  'RESUMEN-PARA-CLAUDE.md',
  'PENDIENTES-PROTOTIPO.md'
];
for(const p of canonicalDocs){
  const c=read(p);
  if(!c.includes(EPOCH)||!c.includes(PLAN)||!c.includes('I5-G2'))fail(`${p} not on atomic epoch`);
  if(c.includes('ACTIVE_BLOCKER: `NONE`')||c.includes('ACTIVE_BLOCKER: NONE'))fail(`${p} falsely says no blocker`);
}
if(aliases.policy?.aliasesDoNotCreateNewWork!==true||aliases.policy?.namingDifferenceDoesNotAuthorizeRerun!==true||aliases.policy?.conversationInterruptionDoesNotInvalidateTerminalPass!==true)fail('alias policy invalid');

const hard=lock.hardStops||{};
for(const k of ['reopenG1WithoutNewP0','rerunG2AWithoutNewP0','createNewBranchOrPr','rebuildBeforeRecoveryAuthorization','retryOriginalG2BExecute','replayConsumedRecovery','allowG2BStageBeforeRecoveryPass','allowFinal100BeforeLiveInPlatformSyntheticAcceptance','automaticRecoveryRetry'])if(hard[k]!==false)fail(`hard stop drifted ${k}`);

console.log('CONTINUITY_ATOMIC_SYNC_PASS');
console.log(`syncEpoch=${EPOCH}`);
console.log(`planId=${PLAN}`);
console.log('currentIteration=I5-G2');
console.log('formalProgress=98/100');
console.log('G2A=PASS_FROZEN');
console.log('G2BRecovery=RECOVERY_NO_PROVIDER_SIDE_EFFECT');
console.log('providerForensicLane=FORENSIC_PROVIDER_LANE_READY');
console.log('providerMutations=0');
console.log('syntheticStage=BLOCKED_UNTIL_VERIFIED_G2B_P0_RECOVERY_PASS');
console.log('nextAction=REQUIRE_NEW_EXPLICIT_RECOVERY_DECISION_AFTER_ATOMIC_CONTINUITY_SYNC');
