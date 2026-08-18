#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const ROOT=process.cwd();
const SYNC_EPOCH='CXORBIA-20260818-I3-11C-R3B-HOLD-DEV-HOSTING-PARITY-05';
const EXPECTED_BRANCH='docs-tya-v6-v71-audit';
const EXPECTED_FRONTIER='NEW_AUTH_REQUIRED_I3_11C_DEV_HOSTING_MATERIALIZE_CORRECTED_IDENTITY_RUNTIME_NO_PROVIDER_DATA_WRITES';
const EXPECTED_BLOCKER='I3_11C_CORRECTED_SOURCE_NOT_EFFECTIVE_IN_REMOTE_DEV__HOSTING_MATERIALIZATION_REQUIRED';
const R3B_RUN=32181137350;
const R3B_ARTIFACT=9340865585;

const canonicalDocs=[
  'app/docs/CXORBIA-EXECUTION-STATE.json',
  'app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md',
  'app/docs/SOURCE-LOCK-CXORBIA-TYA.md',
  'app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md',
  'app/docs/ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md',
  'CAMBIOS-BACKEND.md',
  'RESUMEN-PARA-CLAUDE.md',
  'PENDIENTES-PROTOTIPO.md'
];
const evidence='app/docs/evidence/I3-11C-R3B-STAFF-RUNTIME-HOLD-DEV-HOSTING-PARITY-LATEST.json';
const requestPath='.github/cxorbia-gate-requests/request.json';
const errors=[];const warnings=[];
const read=rel=>{const p=path.join(ROOT,rel);if(!fs.existsSync(p)){errors.push(`MISSING:${rel}`);return '';}return fs.readFileSync(p,'utf8');};
const docs=new Map(canonicalDocs.map(x=>[x,read(x)]));
const evidenceText=read(evidence);const requestText=read(requestPath);

for(const rel of canonicalDocs){
  const text=docs.get(rel)||'';
  if(!text.includes(SYNC_EPOCH))errors.push(`SYNC_EPOCH_MISMATCH:${rel}`);
  if(!text.includes(EXPECTED_FRONTIER)&&rel!=='app/docs/CXORBIA-EXECUTION-STATE.json')errors.push(`FRONTIER_MISSING:${rel}`);
}
if(!evidenceText.includes(SYNC_EPOCH))errors.push('EVIDENCE_SYNC_EPOCH_MISMATCH');
if(!evidenceText.includes(String(R3B_RUN))||!evidenceText.includes(String(R3B_ARTIFACT)))errors.push('R3B_EVIDENCE_IDS_MISSING');

let state={};try{state=JSON.parse(docs.get('app/docs/CXORBIA-EXECUTION-STATE.json')||'{}');}catch(e){errors.push(`STATE_JSON_INVALID:${e.message}`);}
if(state.syncEpoch!==SYNC_EPOCH)errors.push('STATE_EPOCH_MISMATCH');
if(state.branch!==EXPECTED_BRANCH)errors.push(`STATE_BRANCH_MISMATCH:${state.branch}`);
if(state.phaseA?.exactFrontier!==EXPECTED_FRONTIER)errors.push(`STATE_FRONTIER_MISMATCH:${state.phaseA?.exactFrontier}`);
if(state.rootCauseHistory?.currentBlockerCode!==EXPECTED_BLOCKER)errors.push(`STATE_BLOCKER_MISMATCH:${state.rootCauseHistory?.currentBlockerCode}`);
if(state.phaseA?.formalProgressPercent!==35||state.phaseA?.formalRemainingPercent!==65)errors.push('FORMAL_PROGRESS_MISMATCH');
if(state.latestR3B?.workflowRunId!==R3B_RUN||state.latestR3B?.artifactId!==R3B_ARTIFACT)errors.push('R3B_NOT_CANONICAL');
if(state.latestR3B?.decision!=='HOLD_READONLY_POST_GATES'||state.latestR3B?.staffReadonlyExecuted!==true)errors.push('R3B_DECISION_MISMATCH');
if(state.latestR3B?.targetCanonicalVisitsAugust!==0||state.latestR3B?.targetLiveResidualVisitsAugust!==2)errors.push('R3B_TARGET_COUNTS_MISMATCH');
if(state.latestR3B?.hostingDeploys!==0||state.latestR3B?.providerWrites!==0||state.latestR3B?.firestoreDataWrites!==0)errors.push('R3B_SAFETY_NONZERO');
if(state.consumedAndFrozen?.r3bStaffRuntimeClose?.status!=='HOLD_CONSUMED_NO_AUTOMATIC_RERUN')errors.push('R3B_NOT_FROZEN_CONSUMED');

let req={};try{req=JSON.parse(requestText||'{}');}catch(e){errors.push(`REQUEST_JSON_INVALID:${e.message}`);}
if(req.enabled!==false||req.consumed!==true)errors.push('R3B_REQUEST_NOT_DISABLED_CONSUMED');
if(req.result?.workflowRunId!==R3B_RUN||req.result?.artifactId!==R3B_ARTIFACT)errors.push('R3B_REQUEST_RESULT_MISMATCH');
if(req.result?.staffReadonlyExecuted!==true||req.result?.hostingDeploys!==0||req.result?.providerWrites!==0)errors.push('R3B_REQUEST_SAFETY_MISMATCH');
if(req.nextGate!==EXPECTED_FRONTIER)errors.push('R3B_REQUEST_NEXT_GATE_MISMATCH');

const joined=[...docs.values()].join('\n');
if(!joined.includes(EXPECTED_BLOCKER))errors.push('BLOCKER_NOT_PROPAGATED');
if(!joined.includes(String(R3B_RUN)))errors.push('R3B_RUN_NOT_PROPAGATED');
const staleCurrent=[
  'NEW_AUTH_REQUIRED_I3_11C_STAFF_RUNTIME_CANONICAL_IDENTITY_CLOSE_READONLY_NO_WRITES',
  'I3_11C_TEMPORAL_WRITE_HISTORY_AND_RUNTIME_STALENESS_FORENSIC_NO_PROVIDER_READS',
  'I3_11C_UNIFY_PROVIDER_IDENTITY_RUNTIME_WITH_CANONICAL_ROLL_FORWARD_SOURCE_CORRECTION_NO_PROVIDER_IO'
];
for(const token of staleCurrent){
  if(joined.includes(token))warnings.push(`HISTORICAL_TOKEN_PRESENT:${token}`);
}

try{
  const branch=execFileSync('git',['rev-parse','--abbrev-ref','HEAD'],{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
  if(branch!==EXPECTED_BRANCH){
    if(branch==='HEAD'&&process.env.CXORBIA_ALLOW_DETACHED_HEAD==='1')warnings.push('DETACHED_HEAD_ALLOWED_BY_ENV');
    else errors.push(`GIT_BRANCH_MISMATCH:${branch}`);
  }
}catch{warnings.push('GIT_BRANCH_CHECK_UNAVAILABLE');}

const result={schemaVersion:'cxorbia.source-truth-sync-verifier.v1',syncEpoch:SYNC_EPOCH,expectedBranch:EXPECTED_BRANCH,expectedFrontier:EXPECTED_FRONTIER,expectedBlocker:EXPECTED_BLOCKER,r3bRun:R3B_RUN,r3bArtifact:R3B_ARTIFACT,canonicalDocsChecked:canonicalDocs.length,evidenceChecked:evidence,errors,warnings,decision:errors.length===0?'PASS_SOURCE_TRUTH_SYNC':'FAIL_SOURCE_TRUTH_SYNC'};
console.log(JSON.stringify(result,null,2));
process.exit(errors.length===0?0:1);
