#!/usr/bin/env node
/*
  CXOrbia - academy admin actions contract
  Synthetic validation only. No deploy, no provider calls, no DB writes, no imports, no publishing.
*/

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : '.tmp/cxorbia-academy-admin-actions-contract';

const actions = new Set(['search_content', 'map_content_to_rule', 'mark_content_missing', 'send_to_review', 'approve_content', 'publish_preview', 'pause_content', 'restore_content']);
const statuses = new Set(['draft', 'mapped', 'missing', 'review_required', 'approved', 'preview_published', 'paused', 'restored', 'blocked_gate']);
const contentTypes = new Set(['manual', 'guide', 'certification', 'question_bank', 'role_route', 'notification_template', 'project_rule']);
const allowedRoles = new Set(['superadmin', 'admin', 'academy_admin', 'technical_reviewer']);

const rows = [
  { eventId: 'academy-admin-001', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'search_content', actorRole: 'academy_admin', contentId: null, contentType: null, ruleRef: null, fromStatus: null, toStatus: null, reasonCode: null, auditRef: 'audit-acad-001' },
  { eventId: 'academy-admin-002', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'map_content_to_rule', actorRole: 'academy_admin', contentId: 'content-demo-002', contentType: 'manual', ruleRef: 'rule-demo-002', fromStatus: 'draft', toStatus: 'mapped', reasonCode: 'project_rule_mapping', auditRef: 'audit-acad-002' },
  { eventId: 'academy-admin-003', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'mark_content_missing', actorRole: 'admin', contentId: 'content-demo-003', contentType: 'certification', ruleRef: 'rule-demo-003', fromStatus: 'draft', toStatus: 'missing', reasonCode: 'required_by_project', auditRef: 'audit-acad-003' },
  { eventId: 'academy-admin-004', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'send_to_review', actorRole: 'academy_admin', contentId: 'content-demo-004', contentType: 'question_bank', ruleRef: 'rule-demo-004', fromStatus: 'mapped', toStatus: 'review_required', reasonCode: 'needs_human_review', auditRef: 'audit-acad-004' },
  { eventId: 'academy-admin-005', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'publish_preview', actorRole: 'superadmin', contentId: 'content-demo-005', contentType: 'role_route', ruleRef: 'rule-demo-005', fromStatus: 'approved', toStatus: 'preview_published', reasonCode: 'preview_release', auditRef: 'audit-acad-005' }
];

function validate(row) {
  const errors = [];
  const warnings = [];
  for (const field of ['eventId', 'tenantId', 'projectId', 'action', 'actorRole', 'auditRef']) {
    if (!row[field]) errors.push(`missing_${field}`);
  }
  if (!actions.has(row.action)) errors.push('invalid_action');
  if (!allowedRoles.has(row.actorRole)) errors.push('actorRole_not_allowed');
  if (row.action === 'search_content') {
    if (row.contentId || row.ruleRef) warnings.push('search_should_use_filters_not_direct_target');
  } else {
    for (const field of ['contentId', 'contentType', 'ruleRef', 'fromStatus', 'toStatus', 'reasonCode']) {
      if (!row[field]) errors.push(`missing_${field}_for_academy_action`);
    }
    if (row.contentType && !contentTypes.has(row.contentType)) errors.push('invalid_contentType');
    if (row.fromStatus && !statuses.has(row.fromStatus)) errors.push('invalid_fromStatus');
    if (row.toStatus && !statuses.has(row.toStatus)) errors.push('invalid_toStatus');
  }
  if (row.contentId === '*' || row.ruleRef === '*') errors.push('global_academy_action_not_allowed');
  if (row.action === 'publish_preview' && row.fromStatus !== 'approved') errors.push('publish_preview_requires_approved_content');
  if (row.action === 'approve_content' && !['superadmin', 'academy_admin'].includes(row.actorRole)) errors.push('approval_requires_academy_admin_or_superadmin');
  return { eventId: row.eventId || null, ok: errors.length === 0, errors, warnings, action: row.action, actorRole: row.actorRole, contentId: row.contentId, contentType: row.contentType, ruleRef: row.ruleRef, fromStatus: row.fromStatus, toStatus: row.toStatus };
}

const results = rows.map(validate);
const failures = results.filter(r => !r.ok);
const byAction = results.reduce((acc, r) => {
  acc[r.action] = (acc[r.action] || 0) + 1;
  return acc;
}, {});

const report = {
  gate: 'cxorbia-academy-admin-actions-contract',
  generatedAt: new Date().toISOString(),
  verdict: failures.length ? 'NO_GO_ACADEMY_ADMIN_ACTIONS_CONTRACT' : 'GO_ACADEMY_ADMIN_ACTIONS_PREVIEW_ONLY',
  recordCount: rows.length,
  failureCount: failures.length,
  byAction,
  allowedActions: [...actions],
  statuses: [...statuses],
  contentTypes: [...contentTypes],
  allowedRoles: [...allowedRoles],
  results,
  reusableCxorbia: true,
  exclusiveClient: false,
  safeState: { deploy: false, providerCalls: false, dbWrites: false, imports: false, production: false, publishing: false }
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'cxorbia-academy-admin-actions-contract.json'), JSON.stringify(report, null, 2), 'utf8');
const md = [
  '# CXOrbia academy admin actions contract', '',
  `Generated: ${report.generatedAt}`,
  `Verdict: ${report.verdict}`,
  `Records: ${report.recordCount}`,
  `Failures: ${report.failureCount}`, '',
  '## Action summary',
  ...Object.entries(byAction).map(([action, count]) => `- ${action}: ${count}`), '',
  '## Results',
  ...results.map(r => `- ${r.eventId}: ${r.action} / ${r.contentId || 'filters'} / ${r.contentType || '-'} / ${r.ok ? 'ok' : r.errors.join(', ')}`), '',
  '## Safe state',
  '- No deploy', '- No provider calls', '- No DB writes', '- No imports', '- No production', '- No publishing', ''
].join('\n');
fs.writeFileSync(path.join(outDir, 'cxorbia-academy-admin-actions-contract.md'), md, 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
