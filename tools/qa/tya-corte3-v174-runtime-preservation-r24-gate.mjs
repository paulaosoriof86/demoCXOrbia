#!/usr/bin/env node
/* CXOrbia TyA · Corte 3 V174 runtime preservation gate R24.
   The legacy V174 composite verifier hashes mutable documentation and the
   approved DEV-only entry, so it is not a valid predeploy gate after Corte 3.
   This gate preserves the same protection without treating sanctioned docs or
   the already-PASS DEV entry as regressions. */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import process from 'node:process';

const args = process.argv.slice(2);
const valueOf = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const root = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const manifestPath = resolve(root, valueOf('--manifest', 'app/docs/MANIFEST-V174-CORTE2A-EMPALME-DIRECTO-20260722.json'));
const technicalPassHead = valueOf('--technical-pass-head', '357cdbc73467344557c0da113262bba4f6a976fc');
const outDir = resolve(root, valueOf('--out', '.tmp/tya-corte3-v174-runtime-preservation-r24'));
const reportPath = resolve(outDir, 'report.json');

const runGit = args => {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${(result.stderr || result.stdout || '').trim()}`);
  return String(result.stdout || '').trim();
};
const sha256 = data => createHash('sha256').update(data).digest('hex');
const isAllowedManifestDrift = path => path === 'app/index-backend-dev.html' || path.startsWith('app/docs/');

const canonicalFinancePaths = [
  'app/index-backend-dev.html',
  'app/adapters/tya-financial-canonical-source-safe-adapter.js',
  'app/data/tya-financial-canonical-source-safe.js',
  'app/data/tya-financial-canonical-source-safe-liq-01.js',
  'app/data/tya-financial-canonical-source-safe-liq-02.js',
  'app/data/tya-financial-canonical-source-safe-liq-03.js',
  'app/data/tya-financial-canonical-source-safe-review-01.js',
  'app/data/tya-financial-canonical-source-safe-review-02.js',
  'app/data/tya-financial-canonical-source-safe-evidence.js',
  'app/data/tya-financial-canonical-source-safe-final.js'
];

mkdirSync(outDir, { recursive: true });
const report = {
  schemaVersion: '1.0.0',
  gateId: 'tya-corte3-v174-runtime-preservation-r24',
  generatedAt: new Date().toISOString(),
  decision: 'HOLD',
  manifest: relative(root, manifestPath).replaceAll('\\', '/'),
  technicalPassHead,
  head: null,
  manifestFileCount: 0,
  exactManifestMatches: 0,
  allowedManifestDrift: [],
  forbiddenManifestDrift: [],
  missingCanonicalFinancePaths: [],
  appChangesSinceTechnicalPass: [],
  canonicalFinanceChangesSinceTechnicalPass: [],
  legacyVerifierDiagnosis: 'STALE_FULL_APP_HASH_INCLUDED_MUTABLE_DOCS_AND_APPROVED_DEV_ENTRY',
  safeState: {
    sourceSafe: true,
    deploy: false,
    production: false,
    merge: false,
    imports: false,
    payments: false,
    firestoreWrites: false,
    authWrites: false,
    storageWrites: false,
    hrWrites: false
  }
};

try {
  if (!existsSync(manifestPath)) throw new Error('v174_manifest_missing');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (!Array.isArray(manifest.files) || !manifest.files.length) throw new Error('v174_manifest_files_invalid');
  report.manifestFileCount = manifest.files.length;
  report.head = runGit(['rev-parse', 'HEAD']);
  runGit(['cat-file', '-e', `${technicalPassHead}^{commit}`]);

  for (const entry of manifest.files) {
    const filePath = resolve(root, entry.path);
    let data = null;
    try { data = readFileSync(filePath); } catch (error) {
      const item = { path: entry.path, reason: error.code || error.message, expectedSha256: entry.sha256, expectedSize: entry.size };
      if (isAllowedManifestDrift(entry.path)) report.allowedManifestDrift.push(item);
      else report.forbiddenManifestDrift.push(item);
      continue;
    }
    const actualSha256 = sha256(data);
    const exact = actualSha256 === entry.sha256 && data.length === entry.size;
    if (exact) {
      report.exactManifestMatches += 1;
      continue;
    }
    const item = {
      path: entry.path,
      expectedSha256: entry.sha256,
      actualSha256,
      expectedSize: entry.size,
      actualSize: data.length
    };
    if (isAllowedManifestDrift(entry.path)) report.allowedManifestDrift.push(item);
    else report.forbiddenManifestDrift.push(item);
  }

  report.missingCanonicalFinancePaths = canonicalFinancePaths.filter(path => !existsSync(resolve(root, path)));

  const changedApp = runGit(['diff', '--name-only', technicalPassHead, 'HEAD', '--', 'app']);
  report.appChangesSinceTechnicalPass = changedApp ? changedApp.split(/\r?\n/).filter(Boolean) : [];
  const nonDocAppChanges = report.appChangesSinceTechnicalPass.filter(path => !path.startsWith('app/docs/'));

  const changedFinance = runGit(['diff', '--name-only', technicalPassHead, 'HEAD', '--', ...canonicalFinancePaths]);
  report.canonicalFinanceChangesSinceTechnicalPass = changedFinance ? changedFinance.split(/\r?\n/).filter(Boolean) : [];

  const devHtml = readFileSync(resolve(root, 'app/index-backend-dev.html'), 'utf8');
  const requiredDevTags = [
    'data/tya-hr-source-safe-periods.js',
    'adapters/tya-phase-a-source-safe-dev-adapter.js',
    'data/tya-financial-canonical-source-safe-final.js',
    'adapters/tya-financial-canonical-source-safe-adapter.js',
    'app.js'
  ];
  const invalidTagCounts = requiredDevTags.filter(tag => devHtml.split(tag).length - 1 !== 1);

  const blockers = [];
  if (report.forbiddenManifestDrift.length) blockers.push('forbidden_v174_manifest_drift');
  if (report.missingCanonicalFinancePaths.length) blockers.push('canonical_finance_path_missing');
  if (nonDocAppChanges.length) blockers.push(`app_runtime_changed_after_technical_pass:${nonDocAppChanges.join(',')}`);
  if (report.canonicalFinanceChangesSinceTechnicalPass.length) blockers.push('canonical_finance_changed_after_technical_pass');
  if (invalidTagCounts.length) blockers.push(`dev_entry_tag_count_invalid:${invalidTagCounts.join(',')}`);

  report.blockers = blockers;
  report.decision = blockers.length ? 'HOLD_CORTE3_V174_RUNTIME_PRESERVATION_R24' : 'PASS_CORTE3_V174_RUNTIME_PRESERVATION_R24';
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(report, null, 2));
  if (blockers.length) process.exit(1);
} catch (error) {
  report.blockers = [...(report.blockers || []), String(error?.message || error)];
  report.decision = 'HOLD_CORTE3_V174_RUNTIME_PRESERVATION_R24';
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}
