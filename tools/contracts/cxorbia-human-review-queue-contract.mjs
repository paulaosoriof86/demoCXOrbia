#!/usr/bin/env node
/*
  CXOrbia - reusable human review queue contract
  Synthetic validation only. No deploy, no provider calls, no DB writes, no imports.
*/

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : '.tmp/cxorbia-human-review-queue-contract';

const entityTypes = new Set(['assignment', 'visit', 'shopper', 'certification', 'payment', 'import_record', 'integration_event', 'academy_content', 'project_config']);
const issueTypes = new Set(['sync_conflict', 'missing_stable_key', 'data_mismatch', 'sensitive_data_risk', 'certification_review', 'payment_review', 'import_anomaly', 'provider_failure', 'academy_content_review', 'project_config_gap']);
const statuses = new Set(['open', 'assigned', 'in_review', 'resolved', 'rejected', 'escalated', 'archived']);
const severities = new Set(['low', 'medium', 'high', 'critical']);
const roles = new Set(['superadmin', 'admin', 'ops', 'finance', 'academy_admin', 'technical_reviewer']);

const reviewItems = [
  { reviewId: 'rev-sync-001', tenantId: 'tenant-demo', projectId: 'project-demo', entityType: 'assignment', entityRef: 'visit-001', issueType: 'sync_conflict', severity: 'high', status: 'open', assignedRole: 'ops', evidenceRefs: ['assignment-conflict-preview'], source: 'sync_gate', createdAt: '2026-07-07T00:00:00.000Z' },
  { reviewId: 'rev-cert-002', tenantId: 'tenant-demo', projectId: 'project-demo', entityType: 'certification', entityRef: 'cert-bank-001', issueType: 'certification_review', severity: 'medium', status: 'assigned', assignedRole: 'academy_admin', evidenceRefs: ['gemini-draft'], source: 'ai_gate', createdAt: '2026-07-07T00:00:00.000Z' },
  { reviewId: 'rev-pay-003', tenantId: 'tenant-demo', projectId: 'project-demo', entityType: 'payment', entityRef: 'payment-batch-001', issueType: 'payment_review', severity: 'high', status: 'in_review', assignedRole: 'finance', evidenceRefs: ['payment-preview'], source: 'payment_gate', createdAt: '2026-07-07T00:00:00.000Z' },
  { reviewId: 'rev-config-004', tenantId: 'tenant-demo', projectId: null, entityType: 'project_config', entityRef: 'project-demo', issueType: 'project_config_gap', severity: 'medium', status: 'open', assignedRole: 'admin', evidenceRefs: ['config-contract'], source: 'config_gate', createdAt: '2026-07-07T00:00:00.000Z' }
];

function stableReviewKey(item) {
  if (!item.tenantId || !item.projectId || !item.entityType || !item.entityRef || !item.issueType) return null;
  return [item.tenantId, item.projectId, item.entityType, item.entityRef, item.issueType].join('::');
}

function validateReviewItem(item) {
  const errors = [];
  const warnings = [];
  if (!item.reviewId) errors.push('missing_reviewId');
  if (!item.tenantId) errors.push('missing_tenantId');
  if (!item.projectId) errors.push('missing_projectId');
  if (!entityTypes.has(item.entityType)) errors.push('invalid_entityType');
  if (!item.entityRef) errors.push('missing_entityRef');
  if (!issueTypes.has(item.issueType)) errors.push('invalid_issueType');
  if (!severities.has(item.severity)) errors.push('invalid_severity');
  if (!statuses.has(item.status)) errors.push('invalid_status');
  if (!roles.has(item.assignedRole)) errors.push('invalid_assignedRole');
  if (!Array.isArray(item.evidenceRefs)) errors.push('invalid_evidenceRefs');
  if (Array.isArray(item.evidenceRefs) && item.evidenceRefs.length === 0) warnings.push('review_without_evidenceRefs');
  if (!item.source) errors.push('missing_source');
  if (!item.createdAt) errors.push('missing_createdAt');
  const key = stableReviewKey(item);
  if (!key) errors.push('missing_stableReviewKey');
  if (item.severity === 'critical' && item.status === 'archived') errors.push('critical_item_cannot_start_archived');
  return { reviewId: item.reviewId || null, stableReviewKey: key, ok: errors.length === 0, errors, warnings, status: item.status, severity: item.severity, assignedRole: item.assignedRole };
}

const results = reviewItems.map(validateReviewItem);
const failures = results.filter(r => !r.ok);
const report = {
  gate: 'cxorbia-human-review-queue-contract',
  generatedAt: new Date().toISOString(),
  verdict: failures.length ? 'NO_GO_HUMAN_REVIEW_CONTRACT' : 'GO_HUMAN_REVIEW_CONTRACT_PREVIEW_ONLY',
  itemCount: reviewItems.length,
  failureCount: failures.length,
  results,
  entityTypes: [...entityTypes],
  issueTypes: [...issueTypes],
  statuses: [...statuses],
  severities: [...severities],
  roles: [...roles],
  reusableCxorbia: true,
  exclusiveClient: false,
  safeState: { deploy: false, providerCalls: false, dbWrites: false, imports: false, production: false }
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'cxorbia-human-review-queue-contract.json'), JSON.stringify(report, null, 2), 'utf8');
const md = [
  '# CXOrbia human review queue contract', '',
  `Generated: ${report.generatedAt}`,
  `Verdict: ${report.verdict}`,
  `Items: ${report.itemCount}`,
  `Failures: ${report.failureCount}`, '',
  '## Results',
  ...results.map(r => `- ${r.reviewId}: ${r.ok ? 'ok' : r.errors.join(', ')} / ${r.status} / ${r.assignedRole}`), '',
  '## Safe state',
  '- No deploy', '- No provider calls', '- No DB writes', '- No imports', '- No production', ''
].join('\n');
fs.writeFileSync(path.join(outDir, 'cxorbia-human-review-queue-contract.md'), md, 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
