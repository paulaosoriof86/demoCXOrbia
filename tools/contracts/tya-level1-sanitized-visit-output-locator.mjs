#!/usr/bin/env node
/* CXOrbia TyA - Level 1 sanitized visit output locator
   Safe locator. No HR calls, no Firestore writes, no imports, no deploy.

   Purpose: locate already-generated local/source-safe outputs that can be used
   to build Level 1 sanitized visits without asking Paula for HR again.
*/

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : '.tmp/tya-level1-sanitized-visit-output-locator';
const extraIdx = args.indexOf('--extra');
const extraPath = extraIdx >= 0 ? args[extraIdx + 1] : null;

const contractPath = 'backend/contracts/tya-level1-sanitized-visits-phase-a-v1.json';
const defaultCandidates = [
  '.tmp/tya-hr-source-private-full-flow/report.json',
  '.tmp/tya-hr-source-private-full-flow',
  '.tmp/tya-hr-canonical-staging-source-safe/hr-canonical-staging-source-safe-manifest.json',
  '.tmp/tya-minimal-sanitized-input/tya-minimal-sanitized-input-level0.json',
  'tmp/tya-hr-source-private-full-flow/report.json',
  'tmp/tya-hr-source-private-full-flow',
  'tmp/tya-hr-canonical-staging-source-safe/hr-canonical-staging-source-safe-manifest.json',
  'reports/tya-hr-source-private-full-flow',
  '_reports/tya-hr-source-private-full-flow',
  '_diagnosticos/tya-hr-source-private-full-flow',
  '_review/tya-hr-source-private-full-flow'
];

const forbiddenMarkers = [
  'rawDpi', 'dpi', 'rawBankAccount', 'bankAccount', 'rawPhone', 'phone', 'telefono',
  'rawEmail', 'email', 'mail', 'rawShopperName', 'shopperName', 'nombreShopper',
  'rawHrWorkbook', 'rawCsv', 'privateHrUrl', 'spreadsheetFileId', 'serviceAccountJson',
  'signedNdaFile', 'rawEvidence', 'base64Evidence', 'paymentReceiptBinary', 'makeWebhookUrl', 'geminiApiKey'
];

const hardFails = [];
const warnings = [];
const info = [];
function add(list, message, extra = {}) { list.push({ message, ...extra }); }
function abs(relOrAbs) { return path.isAbsolute(relOrAbs) ? relOrAbs : path.join(root, relOrAbs); }
function exists(p) { return fs.existsSync(abs(p)); }
function isJsonFile(p) { return /\.json$/i.test(p); }
function safeReadJson(file) { return JSON.parse(fs.readFileSync(abs(file), 'utf8')); }
function listJsonFiles(dir) {
  const a = abs(dir);
  if (!fs.existsSync(a) || !fs.statSync(a).isDirectory()) return [];
  const out = [];
  const stack = [a];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (/\.json$/i.test(entry.name)) out.push(full);
    }
  }
  return out;
}
function inspectJson(file) {
  const parsed = safeReadJson(file);
  const text = JSON.stringify(parsed);
  const lower = text.toLowerCase();
  const forbiddenHits = forbiddenMarkers.filter(marker => lower.includes(marker.toLowerCase()));
  const hasManifestTabs = Array.isArray(parsed.manifestTabs) || Array.isArray(parsed?.report?.manifestTabs);
  const candidateRows = Array.isArray(parsed.visits) ? parsed.visits
    : Array.isArray(parsed.rows) ? parsed.rows
    : Array.isArray(parsed.sanitizedVisits) ? parsed.sanitizedVisits
    : Array.isArray(parsed.visitRows) ? parsed.visitRows
    : [];
  const possibleVisitRows = candidateRows.filter(row => {
    const keys = Object.keys(row || {});
    return keys.includes('hrRowId') || keys.includes('visitId') || keys.includes('sourceTab') || keys.includes('quincena');
  }).length;
  return {
    file: path.relative(root, abs(file)),
    bytes: Buffer.byteLength(text, 'utf8'),
    forbiddenHits,
    hasManifestTabs,
    possibleVisitRows,
    topLevelKeys: Object.keys(parsed || {}).slice(0, 30),
    level1Candidate: forbiddenHits.length === 0 && possibleVisitRows > 0,
    manifestCandidate: forbiddenHits.length === 0 && hasManifestTabs
  };
}

let contract = null;
try {
  contract = safeReadJson(contractPath);
  add(info, 'level1_contract_loaded', { file: contractPath });
} catch (err) {
  add(hardFails, 'level1_contract_missing_or_invalid', { file: contractPath, error: String(err.message || err) });
}

const candidates = [...defaultCandidates];
if (contract?.candidateLocalOutputs) candidates.push(...contract.candidateLocalOutputs.filter(x => !x.includes('*')));
if (extraPath) candidates.push(extraPath);

const uniqueCandidates = [...new Set(candidates)];
const foundPaths = [];
for (const candidate of uniqueCandidates) {
  if (!exists(candidate)) {
    add(info, 'candidate_not_found', { path: candidate });
    continue;
  }
  const stat = fs.statSync(abs(candidate));
  if (stat.isDirectory()) foundPaths.push(...listJsonFiles(candidate));
  else if (stat.isFile() && isJsonFile(candidate)) foundPaths.push(abs(candidate));
}

const inspections = [];
for (const file of [...new Set(foundPaths)]) {
  try {
    inspections.push(inspectJson(file));
  } catch (err) {
    add(warnings, 'candidate_json_unreadable', { file: path.relative(root, abs(file)), error: String(err.message || err) });
  }
}

const level1Candidates = inspections.filter(x => x.level1Candidate);
const manifestCandidates = inspections.filter(x => x.manifestCandidate);
if (!level1Candidates.length) {
  add(warnings, 'no_level1_sanitized_visit_output_found');
}
if (!manifestCandidates.length) {
  add(warnings, 'no_manifest_output_found_in_local_candidates');
}

const report = {
  gate: 'cxorbia-tya-level1-sanitized-visit-output-locator',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_LEVEL1_LOCATOR' : level1Candidates.length ? 'GO_LEVEL1_CANDIDATE_FOUND_NO_RUNTIME' : 'GO_LOCATOR_READY_NO_LEVEL1_FOUND_YET',
  productionDecision: 'BLOCK_PRODUCTION_UNTIL_LEVEL1_VALIDATED_RUNTIME_SWITCH_AND_SMOKE_GO',
  counts: {
    candidatePathsChecked: uniqueCandidates.length,
    jsonFilesFound: inspections.length,
    manifestCandidates: manifestCandidates.length,
    level1Candidates: level1Candidates.length
  },
  nextStep: level1Candidates.length
    ? 'Validate first Level1 candidate with tya-minimal-sanitized-input-validate.mjs before any runtime switch.'
    : 'If no Level1 output exists locally, run the documented HR source-safe/full-flow generator locally when computer is available; do not request HR again yet.',
  safeState: {
    runtimeConnected: false,
    frontendModified: false,
    modulesModified: false,
    firestoreWrites: false,
    importsExecuted: false,
    hrWrites: false,
    deploy: false,
    production: false,
    rawPii: false
  },
  hardFails,
  warnings,
  info,
  inspections,
  level1Candidates,
  manifestCandidates
};

const absOut = abs(outDir);
fs.mkdirSync(absOut, { recursive: true });
fs.writeFileSync(path.join(absOut, 'level1-sanitized-visit-output-locator-report.json'), JSON.stringify(report, null, 2), 'utf8');
const md = [
  '# CXOrbia TyA Level 1 sanitized visit output locator',
  '',
  `Generated: ${report.generatedAt}`,
  `Verdict: ${report.verdict}`,
  `Production decision: ${report.productionDecision}`,
  '',
  '## Counts',
  `- Candidate paths checked: ${report.counts.candidatePathsChecked}`,
  `- JSON files found: ${report.counts.jsonFilesFound}`,
  `- Manifest candidates: ${report.counts.manifestCandidates}`,
  `- Level 1 candidates: ${report.counts.level1Candidates}`,
  '',
  '## Level 1 candidates',
  ...(level1Candidates.length ? level1Candidates.map(x => `- ${x.file} · possibleVisitRows=${x.possibleVisitRows}`) : ['- none found']),
  '',
  '## Manifest candidates',
  ...(manifestCandidates.length ? manifestCandidates.map(x => `- ${x.file}`) : ['- none found']),
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
  '- No deploy',
  '- No production',
  '- No raw PII',
  ''
].join('\n');
fs.writeFileSync(path.join(absOut, 'level1-sanitized-visit-output-locator-report.md'), md, 'utf8');

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
