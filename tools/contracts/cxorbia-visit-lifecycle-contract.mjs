#!/usr/bin/env node
/*
  CXOrbia - Visit lifecycle contract validator
  Preview-only contract. No provider calls, no database writes, no imports, no deploy.

  Purpose:
  Validate the shape of visit lifecycle actions before any real backend
  implementation. Covers availability, reservation, scheduling, rescheduling,
  realization, questionnaire completion and submit review gates.
*/

const actions = new Set([
  'preview_availability',
  'request_reservation',
  'request_schedule',
  'request_reschedule',
  'request_cancel',
  'mark_realized_preview',
  'mark_questionnaire_completed_preview',
  'mark_submit_review_preview',
  'export_visit_lifecycle_report'
]);

const roles = new Set([
  'superadmin',
  'admin',
  'ops',
  'shopper',
  'technical_reviewer'
]);

const allowedAssignmentSources = new Set([
  'platform',
  'hr',
  'import_preview',
  'manual_review'
]);

const allowedFranja = new Set(['WK', 'WKND', 'ANY', 'PROJECT_DEFINED']);
const allowedQuincena = new Set(['Q1', 'Q2', 'ANY', 'PROJECT_DEFINED']);

const statusByAction = {
  preview_availability: 'availability_preview',
  request_reservation: 'reservation_review_required',
  request_schedule: 'schedule_review_required',
  request_reschedule: 'reschedule_review_required',
  request_cancel: 'cancel_review_required',
  mark_realized_preview: 'realized_preview',
  mark_questionnaire_completed_preview: 'questionnaire_completed_preview',
  mark_submit_review_preview: 'submit_review_preview',
  export_visit_lifecycle_report: 'report_ready'
};

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function looksLikeIsoDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function validate(payload) {
  const errors = [];
  const warnings = [];
  const p = payload && typeof payload === 'object' ? payload : {};

  if (!hasText(p.tenantId)) errors.push('tenantId_required');
  if (!hasText(p.projectId)) errors.push('projectId_required');
  if (!hasText(p.visitId)) errors.push('visitId_required');
  if (!hasText(p.action) || !actions.has(p.action)) errors.push('unsupported_action');
  if (!hasText(p.actorRole) || !roles.has(p.actorRole)) errors.push('unsupported_actor_role');
  if (!hasText(p.auditRef)) errors.push('auditRef_required');

  if (p.assignmentSource && !allowedAssignmentSources.has(p.assignmentSource)) {
    errors.push('unsupported_assignment_source');
  }

  if (p.franja && !allowedFranja.has(p.franja)) errors.push('unsupported_franja');
  if (p.quincena && !allowedQuincena.has(p.quincena)) errors.push('unsupported_quincena');

  const dateActions = new Set([
    'request_schedule',
    'request_reschedule',
    'mark_realized_preview',
    'mark_questionnaire_completed_preview',
    'mark_submit_review_preview'
  ]);

  if (dateActions.has(p.action) && !looksLikeIsoDate(p.visitDate)) {
    errors.push('visitDate_required_iso_yyyy_mm_dd');
  }

  if (p.action === 'request_reservation' && !hasText(p.shopperId)) {
    errors.push('shopperId_required_for_reservation');
  }

  if (p.action === 'request_cancel' && !hasText(p.reason)) {
    errors.push('reason_required_for_cancel');
  }

  if (p.action === 'request_reschedule' && !hasText(p.reason)) {
    errors.push('reason_required_for_reschedule');
  }

  if (p.action === 'mark_questionnaire_completed_preview' && p.submitDate) {
    warnings.push('submitDate_should_not_be_set_when_only_questionnaire_completed');
  }

  if (p.action === 'mark_submit_review_preview' && !looksLikeIsoDate(p.submitDate)) {
    errors.push('submitDate_required_for_submit_review');
  }

  if (p.execute === true) {
    errors.push('execute_not_allowed_preview_contract_only');
  }

  if (p.writeToHr === true || p.writeToDatabase === true || p.notifyReal === true) {
    errors.push('real_side_effects_not_allowed');
  }

  return {
    contract: 'cxorbia-visit-lifecycle',
    version: 'phase-a-preview-20260708',
    generatedAt: new Date().toISOString(),
    action: p.action || null,
    tenantId: p.tenantId || null,
    projectId: p.projectId || null,
    visitId: p.visitId || null,
    shopperId: p.shopperId || null,
    verdict: errors.length ? 'NO_GO_CONTRACT' : 'GO_PREVIEW_ONLY',
    status: errors.length ? 'blocked_gate' : (statusByAction[p.action] || 'preview_ready'),
    errors,
    warnings,
    stableKeys: ['tenantId', 'projectId', 'visitId', 'shopperId', 'assignmentSource'],
    safeState: {
      deploy: false,
      production: false,
      providerCalls: false,
      hrWrites: false,
      databaseWrites: false,
      imports: false,
      notifications: false
    }
  };
}

function main() {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { input += chunk; });
  process.stdin.on('end', () => {
    let payload;
    try {
      payload = JSON.parse(input.trim() || '{}');
    } catch {
      console.log(JSON.stringify({
        contract: 'cxorbia-visit-lifecycle',
        verdict: 'NO_GO_CONTRACT',
        errors: ['invalid_json'],
        safeState: { deploy: false, production: false, providerCalls: false, hrWrites: false, databaseWrites: false, imports: false }
      }, null, 2));
      process.exitCode = 1;
      return;
    }

    const result = validate(payload);
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.errors.length ? 1 : 0;
  });
}

main();
