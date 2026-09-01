#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const defaultRoot = path.resolve(here, '../..');
const stableJson = value => JSON.stringify(value, null, 2) + '\n';
const sha256File = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function optionalJson(root, relativePath) {
  if (!relativePath) return { present: false, path: null, value: null, sha256: null };
  const absolute = path.resolve(root, relativePath);
  if (!fs.existsSync(absolute)) return { present: false, path: relativePath, value: null, sha256: null };
  return { present: true, path: relativePath, value: readJson(absolute), sha256: sha256File(absolute) };
}

function countEquals(actual, expected) {
  return Number(actual) === Number(expected);
}

function lane(status, checks, evidence = {}) {
  return {
    status,
    ready: status === 'ready',
    checks,
    evidence
  };
}

export function evaluateOperationalReadiness({ root = defaultRoot, config }) {
  const blockers = [];
  const warnings = [];
  const baselineChecks = [];
  const checkpointPath = path.resolve(root, config.baseline.checkpointPath);
  const summaryPath = path.resolve(root, config.baseline.materializationSummaryPath);
  const checkpointExists = fs.existsSync(checkpointPath);
  const summaryExists = fs.existsSync(summaryPath);
  baselineChecks.push({ name: 'continuity_checkpoint_exists', ok: checkpointExists });
  baselineChecks.push({ name: 'materialization_summary_exists', ok: summaryExists });

  let summary = null;
  let summarySha256 = null;
  if (summaryExists) {
    summary = readJson(summaryPath);
    summarySha256 = sha256File(summaryPath);
    const expected = config.baseline.expected;
    const checks = [
      ['tenant_id', summary.tenantId === expected.tenantId],
      ['project_id', summary.projectId === expected.projectId],
      ['operations', countEquals(summary.counts?.operations, expected.operations)],
      ['periods', countEquals(summary.counts?.byDomain?.period, expected.periods)],
      ['shoppers', countEquals(summary.counts?.byDomain?.shopper, expected.shoppers)],
      ['visits', countEquals(summary.counts?.byDomain?.visit, expected.visits)],
      ['liquidations', countEquals(summary.counts?.byDomain?.liquidation, expected.liquidations)],
      ['verification_ok', summary.verification?.ok === true],
      ['dry_run', summary.safeState?.dryRun === true],
      ['writes_false', summary.safeState?.writes === false],
      ['imported_false', summary.safeState?.imported === false],
      ['production_false', summary.safeState?.production === false],
      ['providers_false', summary.safeState?.providers === false],
      ['payments_not_executed', summary.safeState?.paymentsExecuted === false]
    ];
    for (const [name, ok] of checks) baselineChecks.push({ name, ok });
  }
  const baselineReady = baselineChecks.every(item => item.ok);
  if (!baselineReady) blockers.push('baseline_or_materialization_summary_mismatch');

  const cleanEvidence = optionalJson(root, config.evidence.cleanStateReportPath);
  const cleanChecks = [];
  let cleanStatus = 'pending_evidence';
  if (cleanEvidence.present) {
    const value = cleanEvidence.value;
    cleanChecks.push({ name: 'decision_clean', ok: value.decision === config.evidence.requiredCleanDecision });
    cleanChecks.push({ name: 'project_match', ok: value.target?.projectIdMatch === true });
    cleanChecks.push({ name: 'service_account_domain_match', ok: value.target?.serviceAccountDomainMatch === true });
    cleanChecks.push({ name: 'mandatory_checks_available', ok: value.summary?.allMandatoryAvailable === true });
    cleanChecks.push({ name: 'clean_state_confirmed', ok: value.summary?.cleanStateConfirmed === true });
    cleanChecks.push({ name: 'firestore_writes_false', ok: value.safeState?.firestoreWrites === false });
    cleanChecks.push({ name: 'storage_writes_false', ok: value.safeState?.storageWrites === false });
    cleanChecks.push({ name: 'imports_false', ok: value.safeState?.imports === false });
    cleanChecks.push({ name: 'production_false', ok: value.safeState?.production === false });
    cleanStatus = cleanChecks.every(item => item.ok) ? 'ready' : 'blocked';
  }
  if (cleanStatus !== 'ready') blockers.push(cleanStatus === 'pending_evidence' ? 'firebase_dev_clean_state_evidence_missing' : 'firebase_dev_clean_state_evidence_invalid');

  const importEvidence = optionalJson(root, config.evidence.importReportPath);
  const importChecks = [];
  let importStatus = 'pending_sources';
  let financialReady = false;
  let certificationReady = false;
  if (importEvidence.present) {
    const value = importEvidence.value;
    importChecks.push({ name: 'tenant_id', ok: value.tenantId === config.baseline.expected.tenantId });
    importChecks.push({ name: 'project_id', ok: value.projectId === config.baseline.expected.projectId });
    importChecks.push({ name: 'hr_visits', ok: countEquals(value.hrIndex?.visits, config.baseline.expected.visits) });
    importChecks.push({ name: 'hr_shoppers', ok: countEquals(value.hrIndex?.shoppers, config.baseline.expected.shoppers) });
    importChecks.push({ name: 'source_safe', ok: value.hrIndex?.sourceSafe === true && value.safe === true });
    importChecks.push({ name: 'dry_run', ok: value.dryRun === true });
    importChecks.push({ name: 'writes_false', ok: value.writes === false });
    importChecks.push({ name: 'imported_false', ok: value.imported === false });
    importChecks.push({ name: 'production_false', ok: value.production === false });
    importChecks.push({ name: 'providers_false', ok: value.providers === false });
    financialReady = Number(value.financial?.acceptedPaid || 0) >= Number(config.sourceRequirements.minimumAcceptedPaid || 1);
    certificationReady = Number(value.certification?.carriedOver || 0) >= Number(config.sourceRequirements.minimumCarriedOver || 1);
    importChecks.push({ name: 'financial_source_accepted', ok: financialReady });
    importChecks.push({ name: 'certification_source_carried_over', ok: certificationReady });
    const baseSafe = importChecks.filter(item => !['financial_source_accepted', 'certification_source_carried_over'].includes(item.name)).every(item => item.ok);
    importStatus = baseSafe && financialReady && certificationReady ? 'ready' : baseSafe ? 'partial' : 'blocked';
  }
  if (!financialReady) blockers.push('clean_financial_payment_source_pending');
  if (!certificationReady) blockers.push('clean_certification_carryover_source_pending');
  if (importStatus === 'blocked') blockers.push('source_safe_import_report_invalid');

  const smokeEvidence = optionalJson(root, config.evidence.smokeReportPath);
  const smokeChecks = [];
  let smokeStatus = 'pending_smoke';
  if (smokeEvidence.present) {
    const value = smokeEvidence.value;
    const state = value.state || value;
    smokeChecks.push({ name: 'ok', ok: value.ok === true });
    smokeChecks.push({ name: 'source_safe', ok: state.sourceSafe === true || state.mode === 'source_safe_preview' });
    smokeChecks.push({ name: 'production_false', ok: state.production === false });
    smokeChecks.push({ name: 'imported_false', ok: state.imported === false });
    smokeChecks.push({ name: 'periods', ok: countEquals(state.periods, config.baseline.expected.periods) });
    smokeChecks.push({ name: 'visits', ok: countEquals(state.visits, config.baseline.expected.visits) });
    smokeChecks.push({ name: 'shoppers', ok: countEquals(state.shoppers, config.baseline.expected.shoppers) });
    smokeStatus = smokeChecks.every(item => item.ok) ? 'ready' : 'blocked';
  }
  if (smokeStatus !== 'ready') blockers.push(smokeStatus === 'pending_smoke' ? 'post_empalme_source_safe_smoke_missing' : 'post_empalme_source_safe_smoke_invalid');

  const lanes = {
    baseline: lane(baselineReady ? 'ready' : 'blocked', baselineChecks, {
      checkpointPath: config.baseline.checkpointPath,
      materializationSummaryPath: config.baseline.materializationSummaryPath,
      materializationSummarySha256: summarySha256,
      planId: summary?.planId || null,
      planSha256: summary?.planSha256 || null,
      operationCount: summary?.counts?.operations || 0
    }),
    firebaseDevCleanState: lane(cleanStatus, cleanChecks, {
      reportPresent: cleanEvidence.present,
      reportPath: cleanEvidence.path,
      reportSha256: cleanEvidence.sha256
    }),
    sourceSafePaymentsAndCertifications: lane(importStatus, importChecks, {
      reportPresent: importEvidence.present,
      reportPath: importEvidence.path,
      reportSha256: importEvidence.sha256,
      financialReady,
      certificationReady
    }),
    postEmpalmeSmoke: lane(smokeStatus, smokeChecks, {
      reportPresent: smokeEvidence.present,
      reportPath: smokeEvidence.path,
      reportSha256: smokeEvidence.sha256
    })
  };

  const readyForHumanAuthorizationReview = Object.values(lanes).every(item => item.ready);
  const decision = readyForHumanAuthorizationReview
    ? 'READY_FOR_HUMAN_AUTHORIZATION_REVIEW'
    : 'HOLD_REQUIRED_INPUTS_OR_EVIDENCE';

  if (readyForHumanAuthorizationReview) {
    warnings.push('This result is not write authorization. R8 dev_clean remains blocked and requires a separate explicit decision.');
  }

  return {
    schemaVersion: '1.0.0',
    readinessId: config.readinessId,
    generatedAt: new Date().toISOString(),
    baselineIdentity: config.baseline.identity,
    decision,
    readyForHumanAuthorizationReview,
    materializationAuthorized: false,
    lanes,
    blockers: [...new Set(blockers)],
    warnings,
    nextOperationalActions: readyForHumanAuthorizationReview
      ? ['request_separate_human_authorization_review_only', 'keep_r8_dev_clean_blocked_until_new_executor_version']
      : [
          ...(cleanStatus !== 'ready' ? ['run_explicitly_authorized_read_only_firebase_dev_clean_state_check'] : []),
          ...(!financialReady ? ['provide_sanitized_payment_export_and_run_existing_dry_run_importer'] : []),
          ...(!certificationReady ? ['provide_sanitized_certification_export_and_run_existing_dry_run_importer'] : []),
          ...(smokeStatus !== 'ready' ? ['run_post_empalme_source_safe_smoke'] : [])
        ],
    safeState: {
      writes: false,
      imported: false,
      production: false,
      providersInvoked: false,
      paymentsExecuted: false,
      materializationExecuted: false,
      rawSensitiveDataOutput: false
    }
  };
}

function parseArgs(argv) {
  const value = (name, fallback = null) => {
    const index = argv.indexOf(name);
    return index >= 0 ? argv[index + 1] : fallback;
  };
  return {
    root: path.resolve(value('--root', defaultRoot)),
    configPath: value('--config', 'backend/config/phase-a-operational-readiness-r9.source-safe.json'),
    outPath: value('--out', '.tmp/phase-a-operational-readiness-r9/report.json')
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = readJson(path.resolve(args.root, args.configPath));
  const report = evaluateOperationalReadiness({ root: args.root, config });
  const absoluteOut = path.resolve(args.root, args.outPath);
  fs.mkdirSync(path.dirname(absoluteOut), { recursive: true });
  fs.writeFileSync(absoluteOut, stableJson(report), 'utf8');
  console.log(stableJson(report));
  if (!report.lanes.baseline.ready || report.safeState.writes !== false) process.exitCode = 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(error => {
    console.error(error?.stack || String(error));
    process.exitCode = 2;
  });
}
