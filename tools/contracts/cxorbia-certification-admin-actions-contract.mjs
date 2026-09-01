#!/usr/bin/env node
/*
  CXOrbia - certification admin actions contract
  Synthetic validation only. No deploy, no provider calls, no DB writes, no imports, no notifications sent.
*/

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : '.tmp/cxorbia-certification-admin-actions-contract';

const actions = new Set(['search_status', 'grant_single_waiver', 'revoke_single_waiver', 'request_single_certification', 'resolve_missing_reflection']);
const statuses = new Set(['not_required', 'required_pending', 'in_progress', 'passed', 'failed', 'expired', 'manual_review', 'carryover_accepted', 'single_waiver_authorized']);
const rolesAllowed = new Set(['superadmin', 'admin', 'academy_admin']);

const records = [
  { eventId: 'cert-admin-001', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'search_status', actorRole: 'admin', certificationId: 'cert-demo-001', shopperId: null, filterStatus: 'passed', reasonCode: null, auditRef: 'audit-001' },
  { eventId: 'cert-admin-002', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'search_status', actorRole: 'academy_admin', certificationId: 'cert-demo-001', shopperId: null, filterStatus: 'required_pending', reasonCode: null, auditRef: 'audit-002' },
  { eventId: 'cert-admin-003', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'grant_single_waiver', actorRole: 'admin', certificationId: 'cert-demo-002', shopperId: 'shopper-demo-003', filterStatus: null, reasonCode: 'historical_exception', auditRef: 'audit-003' },
  { eventId: 'cert-admin-004', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'request_single_certification', actorRole: 'academy_admin', certificationId: 'cert-demo-003', shopperId: 'shopper-demo-004', filterStatus: null, reasonCode: 'project_requirement', auditRef: 'audit-004' },
  { eventId: 'cert-admin-005', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'resolve_missing_reflection', actorRole: 'superadmin', certificationId: 'cert-demo-004', shopperId: 'shopper-demo-005', filterStatus: null, reasonCode: 'admin_verified', auditRef: 'audit-005' }
];

function validate(row) {
  const errors = [];
  const warnings = [];
  for (const field of ['eventId', 'tenantId', 'projectId', 'action', 'actorRole', 'certificationId', 'auditRef']) {
    if (!row[field]) errors.push(`missing_${field}`);
  }
  if (!actions.has(row.action)) errors.push('invalid_action');
  if (!rolesAllowed.has(row.actorRole)) errors.push('actorRole_not_allowed');
  if (row.action === 'search_status' && !statuses.has(row.filterStatus)) errors.push('invalid_filterStatus_for_search');
  if (row.action !== 'search_status' && !row.shopperId) errors.push('shopperId_required_for_targeted_action');
  if (['grant_single_waiver', 'revoke_single_waiver', 'request_single_certification', 'resolve_missing_reflection'].includes(row.action) && !row.reasonCode) errors.push('reasonCode_required_for_admin_action');
  if (row.certificationId === '*' || row.certificationId === 'all') errors.push('global_certification_action_not_allowed');
  if (row.shopperId === '*' || row.shopperId === 'all') errors.push('global_shopper_action_not_allowed');
  if (row.action === 'grant_single_waiver' && row.actorRole === 'academy_admin') warnings.push('waiver_by_academy_admin_should_require_policy_review');
  return { eventId: row.eventId || null, ok: errors.length === 0, errors, warnings, action: row.action, actorRole: row.actorRole, certificationId: row.certificationId, shopperId: row.shopperId, filterStatus: row.filterStatus };
}

const results = records.map(validate);
const failures = results.filter(r => !r.ok);
const byAction = results.reduce((acc, r) => {
  acc[r.action] = (acc[r.action] || 0) + 1;
  return acc;
}, {});

const report = {
  gate: 'cxorbia-certification-admin-actions-contract',
  generatedAt: new Date().toISOString(),
  verdict: failures.length ? 'NO_GO_CERTIFICATION_ADMIN_ACTIONS_CONTRACT' : 'GO_CERTIFICATION_ADMIN_ACTIONS_PREVIEW_ONLY',
  recordCount: records.length,
  failureCount: failures.length,
  byAction,
  allowedActions: [...actions],
  statuses: [...statuses],
  rolesAllowed: [...rolesAllowed],
  results,
  reusableCxorbia: true,
  exclusiveClient: false,
  safeState: { deploy: false, providerCalls: false, dbWrites: false, imports: false, production: false, notificationsSent: false }
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'cxorbia-certification-admin-actions-contract.json'), JSON.stringify(report, null, 2), 'utf8');
const md = [
  '# CXOrbia certification admin actions contract', '',
  `Generated: ${report.generatedAt}`,
  `Verdict: ${report.verdict}`,
  `Records: ${report.recordCount}`,
  `Failures: ${report.failureCount}`, '',
  '## Action summary',
  ...Object.entries(byAction).map(([action, count]) => `- ${action}: ${count}`), '',
  '## Results',
  ...results.map(r => `- ${r.eventId}: ${r.action} / ${r.certificationId} / ${r.shopperId || 'filter'} / ${r.ok ? 'ok' : r.errors.join(', ')}`), '',
  '## Safe state',
  '- No deploy', '- No provider calls', '- No DB writes', '- No imports', '- No production', '- No notifications sent', ''
].join('\n');
fs.writeFileSync(path.join(outDir, 'cxorbia-certification-admin-actions-contract.md'), md, 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
