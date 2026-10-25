#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'app', 'contracts', 'project-wizard-phase-a.tya.contract.json');

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required file: ${path.relative(root, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function get(obj, pathParts) {
  return pathParts.reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

function main() {
  const contract = readJson(contractPath);
  const issues = [];
  const warnings = [];
  const must = contract.mustCreateProjectWith || {};

  const requiredSections = [
    'identity',
    'scope',
    'hrSource',
    'questionnaire',
    'review',
    'submitido',
    'certification',
    'documents',
    'scheduling',
    'payments',
    'integrations'
  ];

  for (const section of requiredSections) {
    if (!must[section]) issues.push(`Missing wizard section: ${section}`);
    if (!Array.isArray(must[section]?.required) || !must[section].required.length) {
      issues.push(`Wizard section without required fields: ${section}`);
    }
  }

  const qModes = must.questionnaire?.allowedModes || [];
  for (const mode of ['interna', 'externo_general', 'externo_visita']) {
    if (!qModes.includes(mode)) issues.push(`Missing questionnaire mode: ${mode}`);
  }

  const submitidoModes = must.submitido?.allowedModes || [];
  for (const mode of ['hr_driven', 'external_system', 'platform_review', 'manual_admin_hr_confirmed']) {
    if (!submitidoModes.includes(mode)) issues.push(`Missing submitido mode: ${mode}`);
  }

  const gateStates = must.integrations?.allowedGateStates || [];
  for (const state of ['off', 'prepared', 'blocked', 'requires_authorization', 'preview_only']) {
    if (!gateStates.includes(state)) issues.push(`Missing integration gate state: ${state}`);
  }

  const steps = contract.minimumWizardSteps || [];
  for (const step of [
    'project_identity',
    'hr_source',
    'questionnaire_origin',
    'admin_review',
    'submitido_origin',
    'payments_liquidations',
    'integrations_gates'
  ]) {
    if (!steps.includes(step)) warnings.push(`Recommended wizard step not declared: ${step}`);
  }

  const hardStops = contract.hardStops || [];
  for (const pattern of ['runtime', 'Firestore', 'import HR', 'Make', 'hard-code']) {
    if (!hardStops.some((stop) => stop.includes(pattern))) {
      issues.push(`Missing hard stop containing: ${pattern}`);
    }
  }

  const report = {
    validator: 'tya-project-wizard-phase-a-validator',
    status: issues.length ? 'review_required' : 'contract_ready_for_frontend_mapping',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    fileChecked: path.relative(root, contractPath),
    requiredSections,
    minimumWizardSteps: steps,
    questionnaireModes: qModes,
    submitidoModes,
    integrationGateStates: gateStates,
    issues,
    warnings,
    nextSafeSteps: [
      'Map V79 project wizard fields to this Phase A configuration contract.',
      'Let Claude implement visible UI/config only, without touching backend contracts or activating integrations.',
      'Use this contract later as input for CX.data adapter mapping when backend runtime is authorized.'
    ]
  };

  console.log(JSON.stringify(report, null, 2));
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({
    validator: 'tya-project-wizard-phase-a-validator',
    status: 'error',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    error: error.message
  }, null, 2));
  process.exitCode = 1;
}
