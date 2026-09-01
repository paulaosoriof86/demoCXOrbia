#!/usr/bin/env node
/* CXOrbia TyA - Real connection readiness gate validator.
   Safe validator. No Firebase calls, no Auth calls, no Firestore writes, no deploy. */

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;

const contractPath = 'backend/contracts/phase-a-real-connection-readiness-gate-v1.json';
const mapPath = 'backend/config/phase-a-real-connection-readiness-map.source-safe.json';
const hrSourcePath = 'app/data/tya-hr-source-safe-periods.js';

const hardFails = [];
const warnings = [];
const info = [];

function add(list, message, extra = {}) { list.push({ message, ...extra }); }
function abs(rel) { return path.join(root, rel); }
function exists(rel) { return fs.existsSync(abs(rel)); }
function read(rel) { return fs.readFileSync(abs(rel), 'utf8'); }
function readJson(rel) { return JSON.parse(read(rel)); }

function hasSensitiveText(text) {
  const patterns = [
    /password/i,
    /privateKey/i,
    /providerToken/i,
    /refreshToken/i,
    /bankAccount/i,
    /accountNumber/i,
    /dpiRaw/i,
    /documentRaw/i,
    /signedNdaRaw/i,
    /privateWebhookUrl/i,
    /paymentReceiptBase64/i
  ];
  return patterns.filter((p) => p.test(text)).map(String);
}

let contract = null;
let readinessMap = null;

try {
  if (!exists(contractPath)) add(hardFails, 'contract_missing', { file: contractPath });
  else {
    contract = readJson(contractPath);
    add(info, 'contract_json_valid', { file: contractPath });
  }
} catch (err) {
  add(hardFails, 'contract_json_invalid', { file: contractPath, error: String(err.message || err) });
}

try {
  if (!exists(mapPath)) add(hardFails, 'readiness_map_missing', { file: mapPath });
  else {
    readinessMap = readJson(mapPath);
    add(info, 'readiness_map_json_valid', { file: mapPath });
  }
} catch (err) {
  add(hardFails, 'readiness_map_json_invalid', { file: mapPath, error: String(err.message || err) });
}

if (contract) {
  if (contract.status !== 'draft_safe_not_connected') add(hardFails, 'contract_status_not_safe', { status: contract.status });
  for (const [key, expected] of Object.entries({
    connectsToRealDatabase: false,
    writesFirestore: false,
    writesAuth: false,
    importsRealData: false,
    deploysRules: false,
    productionEnabled: false,
    containsSecrets: false,
    containsSensitiveData: false
  })) {
    if (contract.safeState?.[key] !== expected) add(hardFails, 'safe_state_invalid', { key, expected, actual: contract.safeState?.[key] });
  }

  for (const rel of contract.requiredContracts || []) {
    if (!exists(rel)) add(hardFails, 'required_contract_missing', { file: rel });
    else add(info, 'required_contract_present', { file: rel });
  }

  for (const rel of contract.requiredRuntimeSourceSafeFiles || []) {
    if (!exists(rel)) add(hardFails, 'required_runtime_source_safe_file_missing', { file: rel });
    else add(info, 'required_runtime_source_safe_file_present', { file: rel });
  }

  const rules = contract.projectPeriodRules || {};
  for (const key of ['projectIsConfigEntity', 'periodIsProjectFilter', 'periodMustNotBecomeProject', 'projectSelectorShowsProjectsOnly', 'periodSelectorShowsPeriodsOnly']) {
    if (rules[key] !== true) add(hardFails, 'project_period_rule_missing', { key });
  }

  for (const moduleName of ['projects', 'periods', 'hrSource', 'usersRoles', 'coursesAcademy', 'certifications', 'questionnaires', 'shoppers', 'visitsAssignments', 'liquidationsPayments', 'reviewQueue', 'auditEvents']) {
    if (!(contract.modulesThatMustHaveBackendImpact || []).includes(moduleName)) add(hardFails, 'module_backend_impact_missing', { moduleName });
  }
}

if (readinessMap) {
  const assertions = readinessMap.connectionReadinessAssertions || {};
  for (const key of ['noPeriodProjects', 'noPIIInPreview', 'noImplicitWrites', 'noProviderExecution', 'noProductionCutover', 'sourceSafeCandidatesBeforeProtectedImport', 'reviewRequiredBeforeConflictResolution', 'allModulesHaveConfigPath', 'allGatesAreExplicit']) {
    if (assertions[key] !== true) add(hardFails, 'readiness_assertion_missing', { key });
  }

  for (const moduleName of ['projects', 'usersRoles', 'academyCourses', 'certifications', 'questionnaires', 'shoppers', 'visitsAssignments', 'liquidationsPayments', 'notificationsOutbox', 'reviewQueue', 'auditEvents']) {
    if (!Array.isArray(readinessMap.moduleReadinessMap?.[moduleName]) || readinessMap.moduleReadinessMap[moduleName].length === 0) add(hardFails, 'module_readiness_path_missing', { moduleName });
  }
}

if (exists(hrSourcePath)) {
  const text = read(hrSourcePath);
  if (!text.includes('sourceSafe')) add(hardFails, 'hr_source_safe_flag_missing', { file: hrSourcePath });
  if (!text.includes('production')) add(warnings, 'hr_production_flag_not_obvious', { file: hrSourcePath });
  const sensitive = hasSensitiveText(text);
  if (sensitive.length) add(hardFails, 'hr_source_safe_file_contains_sensitive_tokens', { file: hrSourcePath, sensitive });
} else {
  add(hardFails, 'hr_source_safe_file_missing', { file: hrSourcePath });
}

const report = {
  gate: 'phase-a-real-connection-readiness-gate',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_REAL_CONNECTION_READINESS' : 'GO_SAFE_REAL_CONNECTION_READINESS_NOT_CONNECTED',
  hardFailCount: hardFails.length,
  warningCount: warnings.length,
  safeState: {
    connectsToRealDatabase: false,
    writesFirestore: false,
    writesAuth: false,
    importsRealData: false,
    deploysRules: false,
    productionEnabled: false,
    containsSecrets: false,
    containsSensitiveData: false
  },
  hardFails,
  warnings,
  info
};

if (outDir) {
  const dir = abs(outDir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'real-connection-readiness-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# Phase A real connection readiness report',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Hard fails: ${report.hardFailCount}`,
    `Warnings: ${report.warningCount}`,
    '',
    '## What this gate protects',
    '- Project must not become period.',
    '- Period must be a filter/state, not a project duplicate.',
    '- TyA live source-safe payload must exist before protected candidates.',
    '- Users/roles/personas/scopes must be defined before Auth claims.',
    '- Courses, certifications, shoppers, liquidations, reviewQueue and auditEvents must have backend paths before real connection.',
    '- No Firestore/Auth/import/provider/production writes happen from this gate.',
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map((x) => `- ${x.message}${x.file ? ` · ${x.file}` : ''}${x.key ? ` · ${x.key}` : ''}${x.moduleName ? ` · ${x.moduleName}` : ''}`) : ['- none']),
    '',
    '## Warnings',
    ...(warnings.length ? warnings.map((x) => `- ${x.message}${x.file ? ` · ${x.file}` : ''}`) : ['- none']),
    ''
  ].join('\n');
  fs.writeFileSync(path.join(dir, 'real-connection-readiness-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
