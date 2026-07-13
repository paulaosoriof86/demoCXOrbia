#!/usr/bin/env node
/*
  CXOrbia V110 union source-lock verifier.

  Verifies the current app/ tree against the deterministic V110 union manifest.
  It does not modify files, call providers, deploy or access production.
*/

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const args = process.argv.slice(2);
const manifestIdx = args.indexOf('--manifest');
const outIdx = args.indexOf('--out');
const manifestPath = manifestIdx >= 0
  ? args[manifestIdx + 1]
  : 'app/docs/MANIFEST-V110-UNION-EMPALME-R1.json';
const outDir = outIdx >= 0 ? args[outIdx + 1] : '.tmp/source-lock-v110-union';
const absoluteManifest = path.join(root, manifestPath);
const appRoot = path.join(root, 'app');

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

if (!fs.existsSync(absoluteManifest)) {
  console.error(`Missing V110 manifest: ${manifestPath}`);
  process.exit(2);
}

const manifest = JSON.parse(fs.readFileSync(absoluteManifest, 'utf8'));
const missing = [];
const mismatched = [];
const entries = [];

for (const expected of manifest.files || []) {
  const relative = String(expected.path || '').replace(/\\/g, '/');
  const absolute = path.join(appRoot, relative);
  if (!fs.existsSync(absolute)) {
    missing.push(relative);
    continue;
  }
  const bytes = fs.readFileSync(absolute);
  const actualSha256 = sha256(bytes);
  const actualSize = bytes.length;
  if (actualSha256 !== expected.sha256 || actualSize !== expected.size) {
    mismatched.push({
      path: relative,
      expectedSha256: expected.sha256,
      actualSha256,
      expectedSize: expected.size,
      actualSize
    });
  }
  entries.push(`${relative}:${actualSha256}`);
}

const aggregateSha256 = sha256(Buffer.from(entries.join('\n'), 'utf8'));
const aggregateMatches = aggregateSha256 === manifest.aggregateSha256;
const fileCountMatches = Number(manifest.fileCount) === (manifest.files || []).length;
const pass = missing.length === 0 && mismatched.length === 0 && aggregateMatches && fileCountMatches;

const report = {
  schemaVersion: '1.0.0',
  gate: 'cxorbia-source-lock-v110-union',
  generatedAt: new Date().toISOString(),
  decision: pass ? 'PASS_V110_UNION_SOURCE_LOCK' : 'FAIL_V110_UNION_SOURCE_LOCK',
  package: manifest.package,
  baseline: manifest.baseline,
  sourceZipSha256: manifest.sourceZipSha256,
  expectedFileCount: manifest.fileCount,
  manifestEntryCount: (manifest.files || []).length,
  verifiedFileCount: entries.length,
  missingCount: missing.length,
  mismatchCount: mismatched.length,
  aggregateExpected: manifest.aggregateSha256,
  aggregateActual: aggregateSha256,
  aggregateMatches,
  fileCountMatches,
  missing,
  mismatched,
  pass,
  safeState: {
    appFilesModified: false,
    providerCalls: false,
    firestoreWrites: false,
    authWrites: false,
    imports: false,
    deploy: false,
    production: false
  }
};

const absoluteOut = path.join(root, outDir);
fs.mkdirSync(absoluteOut, { recursive: true });
fs.writeFileSync(path.join(absoluteOut, 'source-lock-v110-union-report.json'), JSON.stringify(report, null, 2), 'utf8');
fs.writeFileSync(path.join(absoluteOut, 'source-lock-v110-union-report.md'), [
  '# CXOrbia V110 union source lock',
  '',
  `Decision: ${report.decision}`,
  `Expected files: ${report.expectedFileCount}`,
  `Verified files: ${report.verifiedFileCount}`,
  `Missing: ${report.missingCount}`,
  `Mismatched: ${report.mismatchCount}`,
  `Aggregate matches: ${report.aggregateMatches}`,
  '',
  'No app changes, provider calls, writes, imports, deploy or production.'
].join('\n'), 'utf8');

console.log(JSON.stringify(report, null, 2));
process.exitCode = pass ? 0 : 1;
