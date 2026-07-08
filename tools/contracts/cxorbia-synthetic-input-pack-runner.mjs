#!/usr/bin/env node
/**
 * CXOrbia synthetic input pack runner.
 *
 * Runs preview-only contract validators with embedded synthetic/sanitized fixtures
 * and produces an aggregate source-safe report. It does not read real sources,
 * connect providers, write databases, import data, send notifications or deploy.
 *
 * Optional usage:
 *   node tools/contracts/cxorbia-synthetic-input-pack-runner.mjs
 *   node tools/contracts/cxorbia-synthetic-input-pack-runner.mjs --out .tmp/cxor-synthetic-pack
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  sampleManifest as adminConfigurabilitySample,
  validateAdminConfigurabilityContract,
} from './cxorbia-admin-configurability-contract.mjs';
import {
  sampleManifest as conflictReviewSample,
  validateConflictReviewImportReadiness,
} from './cxorbia-conflict-review-import-readiness-contract.mjs';

export const RUNNER_NAME = 'cxorbia-synthetic-input-pack-runner';
export const RUNNER_VERSION = '2026-07-08.preview-only';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;

const tenantId = 'tenant_demo';
const projectId = 'project_demo';

const legacyCliContracts = [
  {
    contractId: 'questionnaire-routing',
    file: 'tools/contracts/cxorbia-questionnaire-routing-contract.mjs',
    payload: {
      tenantId,
      projectId,
      visitId: 'visit_demo_001',
      action: 'preview_visit_route',
      actorRole: 'admin',
      auditRef: 'audit://synthetic/questionnaire-routing/preview',
      route: {
        type: 'visit_hr_ref',
        routeRef: 'opaque_hr_questionnaire_route_ref_demo_001',
      },
      execute: false,
    },
  },
  {
    contractId: 'visit-lifecycle',
    file: 'tools/contracts/cxorbia-visit-lifecycle-contract.mjs',
    payload: {
      tenantId,
      projectId,
      visitId: 'visit_demo_001',
      shopperId: 'shopper_ref_demo_001',
      action: 'mark_questionnaire_completed_preview',
      actorRole: 'shopper',
      auditRef: 'audit://synthetic/visit-lifecycle/preview',
      assignmentSource: 'platform',
      franja: 'WK',
      quincena: 'Q1',
      visitDate: '2026-07-08',
      execute: false,
      writeToHr: false,
      writeToDatabase: false,
      notifyReal: false,
    },
  },
  {
    contractId: 'settlement-eligibility',
    file: 'tools/contracts/cxorbia-settlement-eligibility-contract.mjs',
    payload: {
      tenantId,
      projectId,
      visitId: 'visit_demo_001',
      shopperId: 'shopper_ref_demo_001',
      action: 'preview_settlement_eligibility',
      actorRole: 'finance',
      auditRef: 'audit://synthetic/settlement-eligibility/preview',
      visitStatus: 'submit_reviewed',
      paymentStatus: 'eligible_preview',
      questionnaireCompleted: true,
      submitReviewed: true,
      currency: 'GTQ',
      honorariumAmount: 70,
      reimbursementAmount: 55,
      execute: false,
      payNow: false,
      writeToDatabase: false,
      notifyReal: false,
      containsBankData: false,
      containsDpi: false,
    },
  },
  {
    contractId: 'evidence-storage',
    file: 'tools/contracts/cxorbia-evidence-storage-contract.mjs',
    payload: {
      tenantId,
      projectId,
      visitId: 'visit_demo_001',
      action: 'preview_evidence_requirement',
      actorRole: 'admin',
      auditRef: 'audit://synthetic/evidence-storage/preview',
      evidenceType: 'photo',
      storageWrite: false,
      writeToDatabase: false,
      notifyReal: false,
      execute: false,
      containsDpi: false,
      containsBankData: false,
      containsSensitiveIdentity: false,
    },
  },
  {
    contractId: 'historical-import-clean',
    file: 'tools/contracts/cxorbia-historical-import-clean-contract.mjs',
    payload: {
      tenantId,
      projectId,
      action: 'preview_import_manifest',
      actorRole: 'admin',
      auditRef: 'audit://synthetic/historical-import-clean/preview',
      sourceType: 'controlled_fixture',
      entity: 'visits',
      totalRows: 1,
      cleanRows: 1,
      rejectedRows: 0,
      conflictCount: 0,
      stableKeys: ['tenantId', 'projectId', 'visitId'],
      execute: false,
      writeToDatabase: false,
      writeToHr: false,
      importNow: false,
      oldDatabaseDump: false,
      connectOldDatabase: false,
      containsDpi: false,
      containsBankData: false,
      containsNda: false,
      containsRawSensitiveData: false,
    },
  },
];

function verdictOk(result) {
  if (!result || typeof result !== 'object') return false;
  if (result.ok === true) return true;
  if (result.verdict === 'GO_PREVIEW_ONLY') return true;
  if (result.verdict === 'GO_DOCS_RELEASE_CONTRACTS_ONLY_AFTER_VALIDATION') return true;
  return false;
}

function safeJsonParse(text, fallback = {}) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function runModuleContract(contractId, validate, sample) {
  const result = validate(sample());
  return {
    contractId,
    runner: 'module_export',
    ok: verdictOk(result),
    result,
  };
}

function runCliContract(entry) {
  const abs = path.join(repoRoot, entry.file);
  if (!fs.existsSync(abs)) {
    return {
      contractId: entry.contractId,
      runner: 'cli_stdin',
      ok: false,
      result: {
        verdict: 'NO_GO_CONTRACT',
        errors: [`missing_contract_file: ${entry.file}`],
      },
    };
  }
  try {
    const stdout = execFileSync(process.execPath, [abs], {
      input: JSON.stringify(entry.payload),
      encoding: 'utf8',
      maxBuffer: 1024 * 1024,
    });
    const result = safeJsonParse(stdout.trim(), {
      verdict: 'NO_GO_CONTRACT',
      errors: ['invalid_json_output'],
      rawOutput: stdout.slice(0, 500),
    });
    return {
      contractId: entry.contractId,
      runner: 'cli_stdin',
      ok: verdictOk(result),
      result,
    };
  } catch (error) {
    const stdout = String(error.stdout || '').trim();
    const parsed = stdout ? safeJsonParse(stdout, null) : null;
    return {
      contractId: entry.contractId,
      runner: 'cli_stdin',
      ok: parsed ? verdictOk(parsed) : false,
      result: parsed || {
        verdict: 'NO_GO_CONTRACT',
        errors: [String(error.message || error)],
      },
    };
  }
}

export function runSyntheticInputPack() {
  const results = [
    runModuleContract('admin-configurability', validateAdminConfigurabilityContract, adminConfigurabilitySample),
    runModuleContract('conflict-review-import-readiness', validateConflictReviewImportReadiness, conflictReviewSample),
    ...legacyCliContracts.map(runCliContract),
  ];

  const failed = results.filter((item) => !item.ok);
  const warnings = results.flatMap((item) => {
    const resultWarnings = Array.isArray(item.result?.warnings) ? item.result.warnings : [];
    return resultWarnings.map((warning) => ({ contractId: item.contractId, warning }));
  });

  return {
    runner: RUNNER_NAME,
    version: RUNNER_VERSION,
    generatedAt: new Date().toISOString(),
    mode: 'preview_only',
    sourceSafe: true,
    isSyntheticOrSanitized: true,
    verdict: failed.length ? 'NO_GO_SYNTHETIC_PACK' : 'GO_SYNTHETIC_SOURCE_SAFE_PREVIEW',
    totalContracts: results.length,
    passedContracts: results.length - failed.length,
    failedContracts: failed.length,
    warningCount: warnings.length,
    results,
    warnings,
    classification: {
      reusableCxorbia: [
        'synthetic fixtures for preview-only contracts',
        'aggregate source-safe report before real data inputs',
        'runner pattern for future contract validators',
      ],
      exclusivoCliente: [
        'TyA/Cinepolis data must remain outside runner fixtures unless sanitized and external',
      ],
      claudePrototipo: [
        'show aggregate readiness as preview, not production-ready',
        'surface missing/failed contracts without implying provider execution',
      ],
      academia: [
        'explain synthetic fixtures, source-safe tests and why this is not real import',
      ],
      sinImpactoClaude: [
        'runner has no UI changes and no provider calls',
      ],
    },
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
  };
}

function writeReport(report, directory) {
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'cxorbia-synthetic-input-pack-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia synthetic input pack report',
    '',
    `Generated: ${report.generatedAt}`,
    `Mode: ${report.mode}`,
    `Verdict: ${report.verdict}`,
    `Total contracts: ${report.totalContracts}`,
    `Passed contracts: ${report.passedContracts}`,
    `Failed contracts: ${report.failedContracts}`,
    `Warnings: ${report.warningCount}`,
    '',
    '## Contracts',
    ...report.results.map((item) => `- ${item.contractId}: ${item.ok ? 'GO' : 'NO_GO'} (${item.runner})`),
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
  fs.writeFileSync(path.join(directory, 'cxorbia-synthetic-input-pack-report.md'), md, 'utf8');
}

function main() {
  const report = runSyntheticInputPack();
  if (outDir) writeReport(report, outDir);
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.failedContracts ? 1 : 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
