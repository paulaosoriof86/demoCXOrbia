#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');
const argv = process.argv.slice(2);
const arg = (name, fallback = null) => {
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : fallback;
};
const planPath = path.resolve(repo, arg('--plan', '.tmp/firestore-materialization-plan/firestore-materialization-plan.json'));
const outPath = path.resolve(repo, arg('--out', '.tmp/firestore-materialization-plan/verification.json'));
const contractPath = path.resolve(repo, arg('--contract', 'backend/contracts/phase-a-firestore-materialization-plan-v1.json'));
const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const stableJson = value => JSON.stringify(value, null, 2) + '\n';
const blockers = [];
const warnings = [];
const checks = [];
const check = (name, condition, detail = null) => {
  checks.push({ name, ok: Boolean(condition), detail });
  if (!condition) blockers.push(name + (detail ? `:${detail}` : ''));
};
const sensitiveTerms = contract.security.denyFieldNamesContaining.map(value => String(value).toLowerCase());
const paths = plan.operations.map(item => item.documentPath);
const sourceCounts = plan.counts?.source || {};
const domainCounts = plan.counts?.byDomain || {};
check('mode_is_dry_run', plan.mode === 'dry_run');
check('writes_false', plan.writes === false && plan.safeState?.writes === false);
check('imported_false', plan.imported === false && plan.safeState?.imported === false);
check('production_false', plan.production === false && plan.safeState?.production === false);
check('operations_are_create', plan.operations.every(item => item.operation === 'create'));
check('precondition_exists_false', plan.operations.every(item => item.precondition?.exists === false));
check('unique_document_paths', new Set(paths).size === paths.length);
check('batch_size_limit', plan.batches.every(batch => batch.operationCount <= contract.writePlan.maxOperationsPerBatch));
check('batch_operation_sum', plan.batches.reduce((sum, batch) => sum + batch.operationCount, 0) === plan.operations.length);
check('tenant_count', domainCounts.tenant === 1);
check('project_count', domainCounts.project === 1);
check('hr_import_count', domainCounts.hrImport === 1);
check('period_count', domainCounts.period === 14, String(domainCounts.period));
check('visit_count', domainCounts.visit === 616, String(domainCounts.visit));
check(
  'shopper_count_matches_canonical_source',
  Number(sourceCounts.shoppers) > 0 && domainCounts.shopper === sourceCounts.shoppers,
  `planned=${domainCounts.shopper};source=${sourceCounts.shoppers}`
);
check('liquidation_count', domainCounts.liquidation === 572, String(domainCounts.liquidation));
check('no_payment_operations', !plan.operations.some(item => ['payment', 'paymentLot', 'financeMovement'].includes(item.domain)));
check('no_certification_operations', !plan.operations.some(item => item.domain === 'certification'));
check('no_paid_records', !plan.operations.some(item => item.data?.paid === true || item.data?.paymentState === 'paid'));
check('liquidations_not_lot_eligible', plan.operations.filter(item => item.domain === 'liquidation').every(item => item.data?.lotEligible === false));
check('period_links_valid', plan.operations.filter(item => item.domain === 'visit').every(item => /^\d{4}-\d{2}$/.test(item.data?.periodId || '')));
check('all_source_safe', plan.operations.every(item => item.data?.sourceSafe === true && item.data?.imported === false && item.data?.production === false));

const visitIds = new Set(plan.operations.filter(item => item.domain === 'visit').map(item => item.data.visitId));
check('liquidation_visit_links_valid', plan.operations.filter(item => item.domain === 'liquidation').every(item => visitIds.has(item.data.visitId)));

function scan(value, trail = '') {
  if (Array.isArray(value)) return value.forEach((item, index) => scan(item, `${trail}[${index}]`));
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    const lower = key.toLowerCase();
    if (sensitiveTerms.some(term => lower.includes(term))) blockers.push(`sensitive_field:${trail ? trail + '.' : ''}${key}`);
    scan(child, trail ? `${trail}.${key}` : key);
  }
}
scan(plan.operations.map(item => item.data));

const recalculatedPathsSha = sha256(Buffer.from(paths.join('\n')));
const result = {
  ok: blockers.length === 0,
  planId: plan.planId,
  planSha256: plan.planSha256,
  operationPathsSha256: recalculatedPathsSha,
  counts: plan.counts,
  batches: plan.batches.map(batch => ({ batchId: batch.batchId, operationCount: batch.operationCount })),
  blockedDomains: plan.blockedDomains,
  checks,
  warnings,
  blockers: [...new Set(blockers)],
  safeState: plan.safeState
};
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, stableJson(result), 'utf8');
console.log(stableJson(result));
if (!result.ok) process.exit(1);
