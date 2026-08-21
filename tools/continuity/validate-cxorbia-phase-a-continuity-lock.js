#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..','..');
const fail=m=>{console.error(`CONTINUITY_DRIFT_BLOCKED: ${m}`);process.exit(2);};
const abs=p=>path.join(root,p);
const read=p=>{try{return fs.readFileSync(abs(p),'utf8');}catch(e){fail(`cannot read ${p}: ${e.message}`);}};
const json=p=>{try{return JSON.parse(read(p));}catch(e){fail(`cannot parse ${p}: ${e.message}`);}};
const exists=p=>fs.existsSync(abs(p));

const lock=json('backend/config/cxorbia-phase-a-continuity-lock.json');
const gate=json('backend/config/cxorbia-production-promotion-gate-evidence.json');
const ledger=json('backend/config/cxorbia-consumed-one-shot-gates.json');
const aliases=json('backend/config/cxorbia-evidence-aliases.json');
const r4=json('backend/config/cxorbia-r4-root-cause-closure.json');
const g1=json('backend/config/cxorbia-g1-production-cutover.json');
const g2a=json('backend/config/cxorbia-g2a-production-readonly-smoke.json');
const g2b=json('backend/config/cxorbia-g2b-live-synthetic-acceptance-request.json');
const reconciliation=json('app/docs/evidence/I5-G2B-PROVIDER-READONLY-RECONCILIATION-LATEST.json');
const recovery=json('backend/config/cxorbia-g2b-p0-writepath-deploy-recovery-request.json');
const deployWorkflow=read('.github/workflows/cxorbia-phase-a-live-hr-runtime-deploy-dev.yml');

if(lock.schemaVersion!=='1.6.2'||lock.planId!=='CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE')fail('lock identity invalid');
if(lock.syncEpoch!=='CXORBIA-20260820-I5-G2B-P0-PROVIDER-A-PROVEN-RECOVERY-PREPARED-49')fail('sync epoch invalid');
if(lock.repository!=='paulaosoriof86/demoCXOrbia'||lock.branch!=='docs-tya-v6-v71-audit'||Number(lock.pullRequest)!==7)fail('repository lane drifted');
if(lock.currentIteration!=='I5-G2'||lock.formalProgress?.completed!==98||lock.formalProgress?.pending!==2)fail('formal progress drifted');
if(lock.resumeProtocol?.conversationIndependent!==true||lock.resumeProtocol?.terminalPassSurvivesConversationInterruption!==true||lock.resumeProtocol?.prBodyIsMirrorOnly!==true||lock.resumeProtocol?.headMustBeResolvedDynamically!==true||lock.resumeProtocol?.onMismatch!=='CONTINUITY_DRIFT_BLOCKED')fail('resume protocol invalid');

const iterations=Array.isArray(lock.iterations)?lock.iterations:[];
const ids=['I5-R1','I5-R2','I5-R3','I5-R4','I5-G1','I5-G2'];
if(JSON.stringify(iterations.map(x=>x.id))!==JSON.stringify(ids)||iterations.reduce((s,x)=>s+Number(x.weight||0),0)!==15)fail('bounded iteration plan drifted');
for(const id of ['I5-R1','I5-R2','I5-R3','I5-R4','I5-G1'])if(iterations.find(x=>x.id===id)?.status!=='PASS')fail(`${id} must remain PASS`);
if(iterations.find(x=>x.id==='I5-G2')?.status!=='ACTIVE')fail('I5-G2 must remain ACTIVE');

if(lock.productionState?.active!==true||lock.productionState?.providerRedeployExecuted!==false||lock.productionState?.rebuildExecuted!==false||lock.productionState?.businessDataWritesAuthorized!==false)fail('production state unsafe');
if(lock.productionState?.syntheticAcceptanceWritesAuthorized!==true||!String(lock.productionState?.syntheticAcceptanceScope||'').startsWith('CXORBIA_E2E_SYNTH_*'))fail('synthetic acceptance contract lost');
if(g1.decision!=='PRODUCTION_CUTOVER_EXECUTED'||g1.providerDeployExecuted!==false||g1.rebuildExecuted!==false)fail('G1 receipt drifted');
if(gate.productionCutoverExecuted!==true||gate.productionDeploymentExecuted!==false)fail('promotion receipt drifted');

const a=lock.g2Acceptance?.technicalReadOnlyProductionSmoke;
if(a?.status!=='PASS'||g2a.decision!=='PRODUCTION_REMOTE_READONLY_SMOKE_PASS_WITH_FROZEN_SHOPPER_REUSE'||g2a.productP0Proven!==false)fail('G2-A frozen PASS invalid');
for(const k of ['providerWrites','authWrites','passwordChanges','passwordResets','firestoreWrites','hrWrites','rulesWrites','storageWrites','makeCalls','geminiCalls','paymentWrites','hostingDeploys','cloudRunDeploys'])if(Number(g2a.safety?.[k]||0)!==0)fail(`G2-A unsafe ${k}`);

const p0=lock.g2Acceptance?.p0WritePathRecovery;
if(p0?.status!=='PROVIDER_A_PROVEN_RECOVERY_REARM_AUTH_REQUIRED'||p0.p0Id!=='G2B_CANONICAL_WRITE_PATH_DISABLED_OR_UNROUTED'||p0.p0Proven!==true)fail('G2-B P0 recovery state invalid');
if(p0.originalExecuteSha!=='c746bdf068edf1322b7c9a5e497ea5aff13e6b58'||p0.sourceFixHeadSha!=='1d2cfecba0a89b637398d747a628e549d9823c68')fail('G2-B recovery lineage invalid');
if(p0.recoveryAuthorizationGate!=='PAULA_I5_G2B_P0_WRITEPATH_RECOVERY_REARM'||p0.recoveryEnabled!==false||p0.recoveryExecuteExists!==false||p0.automaticRetryAllowed!==false)fail('G2-B recovery must remain disabled');
if(Number(p0.cloudBuildMax)!==1||Number(p0.cloudRunDeployMax)!==1||Number(p0.hostingDeployMax)!==1||Number(p0.providerBusinessDataWrites)!==0)fail('G2-B recovery budget invalid');

if(reconciliation.schemaVersion!=='cxorbia.g2b.provider-readonly-reconciliation.v1'||reconciliation.decision!=='A_NO_G2B_PROVIDER_DEPLOY_OBSERVED')fail('provider A evidence missing');
if(reconciliation.execution?.sha!==p0.originalExecuteSha||reconciliation.execution?.automaticRetryAllowed!==false)fail('provider reconciliation lineage invalid');
if(reconciliation.cloudRun?.latestReadyRevision!=='cxorbia-live-hr-dev-00010-n78'||reconciliation.cloudRun?.changedFromBaseline!==false||reconciliation.cloudRun?.changedAfterExecute!==false)fail('Cloud Run A proof invalid');
if(reconciliation.hosting?.releaseAfterExecute!==false||reconciliation.hosting?.latestReleaseName!=='sites/cxorbia-backend-dev/releases/1787196507030000'||reconciliation.hosting?.latestVersionName!=='sites/cxorbia-backend-dev/versions/1093671c6f2053ec')fail('Hosting A proof invalid');
for(const k of ['providerWrites','firestoreWrites','authWrites','storageWrites','hrWrites','externalHrWrites','paymentWrites','makeCalls','geminiCalls','deploys'])if(Number(reconciliation.safety?.[k]||0)!==0)fail(`provider reconciliation unsafe ${k}`);

if(recovery.schemaVersion!=='cxorbia.g2b.p0-writepath-deploy.recovery-request.v1'||recovery.recoveryId!=='i5-g2b-p0-writepath-recovery-20260820-01')fail('recovery request identity invalid');
if(recovery.provenDecision!=='A_NO_G2B_PROVIDER_DEPLOY_OBSERVED'||recovery.originalExecuteSha!==p0.originalExecuteSha||recovery.sourceFixHeadSha!==p0.sourceFixHeadSha)fail('recovery request lineage invalid');
if(recovery.status!=='prepared_waiting_paula_rearm_authorization'||recovery.enabled!==false||recovery.consumed!==false||recovery.executionCount!==0||recovery.maxExecutionCount!==1)fail('recovery request must remain prepared/disabled');
if(recovery.authorizedBy!==null||recovery.authorizationText!==null||recovery.authorizedAt!==null||recovery.paulaExplicitInCurrentConversation!==false)fail('recovery request falsely authorized');
if(recovery.automaticRetryAllowed!==false||recovery.merge!==false)fail('recovery retry/merge unsafe');
for(const k of ['firestoreWrites','authWrites','storageWrites','externalHrWrites','realDataWrites','realCredentialWrites','realPaymentWrites','rulesWrites','makeCalls','geminiCalls'])if(Number(recovery[k]||0)!==0)fail(`recovery forbidden budget ${k}`);
if(Number(recovery.cloudBuildExecutionsMax)!==1||Number(recovery.cloudRunDeployExecutionsMax)!==1||Number(recovery.hostingDeployExecutionsMax)!==1)fail('recovery provider execution budget invalid');
if(exists('backend/config/cxorbia-g2b-p0-writepath-deploy-recovery-execute.json'))fail('recovery execute must not exist before explicit re-arm authorization');

const b=lock.g2Acceptance?.liveInPlatformSyntheticAcceptance;
if(b?.status!=='BLOCKED_UNTIL_G2B_P0_RECOVERY_PASS'||b.executionPhase!=='WAIT_FOR_G2B_P0_RECOVERY_PASS')fail('G2-B stage must remain blocked');
if(b.sameProductionUrlRequired!==true||b.productionUrl!=='https://cxorbia-backend-dev.web.app'||b.alternatePlatformAllowed!==false||b.localCloneOrEmulatorAllowed!==false||b.syntheticDataOnly!==true||b.syntheticTagPrefix!=='CXORBIA_E2E_SYNTH_'||b.cleanupAndPostCleanReadbackRequired!==true)fail('G2-B stage target/synthetic boundary invalid');
if(b.paulaObservationsCaptured!==false||b.businessDataWritesAuthorizedNow!==false||b.externalHrWritesAuthorizedNow!==false||b.paymentExecutionAuthorizedNow!==false||b.makeGeminiAuthorizedNow!==false||b.deployAuthorizedNow!==false||b.rebuildAuthorizedNow!==false||b.mergeAuthorizedNow!==false)fail('G2-B current boundary unsafe');

if(g2b.schemaVersion!=='cxorbia.g2b.live-synthetic-acceptance-request.v1'||g2b.enabled!==true||g2b.consumed!==false||g2b.status!=='authorized_stage_pending_execution'||g2b.mode!=='STAGE_AND_TEST'||g2b.allowedExecutions!==1||g2b.executionsConsumed!==0||g2b.automaticRetryAllowed!==false)fail('pre-existing synthetic stage authorization drifted');
const budget=g2b.budgets||{};for(const k of ['realAuthCreates','realAuthUpdates','realAuthPasswordResets','realDataWrites','externalHrWrites','realPaymentWrites','makeCalls','geminiCalls','rulesWrites','hostingDeploys','cloudRunDeploys','rebuilds','merges'])if(Number(budget[k]||0)!==0)fail(`G2-B stage forbidden budget ${k}`);

if(lock.hardStops?.reopenG1WithoutNewP0!==false||lock.hardStops?.rerunG2AWithoutNewP0!==false||lock.hardStops?.createNewBranchOrPr!==false||lock.hardStops?.rebuildBeforeRecoveryAuthorization!==false||lock.hardStops?.retryOriginalG2BExecute!==false||lock.hardStops?.allowG2BStageBeforeRecoveryPass!==false||lock.hardStops?.allowFinal100BeforeLiveInPlatformSyntheticAcceptance!==false)fail('current hard stops invalid');
if(!deployWorkflow.includes('frozen-g2b-original-one-shot')||!deployWorkflow.includes('cxorbia-g2b-p0-writepath-deploy-recovery-execute.json')||!deployWorkflow.includes('PAULA_I5_G2B_P0_WRITEPATH_RECOVERY_REARM')||!deployWorkflow.includes('RECOVERY_PASS_FULL'))fail('existing deploy workflow recovery hardening missing');

const canonicalDocs=['app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md','app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md'];
for(const p of canonicalDocs){const c=read(p);if(!c.includes(lock.syncEpoch)||!c.includes(lock.planId)||!c.includes(lock.currentIteration))fail(`${p} not synchronized`);}
const addenda=['app/docs/CAMBIOS-BACKEND-ADDENDUM-G2B-PROVIDER-RECONCILIATION-RECOVERY-20260820.md','app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-G2B-PROVIDER-RECONCILIATION-20260820.md','app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-G2B-PROVIDER-RECONCILIATION-20260820.md'];
for(const p of addenda){const c=read(p);if(!c.includes('A_NO_G2B_PROVIDER_DEPLOY_OBSERVED')||!c.includes('98/100'))fail(`${p} missing current G2-B state`);}
if(ledger.policy?.consumedRequestsAreImmutable!==true||ledger.policy?.rerunSameRequestIdAllowed!==false||ledger.policy?.conversationInterruptionDoesNotResetConsumedState!==true)fail('consumed request policy invalid');
if(aliases.policy?.aliasesDoNotCreateNewWork!==true||aliases.policy?.namingDifferenceDoesNotAuthorizeRerun!==true||aliases.policy?.conversationInterruptionDoesNotInvalidateTerminalPass!==true)fail('alias policy invalid');
if(r4.decision!=='ROOT_CAUSE_CLOSED_PASS')fail('R4 frozen receipt drifted');

console.log('CONTINUITY_LOCK_PASS');
console.log(`syncEpoch=${lock.syncEpoch}`);
console.log(`planId=${lock.planId}`);
console.log(`currentIteration=${lock.currentIteration}`);
console.log('formalProgress=98/100');
console.log('G2A=PASS_FROZEN');
console.log('G2BProviderReconciliation=A_NO_G2B_PROVIDER_DEPLOY_OBSERVED');
console.log('G2BRecovery=PREPARED_DISABLED_REARM_AUTH_REQUIRED');
console.log('automaticRetryAllowed=false');
console.log('providerBusinessWrites=0');
console.log('nextAction=PAULA_I5_G2B_P0_WRITEPATH_RECOVERY_REARM');
