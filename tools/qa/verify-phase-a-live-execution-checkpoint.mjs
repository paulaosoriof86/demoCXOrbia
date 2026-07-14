#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'backend/contracts/phase-a-live-execution-checkpoint-v1.json');
const docPath = path.join(root, 'app/docs/PHASE-A-LIVE-EXECUTION-CHECKPOINT-TYA-20260713.md');

function fail(message) {
  console.error(`CHECKPOINT_FAIL: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(contractPath)) fail(`missing contract: ${contractPath}`);
if (!fs.existsSync(docPath)) fail(`missing live checkpoint: ${docPath}`);

let contract;
try {
  contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
} catch (error) {
  fail(`invalid JSON: ${error.message}`);
}

const doc = fs.readFileSync(docPath, 'utf8');
const requiredTopLevel = [
  'version','updatedAt','repository','branch','pullRequest','baseline','objective',
  'parallelLanes','activeBlock','plan','completedEvidence','notReopened',
  'fastLaneCandidateAuditPolicy','ciExecutionPolicy','mandatoryCloseSections',
  'readPolicy','classificationRequired','gates'
];
for (const key of requiredTopLevel) if (!(key in contract)) fail(`missing contract key: ${key}`);

if (contract.repository !== 'paulaosoriof86/demoCXOrbia') fail('unexpected repository');
if (contract.branch !== 'docs-tya-v6-v71-audit') fail('unexpected branch');
if (contract.pullRequest !== 7) fail('unexpected pull request');
if (contract.baseline?.sourceLockFrontend !== 'V110') fail('V110 source lock drift');
if (contract.baseline?.continuityFrontend !== 'V111') fail('V111 continuity baseline drift');
if (contract.baseline?.continuityDecision !== 'audited_usable_not_final_source_lock') fail('V111 continuity decision drift');
if (contract.baseline?.claudeCorrectiveRequested !== 'V112') fail('V112 corrective request missing');
if (contract.baseline?.r17Role !== 'no_go_evidence_only') fail('R17 must remain evidence only');

const activeId = String(contract.activeBlock?.id || '');
const allowedStatuses = new Set(['ready','in_progress','blocked_external_iam','waiting_external','waiting_external_input','awaiting_candidate']);
if (!activeId) fail('missing active block id');
if (!allowedStatuses.has(contract.activeBlock?.status)) fail(`unsupported active block status: ${contract.activeBlock?.status}`);
if (!Array.isArray(contract.plan) || contract.plan.length < 5) fail('Phase A plan is incomplete');
if (contract.plan[0] !== activeId) fail('active block must be the first remaining plan item');
if (!Array.isArray(contract.mandatoryCloseSections) || contract.mandatoryCloseSections.length !== 12) fail('mandatory close report must have exactly 12 sections');

const evidence = contract.completedEvidence || {};
if (evidence.v111Audited !== true || evidence.v111ContinuityBaseline !== true) fail('V111 audit/continuity evidence missing');
if (evidence.v111ManifestNodeVerified !== true || evidence.v111ManifestDifferences !== 0) fail('V111 manifest evidence drift');
if (evidence.v112RequestedFromClaude !== true || evidence.v111RemainingFocusedGaps !== 3) fail('V112 focused corrective evidence drift');
if (evidence.r18aCanonicalIntegration !== 'PASS') fail('R18A PASS evidence drift');
if (evidence.r18bExistingOverlays !== 'PASS') fail('R18B PASS evidence drift');
if (evidence.financialExactLinksR14C !== 196) fail('R14C exact-link evidence drift');
if (evidence.shopperIdentitiesInvented !== 0) fail('shopper identity invention drift');
if (evidence.paidConfirmedOrInferred !== 0) fail('payment inference drift');

const requiredDocMarkers = [
  '# PHASE A — CHECKPOINT VIVO ÚNICO DE EJECUCIÓN TYA',
  '## 2. Objetivo único vigente',
  '## 3. Baseline y carriles paralelos',
  'V111 queda como **baseline auditada de continuidad backend**',
  '## 5. Bloque activo único',
  '`R21_R23_FAST_AUDIT_AND_EMPALME_V112`',
  '## 6. Metodología fast-lane obligatoria',
  '## 7. Diagnóstico de demora corregido',
  '## 8. Plan restante Phase A',
  '## 9. Control de tiempo y agilidad',
  '## 10. Cierre obligatorio de cada iteración',
  '## 11. Clasificación vigente',
  '## 12. Estado de producción y gates'
];
for (const marker of requiredDocMarkers) if (!doc.includes(marker)) fail(`missing checkpoint marker: ${marker}`);

const requiredNoReworkMarkers = [
  'Normalización de fechas Excel/ISO existente y aplicada',
  'R11D aplicado como un solo conflicto source-level',
  'R14C: 196 enlaces financieros exactos aplicados',
  'No se reabren:',
  'manifest V111',
  'login/título/país V111'
];
for (const marker of requiredNoReworkMarkers) if (!doc.includes(marker)) fail(`anti-rework marker missing: ${marker}`);

const fast = contract.fastLaneCandidateAuditPolicy || {};
if (fast.baselineRule !== 'latest_audited_usable_candidate_becomes_continuity_baseline_even_if_not_final_source_lock') fail('fast-lane baseline rule drift');
if (fast.documentationTiming !== 'one_batch_after_technical_decision') fail('fast-lane documentation timing drift');
if (fast.unrelatedWorkflowWait !== false || fast.fullPrAudit !== false) fail('fast-lane scope drift');
if (!Array.isArray(fast.decisionOutputs) || !fast.decisionOutputs.includes('go_and_empalme')) fail('fast-lane GO/empalme decision missing');

const policy = contract.ciExecutionPolicy || {};
for (const field of [
  'oneFocusedWorkflowPerBlock','pathAndBranchFiltersRequired','concurrencyCancelInProgressRequired',
  'fastForwardIntegrationOnlyAfterDecision','providerBlockMustNotBeReportedAsGithubFailure','batchCommitsBeforeIntegration'
]) {
  if (policy[field] !== true) fail(`focused CI policy missing: ${field}`);
}

const forbiddenDrift = [
  'R17 como nueva baseline frontend',
  'submitido equivale a liquidada',
  'submitido equivale a pagada',
  'producción: GO',
  'reutilizar cxorbia-backend-dev',
  'V111 pendiente de entrega y auditoría'
];
for (const marker of forbiddenDrift) if (doc.toLowerCase().includes(marker.toLowerCase())) fail(`forbidden drift text found: ${marker}`);

const result = {
  ok: true,
  decision: 'PASS_PHASE_A_FAST_LANE_V112_CHECKPOINT',
  activeBlock: activeId,
  activeStatus: contract.activeBlock.status,
  sourceLockFrontend: contract.baseline.sourceLockFrontend,
  continuityFrontend: contract.baseline.continuityFrontend,
  claudeCorrectiveRequested: contract.baseline.claudeCorrectiveRequested,
  remainingBlocks: contract.plan.length,
  closeSections: contract.mandatoryCloseSections.length,
  productionGate: contract.gates.production,
  fastLaneCandidateAudit: true,
  focusedCiPolicy: true,
  providerBlockClassifiedSeparately: true,
  antiRework: true
};
console.log(JSON.stringify(result, null, 2));
