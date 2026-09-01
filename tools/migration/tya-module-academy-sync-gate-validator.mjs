#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'app', 'contracts', 'module-academy-sync-gate.tya.contract.json');

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const contract = readJson(contractPath);
  const issues = [];
  const warnings = [];

  const checklist = contract.requiredChecklistPerModuleChange || [];
  const mustHave = [
    'affectedRolesListed',
    'manualsImpactReviewed',
    'coursesImpactReviewed',
    'roleLearningPathImpactReviewed',
    'pendientesPrototipoUpdated',
    'resumenParaClaudeUpdatedOrAddendumCreated',
    'cambiosBackendUpdatedOrAddendumCreated'
  ];

  for (const item of mustHave) {
    if (!checklist.includes(item)) issues.push(`Missing checklist item: ${item}`);
  }

  const roles = contract.rolesToCheck || [];
  for (const role of ['super', 'admin', 'ops', 'shopper', 'client', 'consultant_partner']) {
    if (!roles.includes(role)) issues.push(`Missing role to check: ${role}`);
  }

  const assets = contract.academyAssetsToReview || [];
  for (const asset of ['roleLearningPaths', 'moduleManuals', 'stepByStepGuides', 'trainingRequestTopics']) {
    if (!assets.includes(asset)) warnings.push(`Recommended Academy asset not listed: ${asset}`);
  }

  const template = contract.moduleReviewTemplateRequiredFields || [];
  for (const field of ['moduleName', 'filesChanged', 'affectedRoles', 'academyManualsToUpdate', 'academyCoursesToUpdate', 'documentationStatus']) {
    if (!template.includes(field)) issues.push(`Missing module review template field: ${field}`);
  }

  const report = {
    validator: 'tya-module-academy-sync-gate-validator',
    status: issues.length ? 'review_required' : 'academy_sync_gate_ready',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    fileChecked: path.relative(root, contractPath),
    checklistItems: checklist.length,
    rolesToCheck: roles,
    academyAssetsToReview: assets,
    issues,
    warnings,
    nextSafeSteps: [
      'Use this gate in every module-by-module backend review.',
      'When a module changes, update manuals, courses and role learning paths or record why no update is needed.',
      'Keep RESUMEN-PARA-CLAUDE, PENDIENTES-PROTOTIPO and CAMBIOS-BACKEND/addendum aligned.'
    ]
  };

  console.log(JSON.stringify(report, null, 2));
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({
    validator: 'tya-module-academy-sync-gate-validator',
    status: 'error',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    error: error.message
  }, null, 2));
  process.exitCode = 1;
}
