#!/usr/bin/env node
/*
  CXOrbia - notifications admin actions contract
  Synthetic validation only. No deploy, no provider calls, no DB writes, no imports, no notifications sent.
*/

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : '.tmp/cxorbia-notifications-admin-actions-contract';

const actions = new Set(['search_notifications', 'preview_notification', 'approve_notification', 'pause_notification', 'resume_notification', 'mark_review_required', 'resend_if_allowed']);
const statuses = new Set(['draft', 'preview', 'pending_review', 'approved', 'paused', 'sent_preview_only', 'blocked_gate', 'failed_review']);
const channels = new Set(['in_app', 'email', 'whatsapp', 'sms', 'webhook']);
const allowedRoles = new Set(['superadmin', 'admin', 'ops', 'academy_admin']);

const rows = [
  { eventId: 'notif-admin-001', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'search_notifications', actorRole: 'admin', notificationId: null, channel: null, fromStatus: null, toStatus: null, reasonCode: null, gateState: 'preview', auditRef: 'audit-notif-001' },
  { eventId: 'notif-admin-002', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'preview_notification', actorRole: 'ops', notificationId: 'notif-demo-002', channel: 'in_app', fromStatus: 'draft', toStatus: 'preview', reasonCode: 'admin_preview', gateState: 'preview', auditRef: 'audit-notif-002' },
  { eventId: 'notif-admin-003', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'approve_notification', actorRole: 'admin', notificationId: 'notif-demo-003', channel: 'email', fromStatus: 'pending_review', toStatus: 'approved', reasonCode: 'approved_by_admin', gateState: 'preview', auditRef: 'audit-notif-003' },
  { eventId: 'notif-admin-004', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'pause_notification', actorRole: 'academy_admin', notificationId: 'notif-demo-004', channel: 'in_app', fromStatus: 'approved', toStatus: 'paused', reasonCode: 'academy_content_changed', gateState: 'preview', auditRef: 'audit-notif-004' },
  { eventId: 'notif-admin-005', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'resend_if_allowed', actorRole: 'superadmin', notificationId: 'notif-demo-005', channel: 'webhook', fromStatus: 'blocked_gate', toStatus: 'pending_review', reasonCode: 'gate_not_active', gateState: 'blocked_missing_config', auditRef: 'audit-notif-005' }
];

function validate(row) {
  const errors = [];
  const warnings = [];
  for (const field of ['eventId', 'tenantId', 'projectId', 'action', 'actorRole', 'gateState', 'auditRef']) {
    if (!row[field]) errors.push(`missing_${field}`);
  }
  if (!actions.has(row.action)) errors.push('invalid_action');
  if (!allowedRoles.has(row.actorRole)) errors.push('actorRole_not_allowed');
  if (row.action === 'search_notifications') {
    if (row.notificationId) warnings.push('search_should_use_filters_not_direct_target');
  } else {
    for (const field of ['notificationId', 'channel', 'fromStatus', 'toStatus', 'reasonCode']) {
      if (!row[field]) errors.push(`missing_${field}_for_notification_action`);
    }
    if (row.channel && !channels.has(row.channel)) errors.push('invalid_channel');
    if (row.fromStatus && !statuses.has(row.fromStatus)) errors.push('invalid_fromStatus');
    if (row.toStatus && !statuses.has(row.toStatus)) errors.push('invalid_toStatus');
  }
  if (row.notificationId === '*') errors.push('global_notification_action_not_allowed');
  if (row.action === 'resend_if_allowed' && !String(row.gateState).startsWith('active')) warnings.push('resend_without_active_gate_must_remain_blocked_or_review');
  if (row.channel !== 'in_app' && row.action === 'approve_notification' && !['active_controlled', 'preview'].includes(row.gateState)) errors.push('external_channel_requires_gate_review');
  return { eventId: row.eventId || null, ok: errors.length === 0, errors, warnings, action: row.action, actorRole: row.actorRole, notificationId: row.notificationId, channel: row.channel, fromStatus: row.fromStatus, toStatus: row.toStatus, gateState: row.gateState };
}

const results = rows.map(validate);
const failures = results.filter(r => !r.ok);
const byAction = results.reduce((acc, r) => {
  acc[r.action] = (acc[r.action] || 0) + 1;
  return acc;
}, {});

const report = {
  gate: 'cxorbia-notifications-admin-actions-contract',
  generatedAt: new Date().toISOString(),
  verdict: failures.length ? 'NO_GO_NOTIFICATIONS_ADMIN_ACTIONS_CONTRACT' : 'GO_NOTIFICATIONS_ADMIN_ACTIONS_PREVIEW_ONLY',
  recordCount: rows.length,
  failureCount: failures.length,
  byAction,
  allowedActions: [...actions],
  statuses: [...statuses],
  channels: [...channels],
  allowedRoles: [...allowedRoles],
  results,
  reusableCxorbia: true,
  exclusiveClient: false,
  safeState: { deploy: false, providerCalls: false, dbWrites: false, imports: false, production: false, notificationsSent: false }
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'cxorbia-notifications-admin-actions-contract.json'), JSON.stringify(report, null, 2), 'utf8');
const md = [
  '# CXOrbia notifications admin actions contract', '',
  `Generated: ${report.generatedAt}`,
  `Verdict: ${report.verdict}`,
  `Records: ${report.recordCount}`,
  `Failures: ${report.failureCount}`, '',
  '## Action summary',
  ...Object.entries(byAction).map(([action, count]) => `- ${action}: ${count}`), '',
  '## Results',
  ...results.map(r => `- ${r.eventId}: ${r.action} / ${r.notificationId || 'filters'} / ${r.fromStatus || '-'} -> ${r.toStatus || '-'} / ${r.ok ? 'ok' : r.errors.join(', ')}`), '',
  '## Safe state',
  '- No deploy', '- No provider calls', '- No DB writes', '- No imports', '- No production', '- No notifications sent', ''
].join('\n');
fs.writeFileSync(path.join(outDir, 'cxorbia-notifications-admin-actions-contract.md'), md, 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
