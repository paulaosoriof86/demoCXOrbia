#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'app', 'contracts', 'synthetic-input-pack-readiness-map-phase-a.tya.contract.json');

function parseArgs(argv) {
  const args = { input: null, output: null };
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--input') {
      args.input = argv[i + 1];
      i += 1;
    } else if (token.startsWith('--input=')) {
      args.input = token.slice('--input='.length);
    } else if (token === '--output') {
      args.output = argv[i + 1];
      i += 1;
    } else if (token.startsWith('--output=')) {
      args.output = token.slice('--output='.length);
    }
  }
  return args;
}

function readJson(filePath) {
  if (!filePath) throw new Error('Missing --input');
  const resolved = path.isAbsolute(filePath) ? filePath : path.join(root, filePath);
  if (!fs.existsSync(resolved)) throw new Error(`Missing file: ${path.relative(root, resolved)}`);
  return JSON.parse(fs.readFileSync(resolved, 'utf8'));
}

function collectStrings(value) {
  if (value === null || value === undefined) return [];
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (typeof value === 'object') return Object.values(value).flatMap(collectStrings);
  return [String(value)];
}

function hasText(texts, pattern) {
  return texts.some((text) => text.toLowerCase().includes(pattern.toLowerCase()));
}

function flagSummary(report) {
  const flags = [
    'runtimeEnabled',
    'productionAllowed',
    'firestoreWritesAllowed',
    'storageWritesAllowed',
    'makeWriteAllowed',
    'emailSendAllowed',
    'whatsappSendAllowed',
    'geminiAllowed',
    'importRealDataAllowed',
    'deployAllowed',
    'mergeAllowed'
  ];
  return Object.fromEntries(flags.map((flag) => [flag, report?.[flag] === false ? false : report?.[flag]]));
}

function validateGateFlags(report, contract) {
  const issues = [];
  for (const flag of [
    'runtimeEnabled',
    'productionAllowed',
    'firestoreWritesAllowed',
    'storageWritesAllowed',
    'makeWriteAllowed',
    'emailSendAllowed',
    'whatsappSendAllowed',
    'geminiAllowed',
    'importRealDataAllowed',
    'deployAllowed',
    'mergeAllowed'
  ]) {
    if (contract[flag] !== false) issues.push(`contract_${flag}_must_remain_false`);
    if (report[flag] !== false) issues.push(`report_${flag}_must_remain_false`);
  }
  return issues;
}

function determineStatus(report, gateIssues) {
  const texts = collectStrings({ issues: report.issues || [], inputPreview: report.inputPreview || {}, warnings: report.warnings || [] });
  if (report.status === 'error') return 'blocked_runner_error';
  if (gateIssues.length) return 'blocked_real_action_flag';
  if (hasText(texts, 'sensitive_or_raw_field_keys_detected')) return 'blocked_sensitive_or_raw_field_key';
  if (hasText(texts, 'real_action_flags_not_allowed')) return 'blocked_real_action_flag';
  if (hasText(texts, 'missing') || hasText(texts, 'file_missing')) return 'blocked_missing_input_or_fixture';
  if ((report.issues || []).length > 0 || report.status === 'review_required') return 'preview_review_required';
  if (report.status === 'synthetic_input_pack_preview_ready') return 'synthetic_preview_ready';
  return 'preview_review_required';
}

function buildOutput(report, contract) {
  if (report.runner !== contract.allowedSourceRunner) {
    return {
      mapper: 'tya-synthetic-input-pack-readiness-map-preview',
      status: 'blocked_runner_error',
      sourceRunner: report.runner || null,
      sourceStatus: report.status || null,
      executeMode: report.executeMode === true,
      productionDecision: contract.nonProductionDecision,
      safeGateSummary: flagSummary(report),
      blockingReasons: [`unsupported_source_runner:${report.runner || 'missing'}`],
      reviewReasons: [],
      nextSafeSteps: ['Run the approved synthetic input pack preview runner first.']
    };
  }

  const gateIssues = validateGateFlags(report, contract);
  const status = determineStatus(report, gateIssues);
  const sourceIssues = Array.isArray(report.issues) ? report.issues : [];
  const sourceWarnings = Array.isArray(report.warnings) ? report.warnings : [];
  const inputPreview = report.inputPreview || null;
  const failures = inputPreview?.counts?.failures || {};
  const outcomes = inputPreview?.counts?.outcomes || {};
  const blockingReasons = [...gateIssues];

  if (status.startsWith('blocked_')) {
    blockingReasons.push(...sourceIssues);
    for (const [failure, count] of Object.entries(failures)) blockingReasons.push(`${failure}:${count}`);
  }

  const reviewReasons = [];
  if (!status.startsWith('blocked_')) {
    reviewReasons.push(...sourceIssues);
    reviewReasons.push(...sourceWarnings);
    for (const [failure, count] of Object.entries(failures)) reviewReasons.push(`${failure}:${count}`);
  }

  return {
    mapper: 'tya-synthetic-input-pack-readiness-map-preview',
    status,
    sourceRunner: report.runner,
    sourceStatus: report.status,
    executeMode: report.executeMode === true,
    productionDecision: contract.nonProductionDecision,
    safeGateSummary: flagSummary(report),
    sourceCounts: {
      fixtureCount: inputPreview?.fixtureCount || 0,
      runPlanCount: inputPreview?.runPlanCount || 0,
      outcomes,
      failures
    },
    blockingReasons: [...new Set(blockingReasons)].filter(Boolean),
    reviewReasons: [...new Set(reviewReasons)].filter(Boolean),
    nextSafeSteps: [
      'If status is synthetic_preview_ready, use it only as a local preview readiness signal.',
      'If status is preview_review_required, review failures before executing local validators.',
      'If status is blocked, correct fixtures or manifest before any next preview step.',
      'Keep all production and provider gates disabled until explicit future authorization.'
    ]
  };
}

function writeOutput(outputPath, payload) {
  const json = `${JSON.stringify(payload, null, 2)}\n`;
  if (!outputPath) {
    console.log(json.trimEnd());
    return;
  }
  const resolved = path.isAbsolute(outputPath) ? outputPath : path.join(root, outputPath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, json, 'utf8');
  console.log(JSON.stringify({ mapper: payload.mapper, status: payload.status, output: path.relative(root, resolved) }, null, 2));
}

try {
  const args = parseArgs(process.argv);
  const contract = readJson(contractPath);
  const report = readJson(args.input);
  const output = buildOutput(report, contract);
  writeOutput(args.output, output);
  if (String(output.status).startsWith('blocked_')) process.exitCode = 2;
} catch (error) {
  console.error(JSON.stringify({ mapper: 'tya-synthetic-input-pack-readiness-map-preview', status: 'error', productionAllowed: false, error: error.message }, null, 2));
  process.exitCode = 1;
}
