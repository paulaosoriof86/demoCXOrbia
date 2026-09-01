#!/usr/bin/env node
/*
  CXOrbia - project runtime admin actions contract
  Synthetic validation only. No deploy, no provider calls, no DB writes, no imports, no external sync.
*/

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : '.tmp/cxorbia-project-runtime-admin-actions-contract';

const actions = new Set(['search_project_config', 'preview_project_config', 'request_config_change', 'approve_config_change', 'pause_project_rule', 'restore_project_rule', 'map_questionnaire_source', 'map_external_source', 'mark_gate_required']);
const statuses = new Set(['draft', 'preview_ready', 'change_requested', 'approved_preview', 'paused', 'restored', 'mapped', 'gate_required', 'blocked_gate']);
const configAreas = new Set(['country_currency', 'external_source', 'questionnaire_source', 'documents', 'scheduling_rules', 'rescheduling_rules', 'cancellation_rules', 'payments_rules', 'academy_rules', 'integration_gates']);
const allowedRoles = new Set(['superadmin', 'admin', 'ops', 'technical_reviewer']);

const rows = [
  { eventId: 'proj-admin-001', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'search_project_config', actorRole: 'admin', configArea: null, ruleRef: null, fromStatus: null, toStatus: null, reasonCode: null, auditRef: 'audit-proj-001' },
  { eventId: 'proj-admin-002', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'preview_project_config', actorRole: 'technical_reviewer', configArea: 'questionnaire_source', ruleRef: 'rule-demo-002', fromStatus: 'draft', toStatus: 'preview_ready', reasonCode: 'preview_requested', auditRef: 'audit-proj-002' },
  { eventId: 'proj-admin-003', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'request_config_change', actorRole: 'ops', configArea: 'scheduling_rules', ruleRef: 'rule-demo-003', fromStatus: 'preview_ready', toStatus: 'change_requested', reasonCode: 'operation_change_needed', auditRef: 'audit-proj-003' },
  { eventId: 'proj-admin-004', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'map_questionnaire_source', actorRole: 'admin', configArea: 'questionnaire_source', ruleRef: 'rule-demo-004', fromStatus: 'preview_ready', toStatus: 'mapped', reasonCode: 'source_selected', auditRef: 'audit-proj-004' },
  { eventId: 'proj-admin-005', tenantId: 'tenant-demo', projectId: 'project-demo', action: 'mark_gate_required', actorRole: 'superadmin', configArea: 'integration_gates', ruleRef: 'rule-demo-005', fromStatus: 'approved_preview', toStatus: 'gate_required', reasonCode: 'external_integration_required', auditRef: 'audit-proj-005' }
];

function validate(row) {
  const errors = [];
  const warnings = [];
  for (const field of ['eventId', 'tenantId', 'projectId', 'action', 'actorRole', 'auditRef']) {
    if (!row[field]) errors.push(`missing_${field}`);
  }
  if (!actions.has(row.action)) errors.push('invalid_action');
  if (!allowedRoles.has(row.actorRole)) errors.push('actorRole_not_allowed');
  if (row.action === 'search_project_config') {
    if (row.ruleRef) warnings.push('search_should_use_filters_not_direct_rule');
  } else {
    for (const field of ['configArea', 'ruleRef', 'fromStatus', 'toStatus', 'reasonCode']) {
      if (!row[field]) errors.push(`missing_${field}_for_project_config_action`);
    }
    if (row.configArea && !configAreas.has(row.configArea)) errors.push('invalid_configArea');
    if (row.fromStatus && !statuses.has(row.fromStatus)) errors.push('invalid_fromStatus');
    if (row.toStatus && !statuses.has(row.toStatus)) errors.push('invalid_toStatus');
  }
  if (row.ruleRef === '*') errors.push('global_project_config_action_not_allowed');
  if (row.action === 'approve_config_change' && !['superadmin', 'admin'].includes(row.actorRole)) errors.push('approval_requires_admin_or_superadmin');
  if (row.action === 'map_questionnaire_source' && row.configArea !== 'questionnaire_source') errors.push('questionnaire_mapping_requires_questionnaire_area');
  if (row.action === 'map_external_source' && row.configArea !== 'external_source') errors.push('external_mapping_requires_external_source_area');
  return { eventId: row.eventId || null, ok: errors.length === 0, errors, warnings, action: row.action, actorRole: row.actorRole, configArea: row.configArea, ruleRef: row.ruleRef, fromStatus: row.fromStatus, toStatus: row.toStatus };
}

const results = rows.map(validate);
const failures = results.filter(r => !r.ok);
const byAction = results.reduce((acc, r) => {
  acc[r.action] = (acc[r.action] || 0) + 1;
  return acc;
}, {});

const report = {
  gate: 'cxorbia-project-runtime-admin-actions-contract',
  generatedAt: new Date().toISOString(),
  verdict: failures.length ? 'NO_GO_PROJECT_RUNTIME_ADMIN_ACTIONS_CONTRACT' : 'GO_PROJECT_RUNTIME_ADMIN_ACTIONS_PREVIEW_ONLY',
  recordCount: rows.length,
  failureCount: failures.length,
  byAction,
  allowedActions: [...actions],
  statuses: [...statuses],
  configAreas: [...configAreas],
  allowedRoles: [...allowedRoles],
  results,
  reusableCxorbia: true,
  exclusiveClient: false,
  safeState: { deploy: false, providerCalls: false, dbWrites: false, imports: false, production: false, externalSync: false }
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'cxorbia-project-runtime-admin-actions-contract.json'), JSON.stringify(report, null, 2), 'utf8');
const md = [
  '# CXOrbia project runtime admin actions contract', '',
  `Generated: ${report.generatedAt}`,
  `Verdict: ${report.verdict}`,
  `Records: ${report.recordCount}`,
  `Failures: ${report.failureCount}`, '',
  '## Action summary',
  ...Object.entries(byAction).map(([action, count]) => `- ${action}: ${count}`), '',
  '## Results',
  ...results.map(r => `- ${r.eventId}: ${r.action} / ${r.configArea || 'filters'} / ${r.ruleRef || '-'} / ${r.ok ? 'ok' : r.errors.join(', ')}`), '',
  '## Safe state',
  '- No deploy', '- No provider calls', '- No DB writes', '- No imports', '- No production', '- No external sync', ''
].join('\n');
fs.writeFileSync(path.join(outDir, 'cxorbia-project-runtime-admin-actions-contract.md'), md, 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
