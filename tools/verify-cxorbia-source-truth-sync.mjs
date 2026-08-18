#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT=process.cwd();
const SYNC_EPOCH='CXORBIA-20260818-I3-11C-RUNTIME-CONTRACT-DRIFT-03';
const EXPECTED_BRANCH='docs-tya-v6-v71-audit';
const EXPECTED_FRONTIER='I3_11C_UNIFY_PROVIDER_IDENTITY_RUNTIME_WITH_CANONICAL_ROLL_FORWARD_SOURCE_CORRECTION_NO_PROVIDER_IO';
const EXPECTED_BLOCKER='PROVEN_RUNTIME_CONTRACT_DRIFT__LEGACY_PROVIDER_IDENTITY_LINK_APPLICABILITY_FILTER';
const FOCAL_RUN='32171812808';

const canonicalDocs=[
  'app/docs/CXORBIA-EXECUTION-STATE.json',
  'app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md',
  'app/docs/SOURCE-LOCK-CXORBIA-TYA.md',
  'app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md',
  'app/docs/ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md',
  'CAMBIOS-BACKEND.md','RESUMEN-PARA-CLAUDE.md','PENDIENTES-PROTOTIPO.md'
];
const evidenceDocs=[
  'app/docs/evidence/I3-11C-TEMPORAL-RUNTIME-CONTRACT-DRIFT-FORENSIC-LATEST.json',
  'app/docs/evidence/I3-11C-FOCAL-PROVIDER-IDENTITY-LINK-ADJUDICATION-LATEST.json'
];
const errors=[],warnings=[];
const read=rel=>{const abs=path.join(ROOT,rel);if(!fs.existsSync(abs)){errors.push(`MISSING:${rel}`);return '';}return fs.readFileSync(abs,'utf8');};
const contents=new Map();
for(const rel of [...canonicalDocs,...evidenceDocs])contents.set(rel,read(rel));
for(const rel of canonicalDocs){const text=contents.get(rel)||'';if(!text.includes(SYNC_EPOCH))errors.push(`SYNC_EPOCH_MISMATCH:${rel}`);if(!text.includes(EXPECTED_FRONTIER)&&rel!=='app/docs/CXORBIA-EXECUTION-STATE.json'&&!text.includes('CXORBIA-EXECUTION-STATE.json'))errors.push(`FRONTIER_OR_STATE_POINTER_MISSING:${rel}`);}
if(!(contents.get(evidenceDocs[0])||'').includes(SYNC_EPOCH))errors.push('ROOT_CAUSE_EVIDENCE_EPOCH_MISMATCH');
let state=null;try{state=JSON.parse(contents.get(canonicalDocs[0])||'{}');}catch(e){errors.push(`STATE_JSON_INVALID:${e.message}`);}
if(state){
  if(state.syncEpoch!==SYNC_EPOCH)errors.push('STATE_SYNC_EPOCH_MISMATCH');
  if(state.branch!==EXPECTED_BRANCH)errors.push(`STATE_BRANCH_MISMATCH:${state.branch}`);
  if(state.phaseA?.exactFrontier!==EXPECTED_FRONTIER)errors.push(`STATE_FRONTIER_MISMATCH:${state.phaseA?.exactFrontier}`);
  if(state.provenCurrentBlocker?.code!==EXPECTED_BLOCKER)errors.push(`STATE_BLOCKER_MISMATCH:${state.provenCurrentBlocker?.code}`);
  if(state.phaseA?.formalProgressPercent!==35||state.phaseA?.formalRemainingPercent!==65)errors.push('FORMAL_PROGRESS_MISMATCH');
  if(state.latestFocalProviderAdjudication?.workflowRunId!==32171812808||state.latestFocalProviderAdjudication?.providerWrites!==0)errors.push('FOCAL_PASS_NOT_PRESERVED');
  if(state.consumedAndFrozen?.temporalRuntimeForensicI3_11C?.status!=='PASS_ROOT_CAUSE_PROVEN_NO_PROVIDER_IO')errors.push('RUNTIME_FORENSIC_NOT_FROZEN_PASS');
}
const rootEvidence=(()=>{try{return JSON.parse(contents.get(evidenceDocs[0])||'{}');}catch(e){errors.push(`ROOT_EVIDENCE_JSON_INVALID:${e.message}`);return {};}})();
if(rootEvidence.rootCause?.code!==EXPECTED_BLOCKER)errors.push('ROOT_EVIDENCE_BLOCKER_MISMATCH');
if(rootEvidence.providerReads!==0||rootEvidence.providerWrites!==0)errors.push('ROOT_FORENSIC_PROVIDER_IO_NONZERO');
if(rootEvidence.runtimeContract?.targetDeterministicResult!=='REJECTED_BECAUSE_STATUS_MATERIALIZED_IS_NOT_EXACTLY_ACTIVE')errors.push('RUNTIME_REJECTION_NOT_PROVEN');
if(rootEvidence.canonicalContract?.targetNormalizedApplicable!==true)errors.push('CANONICAL_TARGET_NOT_APPLICABLE');
const joined=canonicalDocs.map(r=>contents.get(r)||'').join('\n');
if(!joined.includes(EXPECTED_BLOCKER))errors.push('ROOT_CAUSE_NOT_PROPAGATED');
if(!joined.includes(FOCAL_RUN))errors.push('FOCAL_RUN_NOT_PRESERVED');
for(const stale of ['NEW_AUTH_REQUIRED_FOCAL_PROVIDER_IDENTITY_LINK_READONLY_ADJUDICATION_NO_WRITES','I3_11C_TEMPORAL_WRITE_HISTORY_AND_RUNTIME_STALENESS_FORENSIC_NO_PROVIDER_READS'])if(joined.includes(stale))errors.push(`STALE_CURRENT_FRONTIER_PRESENT:${stale}`);
try{const branch=execFileSync('git',['rev-parse','--abbrev-ref','HEAD'],{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();if(branch!==EXPECTED_BRANCH){if(branch==='HEAD'&&process.env.CXORBIA_ALLOW_DETACHED_HEAD==='1')warnings.push('DETACHED_HEAD_ALLOWED_BY_ENV');else errors.push(`GIT_BRANCH_MISMATCH:${branch}`);}}catch{warnings.push('GIT_BRANCH_CHECK_UNAVAILABLE');}
const result={schemaVersion:'cxorbia.source-truth-sync-verifier.v1',syncEpoch:SYNC_EPOCH,expectedBranch:EXPECTED_BRANCH,expectedFrontier:EXPECTED_FRONTIER,expectedBlocker:EXPECTED_BLOCKER,canonicalDocsChecked:canonicalDocs.length,evidenceDocsChecked:evidenceDocs.length,errors,warnings,decision:errors.length===0?'PASS_SOURCE_TRUTH_SYNC':'FAIL_SOURCE_TRUTH_SYNC'};
console.log(JSON.stringify(result,null,2));process.exit(errors.length===0?0:1);
