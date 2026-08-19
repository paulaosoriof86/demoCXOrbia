#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const ROOT=process.cwd();
const SYNC_EPOCH='CXORBIA-20260819-I4A-VISIBLE-SMOKE-MECHANISM-HOLD-22';
const EXPECTED_BRANCH='docs-tya-v6-v71-audit';
const EXPECTED_FRONTIER='NEW_AUTH_REQUIRED_I4A_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE_RETRY__SERVICE_WORKER_STABILIZED_HARNESS';
const RAW_DECISION='HOLD_I4A_VISIBLE_SHOPPER_LIFECYCLE_SMOKE_MECHANISM_OR_RUNTIME_FAILURE';
const ADJUDICATION='PIPELINE_MECHANISM_FAILURE_PRIMARY__NO_PRODUCT_DEFECT_PROVEN';
const RUN=32278013553,JOB=96149872897,ARTIFACT=9374808032;
const DIGEST='sha256:b91f3bd3b1ce05303e426a45e98bd13372e6933499fc2548a98db8daa9a47437';
const canonicalDocs=[
  'app/docs/CXORBIA-EXECUTION-STATE.json',
  'app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md',
  'app/docs/SOURCE-LOCK-CXORBIA-TYA.md',
  'app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md',
  'app/docs/ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md',
  'app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md',
  'CAMBIOS-BACKEND.md',
  'RESUMEN-PARA-CLAUDE.md',
  'PENDIENTES-PROTOTIPO.md'
];
const evidencePath='app/docs/evidence/I4A-VISIBLE-DEV-SHOPPER-LIFECYCLE-SMOKE-HOLD-LATEST.json';
const visibleRequestPath='backend/config/i4a-visible-shopper-lifecycle-smoke-request.json';
const dedicatedEvidencePath='app/docs/evidence/I4A-DEDICATED-NONHISTORICAL-DEV-TEST-SHOPPER-PASS-LATEST.json';
const createRequestPath='backend/config/i4a-dedicated-test-shopper-create-request.json';
const verifyRequestPath='backend/config/i4a-dedicated-test-shopper-verify-request.json';
const forbiddenOneShotWorkflows=[
  '.github/workflows/cxorbia-i4a-dedicated-test-shopper-create.yml',
  '.github/workflows/cxorbia-i4a-dedicated-test-shopper-verify-readonly.yml',
  '.github/workflows/cxorbia-i4a-visible-shopper-lifecycle-smoke.yml'
];
const errors=[],warnings=[];
const read=rel=>{const p=path.join(ROOT,rel);if(!fs.existsSync(p)){errors.push(`MISSING:${rel}`);return '';}return fs.readFileSync(p,'utf8');};
const docs=new Map(canonicalDocs.map(x=>[x,read(x)]));
for(const rel of canonicalDocs){
  const text=docs.get(rel)||'';
  if(!text.includes(SYNC_EPOCH))errors.push(`SYNC_EPOCH_MISMATCH:${rel}`);
  if(!text.includes(EXPECTED_FRONTIER))errors.push(`FRONTIER_MISSING:${rel}`);
}
let state={},evidence={},visibleReq={},dedicatedEvidence={},createReq={},verifyReq={};
try{state=JSON.parse(docs.get('app/docs/CXORBIA-EXECUTION-STATE.json')||'{}');}catch(e){errors.push(`STATE_JSON_INVALID:${e.message}`);}
try{evidence=JSON.parse(read(evidencePath)||'{}');}catch(e){errors.push(`EVIDENCE_JSON_INVALID:${e.message}`);}
try{visibleReq=JSON.parse(read(visibleRequestPath)||'{}');}catch(e){errors.push(`VISIBLE_REQUEST_JSON_INVALID:${e.message}`);}
try{dedicatedEvidence=JSON.parse(read(dedicatedEvidencePath)||'{}');}catch(e){errors.push(`DEDICATED_EVIDENCE_JSON_INVALID:${e.message}`);}
try{createReq=JSON.parse(read(createRequestPath)||'{}');}catch(e){errors.push(`CREATE_REQUEST_JSON_INVALID:${e.message}`);}
try{verifyReq=JSON.parse(read(verifyRequestPath)||'{}');}catch(e){errors.push(`VERIFY_REQUEST_JSON_INVALID:${e.message}`);}

if(state.syncEpoch!==SYNC_EPOCH)errors.push('STATE_EPOCH_MISMATCH');
if(state.branch!==EXPECTED_BRANCH)errors.push(`STATE_BRANCH_MISMATCH:${state.branch}`);
if(state.phaseA?.formalProgressPercent!==60||state.phaseA?.formalRemainingPercent!==40)errors.push('FORMAL_PROGRESS_MISMATCH');
if(state.phaseA?.score?.I3!=='25/25 PASS FROZEN')errors.push('I3_NOT_FROZEN_PASS');
if(state.phaseA?.score?.I4!=='0/25 IN_PROGRESS_NOT_SCORED')errors.push('I4_SCORE_MISMATCH');
if(state.phaseA?.exactFrontier!==EXPECTED_FRONTIER)errors.push('STATE_FRONTIER_MISMATCH');
const v=state.i4a?.visibleSmoke||{};
if(v.status!=='HOLD_CONSUMED_NO_AUTOMATIC_RETRY'||v.rawDecision!==RAW_DECISION||v.classification!==ADJUDICATION||v.workflowRunId!==RUN||v.jobId!==JOB||v.artifactId!==ARTIFACT||v.artifactDigest!==DIGEST)errors.push('STATE_VISIBLE_SMOKE_RESULT_MISMATCH');
if(v.preloginDecision!=='PASS_I4A_DEDICATED_IDENTITY_PRELOGIN_EXACT'||v.loginAttempts!==1||v.authPasswordUpdates!==1||v.visibleSurfacesReached!==false||v.productDefectProven!==false||v.automaticRetryAllowed!==false)errors.push('STATE_VISIBLE_SMOKE_ADJUDICATION_MISMATCH');
const safety=state.safetyLatestGate||{};
for(const [k,expected] of Object.entries({authPasswordUpdates:1,loginAttempts:1,historicalShopperAccess:false,otherIdentitiesModified:0,authCreates:0,authClaimsWrites:0,authDeletes:0,firestoreWrites:0,postulationSubmits:0,certificationSubmits:0,reservationWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,makeCalls:0,geminiCalls:0,paymentWrites:0,hostingDeploys:0,cloudRunDeploys:0,merge:false,production:false,credentialsExported:false}))if(safety[k]!==expected)errors.push(`STATE_SAFETY_MISMATCH:${k}`);
if(state.activeEvidence!==evidencePath)errors.push('STATE_ACTIVE_EVIDENCE_MISMATCH');
if(state.nextGate?.name!==EXPECTED_FRONTIER||state.nextGate?.authorized!==false||state.nextGate?.loginAuthorized!==false||state.nextGate?.authPasswordUpdateAuthorized!==false)errors.push('STATE_NEXT_GATE_NOT_CLOSED');

if(evidence.syncEpoch!==SYNC_EPOCH||evidence.run?.workflowRunId!==RUN||evidence.run?.jobId!==JOB||evidence.run?.artifactId!==ARTIFACT||evidence.run?.artifactDigest!==DIGEST||evidence.run?.rawDecision!==RAW_DECISION)errors.push('EVIDENCE_RESULT_MISMATCH');
if(evidence.preloginVerification?.decision!=='PASS_I4A_DEDICATED_IDENTITY_PRELOGIN_EXACT'||evidence.preloginVerification?.claimsExact!==true||evidence.preloginVerification?.profileExact!==true||evidence.preloginVerification?.membershipExact!==true||evidence.preloginVerification?.crosswalkExact!==true||evidence.preloginVerification?.providerAck!==true||evidence.preloginVerification?.explicitProvenanceExact!==true)errors.push('EVIDENCE_PRELOGIN_EXACTNESS_MISMATCH');
if(evidence.browserExecution?.loginAttempts!==1||evidence.browserExecution?.visibleSurfacesReached!==false||evidence.browserExecution?.backendWriteAttemptsObserved!==0||Object.keys(evidence.browserExecution?.surfaces||{}).length!==0)errors.push('EVIDENCE_BROWSER_PHASE_MISMATCH');
if(evidence.adjudication?.classification!==ADJUDICATION||evidence.adjudication?.productDefectProven!==false||evidence.adjudication?.gatePass!==false||evidence.adjudication?.automaticRetryAllowed!==false)errors.push('EVIDENCE_ADJUDICATION_MISMATCH');
if(evidence.nextGate!==EXPECTED_FRONTIER)errors.push('EVIDENCE_NEXT_GATE_MISMATCH');
for(const [k,expected] of Object.entries({historicalShopperAccess:false,otherIdentitiesModified:0,authCreates:0,authClaimsWrites:0,authDeletes:0,authPasswordUpdates:1,firestoreWrites:0,postulationSubmits:0,certificationSubmits:0,reservationWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,makeCalls:0,geminiCalls:0,paymentWrites:0,hostingDeploys:0,cloudRunDeploys:0,merge:false,production:false,credentialsExported:false}))if(evidence.safety?.[k]!==expected)errors.push(`EVIDENCE_SAFETY_MISMATCH:${k}`);

if(visibleReq.enabled!==false||visibleReq.consumed!==true||visibleReq.status!=='hold_consumed_mechanism_or_runtime_failure_no_automatic_retry'||visibleReq.executionsConsumed!==1||visibleReq.loginAttemptsActual!==1||visibleReq.authPasswordUpdatesActual!==1||visibleReq.automaticRetryAllowed!==false||visibleReq.executionResult?.workflowRunId!==RUN||visibleReq.executionResult?.jobId!==JOB||visibleReq.executionResult?.artifactId!==ARTIFACT||visibleReq.executionResult?.artifactDigest!==DIGEST||visibleReq.executionResult?.rawDecision!==RAW_DECISION||visibleReq.executionResult?.classification!==ADJUDICATION||visibleReq.executionResult?.productDefectProven!==false||visibleReq.nextGate!==EXPECTED_FRONTIER)errors.push('VISIBLE_REQUEST_NOT_CONSUMED_HOLD');

const dedicatedDecision='PASS_I4A_DEDICATED_NONHISTORICAL_DEV_TEST_SHOPPER_VERIFIED_READONLY_NO_LOGIN';
if(dedicatedEvidence.verification?.decision!==dedicatedDecision)errors.push('DEDICATED_EVIDENCE_LOST');
if(createReq.enabled!==false||createReq.consumed!==true||createReq.status!=='pass_consumed_provider_verified_no_login'||createReq.automaticRetryAllowed!==false)errors.push('CREATE_REQUEST_NOT_FROZEN_PASS');
if(verifyReq.enabled!==false||verifyReq.consumed!==true||verifyReq.status!=='pass_consumed_readonly_verification'||verifyReq.providerReadsAuthorized!==false)errors.push('VERIFY_REQUEST_NOT_FROZEN_PASS');
for(const rel of forbiddenOneShotWorkflows)if(fs.existsSync(path.join(ROOT,rel)))errors.push(`ONE_SHOT_WORKFLOW_STILL_PRESENT:${rel}`);
const oldRequest=read('backend/config/i4a-existing-shopper-auth-metadata-readonly-request.json');
if(oldRequest){try{const x=JSON.parse(oldRequest);if(x.enabled!==false||x.consumed!==true||x.noAutomaticRetry!==true)errors.push('PRIOR_PROVIDER_GATE_NOT_FROZEN');}catch(e){errors.push('PRIOR_PROVIDER_REQUEST_INVALID');}}
try{
  const branch=execFileSync('git',['rev-parse','--abbrev-ref','HEAD'],{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
  if(branch!==EXPECTED_BRANCH){if(branch==='HEAD'&&process.env.CXORBIA_ALLOW_DETACHED_HEAD==='1')warnings.push('DETACHED_HEAD_ALLOWED_BY_ENV');else errors.push(`GIT_BRANCH_MISMATCH:${branch}`);}
}catch{warnings.push('GIT_BRANCH_CHECK_UNAVAILABLE');}
const result={schemaVersion:'cxorbia.source-truth-sync-verifier.v4',syncEpoch:SYNC_EPOCH,expectedBranch:EXPECTED_BRANCH,expectedFrontier:EXPECTED_FRONTIER,rawDecision:RAW_DECISION,adjudication:ADJUDICATION,run:RUN,job:JOB,artifact:ARTIFACT,artifactDigest:DIGEST,canonicalDocsChecked:canonicalDocs.length,evidenceChecked:evidencePath,requestsChecked:[visibleRequestPath,createRequestPath,verifyRequestPath],oneShotWorkflowsMustBeAbsent:forbiddenOneShotWorkflows,errors,warnings,decision:errors.length===0?'PASS_SOURCE_TRUTH_SYNC':'FAIL_SOURCE_TRUTH_SYNC'};
console.log(JSON.stringify(result,null,2));
process.exit(errors.length===0?0:1);
