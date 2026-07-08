#!/usr/bin/env node
/*
  CXOrbia - Evidence storage contract validator
  Preview-only contract. No Storage writes, no provider calls, no database writes, no deploy.

  Purpose:
  Validate the metadata shape for field evidence before any real Storage
  implementation. Evidence can be required by project/visit, but this contract
  never stores files and never accepts raw file bytes or sensitive identity data.
*/

const actions = new Set([
  'preview_evidence_requirement',
  'request_upload_slot',
  'request_evidence_review',
  'request_evidence_replacement',
  'request_evidence_rejection',
  'mark_evidence_accepted_preview',
  'export_evidence_report'
]);

const roles = new Set([
  'superadmin',
  'admin',
  'ops',
  'shopper',
  'technical_reviewer'
]);

const evidenceTypes = new Set([
  'photo',
  'video',
  'audio',
  'receipt',
  'document',
  'other_project_defined'
]);

const statuses = {
  preview_evidence_requirement: 'requirement_preview',
  request_upload_slot: 'upload_slot_review_required',
  request_evidence_review: 'evidence_review_required',
  request_evidence_replacement: 'replacement_review_required',
  request_evidence_rejection: 'rejection_review_required',
  mark_evidence_accepted_preview: 'accepted_preview',
  export_evidence_report: 'report_ready'
};

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasRawFilePayload(value) {
  return typeof value === 'string' && (/^data:/i.test(value) || value.length > 5000);
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

  if (p.evidenceType && !evidenceTypes.has(p.evidenceType)) errors.push('unsupported_evidence_type');

  if (p.action !== 'preview_evidence_requirement' && !hasText(p.evidenceId)) {
    errors.push('evidenceId_required_for_evidence_action');
  }

  if ((p.action === 'request_evidence_replacement' || p.action === 'request_evidence_rejection') && !hasText(p.reason)) {
    errors.push('reason_required_for_replacement_or_rejection');
  }

  if (hasRawFilePayload(p.file) || hasRawFilePayload(p.fileContent) || hasRawFilePayload(p.base64)) {
    errors.push('raw_file_payload_not_allowed');
  }

  if (p.storageWrite === true || p.writeToDatabase === true || p.notifyReal === true || p.execute === true) {
    errors.push('real_side_effects_not_allowed');
  }

  if (p.containsDpi === true || p.containsBankData === true || p.containsSensitiveIdentity === true) {
    errors.push('sensitive_identity_data_not_allowed');
  }

  if (p.evidenceType === 'audio') warnings.push('audio_evidence_requires_project_policy_review');
  if (p.evidenceType === 'video') warnings.push('video_evidence_requires_retention_policy');

  return {
    contract: 'cxorbia-evidence-storage',
    version: 'phase-a-preview-20260708',
    generatedAt: new Date().toISOString(),
    action: p.action || null,
    tenantId: p.tenantId || null,
    projectId: p.projectId || null,
    visitId: p.visitId || null,
    evidenceId: p.evidenceId || null,
    verdict: errors.length ? 'NO_GO_CONTRACT' : 'GO_PREVIEW_ONLY',
    status: errors.length ? 'blocked_gate' : (statuses[p.action] || 'requirement_preview'),
    errors,
    warnings,
    stableKeys: ['tenantId', 'projectId', 'visitId', 'evidenceId'],
    safeState: {
      deploy: false,
      production: false,
      storageWrites: false,
      providerCalls: false,
      databaseWrites: false,
      imports: false,
      notifications: false,
      rawFiles: false,
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
        contract: 'cxorbia-evidence-storage',
        verdict: 'NO_GO_CONTRACT',
        errors: ['invalid_json'],
        safeState: { deploy: false, production: false, storageWrites: false, providerCalls: false, databaseWrites: false, imports: false }
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
