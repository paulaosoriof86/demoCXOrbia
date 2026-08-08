#!/usr/bin/env node
/*
  CXOrbia - Academia/project rules sync contract
  Synthetic validation only. No deploy, no provider calls, no DB writes, no imports.
*/

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : '.tmp/cxorbia-academia-project-rules-sync-contract';

const ruleTypes = new Set(['source', 'questionnaire', 'evidence', 'certification', 'scheduling', 'payments', 'integration_gate', 'human_review']);
const contentTypes = new Set(['manual', 'course', 'lesson', 'checklist', 'faq', 'glossary', 'notification']);
const roles = new Set(['superadmin', 'admin', 'ops', 'shopper', 'client', 'academy_admin']);
const statuses = new Set(['missing', 'draft', 'human_review_required', 'approved', 'published', 'archived']);

const mappings = [
  { mappingId: 'map-cert-001', tenantId: 'tenant-demo', projectId: 'project-demo', ruleType: 'certification', ruleRef: 'cert-required', contentType: 'course', contentRef: 'course-cert-demo', targetRoles: ['shopper'], status: 'published', requiresNotification: true },
  { mappingId: 'map-pay-002', tenantId: 'tenant-demo', projectId: 'project-demo', ruleType: 'payments', ruleRef: 'payments-preview', contentType: 'manual', contentRef: 'manual-payments-admin', targetRoles: ['admin', 'finance'], status: 'human_review_required', requiresNotification: false },
  { mappingId: 'map-gate-003', tenantId: 'tenant-demo', projectId: 'project-demo', ruleType: 'integration_gate', ruleRef: 'make-preview', contentType: 'faq', contentRef: 'faq-gates', targetRoles: ['admin', 'ops'], status: 'approved', requiresNotification: true },
  { mappingId: 'map-review-004', tenantId: 'tenant-demo', projectId: 'project-demo', ruleType: 'human_review', ruleRef: 'sync-conflict', contentType: 'checklist', contentRef: null, targetRoles: ['ops'], status: 'missing', requiresNotification: false }
];

function validateMapping(item) {
  const errors = [];
  const warnings = [];
  if (!item.mappingId) errors.push('missing_mappingId');
  if (!item.tenantId) errors.push('missing_tenantId');
  if (!item.projectId) errors.push('missing_projectId');
  if (!ruleTypes.has(item.ruleType)) errors.push('invalid_ruleType');
  if (!item.ruleRef) errors.push('missing_ruleRef');
  if (!contentTypes.has(item.contentType)) errors.push('invalid_contentType');
  if (!statuses.has(item.status)) errors.push('invalid_status');
  if (!Array.isArray(item.targetRoles) || item.targetRoles.length === 0) errors.push('missing_targetRoles');
  for (const role of item.targetRoles || []) if (!roles.has(role)) errors.push(`invalid_role_${role}`);
  if (item.status !== 'missing' && !item.contentRef) errors.push('missing_contentRef_for_non_missing_status');
  if (item.status === 'published' && item.requiresNotification !== true) warnings.push('published_mapping_without_notification_flag');
  if (item.ruleType === 'certification' && !item.targetRoles.includes('shopper')) warnings.push('certification_without_shopper_role');
  return { mappingId: item.mappingId || null, ok: errors.length === 0, errors, warnings, ruleType: item.ruleType, contentType: item.contentType, status: item.status, targetRoles: item.targetRoles || [] };
}

const results = mappings.map(validateMapping);
const failures = results.filter(r => !r.ok);
const missingContent = results.filter(r => r.status === 'missing').length;
const reviewRequired = results.filter(r => r.status === 'human_review_required').length;
const report = {
  gate: 'cxorbia-academia-project-rules-sync-contract',
  generatedAt: new Date().toISOString(),
  verdict: failures.length ? 'NO_GO_ACADEMIA_RULE_SYNC_CONTRACT' : 'GO_ACADEMIA_RULE_SYNC_CONTRACT_PREVIEW_ONLY',
  mappingCount: mappings.length,
  failureCount: failures.length,
  missingContent,
  reviewRequired,
  results,
  reusableCxorbia: true,
  exclusiveClient: false,
  safeState: { deploy: false, providerCalls: false, dbWrites: false, imports: false, production: false }
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'cxorbia-academia-project-rules-sync-contract.json'), JSON.stringify(report, null, 2), 'utf8');
const md = [
  '# CXOrbia Academia project rules sync contract', '',
  `Generated: ${report.generatedAt}`,
  `Verdict: ${report.verdict}`,
  `Mappings: ${report.mappingCount}`,
  `Failures: ${report.failureCount}`,
  `Missing content: ${report.missingContent}`,
  `Review required: ${report.reviewRequired}`, '',
  '## Results',
  ...results.map(r => `- ${r.mappingId}: ${r.ruleType} -> ${r.contentType} / ${r.status} / ${r.ok ? 'ok' : r.errors.join(', ')}`), '',
  '## Safe state',
  '- No deploy', '- No provider calls', '- No DB writes', '- No imports', '- No production', ''
].join('\n');
fs.writeFileSync(path.join(outDir, 'cxorbia-academia-project-rules-sync-contract.md'), md, 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
