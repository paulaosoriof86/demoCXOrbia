#!/usr/bin/env node
/* CXOrbia TyA - Local Level 1 recovery preflight
   Safe local helper. No HR calls, no Firestore writes, no imports, no deploy, no runtime switch.

   Purpose: find already-generated sanitized/source-safe local outputs outside the current
   repo worktree and run the existing Level 1/2 preflight automatically when possible.

   Important: by default this helper EXCLUDES synthetic fixtures because Phase A real-data
   preview must not be advanced using demo/synthetic files. Use --allow-synthetic only for
   contract testing, never as real-data preview evidence.
*/

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const args = process.argv.slice(2);
function arg(name) { const idx = args.indexOf(name); return idx >= 0 ? args[idx + 1] : null; }
function has(name) { return args.includes(name); }

const outDir = arg('--out') || '.tmp/tya-local-level1-recovery-preflight';
const maxFiles = Number(arg('--max-files') || 8000);
const extraRoots = args.flatMap((value, index) => value === '--root' ? [args[index + 1]] : []).filter(Boolean);
const runPreflight = !has('--no-run');
const allowSynthetic = has('--allow-synthetic');

const forbiddenMarkers = [
  'rawDpi', 'rawBankAccount', 'rawPhone', 'rawEmail', 'rawShopperName',
  'rawHrWorkbook', 'rawCsv', 'privateHrUrl', 'spreadsheetFileId', 'serviceAccountJson',
  'signedNdaFile', 'rawEvidence', 'base64Evidence', 'paymentReceiptBinary',
  'paymentProviderToken', 'makeWebhookUrl', 'geminiApiKey'
];

const hardFails = [];
const warnings = [];
const info = [];
const inspections = [];
const visitedDirs = new Set();
let filesSeen = 0;

function add(list, message, extra = {}) { list.push({ message, ...extra }); }
function abs(relOrAbs) { return path.isAbsolute(relOrAbs) ? relOrAbs : path.join(root, relOrAbs); }
function exists(relOrAbs) { return fs.existsSync(abs(relOrAbs)); }
function ensureDir(relOrAbs) { fs.mkdirSync(abs(relOrAbs), { recursive: true }); }
function writeJson(relOrAbs, name, value) { ensureDir(relOrAbs); fs.writeFileSync(path.join(abs(relOrAbs), name), JSON.stringify(value, null, 2), 'utf8'); }
function rel(file) {
  try { return path.relative(root, file) || file; } catch { return file; }
}
function normalize(value) { return String(value || '').toLowerCase(); }
function isProbablyCxorbiaPath(full) {
  const l = normalize(full);
  return l.includes('cxorbia') || l.includes('democxorbia') || l.includes('tya') || l.includes('hr-source') || l.includes('realdata') || l.includes('source-safe');
}
function isSyntheticFixturePath(full) {
  const l = normalize(full).replaceAll('\\', '/');
  return l.includes('/synthetic-fixtures/') || l.includes('/fixtures/') || l.includes('.fixture.') || l.includes('synthetic') || l.includes('preview-fixture');
}
function shouldSkipDir(full) {
  const l = normalize(full);
  return l.includes('\\.git') || l.includes('/.git') || l.includes('\\node_modules') || l.includes('/node_modules') || l.includes('\\.firebase') || l.includes('/.firebase');
}
function safeReadJson(file) {
  const stat = fs.statSync(file);
  if (stat.size > 25 * 1024 * 1024) throw new Error('json_too_large_for_safe_inspection');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function findRows(source) {
  if (!source || typeof source !== 'object') return [];
  const direct = [source.visits, source.rows, source.sanitizedVisits, source.visitRows, source.hrRows, source.operationalRows].find(Array.isArray);
  if (direct) return direct;
  if (Array.isArray(source.tabs)) {
    const out = [];
    for (const tab of source.tabs) {
      const rows = [tab.rows, tab.visits, tab.sanitizedRows, tab.operationalRows].find(Array.isArray) || [];
      for (const row of rows) out.push({ ...row, sourceTab: row.sourceTab || tab.tabName || tab.name || tab.sheet });
    }
    return out;
  }
  if (source.report && typeof source.report === 'object') return findRows(source.report);
  return [];
}
function inspectJson(file) {
  const parsed = safeReadJson(file);
  const text = JSON.stringify(parsed);
  const lower = text.toLowerCase();
  const forbiddenHits = forbiddenMarkers.filter(marker => lower.includes(marker.toLowerCase()));
  const rows = findRows(parsed);
  const possibleVisitRows = rows.filter(row => {
    const keys = Object.keys(row || {});
    return keys.includes('hrRowId') || keys.includes('visitId') || keys.includes('sourceTab') || keys.includes('quincena') || keys.includes('franja') || keys.includes('branchRef');
  }).length;
  const hasManifestTabs = Array.isArray(parsed.manifestTabs) || Array.isArray(parsed?.report?.manifestTabs);
  const syntheticFixture = isSyntheticFixturePath(file);
  return {
    file,
    fileSafe: rel(file),
    bytes: Buffer.byteLength(text, 'utf8'),
    forbiddenHits,
    topLevelKeys: Object.keys(parsed || {}).slice(0, 30),
    possibleVisitRows,
    hasManifestTabs,
    syntheticFixture,
    level1Candidate: forbiddenHits.length === 0 && possibleVisitRows > 0 && (!syntheticFixture || allowSynthetic),
    realLevel1Candidate: forbiddenHits.length === 0 && possibleVisitRows > 0 && !syntheticFixture,
    syntheticLevel1Candidate: forbiddenHits.length === 0 && possibleVisitRows > 0 && syntheticFixture,
    manifestCandidate: forbiddenHits.length === 0 && hasManifestTabs && (!syntheticFixture || allowSynthetic)
  };
}
function scanDir(dir) {
  const fullDir = path.resolve(dir);
  if (!fs.existsSync(fullDir) || !fs.statSync(fullDir).isDirectory()) return;
  const stack = [fullDir];
  while (stack.length && filesSeen < maxFiles) {
    const current = stack.pop();
    if (!current || visitedDirs.has(current) || shouldSkipDir(current)) continue;
    visitedDirs.add(current);
    let entries = [];
    try { entries = fs.readdirSync(current, { withFileTypes: true }); } catch { continue; }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (isProbablyCxorbiaPath(full) || isProbablyCxorbiaPath(current)) stack.push(full);
        continue;
      }
      if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.json')) continue;
      filesSeen += 1;
      if (!isProbablyCxorbiaPath(full)) continue;
      try {
        const inspection = inspectJson(full);
        inspections.push(inspection);
      } catch (err) {
        add(warnings, 'json_skipped_unreadable_or_not_relevant', { file: rel(full), error: String(err.message || err) });
      }
    }
  }
}

const userHome = os.homedir();
const roots = [
  root,
  path.join(root, '.tmp'),
  path.join(userHome, 'OneDrive', 'Documentos'),
  path.join(userHome, 'OneDrive', 'Documents'),
  path.join(userHome, 'Documents'),
  path.join(userHome, 'Downloads'),
  path.join(userHome, 'Descargas'),
  ...extraRoots
].filter(Boolean);

const uniqueRoots = [...new Set(roots.map(x => path.resolve(x)).filter(x => fs.existsSync(x)))];
for (const scanRoot of uniqueRoots) {
  add(info, 'scan_root', { root: scanRoot });
  scanDir(scanRoot);
}

const level1Candidates = inspections.filter(x => x.level1Candidate).sort((a, b) => b.possibleVisitRows - a.possibleVisitRows || b.bytes - a.bytes);
const realLevel1Candidates = inspections.filter(x => x.realLevel1Candidate).sort((a, b) => b.possibleVisitRows - a.possibleVisitRows || b.bytes - a.bytes);
const syntheticLevel1Candidates = inspections.filter(x => x.syntheticLevel1Candidate).sort((a, b) => b.possibleVisitRows - a.possibleVisitRows || b.bytes - a.bytes);
const manifestCandidates = inspections.filter(x => x.manifestCandidate);
const selectedLevel1 = level1Candidates[0] || null;

if (syntheticLevel1Candidates.length && !allowSynthetic) {
  add(info, 'synthetic_level1_candidates_excluded_from_realdata_preview', { count: syntheticLevel1Candidates.length });
}

let preflightStep = null;
if (runPreflight && selectedLevel1) {
  const argsList = [
    'tools/contracts/tya-local-realdata-preview-preflight.mjs',
    '--out', path.join(outDir, 'preflight-from-recovered-level1'),
    '--input', selectedLevel1.file
  ];
  const result = spawnSync(process.execPath, argsList, { cwd: root, encoding: 'utf8', maxBuffer: 1024 * 1024 * 20 });
  preflightStep = {
    command: ['node', ...argsList].join(' '),
    status: result.status,
    ok: result.status === 0,
    stdoutTail: (result.stdout || '').slice(-4000),
    stderrTail: (result.stderr || '').slice(-4000)
  };
  if (result.status !== 0) add(warnings, 'preflight_from_recovered_level1_nonzero', { status: result.status });
}

if (!realLevel1Candidates.length) add(warnings, 'no_real_level1_sanitized_visit_output_found_in_expanded_local_scan');

const report = {
  gate: 'cxorbia-tya-local-level1-recovery-preflight',
  generatedAt: new Date().toISOString(),
  verdict: realLevel1Candidates.length
    ? 'GO_REAL_LEVEL1_LOCAL_CANDIDATE_FOUND_NO_RUNTIME'
    : 'NO_GO_REAL_LEVEL1_LOCAL_CANDIDATE_NOT_FOUND',
  productionDecision: 'BLOCK_PRODUCTION_UNTIL_REAL_LEVEL2_VALIDATED_RUNTIME_SWITCH_SMOKE_AND_PAULA_GO',
  mode: allowSynthetic ? 'allow_synthetic_contract_test' : 'realdata_only_default',
  counts: {
    rootsChecked: uniqueRoots.length,
    dirsVisited: visitedDirs.size,
    jsonFilesInspected: inspections.length,
    realLevel1Candidates: realLevel1Candidates.length,
    syntheticLevel1Candidates: syntheticLevel1Candidates.length,
    selectedLevel1Candidates: level1Candidates.length,
    manifestCandidates: manifestCandidates.length,
    warnings: warnings.length,
    hardFails: hardFails.length
  },
  selectedLevel1: selectedLevel1 ? {
    file: selectedLevel1.file,
    fileSafe: selectedLevel1.fileSafe,
    possibleVisitRows: selectedLevel1.possibleVisitRows,
    bytes: selectedLevel1.bytes,
    syntheticFixture: selectedLevel1.syntheticFixture
  } : null,
  nextStep: selectedLevel1
    ? 'Review generated preflight-from-recovered-level1 report. If Level 2 validates cleanly and candidate is not synthetic, run final GO/NO-GO; do not switch runtime automatically.'
    : 'No real local sanitized row-level output was found. Generate or recover the documented HR source-safe/full-flow output locally; do not request HR again and do not use raw HR in repo.',
  safeState: {
    runtimeConnected: false,
    frontendModified: false,
    modulesModified: false,
    firestoreWrites: false,
    importsExecuted: false,
    hrWrites: false,
    oldDatabaseConnected: false,
    deploy: false,
    production: false,
    rawPii: false
  },
  hardFails,
  warnings,
  info,
  realLevel1Candidates: realLevel1Candidates.slice(0, 20).map(x => ({ file: x.file, fileSafe: x.fileSafe, possibleVisitRows: x.possibleVisitRows, bytes: x.bytes })),
  syntheticLevel1Candidates: syntheticLevel1Candidates.slice(0, 20).map(x => ({ file: x.file, fileSafe: x.fileSafe, possibleVisitRows: x.possibleVisitRows, bytes: x.bytes })),
  manifestCandidates: manifestCandidates.slice(0, 20).map(x => ({ file: x.file, fileSafe: x.fileSafe, bytes: x.bytes })),
  preflightStep
};

writeJson(outDir, 'local-level1-recovery-preflight-report.json', report);
const md = [
  '# CXOrbia TyA local Level 1 recovery preflight',
  '',
  `Generated: ${report.generatedAt}`,
  `Verdict: ${report.verdict}`,
  `Production decision: ${report.productionDecision}`,
  `Mode: ${report.mode}`,
  '',
  '## Counts',
  `- Roots checked: ${report.counts.rootsChecked}`,
  `- Directories visited: ${report.counts.dirsVisited}`,
  `- JSON files inspected: ${report.counts.jsonFilesInspected}`,
  `- Real Level 1 candidates: ${report.counts.realLevel1Candidates}`,
  `- Synthetic Level 1 candidates excluded unless explicitly allowed: ${report.counts.syntheticLevel1Candidates}`,
  `- Selected Level 1 candidates: ${report.counts.selectedLevel1Candidates}`,
  `- Manifest candidates: ${report.counts.manifestCandidates}`,
  `- Warnings: ${report.counts.warnings}`,
  `- Hard fails: ${report.counts.hardFails}`,
  '',
  '## Selected Level 1 candidate',
  report.selectedLevel1 ? `- ${report.selectedLevel1.fileSafe} · possibleVisitRows=${report.selectedLevel1.possibleVisitRows} · synthetic=${report.selectedLevel1.syntheticFixture}` : '- none',
  '',
  '## Real Level 1 candidates',
  ...(report.realLevel1Candidates.length ? report.realLevel1Candidates.map(x => `- ${x.fileSafe} · possibleVisitRows=${x.possibleVisitRows}`) : ['- none found']),
  '',
  '## Synthetic Level 1 candidates excluded',
  ...(report.syntheticLevel1Candidates.length ? report.syntheticLevel1Candidates.map(x => `- ${x.fileSafe} · possibleVisitRows=${x.possibleVisitRows}`) : ['- none found']),
  '',
  '## Manifest candidates',
  ...(report.manifestCandidates.length ? report.manifestCandidates.map(x => `- ${x.fileSafe}`) : ['- none found']),
  '',
  '## Preflight from recovered candidate',
  preflightStep ? `- status=${preflightStep.status} ok=${preflightStep.ok}` : '- not run because no real Level 1 candidate was found',
  '',
  '## Next step',
  `- ${report.nextStep}`,
  '',
  '## Safe state',
  '- Runtime not connected',
  '- Frontend not modified',
  '- Modules not modified',
  '- No Firestore writes',
  '- No imports',
  '- No HR writes',
  '- No old database connected',
  '- No deploy',
  '- No production',
  '- No raw PII',
  ''
].join('\n');
fs.writeFileSync(path.join(abs(outDir), 'local-level1-recovery-preflight-report.md'), md, 'utf8');
console.log(md);
process.exitCode = hardFails.length ? 1 : 0;
