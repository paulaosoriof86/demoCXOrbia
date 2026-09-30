#!/usr/bin/env node
/*
  CXOrbia - assignments admin actions contract
  Synthetic validation only. No deploy, no provider calls, no DB writes, no imports, no notifications sent.
*/

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : '.tmp/cxorbia-assignments-admin-actions-contract';

const actions = new Set(['search_assignments', 'assign_shopper', 'release_assignment', 'move_to_review', 'resolve_source_duplicate', 'mark_sync_pending']);
const statuses = new Set(['available', 'assigned', 'released', 'review_required', 'sync_pending', 'sync_conflict', 'cancelled']);
const sources = new Set(['platform', 'external_source', 'admin_manual', 'sync_reflection']);
const allowedRoles = new Set(['superadmin', 'admin', 'ops']);

const rows = [
  { eventId: 'asg-admin-001', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'search_assignments', actorRole: 'admin', visitId: null, shopperId: null, fromStatus: null, toStatus: null, source: null, reasonCode: null, auditRef: 'audit-asg-001' },
  { eventId: 'asg-admin-002', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'assign_shopper', actorRole: 'ops', visitId: 'visit-demo-002', shopperId: 'shopper-demo-002', fromStatus: 'available', toStatus: 'assigned', source: 'admin_manual', reasonCode: 'reviewed_by_admin', auditRef: 'audit-asg-002' },
  { eventId: 'asg-admin-003', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'release_assignment', actorRole: 'admin', visitId: 'visit-demo-003', shopperId: 'shopper-demo-003', fromStatus: 'assigned', toStatus: 'released', source: 'admin_manual', reasonCode: 'shopper_change', auditRef: 'audit-asg-003' },
  { eventId: 'asg-admin-004', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'resolve_source_duplicate', actorRole: 'superadmin', visitId: 'visit-demo-004', shopperId: 'shopper-demo-004', fromStatus: 'sync_conflict', toStatus: 'review_required', source: 'sync_reflection', reasonCode: 'duplicate_source_reviewed', auditRef: 'audit-asg-004' },
  { eventId: 'asg-admin-005', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'mark_sync_pending', actorRole: 'ops', visitId: 'visit-demo-005', shopperId: 'shopper-demo-005', fromStatus: 'assigned', toStatus: 'sync_pending', source: 'platform', reasonCode: 'awaiting_external_reflection', auditRef: 'audit-asg-005' }
];

function validate(row) {
  const errors = [];
  const warnings = [];
  for (const field of ['eventId', 'tenantId', 'projectId', 'action', 'actorRole', 'auditRef']) {
    if (!row[field]) errors.push(`missing_${field}`);
  }
  if (!actions.has(row.action)) errors.push('invalid_action');
  if (!allowedRoles.has(row.actorRole)) errors.push('actorRole_not_allowed');
  if (row.action === 'search_assignments') {
    if (row.visitId || row.shopperId) warnings.push('search_should_use_filters_not_direct_target');
  } else {
    for (const field of ['visitId', 'shopperId', 'fromStatus', 'toStatus', 'source', 'reasonCode']) {
      if (!row[field]) errors.push(`missing_${field}_for_assignment_action`);
    }
    if (row.fromStatus && !statuses.has(row.fromStatus)) errors.push('invalid_fromStatus');
    if (row.toStatus && !statuses.has(row.toStatus)) errors.push('invalid_toStatus');
    if (row.source && !sources.has(row.source)) errors.push('invalid_source');
  }
  if (row.visitId === '*' || row.shopperId === '*') errors.push('global_assignment_action_not_allowed');
  if (row.action === 'assign_shopper' && row.fromStatus !== 'available') warnings.push('assign_from_non_available_requires_review');
  return { eventId: row.eventId || null, ok: errors.length === 0, errors, warnings, action: row.action, actorRole: row.actorRole, visitId: row.visitId, shopperId: row.shopperId, fromStatus: row.fromStatus, toStatus: row.toStatus, source: row.source };
}

const results = rows.map(validate);
const failures = results.filter(r => !r.ok);
const byAction = results.reduce((acc, r) => {
  acc[r.action] = (acc[r.action] || 0) + 1;
  return acc;
}, {});

const report = {
  gate: 'cxorbia-assignments-admin-actions-contract',
  generatedAt: new Date().toISOString(),
  verdict: failures.length ? 'NO_GO_ASSIGNMENTS_ADMIN_ACTIONS_CONTRACT' : 'GO_ASSIGNMENTS_ADMIN_ACTIONS_PREVIEW_ONLY',
  recordCount: rows.length,
  failureCount: failures.length,
  byAction,
  allowedActions: [...actions],
  statuses: [...statuses],
  sources: [...sources],
  allowedRoles: [...allowedRoles],
  results,
  reusableCxorbia: true,
  exclusiveClient: false,
  safeState: { deploy: false, providerCalls: false, dbWrites: false, imports: false, production: false, notificationsSent: false }
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'cxorbia-assignments-admin-actions-contract.json'), JSON.stringify(report, null, 2), 'utf8');
const md = [
  '# CXOrbia assignments admin actions contract', '',
  `Generated: ${report.generatedAt}`,
  `Verdict: ${report.verdict}`,
  `Records: ${report.recordCount}`,
  `Failures: ${report.failureCount}`, '',
  '## Action summary',
  ...Object.entries(byAction).map(([action, count]) => `- ${action}: ${count}`), '',
  '## Results',
  ...results.map(r => `- ${r.eventId}: ${r.action} / ${r.visitId || 'filters'} / ${r.fromStatus || '-'} -> ${r.toStatus || '-'} / ${r.ok ? 'ok' : r.errors.join(', ')}`), '',
  '## Safe state',
  '- No deploy', '- No provider calls', '- No DB writes', '- No imports', '- No production', '- No notifications sent', ''
].join('\n');
fs.writeFileSync(path.join(outDir, 'cxorbia-assignments-admin-actions-contract.md'), md, 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
