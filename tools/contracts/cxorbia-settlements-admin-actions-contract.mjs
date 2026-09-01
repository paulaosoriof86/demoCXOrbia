#!/usr/bin/env node
/*
  CXOrbia - settlements admin actions contract
  Synthetic validation only. No deploy, no provider calls, no DB writes, no imports, no notifications sent.
*/

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : '.tmp/cxorbia-settlements-admin-actions-contract';

const actions = new Set(['search_settlements', 'review_amounts', 'approve_for_settlement', 'schedule_settlement', 'confirm_settlement', 'reschedule_settlement', 'carry_forward', 'block_for_review', 'resolve_visit_link']);
const statuses = new Set(['draft', 'pending_review', 'approved_for_settlement', 'scheduled', 'settled', 'rescheduled', 'carried_forward', 'blocked_review', 'cancelled']);
const amountStates = new Set(['not_calculated', 'calculated', 'manual_review', 'approved', 'blocked']);
const allowedRoles = new Set(['superadmin', 'admin', 'finance']);

const rows = [
  { eventId: 'set-admin-001', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'search_settlements', actorRole: 'finance', settlementId: null, shopperId: null, periodId: null, visitId: null, fromStatus: null, toStatus: null, amountState: null, reasonCode: null, auditRef: 'audit-set-001' },
  { eventId: 'set-admin-002', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'review_amounts', actorRole: 'finance', settlementId: 'settlement-demo-002', shopperId: 'shopper-demo-002', periodId: 'period-demo-2026-06', visitId: 'visit-demo-002', fromStatus: 'draft', toStatus: 'pending_review', amountState: 'manual_review', reasonCode: 'amount_review_required', auditRef: 'audit-set-002' },
  { eventId: 'set-admin-003', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'approve_for_settlement', actorRole: 'admin', settlementId: 'settlement-demo-003', shopperId: 'shopper-demo-003', periodId: 'period-demo-2026-06', visitId: 'visit-demo-003', fromStatus: 'pending_review', toStatus: 'approved_for_settlement', amountState: 'approved', reasonCode: 'reviewed_by_admin', auditRef: 'audit-set-003' },
  { eventId: 'set-admin-004', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'schedule_settlement', actorRole: 'finance', settlementId: 'settlement-demo-004', shopperId: 'shopper-demo-004', periodId: 'period-demo-2026-06', visitId: 'visit-demo-004', fromStatus: 'approved_for_settlement', toStatus: 'scheduled', amountState: 'approved', reasonCode: 'scheduled_for_cycle', auditRef: 'audit-set-004' },
  { eventId: 'set-admin-005', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'carry_forward', actorRole: 'finance', settlementId: 'settlement-demo-005', shopperId: 'shopper-demo-005', periodId: 'period-demo-2026-06', visitId: 'visit-demo-005', fromStatus: 'scheduled', toStatus: 'carried_forward', amountState: 'approved', reasonCode: 'move_to_next_period', auditRef: 'audit-set-005' }
];

function validate(row) {
  const errors = [];
  const warnings = [];
  for (const field of ['eventId', 'tenantId', 'projectId', 'action', 'actorRole', 'auditRef']) {
    if (!row[field]) errors.push(`missing_${field}`);
  }
  if (!actions.has(row.action)) errors.push('invalid_action');
  if (!allowedRoles.has(row.actorRole)) errors.push('actorRole_not_allowed');
  if (row.action === 'search_settlements') {
    if (row.settlementId || row.shopperId || row.visitId) warnings.push('search_should_use_filters_not_direct_target');
  } else {
    for (const field of ['settlementId', 'shopperId', 'periodId', 'fromStatus', 'toStatus', 'amountState', 'reasonCode']) {
      if (!row[field]) errors.push(`missing_${field}_for_settlement_action`);
    }
    if (row.fromStatus && !statuses.has(row.fromStatus)) errors.push('invalid_fromStatus');
    if (row.toStatus && !statuses.has(row.toStatus)) errors.push('invalid_toStatus');
    if (row.amountState && !amountStates.has(row.amountState)) errors.push('invalid_amountState');
  }
  if (row.settlementId === '*' || row.shopperId === '*' || row.periodId === '*') errors.push('global_settlement_action_not_allowed');
  if (row.action === 'confirm_settlement' && row.actorRole !== 'finance' && row.actorRole !== 'superadmin') errors.push('confirm_requires_finance_or_superadmin');
  if (row.action === 'resolve_visit_link' && !row.visitId) errors.push('resolve_visit_link_requires_visitId');
  return { eventId: row.eventId || null, ok: errors.length === 0, errors, warnings, action: row.action, actorRole: row.actorRole, settlementId: row.settlementId, shopperId: row.shopperId, periodId: row.periodId, fromStatus: row.fromStatus, toStatus: row.toStatus, amountState: row.amountState };
}

const results = rows.map(validate);
const failures = results.filter(r => !r.ok);
const byAction = results.reduce((acc, r) => {
  acc[r.action] = (acc[r.action] || 0) + 1;
  return acc;
}, {});

const report = {
  gate: 'cxorbia-settlements-admin-actions-contract',
  generatedAt: new Date().toISOString(),
  verdict: failures.length ? 'NO_GO_SETTLEMENTS_ADMIN_ACTIONS_CONTRACT' : 'GO_SETTLEMENTS_ADMIN_ACTIONS_PREVIEW_ONLY',
  recordCount: rows.length,
  failureCount: failures.length,
  byAction,
  allowedActions: [...actions],
  statuses: [...statuses],
  amountStates: [...amountStates],
  allowedRoles: [...allowedRoles],
  results,
  reusableCxorbia: true,
  exclusiveClient: false,
  safeState: { deploy: false, providerCalls: false, dbWrites: false, imports: false, production: false, notificationsSent: false }
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'cxorbia-settlements-admin-actions-contract.json'), JSON.stringify(report, null, 2), 'utf8');
const md = [
  '# CXOrbia settlements admin actions contract', '',
  `Generated: ${report.generatedAt}`,
  `Verdict: ${report.verdict}`,
  `Records: ${report.recordCount}`,
  `Failures: ${report.failureCount}`, '',
  '## Action summary',
  ...Object.entries(byAction).map(([action, count]) => `- ${action}: ${count}`), '',
  '## Results',
  ...results.map(r => `- ${r.eventId}: ${r.action} / ${r.settlementId || 'filters'} / ${r.fromStatus || '-'} -> ${r.toStatus || '-'} / ${r.ok ? 'ok' : r.errors.join(', ')}`), '',
  '## Safe state',
  '- No deploy', '- No provider calls', '- No DB writes', '- No imports', '- No production', '- No notifications sent', ''
].join('\n');
fs.writeFileSync(path.join(outDir, 'cxorbia-settlements-admin-actions-contract.md'), md, 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
