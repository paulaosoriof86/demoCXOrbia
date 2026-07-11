#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { evaluateOperationalReadiness } from './tya-phase-a-operational-readiness-r9.mjs';

const stableJson = value => JSON.stringify(value, null, 2) + '\n';
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'cxorbia-r9-'));
const writeJson = (relative, value) => {
  const file = path.join(tempRoot, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, stableJson(value), 'utf8');
};
const writeText = (relative, value) => {
  const file = path.join(tempRoot, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value, 'utf8');
};

const summary = {
  planId: 'phasea_test',
  tenantId: 'tya',
  projectId: 'cinepolis',
  planSha256: 'a'.repeat(64),
  counts: { operations: 1418, byDomain: { period: 14, shopper: 213, visit: 616, liquidation: 572 } },
  verification: { ok: true },
  safeState: { dryRun: true, writes: false, imported: false, production: false, providers: false, paymentsExecuted: false }
};
const config = {
  readinessId: 'test-r9',
  baseline: {
    identity: { package: 'V105', internalBuild: 'V106', backend: 'R8' },
    checkpointPath: 'checkpoint.md',
    materializationSummaryPath: 'summary.json',
    expected: { tenantId: 'tya', projectId: 'cinepolis', operations: 1418, periods: 14, shoppers: 213, visits: 616, liquidations: 572 }
  },
  evidence: {
    cleanStateReportPath: 'clean.json',
    importReportPath: 'import.json',
    smokeReportPath: 'smoke.json',
    requiredCleanDecision: 'CLEAN_STATE_VERIFIED_READ_ONLY'
  },
  sourceRequirements: { minimumAcceptedPaid: 1, minimumCarriedOver: 1 }
};
writeText('checkpoint.md', '# checkpoint\n');
writeJson('summary.json', summary);

const tests = [];
function test(name, fn) {
  try {
    fn();
    tests.push({ name, ok: true });
  } catch (error) {
    tests.push({ name, ok: false, error: error.message });
  }
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

test('missing evidence remains HOLD with zero authorization', () => {
  const result = evaluateOperationalReadiness({ root: tempRoot, config });
  assert(result.decision === 'HOLD_REQUIRED_INPUTS_OR_EVIDENCE', 'decision');
  assert(result.lanes.baseline.ready === true, 'baseline');
  assert(result.materializationAuthorized === false, 'authorization');
  assert(result.safeState.writes === false, 'writes');
});

writeJson('clean.json', {
  decision: 'CLEAN_STATE_VERIFIED_READ_ONLY',
  target: { projectIdMatch: true, serviceAccountDomainMatch: true },
  summary: { allMandatoryAvailable: true, cleanStateConfirmed: true },
  safeState: { firestoreWrites: false, storageWrites: false, imports: false, production: false }
});
writeJson('import.json', {
  tenantId: 'tya', projectId: 'cinepolis',
  hrIndex: { visits: 616, shoppers: 213, sourceSafe: true },
  financial: { acceptedPaid: 5 }, certification: { carriedOver: 3 },
  dryRun: true, writes: false, imported: false, production: false, providers: false, safe: true
});
writeJson('smoke.json', {
  ok: true,
  state: { mode: 'source_safe_preview', sourceSafe: true, production: false, imported: false, periods: 14, visits: 616, shoppers: 213 }
});

test('complete evidence reaches human review only, never write authorization', () => {
  const result = evaluateOperationalReadiness({ root: tempRoot, config });
  assert(result.decision === 'READY_FOR_HUMAN_AUTHORIZATION_REVIEW', 'decision');
  assert(result.readyForHumanAuthorizationReview === true, 'human review');
  assert(result.materializationAuthorized === false, 'authorization');
  assert(result.safeState.writes === false, 'writes');
});

const unsafeImport = JSON.parse(fs.readFileSync(path.join(tempRoot, 'import.json'), 'utf8'));
unsafeImport.writes = true;
writeJson('import.json', unsafeImport);

test('unsafe import evidence is blocked', () => {
  const result = evaluateOperationalReadiness({ root: tempRoot, config });
  assert(result.decision === 'HOLD_REQUIRED_INPUTS_OR_EVIDENCE', 'decision');
  assert(result.lanes.sourceSafePaymentsAndCertifications.status === 'blocked', 'lane status');
  assert(result.materializationAuthorized === false, 'authorization');
});

const report = {
  schemaVersion: '1.0.0',
  generatedAt: new Date().toISOString(),
  tests,
  passed: tests.filter(item => item.ok).length,
  failed: tests.filter(item => !item.ok).length,
  writes: false,
  imported: false,
  production: false
};
const outIndex = process.argv.indexOf('--out');
const out = path.resolve(outIndex >= 0 ? process.argv[outIndex + 1] : '.tmp/phase-a-operational-readiness-r9-validation/report.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, stableJson(report), 'utf8');
console.log(stableJson(report));
fs.rmSync(tempRoot, { recursive: true, force: true });
if (report.failed) process.exit(2);
