#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'app', 'contracts', 'submitido-hr-driven-phase-a.tya.contract.json');

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required file: ${path.relative(root, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const contract = readJson(contractPath);
  const issues = [];
  const warnings = [];

  const modes = contract.canonicalSubmitidoModes || [];
  const configFields = contract.projectSubmitidoConfigFields || {};
  const statuses = contract.allowedStatuses || [];
  const sourceTypes = contract.sourceTypes || [];
  const requiredFields = contract.submitidoRecordRequiredFields || [];
  const rules = contract.rules || [];
  const hardStops = contract.hardStops || [];

  for (const mode of ['hr_driven', 'external_system', 'platform_review', 'manual_admin_hr_confirmed']) {
    if (!modes.includes(mode)) issues.push(`Missing canonical submitido mode: ${mode}`);
  }

  if (!configFields.mode?.required) issues.push('Project submitido config does not require mode.');
  if (!Array.isArray(configFields.hrFieldCandidates?.defaultCandidates) || !configFields.hrFieldCandidates.defaultCandidates.length) {
    issues.push('Missing HR submitido field candidates.');
  }
  if (!Array.isArray(configFields.questionnaireCompletedFieldCandidates?.defaultCandidates) || !configFields.questionnaireCompletedFieldCandidates.defaultCandidates.length) {
    issues.push('Missing questionnaire completed field candidates.');
  }

  for (const field of ['tenantId', 'projectId', 'visitId', 'assignmentId', 'shopperId', 'status', 'source', 'submitidoMode']) {
    if (!requiredFields.includes(field)) issues.push(`Missing submitido required field: ${field}`);
  }

  for (const status of ['pending_hr_submitido', 'submitido_registered', 'submitido_conflict', 'manual_confirmation_required']) {
    if (!statuses.includes(status)) warnings.push(`Recommended status not present: ${status}`);
  }

  for (const source of ['hr', 'external_system', 'platform_review', 'admin_confirmed_hr']) {
    if (!sourceTypes.includes(source)) warnings.push(`Recommended source type not present: ${source}`);
  }

  const separatesQuestionnaire = rules.some((rule) => /not enough to set submitido_registered/i.test(rule));
  if (!separatesQuestionnaire) issues.push('Missing rule separating questionnaireCompletedAt from submitido_registered.');

  const noFutureSubmitido = rules.some((rule) => /must not be in the future/i.test(rule));
  if (!noFutureSubmitido) issues.push('Missing rule blocking future submitidoAt.');

  const noMake = hardStops.some((rule) => /Make/i.test(rule));
  const noHrWrite = hardStops.some((rule) => /write HR/i.test(rule));
  const noFirestoreWrite = hardStops.some((rule) => /write Firestore/i.test(rule));
  if (!noMake) issues.push('Missing hard stop for Make calls.');
  if (!noHrWrite) issues.push('Missing hard stop for HR writes.');
  if (!noFirestoreWrite) issues.push('Missing hard stop for Firestore writes.');

  const report = {
    validator: 'tya-submitido-hr-driven-validator',
    status: issues.length ? 'review_required' : 'contract_ready_for_safe_preview_mapping',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    hrWritesAllowed: false,
    makeWriteAllowed: false,
    fileChecked: path.relative(root, contractPath),
    modes,
    defaultModeForTyaCinepolis: contract.defaultModeForTyaCinepolis,
    statuses,
    sourceTypes,
    requiredFields,
    issues,
    warnings,
    nextSafeSteps: [
      'Map V79 project settings to submitido.mode without changing frontend yet.',
      'Use this contract as dependency for liquidation/payment readiness.',
      'Do not run HR/Firestore/Make writes until Paula explicitly authorizes DEV runtime.'
    ]
  };

  console.log(JSON.stringify(report, null, 2));
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({
    validator: 'tya-submitido-hr-driven-validator',
    status: 'error',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    hrWritesAllowed: false,
    makeWriteAllowed: false,
    error: error.message
  }, null, 2));
  process.exitCode = 1;
}
