#!/usr/bin/env node
/**
 * CXOrbia TyA — Phase A complete composition source/static gate.
 *
 * Read-only. Uses only Node built-ins. It does not call providers, deploy,
 * write Firestore/Auth/Storage/HR, invoke Make/Gemini, execute payments,
 * merge or touch production.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const manifestPath = path.join(root, 'app/docs/MANIFEST-PHASE-A-COMPLETA-FINAL-COMPOSICION-20260804.json');
const indexPath = path.join(root, 'app/index-backend-dev.html');
const failures = [];
const warnings = [];
const evidence = {
  schemaVersion: 'cxorbia.phase-a-complete-composition-source-gate.v1',
  generatedAt: new Date().toISOString(),
  root,
  checks: {},
  failures,
  warnings,
  safety: {
    providerWrites: 0,
    deploys: 0,
    firestoreWrites: 0,
    authWrites: 0,
    storageWrites: 0,
    hrWrites: 0,
    makeCalls: 0,
    geminiCalls: 0,
    paymentWrites: 0,
    merge: false,
    production: false
  }
};

function fail(code, detail) {
  failures.push({ code, detail });
}
function warn(code, detail) {
  warnings.push({ code, detail });
}
function read(rel) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) return null;
  return fs.readFileSync(abs);
}
function text(rel) {
  const b = read(rel);
  return b == null ? null : b.toString('utf8');
}
function gitBlobSha(buffer) {
  const head = Buffer.from(`blob ${buffer.length}\0`, 'utf8');
  return crypto.createHash('sha1').update(head).update(buffer).digest('hex');
}
function localAsset(src) {
  return src && !/^(?:https?:)?\/\//i.test(src) && !src.startsWith('/__/');
}
function normalizeAsset(src) {
  const clean = String(src || '').split(/[?#]/)[0].replace(/^\.\//, '').replace(/^\//, '');
  return clean.startsWith('app/') ? clean : `app/${clean}`;
}
function positions(list, names) {
  return Object.fromEntries(names.map(name => [name, list.indexOf(name)]));
}

if (!fs.existsSync(manifestPath)) {
  fail('MANIFEST_MISSING', path.relative(root, manifestPath));
} else if (!fs.existsSync(indexPath)) {
  fail('ENTRYPOINT_MISSING', path.relative(root, indexPath));
} else {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const index = fs.readFileSync(indexPath, 'utf8');

  // 1. Exact critical blob verification.
  let blobPass = 0;
  for (const item of manifest.criticalFiles || []) {
    const buffer = read(item.path);
    if (buffer == null) {
      fail('CRITICAL_FILE_MISSING', item.path);
      continue;
    }
    const actual = gitBlobSha(buffer);
    if (actual !== item.gitBlob) {
      fail('CRITICAL_BLOB_MISMATCH', { path: item.path, expected: item.gitBlob, actual });
      continue;
    }
    blobPass += 1;
  }
  evidence.checks.criticalBlobs = {
    expected: (manifest.criticalFiles || []).length,
    pass: blobPass,
    exact: blobPass === (manifest.criticalFiles || []).length
  };

  // 2. Local scripts/styles and duplicate load references.
  const scripts = [...index.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>/gi)].map(m => m[1]);
  const styles = [...index.matchAll(/<link\b[^>]*\brel=["']stylesheet["'][^>]*\bhref=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
  const localScripts = scripts.filter(localAsset).map(normalizeAsset);
  const localStyles = styles.filter(localAsset).map(normalizeAsset);
  const missingAssets = [...localScripts, ...localStyles].filter(rel => !fs.existsSync(path.join(root, rel)));
  if (missingAssets.length) fail('LOCAL_ASSET_MISSING', missingAssets);
  const duplicates = localScripts.filter((v, i, a) => a.indexOf(v) !== i);
  if (duplicates.length) fail('DUPLICATE_LOCAL_SCRIPT', [...new Set(duplicates)]);
  evidence.checks.assets = {
    localScripts: localScripts.length,
    localStyles: localStyles.length,
    missing: missingAssets,
    duplicateScripts: [...new Set(duplicates)]
  };

  // 3. Required ordering.
  const orderNames = [
    'app/core/build-lock.js',
    'app/core/config.js',
    'app/core/data.js',
    'app/core/data-source.js',
    'app/adapters/tya-live-source-refresh-watch-v2.js',
    'app/adapters/tya-cumulative-read-model-v2.js',
    'app/adapters/tya-canonical-state-semantics-v2.js',
    'app/core/backend-browser-auth.js',
    'app/adapters/tya-protected-auth-hr-authority-bridge-v2.js',
    'app/core/router.js',
    'app/modules/dashboard.js',
    'app/modules/operacion-extra.js',
    'app/modules/cliente-extra.js',
    'app/adapters/tya-c6-domain-consistency-bridge.js',
    'app/adapters/tya-canonical-shopper-portal-v2.js',
    'app/adapters/tya-canonical-reservations-guard-v2.js',
    'app/adapters/tya-c6-unified-human-runtime-v1.js',
    'app/app.js'
  ];
  const pos = positions(localScripts, orderNames);
  for (const name of orderNames) {
    if (pos[name] < 0) fail('REQUIRED_SCRIPT_NOT_LOADED', name);
  }
  const firstModule = localScripts.findIndex(x => x.startsWith('app/modules/'));
  const last = localScripts.at(-1);
  if (!(pos['app/core/data.js'] >= 0 && pos['app/core/data.js'] < firstModule)) {
    fail('CXDATA_NOT_BEFORE_MODULES', { data: pos['app/core/data.js'], firstModule });
  }
  for (const adapter of [
    'app/adapters/tya-live-source-refresh-watch-v2.js',
    'app/adapters/tya-cumulative-read-model-v2.js',
    'app/adapters/tya-canonical-state-semantics-v2.js',
    'app/adapters/tya-protected-auth-hr-authority-bridge-v2.js'
  ]) {
    if (!(pos[adapter] >= 0 && pos[adapter] < firstModule)) {
      fail('CANONICAL_ADAPTER_NOT_BEFORE_MODULES', { adapter, position: pos[adapter], firstModule });
    }
  }
  if (last !== 'app/app.js') fail('APP_JS_NOT_LAST', { last });
  if (!(pos['app/modules/operacion-extra.js'] < pos['app/app.js'] && pos['app/modules/cliente-extra.js'] < pos['app/app.js'])) {
    fail('REPORTKIT_REGISTRATION_AFTER_APP_START', pos);
  }
  evidence.checks.loadOrder = { firstModule, last, positions: pos };

  // 4. Required module registrations and navigation references.
  const moduleSource = localScripts
    .filter(rel => rel.startsWith('app/modules/'))
    .map(rel => text(rel) || '')
    .join('\n');
  const config = text('app/core/config.js') || '';
  const requiredByRole = {
    admin: ['midia','dashboard','visitas','postulaciones','reservas','shoppers','informes','proyectos','periodos','historico','hrsource','aprendizaje','cert','documentos','financiero','movimientos','liquidaciones','lotes','costos'],
    shopper: ['midia','miperfil','visitas','reservas','misvisitas','aprendizaje','cert','documentos','beneficios','mireportes'],
    cliente: ['cli_dashboard','cli_sucursales','cli_acciones','cli_capacitacion','cli_reportes','cli_programa','cli_market','novedades']
  };
  const missingModules = [];
  const missingRegistry = [];
  const missingNav = [];
  for (const [role, ids] of Object.entries(requiredByRole)) {
    for (const id of ids) {
      const modRe = new RegExp(`CX\\.module\\(\\s*['"]${id}['"]`);
      if (!modRe.test(moduleSource)) missingModules.push({ role, id });
      const regRe = new RegExp(`\\b${id.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\s*:`);
      if (!regRe.test(config)) missingRegistry.push({ role, id });
      const navRe = new RegExp(`['"]${id}['"]`);
      if (!navRe.test(config)) missingNav.push({ role, id });
    }
  }
  if (missingModules.length) fail('REQUIRED_MODULE_REGISTRATION_MISSING', missingModules);
  if (missingRegistry.length) fail('MODULE_REGISTRY_METADATA_MISSING', missingRegistry);
  if (missingNav.length) fail('ROLE_NAV_REFERENCE_MISSING', missingNav);
  evidence.checks.roleNavigation = { requiredByRole, missingModules, missingRegistry, missingNav };

  // 5. Report kit provider and consumers.
  const clienteExtra = text('app/modules/cliente-extra.js') || '';
  const operacionExtra = text('app/modules/operacion-extra.js') || '';
  const finanzas = text('app/modules/finanzas.js') || '';
  const reportChecks = {
    provider: /CX\.reportKit\s*=/.test(clienteExtra),
    client: /CX\.module\(\s*['"]cli_reportes['"]/.test(clienteExtra),
    admin: /CX\.module\(\s*['"]informes['"]/.test(operacionExtra),
    shopper: /CX\.module\(\s*['"]mireportes['"]/.test(operacionExtra),
    finance: /CX\.reportKit/.test(finanzas),
    pdf: /exportPDF/.test(clienteExtra),
    xlsx: /exportExcel/.test(clienteExtra),
    pptx: /exportPPT/.test(clienteExtra)
  };
  for (const [key, ok] of Object.entries(reportChecks)) {
    if (!ok) fail('REPORTKIT_CONTRACT_MISSING', key);
  }
  evidence.checks.reportKit = reportChecks;

  // 6. External library versions are explicit.
  const externalPins = {
    firebase: /firebasejs\/10\.12\.5\//.test(index),
    sheetjs: /xlsx-0\.20\.3\//.test(index),
    mammoth: /mammoth\/1\.6\.0\//.test(index)
  };
  for (const [key, ok] of Object.entries(externalPins)) {
    if (!ok) fail('EXTERNAL_DEPENDENCY_NOT_PINNED', key);
  }
  evidence.checks.externalPins = externalPins;

  // 7. Superseded A+B overlay is visible as a controlled warning, not silently accepted.
  const superseded = 'app/adapters/tya-ab-cumulative-composition-v1.js';
  if (localScripts.includes(superseded)) {
    const ab = text(superseded) || '';
    if (!/MANIFEST-A-B-CUMULATIVE-CANDIDATE-20260802\.json/.test(ab)) {
      fail('AB_OVERLAY_UNEXPECTED_CONTENT', superseded);
    } else {
      warn('P1_SUPERSEDED_AB_OVERLAY_LOADED', 'The partial A+B overlay remains loaded. Do not remove it without a proved no-loss delta.');
    }
  }

  // 8. Runtime secret scan. Skip docs, vendor, encrypted handoffs and private inbox.
  const secretPatterns = [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /"private_key"\s*:\s*"-----BEGIN/,
    /"type"\s*:\s*"service_account"/
  ];
  const scanRoots = ['app', 'backend', 'tools'];
  const secretHits = [];
  function walk(abs) {
    for (const ent of fs.readdirSync(abs, { withFileTypes: true })) {
      const p = path.join(abs, ent.name);
      const rel = path.relative(root, p).replaceAll(path.sep, '/');
      if (ent.isDirectory()) {
        if (/^(?:app\/docs|app\/vendor|backend\/(?:secure|private-inbox)|\.git)(?:\/|$)/.test(rel)) continue;
        walk(p);
        continue;
      }
      if (!/\.(?:js|mjs|cjs|json|html|css|py|yml|yaml|md|txt)$/i.test(ent.name)) continue;
      if (/\.(?:enc\.json|lock)$/i.test(ent.name)) continue;
      const st = fs.statSync(p);
      if (st.size > 2_000_000) continue;
      const body = fs.readFileSync(p, 'utf8');
      if (secretPatterns.some(re => re.test(body))) secretHits.push(rel);
    }
  }
  for (const rel of scanRoots) {
    const abs = path.join(root, rel);
    if (fs.existsSync(abs)) walk(abs);
  }
  if (secretHits.length) fail('PLAINTEXT_PRIVATE_KEY_OR_SERVICE_ACCOUNT', secretHits);
  evidence.checks.secretScan = { hits: secretHits };

  // 9. Documented non-blocking export debt remains a warning.
  warn('P1_PDF_CHART_EXPORT_DEBT', 'Some print paths may omit charts. Rows/scope/source must still match.');
  warn('P2_XLSX_PRESENTATION_DEBT', 'Spreadsheet formatting is basic but data contract remains required.');
}

evidence.decision = failures.length
  ? 'FAIL_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE'
  : warnings.length
    ? 'PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS'
    : 'PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE';

const output = JSON.stringify(evidence, null, 2);
console.log(output);
process.exitCode = failures.length ? 1 : 0;
