#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'app', 'contracts', 'admin-review-phase-a.tya.contract.json');

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required file: ${path.relative(root, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function unique(values) {
  return [...new Set(values)];
}

function main() {
  const contract = readJson(contractPath);
  const issues = [];
  const warnings = [];

  const allowedStatuses = contract.allowedStatuses || [];
  const terminalStatuses = contract.terminalStatuses || [];
  const actions = contract.actions || [];
  const requiredFields = contract.reviewRecordRequiredFields || [];
  const phaseARules = contract.phaseARules || [];
  const hardStops = contract.hardStops || [];

  for (const field of ['tenantId', 'projectId', 'visitId', 'assignmentId', 'shopperId', 'status']) {
    if (!requiredFields.includes(field)) issues.push(`Missing required review field: ${field}`);
  }

  for (const status of terminalStatuses) {
    if (!allowedStatuses.includes(status)) issues.push(`Terminal status is not in allowedStatuses: ${status}`);
  }

  for (const action of actions) {
    if (!action.action) issues.push('Action without action name.');
    if (!allowedStatuses.includes(action.to)) issues.push(`Action ${action.action} points to unknown status: ${action.to}`);
    for (const fromStatus of action.from || []) {
      if (!allowedStatuses.includes(fromStatus)) issues.push(`Action ${action.action} starts from unknown status: ${fromStatus}`);
    }
    if (action.writesAllowedNow !== false) {
      issues.push(`Action ${action.action} is not explicitly blocked from writes.`);
    }
    if (!Array.isArray(action.actorRoles) || !action.actorRoles.length) {
      issues.push(`Action ${action.action} does not define actorRoles.`);
    }
  }

  const actionsByTo = actions.reduce((acc, action) => {
    acc[action.to] = acc[action.to] || [];
    acc[action.to].push(action.action);
    return acc;
  }, {});

  for (const mustHave of ['in_review', 'needs_correction', 'approved_for_submitido', 'submitido_registered', 'hr_conflict', 'rejected']) {
    if (!actionsByTo[mustHave]) warnings.push(`No action transitions into status: ${mustHave}`);
  }

  const hasQuestionnaireNotSubmitidoRule = phaseARules.some((rule) =>
    /questionnaire completed does not equal submitido/i.test(rule)
  );
  if (!hasQuestionnaireNotSubmitidoRule) {
    issues.push('Missing rule separating questionnaire completed from submitido.');
  }

  const hasNoMakeHardStop = hardStops.some((rule) => /Make/i.test(rule));
  if (!hasNoMakeHardStop) issues.push('Missing hard stop for Make calls.');

  const allRoles = unique(actions.flatMap((action) => action.actorRoles || [])).sort();

  const report = {
    validator: 'tya-admin-review-contract-validator',
    status: issues.length ? 'review_required' : 'contract_ready_for_safe_preview_mapping',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    makeWriteAllowed: false,
    fileChecked: path.relative(root, contractPath),
    allowedStatuses,
    terminalStatuses,
    actions: actions.map((action) => ({
      action: action.action,
      from: action.from,
      to: action.to,
      writesAllowedNow: action.writesAllowedNow
    })),
    actorRoles: allRoles,
    issues,
    warnings,
    nextSafeSteps: [
      'Map current V79 admin review UI labels to this canonical state machine without changing modules yet.',
      'Prepare submitido HR-driven configurable contract as the next dependency.',
      'Only after Paula authorizes DEV runtime, validate these transitions against emulator/test data.'
    ]
  };

  console.log(JSON.stringify(report, null, 2));
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({
    validator: 'tya-admin-review-contract-validator',
    status: 'error',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    makeWriteAllowed: false,
    error: error.message
  }, null, 2));
  process.exitCode = 1;
}
