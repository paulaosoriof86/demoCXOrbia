#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..','..');
const fail=(m)=>{console.error(`CONTINUITY_DRIFT_BLOCKED: ${m}`);process.exit(2);};
const read=(p)=>{try{return fs.readFileSync(path.join(root,p),'utf8');}catch(e){fail(`cannot read ${p}: ${e.message}`);}};
const json=(p)=>{try{return JSON.parse(read(p));}catch(e){fail(`cannot parse ${p}: ${e.message}`);}};
const lock=json('backend/config/cxorbia-phase-a-continuity-lock.json');
const gate=json('backend/config/cxorbia-production-promotion-gate-evidence.json');
const ledger=json('backend/config/cxorbia-consumed-one-shot-gates.json');
const aliases=json('backend/config/cxorbia-evidence-aliases.json');
const r4=json('backend/config/cxorbia-r4-root-cause-closure.json');
const g1=json('backend/config/cxorbia-g1-production-cutover.json');
const live=json('.github/cxorbia-gate-requests/request.json');
if(!lock.syncEpoch||!lock.planId)fail('missing lock identity');
if(lock.resumeProtocol?.conversationIndependent!==true||lock.resumeProtocol?.terminalPassSurvivesConversationInterruption!==true||lock.resumeProtocol?.prBodyIsMirrorOnly!==true||lock.resumeProtocol?.headMustBeResolvedDynamically!==true||lock.resumeProtocol?.onMismatch!=='CONTINUITY_DRIFT_BLOCKED')fail('resume protocol invalid');
if(lock.hardStops?.rebuildBeforePromotion!==false||lock.hardStops?.cutoverBeforeRootCauseClosedPass!==false||lock.hardStops?.cutoverWithoutExplicitAuthorization!==false||lock.hardStops?.reopenG1WithoutNewP0!==false)fail('hard stops invalid');
const iterations=Array.isArray(lock.iterations)?lock.iterations:[], ids=['I5-R1','I5-R2','I5-R3','I5-R4','I5-G1','I5-G2'];
if(JSON.stringify(iterations.map(x=>x.id))!==JSON.stringify(ids)||iterations.reduce((s,x)=>s+Number(x.weight||0),0)!==15)fail('bounded iteration plan drifted');
const current=iterations.find(x=>x.id===lock.currentIteration);if(!current||!['ACTIVE','PENDING_AUTHORIZATION'].includes(current.status))fail('current iteration state invalid');
const completed=85+iterations.filter(x=>x.status==='PASS').reduce((s,x)=>s+Number(x.weight||0),0);if(lock.formalProgress?.completed!==completed||lock.formalProgress?.pending!==100-completed)fail('formal progress mismatch');
for(const c of [gate,aliases,g1]){if(c.syncEpoch!==lock.syncEpoch||c.planId!==lock.planId)fail('machine control epoch/plan mismatch');}
if(ledger.planId!==lock.planId)fail('ledger plan mismatch');
if(gate.functionalSourceLock!==lock.functionalSourceLock||g1.functionalSourceLock!==lock.functionalSourceLock)fail('functional source lock mismatch');
if(gate.productionTarget?.projectId!==lock.productionProjectId)fail('production project mismatch');
const g1Iter=iterations.find(x=>x.id==='I5-G1');
if(lock.currentIteration==='I5-G2'){
  if(g1Iter?.status!=='PASS'||g1Iter.exit!=='PRODUCTION_CUTOVER_EXECUTED')fail('G2 cannot start before G1 PASS');
  if(g1.decision!=='PRODUCTION_CUTOVER_EXECUTED'||g1.providerDeployExecuted!==false||g1.rebuildExecuted!==false||g1.cutover?.sameTestedArtifactPreserved!==true||g1.safety?.businessDataWritesAuthorized!==false)fail('G1 receipt unsafe');
  if(lock.formalProgress?.productionIsAuthorized!==true||lock.formalProgress?.productionCutoverExecuted!==true||lock.productionState?.active!==true||lock.productionState?.providerRedeployExecuted!==false||lock.productionState?.rebuildExecuted!==false||lock.productionState?.businessDataWritesAuthorized!==false)fail('production state mismatch');
  if(gate.gates?.EXPLICIT_CUTOVER_AUTHORIZATION?.status!=='PASS'||gate.productionCutoverExecuted!==true||gate.productionDeploymentExecuted!==false)fail('promotion gate state mismatch after G1');
}
const docs=['app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md','app/docs/EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md','app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md','app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md','app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md','app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md','app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md','CAMBIOS-BACKEND.md','RESUMEN-PARA-CLAUDE.md','PENDIENTES-PROTOTIPO.md'];
for(const p of docs){const c=read(p);if(!c.includes(lock.syncEpoch)||!c.includes(lock.planId)||!c.includes(lock.currentIteration))fail(`${p} not synchronized`);}
for(const p of ['CAMBIOS-BACKEND.md','RESUMEN-PARA-CLAUDE.md','PENDIENTES-PROTOTIPO.md']){const c=read(p);if(!c.includes('ACTIVE_BLOCKER: `NONE`')||!c.includes('PREPROD_PROJECT_CREATOR_ROUTE: `SUPERSEDED`'))fail(`${p} safety markers missing`);}
if(ledger.policy?.consumedRequestsAreImmutable!==true||ledger.policy?.rerunSameRequestIdAllowed!==false||ledger.policy?.conversationInterruptionDoesNotResetConsumedState!==true)fail('consumed request policy invalid');
const consumed=Array.isArray(ledger.consumedRequests)?ledger.consumedRequests:[];const entry=consumed.find(x=>x.requestId===live.requestId);if(entry){if(live.enabled!==false||live.consumed!==true||live.allowedExecutions!==live.executionsConsumed||!String(live.status||'').startsWith('consumed')||entry.decision!==live.decision)fail('live consumed request drifted');for(const k of ['repositoryWrites','dataWrites','providerWrites','deploy','merge','production'])if(live[k]!==false||entry[k]!==false)fail(`consumed request unsafe ${k}`);}
if(aliases.policy?.aliasesDoNotCreateNewWork!==true||aliases.policy?.namingDifferenceDoesNotAuthorizeRerun!==true||aliases.policy?.conversationInterruptionDoesNotInvalidateTerminalPass!==true)fail('alias policy invalid');
for(const n of ['PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY','PASS_READONLY_POST_GATES','PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_ADMIN_RUNTIME_READONLY','PASS_I3_11C_R3C_DEV_HOSTING_MATERIALIZATION_REMOTE_PARITY','ROOT_CAUSE_CLOSED_PASS','PRODUCTION_CUTOVER_EXECUTED']){const a=aliases.aliases.find(x=>x.evidenceName===n);if(!a||a.rerunPolicy!=='NO_RERUN_WITHOUT_P0_PROVEN')fail(`missing/unsafe alias ${n}`);}
const pre=(lock.supersededRoutes||[]).find(x=>x.id==='PREPROD_PROJECT_CREATOR_ROUTE');if(!pre||pre.status!=='SUPERSEDED'||pre.replacement!=='PROMOTE_EXISTING_CLEAN_PROJECT')fail('PREPROD route drifted');
for(const rc of lock.rootCauses||[])if(!rc.id||!rc.name||!['PASS','PENDING','IN_REMEDIATION'].includes(rc.status))fail('root cause entry invalid');
console.log('CONTINUITY_LOCK_PASS');console.log(`syncEpoch=${lock.syncEpoch}`);console.log(`planId=${lock.planId}`);console.log(`currentIteration=${lock.currentIteration}`);console.log(`formalProgress=${lock.formalProgress.completed}/100`);console.log('conversationIndependent=true');console.log('terminalPassSurvivesConversationInterruption=true');console.log('productionCutoverReceipt=PASS');console.log('providerRedeployExecuted=false');console.log('businessDataWritesAuthorized=false');console.log(`nextAction=${current.name}`);
