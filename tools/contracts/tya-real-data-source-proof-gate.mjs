#!/usr/bin/env node
/* CXOrbia TyA - Real data source proof gate
   Safe validator. No provider calls, no database writes, no deploy.

   Purpose: prevent Phase A production claims when the running data layer is still
   generic/demo/mock and not proven against real TyA HR data.
*/

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;

function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function countNeedles(text, needles) { return needles.filter((needle) => text.includes(needle)); }

const hardFails = [];
const warnings = [];
const info = [];
function add(list, message, extra = {}) { list.push({ message, ...extra }); }

const dataPath = 'app/core/data.js';
const hrPath = 'app/core/hr.js';

if (!exists(dataPath)) add(hardFails, 'data_layer_missing', { file: dataPath });
if (!exists(hrPath)) add(warnings, 'hr_engine_missing', { file: hrPath });

if (exists(dataPath)) {
  const data = read(dataPath);
  const demoMarkers = countNeedles(data, [
    'Mock data layer',
    'GENÉRICO',
    'sin marcas, proyectos ni personas reales',
    'Proyecto Retail',
    'Cliente Retail (demo)',
    'Proyecto Banca',
    'Cliente Banca (demo)',
    'Proyecto Restaurantes',
    'Evaluador ',
    '@demo.cxorbia',
    'forms.example.com'
  ]);
  if (demoMarkers.length) {
    add(hardFails, 'data_layer_is_demo_generic_not_real_tya', { file: dataPath, markers: demoMarkers });
  } else {
    add(info, 'data_layer_has_no_known_demo_markers', { file: dataPath });
  }

  const realMarkers = countNeedles(data, [
    'Cinepolis',
    'Cinépolis',
    'TyA',
    'JUN26',
    'JUN 26 GT',
    'JUN 26 HN',
    'shopperId',
    'hrRowId'
  ]);
  if (!realMarkers.includes('Cinepolis') && !realMarkers.includes('Cinépolis')) {
    add(hardFails, 'cinepolis_project_not_proven_in_data_layer', { file: dataPath, markers: realMarkers });
  }
  if (!realMarkers.includes('hrRowId')) {
    add(warnings, 'hr_row_id_not_visible_in_data_layer', { file: dataPath });
  }
}

if (exists(hrPath)) {
  const hr = read(hrPath);
  const simMarkers = countNeedles(hr, [
    'simula',
    'simulada',
    'HR externa simulada',
    'alta en HR',
    'Asignado en la hoja',
    'HR-D1',
    'HR-D2'
  ]);
  if (simMarkers.length) {
    add(hardFails, 'hr_engine_is_simulated_not_real_source', { file: hrPath, markers: simMarkers });
  }
  const safeMarkers = countNeedles(hr, [
    'SIN DUPLICAR',
    'match por extId/visitId',
    'extId',
    'writeBack'
  ]);
  if (safeMarkers.length) add(info, 'hr_engine_has_useful_sync_patterns_but_not_real_source', { file: hrPath, markers: safeMarkers });
}

const report = {
  gate: 'cxorbia-tya-real-data-source-proof',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_REAL_DATA_NOT_PROVEN' : 'GO_REAL_DATA_SOURCE_PROVEN',
  hardFailCount: hardFails.length,
  warningCount: warnings.length,
  productionDecision: hardFails.length ? 'BLOCK_PRODUCTION_CUTOVER' : 'ALLOW_NEXT_SMOKE_WITH_REAL_DATA',
  requiredBeforeProduction: [
    'real TyA HR source lock or sanitized export available',
    'Cinepolis project proven by stable projectId',
    'periods/quincenas/countries/currencies proven from source',
    'visits proven from HR rows with hrRowId/visitId mapping',
    'historical shoppers proven or mapped without raw sensitive data',
    'already-presented certifications mapped',
    'June liquidations/payment status represented',
    'human visual smoke on verified deployment URL'
  ],
  safeState: {
    deploy: false,
    production: false,
    providerCalls: false,
    databaseWrites: false,
    imports: false,
    oldDatabaseConnected: false
  },
  hardFails,
  warnings,
  info
};

if (outDir) {
  const abs = path.join(root, outDir);
  fs.mkdirSync(abs, { recursive: true });
  fs.writeFileSync(path.join(abs, 'real-data-source-proof-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA real data source proof report',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Production decision: ${report.productionDecision}`,
    `Hard fails: ${hardFails.length}`,
    `Warnings: ${warnings.length}`,
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.file ? ` · ${x.file}` : ''}`) : ['- none']),
    '',
    '## Warnings',
    ...(warnings.length ? warnings.map(x => `- ${x.message}${x.file ? ` · ${x.file}` : ''}`) : ['- none']),
    '',
    '## Required before production',
    ...report.requiredBeforeProduction.map(x => `- ${x}`),
    '',
    '## Safe state',
    '- No deploy',
    '- No production',
    '- No provider calls',
    '- No database writes',
    '- No imports',
    '- No old database connected',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(abs, 'real-data-source-proof-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
