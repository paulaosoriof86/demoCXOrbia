#!/usr/bin/env node
/*
  CXOrbia Phase A R16E — normalize the approved R16D source-safe plan for the
  provider comparison contract.

  The R16D plan stores safety flags in safeState. The R16 comparison contract
  also requires equivalent top-level flags. This tool copies those verified
  false values to the top level, recalculates planSha256 and writes a new local
  artifact. It never calls providers or performs writes, imports or deploys.
*/

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const index = argv.indexOf(name);
  return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
};

const inputPath = arg('--plan', '.tmp/r16e-r16d-plan/r14c-financial-overlay-review-plan-r16d.json');
const outputPath = arg('--out', '.tmp/r16e-r16d-plan/r14c-financial-overlay-review-plan-r16d-provider-compare.json');
const absoluteInput = path.isAbsolute(inputPath) ? inputPath : path.join(root, inputPath);
const absoluteOutput = path.isAbsolute(outputPath) ? outputPath : path.join(root, outputPath);
const stableJson = value => JSON.stringify(value, null, 2) + '\n';
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');

const plan = JSON.parse(fs.readFileSync(absoluteInput, 'utf8'));
const safety = plan.safeState || {};
const requiredFalse = ['writes', 'deletes', 'imports', 'deploy', 'production', 'paymentsExecuted'];
const invalidSafety = requiredFalse.filter(key => safety[key] !== false);

if (plan.mode !== 'dry_run') throw new Error('R16D plan mode is not dry_run');
if (plan.decision !== 'PASS_R14C_FINANCIAL_OVERLAY_REVIEW_PLAN_R16D') throw new Error('R16D plan decision is not PASS');
if (!Array.isArray(plan.operations) || plan.operations.length === 0) throw new Error('R16D plan has no operations');
if (Array.isArray(plan.hardStops) && plan.hardStops.length > 0) throw new Error('R16D plan has hard stops');
if (invalidSafety.length) throw new Error(`R16D safeState mismatch: ${invalidSafety.join(',')}`);

const normalized = {
  ...plan,
  writes: false,
  deletes: false,
  imported: false,
  imports: false,
  deploy: false,
  production: false,
  paymentsExecuted: false,
  providerComparisonNormalization: {
    normalizedFor: 'phase-a-canonical-materialization-dry-run-r16-v1',
    sourcePlanId: plan.planId,
    sourcePlanSha256: plan.planSha256,
    safetyCopiedFrom: 'safeState',
    providerCalls: false
  }
};
normalized.planSha256 = sha256(JSON.stringify({ ...normalized, planSha256: undefined }));

fs.mkdirSync(path.dirname(absoluteOutput), { recursive: true });
fs.writeFileSync(absoluteOutput, stableJson(normalized), 'utf8');

console.log(stableJson({
  decision: 'PASS_R16D_PROVIDER_COMPARE_PLAN_NORMALIZATION_R16E',
  sourcePlanId: plan.planId,
  sourcePlanSha256: plan.planSha256,
  normalizedPlanSha256: normalized.planSha256,
  operationCount: normalized.operations.length,
  writes: normalized.writes,
  deletes: normalized.deletes,
  imported: normalized.imported,
  deploy: normalized.deploy,
  production: normalized.production,
  providerCalls: false
}));
