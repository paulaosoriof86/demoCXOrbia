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
  'ciExecutionPolicy','mandatoryCloseSections','readPolicy','classificationRequired','gates'
];
for (const key of requiredTopLevel) if (!(key in contract)) fail(`missing contract key: ${key}`);

if (contract.repository !== 'paulaosoriof86/demoCXOrbia') fail('unexpected repository');
if (contract.branch !== 'docs-tya-v6-v71-audit') fail('unexpected branch');
if (contract.pullRequest !== 7) fail('unexpected pull request');
if (contract.baseline?.frontend !== 'V110') fail('V110 must remain baseline until V111 audit/empalme');
if (contract.baseline?.claudeCandidateRequested !== 'V111') fail('V111 request status missing');
if (contract.baseline?.r17Role !== 'no_go_evidence_only') fail('R17 must remain evidence only');

const activeId = String(contract.activeBlock?.id || '');
const allowedStatuses = new Set(['ready','in_progress','blocked_external_iam','waiting_external','awaiting_candidate']);
if (!activeId) fail('missing active block id');
if (!allowedStatuses.has(contract.activeBlock?.status)) fail(`unsupported active block status: ${contract.activeBlock?.status}`);
if (!Array.isArray(contract.plan) || contract.plan.length < 5) fail('Phase A plan is incomplete');
if (contract.plan[0] !== activeId) fail('active block must be the first remaining plan item');
if (!Array.isArray(contract.mandatoryCloseSections) || contract.mandatoryCloseSections.length !== 12) fail('mandatory close report must have exactly 12 sections');

const evidence = contract.completedEvidence || {};
if (evidence.r18aCanonicalIntegration !== 'PASS') fail('R18A PASS evidence drift');
if (evidence.r18bExistingOverlays !== 'PASS') fail('R18B PASS evidence drift');
if (evidence.financialExactLinksR14C !== 196 || evidence.financialExactLinksAppliedR18B !== 196) fail('R14C exact-link evidence drift');
if (evidence.shopperIdentitiesInvented !== 0) fail('shopper identity invention drift');
if (evidence.paidConfirmedOrInferred !== 0) fail('payment inference drift');

const requiredDocMarkers = [
  '# PHASE A — CHECKPOINT VIVO ÚNICO DE EJECUCIÓN TYA',
  '## 2. Objetivo único vigente',
  '## 4. Estado real alcanzado y que no se reabre',
  '## 5. Bloque activo único',
  `\`${activeId}\``,
  '## 6. Diagnóstico de los aparentes bloqueos GitHub',
  '## 7. Política CI aplicada desde R24',
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
  'normalizador de fechas',
  'R14C'
];
for (const marker of requiredNoReworkMarkers) if (!doc.includes(marker)) fail(`anti-rework marker missing: ${marker}`);

const policy = contract.ciExecutionPolicy || {};
for (const field of [
  'oneFocusedWorkflowPerBlock','pathAndBranchFiltersRequired','concurrencyCancelInProgressRequired',
  'fastForwardIntegrationOnlyAfterDecision','providerBlockMustNotBeReportedAsGithubFailure','batchCommitsBeforeIntegration'
]) {
  if (policy[field] !== true) fail(`focused CI policy missing: ${field}`);
}

if (activeId === 'R24_NEW_EMPTY_FIREBASE_DEV') {
  const blocker = contract.activeBlock?.blocker || {};
  if (contract.activeBlock.status !== 'blocked_external_iam') fail('R24 current status must reflect external IAM blocker');
  if (blocker.githubBlocked !== false || blocker.providerBlocked !== true) fail('R24 GitHub/provider blocker classification drift');
  if (blocker.projectCreated !== false || blocker.existingDatabaseReused !== false) fail('R24 safe-state drift');
  if (evidence.r24WorkflowConclusion !== 'success' || evidence.r24GithubBlocked !== false || evidence.r24ProviderBlocked !== true) fail('R24 workflow evidence drift');
}

const forbiddenDrift = [
  'R17 como nueva baseline frontend',
  'submitido equivale a liquidada',
  'submitido equivale a pagada',
  'producción: GO',
  'reutilizar cxorbia-backend-dev'
];
for (const marker of forbiddenDrift) if (doc.toLowerCase().includes(marker.toLowerCase())) fail(`forbidden drift text found: ${marker}`);

const result = {
  ok: true,
  decision: 'PASS_PHASE_A_LIVE_EXECUTION_CHECKPOINT_DYNAMIC',
  activeBlock: activeId,
  activeStatus: contract.activeBlock.status,
  remainingBlocks: contract.plan.length,
  closeSections: contract.mandatoryCloseSections.length,
  productionGate: contract.gates.production,
  baseline: contract.baseline.frontend,
  claudeCandidateRequested: contract.baseline.claudeCandidateRequested,
  r17Role: contract.baseline.r17Role,
  focusedCiPolicy: true,
  providerBlockClassifiedSeparately: true,
  antiRework: true
};
console.log(JSON.stringify(result, null, 2));
