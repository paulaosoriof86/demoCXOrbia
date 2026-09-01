#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'app', 'contracts', 'release-readiness-sanitized-report-phase-a.tya.contract.json');

function parseArgs(argv) {
  const args = { input: null, output: null, format: 'markdown' };
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    const next = argv[i + 1];
    if (token === '--input') { args.input = next; i += 1; }
    else if (token.startsWith('--input=')) args.input = token.slice('--input='.length);
    else if (token === '--output') { args.output = next; i += 1; }
    else if (token.startsWith('--output=')) args.output = token.slice('--output='.length);
    else if (token === '--format') { args.format = next; i += 1; }
    else if (token.startsWith('--format=')) args.format = token.slice('--format='.length);
  }
  return args;
}

function readJson(filePath) {
  if (!filePath) throw new Error('Missing --input');
  const resolved = path.isAbsolute(filePath) ? filePath : path.join(root, filePath);
  if (!fs.existsSync(resolved)) throw new Error(`Missing file: ${path.relative(root, resolved)}`);
  return JSON.parse(fs.readFileSync(resolved, 'utf8'));
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeOutput(outputPath, content) {
  if (!outputPath) {
    console.log(content);
    return;
  }
  const resolved = path.isAbsolute(outputPath) ? outputPath : path.join(root, outputPath);
  ensureDir(resolved);
  fs.writeFileSync(resolved, content.endsWith('\n') ? content : `${content}\n`, 'utf8');
  console.log(JSON.stringify({ report: 'tya-release-readiness-sanitized-report', status: 'written', output: path.relative(root, resolved) }, null, 2));
}

function gateSummary(report) {
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
  return Object.fromEntries(flags.map((flag) => [flag, report[flag] === false ? 'off_verified' : 'review_required']));
}

function normalizeRows(report) {
  const rows = report?.inputPreview?.rows;
  return Array.isArray(rows) ? rows : [];
}

function groupByArea(rows) {
  const grouped = new Map();
  for (const row of rows) {
    const area = row.readinessArea || 'unknown';
    if (!grouped.has(area)) grouped.set(area, []);
    grouped.get(area).push(row);
  }
  return grouped;
}

function areaStatus(rows) {
  const statuses = rows.map((row) => row.readinessStatus).filter(Boolean);
  if (statuses.some((status) => String(status).startsWith('blocked_'))) return 'blocked';
  if (statuses.includes('manual_review_required')) return 'manual_review_required';
  if (statuses.includes('ready_for_review')) return 'ready_for_review';
  if (statuses.includes('preview_ready')) return 'preview_ready';
  return statuses[0] || 'not_reported';
}

function safeReason(value) {
  if (!value) return '';
  return String(value)
    .replace(/https?:\/\/\S+/g, '[url-redacted]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email-redacted]')
    .replace(/\b\d{6,}\b/g, '[number-redacted]')
    .slice(0, 240);
}

function buildSummary(report) {
  const rows = normalizeRows(report);
  const grouped = groupByArea(rows);
  const issues = Array.isArray(report.issues) ? report.issues.map(safeReason).filter(Boolean) : [];
  const warnings = Array.isArray(report.warnings) ? report.warnings.map(safeReason).filter(Boolean) : [];
  const areaRows = [...grouped.entries()].map(([area, areaItems]) => ({
    area,
    status: areaStatus(areaItems),
    gates: [...new Set(areaItems.map((row) => row.gateStatus).filter(Boolean))],
    validators: [...new Set(areaItems.map((row) => row.validatorId).filter(Boolean))],
    blockers: areaItems.map((row) => safeReason(row.blockingReason)).filter(Boolean),
    manualReview: areaItems.map((row) => safeReason(row.manualReviewReason)).filter(Boolean)
  }));

  const hasPrototypeBlocker = rows.some((row) => row.readinessArea === 'prototype_audit' && row.readinessStatus === 'blocked_prototype_pending');
  const hasBlocked = areaRows.some((row) => row.status === 'blocked');
  const hasManualReview = areaRows.some((row) => row.status === 'manual_review_required') || report.status === 'review_required';

  return {
    reportName: 'tya-release-readiness-sanitized-report',
    sourceValidator: report.validator || null,
    sourceStatus: report.status || null,
    productionDecision: hasPrototypeBlocker
      ? 'not_production_ready_frontend_p0_pending'
      : hasBlocked
        ? 'not_production_ready_blockers_present'
        : hasManualReview
          ? 'not_production_ready_manual_review_required'
          : 'preview_ready_only_not_production',
    snapshot: {
      snapshotId: report?.inputPreview?.snapshot?.snapshotId || null,
      snapshotPeriodId: report?.inputPreview?.snapshot?.snapshotPeriodId || null,
      baselineRef: report?.inputPreview?.snapshot?.baselineRef || null,
      backendBranchRef: report?.inputPreview?.snapshot?.backendBranchRef || null,
      pullRequestRef: report?.inputPreview?.snapshot?.pullRequestRef || null,
      status: report?.inputPreview?.snapshot?.status || null
    },
    gateSummary: gateSummary(report),
    counts: report?.inputPreview?.counts || { outcomes: {}, failures: {} },
    areaRows,
    issues,
    warnings,
    nextActions: {
      frontendClaude: hasPrototypeBlocker
        ? ['Correct frontend P0 honesty messages before source lock.', 'Deliver a candidate with real delta and run forensic audit again.']
        : ['Keep prototype audit evidence attached before any source lock decision.'],
      backend: ['Run local chain from synthetic pack to release snapshot when repo is available.', 'Review blockers and generate a new sanitized report after each local run.'],
      production: ['Do not deploy, merge, import real data, send providers or mark production ready from this preview report.']
    }
  };
}

function markdown(summary) {
  const lines = [];
  lines.push('# Release readiness sanitized report - CXOrbia TyA');
  lines.push('');
  lines.push(`GeneratedAt: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## Executive status');
  lines.push('');
  lines.push(`- Source validator: ${summary.sourceValidator || 'not_reported'}`);
  lines.push(`- Source status: ${summary.sourceStatus || 'not_reported'}`);
  lines.push(`- Production decision: ${summary.productionDecision}`);
  lines.push('- Scope: Phase A preview only. Not source lock. Not production ready.');
  lines.push('');
  lines.push('## Snapshot metadata');
  lines.push('');
  for (const [key, value] of Object.entries(summary.snapshot)) lines.push(`- ${key}: ${value || 'not_reported'}`);
  lines.push('');
  lines.push('## Gate status');
  lines.push('');
  for (const [key, value] of Object.entries(summary.gateSummary)) lines.push(`- ${key}: ${value}`);
  lines.push('');
  lines.push('## Area summary');
  lines.push('');
  if (!summary.areaRows.length) {
    lines.push('- No readiness items were reported.');
  } else {
    for (const row of summary.areaRows) {
      lines.push(`### ${row.area}`);
      lines.push(`- status: ${row.status}`);
      lines.push(`- gates: ${row.gates.join(', ') || 'not_reported'}`);
      lines.push(`- validators: ${row.validators.join(', ') || 'not_reported'}`);
      if (row.blockers.length) lines.push(`- blockers: ${row.blockers.join(' | ')}`);
      if (row.manualReview.length) lines.push(`- manual review: ${row.manualReview.join(' | ')}`);
      lines.push('');
    }
  }
  lines.push('## Issues and warnings');
  lines.push('');
  lines.push(`- issues: ${summary.issues.length ? summary.issues.join(' | ') : 'none'}`);
  lines.push(`- warnings: ${summary.warnings.length ? summary.warnings.join(' | ') : 'none'}`);
  lines.push('');
  lines.push('## Next actions');
  lines.push('');
  lines.push('### Frontend / Claude');
  for (const action of summary.nextActions.frontendClaude) lines.push(`- ${action}`);
  lines.push('');
  lines.push('### Backend');
  for (const action of summary.nextActions.backend) lines.push(`- ${action}`);
  lines.push('');
  lines.push('### Production');
  for (const action of summary.nextActions.production) lines.push(`- ${action}`);
  lines.push('');
  lines.push('## Safety');
  lines.push('');
  lines.push('- This report is sanitized and preview-only.');
  lines.push('- It must not include raw operational payloads, provider payloads or sensitive personal/payment/contact data.');
  lines.push('- It does not authorize deploy, merge, import, writes, providers, payments or production.');
  return lines.join('\n');
}

try {
  const args = parseArgs(process.argv);
  const contract = readJson(contractPath);
  if (!contract.allowedOutputFormats.includes(args.format)) throw new Error(`Unsupported format: ${args.format}`);
  const report = readJson(args.input);
  if (report.validator !== contract.allowedInputValidator) throw new Error(`Unsupported input validator: ${report.validator || 'missing'}`);
  const summary = buildSummary(report);
  if (args.format === 'json_summary') writeOutput(args.output, `${JSON.stringify(summary, null, 2)}\n`);
  else writeOutput(args.output, markdown(summary));
} catch (error) {
  console.error(JSON.stringify({ report: 'tya-release-readiness-sanitized-report', status: 'error', productionAllowed: false, error: error.message }, null, 2));
  process.exitCode = 1;
}
