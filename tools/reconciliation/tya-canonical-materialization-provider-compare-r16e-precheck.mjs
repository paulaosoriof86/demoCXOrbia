#!/usr/bin/env node
/* CXOrbia Phase A R16E — offline precheck for the manual provider comparison. */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const index = argv.indexOf(name);
  return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
};
const contractPath = arg('--contract', 'backend/contracts/phase-a-canonical-materialization-provider-compare-r16e-v1.json');
const planPath = arg('--plan', '.tmp/r16e-r16d-plan/r14c-financial-overlay-review-plan-r16d.json');
const outDirArg = arg('--out', '.tmp/canonical-provider-compare-r16e-precheck');
const outDir = path.isAbsolute(outDirArg) ? outDirArg : path.join(root, outDirArg);
const readJson = file => JSON.parse(fs.readFileSync(path.isAbsolute(file) ? file : path.join(root, file), 'utf8'));

const contract = readJson(contractPath);
const plan = readJson(planPath);
const required = contract.requiredPlan || {};
const actual = {
  decision: plan.decision,
  operations: Number(plan.counts?.operations || 0),
  financialExactOverlays: Number(plan.counts?.exactFinancialOverlays || 0),
  financialReviewQueue: Number(plan.counts?.financialReviewQueue || 0),
  shopperGap: Number(plan.counts?.shopperGapCount || 0),
  certificationCandidateShoppers: Number(plan.counts?.certificationCandidateShoppers || 0),
  paymentConfirmed: Number(plan.counts?.paymentConfirmed || 0),
  hardStops: Array.isArray(plan.hardStops) ? plan.hardStops.length : -1
};
const mismatches = Object.entries(required)
  .filter(([key, expected]) => actual[key] !== expected)
  .map(([key, expected]) => ({ key, expected, actual: actual[key] }));
const safe = plan.mode === 'dry_run' &&
  plan.safeState?.writes === false &&
  plan.safeState?.deletes === false &&
  plan.safeState?.imports === false &&
  plan.safeState?.deploy === false &&
  plan.safeState?.production === false &&
  plan.safeState?.paymentsExecuted === false;
const pass = mismatches.length === 0 && safe &&
  plan.tenantId === contract.scope.tenantId &&
  plan.projectId === contract.scope.projectId;

const report = {
  schemaVersion: '1.0.0',
  reportId: 'phase-a-canonical-materialization-provider-compare-r16e-precheck',
  generatedAt: new Date().toISOString(),
  decision: pass ? 'PASS_CANONICAL_PROVIDER_COMPARE_PRECHECK_R16E' : 'HARD_STOP_CANONICAL_PROVIDER_COMPARE_PRECHECK_R16E',
  contractId: contract.contractId,
  planId: plan.planId,
  planSha256: plan.planSha256,
  actual,
  mismatches,
  safePlan: safe,
  pass,
  providerCalls: false,
  nextGate: pass ? 'MANUAL_READ_ONLY_PROVIDER_COMPARE_R16E' : 'R16E_PRECHECK_REVIEW'
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'canonical-provider-compare-r16e-precheck.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
fs.writeFileSync(path.join(outDir, 'canonical-provider-compare-r16e-precheck.md'), [
  '# CXOrbia R16E provider comparison precheck', '',
  `Decision: ${report.decision}`,
  `Plan: ${report.planId}`,
  `Operations: ${actual.operations}`,
  `Exact overlays: ${actual.financialExactOverlays}`,
  `Financial review queue: ${actual.financialReviewQueue}`,
  `Shopper gap: ${actual.shopperGap}`,
  `Certification candidates pending source: ${actual.certificationCandidateShoppers}`,
  `Payments confirmed: ${actual.paymentConfirmed}`,
  `Mismatches: ${mismatches.length}`,
  '',
  'No provider calls, writes, imports, deploy, production or payments.'
].join('\n'), 'utf8');

console.log(JSON.stringify(report, null, 2));
process.exitCode = pass ? 0 : 2;
