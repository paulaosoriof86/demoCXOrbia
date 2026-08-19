#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const ROOT=process.cwd();
const EPOCH='CXORBIA-20260819-I4B-RETRY1-PREPROVIDER-DOCSYNC-FIX-28';
const FRONTIER='NEW_AUTH_REQUIRED_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E_WRITE_GATE_RETRY1__HARNESS_SCOPE_FIXED__SYNTHETIC_VISIT_ONLY';
const PRE_PROVIDER_RUN=32296607712;
const docs=[
  'app/docs/CXORBIA-EXECUTION-STATE.json',
  'app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md',
  'app/docs/SOURCE-LOCK-CXORBIA-TYA.md',
  'app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md',
  'app/docs/ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md',
  'app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md',
  'app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md',
  'CAMBIOS-BACKEND.md',
  'RESUMEN-PARA-CLAUDE.md',
  'PENDIENTES-PROTOTIPO.md'
];
const evidencePath='app/docs/evidence/I4B-RETRY1-PREPROVIDER-DOCSYNC-FAILURE.json';
const requestPath='backend/config/i4b-single-dev-visit-lifecycle-e2e-write-gate-request.json';
const executorPath='tools/cxorbia-i4b-retry1-runtime-executor.mjs';
const finalizerPath='tools/cxorbia-i4b-retry1-finalize.mjs';
const verifierPath='tools/verify-cxorbia-source-truth-sync.mjs';
const errors=[],warnings=[];
const read=rel=>{const p=path.join(ROOT,rel);if(!fs.existsSync(p)){errors.push('MISSING:'+rel);return'';}return fs.readFileSync(p,'utf8');};

for(const d of docs){const t=read(d);if(!t.includes(EPOCH))errors.push('EPOCH:'+d);if(!t.includes(FRONTIER))errors.push('FRONTIER:'+d);}
let state={},evidence={},request={};
try{state=JSON.parse(read(docs[0]));}catch{errors.push('STATE_JSON');}
try{evidence=JSON.parse(read(evidencePath));}catch{errors.push('EVIDENCE_JSON');}
try{request=JSON.parse(read(requestPath));}catch{errors.push('REQUEST_JSON');}

if(state.syncEpoch!==EPOCH||state.phaseA?.formalProgressPercent!==60||state.phaseA?.formalRemainingPercent!==40||state.phaseA?.exactFrontier!==FRONTIER||state.i4b?.retry1PreProvider?.workflowRunId!==PRE_PROVIDER_RUN||state.i4b?.retry1PreProvider?.providerExecutionEntered!==false||state.activeGate?.authorized!==true||state.activeGate?.consumed!==false)errors.push('STATE_MISMATCH');
if(evidence.syncEpoch!==EPOCH||evidence.workflowRunId!==PRE_PROVIDER_RUN||evidence.decision!=='HOLD_I4B_RETRY1_PRE_PROVIDER__SOURCE_TRUTH_DOCUMENT_DESYNC'||evidence.pipeline?.providerExecutionEntered!==false||evidence.safety?.providerCommittedCalls!==0||evidence.safety?.providerWritesReported!==0||evidence.gate?.consumed!==false)errors.push('EVIDENCE_MISMATCH');
if(request.gateId!==FRONTIER||request.enabled!==true||request.consumed!==false||request.executionsConsumed!==0||request.allowedExecutions!==1||request.authorizedBy!=='Paula'||request.authorizationText!=='autorizo pero agiliza'||request.syntheticVisitOnly!==true||request.historicalShopperAccess!==false||request.realHrVisitMutationAllowed!==false||request.automaticRetryAllowed!==false)errors.push('REQUEST_MISMATCH');
for(const k of ['authCreates','authClaimsWrites','authPasswordUpdates','authPasswordResets','authDeletes','otherIdentitiesModified','hrWrites','rulesWrites','storageWrites','makeCalls','geminiCalls','paymentWrites','hostingDeploys','cloudRunDeploys'])if(Number(request[k]||0)!==0)errors.push('FORBIDDEN_BUDGET:'+k);
if(request.merge!==false||request.production!==false)errors.push('PRODUCTION_POLICY_MISMATCH');
const executor=read(executorPath),finalizer=read(finalizerPath);
if(!executor.includes('executeProviderCommand({provider')||!executor.includes("PASS_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E_RETRY1__HARNESS_SCOPE_FIXED__SYNTHETIC_VISIT_ONLY"))errors.push('RETRY1_EXECUTOR_CORRECTION_MISSING');
if(!finalizer.includes('I4B_RETRY1_PREPROVIDER_NOT_VALIDATED__GATE_MUST_REMAIN_UNCONSUMED')||!finalizer.includes('request.consumed = true'))errors.push('RETRY1_FINALIZER_CORRECTION_MISSING');
try{
  const base=request.sourceHeadSha;
  execFileSync('git',['merge-base','--is-ancestor',base,'HEAD'],{stdio:'ignore'});
  const changed=execFileSync('git',['diff','--name-only',`${base}..HEAD`],{encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
  const fixedAllowed=new Set(['CAMBIOS-BACKEND.md','RESUMEN-PARA-CLAUDE.md','PENDIENTES-PROTOTIPO.md',requestPath,executorPath,finalizerPath,verifierPath]);
  for(const f of changed){if(f.startsWith('.github/workflows/cxorbia-i4b-')||f.startsWith('app/docs/')||fixedAllowed.has(f))continue;errors.push('UNAUTHORIZED_SOURCE_DELTA:'+f);}
}catch{errors.push('SOURCE_ANCESTRY_OR_DELTA_CHECK_FAILED');}
try{const b=execFileSync('git',['rev-parse','--abbrev-ref','HEAD'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();if(b!=='docs-tya-v6-v71-audit'&&!(b==='HEAD'&&process.env.CXORBIA_ALLOW_DETACHED_HEAD==='1'))errors.push('BRANCH:'+b);}catch{warnings.push('BRANCH_CHECK_UNAVAILABLE');}

const out={schemaVersion:'cxorbia.source-truth-sync-verifier.v9.1',syncEpoch:EPOCH,expectedFrontier:FRONTIER,preProviderRun:PRE_PROVIDER_RUN,canonicalDocsChecked:docs.length,evidenceChecked:evidencePath,requestChecked:requestPath,errors,warnings,decision:errors.length?'FAIL_SOURCE_TRUTH_SYNC':'PASS_SOURCE_TRUTH_SYNC'};
console.log(JSON.stringify(out,null,2));
process.exit(errors.length?1:0);
