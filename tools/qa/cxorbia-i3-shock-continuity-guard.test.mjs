import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateShockContinuity, classifyModules} from './cxorbia-i3-shock-continuity-guard.mjs';

const freeze = 'CXORBIA_I3_PLAN_CHOQUE_CIERRE_MONOTONICO_FROZEN_2026-10-28.md';
const mk = () => {
  const modules = Array.from({length: 21}, (_, i) => ({domain: `domain-${i}`, classification: i < 5 ? 'MATCH' : 'SOURCE_FIXED_PENDING_QA_DEV_E2E_HUMAN'}));
  const matrix = {productSource: {sha: 'source'}, modules};
  const descriptor = {branch: 'recovery/cxorbia-phase-a-20260831', productSourceSha: 'source',
    moduleTruthPath: 'matrix.json', moduleTruthExpectedGitBlob: 'matrix-blob',
    production: 'DO_NOT_TOUCH', terminalCertificationAllowed: false,
    exactNextAction: 'G03 readback HR y finanzas; fusión Shopper 32/83 PROVISIONAL; Hosting DEV 3d1d42ad02066ae2 servido',
    i3FusionContinuityRecovered20261031: {receiptPath: 'receipt.json', receiptGitBlob: 'receipt-blob',
      lastIndependentVerifiedGroups: 31, provisionalVerifiedGroups: 32,
      provisionalPendingGroups: 51, recensusRequired: true},
    g03ActualHostingDevReadback20261031: {hostingVersion: 'sites/cxorbia-backend-dev/versions/3d1d42ad02066ae2',
      verifiedBrowserDevOnly: true},
    activeShockControl: {id: 'CXORBIA-I3-SHOCK-MONOTONIC-CLOSURE-20261028', path: freeze, gitBlob: 'freeze-blob'}};
  const pointer = {productSourceSha: 'source', state: 'HOLD', production: 'DO_NOT_TOUCH', authorizationI4: false,
    moduleTruthAuthority: {path: 'matrix.json', gitBlob: 'matrix-blob'},
    nextExactAction: descriptor.exactNextAction,
    i3FusionContinuityRecovered20261031: {...descriptor.i3FusionContinuityRecovered20261031},
    g03ActualHostingDevReadback20261031: {...descriptor.g03ActualHostingDevReadback20261031},
    activeShockControl: {...descriptor.activeShockControl},
    activeShockModuleTruth: {sourceSha: 'source', matrixPath: 'matrix.json', matrixBlob: 'matrix-blob', classificationCounts: classifyModules(matrix)},
    progressByStageSemantics: 'HISTORICAL_SNAPSHOTS_NOT_RELEASE_AUTHORITY'};
  const gitBlob = p => ({[freeze]: 'freeze-blob', 'matrix.json': 'matrix-blob',
    'receipt.json': 'receipt-blob'})[p] || '';
  return {descriptor, pointer, matrix, gitBlob};
};

test('same source, pointers, counts and frozen priority pass', () => {
  assert.equal(validateShockContinuity(mk()).pass, true);
});
test('stale next action fails closed', () => {
  const a = mk(); a.pointer.nextExactAction = 'Only diagnose D07 PDF';
  assert.match(validateShockContinuity(a).failures.join(' '), /NEXT_ACTION_DESYNC/);
});
test('matching but stale pointers cannot erase a proven fusion or served DEV version', () => {
  const a = mk();
  a.descriptor.exactNextAction = 'G03 readback HR y finanzas; 29/83; Hosting a\u00fan NO servido en DEV';
  a.pointer.nextExactAction = a.descriptor.exactNextAction;
  const failures = validateShockContinuity(a).failures.join(' ');
  assert.match(failures, /SHOPPER_FUSION_PROGRESS_STALE/);
  assert.match(failures, /DEV_HOSTING_REALITY_STALE/);
  assert.doesNotMatch(failures, /NEXT_ACTION_DESYNC/);
});
test('lost receipt or divergent fusion status fails closed', () => {
  const a = mk();
  a.pointer.i3FusionContinuityRecovered20261031.provisionalVerifiedGroups = 31;
  const failures = validateShockContinuity(a).failures.join(' ');
  assert.match(failures, /SHOPPER_FUSION_RECEIPT_DESYNC/);
  const b = mk();
  b.gitBlob = () => 'wrong';
  assert.match(validateShockContinuity(b).failures.join(' '), /SHOPPER_FUSION_RECEIPT_DESYNC/);
});
test('stale module counts fail closed', () => {
  const a = mk(); a.pointer.activeShockModuleTruth.classificationCounts.MATCH = 4;
  assert.match(validateShockContinuity(a).failures.join(' '), /CLASSIFICATION_COUNTS_STALE/);
});
test('different source and frozen document bytes fail closed', () => {
  const a = mk(); a.pointer.productSourceSha = 'other'; a.pointer.activeShockControl.gitBlob = 'other';
  const failures = validateShockContinuity(a).failures.join(' ');
  assert.match(failures, /SOURCE_POINTER_DESYNC/);
  assert.match(failures, /FROZEN_PRIORITY_BLOB_DESYNC/);
});
test('premature production and stale progress authority fail closed', () => {
  const a = mk(); a.pointer.authorizationI4 = true; delete a.pointer.progressByStageSemantics;
  const failures = validateShockContinuity(a).failures.join(' ');
  assert.match(failures, /PREMATURE_PRODUCTION/);
  assert.match(failures, /STALE_PROGRESS_AS_LIVE/);
});

test('the frozen shock status schedules the existing source proof after authority and has no cloud permissions', () => {
  const workflow = fs.readFileSync(new URL('../../.github/workflows/cxorbia-recovery-i3-dev-certification.yml', import.meta.url), 'utf8');
  const block = workflow.split('\n  phasea-rejected-checkpoint-source-proof:\n')[1]?.split(/\n  [a-z0-9-]+:\n/)[0];
  assert.ok(block, 'existing source-proof job must be present');
  assert.match(block, /needs: canonical-candidate-authority/);
  const condition = block.match(/^   if: (.+)$/m)?.[1] || '';
  const values = condition.match(/fromJSON\('([^']+)'\)/)?.[1];
  assert.ok(values, 'source-proof routing must have an explicit accepted-status list');
  const allowed = JSON.parse(values);
  assert.ok(allowed.includes('HOLD_I3_PHASE_A_CROSS_FUNCTIONAL_SHOCK_CONTROL'), 'current frozen shock status must execute source proof');
  assert.ok(allowed.includes('HOLD_I3_B_CUMULATIVE_SOURCE_PROOF_REQUIRED'), 'preserve the existing source-proof status');
  assert.equal(allowed.includes('GO'), false);
  assert.equal(allowed.includes('READY_FOR_TERMINAL_CERTIFICATION'), false);
  assert.match(block, /permissions: \{contents: read\}/);
  assert.match(block, /CXORBIA_I3_PHASEA_COMPLETION_CONTROL_20261007\.sh source-proof/);
  assert.doesNotMatch(block, /google-github-actions|secrets\.|id-token: write|\.sh (?:preflight|materialize|readback|proof)\b/);
});

test('source-proof accepts shock without weakening materialization guards or reporting invented closure counts', () => {
  const script = fs.readFileSync(new URL('../../.github/control/CXORBIA_I3_PHASEA_COMPLETION_CONTROL_20261007.sh', import.meta.url), 'utf8');
  const source = script.split('source-proof)\n')[1]?.split('\npreflight)')[0] || '';
  const preflight = script.split('\npreflight)')[1]?.split('\nmaterialize)')[0] || '';
  assert.match(source, /HOLD_I3_PHASE_A_CROSS_FUNCTIONAL_SHOCK_CONTROL/);
  assert.match(source, /productSourceSha/);
  assert.match(source, /productTreeAuthority/);
  assert.match(source, /git diff --quiet/);
  assert.match(source, /SOURCE_CONTRACTS_ONLY_NOT_I3_CERTIFICATION/);
  assert.doesNotMatch(source, /trueFunctionalDefects:0|g05FocalPass:113/);
  assert.doesNotMatch(source, /gcloud|credentials_json|firebase deploy|firestore\.collection/);
  assert.doesNotMatch(preflight, /HOLD_I3_PHASE_A_CROSS_FUNCTIONAL_SHOCK_CONTROL/);
  const adminInstall = source.indexOf('firebase-admin@13.4.0');
  assert.ok(adminInstall >= 0 && adminInstall < source.indexOf('node tools/qa/'), 'the pinned Admin SDK must be available before source tests import it');
});

test('the canonical workflow remains within the enforced 500 KB file limit', () => {
  const bytes = fs.statSync(new URL('../../.github/workflows/cxorbia-recovery-i3-dev-certification.yml', import.meta.url)).size;
  assert.ok(bytes <= 500 * 1024, `workflow is ${bytes} bytes; GitHub rejects it before any job above 512000 bytes`);
});

