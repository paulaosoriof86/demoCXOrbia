#!/usr/bin/env node
/*
  CXOrbia TyA - post-V96 source-lock runtime verifier.
  Safe-only: local file hashing and report generation. No provider calls,
  no deploy, no imports, no database writes, no runtime mutation.
*/

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const valueOf = (flag, fallback = null) => {
  const idx = args.indexOf(flag);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback;
};

const manifestPath = valueOf(
  '--manifest',
  'backend/config/phase-a-source-lock-post-v96-runtime-manifest.source-safe.json'
);
const outDir = valueOf('--out', null);

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function writeReports(report) {
  if (!outDir) return;
  const summary = report.summary || {
    runtimeExpected: 0,
    runtimeMatched: 0,
    runtimeMissing: 0,
    runtimeMismatched: 0,
    documentationWarnings: 0,
    unexpectedAppFiles: 0
  };
  const runtimeMissing = report.runtimeMissing || [];
  const runtimeMismatched = report.runtimeMismatched || [];
  const documentationWarnings = report.documentationWarnings || [];
  const unexpectedAppFiles = report.unexpectedAppFiles || [];
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, 'source-lock-post-v96-runtime-report.json'),
    JSON.stringify(report, null, 2) + '\n',
    'utf8'
  );
  const lines = [
    '# CXOrbia TyA — source lock post-V96 runtime verification',
    '',
    `Generated: ${report.generatedAt}`,
    `Source lock: ${report.sourceLockId}`,
    `Manifest: ${report.manifestPath}`,
    `Verdict: ${report.verdict}`,
    `Runtime expected: ${summary.runtimeExpected}`,
    `Runtime matched: ${summary.runtimeMatched}`,
    `Runtime missing: ${summary.runtimeMissing}`,
    `Runtime mismatched: ${summary.runtimeMismatched}`,
    `Candidate docs/meta warnings: ${summary.documentationWarnings}`,
    `Unexpected runtime-scope files (report only): ${summary.unexpectedAppFiles}`,
    '',
    '## Runtime missing',
    ...(runtimeMissing.length ? runtimeMissing.map(item => `- ${item.path}`) : ['- none']),
    '',
    '## Runtime hash mismatches',
    ...(runtimeMismatched.length
      ? runtimeMismatched.map(item => `- ${item.path}: expected ${item.expectedSha256}, actual ${item.actualSha256}`)
      : ['- none']),
    '',
    '## Candidate documentation/meta warnings',
    ...(documentationWarnings.length
      ? documentationWarnings.map(item => `- ${item.path}: ${item.reason}`)
      : ['- none']),
    '',
    '## Unexpected repository runtime-scope files (report only)',
    ...(unexpectedAppFiles.length ? unexpectedAppFiles.map(item => `- ${item}`) : ['- none']),
    '',
    '## Safe state',
    '- No deploy',
    '- No production',
    '- No provider calls',
    '- No database writes',
    '- No imports',
    '- No runtime mutation',
    ''
  ];
  fs.writeFileSync(
    path.join(outDir, 'source-lock-post-v96-runtime-report.md'),
    lines.join('\n'),
    'utf8'
  );
}

function listFilesRecursively(root) {
  if (!fs.existsSync(root)) return [];
  const out = [];
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile()) out.push(full.split(path.sep).join('/'));
    }
  }
  return out.sort();
}

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch (error) {
  const report = {
    gate: 'cxorbia-tya-source-lock-post-v96-runtime',
    generatedAt: new Date().toISOString(),
    manifestPath,
    verdict: 'NO_GO_MANIFEST_UNREADABLE',
    error: String(error?.message || error),
    safeState: {
      deploy: false,
      production: false,
      providers: false,
      databaseWrites: false,
      imports: false,
      runtimeMutation: false
    }
  };
  writeReports(report);
  console.log(JSON.stringify(report, null, 2));
  process.exit(1);
}

const manifestErrors = [];
if (manifest.kind !== 'cxorbia.sourceLockRuntimeManifest') manifestErrors.push('unexpected_kind');
if (!Array.isArray(manifest.runtimeFiles) || !manifest.runtimeFiles.length) manifestErrors.push('runtime_files_missing');
const duplicatePaths = [];
const seen = new Set();
for (const item of manifest.runtimeFiles || []) {
  if (!item || typeof item.path !== 'string' || !item.path.startsWith('app/')) manifestErrors.push(`invalid_path:${item?.path ?? 'null'}`);
  if (!/^[a-f0-9]{64}$/.test(item?.sha256 || '')) manifestErrors.push(`invalid_sha256:${item?.path ?? 'null'}`);
  if (seen.has(item?.path)) duplicatePaths.push(item.path);
  seen.add(item?.path);
}
if (duplicatePaths.length) manifestErrors.push(`duplicate_paths:${duplicatePaths.join(',')}`);
const expectedRuntimeCount = (manifest.runtimeFiles || []).length;
if (manifest.verificationPolicy?.runtimeRequiredCount !== expectedRuntimeCount) {
  manifestErrors.push(`runtime_count_mismatch:${manifest.verificationPolicy?.runtimeRequiredCount}:${expectedRuntimeCount}`);
}

if (manifestErrors.length) {
  const report = {
    gate: 'cxorbia-tya-source-lock-post-v96-runtime',
    generatedAt: new Date().toISOString(),
    sourceLockId: manifest.sourceLockId || null,
    manifestPath,
    verdict: 'NO_GO_MANIFEST_INVALID',
    manifestErrors,
    safeState: {
      deploy: false,
      production: false,
      providers: false,
      databaseWrites: false,
      imports: false,
      runtimeMutation: false
    }
  };
  writeReports(report);
  console.log(JSON.stringify(report, null, 2));
  process.exit(1);
}

const runtimeMissing = [];
const runtimeMismatched = [];
const runtimeMatched = [];
for (const item of manifest.runtimeFiles) {
  const exists = fs.existsSync(item.path) && fs.statSync(item.path).isFile();
  if (!exists) {
    runtimeMissing.push({ path: item.path, expectedSha256: item.sha256 });
    continue;
  }
  const actualSha256 = sha256File(item.path);
  if (actualSha256 === item.sha256) {
    runtimeMatched.push({ path: item.path, sha256: actualSha256 });
  } else {
    runtimeMismatched.push({
      path: item.path,
      expectedSha256: item.sha256,
      actualSha256
    });
  }
}

const manifestPaths = new Set((manifest.runtimeFiles || []).map(item => item.path));
function isRuntimeScope(file) {
  return [
    'app/app.js',
    'app/index.html',
    'app/manifest.webmanifest',
    'app/sw.js'
  ].includes(file) || [
    'app/core/',
    'app/modules/',
    'app/styles/',
    'app/demo/'
  ].some(prefix => file.startsWith(prefix));
}
const unexpectedAppFiles = listFilesRecursively('app')
  .filter(isRuntimeScope)
  .filter(file => !manifestPaths.has(file));
const verdict = runtimeMissing.length || runtimeMismatched.length
  ? 'NO_GO_SOURCE_LOCK_RUNTIME_NOT_EMPLOYED'
  : 'GO_SOURCE_LOCK_RUNTIME_MATCH_NOT_PRODUCTION_GO';

const report = {
  gate: 'cxorbia-tya-source-lock-post-v96-runtime',
  generatedAt: new Date().toISOString(),
  sourceLockId: manifest.sourceLockId,
  candidateFileName: manifest.candidateFileName,
  candidateSha256: manifest.candidateSha256,
  manifestPath,
  verdict,
  summary: {
    runtimeExpected: expectedRuntimeCount,
    runtimeMatched: runtimeMatched.length,
    runtimeMissing: runtimeMissing.length,
    runtimeMismatched: runtimeMismatched.length,
    documentationWarnings: manifest.excludedDocumentationAndMetadata?.length || 0,
    unexpectedAppFiles: unexpectedAppFiles.length
  },
  runtimeMissing,
  runtimeMismatched,
  documentationWarnings: (manifest.excludedDocumentationAndMetadata || []).map(path => ({
    path,
    reason: 'excluded_from_runtime_gate'
  })),
  unexpectedAppFiles,
  safeState: {
    deploy: false,
    production: false,
    providers: false,
    databaseWrites: false,
    imports: false,
    runtimeMutation: false
  },
  nextAction: verdict.startsWith('GO_')
    ? 'run_static_and_human_smoke_before_updating_validated_runtime_sha'
    : 'empalme_post_v96_runtime_by_frontend_lane_or_explicit_authorization_then_rerun'
};

writeReports(report);
console.log(JSON.stringify(report, null, 2));
process.exitCode = verdict.startsWith('GO_') ? 0 : 1;
