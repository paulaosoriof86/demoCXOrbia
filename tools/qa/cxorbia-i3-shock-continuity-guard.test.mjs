import test from 'node:test';
import assert from 'node:assert/strict';
import {validateShockContinuity, classifyModules} from './cxorbia-i3-shock-continuity-guard.mjs';

const freeze = 'CXORBIA_I3_PLAN_CHOQUE_CIERRE_MONOTONICO_FROZEN_2026-10-28.md';
const mk = () => {
  const modules = Array.from({length: 21}, (_, i) => ({domain: `domain-${i}`, classification: i < 5 ? 'MATCH' : 'SOURCE_FIXED_PENDING_QA_DEV_E2E_HUMAN'}));
  const matrix = {productSource: {sha: 'source'}, modules};
  const descriptor = {branch: 'recovery/cxorbia-phase-a-20260831', productSourceSha: 'source',
    moduleTruthPath: 'matrix.json', moduleTruthExpectedGitBlob: 'matrix-blob',
    production: 'DO_NOT_TOUCH', terminalCertificationAllowed: false,
    exactNextAction: 'G03 readback HR, operación y finanzas; D07 focal only',
    activeShockControl: {id: 'CXORBIA-I3-SHOCK-MONOTONIC-CLOSURE-20261028', path: freeze, gitBlob: 'freeze-blob'}};
  const pointer = {productSourceSha: 'source', state: 'HOLD', production: 'DO_NOT_TOUCH', authorizationI4: false,
    moduleTruthAuthority: {path: 'matrix.json', gitBlob: 'matrix-blob'},
    nextExactAction: descriptor.exactNextAction,
    activeShockControl: {...descriptor.activeShockControl},
    activeShockModuleTruth: {sourceSha: 'source', matrixPath: 'matrix.json', matrixBlob: 'matrix-blob', classificationCounts: classifyModules(matrix)},
    progressByStageSemantics: 'HISTORICAL_SNAPSHOTS_NOT_RELEASE_AUTHORITY'};
  const gitBlob = p => ({[freeze]: 'freeze-blob', 'matrix.json': 'matrix-blob'})[p] || '';
  return {descriptor, pointer, matrix, gitBlob};
};

test('same source, pointers, counts and frozen priority pass', () => {
  assert.equal(validateShockContinuity(mk()).pass, true);
});
test('stale next action fails closed', () => {
  const a = mk(); a.pointer.nextExactAction = 'Only diagnose D07 PDF';
  assert.match(validateShockContinuity(a).failures.join(' '), /NEXT_ACTION_DESYNC/);
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
