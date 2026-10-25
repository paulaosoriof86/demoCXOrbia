#!/usr/bin/env node
/*
  CXOrbia - field files admin actions contract
  Synthetic validation only. No deploy, no provider calls, no DB writes, no imports, no file uploads.
*/

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : '.tmp/cxorbia-field-files-admin-actions-contract';

const actions = new Set(['search_files', 'mark_required', 'review_file', 'approve_file_ref', 'return_with_note', 'mark_missing', 'replace_request', 'lock_after_review']);
const statuses = new Set(['not_required', 'required', 'uploaded_preview', 'review_required', 'approved_ref', 'returned', 'missing', 'replace_requested', 'locked']);
const fileTypes = new Set(['photo', 'video', 'audio', 'document', 'form_attachment']);
const allowedRoles = new Set(['superadmin', 'admin', 'ops', 'technical_reviewer']);

const rows = [
  { eventId: 'field-file-001', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'search_files', actorRole: 'admin', visitId: null, fileRef: null, fileType: null, fromStatus: null, toStatus: null, reasonCode: null, auditRef: 'audit-file-001' },
  { eventId: 'field-file-002', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'mark_required', actorRole: 'ops', visitId: 'visit-demo-002', fileRef: null, fileType: 'photo', fromStatus: 'not_required', toStatus: 'required', reasonCode: 'project_rule', auditRef: 'audit-file-002' },
  { eventId: 'field-file-003', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'review_file', actorRole: 'technical_reviewer', visitId: 'visit-demo-003', fileRef: 'file-ref-demo-003', fileType: 'video', fromStatus: 'uploaded_preview', toStatus: 'review_required', reasonCode: 'quality_review', auditRef: 'audit-file-003' },
  { eventId: 'field-file-004', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'approve_file_ref', actorRole: 'admin', visitId: 'visit-demo-004', fileRef: 'file-ref-demo-004', fileType: 'audio', fromStatus: 'review_required', toStatus: 'approved_ref', reasonCode: 'admin_reviewed', auditRef: 'audit-file-004' },
  { eventId: 'field-file-005', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'return_with_note', actorRole: 'ops', visitId: 'visit-demo-005', fileRef: 'file-ref-demo-005', fileType: 'document', fromStatus: 'review_required', toStatus: 'returned', reasonCode: 'needs_replacement', auditRef: 'audit-file-005' }
];

function validate(row) {
  const errors = [];
  const warnings = [];
  for (const field of ['eventId', 'tenantId', 'projectId', 'action', 'actorRole', 'auditRef']) {
    if (!row[field]) errors.push(`missing_${field}`);
  }
  if (!actions.has(row.action)) errors.push('invalid_action');
  if (!allowedRoles.has(row.actorRole)) errors.push('actorRole_not_allowed');
  if (row.action === 'search_files') {
    if (row.visitId || row.fileRef) warnings.push('search_should_use_filters_not_direct_target');
  } else {
    for (const field of ['visitId', 'fileType', 'fromStatus', 'toStatus', 'reasonCode']) {
      if (!row[field]) errors.push(`missing_${field}_for_file_action`);
    }
    if (row.fileType && !fileTypes.has(row.fileType)) errors.push('invalid_fileType');
    if (row.fromStatus && !statuses.has(row.fromStatus)) errors.push('invalid_fromStatus');
    if (row.toStatus && !statuses.has(row.toStatus)) errors.push('invalid_toStatus');
  }
  if (['review_file', 'approve_file_ref', 'return_with_note', 'lock_after_review'].includes(row.action) && !row.fileRef) errors.push('fileRef_required_for_file_review_action');
  if (row.visitId === '*' || row.fileRef === '*') errors.push('global_file_action_not_allowed');
  if (row.action === 'approve_file_ref' && row.toStatus !== 'approved_ref') errors.push('approve_requires_approved_ref_status');
  return { eventId: row.eventId || null, ok: errors.length === 0, errors, warnings, action: row.action, actorRole: row.actorRole, visitId: row.visitId, fileRef: row.fileRef, fileType: row.fileType, fromStatus: row.fromStatus, toStatus: row.toStatus };
}

const results = rows.map(validate);
const failures = results.filter(r => !r.ok);
const byAction = results.reduce((acc, r) => {
  acc[r.action] = (acc[r.action] || 0) + 1;
  return acc;
}, {});

const report = {
  gate: 'cxorbia-field-files-admin-actions-contract',
  generatedAt: new Date().toISOString(),
  verdict: failures.length ? 'NO_GO_FIELD_FILES_ADMIN_ACTIONS_CONTRACT' : 'GO_FIELD_FILES_ADMIN_ACTIONS_PREVIEW_ONLY',
  recordCount: rows.length,
  failureCount: failures.length,
  byAction,
  allowedActions: [...actions],
  statuses: [...statuses],
  fileTypes: [...fileTypes],
  allowedRoles: [...allowedRoles],
  results,
  reusableCxorbia: true,
  exclusiveClient: false,
  safeState: { deploy: false, providerCalls: false, dbWrites: false, imports: false, production: false, fileUploads: false }
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'cxorbia-field-files-admin-actions-contract.json'), JSON.stringify(report, null, 2), 'utf8');
const md = [
  '# CXOrbia field files admin actions contract', '',
  `Generated: ${report.generatedAt}`,
  `Verdict: ${report.verdict}`,
  `Records: ${report.recordCount}`,
  `Failures: ${report.failureCount}`, '',
  '## Action summary',
  ...Object.entries(byAction).map(([action, count]) => `- ${action}: ${count}`), '',
  '## Results',
  ...results.map(r => `- ${r.eventId}: ${r.action} / ${r.visitId || 'filters'} / ${r.fileType || '-'} / ${r.ok ? 'ok' : r.errors.join(', ')}`), '',
  '## Safe state',
  '- No deploy', '- No provider calls', '- No DB writes', '- No imports', '- No production', '- No file uploads', ''
].join('\n');
fs.writeFileSync(path.join(outDir, 'cxorbia-field-files-admin-actions-contract.md'), md, 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
