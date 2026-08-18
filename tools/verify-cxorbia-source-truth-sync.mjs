#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT=process.cwd();
const SYNC_EPOCH='CXORBIA-20260818-I3-11C-RUNTIME-SOURCE-CORRECTION-04';
const EXPECTED_BRANCH='docs-tya-v6-v71-audit';
const EXPECTED_FRONTIER='NEW_AUTH_REQUIRED_I3_11C_STAFF_RUNTIME_CANONICAL_IDENTITY_CLOSE_READONLY_NO_WRITES';
const EXPECTED_ROOT_CAUSE='PROVEN_RUNTIME_CONTRACT_DRIFT__LEGACY_PROVIDER_IDENTITY_LINK_APPLICABILITY_FILTER';
const errors=[],warnings=[];
const canonicalDocs=[
  'app/docs/CXORBIA-EXECUTION-STATE.json',
  'app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md',
  'app/docs/SOURCE-LOCK-CXORBIA-TYA.md',
  'app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md',
  'app/docs/ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md',
  'CAMBIOS-BACKEND.md','RESUMEN-PARA-CLAUDE.md','PENDIENTES-PROTOTIPO.md'
];
const evidenceDocs=[
  'app/docs/evidence/I3-11C-PROVIDER-RUNTIME-SOURCE-CORRECTION-LATEST.json',
  'app/docs/evidence/I3-11C-TEMPORAL-RUNTIME-CONTRACT-DRIFT-FORENSIC-LATEST.json',
  'app/docs/evidence/I3-11C-FOCAL-PROVIDER-IDENTITY-LINK-ADJUDICATION-LATEST.json'
];
const adapterPath='app/adapters/cxorbia-provider-identity-link-runtime-v1.js';
const parityPath='tools/qa/cxorbia-provider-identity-runtime-contract-parity-gate.mjs';
function read(rel){const abs=path.join(ROOT,rel);if(!fs.existsSync(abs)){errors.push(`MISSING:${rel}`);return '';}return fs.readFileSync(abs,'utf8');}
const contents=new Map();
for(const rel of [...canonicalDocs,...evidenceDocs,adapterPath,parityPath])contents.set(rel,read(rel));
for(const rel of canonicalDocs){const text=contents.get(rel)||'';if(!text.includes(SYNC_EPOCH))errors.push(`SYNC_EPOCH_MISMATCH:${rel}`);if(rel!=='app/docs/CXORBIA-EXECUTION-STATE.json'&&!text.includes(EXPECTED_FRONTIER)&&!text.includes('CXORBIA-EXECUTION-STATE.json'))errors.push(`FRONTIER_OR_STATE_POINTER_MISSING:${rel}`);}
let state={};try{state=JSON.parse(contents.get(canonicalDocs[0])||'{}');}catch(e){errors.push(`STATE_JSON_INVALID:${e.message}`);}
if(state.syncEpoch!==SYNC_EPOCH)errors.push('STATE_SYNC_EPOCH_MISMATCH');
if(state.branch!==EXPECTED_BRANCH)errors.push(`STATE_BRANCH_MISMATCH:${state.branch}`);
if(state.phaseA?.exactFrontier!==EXPECTED_FRONTIER)errors.push(`STATE_FRONTIER_MISMATCH:${state.phaseA?.exactFrontier}`);
if(state.phaseA?.formalProgressPercent!==35||state.phaseA?.formalRemainingPercent!==65)errors.push('FORMAL_PROGRESS_MISMATCH');
if(state.rootCause?.code!==EXPECTED_ROOT_CAUSE)errors.push(`ROOT_CAUSE_MISMATCH:${state.rootCause?.code}`);
if(state.rootCause?.status!=='CORRECTED_IN_SOURCE_PENDING_LIVE_RUNTIME_PROOF')errors.push('ROOT_CAUSE_CORRECTION_STATUS_MISMATCH');
if(state.sourceCorrection?.targetMaterializedExpectedApplicable!==true)errors.push('TARGET_MATERIALIZED_NOT_EXPECTED_APPLICABLE');
let sourceEvidence={};try{sourceEvidence=JSON.parse(contents.get(evidenceDocs[0])||'{}');}catch(e){errors.push(`SOURCE_EVIDENCE_JSON_INVALID:${e.message}`);}
if(sourceEvidence.syncEpoch!==SYNC_EPOCH)errors.push('SOURCE_EVIDENCE_EPOCH_MISMATCH');
if(sourceEvidence.rootCause!==EXPECTED_ROOT_CAUSE)errors.push('SOURCE_EVIDENCE_ROOT_CAUSE_MISMATCH');
if(sourceEvidence.nextFrontier!==EXPECTED_FRONTIER)errors.push('SOURCE_EVIDENCE_FRONTIER_MISMATCH');
if(sourceEvidence.scope?.providerReads!==0||sourceEvidence.scope?.providerWrites!==0)errors.push('SOURCE_CORRECTION_PROVIDER_IO_NONZERO');
const adapter=contents.get(adapterPath)||'';
if(!adapter.includes("const ACTIVE_STATES=new Set(['active','confirmed','approved','materialized'])"))errors.push('ADAPTER_ACTIVE_STATES_NOT_CANONICAL');
if(!adapter.includes("const TRUSTED_AUTHORITIES=new Set(['provider_exact','tenant_adjudication','platform_created','migrated_exact'])"))errors.push('ADAPTER_TRUSTED_AUTHORITIES_NOT_CANONICAL');
if(adapter.includes("str(link.status)!=='active'||link.periodIndependent!==true||link.providerAck!==true"))errors.push('LEGACY_APPLICABILITY_PREDICATE_STILL_PRESENT');
if(!adapter.includes('CX_IDENTITY_ROLL_FORWARD_CONTRACT')||!adapter.includes('normalizeLink'))errors.push('CANONICAL_CONTRACT_DELEGATION_MISSING');
if(!adapter.includes('fuzzyMatching:false'))errors.push('FUZZY_MATCHING_GUARD_MISSING');
const parity=contents.get(parityPath)||'';
if(!parity.includes('PASS_PROVIDER_IDENTITY_RUNTIME_CANONICAL_CONTRACT_PARITY'))errors.push('PARITY_GATE_DECISION_MISSING');
if(!parity.includes('materialized'))errors.push('PARITY_GATE_TARGET_STATE_MISSING');
const joined=canonicalDocs.map(x=>contents.get(x)||'').join('\n');
if(!joined.includes(EXPECTED_ROOT_CAUSE))errors.push('ROOT_CAUSE_NOT_PROPAGATED');
if(!joined.includes(EXPECTED_FRONTIER))errors.push('NEW_FRONTIER_NOT_PROPAGATED');
try{const branch=execFileSync('git',['rev-parse','--abbrev-ref','HEAD'],{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();if(branch!==EXPECTED_BRANCH){if(branch==='HEAD'&&process.env.CXORBIA_ALLOW_DETACHED_HEAD==='1')warnings.push('DETACHED_HEAD_ALLOWED_BY_ENV');else errors.push(`GIT_BRANCH_MISMATCH:${branch}`);}}catch{warnings.push('GIT_BRANCH_CHECK_UNAVAILABLE');}
const result={schemaVersion:'cxorbia.source-truth-sync-verifier.v1',syncEpoch:SYNC_EPOCH,expectedBranch:EXPECTED_BRANCH,expectedFrontier:EXPECTED_FRONTIER,expectedRootCause:EXPECTED_ROOT_CAUSE,canonicalDocsChecked:canonicalDocs.length,evidenceDocsChecked:evidenceDocs.length,sourceCorrectionAdapter:adapterPath,parityGate:parityPath,errors,warnings,decision:errors.length?'FAIL_SOURCE_TRUTH_SYNC':'PASS_SOURCE_TRUTH_SYNC'};
console.log(JSON.stringify(result,null,2));process.exit(errors.length?1:0);
