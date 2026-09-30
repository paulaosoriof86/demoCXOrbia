#!/usr/bin/env node
/*
  CXOrbia - visits admin actions contract
  Synthetic validation only. No deploy, no provider calls, no DB writes, no imports, no notifications sent.
*/

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : '.tmp/cxorbia-visits-admin-actions-contract';

const actions = new Set(['search_visits', 'correct_status', 'block_availability', 'unblock_availability', 'mark_review_required', 'adjust_window_by_rule', 'restore_available']);
const statuses = new Set(['available', 'assigned', 'scheduled', 'rescheduled', 'completed', 'questionnaire_done', 'submitted', 'blocked', 'review_required', 'cancelled']);
const reasons = new Set(['admin_correction', 'rule_window_adjustment', 'sync_conflict', 'shopper_reported_issue', 'source_mismatch', 'manual_review', 'availability_control']);
const allowedRoles = new Set(['superadmin', 'admin', 'ops']);

const rows = [
  { eventId: 'visit-admin-001', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'search_visits', actorRole: 'admin', visitId: null, fromStatus: null, toStatus: null, reasonCode: null, auditRef: 'audit-visit-001' },
  { eventId: 'visit-admin-002', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'correct_status', actorRole: 'ops', visitId: 'visit-demo-002', fromStatus: 'scheduled', toStatus: 'completed', reasonCode: 'admin_correction', auditRef: 'audit-visit-002' },
  { eventId: 'visit-admin-003', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'block_availability', actorRole: 'admin', visitId: 'visit-demo-003', fromStatus: 'available', toStatus: 'blocked', reasonCode: 'availability_control', auditRef: 'audit-visit-003' },
  { eventId: 'visit-admin-004', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'mark_review_required', actorRole: 'ops', visitId: 'visit-demo-004', fromStatus: 'assigned', toStatus: 'review_required', reasonCode: 'sync_conflict', auditRef: 'audit-visit-004' },
  { eventId: 'visit-admin-005', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'adjust_window_by_rule', actorRole: 'superadmin', visitId: 'visit-demo-005', fromStatus: 'available', toStatus: 'available', reasonCode: 'rule_window_adjustment', auditRef: 'audit-visit-005' }
];

function validate(row) {
  const errors = [];
  const warnings = [];
  for (const field of ['eventId', 'tenantId', 'projectId', 'action', 'actorRole', 'auditRef']) {
    if (!row[field]) errors.push(`missing_${field}`);
  }
  if (!actions.has(row.action)) errors.push('invalid_action');
  if (!allowedRoles.has(row.actorRole)) errors.push('actorRole_not_allowed');
  if (row.action === 'search_visits') {
    if (row.visitId) warnings.push('search_should_use_filters_not_direct_target');
  } else {
    for (const field of ['visitId', 'fromStatus', 'toStatus', 'reasonCode']) {
      if (!row[field]) errors.push(`missing_${field}_for_visit_action`);
    }
    if (row.fromStatus && !statuses.has(row.fromStatus)) errors.push('invalid_fromStatus');
    if (row.toStatus && !statuses.has(row.toStatus)) errors.push('invalid_toStatus');
    if (row.reasonCode && !reasons.has(row.reasonCode)) errors.push('invalid_reasonCode');
  }
  if (row.visitId === '*') errors.push('global_visit_action_not_allowed');
  if (row.action === 'correct_status' && row.reasonCode !== 'admin_correction') warnings.push('status_correction_should_have_admin_correction_reason');
  if (row.action === 'adjust_window_by_rule' && row.reasonCode !== 'rule_window_adjustment') errors.push('window_adjustment_requires_rule_reason');
  return { eventId: row.eventId || null, ok: errors.length === 0, errors, warnings, action: row.action, actorRole: row.actorRole, visitId: row.visitId, fromStatus: row.fromStatus, toStatus: row.toStatus, reasonCode: row.reasonCode };
}

const results = rows.map(validate);
const failures = results.filter(r => !r.ok);
const byAction = results.reduce((acc, r) => {
  acc[r.action] = (acc[r.action] || 0) + 1;
  return acc;
}, {});

const report = {
  gate: 'cxorbia-visits-admin-actions-contract',
  generatedAt: new Date().toISOString(),
  verdict: failures.length ? 'NO_GO_VISITS_ADMIN_ACTIONS_CONTRACT' : 'GO_VISITS_ADMIN_ACTIONS_PREVIEW_ONLY',
  recordCount: rows.length,
  failureCount: failures.length,
  byAction,
  allowedActions: [...actions],
  statuses: [...statuses],
  reasons: [...reasons],
  allowedRoles: [...allowedRoles],
  results,
  reusableCxorbia: true,
  exclusiveClient: false,
  safeState: { deploy: false, providerCalls: false, dbWrites: false, imports: false, production: false, notificationsSent: false }
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'cxorbia-visits-admin-actions-contract.json'), JSON.stringify(report, null, 2), 'utf8');
const md = [
  '# CXOrbia visits admin actions contract', '',
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
fs.writeFileSync(path.join(outDir, 'cxorbia-visits-admin-actions-contract.md'), md, 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
