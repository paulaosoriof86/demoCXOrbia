#!/usr/bin/env node
/**
 * CXOrbia readiness dashboard bridge runner.
 *
 * Converts a synthetic input pack report into a readiness dashboard source-safe
 * manifest and validates it. Preview-only. No real providers, no real sources,
 * no database writes, no HR writes, no Storage writes, no notifications,
 * no payments, no imports, no deploy and no production activation.
 *
 * Optional usage:
 *   node tools/contracts/cxorbia-readiness-dashboard-bridge-runner.mjs
 *   node tools/contracts/cxorbia-readiness-dashboard-bridge-runner.mjs --input .tmp/cxor-synthetic-pack/cxorbia-synthetic-input-pack-report.json
 *   node tools/contracts/cxorbia-readiness-dashboard-bridge-runner.mjs --out .tmp/cxor-readiness-dashboard
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runSyntheticInputPack } from './cxorbia-synthetic-input-pack-runner.mjs';
import { validateReadinessDashboardSourceSafe } from './cxorbia-readiness-dashboard-source-safe-contract.mjs';

export const BRIDGE_NAME = 'cxorbia-readiness-dashboard-bridge-runner';
export const BRIDGE_VERSION = '2026-07-08.preview-only';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');

const args = process.argv.slice(2);
const inputIdx = args.indexOf('--input');
const outIdx = args.indexOf('--out');
const inputPath = inputIdx >= 0 ? args[inputIdx + 1] : null;
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;

const tenantId = 'tenant_demo';
const projectId = 'project_demo';

const contractAreaMap = new Map([
  ['admin-configurability', 'admin_configurability'],
  ['conflict-review-import-readiness', 'conflict_review_import_readiness'],
  ['questionnaire-routing', 'questionnaire_routing'],
  ['visit-lifecycle', 'visit_lifecycle'],
  ['settlement-eligibility', 'settlement_eligibility'],
  ['evidence-storage', 'evidence_storage'],
  ['historical-import-clean', 'historical_import_clean'],
  ['assignment-sync-conflict-preview', 'assignment_sync_conflict'],
  ['notification-outbox-preview', 'notification_outbox'],
  ['project-tenant-rule-versioning-preview', 'project_tenant_rule_versioning'],
  ['rule-change-changelog-notification-preview', 'rule_change_changelog_notification'],
  ['release-readiness-snapshot-preview', 'release_readiness_snapshot'],
]);

function safeJsonParse(text, fallback = null) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function loadReport() {
  if (!inputPath) return runSyntheticInputPack();
  const abs = path.isAbsolute(inputPath) ? inputPath : path.join(repoRoot, inputPath);
  const raw = fs.readFileSync(abs, 'utf8');
  const parsed = safeJsonParse(raw, null);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`Invalid JSON input report: ${inputPath}`);
  }
  return parsed;
}

function extractReason(item) {
  const result = item?.result || {};
  const errors = Array.isArray(result.errors) ? result.errors : [];
  const issues = Array.isArray(result.issues) ? result.issues : [];
  const warnings = Array.isArray(result.warnings) ? result.warnings : [];
  if (errors.length) return String(errors[0]);
  if (issues.length) return String(issues[0]);
  if (warnings.length) return String(warnings[0]);
  if (result.verdict) return String(result.verdict);
  if (result.status) return String(result.status);
  return 'Preview-only diagnostic item generated from synthetic/source-safe report.';
}

function statusFor(item) {
  const contractId = item?.contractId || 'unknown';
  const result = item?.result || {};
  const warnings = Array.isArray(result.warnings) ? result.warnings : [];
  if (contractId === 'conflict-review-import-readiness') return 'human_review_required';
  if (contractId === 'release-readiness-snapshot-preview') return 'production_not_authorized';
  if (!item?.ok) return 'fail';
  if (warnings.length) return 'warning';
  return 'preview_ready';
}

function labelFor(status) {
  return {
    preview_ready: 'preview listo',
    diagnostic_executed: 'diagnostico ejecutado',
    warning: 'warning',
    fail: 'fail',
    pending_real_source: 'pendiente fuente real',
    pending_real_gate: 'pendiente gate real',
    human_review_required: 'pendiente revision humana',
    production_not_authorized: 'produccion no autorizada',
    provider_not_active: 'proveedor no activo',
    blocked_sensitive_data: 'bloqueado por datos sensibles',
    blocked_conflict: 'bloqueado por conflicto',
    docs_only: 'solo documental',
  }[status] || 'diagnostico ejecutado';
}

function gateStateFor(status, contractId) {
  if (contractId === 'release-readiness-snapshot-preview') return 'future_approval_required';
  if (status === 'fail') return 'blocked';
  if (status === 'human_review_required') return 'review_required';
  return 'off';
}

function humanReviewStateFor(status, contractId) {
  if (contractId === 'conflict-review-import-readiness') return 'required';
  if (status === 'fail' || status === 'human_review_required') return 'required';
  if (status === 'production_not_authorized') return 'pending';
  return 'not_required_preview';
}

export function buildReadinessDashboardManifest(report = {}) {
  const results = Array.isArray(report.results) ? report.results : [];
  const items = results.map((item) => {
    const contractId = item.contractId || 'unknown-contract';
    const area = contractAreaMap.get(contractId) || 'synthetic_input_pack_runner';
    const status = statusFor(item);
    return {
      itemId: `rd_${contractId.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '')}`,
      area,
      status,
      displayLabel: labelFor(status),
      sourceRef: `ref://synthetic-input-pack/${contractId}`,
      gateState: gateStateFor(status, contractId),
      humanReviewState: humanReviewStateFor(status, contractId),
      reason: extractReason(item),
      realActivationRequested: false,
      writeRequested: false,
      deployRequested: false,
    };
  });

  if (!items.length) {
    items.push({
      itemId: 'rd_empty_source_report',
      area: 'synthetic_input_pack_runner',
      status: 'pending_real_source',
      displayLabel: 'pendiente fuente real',
      sourceRef: 'ref://synthetic-input-pack/empty-report',
      gateState: 'off',
      humanReviewState: 'not_required_preview',
      reason: 'No contract results were present in the source-safe report.',
      realActivationRequested: false,
      writeRequested: false,
      deployRequested: false,
    });
  }

  return {
    manifestId: `readiness_dashboard_from_${report.runner || 'synthetic_report'}_${report.version || 'preview'}`.replace(/[^a-z0-9_]+/gi, '_'),
    tenantId,
    projectId,
    mode: 'preview_only',
    sourceSafe: report.sourceSafe === true,
    isSyntheticOrSanitized: report.isSyntheticOrSanitized === true,
    containsRawSensitiveData: false,
    generatedFrom: report.runner || 'synthetic_input_pack_report',
    generatedAt: new Date().toISOString(),
    safeState: {
      productionAllowed: false,
      deployAllowed: false,
      mergeAllowed: false,
      firestoreWritesAllowed: false,
      storageWritesAllowed: false,
      makeWriteAllowed: false,
      geminiAllowed: false,
      importRealDataAllowed: false,
      emailSendAllowed: false,
      whatsappSendAllowed: false,
      paymentProviderAllowed: false,
      realProviderCredentialsAllowed: false,
    },
    sourceReportSummary: {
      runner: report.runner || null,
      version: report.version || null,
      verdict: report.verdict || null,
      totalContracts: report.totalContracts || results.length,
      passedContracts: report.passedContracts || results.filter((item) => item.ok).length,
      failedContracts: report.failedContracts || results.filter((item) => !item.ok).length,
      warningCount: report.warningCount || 0,
    },
    items,
  };
}

export function runReadinessDashboardBridge(report = null) {
  const sourceReport = report || loadReport();
  const manifest = buildReadinessDashboardManifest(sourceReport);
  const validation = validateReadinessDashboardSourceSafe(manifest);
  return {
    bridge: BRIDGE_NAME,
    version: BRIDGE_VERSION,
    generatedAt: new Date().toISOString(),
    mode: 'preview_only',
    sourceSafe: true,
    isSyntheticOrSanitized: true,
    verdict: validation.ok ? 'GO_READINESS_DASHBOARD_BRIDGE_PREVIEW_ONLY' : 'NO_GO_READINESS_DASHBOARD_BRIDGE',
    manifest,
    validation,
    safeState: {
      runtime: 'not_connected',
      databaseWrites: false,
      hrWrites: false,
      storageWrites: false,
      realNotifications: false,
      payments: false,
      imports: false,
      make: false,
      gemini: false,
      deploy: false,
      production: false,
    },
    classification: {
      reusableCxorbia: [
        'source-safe bridge from contract runner reports to readiness dashboard manifests',
        'honest status mapping for any tenant/project',
      ],
      exclusivoCliente: [
        'TyA Phase A can use the bridge without hardcoding TyA data or real HR payloads',
      ],
      claudePrototipo: [
        'dashboard UI can consume the manifest as preview-only state contract',
      ],
      academia: [
        'teach how runner diagnostics become dashboard statuses without activating providers',
      ],
      sinImpactoClaude: [
        'no UI mutation by itself; only contract/report bridge',
      ],
    },
  };
}

function writeBridgeOutput(report, directory) {
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'cxorbia-readiness-dashboard-bridge-report.json'), JSON.stringify(report, null, 2), 'utf8');
  fs.writeFileSync(path.join(directory, 'cxorbia-readiness-dashboard-manifest.json'), JSON.stringify(report.manifest, null, 2), 'utf8');
  const md = [
    '# CXOrbia readiness dashboard bridge report',
    '',
    `Generated: ${report.generatedAt}`,
    `Mode: ${report.mode}`,
    `Verdict: ${report.verdict}`,
    `Items: ${report.manifest.items.length}`,
    `Validation: ${report.validation.verdict}`,
    '',
    '## Dashboard items',
    ...report.manifest.items.map((item) => `- ${item.area}: ${item.displayLabel} (${item.gateState})`),
    '',
    '## Safe state',
    '- No deploy',
    '- No production',
    '- No provider calls',
    '- No database writes',
    '- No HR writes',
    '- No Storage writes',
    '- No imports',
    '- No payments',
    '- No real notifications',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(directory, 'cxorbia-readiness-dashboard-bridge-report.md'), md, 'utf8');
}

function main() {
  const report = runReadinessDashboardBridge();
  if (outDir) writeBridgeOutput(report, outDir);
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.validation.ok ? 0 : 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main();
  } catch (error) {
    console.error(JSON.stringify({ bridge: BRIDGE_NAME, ok: false, verdict: 'ERROR', error: error.message }, null, 2));
    process.exitCode = 1;
  }
}
