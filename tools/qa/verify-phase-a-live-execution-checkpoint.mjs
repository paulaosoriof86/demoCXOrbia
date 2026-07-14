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
  'version',
  'updatedAt',
  'repository',
  'branch',
  'pullRequest',
  'baseline',
  'objective',
  'activeBlock',
  'plan',
  'completedEvidence',
  'mandatoryCloseSections',
  'readPolicy',
  'classificationRequired',
  'gates'
];

for (const key of requiredTopLevel) {
  if (!(key in contract)) fail(`missing contract key: ${key}`);
}

if (contract.repository !== 'paulaosoriof86/demoCXOrbia') fail('unexpected repository');
if (contract.branch !== 'docs-tya-v6-v71-audit') fail('unexpected branch');
if (contract.pullRequest !== 7) fail('unexpected pull request');
if (contract.baseline?.frontend !== 'V110') fail('V110 must remain the frontend baseline');
if (contract.baseline?.r17Role !== 'no_go_evidence_only') fail('R17 must remain evidence only');
if (contract.activeBlock?.id !== 'R18_BACKEND_CANONICAL_HR_MAPPING') fail('active block drift detected');
if (contract.activeBlock?.status !== 'ready') fail('active block is not ready');
if (!Array.isArray(contract.plan) || contract.plan.length < 10) fail('Phase A plan is incomplete');
if (contract.plan[0] !== contract.activeBlock.id) fail('active block must be the first remaining plan item');
if (!Array.isArray(contract.mandatoryCloseSections) || contract.mandatoryCloseSections.length !== 12) {
  fail('mandatory close report must have exactly 12 sections');
}

const requiredDocMarkers = [
  '# PHASE A — CHECKPOINT VIVO ÚNICO DE EJECUCIÓN TYA',
  '## 2. Objetivo único vigente',
  '## 5. Bloque activo único',
  '`R18_BACKEND_CANONICAL_HR_MAPPING`',
  '## 6. Plan de trabajo restante Phase A',
  '## 7. Control de tiempo y agilidad',
  '## 8. Cierre obligatorio de cada iteración',
  '## 9. Regla para nuevas conversaciones',
  '## 10. Clasificación obligatoria del bloque R18',
  '## 11. Estado al crear este checkpoint'
];

for (const marker of requiredDocMarkers) {
  if (!doc.includes(marker)) fail(`missing checkpoint marker: ${marker}`);
}

const forbiddenDrift = [
  'R17 como nueva baseline frontend',
  'submitido equivale a liquidada',
  'submitido equivale a pagada',
  'producción: GO'
];
for (const marker of forbiddenDrift) {
  if (doc.toLowerCase().includes(marker.toLowerCase())) fail(`forbidden drift text found: ${marker}`);
}

const result = {
  ok: true,
  decision: 'PASS_PHASE_A_LIVE_EXECUTION_CHECKPOINT',
  activeBlock: contract.activeBlock.id,
  remainingBlocks: contract.plan.length,
  closeSections: contract.mandatoryCloseSections.length,
  productionGate: contract.gates.production,
  baseline: contract.baseline.frontend,
  r17Role: contract.baseline.r17Role
};

console.log(JSON.stringify(result, null, 2));
