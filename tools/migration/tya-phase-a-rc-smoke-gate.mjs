#!/usr/bin/env node
/*
  CXOrbia TyA - Phase A RC smoke gate
  Safe local validator. No network calls, no provider calls, no database writes, no deploy.

  Usage from repo root:
    node tools/migration/tya-phase-a-rc-smoke-gate.mjs
    node tools/migration/tya-phase-a-rc-smoke-gate.mjs --out .tmp/phase-a-rc-smoke
*/

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const args = process.argv.slice(2);
const outIndex = args.indexOf('--out');
const outDir = outIndex >= 0 ? args[outIndex + 1] : null;

const hardFails = [];
const warnings = [];
const info = [];

function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8'); }
function push(type, message, extra={}){ (type === 'fail' ? hardFails : type === 'warn' ? warnings : info).push({ message, ...extra }); }

const requiredDocs = [
  'app/docs/EMPALME-COMPLETO-STATUS-POST-V89-20260706.md',
  'app/docs/PHASE-A-PRODUCCION-GO-NOGO-POST-V89-20260706.md',
  'app/docs/CAMBIOS-BACKEND-ADDENDUM-GUARD-PRODUCCION-POST-V89-20260706.md',
  'app/docs/ACADEMIA-IMPACT-TRACKER-POST-V89-20260706.md',
  'app/docs/ACADEMIA-GATE-POST-V89-20260706.md',
  'app/docs/HANDOFF-ACADEMIA-POST-V89-20260706.md'
];

for (const rel of requiredDocs) {
  if (exists(rel)) push('info', 'required_doc_present', { file: rel });
  else push('fail', 'required_doc_missing', { file: rel });
}

const indexPath = 'app/index.html';
if (!exists(indexPath)) {
  push('fail', 'index_missing', { file: indexPath });
} else {
  const html = read(indexPath);
  const scripts = [...html.matchAll(/<script\s+src=["']([^"']+)["']\s*>\s*<\/script>/g)].map(m => m[1]);
  const localScripts = scripts.filter(src => !/^https?:\/\//.test(src));
  const externals = scripts.filter(src => /^https?:\/\//.test(src));
  push('info', 'script_inventory', { total: scripts.length, local: localScripts.length, external: externals.length });

  for (const src of localScripts) {
    const rel = path.join('app', src).replace(/\\/g, '/');
    if (!exists(rel)) push('fail', 'local_script_missing', { script: src, file: rel });
  }

  const uiIdx = scripts.indexOf('core/ui.js');
  const guardIdx = scripts.indexOf('core/production-copy-guard.js');
  const firstModuleIdx = scripts.findIndex(src => src.startsWith('modules/'));
  if (guardIdx < 0) push('fail', 'production_copy_guard_not_loaded');
  else {
    push('info', 'production_copy_guard_loaded', { position: guardIdx + 1 });
    if (uiIdx < 0) push('fail', 'core_ui_not_loaded');
    if (uiIdx >= 0 && guardIdx <= uiIdx) push('fail', 'guard_must_load_after_core_ui', { uiPosition: uiIdx + 1, guardPosition: guardIdx + 1 });
    if (firstModuleIdx >= 0 && guardIdx >= firstModuleIdx) push('fail', 'guard_must_load_before_modules', { guardPosition: guardIdx + 1, firstModulePosition: firstModuleIdx + 1 });
  }

  if (!html.includes('<meta charset="UTF-8">')) push('fail', 'utf8_meta_missing');
}

function walk(dir, out=[]) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.js')) out.push(full);
  }
  return out;
}

const jsFiles = walk(path.join(root, 'app'));
for (const abs of jsFiles) {
  const rel = path.relative(root, abs).replace(/\\/g, '/');
  try {
    execFileSync('node', ['--check', abs], { stdio: 'pipe' });
  } catch (err) {
    push('fail', 'js_syntax_fail', { file: rel, error: String(err.stderr || err.message).slice(0, 800) });
  }
}
push('info', 'js_syntax_checked', { count: jsFiles.length });

const guardPath = 'app/core/production-copy-guard.js';
if (exists(guardPath)) {
  const guard = read(guardPath);
  const requiredTerms = [
    'WhatsApp enviado', 'WA enviado al shopper', 'Correo enviado a', 'HR sincronizada',
    'shopper notificado', 'Payload de prueba enviado', 'Disparo enviado',
    'cuestionario enviado', 'egreso(s) automáticos', 'Make activo', 'Google Sheets en vivo', 'portal en vivo'
  ];
  for (const term of requiredTerms) {
    if (!guard.includes(term)) push('warn', 'guard_missing_expected_term', { term });
  }
} else {
  push('fail', 'guard_file_missing', { file: guardPath });
}

const sourceResidueTerms = [
  'WhatsApp enviado', 'WA enviado', 'HR sincronizada', 'shopper notificado', 'Correo enviado a',
  'Payload de prueba enviado', 'Disparo enviado', 'eventos enviados', 'cuestionario enviado',
  'egreso(s) automáticos', 'se generan los egresos automáticamente', 'Liquidación corregida · sincronizada'
];
const residueHits = [];
for (const abs of jsFiles) {
  const rel = path.relative(root, abs).replace(/\\/g, '/');
  if (rel === 'app/core/production-copy-guard.js') continue;
  const text = fs.readFileSync(abs, 'utf8');
  const lines = text.split(/\r?\n/);
  lines.forEach((line, idx) => {
    for (const term of sourceResidueTerms) {
      if (line.includes(term)) residueHits.push({ file: rel, line: idx + 1, term, text: line.trim().slice(0, 180) });
    }
  });
}
if (residueHits.length) push('warn', 'source_residues_mitigated_by_guard_but_need_permanent_patch', { count: residueHits.length, hits: residueHits.slice(0, 50) });
else push('info', 'source_residue_scan_clean');

const academyPath = 'app/modules/academia.js';
if (exists(academyPath)) {
  const academy = read(academyPath);
  const ids = [...academy.matchAll(/id\s*:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const duplicates = [...new Set(ids.filter((id, idx) => ids.indexOf(id) !== idx))];
  if (duplicates.length) push('fail', 'academia_duplicate_ids', { duplicates });
  else push('info', 'academia_ids_unique', { ids: ids.length });
  for (const id of ['a_backend_prepared', 'a_ops_conflicts_route']) {
    if (!ids.includes(id)) push('fail', 'academy_required_course_missing', { id });
  }
}

const report = {
  gate: 'cxorbia-tya-phase-a-rc-smoke',
  generatedAt: new Date().toISOString(),
  safeState: {
    deploy: false,
    production: false,
    merge: false,
    providerCalls: false,
    databaseWrites: false,
    hrWrites: false
  },
  verdict: hardFails.length ? 'NO_GO' : 'GO_CONDICIONADO_RC_PHASE_A',
  hardFailCount: hardFails.length,
  warningCount: warnings.length,
  infoCount: info.length,
  hardFails,
  warnings,
  info
};

if (outDir) {
  const absOut = path.join(root, outDir);
  fs.mkdirSync(absOut, { recursive: true });
  fs.writeFileSync(path.join(absOut, 'phase-a-rc-smoke-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA Phase A RC smoke report',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Hard fails: ${hardFails.length}`,
    `Warnings: ${warnings.length}`,
    '',
    '## Hard fails',
    ...hardFails.map(x => `- ${x.message}${x.file ? ` · ${x.file}` : ''}`),
    '',
    '## Warnings',
    ...warnings.map(x => `- ${x.message}${x.count ? ` · count=${x.count}` : ''}`),
    '',
    '## Safe state',
    '- No deploy',
    '- No production',
    '- No provider calls',
    '- No database writes',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(absOut, 'phase-a-rc-smoke-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
