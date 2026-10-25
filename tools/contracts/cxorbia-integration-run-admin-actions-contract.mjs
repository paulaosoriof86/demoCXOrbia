#!/usr/bin/env node
/*
  CXOrbia - integration run admin actions contract
  Synthetic validation only. No deploy, no provider calls, no DB writes, no imports, no external sync.
*/

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : '.tmp/cxorbia-integration-run-admin-actions-contract';

const actions = new Set(['search_runs', 'preview_run', 'approve_run', 'pause_run', 'retry_if_allowed', 'mark_conflict', 'resolve_conflict', 'export_run_report']);
const statuses = new Set(['draft', 'preview_ready', 'approved_preview', 'paused', 'retry_pending', 'conflict_review', 'resolved_review', 'report_ready', 'blocked_gate']);
const integrationTypes = new Set(['external_source_sync', 'notification_dispatch', 'import_pipeline', 'questionnaire_link_sync', 'settlement_status_sync', 'academy_content_sync']);
const allowedRoles = new Set(['superadmin', 'admin', 'ops', 'technical_reviewer']);

const rows = [
  { eventId: 'int-run-001', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'search_runs', actorRole: 'admin', runId: null, integrationType: null, fromStatus: null, toStatus: null, gateState: 'preview', reasonCode: null, auditRef: 'audit-run-001' },
  { eventId: 'int-run-002', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'preview_run', actorRole: 'technical_reviewer', runId: 'run-demo-002', integrationType: 'external_source_sync', fromStatus: 'draft', toStatus: 'preview_ready', gateState: 'preview', reasonCode: 'preview_requested', auditRef: 'audit-run-002' },
  { eventId: 'int-run-003', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'approve_run', actorRole: 'superadmin', runId: 'run-demo-003', integrationType: 'questionnaire_link_sync', fromStatus: 'preview_ready', toStatus: 'approved_preview', gateState: 'preview', reasonCode: 'reviewed_for_preview', auditRef: 'audit-run-003' },
  { eventId: 'int-run-004', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'mark_conflict', actorRole: 'ops', runId: 'run-demo-004', integrationType: 'settlement_status_sync', fromStatus: 'preview_ready', toStatus: 'conflict_review', gateState: 'preview', reasonCode: 'source_conflict', auditRef: 'audit-run-004' },
  { eventId: 'int-run-005', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'export_run_report', actorRole: 'technical_reviewer', runId: 'run-demo-005', integrationType: 'import_pipeline', fromStatus: 'resolved_review', toStatus: 'report_ready', gateState: 'preview', reasonCode: 'report_requested', auditRef: 'audit-run-005' }
];

function validate(row) {
  const errors = [];
  const warnings = [];
  for (const field of ['eventId', 'tenantId', 'projectId', 'action', 'actorRole', 'gateState', 'auditRef']) {
    if (!row[field]) errors.push(`missing_${field}`);
  }
  if (!actions.has(row.action)) errors.push('invalid_action');
  if (!allowedRoles.has(row.actorRole)) errors.push('actorRole_not_allowed');
  if (row.action === 'search_runs') {
    if (row.runId) warnings.push('search_should_use_filters_not_direct_run');
  } else {
    for (const field of ['runId', 'integrationType', 'fromStatus', 'toStatus', 'reasonCode']) {
      if (!row[field]) errors.push(`missing_${field}_for_integration_run_action`);
    }
    if (row.integrationType && !integrationTypes.has(row.integrationType)) errors.push('invalid_integrationType');
    if (row.fromStatus && !statuses.has(row.fromStatus)) errors.push('invalid_fromStatus');
    if (row.toStatus && !statuses.has(row.toStatus)) errors.push('invalid_toStatus');
  }
  if (row.runId === '*') errors.push('global_run_action_not_allowed');
  if (row.action === 'approve_run' && !['superadmin', 'admin'].includes(row.actorRole)) errors.push('approval_requires_admin_or_superadmin');
  if (row.action === 'retry_if_allowed' && row.gateState !== 'active_controlled') warnings.push('retry_without_active_gate_must_remain_preview_or_review');
  if (row.action === 'resolve_conflict' && row.fromStatus !== 'conflict_review') errors.push('resolve_conflict_requires_conflict_review');
  return { eventId: row.eventId || null, ok: errors.length === 0, errors, warnings, action: row.action, actorRole: row.actorRole, runId: row.runId, integrationType: row.integrationType, fromStatus: row.fromStatus, toStatus: row.toStatus, gateState: row.gateState };
}

const results = rows.map(validate);
const failures = results.filter(r => !r.ok);
const byAction = results.reduce((acc, r) => {
  acc[r.action] = (acc[r.action] || 0) + 1;
  return acc;
}, {});

const report = {
  gate: 'cxorbia-integration-run-admin-actions-contract',
  generatedAt: new Date().toISOString(),
  verdict: failures.length ? 'NO_GO_INTEGRATION_RUN_ADMIN_ACTIONS_CONTRACT' : 'GO_INTEGRATION_RUN_ADMIN_ACTIONS_PREVIEW_ONLY',
  recordCount: rows.length,
  failureCount: failures.length,
  byAction,
  allowedActions: [...actions],
  statuses: [...statuses],
  integrationTypes: [...integrationTypes],
  allowedRoles: [...allowedRoles],
  results,
  reusableCxorbia: true,
  exclusiveClient: false,
  safeState: { deploy: false, providerCalls: false, dbWrites: false, imports: false, production: false, externalSync: false }
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'cxorbia-integration-run-admin-actions-contract.json'), JSON.stringify(report, null, 2), 'utf8');
const md = [
  '# CXOrbia integration run admin actions contract', '',
  `Generated: ${report.generatedAt}`,
  `Verdict: ${report.verdict}`,
  `Records: ${report.recordCount}`,
  `Failures: ${report.failureCount}`, '',
  '## Action summary',
  ...Object.entries(byAction).map(([action, count]) => `- ${action}: ${count}`), '',
  '## Results',
  ...results.map(r => `- ${r.eventId}: ${r.action} / ${r.runId || 'filters'} / ${r.integrationType || '-'} / ${r.ok ? 'ok' : r.errors.join(', ')}`), '',
  '## Safe state',
  '- No deploy', '- No provider calls', '- No DB writes', '- No imports', '- No production', '- No external sync', ''
].join('\n');
fs.writeFileSync(path.join(outDir, 'cxorbia-integration-run-admin-actions-contract.md'), md, 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
