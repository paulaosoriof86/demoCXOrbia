#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'app', 'contracts', 'sensitive-data-policy-phase-a.tya.contract.json');

const sensitivePatterns = [
  /dpi/i,
  /document(Number|o)?/i,
  /passport|pasaporte/i,
  /taxId/i,
  /bank|banco/i,
  /account|cuenta/i,
  /iban|swift/i,
  /nda/i,
  /signature|firma/i,
  /raw(Email|Whatsapp|Attachment|Audio|Body)?/i,
  /attachment|adjunto/i,
  /address|direccion|dirección/i,
  /phone|telefono|teléfono|whatsapp/i
];

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function parseArgs(argv) {
  const args = { input: null };
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--input') {
      args.input = argv[i + 1];
      i += 1;
    } else if (token.startsWith('--input=')) {
      args.input = token.slice('--input='.length);
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

function inspectPreviewInput(inputFile) {
  const inputPath = path.isAbsolute(inputFile) ? inputFile : path.join(root, inputFile);
  const payload = readJson(inputPath);
  const issues = [];
  const warnings = [];

  if (payload.sourceSafe !== true) issues.push('input.sourceSafe must be true');
  if (payload.containsRawSensitiveData !== false) issues.push('input.containsRawSensitiveData must be false');
  if (payload.isSyntheticOrSanitized !== true) issues.push('input.isSyntheticOrSanitized must be true');

  const rows = Array.isArray(payload.rows) ? payload.rows : [];
  if (!Array.isArray(payload.rows)) warnings.push('input.rows missing or not an array; only metadata and keys were inspected');

  const keysToInspect = rows.length ? rows.flatMap((row) => flattenKeys(row)) : flattenKeys(payload);
  const suspiciousKeys = [...new Set(keysToInspect.filter((key) => sensitivePatterns.some((pattern) => pattern.test(key))))];
  if (suspiciousKeys.length) issues.push(`sensitive_or_raw_field_keys_detected:${suspiciousKeys.join(',')}`);

  return {
    inputChecked: path.relative(root, inputPath),
    rowCount: rows.length,
    suspiciousKeys,
    issues,
    warnings
  };
}

function main() {
  const args = parseArgs(process.argv);
  const contract = readJson(contractPath);
  const issues = [];
  const warnings = [];

  for (const flag of [
    'runtimeEnabled',
    'productionAllowed',
    'firestoreWritesAllowed',
    'storageWritesAllowed',
    'hrWriteAllowed',
    'importRealDataAllowed',
    'emailProviderAllowed',
    'makeEnabled',
    'geminiEnabled'
  ]) {
    if (contract[flag] !== false) issues.push(`${flag} must remain false`);
  }

  const categories = contract.sensitiveCategories || {};
  for (const category of ['identity', 'banking', 'legal', 'contact', 'communications', 'attachments']) {
    if (!Array.isArray(categories[category]) || !categories[category].length) issues.push(`Missing sensitive category: ${category}`);
  }

  const forbidden = contract.forbiddenInRepo || [];
  for (const phrase of ['bank data', 'identity documents', 'signed NDA files', 'API keys or provider secrets']) {
    if (!forbidden.some((item) => item.includes(phrase))) issues.push(`Missing forbidden repo item: ${phrase}`);
  }

  if (contract.importPolicy?.realImportAllowed !== false) issues.push('Real import must remain disabled');
  if (contract.importPolicy?.firstDevImportRecommendation !== 'exclude_sensitive_fields') warnings.push('First DEV import should exclude sensitive fields');
  if (contract.storagePolicy?.phaseAStorageUploadsAllowed !== false) issues.push('Phase A Storage private uploads must remain disabled');
  if (contract.firestorePolicy?.phaseAFirestoreWritesAllowed !== false) issues.push('Phase A private Firestore writes must remain disabled');
  if (contract.communicationPolicy?.rawBodiesStoredInPhaseA !== false) issues.push('Raw communication bodies must not be stored in Phase A');

  let inputPreview = null;
  if (args.input) {
    inputPreview = inspectPreviewInput(args.input);
    issues.push(...inputPreview.issues);
    warnings.push(...inputPreview.warnings);
  } else {
    warnings.push('No --input provided; no preview data file was inspected');
  }

  const report = {
    validator: 'tya-sensitive-data-policy-validator',
    status: issues.length ? 'review_required' : 'sensitive_data_policy_ready_as_gate',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    storageWritesAllowed: false,
    importRealDataAllowed: false,
    fileChecked: path.relative(root, contractPath),
    inputPreview,
    issues,
    warnings,
    nextSafeSteps: [
      'Keep real sensitive fields excluded from Phase A previews and repo files.',
      'Use source-safe synthetic or sanitized input for validators.',
      'Do not enable private Firestore or Storage until rules and role claims are reviewed.',
      'Update Claude/frontend with honest privacy states and shopper-safe views.',
      'Update Academia with sensitive-data lessons, checklists and glossary.'
    ]
  };

  console.log(JSON.stringify(report, null, 2));
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({
    validator: 'tya-sensitive-data-policy-validator',
    status: 'error',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    error: error.message
  }, null, 2));
  process.exitCode = 1;
}
