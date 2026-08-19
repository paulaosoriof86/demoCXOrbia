#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const ROOT=process.cwd();
const SYNC_EPOCH='CXORBIA-20260819-I4A-DEDICATED-TEST-SHOPPER-PASS-21';
const EXPECTED_BRANCH='docs-tya-v6-v71-audit';
const EXPECTED_FRONTIER='NEW_AUTH_REQUIRED_I4A_SINGLE_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE';
const EXPECTED_DECISION='PASS_I4A_DEDICATED_NONHISTORICAL_DEV_TEST_SHOPPER_VERIFIED_READONLY_NO_LOGIN';
const RUN=32273818536,JOB=96136329240,ARTIFACT=9373197946;
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
const evidencePath='app/docs/evidence/I4A-DEDICATED-NONHISTORICAL-DEV-TEST-SHOPPER-PASS-LATEST.json';
const createRequestPath='backend/config/i4a-dedicated-test-shopper-create-request.json';
const verifyRequestPath='backend/config/i4a-dedicated-test-shopper-verify-request.json';
const forbiddenOneShotWorkflows=[
  '.github/workflows/cxorbia-i4a-dedicated-test-shopper-create.yml',
  '.github/workflows/cxorbia-i4a-dedicated-test-shopper-verify-readonly.yml'
];
const errors=[],warnings=[];
const read=rel=>{const p=path.join(ROOT,rel);if(!fs.existsSync(p)){errors.push(`MISSING:${rel}`);return '';}return fs.readFileSync(p,'utf8');};
const docs=new Map(canonicalDocs.map(x=>[x,read(x)]));
for(const rel of canonicalDocs){const text=docs.get(rel)||'';if(!text.includes(SYNC_EPOCH))errors.push(`SYNC_EPOCH_MISMATCH:${rel}`);if(!text.includes(EXPECTED_FRONTIER))errors.push(`FRONTIER_MISSING:${rel}`);}
let state={},evidence={},createReq={},verifyReq={};
try{state=JSON.parse(docs.get('app/docs/CXORBIA-EXECUTION-STATE.json')||'{}');}catch(e){errors.push(`STATE_JSON_INVALID:${e.message}`);}
try{evidence=JSON.parse(read(evidencePath)||'{}');}catch(e){errors.push(`EVIDENCE_JSON_INVALID:${e.message}`);}
try{createReq=JSON.parse(read(createRequestPath)||'{}');}catch(e){errors.push(`CREATE_REQUEST_JSON_INVALID:${e.message}`);}
try{verifyReq=JSON.parse(read(verifyRequestPath)||'{}');}catch(e){errors.push(`VERIFY_REQUEST_JSON_INVALID:${e.message}`);}
if(state.syncEpoch!==SYNC_EPOCH)errors.push('STATE_EPOCH_MISMATCH');
if(state.branch!==EXPECTED_BRANCH)errors.push(`STATE_BRANCH_MISMATCH:${state.branch}`);
if(state.phaseA?.formalProgressPercent!==60||state.phaseA?.formalRemainingPercent!==40)errors.push('FORMAL_PROGRESS_MISMATCH');
if(state.phaseA?.score?.I3!=='25/25 PASS FROZEN')errors.push('I3_NOT_FROZEN_PASS');
if(state.phaseA?.exactFrontier!==EXPECTED_FRONTIER)errors.push('STATE_FRONTIER_MISMATCH');
const d=state.i4a?.dedicatedTestShopper||{};
if(d.status!=='PASS_CREATED_AND_PROVIDER_VERIFIED_NO_LOGIN'||d.verificationDecision!==EXPECTED_DECISION||d.workflowRunId!==RUN||d.jobId!==JOB||d.artifactId!==ARTIFACT)errors.push('STATE_I4A_DEDICATED_RESULT_MISMATCH');
if(d.claimsExact!==true||d.profileExact!==true||d.membershipExact!==true||d.crosswalkExact!==true||d.providerAck!==true||d.explicitProvenanceExact!==true||d.finalMaterializedIdentityCount!==1||d.loginAttempts!==0)errors.push('STATE_I4A_EXACTNESS_MISMATCH');
if(evidence.syncEpoch!==SYNC_EPOCH||evidence.verification?.decision!==EXPECTED_DECISION||evidence.verification?.workflowRunId!==RUN||evidence.verification?.jobId!==JOB||evidence.verification?.artifactId!==ARTIFACT)errors.push('EVIDENCE_RESULT_MISMATCH');
for(const k of ['claimsExact','profileExact','membershipExact','crosswalkExact','providerAck','explicitProvenanceExact'])if(evidence.verification?.[k]!==true)errors.push(`EVIDENCE_${k}_NOT_TRUE`);
if(evidence.writeExecution?.finalMaterializedIdentityCount!==1||evidence.writeExecution?.exactLowLevelCreateRunCountersRecovered!==false)errors.push('EVIDENCE_WRITE_ADJUDICATION_MISMATCH');
if(evidence.safety?.loginAttempts!==0||evidence.safety?.historicalShopperAccess!==false||evidence.safety?.otherIdentitiesModified!==0||evidence.safety?.hrWrites!==0||evidence.safety?.merge!==false||evidence.safety?.production!==false)errors.push('EVIDENCE_SAFETY_MISMATCH');
if(createReq.enabled!==false||createReq.consumed!==true||createReq.status!=='pass_consumed_provider_verified_no_login'||createReq.automaticRetryAllowed!==false||createReq.verificationResult?.decision!==EXPECTED_DECISION||createReq.nextGate!==EXPECTED_FRONTIER)errors.push('CREATE_REQUEST_NOT_CONSUMED_PASS');
if(verifyReq.enabled!==false||verifyReq.consumed!==true||verifyReq.status!=='pass_consumed_readonly_verification'||verifyReq.providerReadsAuthorized!==false||verifyReq.executionResult?.decision!==EXPECTED_DECISION||verifyReq.executionResult?.workflowRunId!==RUN||verifyReq.nextGate!==EXPECTED_FRONTIER)errors.push('VERIFY_REQUEST_NOT_CONSUMED_PASS');
for(const rel of forbiddenOneShotWorkflows)if(fs.existsSync(path.join(ROOT,rel)))errors.push(`ONE_SHOT_WORKFLOW_STILL_PRESENT:${rel}`);
const oldRequest=read('backend/config/i4a-existing-shopper-auth-metadata-readonly-request.json');
if(oldRequest){try{const x=JSON.parse(oldRequest);if(x.enabled!==false||x.consumed!==true||x.noAutomaticRetry!==true)errors.push('PRIOR_PROVIDER_GATE_NOT_FROZEN');}catch(e){errors.push('PRIOR_PROVIDER_REQUEST_INVALID');}}
try{const branch=execFileSync('git',['rev-parse','--abbrev-ref','HEAD'],{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();if(branch!==EXPECTED_BRANCH){if(branch==='HEAD'&&process.env.CXORBIA_ALLOW_DETACHED_HEAD==='1')warnings.push('DETACHED_HEAD_ALLOWED_BY_ENV');else errors.push(`GIT_BRANCH_MISMATCH:${branch}`);}}catch{warnings.push('GIT_BRANCH_CHECK_UNAVAILABLE');}
const result={schemaVersion:'cxorbia.source-truth-sync-verifier.v3',syncEpoch:SYNC_EPOCH,expectedBranch:EXPECTED_BRANCH,expectedFrontier:EXPECTED_FRONTIER,verificationDecision:EXPECTED_DECISION,run:RUN,job:JOB,artifact:ARTIFACT,canonicalDocsChecked:canonicalDocs.length,evidenceChecked:evidencePath,requestsChecked:[createRequestPath,verifyRequestPath],oneShotWorkflowsMustBeAbsent:forbiddenOneShotWorkflows,errors,warnings,decision:errors.length===0?'PASS_SOURCE_TRUTH_SYNC':'FAIL_SOURCE_TRUTH_SYNC'};
console.log(JSON.stringify(result,null,2));
process.exit(errors.length===0?0:1);
