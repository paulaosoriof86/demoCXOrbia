#!/usr/bin/env node
/*
  CXOrbia TyA Phase A — R15G source-safe binding.

  Runs the existing R15F binding and then enforces the canonical context contract:
  - tenantId: tya
  - root projectId: cinepolis
  - active periodId: cinepolis-YYYY-MM
  - one period owns its 44 visits

  This is a backend connection-layer overlay. It does not modify app/modules,
  write providers, import data, deploy, pay, or enable production.
*/
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

await import('./tya-source-safe-binding-build-r15f.mjs');

const args = process.argv.slice(2);
const valueOf = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const appDir = path.resolve(valueOf('--app-dir', 'app'));
const adapterSrc = valueOf('--adapter-src', 'adapters/tya-phase-a-source-safe-dev-adapter.js');
const adapterFile = path.join(appDir, adapterSrc);
const outDir = path.resolve(valueOf('--out', '.tmp/source-safe-binding-r15g'));

const fail = message => {
  console.error(`R15G_BINDING_FAIL: ${message}`);
  process.exit(1);
};
if (!fs.existsSync(adapterFile)) fail(`Generated adapter missing: ${adapterFile}`);

let code = fs.readFileSync(adapterFile, 'utf8');
code = code.replace(
  "id:'tya', clientName:'TyA', name:'TyA', tagline:'Tenant TyA · Phase A controlada'",
  "id:'tya', tenantId:'tya', clientName:'TyA', name:'TyA', tagline:'Tenant TyA · Phase A controlada'"
);
code = code.replace(
  "  CX.data.currentProjectId = latest && latest.id;\n  CX.data.sourceMode = 'tya_hr_live_multitab_source_safe_dev';",
  "  CX.data.currentProjectId = 'cinepolis';\n  CX.data.currentPeriodId = latest && latest.id;\n  CX.data.sourceMode = 'tya_hr_live_multitab_source_safe_dev';"
);
code = code.replace(
  'currentPeriodId:CX.data.currentProjectId,',
  'currentPeriodId:CX.data.currentPeriodId,'
);
code = code.replace(
  "CX.dataSource.warnings = shoppers.length === 210 ? ['Gap shopper protegido: 210/213; 3 referencias continúan en revisión.'] : [];",
  "CX.dataSource.warnings = shoppers.length === 216 ? [] : ['Conteo shopper source-safe distinto al snapshot aprobado: ' + shoppers.length + '/216.'];"
);
code = code.replace(
  "tenantId:'tya', projectId:'cinepolis', projectName:'Cinépolis', sourceTitle:snapshot.source && snapshot.source.title,",
  "tenantId:'tya', projectId:'cinepolis', projectName:'Cinépolis', activePeriodId:latest && latest.id, sourceTitle:snapshot.source && snapshot.source.title,"
);

const required = [
  "tenantId:'tya', clientName:'TyA'",
  "CX.data.currentProjectId = 'cinepolis';",
  'CX.data.currentPeriodId = latest && latest.id;',
  'currentPeriodId:CX.data.currentPeriodId,',
  'shoppers.length === 216',
  'activePeriodId:latest && latest.id'
];
const missing = required.filter(token => !code.includes(token));
if (missing.length) fail(`Canonical context invariants missing: ${missing.join(', ')}`);
if (code.includes('CX.data.currentProjectId = latest && latest.id;')) {
  fail('Period identity still overwrites root project identity.');
}

fs.writeFileSync(adapterFile, code, 'utf8');
fs.mkdirSync(outDir, { recursive: true });
const report = {
  schemaVersion: '1.0.0',
  decision: 'PASS_R15G_CANONICAL_PROJECT_PERIOD_BINDING',
  adapterFile: path.relative(process.cwd(), adapterFile).replaceAll('\\', '/'),
  tenantId: 'tya',
  projectId: 'cinepolis',
  periodIdentity: 'cinepolis-YYYY-MM',
  expectedShoppers: 216,
  safeState: {
    writes: false,
    imports: false,
    deploy: false,
    production: false,
    providers: false,
    payments: false
  }
};
fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(JSON.stringify(report, null, 2));
