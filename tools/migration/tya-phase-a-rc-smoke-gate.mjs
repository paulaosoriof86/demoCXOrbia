#!/usr/bin/env node
/*
  CXOrbia TyA - Phase A RC smoke gate aligned to the V110 union source lock.
  Safe-only: static files, source lock, syntax and source-safe reports.
  No deploy, providers, imports or database writes.
*/
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 && args[outIdx + 1] ? path.resolve(root, args[outIdx + 1]) : null;
const copyScanner = path.join(root, 'tools/quality/tya-p0-operational-copy-scanner.mjs');

const exists = rel => fs.existsSync(path.join(root, rel));
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');

function listFiles(dir) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  const stack = [abs];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile()) out.push(path.relative(root, full).split(path.sep).join('/'));
    }
  }
  return out.sort();
}

function localScripts(html) {
  return [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)]
    .map(match => match[1])
    .filter(src => !/^(?:https?:)?\/\//i.test(src) && !/^data:/i.test(src))
    .map(src => src.split(/[?#]/, 1)[0].replace(/^\.\//, '').replace(/^\//, ''));
}

const hardFails = [];
const warnings = [];
const checks = {};

const sourceLockOut = outDir
  ? path.join(outDir, 'v110-source-lock')
  : path.join(root, '.tmp/phase-a-rc-smoke-v110-source-lock');
let sourceLockReport = null;
try {
  execFileSync(process.execPath, [
    'tools/release/tya-source-lock-v110-union-verify.mjs',
    '--manifest', 'app/docs/MANIFEST-V110-UNION-EMPALME-R1.json',
    '--out', sourceLockOut
  ], { cwd: root, stdio: 'pipe' });
  sourceLockReport = JSON.parse(fs.readFileSync(path.join(sourceLockOut, 'source-lock-v110-union-report.json'), 'utf8'));
  if (sourceLockReport.pass !== true) hardFails.push('v110_union_source_lock_not_pass');
} catch (error) {
  hardFails.push(`v110_union_source_lock_failed:${String(error?.stderr || error?.message || error).slice(0, 400)}`);
}
checks.sourceLock = {
  baseline: 'V110 union deterministic manifest',
  manifest: 'app/docs/MANIFEST-V110-UNION-EMPALME-R1.json',
  pass: sourceLockReport?.pass === true,
  expected: sourceLockReport?.expectedFileCount ?? 1426,
  verified: sourceLockReport?.verifiedFileCount ?? 0,
  missingCount: sourceLockReport?.missingCount ?? null,
  mismatchCount: sourceLockReport?.mismatchCount ?? null,
  unexpectedCount: sourceLockReport?.unexpectedCount ?? null,
  aggregateMatches: sourceLockReport?.aggregateMatches ?? false
};

let html = '';
try { html = read('app/index.html'); } catch (error) { hardFails.push(`index_unreadable:${error.message}`); }
const scripts = localScripts(html);
const duplicateScripts = [...new Set(scripts.filter((src, index) => scripts.indexOf(src) !== index))];
const missingScripts = scripts.filter(src => !exists(`app/${src}`));
if (duplicateScripts.length) hardFails.push(`duplicate_local_scripts:${duplicateScripts.join(',')}`);
if (missingScripts.length) hardFails.push(`missing_local_scripts:${missingScripts.join(',')}`);
checks.index = { localScripts: scripts.length, duplicateScripts, missingScripts };

try {
  const manifestWeb = JSON.parse(read('app/manifest.webmanifest'));
  for (const key of ['name', 'short_name', 'start_url', 'display']) {
    if (!manifestWeb[key]) hardFails.push(`manifest_missing_${key}`);
  }
  checks.manifest = { valid: true, name: manifestWeb.name, startUrl: manifestWeb.start_url, display: manifestWeb.display };
} catch (error) {
  hardFails.push(`manifest_invalid:${error.message}`);
  checks.manifest = { valid: false };
}

if (!/<meta\s+charset=["']?UTF-8["']?\s*\/?>/i.test(html)) hardFails.push('index_charset_not_utf8');
if (!exists('app/sw.js') || !read('app/sw.js').includes('self.addEventListener')) hardFails.push('service_worker_invalid');

const jsFiles = listFiles('app').filter(file => file.endsWith('.js'));
const syntaxErrors = [];
for (const file of jsFiles) {
  try { execFileSync(process.execPath, ['--check', file], { cwd: root, stdio: 'pipe' }); }
  catch (error) { syntaxErrors.push({ file, message: String(error.stderr || error.message).trim().slice(0, 500) }); }
}
if (syntaxErrors.length) hardFails.push(`javascript_syntax_errors:${syntaxErrors.map(x => x.file).join(',')}`);
checks.javascript = { checked: jsFiles.length, syntaxErrors };

const activeJsFiles = scripts.filter(src => src.endsWith('.js') && exists(`app/${src}`)).map(src => `app/${src}`);
const moduleIds = [];
for (const file of activeJsFiles) {
  const source = read(file);
  for (const match of source.matchAll(/CX\.module\(\s*["']([^"']+)["']/g)) moduleIds.push({ id: match[1], file });
}
const moduleCounts = new Map();
for (const item of moduleIds) moduleCounts.set(item.id, (moduleCounts.get(item.id) || 0) + 1);
const duplicateModules = [...moduleCounts.entries()].filter(([, count]) => count > 1).map(([id, count]) => ({ id, count }));
if (duplicateModules.length) hardFails.push(`duplicate_module_registration:${duplicateModules.map(x => x.id).join(',')}`);
checks.modules = { registrations: moduleIds.length, unique: moduleCounts.size, duplicateModules };

const semanticRequirements = [
  ['config_mod_cat_hrsource', 'app/core/config.js', /\bhrsource\s*:/],
  ['config_mod_cat_novedades', 'app/core/config.js', /\bnovedades\s*:/],
  ['config_mod_cat_saas', 'app/core/config.js', /\bsaas\s*:/],
  ['config_mod_cat_diagnostico', 'app/core/config.js', /\bdiagnostico\s*:/],
  ['config_mod_cat_administrabilidad', 'app/core/config.js', /\badministrabilidad\s*:/],
  ['unknown_module_restricted_fallback', 'app/core/config.js', /CX\.MOD_CAT\[id\]\s*\|\|\s*["']cfg["']/],
  ['client_projects_data', 'app/core/data.js', /clientProjects\s*\(/],
  ['client_projects_router', 'app/core/router.js', /clientProjects\s*\(/],
  ['client_projects_portal', 'app/modules/cliente.js', /clientProjects\s*\(/]
];
const semanticMissing = [];
for (const [id, file, pattern] of semanticRequirements) {
  if (!exists(file) || !pattern.test(read(file))) semanticMissing.push(id);
}
if (semanticMissing.length) hardFails.push(`v110_required_semantics_missing:${semanticMissing.join(',')}`);
checks.v110Semantics = { required: semanticRequirements.length, missing: semanticMissing };

const r15fWorkflow = exists('.github/workflows/cxorbia-phase-a-source-safe-visual-smoke-tya.yml')
  ? read('.github/workflows/cxorbia-phase-a-source-safe-visual-smoke-tya.yml')
  : '';
const r15fBindingPrepared = r15fWorkflow.includes('tya-source-safe-binding-build-r15f.mjs');
if (!r15fBindingPrepared) hardFails.push('r15f_source_safe_binding_not_prepared');
checks.sourceSafeBinding = {
  prepared: r15fBindingPrepared,
  repoIndexRemainsV110Locked: !scripts.includes('data/tya-hr-source-safe-periods.js') && !scripts.includes('core/tya-phase-a-source-safe-preview.js'),
  buildTimeOnly: true
};

const envFiles = listFiles('.').filter(file => /(^|\/)\.env(?:\.|$)/i.test(file) && !file.endsWith('.example'));
if (envFiles.length) hardFails.push(`environment_files_present:${envFiles.join(',')}`);
const sensitivePatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /"private_key"\s*:\s*"-----BEGIN PRIVATE KEY-----/,
  /https:\/\/hooks\.make\.com\/[0-9A-Za-z_-]{12,}/i
];
const sensitiveHits = [];
const scannerPatternFiles = new Set(['tools/migration/tya-phase-a-rc-smoke-gate.mjs', 'tools/quality/tya-p0-operational-copy-scanner.mjs']);
for (const file of listFiles('.').filter(file => !file.startsWith('.git/') && !file.startsWith('.tmp/') && !scannerPatternFiles.has(file) && /\.(?:js|mjs|cjs|json|yml|yaml|md|html|txt|ps1|sh)$/i.test(file))) {
  let source = '';
  try { source = read(file); } catch { continue; }
  if (sensitivePatterns.some(pattern => pattern.test(source))) sensitiveHits.push(file);
}
if (sensitiveHits.length) hardFails.push(`sensitive_material_detected:${sensitiveHits.join(',')}`);
checks.sensitiveData = { envFiles, sensitiveHits };

let copyReport = null;
if (exists('tools/quality/tya-p0-operational-copy-scanner.mjs')) {
  try {
    execFileSync(process.execPath, [copyScanner], { cwd: root, stdio: 'pipe' });
  } catch {
    // Findings intentionally produce a non-zero exit code.
  }
  const copyPath = path.join(root, '_diagnosticos/tya-p0-operational-copy-scan/p0-operational-copy-scan.json');
  if (fs.existsSync(copyPath)) {
    try { copyReport = JSON.parse(fs.readFileSync(copyPath, 'utf8')); } catch { copyReport = null; }
  }
}
const copyResidues = copyReport?.findingsCount || copyReport?.sourceHitCount || copyReport?.hitCount || 0;
if (copyResidues > 0) warnings.push(`source_lock_copy_items_for_p1_review:${copyResidues}`);
checks.copy = {
  scannerExecuted: Boolean(copyReport),
  sourceResidues: copyResidues,
  classification: copyResidues ? 'P1_REVIEW_NOT_PROVIDER_ACTIVATION' : 'CLEAN'
};

const report = {
  gate: 'cxorbia-tya-phase-a-rc-smoke-v110',
  baseline: 'V110-union-source-lock',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length
    ? 'NO_GO_RC_PHASE_A_V110'
    : (warnings.length ? 'GO_WITH_WARNINGS_RC_PHASE_A_V110' : 'GO_RC_PHASE_A_V110'),
  hardFails,
  warnings,
  checks,
  safeState: {
    deploy: false,
    production: false,
    providers: false,
    databaseWrites: false,
    imports: false,
    authActivation: false,
    firestoreActivation: false
  }
};

if (outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'phase-a-rc-smoke-report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
  const md = [
    '# CXOrbia TyA Phase A RC smoke — V110 union source lock', '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Hard fails: ${hardFails.length}`,
    `Warnings: ${warnings.length}`,
    `V110 files verified: ${checks.sourceLock.verified}/${checks.sourceLock.expected}`,
    `JavaScript checked: ${checks.javascript.checked}`,
    `Module registrations: ${checks.modules.registrations} (${checks.modules.unique} unique)`,
    `R15F binding prepared: ${checks.sourceSafeBinding.prepared}`,
    `Copy items for P1 review: ${checks.copy.sourceResidues}`,
    '', '## Hard fails', ...(hardFails.length ? hardFails.map(x => `- ${x}`) : ['- none']),
    '', '## Warnings', ...(warnings.length ? warnings.map(x => `- ${x}`) : ['- none']),
    '', '## Safe state', '- No deploy', '- No production', '- No provider calls', '- No database writes', '- No imports', '- No Auth/Firestore activation', ''
  ].join('\n');
  fs.writeFileSync(path.join(outDir, 'phase-a-rc-smoke-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
