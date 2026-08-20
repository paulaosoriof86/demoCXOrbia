#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..','..');
const fail=m=>{console.error(`CONTINUITY_DRIFT_BLOCKED: ${m}`);process.exit(2);};
const read=p=>{try{return fs.readFileSync(path.join(root,p),'utf8');}catch(e){fail(`cannot read ${p}: ${e.message}`);}};
const json=p=>{try{return JSON.parse(read(p));}catch(e){fail(`cannot parse ${p}: ${e.message}`);}};
const lock=json('backend/config/cxorbia-phase-a-continuity-lock.json');
const gate=json('backend/config/cxorbia-production-promotion-gate-evidence.json');
const ledger=json('backend/config/cxorbia-consumed-one-shot-gates.json');
const aliases=json('backend/config/cxorbia-evidence-aliases.json');
const r4=json('backend/config/cxorbia-r4-root-cause-closure.json');
const g1=json('backend/config/cxorbia-g1-production-cutover.json');
const g2a=json('backend/config/cxorbia-g2a-production-readonly-smoke.json');
const g2b=json('backend/config/cxorbia-g2b-live-synthetic-acceptance-request.json');
const live=json('.github/cxorbia-gate-requests/request.json');
if(!lock.syncEpoch||!lock.planId)fail('missing lock identity');
if(lock.resumeProtocol?.conversationIndependent!==true||lock.resumeProtocol?.terminalPassSurvivesConversationInterruption!==true||lock.resumeProtocol?.prBodyIsMirrorOnly!==true||lock.resumeProtocol?.headMustBeResolvedDynamically!==true||lock.resumeProtocol?.onMismatch!=='CONTINUITY_DRIFT_BLOCKED')fail('resume protocol invalid');
if(lock.hardStops?.rebuildBeforePromotion!==false||lock.hardStops?.cutoverBeforeRootCauseClosedPass!==false||lock.hardStops?.cutoverWithoutExplicitAuthorization!==false||lock.hardStops?.reopenG1WithoutNewP0!==false||lock.hardStops?.rerunG2AWithoutNewP0!==false)fail('hard stops invalid');
const iterations=Array.isArray(lock.iterations)?lock.iterations:[],ids=['I5-R1','I5-R2','I5-R3','I5-R4','I5-G1','I5-G2'];
if(JSON.stringify(iterations.map(x=>x.id))!==JSON.stringify(ids)||iterations.reduce((s,x)=>s+Number(x.weight||0),0)!==15)fail('bounded iteration plan drifted');
const current=iterations.find(x=>x.id===lock.currentIteration);if(!current||!['ACTIVE','PENDING_AUTHORIZATION'].includes(current.status))fail('current iteration state invalid');
const completed=85+iterations.filter(x=>x.status==='PASS').reduce((s,x)=>s+Number(x.weight||0),0);if(lock.formalProgress?.completed!==completed||lock.formalProgress?.pending!==100-completed)fail('formal progress mismatch');
for(const [name,c] of [['promotionGate',gate],['aliases',aliases],['g1',g1],['r4',r4]])if(c.planId!==lock.planId||!c.syncEpoch)fail(`${name} plan/identity mismatch`);
if(g2a.planId!==lock.planId||g2a.syncEpoch!==lock.syncEpoch)fail('G2-A receipt epoch/plan mismatch');
if(ledger.planId!==lock.planId)fail('ledger plan mismatch');
if(gate.functionalSourceLock!==lock.functionalSourceLock||g1.functionalSourceLock!==lock.functionalSourceLock||g2a.functionalSourceLock!==lock.functionalSourceLock)fail('functional source lock mismatch');
if(gate.productionTarget?.projectId!==lock.productionProjectId)fail('production project mismatch');
const g1Iter=iterations.find(x=>x.id==='I5-G1');
if(lock.currentIteration==='I5-G2'){
  if(g1Iter?.status!=='PASS'||g1Iter.exit!=='PRODUCTION_CUTOVER_EXECUTED')fail('G2 cannot start before G1 PASS');
  if(g1.decision!=='PRODUCTION_CUTOVER_EXECUTED'||g1.providerDeployExecuted!==false||g1.rebuildExecuted!==false||g1.cutover?.sameTestedArtifactPreserved!==true||g1.safety?.businessDataWritesAuthorized!==false)fail('G1 receipt unsafe');
  if(lock.formalProgress?.productionIsAuthorized!==true||lock.formalProgress?.productionCutoverExecuted!==true||lock.productionState?.active!==true||lock.productionState?.providerRedeployExecuted!==false||lock.productionState?.rebuildExecuted!==false||lock.productionState?.businessDataWritesAuthorized!==false)fail('production state mismatch');
  if(lock.productionState?.syntheticAcceptanceWritesAuthorized!==true||lock.productionState?.syntheticAcceptanceScope!=='CXORBIA_E2E_SYNTH_* only')fail('synthetic production acceptance scope missing');
  if(gate.gates?.EXPLICIT_CUTOVER_AUTHORIZATION?.status!=='PASS'||gate.productionCutoverExecuted!==true||gate.productionDeploymentExecuted!==false)fail('promotion gate state mismatch after G1');
  const a=lock.g2Acceptance?.technicalReadOnlyProductionSmoke;
  if(a?.status!=='PASS')fail('G2-A must remain PASS');
  if(g2a.decision!=='PRODUCTION_REMOTE_READONLY_SMOKE_PASS_WITH_FROZEN_SHOPPER_REUSE'||g2a.productP0Proven!==false||g2a.sameProductionPlatform!==true||g2a.sameTestedArtifact!==true||g2a.rebuildExecuted!==false||g2a.providerRedeployExecuted!==false)fail('G2-A terminal receipt invalid');
  if(g2a.freshStaffAdmin?.status!=='PASS'||g2a.freshClient?.status!=='PASS'||g2a.shopperExactFrozenReuse?.status!=='PASS_FROZEN_REUSE'||g2a.shopperExactFrozenReuse?.exactIdentity!==true||g2a.shopperExactFrozenReuse?.historyE2E!==true)fail('G2-A role evidence incomplete');
  for(const k of ['providerWrites','authWrites','passwordChanges','passwordResets','firestoreWrites','hrWrites','rulesWrites','storageWrites','makeCalls','geminiCalls','paymentWrites','hostingDeploys','cloudRunDeploys'])if(Number(g2a.safety?.[k]||0)!==0)fail(`G2-A unsafe ${k}`);
  const b=lock.g2Acceptance?.liveInPlatformSyntheticAcceptance;
  if(b?.status!=='AUTHORIZED_SYNTHETIC_STAGE_PENDING_EXECUTION')fail('G2-B authorization state invalid');
  if(b.sameProductionUrlRequired!==true||b.productionUrl!=='https://cxorbia-backend-dev.web.app'||b.alternatePlatformAllowed!==false||b.localCloneOrEmulatorAllowed!==false||b.syntheticDataOnly!==true||b.syntheticTagPrefix!=='CXORBIA_E2E_SYNTH_'||b.cleanupAndPostCleanReadbackRequired!==true)fail('G2-B target/synthetic boundary invalid');
  if(b.paulaObservationsCaptured!==false||b.paulaObservationState!=='PENDING_STAGE_AND_USER_OBSERVATION')fail('G2-B observation state invalid');
  if(b.businessDataWritesAuthorizedNow!==true||b.businessDataWriteScope!=='SYNTHETIC_ONLY'||b.syntheticBusinessDataWritesAuthorizedNow!==true)fail('G2-B synthetic business authorization missing');
  if(b.syntheticAuthUserCreateDeleteAuthorizedNow!==true||b.realAuthUserCreateResetModifyAuthorizedNow!==false||b.authUserCreateOrResetAuthorizedNow!==false)fail('G2-B Auth boundary invalid');
  if(b.syntheticStorageEvidenceWritesAuthorizedNow!==true||b.realStorageEvidenceWritesAuthorizedNow!==false)fail('G2-B Storage boundary invalid');
  for(const k of ['externalHrWritesAuthorizedNow','paymentExecutionAuthorizedNow','makeGeminiAuthorizedNow','deployAuthorizedNow','rebuildAuthorizedNow','mergeAuthorizedNow'])if(b[k]!==false)fail(`G2-B forbidden boundary ${k}`);
  if(g2b.schemaVersion!=='cxorbia.g2b.live-synthetic-acceptance-request.v1'||g2b.gateId!=='I5_G2_B_LIVE_IN_PLATFORM_SYNTHETIC_ACCEPTANCE'||g2b.requestId!==b.authorizationRequestId||g2b.repository!==lock.repository||g2b.branch!==lock.branch||Number(g2b.pullRequest)!==Number(lock.pullRequest))fail('G2-B request identity invalid');
  if(g2b.enabled!==true||g2b.consumed!==false||g2b.status!=='authorized_stage_pending_execution'||g2b.mode!=='STAGE_AND_TEST'||g2b.allowedExecutions!==1||g2b.executionsConsumed!==0||g2b.automaticRetryAllowed!==false)fail('G2-B request state invalid');
  if(g2b.productionProjectId!==lock.productionProjectId||g2b.productionUrl!==b.productionUrl||g2b.functionalSourceLock!==lock.functionalSourceLock||g2b.tenantId!=='tya'||g2b.projectId!=='cinepolis'||g2b.syntheticTagPrefix!=='CXORBIA_E2E_SYNTH_'||g2b.syntheticDataOnly!==true)fail('G2-B request target invalid');
  if(g2b.leaveSyntheticScenarioForObservation!==true||g2b.cleanupRequiredAfterObservation!==true||g2b.postCleanupReadbackRequired!==true)fail('G2-B visible/cleanup contract invalid');
  const budget=g2b.budgets||{};for(const k of ['realAuthCreates','realAuthUpdates','realAuthPasswordResets','realDataWrites','externalHrWrites','realPaymentWrites','makeCalls','geminiCalls','rulesWrites','hostingDeploys','cloudRunDeploys','rebuilds','merges'])if(Number(budget[k]||0)!==0)fail(`G2-B forbidden budget ${k}`);
}
const docs=['app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md','app/docs/EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md','app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md','app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md','app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md','app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md','app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md','CAMBIOS-BACKEND.md','RESUMEN-PARA-CLAUDE.md','PENDIENTES-PROTOTIPO.md'];
for(const p of docs){const c=read(p);if(!c.includes(lock.syncEpoch)||!c.includes(lock.planId)||!c.includes(lock.currentIteration))fail(`${p} not synchronized`);}
for(const p of ['CAMBIOS-BACKEND.md','RESUMEN-PARA-CLAUDE.md','PENDIENTES-PROTOTIPO.md']){const c=read(p);if(!c.includes('ACTIVE_BLOCKER: `NONE`')||!c.includes('PREPROD_PROJECT_CREATOR_ROUTE: `SUPERSEDED`'))fail(`${p} safety markers missing`);}
if(ledger.policy?.consumedRequestsAreImmutable!==true||ledger.policy?.rerunSameRequestIdAllowed!==false||ledger.policy?.conversationInterruptionDoesNotResetConsumedState!==true)fail('consumed request policy invalid');
const consumed=Array.isArray(ledger.consumedRequests)?ledger.consumedRequests:[],entry=consumed.find(x=>x.requestId===live.requestId);if(entry){if(live.enabled!==false||live.consumed!==true||live.allowedExecutions!==live.executionsConsumed||!String(live.status||'').startsWith('consumed')||entry.decision!==live.decision)fail('live consumed request drifted');for(const k of ['repositoryWrites','dataWrites','providerWrites','deploy','merge','production'])if(live[k]!==false||entry[k]!==false)fail(`consumed request unsafe ${k}`);}
if(aliases.policy?.aliasesDoNotCreateNewWork!==true||aliases.policy?.namingDifferenceDoesNotAuthorizeRerun!==true||aliases.policy?.conversationInterruptionDoesNotInvalidateTerminalPass!==true)fail('alias policy invalid');
for(const n of ['PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY','PASS_READONLY_POST_GATES','PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_ADMIN_RUNTIME_READONLY','PASS_I3_11C_R3C_DEV_HOSTING_MATERIALIZATION_REMOTE_PARITY','ROOT_CAUSE_CLOSED_PASS','PRODUCTION_CUTOVER_EXECUTED']){const a=aliases.aliases.find(x=>x.evidenceName===n);if(!a||a.rerunPolicy!=='NO_RERUN_WITHOUT_P0_PROVEN')fail(`missing/unsafe alias ${n}`);}
const pre=(lock.supersededRoutes||[]).find(x=>x.id==='PREPROD_PROJECT_CREATOR_ROUTE');if(!pre||pre.status!=='SUPERSEDED'||pre.replacement!=='PROMOTE_EXISTING_CLEAN_PROJECT')fail('PREPROD route drifted');
const allowedRcStatuses=new Set(['PASS','PENDING','IN_REMEDIATION','PARTIAL_PASS_G2A_SYNTHETIC_ACCEPTANCE_PENDING','PARTIAL_PASS_G2A_G2B_AUTHORIZED_EXECUTION_PENDING']);for(const rc of lock.rootCauses||[])if(!rc.id||!rc.name||!allowedRcStatuses.has(rc.status))fail('root cause entry invalid');
console.log('CONTINUITY_LOCK_PASS');console.log(`syncEpoch=${lock.syncEpoch}`);console.log(`planId=${lock.planId}`);console.log(`currentIteration=${lock.currentIteration}`);console.log(`formalProgress=${lock.formalProgress.completed}/100`);console.log('conversationIndependent=true');console.log('terminalPassSurvivesConversationInterruption=true');console.log('productionCutoverReceipt=PASS');console.log(`g2A=${lock.g2Acceptance?.technicalReadOnlyProductionSmoke?.status||'n/a'}`);console.log(`g2B=${lock.g2Acceptance?.liveInPlatformSyntheticAcceptance?.status||'n/a'}`);console.log('providerRedeployExecuted=false');console.log('businessDataWritesAuthorized=synthetic-only');console.log('nextAction=G2-B STAGE_AND_TEST one-shot on canonical production URL');
