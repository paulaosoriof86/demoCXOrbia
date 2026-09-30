#!/usr/bin/env node
/*
  CXOrbia - Settlement eligibility contract validator
  Preview-only contract. No provider calls, no database writes, no payments, no imports, no deploy.

  Purpose:
  Validate whether a visit can be included in a settlement/payment batch only
  after the required operational gates are satisfied. This is not a payment
  engine and never confirms real payment.
*/

const actions = new Set([
  'preview_settlement_eligibility',
  'request_add_to_batch',
  'request_remove_from_batch',
  'request_batch_recalculation',
  'request_payment_status_review',
  'mark_payment_prepared_preview',
  'mark_payment_confirmed_review',
  'export_settlement_report'
]);

const roles = new Set([
  'superadmin',
  'admin',
  'finance',
  'ops',
  'technical_reviewer'
]);

const visitStatuses = new Set([
  'available',
  'reserved',
  'scheduled',
  'rescheduled',
  'cancelled',
  'realized',
  'questionnaire_completed',
  'submit_reviewed',
  'submitted'
]);

const paymentStatuses = new Set([
  'not_eligible',
  'eligible_preview',
  'batch_review_required',
  'prepared_preview',
  'confirmed_review_required',
  'paid_confirmed',
  'blocked_gate'
]);

const statusByAction = {
  preview_settlement_eligibility: 'eligible_preview',
  request_add_to_batch: 'batch_review_required',
  request_remove_from_batch: 'batch_review_required',
  request_batch_recalculation: 'batch_review_required',
  request_payment_status_review: 'confirmed_review_required',
  mark_payment_prepared_preview: 'prepared_preview',
  mark_payment_confirmed_review: 'confirmed_review_required',
  export_settlement_report: 'report_ready'
};

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
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
  if (!hasText(p.shopperId)) errors.push('shopperId_required');
  if (!hasText(p.action) || !actions.has(p.action)) errors.push('unsupported_action');
  if (!hasText(p.actorRole) || !roles.has(p.actorRole)) errors.push('unsupported_actor_role');
  if (!hasText(p.auditRef)) errors.push('auditRef_required');

  if (p.visitStatus && !visitStatuses.has(p.visitStatus)) errors.push('unsupported_visit_status');
  if (p.paymentStatus && !paymentStatuses.has(p.paymentStatus)) errors.push('unsupported_payment_status');

  if (p.visitStatus && !['submit_reviewed', 'submitted'].includes(p.visitStatus)) {
    errors.push('visit_must_be_submit_reviewed_or_submitted_for_settlement');
  }

  if (p.questionnaireCompleted !== true) {
    errors.push('questionnaire_completed_required');
  }

  if (p.submitReviewed !== true) {
    errors.push('submit_review_required');
  }

  if (!hasText(p.currency)) errors.push('currency_required');
  if (!isNumber(p.honorariumAmount) || p.honorariumAmount < 0) errors.push('honorariumAmount_required_non_negative');
  if (!isNumber(p.reimbursementAmount) || p.reimbursementAmount < 0) errors.push('reimbursementAmount_required_non_negative');

  if ((p.action === 'request_add_to_batch' || p.action === 'request_remove_from_batch' || p.action === 'request_batch_recalculation') && !hasText(p.batchId)) {
    errors.push('batchId_required_for_batch_action');
  }

  if (p.action === 'mark_payment_confirmed_review' && !looksLikeIsoDate(p.paymentDate)) {
    errors.push('paymentDate_required_for_confirmed_review');
  }

  if (p.action && p.action.startsWith('request_') && !hasText(p.reason)) {
    errors.push('reason_required_for_requested_change');
  }

  if (p.execute === true || p.payNow === true || p.writeToDatabase === true || p.notifyReal === true) {
    errors.push('real_side_effects_not_allowed');
  }

  if (p.containsBankData === true || p.containsDpi === true) {
    errors.push('sensitive_data_not_allowed_in_contract_payload');
  }

  if (p.paymentStatus === 'paid_confirmed' && p.action !== 'mark_payment_confirmed_review') {
    warnings.push('paid_confirmed_should_only_follow_confirmed_review_flow');
  }

  return {
    contract: 'cxorbia-settlement-eligibility',
    version: 'phase-a-preview-20260708',
    generatedAt: new Date().toISOString(),
    action: p.action || null,
    tenantId: p.tenantId || null,
    projectId: p.projectId || null,
    visitId: p.visitId || null,
    shopperId: p.shopperId || null,
    batchId: p.batchId || null,
    verdict: errors.length ? 'NO_GO_CONTRACT' : 'GO_PREVIEW_ONLY',
    status: errors.length ? 'blocked_gate' : (statusByAction[p.action] || 'eligible_preview'),
    errors,
    warnings,
    stableKeys: ['tenantId', 'projectId', 'visitId', 'shopperId', 'batchId'],
    safeState: {
      deploy: false,
      production: false,
      payments: false,
      providerCalls: false,
      databaseWrites: false,
      imports: false,
      notifications: false,
      sensitiveData: false
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
        contract: 'cxorbia-settlement-eligibility',
        verdict: 'NO_GO_CONTRACT',
        errors: ['invalid_json'],
        safeState: { deploy: false, production: false, payments: false, providerCalls: false, databaseWrites: false, imports: false }
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
