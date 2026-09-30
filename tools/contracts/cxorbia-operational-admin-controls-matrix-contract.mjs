#!/usr/bin/env node
/*
  CXOrbia - operational admin controls matrix contract
  Synthetic validation only. No deploy, no provider calls, no DB writes, no imports, no notifications sent.
*/

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : '.tmp/cxorbia-operational-admin-controls-matrix-contract';

const modules = [
  { module: 'certifications', needsAdminControl: true, actions: ['search_by_status', 'grant_single_waiver', 'revoke_single_waiver', 'request_single_certification', 'resolve_missing_reflection'], requiresAudit: true, claudeImpact: true, academyImpact: true },
  { module: 'applications', needsAdminControl: true, actions: ['search_all_statuses', 'approve_application', 'reject_application', 'move_to_review', 'reopen_application'], requiresAudit: true, claudeImpact: true, academyImpact: false },
  { module: 'assignments', needsAdminControl: true, actions: ['assign_shopper', 'unassign_with_reason', 'resolve_duplicate_source', 'send_to_review'], requiresAudit: true, claudeImpact: true, academyImpact: false },
  { module: 'visits', needsAdminControl: true, actions: ['edit_window_by_rule', 'mark_review_required', 'correct_status_with_reason', 'block_unavailable'], requiresAudit: true, claudeImpact: true, academyImpact: false },
  { module: 'settlements', needsAdminControl: true, actions: ['review_amounts', 'schedule_settlement', 'confirm_settlement', 'carry_forward', 'block_for_review'], requiresAudit: true, claudeImpact: true, academyImpact: true },
  { module: 'evidence', needsAdminControl: true, actions: ['mark_required', 'review_uploaded', 'reject_with_reason', 'approve_with_evidence_ref'], requiresAudit: true, claudeImpact: true, academyImpact: true },
  { module: 'integrations', needsAdminControl: true, actions: ['view_gate_state', 'retry_outbox_preview', 'pause_integration', 'send_conflict_to_review'], requiresAudit: true, claudeImpact: true, academyImpact: false },
  { module: 'academy', needsAdminControl: true, actions: ['map_content_to_rule', 'mark_content_missing', 'send_content_to_review', 'publish_after_approval'], requiresAudit: true, claudeImpact: true, academyImpact: true },
  { module: 'imports', needsAdminControl: true, actions: ['preview_import', 'review_anomaly', 'approve_clean_batch', 'reject_row'], requiresAudit: true, claudeImpact: true, academyImpact: false },
  { module: 'notifications', needsAdminControl: true, actions: ['preview_message', 'approve_message', 'pause_message', 'resend_if_allowed'], requiresAudit: true, claudeImpact: true, academyImpact: true },
  { module: 'dashboard', needsAdminControl: false, actions: ['drilldown_only'], requiresAudit: false, claudeImpact: true, academyImpact: false }
];

function validate(row) {
  const errors = [];
  const warnings = [];
  if (!row.module) errors.push('missing_module');
  if (typeof row.needsAdminControl !== 'boolean') errors.push('missing_needsAdminControl');
  if (!Array.isArray(row.actions) || row.actions.length === 0) errors.push('missing_actions');
  if (row.needsAdminControl && row.requiresAudit !== true) errors.push('admin_control_without_audit');
  if (row.needsAdminControl && row.claudeImpact !== true) warnings.push('admin_control_without_claude_impact_flag');
  if (!row.needsAdminControl && row.actions.some(a => !a.includes('drilldown'))) warnings.push('passive_module_has_operational_actions');
  return { module: row.module || null, ok: errors.length === 0, errors, warnings, needsAdminControl: row.needsAdminControl, actionCount: row.actions?.length || 0, claudeImpact: row.claudeImpact, academyImpact: row.academyImpact };
}

const results = modules.map(validate);
const failures = results.filter(r => !r.ok);
const operationalModules = results.filter(r => r.needsAdminControl).map(r => r.module);
const claudeModules = results.filter(r => r.claudeImpact).map(r => r.module);
const academyModules = results.filter(r => r.academyImpact).map(r => r.module);

const report = {
  gate: 'cxorbia-operational-admin-controls-matrix-contract',
  generatedAt: new Date().toISOString(),
  verdict: failures.length ? 'NO_GO_OPERATIONAL_ADMIN_CONTROLS_MATRIX' : 'GO_OPERATIONAL_ADMIN_CONTROLS_MATRIX_PREVIEW_ONLY',
  moduleCount: modules.length,
  failureCount: failures.length,
  operationalModules,
  claudeModules,
  academyModules,
  results,
  reusableCxorbia: true,
  exclusiveClient: false,
  safeState: { deploy: false, providerCalls: false, dbWrites: false, imports: false, production: false, notificationsSent: false }
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'cxorbia-operational-admin-controls-matrix-contract.json'), JSON.stringify(report, null, 2), 'utf8');
const md = [
  '# CXOrbia operational admin controls matrix contract', '',
  `Generated: ${report.generatedAt}`,
  `Verdict: ${report.verdict}`,
  `Modules: ${report.moduleCount}`,
  `Failures: ${report.failureCount}`, '',
  '## Operational modules',
  ...operationalModules.map(m => `- ${m}`), '',
  '## Results',
  ...results.map(r => `- ${r.module}: admin=${r.needsAdminControl} actions=${r.actionCount} / ${r.ok ? 'ok' : r.errors.join(', ')}`), '',
  '## Safe state',
  '- No deploy', '- No provider calls', '- No DB writes', '- No imports', '- No production', '- No notifications sent', ''
].join('\n');
fs.writeFileSync(path.join(outDir, 'cxorbia-operational-admin-controls-matrix-contract.md'), md, 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
