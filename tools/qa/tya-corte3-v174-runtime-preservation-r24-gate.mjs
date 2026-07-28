#!/usr/bin/env node
/* CXOrbia TyA · Corte 3 runtime preservation gate R24.
   The original V174 manifest remains the baseline protection, while an audited
   frontend overlay may be explicitly accepted only when every authorized path
   matches its locked byte identity. Mutable documentation and the approved
   DEV-only entry remain non-blocking drift. */
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

/* V182 was independently audited GO and empalmed atomically. Remote Hosting DEV
   then reproduced two finance defects: an undefined canonicalPeriodId and an
   incorrect classification of exact-but-unpaid rows as source review. The
   resulting focal corrections are locked here by exact SHA/size. Any other
   runtime drift remains blocked fail-closed. */
const authorizedRuntimeOverlay = new Map([
  ['app/app.js', { size: 30467, sha256: '4bcb12c050ab69ff8551eb8a030004ad3ef0cf3a03cf75beccb28b251dd6559c' }],
  ['app/core/finanzas-core.js', { size: 14228, sha256: '72a599b7ed6fdc02bf4ca915ff2cb0f04a558a9597092b49b31f8112897c26af' }],
  ['app/modules/beneficios.js', { size: 9599, sha256: 'a8e330f6eb7eb9304eacdc1edff1ac83783011b883e3a3ddca2080eef918113c' }],
  ['app/modules/finanzas.js', { size: 100917, sha256: '560f25b6308bbe9ea96f16c1d94da6e47be7eb068e11aca809962cfcc7e8e72e' }],
  ['app/styles/layout.css', { size: 25234, sha256: 'efddab2779cc6873cdf05e42f7c8729c75fd58cac57e3bd947d532b4b5df2f27' }]
]);
const overlayMatch = path => {
  const expected = authorizedRuntimeOverlay.get(path);
  if (!expected) return null;
  const filePath = resolve(root, path);
  if (!existsSync(filePath)) return null;
  const data = readFileSync(filePath);
  const actualSha256 = sha256(data);
  return actualSha256 === expected.sha256 && data.length === expected.size
    ? { path, expectedSha256: expected.sha256, actualSha256, expectedSize: expected.size, actualSize: data.length }
    : null;
};

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
  schemaVersion: '1.1.2',
  gateId: 'tya-corte3-v174-runtime-preservation-r24',
  generatedAt: new Date().toISOString(),
  decision: 'HOLD',
  manifest: relative(root, manifestPath).replaceAll('\\', '/'),
  technicalPassHead,
  head: null,
  manifestFileCount: 0,
  exactManifestMatches: 0,
  authorizedRuntimeOverlay: [],
  allowedManifestDrift: [],
  forbiddenManifestDrift: [],
  missingCanonicalFinancePaths: [],
  appChangesSinceTechnicalPass: [],
  canonicalFinanceChangesSinceTechnicalPass: [],
  legacyVerifierDiagnosis: 'STALE_FULL_APP_HASH_INCLUDED_MUTABLE_DOCS_AND_APPROVED_DEV_ENTRY',
  runtimeOverlayDiagnosis: 'V182_EXACT_AUDITED_OVERLAY_PLUS_REMOTE_SMOKE_FOCAL_FINANCE_FIXES_ALLOWED_FAIL_CLOSED',
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
    const authorized = overlayMatch(entry.path);
    if (authorized) {
      report.authorizedRuntimeOverlay.push(authorized);
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
  const nonDocAppChanges = report.appChangesSinceTechnicalPass.filter(path => !path.startsWith('app/docs/') && !overlayMatch(path));

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
  if (report.authorizedRuntimeOverlay.length !== authorizedRuntimeOverlay.size) blockers.push(`authorized_v182_overlay_incomplete:${report.authorizedRuntimeOverlay.length}/${authorizedRuntimeOverlay.size}`);
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
