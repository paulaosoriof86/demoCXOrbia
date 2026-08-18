#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const SYNC_EPOCH = 'CXORBIA-20260818-I3-11C-FOCAL-ADJUDICATION-02';
const EXPECTED_BRANCH = 'docs-tya-v6-v71-audit';
const EXPECTED_FRONTIER = 'I3_11C_TEMPORAL_WRITE_HISTORY_AND_RUNTIME_STALENESS_FORENSIC_NO_PROVIDER_READS';
const EXPECTED_BLOCKER = 'I3_11C_CURRENT_PROVIDER_STATE_VS_PRIOR_STAFF_RUNTIME_LINK_SET_DIVERGENCE';
const FOCAL_RUN = '32171812808';

const canonicalDocs = [
  'app/docs/CXORBIA-EXECUTION-STATE.json',
  'app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md',
  'app/docs/SOURCE-LOCK-CXORBIA-TYA.md',
  'app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md',
  'app/docs/ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md',
  'CAMBIOS-BACKEND.md',
  'RESUMEN-PARA-CLAUDE.md',
  'PENDIENTES-PROTOTIPO.md'
];
const evidenceDocs = [
  'app/docs/evidence/I3-11C-FOCAL-PROVIDER-IDENTITY-LINK-ADJUDICATION-LATEST.json',
  'app/docs/I3-11C-FOCAL-PROVIDER-READ-CLOSURE-20260818.md'
];
const supersededDocs = [
  'app/docs/CAMBIOS-BACKEND-ADDENDUM-I3-11C-20260818.md',
  'app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-I3-11C-20260818.md',
  'app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-I3-11C-20260818.md',
  'app/docs/SOURCE-LOCK-I3-8-PASS-I3-9-MEMBERSHIP-LOADER-ROOT-CAUSE-SOURCE-FIX-PENDING-DEV-GATE-20260817.md'
];
const errors = [];
const warnings = [];
function read(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) { errors.push(`MISSING:${rel}`); return ''; }
  return fs.readFileSync(abs, 'utf8');
}
const contents = new Map();
for (const rel of [...canonicalDocs, ...evidenceDocs, ...supersededDocs]) contents.set(rel, read(rel));

for (const rel of canonicalDocs) {
  const text = contents.get(rel) || '';
  if (!text.includes(SYNC_EPOCH)) errors.push(`SYNC_EPOCH_MISMATCH:${rel}`);
  if (!text.includes(EXPECTED_FRONTIER) && rel !== 'app/docs/CXORBIA-EXECUTION-STATE.json' && !text.includes('CXORBIA-EXECUTION-STATE.json')) errors.push(`FRONTIER_OR_STATE_POINTER_MISSING:${rel}`);
}
for (const rel of evidenceDocs) if (!(contents.get(rel) || '').includes(SYNC_EPOCH)) errors.push(`EVIDENCE_SYNC_EPOCH_MISMATCH:${rel}`);
for (const rel of supersededDocs) {
  const text = contents.get(rel) || '';
  if (!text.includes('SUPERSEDED_DO_NOT_EXECUTE')) errors.push(`OLD_DOCUMENT_NOT_SUPERSEDED:${rel}`);
}

let state = null;
try { state = JSON.parse(contents.get('app/docs/CXORBIA-EXECUTION-STATE.json') || '{}'); }
catch (error) { errors.push(`STATE_JSON_INVALID:${error.message}`); }
if (state) {
  if (state.syncEpoch !== SYNC_EPOCH) errors.push('STATE_SYNC_EPOCH_MISMATCH');
  if (state.branch !== EXPECTED_BRANCH) errors.push(`STATE_BRANCH_MISMATCH:${state.branch}`);
  if (state.phaseA?.exactFrontier !== EXPECTED_FRONTIER) errors.push(`STATE_FRONTIER_MISMATCH:${state.phaseA?.exactFrontier}`);
  if (state.provenCurrentBlocker?.code !== EXPECTED_BLOCKER) errors.push(`STATE_BLOCKER_MISMATCH:${state.provenCurrentBlocker?.code}`);
  if (state.phaseA?.formalProgressPercent !== 35 || state.phaseA?.formalRemainingPercent !== 65) errors.push('FORMAL_PROGRESS_MISMATCH');
  if (state.latestFocalProviderAdjudication?.workflowRunId !== 32171812808) errors.push('FOCAL_RUN_NOT_CANONICAL');
  if (state.latestFocalProviderAdjudication?.adjudication !== 'intact_and_applicable_provider_state') errors.push('FOCAL_ADJUDICATION_MISMATCH');
  if (state.latestFocalProviderAdjudication?.trustedNormalizedLinks !== 2 || state.latestFocalProviderAdjudication?.rejectedLinks !== 0) errors.push('FOCAL_LINK_COUNTS_MISMATCH');
  if (state.latestFocalProviderAdjudication?.providerWrites !== 0) errors.push('FOCAL_PROVIDER_WRITES_NONZERO');
  if (state.consumedAndFrozen?.focalProviderIdentityLinkReadI3_11C?.status !== 'PASS_CONSUMED_NO_RERUN') errors.push('FOCAL_GATE_NOT_CONSUMED');
}

const requestPath = '.github/cxorbia-gate-requests/request.json';
const requestText = read(requestPath);
try {
  const request = JSON.parse(requestText || '{}');
  if (request.enabled !== false || request.consumed !== true) errors.push('FOCAL_REQUEST_NOT_DISABLED_CONSUMED');
  if (request.result?.workflowRunId !== 32171812808 || request.result?.providerWrites !== 0) errors.push('FOCAL_REQUEST_RESULT_MISMATCH');
  if (request.nextGate !== EXPECTED_FRONTIER) errors.push('FOCAL_REQUEST_NEXT_GATE_MISMATCH');
} catch (error) { errors.push(`FOCAL_REQUEST_JSON_INVALID:${error.message}`); }

const joined = canonicalDocs.map(rel => contents.get(rel) || '').join('\n');
if (!joined.includes(FOCAL_RUN)) errors.push('FOCAL_RUN_NOT_PROPAGATED');
if (!joined.includes('intact') || !joined.includes('applicable')) warnings.push('FOCAL_PROVIDER_STATE_WORDING_NOT_PROPAGATED');
const staleClaims = [
  'FIRESTORE_RULES_DEV_GATE_PENDING',
  'RULES_DEV_PROVIDER_WRITE_PENDING_AUTH',
  'SHOPPER_MEMBERSHIP_LOADER_SOURCE_FIX_NOT_DEPLOYED',
  'NEW_AUTH_REQUIRED_FOCAL_PROVIDER_IDENTITY_LINK_READONLY_ADJUDICATION_NO_WRITES'
];
for (const token of staleClaims) if (joined.includes(token)) errors.push(`STALE_CURRENT_CLAIM_PRESENT:${token}`);

try {
  const branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore','pipe','ignore'] }).trim();
  if (branch !== EXPECTED_BRANCH) {
    if (branch === 'HEAD' && process.env.CXORBIA_ALLOW_DETACHED_HEAD === '1') warnings.push('DETACHED_HEAD_ALLOWED_BY_ENV');
    else errors.push(`GIT_BRANCH_MISMATCH:${branch}`);
  }
} catch { warnings.push('GIT_BRANCH_CHECK_UNAVAILABLE'); }

const result = {
  schemaVersion: 'cxorbia.source-truth-sync-verifier.v1',
  syncEpoch: SYNC_EPOCH,
  expectedBranch: EXPECTED_BRANCH,
  expectedFrontier: EXPECTED_FRONTIER,
  expectedBlocker: EXPECTED_BLOCKER,
  canonicalDocsChecked: canonicalDocs.length,
  evidenceDocsChecked: evidenceDocs.length,
  supersededDocsChecked: supersededDocs.length,
  errors,
  warnings,
  decision: errors.length === 0 ? 'PASS_SOURCE_TRUTH_SYNC' : 'FAIL_SOURCE_TRUTH_SYNC'
};
console.log(JSON.stringify(result, null, 2));
process.exit(errors.length === 0 ? 0 : 1);
