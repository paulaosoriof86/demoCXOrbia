#!/usr/bin/env node
/* CXOrbia TyA - Phase A module readiness matrix validator.
   Safe dry-run: no Firebase/Auth/Firestore calls, no writes, no deploy, no sensitive data. */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;

const contractPath = 'backend/contracts/phase-a-module-readiness-matrix-v1.json';
const configPath = 'backend/config/phase-a-module-readiness-matrix.source-safe.json';

const baseFiles = [
  'backend/contracts/phase-a-real-connection-readiness-gate-v1.json',
  'backend/contracts/phase-a-hr-source-safe-to-protected-candidates-v1.json',
  'backend/contracts/phase-a-protected-read-access-adapter-v1.json',
  'backend/contracts/phase-a-role-taxonomy-org-scope-v1.json',
  'backend/contracts/phase-a-auth-dev-claims-taxonomy-seed-v2.json',
  'backend/contracts/phase-a-protected-firestore-schema-dev-readiness-v1.json',
  'backend/contracts/phase-a-protected-firestore-rules-dev-draft-v1.json',
  'backend/contracts/liquidations-payments-phase-a-v1.json',
  'backend/contracts/cxdata-firestore-phase-a-v1.json',
  'app/data/tya-hr-source-safe-periods.js'
];

const hardFails = [];
const warnings = [];
const info = [];
function add(list, message, extra = {}) { list.push({ message, ...extra }); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function readJson(rel) { return JSON.parse(read(rel)); }
function hasSensitiveText(text) {
  return /(password|privateKey|providerToken|refreshToken|bankAccountRaw|idDocumentRaw|signedNdaRaw|privateWebhookUrl|dpiRaw|rawShopperEmail|rawShopperPhone)/i.test(text);
}

let contract = null;
let config = null;

if (!exists(contractPath)) add(hardFails, 'contract_missing', { file: contractPath });
else {
  try {
    contract = readJson(contractPath);
    add(info, 'contract_json_valid', { file: contractPath });
  } catch (err) {
    add(hardFails, 'contract_json_invalid', { file: contractPath, error: String(err.message || err) });
  }
}

if (!exists(configPath)) add(hardFails, 'config_missing', { file: configPath });
else {
  try {
    config = readJson(configPath);
    add(info, 'config_json_valid', { file: configPath });
  } catch (err) {
    add(hardFails, 'config_json_invalid', { file: configPath, error: String(err.message || err) });
  }
}

if (contract) {
  if (contract.status !== 'draft_safe_not_connected') add(hardFails, 'contract_status_not_safe', { status: contract.status });
  for (const [key, expected] of Object.entries({
    realDatabaseConnected: false,
    firestoreWritesEnabled: false,
    authEnabled: false,
    claimsWritten: false,
    importsEnabled: false,
    providersEnabled: false,
    productionEnabled: false,
    containsSensitiveData: false
  })) {
    if (contract.safeState?.[key] !== expected) add(hardFails, 'safe_state_invalid', { key, expected, actual: contract.safeState?.[key] });
  }
  const requiredModules = contract.requiredModules || [];
  if (!requiredModules.length) add(hardFails, 'required_modules_empty');
  for (const moduleId of requiredModules) {
    if (!contract.moduleReadinessRequirements?.[moduleId]) add(hardFails, 'module_requirements_missing', { moduleId });
    if (!config?.modules?.[moduleId]) add(hardFails, 'module_config_missing', { moduleId });
  }
}

if (config) {
  if (config.sourceSafe !== true) add(hardFails, 'config_not_source_safe');
  if (config.production !== false) add(hardFails, 'config_production_must_be_false');
  for (const [moduleId, moduleConfig] of Object.entries(config.modules || {})) {
    if (!Array.isArray(moduleConfig.checks) || !moduleConfig.checks.length) add(hardFails, 'module_checks_empty', { moduleId });
    if (moduleConfig.reusableCxOrbia !== true) add(warnings, 'module_not_marked_reusable', { moduleId });
    if (moduleConfig.claudePrototypeImpact !== true) add(warnings, 'module_not_marked_claude_impact', { moduleId });
  }
}

for (const file of baseFiles) {
  if (!exists(file)) add(hardFails, 'base_file_missing', { file });
  else if (hasSensitiveText(read(file))) add(warnings, 'base_file_contains_sensitive_policy_terms_only_review', { file });
}

if (exists('app/data/tya-hr-source-safe-periods.js')) {
  const hrText = read('app/data/tya-hr-source-safe-periods.js');
  if (!/sourceSafe\s*:\s*true/.test(hrText)) add(hardFails, 'hr_payload_not_source_safe_marker');
  if (/production\s*:\s*true/.test(hrText)) add(hardFails, 'hr_payload_production_true');
}

const moduleResults = Object.fromEntries(Object.entries(config?.modules || {}).map(([moduleId, moduleConfig]) => [moduleId, {
  checks: moduleConfig.checks || [],
  tyaImpact: moduleConfig.tyaImpact || null,
  reusableCxOrbia: moduleConfig.reusableCxOrbia === true,
  claudePrototypeImpact: moduleConfig.claudePrototypeImpact === true,
  academyImpact: moduleConfig.academyImpact === true,
  verdict: 'READY_FOR_DRY_RUN_REVIEW'
}]));

const report = {
  gate: 'cxorbia-tya-phase-a-module-readiness-matrix',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_MODULE_READINESS' : (warnings.length ? 'GO_WITH_WARNINGS_NO_REAL_WRITE' : 'GO_MODULE_READY_NO_REAL_WRITE'),
  hardFailCount: hardFails.length,
  warningCount: warnings.length,
  safeState: {
    realDatabaseConnected: false,
    firestoreWritesEnabled: false,
    authEnabled: false,
    claimsWritten: false,
    importsEnabled: false,
    providersEnabled: false,
    productionEnabled: false
  },
  moduleResults,
  hardFails,
  warnings,
  info
};

if (outDir) {
  const abs = path.join(root, outDir);
  fs.mkdirSync(abs, { recursive: true });
  fs.writeFileSync(path.join(abs, 'module-readiness-matrix-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA Phase A module readiness matrix report',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Hard fails: ${hardFails.length}`,
    `Warnings: ${warnings.length}`,
    '',
    '## Modules',
    ...Object.entries(moduleResults).map(([moduleId, result]) => `- ${moduleId}: ${result.verdict} · reusable=${result.reusableCxOrbia} · claude=${result.claudePrototypeImpact} · checks=${result.checks.length}`),
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.moduleId ? ` · ${x.moduleId}` : ''}${x.file ? ` · ${x.file}` : ''}`) : ['- none']),
    '',
    '## Warnings',
    ...(warnings.length ? warnings.map(x => `- ${x.message}${x.moduleId ? ` · ${x.moduleId}` : ''}${x.file ? ` · ${x.file}` : ''}`) : ['- none']),
    '',
    '## Safe state',
    '- No real database connection',
    '- No Firestore writes',
    '- No Auth activation',
    '- No claims written',
    '- No provider calls',
    '- No production',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(abs, 'module-readiness-matrix-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
