#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const SYNC_EPOCH = 'CXORBIA-20260818-ROOT-CAUSE-RECOVERY-01';
const EXPECTED_BRANCH = 'docs-tya-v6-v71-audit';
const EXPECTED_FRONTIER = 'NEW_AUTH_REQUIRED_FOCAL_PROVIDER_IDENTITY_LINK_READONLY_ADJUDICATION_NO_WRITES';
const EXPECTED_BLOCKER = 'I3_11C_EXPECTED_PROVIDER_LINK_NOT_IN_APPLICABLE_RUNTIME_SET';

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
  if (!fs.existsSync(abs)) {
    errors.push(`MISSING:${rel}`);
    return '';
  }
  return fs.readFileSync(abs, 'utf8');
}

const contents = new Map();
for (const rel of canonicalDocs) contents.set(rel, read(rel));
for (const rel of supersededDocs) contents.set(rel, read(rel));

for (const rel of canonicalDocs) {
  const text = contents.get(rel) || '';
  if (!text.includes(SYNC_EPOCH)) errors.push(`SYNC_EPOCH_MISMATCH:${rel}`);
  if (!text.includes(EXPECTED_FRONTIER) && rel !== 'app/docs/CXORBIA-EXECUTION-STATE.json') {
    if (!text.includes('CXORBIA-EXECUTION-STATE.json')) errors.push(`FRONTIER_OR_STATE_POINTER_MISSING:${rel}`);
  }
}

for (const rel of supersededDocs) {
  const text = contents.get(rel) || '';
  if (!text.includes('SUPERSEDED_DO_NOT_EXECUTE')) errors.push(`OLD_DOCUMENT_NOT_SUPERSEDED:${rel}`);
  if (!text.includes(SYNC_EPOCH)) errors.push(`OLD_DOCUMENT_SYNC_EPOCH_MISSING:${rel}`);
}

let state = null;
try {
  state = JSON.parse(contents.get('app/docs/CXORBIA-EXECUTION-STATE.json') || '{}');
} catch (error) {
  errors.push(`STATE_JSON_INVALID:${error.message}`);
}

if (state) {
  if (state.syncEpoch !== SYNC_EPOCH) errors.push('STATE_SYNC_EPOCH_MISMATCH');
  if (state.branch !== EXPECTED_BRANCH) errors.push(`STATE_BRANCH_MISMATCH:${state.branch}`);
  if (state.phaseA?.exactFrontier !== EXPECTED_FRONTIER) errors.push(`STATE_FRONTIER_MISMATCH:${state.phaseA?.exactFrontier}`);
  if (state.provenCurrentBlocker?.code !== EXPECTED_BLOCKER) errors.push(`STATE_BLOCKER_MISMATCH:${state.provenCurrentBlocker?.code}`);
  if (state.consumedAndFrozen?.firestoreRulesI3_11C?.status !== 'PASS_DIRECT_FIRESTORE_RULES_DEPLOY_VERIFIED') errors.push('RULES_NOT_MARKED_PASS');
  if (state.consumedAndFrozen?.firestoreRulesI3_11C?.consumed !== true) errors.push('RULES_NOT_MARKED_CONSUMED');
  if (state.phaseA?.formalProgressPercent !== 35) errors.push(`FORMAL_PROGRESS_UNEXPECTED:${state.phaseA?.formalProgressPercent}`);
}

const canonicalJoined = canonicalDocs.map((rel) => contents.get(rel) || '').join('\n');
const forbiddenCurrentClaims = [
  'FIRESTORE_RULES_DEV_GATE_PENDING',
  'RULES_DEV_PROVIDER_WRITE_PENDING_AUTH',
  'I3_11C_SINGLE_FIRESTORE_RULES_DEV_DEPLOY_AND_STAFF_READONLY_CLOSE',
  'SHOPPER_MEMBERSHIP_LOADER_SOURCE_FIX_NOT_DEPLOYED'
];
for (const token of forbiddenCurrentClaims) {
  if (canonicalJoined.includes(token)) errors.push(`STALE_CURRENT_CLAIM_PRESENT:${token}`);
}

if (!canonicalJoined.includes(EXPECTED_BLOCKER)) errors.push('CURRENT_BLOCKER_NOT_PROPAGATED');
if (!canonicalJoined.includes('32163552089')) errors.push('RULES_PASS_RUN_NOT_PROPAGATED');
if (!canonicalJoined.includes('TyA') || !canonicalJoined.includes('Cinépolis')) warnings.push('MULTITENANT_CONTEXT_TERMS_NOT_FOUND');

try {
  const branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  if (branch !== EXPECTED_BRANCH) {
    if (branch === 'HEAD' && process.env.CXORBIA_ALLOW_DETACHED_HEAD === '1') warnings.push('DETACHED_HEAD_ALLOWED_BY_ENV');
    else errors.push(`GIT_BRANCH_MISMATCH:${branch}`);
  }
} catch {
  warnings.push('GIT_BRANCH_CHECK_UNAVAILABLE');
}

const result = {
  schemaVersion: 'cxorbia.source-truth-sync-verifier.v1',
  syncEpoch: SYNC_EPOCH,
  expectedBranch: EXPECTED_BRANCH,
  expectedFrontier: EXPECTED_FRONTIER,
  expectedBlocker: EXPECTED_BLOCKER,
  canonicalDocsChecked: canonicalDocs.length,
  supersededDocsChecked: supersededDocs.length,
  errors,
  warnings,
  decision: errors.length === 0 ? 'PASS_SOURCE_TRUTH_SYNC' : 'FAIL_SOURCE_TRUTH_SYNC'
};

console.log(JSON.stringify(result, null, 2));
process.exit(errors.length === 0 ? 0 : 1);
