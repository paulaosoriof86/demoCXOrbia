#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'backend/contracts/phase-a-live-execution-checkpoint-v1.json');
const docPath = path.join(root, 'app/docs/PHASE-A-LIVE-EXECUTION-CHECKPOINT-TYA-20260713.md');
const gatePath = path.join(root, 'tools/qa/verify-prototype-fastlane-gate.mjs');
const workflowPath = path.join(root, '.github/workflows/cxorbia-prototype-fastlane-gate.yml');

function fail(message) {
  console.error(`CHECKPOINT_FAIL: ${message}`);
  process.exit(1);
}
for (const file of [contractPath, docPath, gatePath, workflowPath]) if (!fs.existsSync(file)) fail(`missing required file: ${file}`);

let contract;
try { contract = JSON.parse(fs.readFileSync(contractPath, 'utf8')); }
catch (error) { fail(`invalid JSON: ${error.message}`); }
const doc = fs.readFileSync(docPath, 'utf8');

for (const key of ['version','repository','branch','baseline','activeBlock','candidateAcceptance','plan','completedEvidence','notReopened','ciExecutionPolicy','mandatoryCloseSections','gates']) {
  if (!(key in contract)) fail(`missing contract key: ${key}`);
}
if (contract.repository !== 'paulaosoriof86/demoCXOrbia') fail('unexpected repository');
if (contract.branch !== 'phase-a/integration-live-20260714') fail('unexpected live integration branch');
if (contract.baseline?.sourceLock !== 'V110') fail('V110 source lock drift');
if (contract.baseline?.continuity !== 'V111') fail('V111 continuity drift');
if (contract.baseline?.rejectedCandidate !== 'V112') fail('V112 rejection drift');
if (contract.baseline?.nextCandidateRequested !== 'V113') fail('V113 request drift');
if (contract.activeBlock?.id !== 'R21_R23_FAST_AUDIT_AND_EMPALME_V113') fail('active block drift');
if (contract.activeBlock?.failClosed !== true) fail('candidate gate must be fail-closed');
if (contract.activeBlock?.acceptanceGate !== 'tools/qa/verify-prototype-fastlane-gate.mjs') fail('acceptance gate path drift');
if (contract.candidateAcceptance?.v112Decision !== 'FAIL_PROTOTYPE_FASTLANE_GATE') fail('V112 decision drift');
if (contract.candidateAcceptance?.baselineUpdateAllowedOnlyWhenGatePasses !== true) fail('baseline gate missing');
if (contract.candidateAcceptance?.physicalEmpalmeAllowedOnlyWhenGatePasses !== true) fail('empalme gate missing');
if (contract.plan?.[0] !== contract.activeBlock.id) fail('active block must be first remaining plan item');
if (contract.mandatoryCloseSections?.length !== 12) fail('mandatory close sections drift');

const requiredFailures = new Set([
  'manifest_literal_node_pass',
  'single_setProgram_definition',
  'project_and_period_have_independent_storage',
  'project_and_period_accessors_are_not_aliases',
  'period_selector_uses_validating_setter'
]);
const actualFailures = new Set(contract.candidateAcceptance?.v112Fail || []);
for (const item of requiredFailures) if (!actualFailures.has(item)) fail(`missing V112 gate failure: ${item}`);

for (const marker of [
  '# PHASE A — CHECKPOINT VIVO ÚNICO DE EJECUCIÓN TYA',
  '`R21_R23_FAST_AUDIT_AND_EMPALME_V113`',
  '## 6. Gate ejecutable y fail-closed',
  'V112: auditada y rechazada por gate',
  '37 diferencias',
  'dos definiciones de `setProgram()`',
  'No existe excepción manual para aceptar una candidata que falle.'
]) if (!doc.includes(marker)) fail(`missing checkpoint marker: ${marker}`);

const policy = contract.ciExecutionPolicy || {};
for (const field of ['oneFocusedWorkflowPerCandidate','pathAndBranchFiltersRequired','concurrencyCancelInProgressRequired','fastForwardIntegrationOnlyAfterGatePass','pr7NotUsedForCandidateDiagnosis']) {
  if (policy[field] !== true) fail(`candidate CI policy missing: ${field}`);
}

console.log(JSON.stringify({
  ok: true,
  decision: 'PASS_PHASE_A_CHECKPOINT_WITH_MACHINE_ENFORCED_CANDIDATE_GATE',
  activeBlock: contract.activeBlock.id,
  sourceLock: contract.baseline.sourceLock,
  continuity: contract.baseline.continuity,
  rejectedCandidate: contract.baseline.rejectedCandidate,
  nextCandidate: contract.baseline.nextCandidateRequested,
  failClosed: true,
  v112Failures: [...actualFailures]
}, null, 2));
