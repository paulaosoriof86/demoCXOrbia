#!/usr/bin/env node
/*
  CXOrbia - import admin actions contract
  Synthetic validation only. No deploy, no provider calls, no DB writes, no imports executed.
*/

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : '.tmp/cxorbia-import-admin-actions-contract';

const actions = new Set(['search_batches', 'preview_batch', 'review_row', 'approve_clean_batch', 'reject_row', 'hold_row', 'resolve_mapping', 'generate_report']);
const statuses = new Set(['draft', 'preview_ready', 'needs_review', 'approved_clean', 'row_rejected', 'row_on_hold', 'mapped', 'report_ready', 'blocked_gate']);
const entities = new Set(['shopper', 'visit', 'assignment', 'certification', 'settlement', 'project_config']);
const allowedRoles = new Set(['superadmin', 'admin', 'technical_reviewer']);

const rows = [
  { eventId: 'imp-admin-001', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'search_batches', actorRole: 'admin', batchId: null, rowRef: null, entityType: null, fromStatus: null, toStatus: null, reasonCode: null, auditRef: 'audit-imp-001' },
  { eventId: 'imp-admin-002', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'preview_batch', actorRole: 'technical_reviewer', batchId: 'batch-demo-002', rowRef: null, entityType: 'visit', fromStatus: 'draft', toStatus: 'preview_ready', reasonCode: 'preview_requested', auditRef: 'audit-imp-002' },
  { eventId: 'imp-admin-003', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'review_row', actorRole: 'admin', batchId: 'batch-demo-003', rowRef: 'row-demo-003', entityType: 'shopper', fromStatus: 'needs_review', toStatus: 'needs_review', reasonCode: 'manual_review_required', auditRef: 'audit-imp-003' },
  { eventId: 'imp-admin-004', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'approve_clean_batch', actorRole: 'superadmin', batchId: 'batch-demo-004', rowRef: null, entityType: 'assignment', fromStatus: 'preview_ready', toStatus: 'approved_clean', reasonCode: 'clean_batch_reviewed', auditRef: 'audit-imp-004' },
  { eventId: 'imp-admin-005', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'resolve_mapping', actorRole: 'technical_reviewer', batchId: 'batch-demo-005', rowRef: 'row-demo-005', entityType: 'settlement', fromStatus: 'needs_review', toStatus: 'mapped', reasonCode: 'mapping_verified', auditRef: 'audit-imp-005' }
];

function validate(row) {
  const errors = [];
  const warnings = [];
  for (const field of ['eventId', 'tenantId', 'projectId', 'action', 'actorRole', 'auditRef']) {
    if (!row[field]) errors.push(`missing_${field}`);
  }
  if (!actions.has(row.action)) errors.push('invalid_action');
  if (!allowedRoles.has(row.actorRole)) errors.push('actorRole_not_allowed');
  if (row.action === 'search_batches') {
    if (row.batchId || row.rowRef) warnings.push('search_should_use_filters_not_direct_target');
  } else {
    for (const field of ['batchId', 'entityType', 'fromStatus', 'toStatus', 'reasonCode']) {
      if (!row[field]) errors.push(`missing_${field}_for_import_action`);
    }
    if (row.entityType && !entities.has(row.entityType)) errors.push('invalid_entityType');
    if (row.fromStatus && !statuses.has(row.fromStatus)) errors.push('invalid_fromStatus');
    if (row.toStatus && !statuses.has(row.toStatus)) errors.push('invalid_toStatus');
  }
  if (['review_row', 'reject_row', 'hold_row', 'resolve_mapping'].includes(row.action) && !row.rowRef) errors.push('rowRef_required_for_row_action');
  if (row.batchId === '*' || row.rowRef === '*') errors.push('global_import_action_not_allowed');
  if (row.action === 'approve_clean_batch' && row.actorRole === 'technical_reviewer') errors.push('technical_reviewer_cannot_final_approve_batch');
  return { eventId: row.eventId || null, ok: errors.length === 0, errors, warnings, action: row.action, actorRole: row.actorRole, batchId: row.batchId, rowRef: row.rowRef, entityType: row.entityType, fromStatus: row.fromStatus, toStatus: row.toStatus };
}

const results = rows.map(validate);
const failures = results.filter(r => !r.ok);
const byAction = results.reduce((acc, r) => {
  acc[r.action] = (acc[r.action] || 0) + 1;
  return acc;
}, {});

const report = {
  gate: 'cxorbia-import-admin-actions-contract',
  generatedAt: new Date().toISOString(),
  verdict: failures.length ? 'NO_GO_IMPORT_ADMIN_ACTIONS_CONTRACT' : 'GO_IMPORT_ADMIN_ACTIONS_PREVIEW_ONLY',
  recordCount: rows.length,
  failureCount: failures.length,
  byAction,
  allowedActions: [...actions],
  statuses: [...statuses],
  entities: [...entities],
  allowedRoles: [...allowedRoles],
  results,
  reusableCxorbia: true,
  exclusiveClient: false,
  safeState: { deploy: false, providerCalls: false, dbWrites: false, importsExecuted: false, production: false }
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'cxorbia-import-admin-actions-contract.json'), JSON.stringify(report, null, 2), 'utf8');
const md = [
  '# CXOrbia import admin actions contract', '',
  `Generated: ${report.generatedAt}`,
  `Verdict: ${report.verdict}`,
  `Records: ${report.recordCount}`,
  `Failures: ${report.failureCount}`, '',
  '## Action summary',
  ...Object.entries(byAction).map(([action, count]) => `- ${action}: ${count}`), '',
  '## Results',
  ...results.map(r => `- ${r.eventId}: ${r.action} / ${r.batchId || 'filters'} / ${r.entityType || '-'} / ${r.ok ? 'ok' : r.errors.join(', ')}`), '',
  '## Safe state',
  '- No deploy', '- No provider calls', '- No DB writes', '- No imports executed', '- No production', ''
].join('\n');
fs.writeFileSync(path.join(outDir, 'cxorbia-import-admin-actions-contract.md'), md, 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
