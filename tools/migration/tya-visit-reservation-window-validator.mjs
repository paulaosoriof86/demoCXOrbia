#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'app', 'contracts', 'visit-reservation-window-phase-a.tya.contract.json');

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const contract = readJson(contractPath);
  const issues = [];
  const warnings = [];

  for (const flag of ['runtimeEnabled', 'productionAllowed', 'firestoreWritesAllowed', 'makeWriteAllowed', 'hrWriteAllowed']) {
    if (contract[flag] !== false) issues.push(`${flag} must remain false`);
  }

  const stableKeys = contract.stableKeys || [];
  for (const key of ['tenantId', 'projectId', 'visitId', 'hrRowId', 'reservationId', 'shopperId', 'quincena', 'franja', 'availableFrom', 'proposedDate', 'scheduledAt', 'reservationStatus', 'scheduleValidationStatus']) {
    if (!stableKeys.includes(key)) issues.push(`Missing stable key: ${key}`);
  }

  const reservationStatuses = contract.reservationStatuses || [];
  for (const status of ['reserved_pending_schedule', 'reserved_with_proposed_date', 'scheduled_confirmed', 'reschedule_requested', 'conflict_review_required']) {
    if (!reservationStatuses.includes(status)) issues.push(`Missing reservation status: ${status}`);
  }

  const validationStatuses = contract.scheduleValidationStatuses || [];
  for (const status of ['valid', 'before_available_from', 'outside_franja', 'outside_quincena', 'override_required', 'override_approved', 'override_rejected']) {
    if (!validationStatuses.includes(status)) issues.push(`Missing schedule validation status: ${status}`);
  }

  const franjaRules = contract.franjaRules || {};
  if (!franjaRules.WK?.allowedDays?.length) issues.push('Missing WK allowed days');
  if (!franjaRules.WKND?.allowedDays?.length) issues.push('Missing WKND allowed days');

  const quincenaRules = contract.quincenaRules || {};
  if (!quincenaRules.Q1?.allowedDayRange) issues.push('Missing Q1 allowed day range');
  if (!quincenaRules.Q2?.allowedDayRange) issues.push('Missing Q2 allowed day range');

  const override = contract.overrideApproval || {};
  for (const field of ['authorizedBy', 'authorizedReason', 'failedRules', 'overrideScope', 'scoreImpactDecision']) {
    if (!override.requiredFields?.includes(field)) issues.push(`Missing override field: ${field}`);
  }

  const score = contract.shopperScoreImpact || {};
  if (!score.rules?.some((rule) => rule.includes('Do not reduce score automatically'))) {
    issues.push('Missing no automatic shopper score reduction rule');
  }

  const actions = contract.actions || {};
  for (const actionName of ['reserveVisitFromPostulation', 'scheduleVisit', 'requestReschedule', 'approveOutOfWindow', 'rejectOutOfWindow']) {
    if (!actions[actionName]) issues.push(`Missing action: ${actionName}`);
    if (actions[actionName]?.writesAllowedNow !== false) issues.push(`Action must stay disabled: ${actionName}`);
  }

  const hardStops = contract.hardStops || [];
  for (const phrase of ['Do not call Make', 'Do not write HR', 'Do not write Firestore', 'Do not auto-penalize', 'Do not allow out-of-window approval']) {
    if (!hardStops.some((stop) => stop.includes(phrase))) issues.push(`Missing hard stop: ${phrase}`);
  }

  const academy = contract.academyImpact || {};
  if (!Array.isArray(academy.roles) || !academy.roles.includes('ops')) warnings.push('Academy impact should include ops role');
  if (!Array.isArray(academy.newLessons) || !academy.newLessons.some((lesson) => lesson.includes('franja'))) warnings.push('Academy should include franja lesson');

  const report = {
    validator: 'tya-visit-reservation-window-validator',
    status: issues.length ? 'review_required' : 'reservation_window_contract_ready_for_safe_mapping',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    makeWriteAllowed: false,
    hrWriteAllowed: false,
    fileChecked: path.relative(root, contractPath),
    reservationStatuses,
    scheduleValidationStatuses: validationStatuses,
    franjaRules,
    quincenaRules,
    overrideRequiredFields: override.requiredFields || [],
    shopperScoreImpact: score,
    issues,
    warnings,
    nextSafeSteps: [
      'Map postulation proposed date, scheduling and rescheduling UI to this contract without enabling writes.',
      'Prepare preview validation for availableFrom, franja and quincena.',
      'Create a separate shopper scoring contract before any score impact is applied.',
      'Update Academy manuals and lessons for reservation, franja and override approvals.'
    ]
  };

  console.log(JSON.stringify(report, null, 2));
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({
    validator: 'tya-visit-reservation-window-validator',
    status: 'error',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    error: error.message
  }, null, 2));
  process.exitCode = 1;
}
