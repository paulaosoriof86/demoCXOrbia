#!/usr/bin/env node
/*
  CXOrbia - certification carryover contract
  Synthetic validation only. No deploy, no provider calls, no DB writes, no imports.
*/

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : '.tmp/cxorbia-certification-carryover-contract';

const statuses = new Set(['not_required', 'required_pending', 'in_progress', 'passed', 'failed', 'expired', 'manual_review', 'carryover_accepted']);
const sources = new Set(['platform', 'historical_import', 'manual_review', 'external_source']);

const rows = [
  { recordId: 'cert-001', tenantId: 'tenant-demo', projectId: 'project-demo', shopperId: 'shopper-demo-001', certificationId: 'cinepolis-basic', status: 'passed', source: 'platform', score: 92, presentedAt: '2026-06-01', expiresAt: null, carryoverEligible: true, reviewRequired: false },
  { recordId: 'cert-002', tenantId: 'tenant-demo', projectId: 'project-demo', shopperId: 'shopper-demo-002', certificationId: 'cinepolis-basic', status: 'carryover_accepted', source: 'historical_import', score: null, presentedAt: '2026-05-15', expiresAt: null, carryoverEligible: true, reviewRequired: false },
  { recordId: 'cert-003', tenantId: 'tenant-demo', projectId: 'project-demo', shopperId: 'shopper-demo-003', certificationId: 'new-project-basic', status: 'required_pending', source: 'platform', score: null, presentedAt: null, expiresAt: null, carryoverEligible: false, reviewRequired: false },
  { recordId: 'cert-004', tenantId: 'tenant-demo', projectId: 'project-demo', shopperId: 'shopper-demo-004', certificationId: 'external-cert', status: 'manual_review', source: 'external_source', score: null, presentedAt: '2026-04-20', expiresAt: null, carryoverEligible: true, reviewRequired: true }
];

function validate(row) {
  const errors = [];
  const warnings = [];
  for (const field of ['recordId', 'tenantId', 'projectId', 'shopperId', 'certificationId', 'status', 'source']) {
    if (!row[field]) errors.push(`missing_${field}`);
  }
  if (!statuses.has(row.status)) errors.push('invalid_status');
  if (!sources.has(row.source)) errors.push('invalid_source');
  if (row.status === 'passed' && typeof row.score !== 'number') errors.push('passed_missing_score');
  if (row.status === 'carryover_accepted' && row.carryoverEligible !== true) errors.push('carryover_not_eligible');
  if (row.status === 'required_pending' && row.presentedAt) warnings.push('pending_with_presentedAt');
  if (row.reviewRequired === true && row.status !== 'manual_review') warnings.push('review_required_status_not_manual_review');
  return { recordId: row.recordId || null, ok: errors.length === 0, errors, warnings, status: row.status, source: row.source, carryoverEligible: row.carryoverEligible };
}

const results = rows.map(validate);
const failures = results.filter(r => !r.ok);
const byStatus = results.reduce((acc, r) => {
  acc[r.status] = (acc[r.status] || 0) + 1;
  return acc;
}, {});

const report = {
  gate: 'cxorbia-certification-carryover-contract',
  generatedAt: new Date().toISOString(),
  verdict: failures.length ? 'NO_GO_CERTIFICATION_CARRYOVER_CONTRACT' : 'GO_CERTIFICATION_CARRYOVER_PREVIEW_ONLY',
  rowCount: rows.length,
  failureCount: failures.length,
  byStatus,
  results,
  reusableCxorbia: true,
  exclusiveClient: false,
  safeState: { deploy: false, providerCalls: false, dbWrites: false, imports: false, production: false }
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'cxorbia-certification-carryover-contract.json'), JSON.stringify(report, null, 2), 'utf8');
const md = [
  '# CXOrbia certification carryover contract', '',
  `Generated: ${report.generatedAt}`,
  `Verdict: ${report.verdict}`,
  `Rows: ${report.rowCount}`,
  `Failures: ${report.failureCount}`, '',
  '## Status summary',
  ...Object.entries(byStatus).map(([status, count]) => `- ${status}: ${count}`), '',
  '## Results',
  ...results.map(r => `- ${r.recordId}: ${r.status} / ${r.source} / ${r.ok ? 'ok' : r.errors.join(', ')}`), '',
  '## Safe state',
  '- No deploy', '- No provider calls', '- No DB writes', '- No imports', '- No production', ''
].join('\n');
fs.writeFileSync(path.join(outDir, 'cxorbia-certification-carryover-contract.md'), md, 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
