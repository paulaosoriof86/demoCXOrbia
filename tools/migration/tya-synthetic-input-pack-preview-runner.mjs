#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const contractPath = path.join(root, 'app', 'contracts', 'synthetic-input-pack-preview-phase-a.tya.contract.json');

const sensitiveKeyPatterns = [
  /dpi|passport|pasaporte/i,
  /document(Number|o)?/i,
  /bank|banco|account|cuenta/i,
  /phone|telefono|teléfono|whatsapp|email/i,
  /raw(Data|Payload|Source|Body|Message|Contact|Url|Link|Attachment|File)?/i,
  /token|secret|credential|apiKey/i,
  /base64|attachment|adjunto|privateLink|signedUrl/i
];

const allowedFixtureRootParts = [
  ['tools', 'migration', 'fixtures'],
  ['tools', 'migration', 'synthetic-fixtures'],
  ['app', 'docs', 'fixtures']
];

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function parseArgs(argv) {
  const args = { input: null, execute: false };
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--input') {
      args.input = argv[i + 1];
      i += 1;
    } else if (token.startsWith('--input=')) {
      args.input = token.slice('--input='.length);
    } else if (token === '--execute') {
      args.execute = true;
    }
  }
  return args;
}

function flattenKeys(value, prefix = '') {
  if (!value || typeof value !== 'object') return [];
  const keys = [];
  for (const [key, child] of Object.entries(value)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    keys.push(fullKey);
    if (child && typeof child === 'object' && !Array.isArray(child)) keys.push(...flattenKeys(child, fullKey));
  }
  return keys;
}

function detectSensitiveKeys(payload) {
  return [...new Set(flattenKeys(payload).filter((key) => sensitiveKeyPatterns.some((pattern) => pattern.test(key))))];
}

function isAllowedFixturePath(filePath) {
  if (!filePath || path.isAbsolute(filePath) || filePath.includes('..')) return false;
  const normalizedParts = path.normalize(filePath).split(path.sep);
  return allowedFixtureRootParts.some((parts) => parts.every((part, index) => normalizedParts[index] === part));
}

function validatePack(pack, contract) {
  const failures = [];
  for (const key of contract.requiredPackFields || []) {
    if (pack?.[key] === undefined || pack?.[key] === null || pack?.[key] === '') failures.push(`missing_pack_${key}`);
  }
  if (pack?.packStatus && !contract.packStatuses?.includes(pack.packStatus)) failures.push(`unsupported_packStatus:${pack.packStatus}`);
  if (pack?.realDataProhibited !== true) failures.push('pack_realDataProhibited_must_be_true');
  return [...new Set(failures)];
}

function validateFixture(fixture, contract) {
  const failures = [];
  for (const key of contract.requiredFixtureFields || []) {
    if (fixture[key] === undefined || fixture[key] === null || fixture[key] === '') failures.push(`missing_fixture_${key}`);
  }
  if (fixture.fixtureType && !contract.fixtureTypes?.includes(fixture.fixtureType)) failures.push(`unsupported_fixtureType:${fixture.fixtureType}`);
  if (fixture.sourceSafe !== true) failures.push('fixture_sourceSafe_must_be_true');
  if (fixture.containsRawSensitiveData !== false) failures.push('fixture_containsRawSensitiveData_must_be_false');
  if (fixture.isSyntheticOrSanitized !== true) failures.push('fixture_isSyntheticOrSanitized_must_be_true');
  if (!isAllowedFixturePath(fixture.fixturePath)) failures.push('fixturePath_not_allowed');
  const resolved = path.join(root, fixture.fixturePath || '');
  if (fixture.fixturePath && !fs.existsSync(resolved)) failures.push('fixture_file_missing');
  return [...new Set(failures)];
}

function validateRunPlanItem(item, contract) {
  const failures = [];
  for (const key of contract.requiredRunPlanFields || []) {
    if (item[key] === undefined || item[key] === null || item[key] === '') failures.push(`missing_runPlan_${key}`);
  }
  if (item.validatorScript && (path.isAbsolute(item.validatorScript) || item.validatorScript.includes('..') || !item.validatorScript.startsWith('tools/migration/'))) failures.push('validatorScript_not_allowed');
  if (item.validatorInputPath && !isAllowedFixturePath(item.validatorInputPath)) failures.push('validatorInputPath_not_allowed');
  if (item.expectedOutcome && !String(item.expectedOutcome).includes('preview') && !String(item.expectedOutcome).includes('review') && !String(item.expectedOutcome).includes('blocked')) failures.push('expectedOutcome_must_be_preview_or_review_state');
  if (item.executeRealAction === true || item.writeAllowed === true || item.importAllowed === true) failures.push('real_action_flags_not_allowed');
  return [...new Set(failures)];
}

function outcomeFor(failures) {
  if (failures.some((failure) => failure.includes('Sensitive') || failure.includes('sensitive'))) return 'synthetic_pack_blocked_sensitive_payload';
  if (failures.some((failure) => failure.includes('real'))) return 'synthetic_pack_blocked_real_data_detected';
  if (failures.some((failure) => failure.includes('missing') || failure.includes('file_missing'))) return 'synthetic_pack_blocked_missing_fixture';
  if (failures.length) return 'synthetic_pack_manual_review_required';
  return 'synthetic_pack_preview_ready';
}

function runValidator(planItem) {
  const scriptPath = path.join(root, planItem.validatorScript);
  if (!fs.existsSync(scriptPath)) {
    return { status: 'validator_script_missing', exitCode: null, stdout: '', stderr: '' };
  }
  const args = [scriptPath, '--input', planItem.validatorInputPath];
  const result = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', timeout: 30000 });
  return {
    status: result.status === 0 ? 'executed_preview' : 'executed_with_review_required',
    exitCode: result.status,
    stdout: result.stdout?.slice(0, 12000) || '',
    stderr: result.stderr?.slice(0, 4000) || ''
  };
}

function validateInput(inputFile, execute, contract) {
  const inputPath = path.isAbsolute(inputFile) ? inputFile : path.join(root, inputFile);
  const payload = readJson(inputPath);
  const issues = [];
  const warnings = [];
  if (payload.sourceSafe !== true) issues.push('input.sourceSafe must be true');
  if (payload.containsRawSensitiveData !== false) issues.push('input.containsRawSensitiveData must be false');
  if (payload.isSyntheticOrSanitized !== true) issues.push('input.isSyntheticOrSanitized must be true');
  if (payload.realDataProhibited !== true) issues.push('input.realDataProhibited must be true');
  const sensitiveKeys = detectSensitiveKeys(payload);
  if (sensitiveKeys.length) issues.push(`sensitive_or_raw_field_keys_detected:${sensitiveKeys.join(',')}`);

  const packFailures = validatePack(payload.syntheticPack || {}, contract);
  const fixtures = Array.isArray(payload.fixtures) ? payload.fixtures : [];
  const runPlan = Array.isArray(payload.runPlan) ? payload.runPlan : [];
  if (!Array.isArray(payload.fixtures)) warnings.push('input.fixtures missing or not an array');
  if (!Array.isArray(payload.runPlan)) warnings.push('input.runPlan missing or not an array');

  const fixtureRows = fixtures.map((fixture) => {
    const failures = validateFixture(fixture, contract);
    return { ...fixture, outcome: outcomeFor(failures), validationFailures: failures };
  });
  const runRows = runPlan.map((item) => {
    const failures = validateRunPlanItem(item, contract);
    const execution = execute && failures.length === 0 ? runValidator(item) : null;
    return {
      tenantId: item.tenantId || null,
      syntheticPackId: item.syntheticPackId || null,
      runPlanId: item.runPlanId || null,
      validatorId: item.validatorId || null,
      validatorScript: item.validatorScript || null,
      validatorInputPath: item.validatorInputPath || null,
      expectedOutcome: item.expectedOutcome || null,
      outcome: outcomeFor(failures),
      validationFailures: failures,
      execution
    };
  });
  const counts = [...fixtureRows, ...runRows].reduce((acc, row) => {
    acc.outcomes[row.outcome] = (acc.outcomes[row.outcome] || 0) + 1;
    for (const failure of row.validationFailures || []) acc.failures[failure] = (acc.failures[failure] || 0) + 1;
    return acc;
  }, { outcomes: {}, failures: {} });
  return { inputChecked: path.relative(root, inputPath), packFailures, sensitiveKeys, fixtureCount: fixtures.length, runPlanCount: runPlan.length, counts, fixtureRows, runRows, issues, warnings };
}

function main() {
  const args = parseArgs(process.argv);
  const contract = readJson(contractPath);
  const issues = [];
  const warnings = [];
  for (const flag of ['runtimeEnabled', 'productionAllowed', 'firestoreWritesAllowed', 'storageWritesAllowed', 'makeWriteAllowed', 'emailSendAllowed', 'whatsappSendAllowed', 'geminiAllowed', 'importRealDataAllowed', 'deployAllowed', 'mergeAllowed']) {
    if (contract[flag] !== false) issues.push(`${flag} must remain false`);
  }
  let inputPreview = null;
  if (args.input) {
    inputPreview = validateInput(args.input, args.execute, contract);
    issues.push(...inputPreview.issues, ...inputPreview.packFailures);
    warnings.push(...inputPreview.warnings);
  } else {
    warnings.push('No --input provided; only synthetic input pack contract was checked');
  }
  const report = {
    runner: 'tya-synthetic-input-pack-preview-runner',
    status: issues.length ? 'review_required' : 'synthetic_input_pack_preview_ready',
    executeMode: args.execute === true,
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    storageWritesAllowed: false,
    makeWriteAllowed: false,
    emailSendAllowed: false,
    whatsappSendAllowed: false,
    geminiAllowed: false,
    importRealDataAllowed: false,
    deployAllowed: false,
    mergeAllowed: false,
    fileChecked: path.relative(root, contractPath),
    inputPreview,
    issues,
    warnings,
    nextSafeSteps: [
      'Prepare synthetic fixtures only under tools/migration/fixtures or tools/migration/synthetic-fixtures.',
      'Run without --execute first to validate the pack structure.',
      'Use --execute only for local validators that do not write or call providers.',
      'Do not treat synthetic validation as real import readiness.'
    ]
  };
  console.log(JSON.stringify(report, null, 2));
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({ runner: 'tya-synthetic-input-pack-preview-runner', status: 'error', runtimeEnabled: false, productionAllowed: false, firestoreWritesAllowed: false, error: error.message }, null, 2));
  process.exitCode = 1;
}
