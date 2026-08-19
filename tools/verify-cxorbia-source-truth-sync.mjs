#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const ROOT=process.cwd();
const SYNC_EPOCH='CXORBIA-20260818-I4A-PROVIDER-HOLD-SYNC-20';
const EXPECTED_BRANCH='docs-tya-v6-v71-audit';
const EXPECTED_FRONTIER='NEW_AUTH_REQUIRED_I4A_CREATE_DEDICATED_NONHISTORICAL_DEV_TEST_SHOPPER__PROTECTED_CONTRACT_NO_LOGIN';
const EXPECTED_DECISION='HOLD_I4A_TEST_SHOPPER_IDENTITY_NOT_PROVEN__PROVIDER_READONLY_NO_LOGIN';
const RUN=32208829234,JOB=95937257924,ARTIFACT=9350022534;
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
const evidencePath='app/docs/evidence/I4A-EXISTING-SHOPPER-AUTH-METADATA-READONLY-HOLD-LATEST.json';
const requestPath='backend/config/i4a-existing-shopper-auth-metadata-readonly-request.json';
const errors=[],warnings=[];
const read=rel=>{const p=path.join(ROOT,rel);if(!fs.existsSync(p)){errors.push(`MISSING:${rel}`);return '';}return fs.readFileSync(p,'utf8');};
const docs=new Map(canonicalDocs.map(x=>[x,read(x)]));
for(const rel of canonicalDocs){
  const text=docs.get(rel)||'';
  if(!text.includes(SYNC_EPOCH))errors.push(`SYNC_EPOCH_MISMATCH:${rel}`);
  if(!text.includes(EXPECTED_FRONTIER))errors.push(`FRONTIER_MISSING:${rel}`);
}
let state={},evidence={},req={};
try{state=JSON.parse(docs.get('app/docs/CXORBIA-EXECUTION-STATE.json')||'{}');}catch(e){errors.push(`STATE_JSON_INVALID:${e.message}`);}
try{evidence=JSON.parse(read(evidencePath)||'{}');}catch(e){errors.push(`EVIDENCE_JSON_INVALID:${e.message}`);}
try{req=JSON.parse(read(requestPath)||'{}');}catch(e){errors.push(`REQUEST_JSON_INVALID:${e.message}`);}
if(state.syncEpoch!==SYNC_EPOCH)errors.push('STATE_EPOCH_MISMATCH');
if(state.branch!==EXPECTED_BRANCH)errors.push(`STATE_BRANCH_MISMATCH:${state.branch}`);
if(state.phaseA?.formalProgressPercent!==60||state.phaseA?.formalRemainingPercent!==40)errors.push('FORMAL_PROGRESS_MISMATCH');
if(state.phaseA?.score?.I3!=='25/25 PASS FROZEN')errors.push('I3_NOT_FROZEN_PASS');
if(state.phaseA?.exactFrontier!==EXPECTED_FRONTIER)errors.push('STATE_FRONTIER_MISMATCH');
const cls=state.i4aReadiness?.providerAuthClassification||{};
if(cls.decision!==EXPECTED_DECISION||cls.workflowRunId!==RUN||cls.jobId!==JOB||cls.artifactId!==ARTIFACT)errors.push('STATE_PROVIDER_RESULT_MISMATCH');
if(cls.providerReadCalls!==1||cls.explicitSafeCandidateCount!==0||cls.selected!==null||cls.providerOperationConsumed!==true||cls.automaticRetry!==false)errors.push('STATE_PROVIDER_CONSUMPTION_MISMATCH');
if(evidence.syncEpoch!==SYNC_EPOCH||evidence.decision!==EXPECTED_DECISION||evidence.workflowRunId!==RUN||evidence.jobId!==JOB||evidence.artifactId!==ARTIFACT)errors.push('EVIDENCE_RESULT_MISMATCH');
if(evidence.providerReadCalls!==1||evidence.totalAuthPrincipals!==232||evidence.shopperPrincipalCount!==211||evidence.explicitSafeCandidateCount!==0||evidence.selected!==null)errors.push('EVIDENCE_COUNTS_MISMATCH');
if(evidence.publicationMechanism?.providerOperationMustNotBeRetried!==true)errors.push('EVIDENCE_RERUN_GUARD_MISSING');
if(req.syncEpoch!==SYNC_EPOCH||req.enabled!==false||req.consumed!==true||req.status!=='consumed_hold_no_retry'||req.providerReadsAuthorized!==false||req.noAutomaticRetry!==true)errors.push('REQUEST_NOT_CONSUMED_FAIL_CLOSED');
if(req.consumedByRun!==RUN||req.consumedByJob!==JOB||req.artifactId!==ARTIFACT||req.result?.decision!==EXPECTED_DECISION||req.nextGate!==EXPECTED_FRONTIER)errors.push('REQUEST_RESULT_MISMATCH');
const forbiddenFiles=['app/docs/CXORBIA-EXECUTION-STATE.next.json','TEMP-NOOP.txt','TEMP-NOOP2.txt','TEMP-NOOP3.txt','TEMP-NOOP4.txt','TEMP-NOOP5.txt','TEMP-NOOP6.txt','TEMP-NOOP7.txt'];
for(const rel of forbiddenFiles)if(fs.existsSync(path.join(ROOT,rel)))errors.push(`TEMP_FILE_PRESENT:${rel}`);
const joined=[...docs.values()].join('\n');
const staleFrontiers=[
  'NEW_AUTH_REQUIRED_I4A_EXISTING_SHOPPER_IDENTITY_CLASSIFICATION_DEV_READONLY_NO_LOGIN',
  'NEW_AUTH_REQUIRED_I3_11C_DEV_HOSTING_MATERIALIZE_CORRECTED_IDENTITY_RUNTIME_NO_PROVIDER_DATA_WRITES',
  'I3.5A_EXACT_TECHNICAL_CROSSWALK_SOURCE_HUNT__PLUS_I3.6_FROZEN_REFERENCE_HARNESS_FIX__SOURCE_ONLY'
];
for(const token of staleFrontiers){
  const occurrences=(joined.match(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'))||[]).length;
  if(occurrences>1)warnings.push(`HISTORICAL_TOKEN_PRESENT:${token}:${occurrences}`);
}
try{
  const branch=execFileSync('git',['rev-parse','--abbrev-ref','HEAD'],{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
  if(branch!==EXPECTED_BRANCH){
    if(branch==='HEAD'&&process.env.CXORBIA_ALLOW_DETACHED_HEAD==='1')warnings.push('DETACHED_HEAD_ALLOWED_BY_ENV');
    else errors.push(`GIT_BRANCH_MISMATCH:${branch}`);
  }
}catch{warnings.push('GIT_BRANCH_CHECK_UNAVAILABLE');}
const result={schemaVersion:'cxorbia.source-truth-sync-verifier.v2',syncEpoch:SYNC_EPOCH,expectedBranch:EXPECTED_BRANCH,expectedFrontier:EXPECTED_FRONTIER,decisionExpected:EXPECTED_DECISION,run:RUN,job:JOB,artifact:ARTIFACT,canonicalDocsChecked:canonicalDocs.length,evidenceChecked:evidencePath,requestChecked:requestPath,errors,warnings,decision:errors.length===0?'PASS_SOURCE_TRUTH_SYNC':'FAIL_SOURCE_TRUTH_SYNC'};
console.log(JSON.stringify(result,null,2));
process.exit(errors.length===0?0:1);
