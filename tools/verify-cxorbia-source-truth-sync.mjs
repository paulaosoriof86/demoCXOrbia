#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';
const ROOT=process.cwd();
const EPOCH='CXORBIA-20260819-I4A-VISIBLE-SMOKE-RETRY1-DOCUMENT-SELECTOR-HOLD-23';
const FRONTIER='NEW_AUTH_REQUIRED_I4A_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE_RETRY2__STABLE_SURFACE_SELECTORS__NO_SW';
const RUN=32280348780;
const docs=['app/docs/CXORBIA-EXECUTION-STATE.json','app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md','app/docs/SOURCE-LOCK-CXORBIA-TYA.md','app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md','app/docs/ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md','app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md','CAMBIOS-BACKEND.md','RESUMEN-PARA-CLAUDE.md','PENDIENTES-PROTOTIPO.md'];
const evidencePath='app/docs/evidence/I4A-VISIBLE-DEV-SHOPPER-LIFECYCLE-SMOKE-RETRY1-HOLD-LATEST.json';
const requestPath='backend/config/i4a-visible-shopper-lifecycle-smoke-retry-request.json';
const forbidden=['.github/workflows/cxorbia-i4a-visible-shopper-lifecycle-smoke-retry.yml','.github/workflows/cxorbia-i4a-visible-smoke-retry-observer.yml'];
const errors=[],warnings=[];const read=r=>{const p=path.join(ROOT,r);if(!fs.existsSync(p)){errors.push('MISSING:'+r);return'';}return fs.readFileSync(p,'utf8');};
for(const d of docs){const t=read(d);if(!t.includes(EPOCH))errors.push('EPOCH:'+d);if(!t.includes(FRONTIER))errors.push('FRONTIER:'+d);}
let s={},e={},q={};try{s=JSON.parse(read(docs[0]))}catch(x){errors.push('STATE_JSON')};try{e=JSON.parse(read(evidencePath))}catch(x){errors.push('EVIDENCE_JSON')};try{q=JSON.parse(read(requestPath))}catch(x){errors.push('REQUEST_JSON')};
if(s.syncEpoch!==EPOCH||s.phaseA?.formalProgressPercent!==60||s.phaseA?.formalRemainingPercent!==40||s.phaseA?.score?.I3!=='25/25 PASS FROZEN'||s.phaseA?.exactFrontier!==FRONTIER)errors.push('STATE_MISMATCH');
const v=s.i4a?.visibleSmokeRetry1||{};if(v.workflowRunId!==RUN||v.serviceWorkersBlocked!==true||v.membershipVerified!==true||v.appEntered!==true||v.hrAuthorityReady!==true||v.hrPeriods!==15||v.hrVisits!==660||v.documentRouteRendered!==true||v.productDefectProven!==false)errors.push('RETRY1_STATE_MISMATCH');
if(e.syncEpoch!==EPOCH||e.workflowRunId!==RUN||e.failurePhase!=='documents'||e.classification!=='PIPELINE_MECHANISM_FAILURE__DOCUMENT_SELECTOR_TARGET__NO_PRODUCT_DEFECT_PROVEN'||e.checkpoints?.membership_verified!==true||e.authenticatedState?.hrPeriods!==15||e.authenticatedState?.hrVisits!==660)errors.push('EVIDENCE_MISMATCH');
if(q.enabled!==false||q.consumed!==true||q.executionsConsumed!==1||q.loginAttemptsActual!==1||q.authPasswordUpdatesActual!==1||q.executionResult?.workflowRunId!==RUN||q.executionResult?.failurePhase!=='documents'||q.nextGate!==FRONTIER)errors.push('REQUEST_NOT_FROZEN');
if(s.nextGate?.authorized!==true||s.nextGate?.loginAuthorizedMax!==1||s.nextGate?.authPasswordUpdateAuthorizedMax!==1||s.nextGate?.firestoreWritesAuthorized!==0)errors.push('NEXT_GATE_AUTH_SCOPE_MISMATCH');
for(const f of forbidden)if(fs.existsSync(path.join(ROOT,f)))errors.push('ONE_SHOT_STILL_PRESENT:'+f);
try{const b=execFileSync('git',['rev-parse','--abbrev-ref','HEAD'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();if(b!=='docs-tya-v6-v71-audit'&&!(b==='HEAD'&&process.env.CXORBIA_ALLOW_DETACHED_HEAD==='1'))errors.push('BRANCH:'+b);}catch{warnings.push('BRANCH_CHECK_UNAVAILABLE')}
const out={schemaVersion:'cxorbia.source-truth-sync-verifier.v5',syncEpoch:EPOCH,expectedFrontier:FRONTIER,run:RUN,canonicalDocsChecked:docs.length,evidenceChecked:evidencePath,requestChecked:requestPath,errors,warnings,decision:errors.length?'FAIL_SOURCE_TRUTH_SYNC':'PASS_SOURCE_TRUTH_SYNC'};console.log(JSON.stringify(out,null,2));process.exit(errors.length?1:0);
