import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { resolveLiveMonthTabs } from './tya-resolve-live-month-tabs.mjs';

const titles = (...names) => names.map((title, index) => ({ title, index }));

test('octubre se conserva y noviembre sin año abre 2026 GT/HN desde metadatos vivos', () => {
  const result = resolveLiveMonthTabs(titles('OCTUBRE 26', 'OCTUBRE 26 HN', 'NOVIEMBRE', 'NOVIEMBRE HN', 'DASHBOARD'));
  assert.deepEqual(result.map(tab => [tab.key, tab.country, tab.tabTitle]), [
    ['2026-10', 'GT', 'OCTUBRE 26'], ['2026-10', 'HN', 'OCTUBRE 26 HN'],
    ['2026-11', 'GT', 'NOVIEMBRE'], ['2026-11', 'HN', 'NOVIEMBRE HN']
  ]);
  assert.equal(result[2].yearResolution, 'adjacent_provider_tab');
});

test('histórico de noviembre 2025 no se confunde con noviembre 2026', () => {
  const result = resolveLiveMonthTabs(titles('NOVIEMBRE 25', 'NOVIEMBRE 25 HN', 'DICIEMBRE 25', 'DICIEMBRE 25 HN', 'ENERO 26', 'OCTUBRE 26', 'OCTUBRE 26 HN', 'NOVIEMBRE', 'NOVIEMBRE HN'));
  assert.equal(result.filter(tab => tab.key === '2025-11').length, 2);
  assert.equal(result.filter(tab => tab.key === '2026-11').length, 2);
});

test('un diciembre sin año seguido de enero sin año reconoce el cambio anual', () => {
  const result = resolveLiveMonthTabs(titles('DICIEMBRE 26', 'DICIEMBRE 26 HN', 'ENERO', 'ENERO HN'));
  assert.equal(result[2].key, '2027-01');
  assert.equal(result[3].key, '2027-01');
});

test('el orden real del provider prevalece sobre el orden del array', () => {
  const result = resolveLiveMonthTabs([
    { title: 'NOVIEMBRE HN', index: 3 },
    { title: 'OCTUBRE 26 HN', index: 1 },
    { title: 'NOVIEMBRE', index: 2 },
    { title: 'OCTUBRE 26', index: 0 }
  ]);
  assert.deepEqual(result.map(tab => tab.key), ['2026-10', '2026-10', '2026-11', '2026-11']);
});

test('un año no se adivina cuando falta un mes anterior con año explícito', () => {
  assert.throws(() => resolveLiveMonthTabs(titles('NOVIEMBRE', 'NOVIEMBRE HN')), /HR_MONTH_YEAR_UNRESOLVED/);
});

test('saltos ambiguos de meses sin año son fail closed', () => {
  assert.throws(() => resolveLiveMonthTabs(titles('JULIO 26', 'NOVIEMBRE')), /HR_MONTH_YEAR_AMBIGUOUS/);
});

test('nombres alternativos del mismo mes y país no duplican visitas', () => {
  assert.throws(() => resolveLiveMonthTabs(titles('OCTUBRE 26', 'NOVIEMBRE', 'NOVIEMBRE 26')), /HR_MONTH_DUPLICATE/);
});

test('el nombre físico de la pestaña permanece exacto y las pestañas no mensuales se excluyen', () => {
  const result = resolveLiveMonthTabs(titles('SETIEMBRE 26', 'SEPTIEMBRE 26 HN', 'DASHBOARD HN', 'OCTUBRE 26'));
  assert.deepEqual(result.map(tab => tab.tabTitle), ['SETIEMBRE 26', 'SEPTIEMBRE 26 HN', 'OCTUBRE 26']);
  assert.equal(result[0].month, 9);
});

test('registro HR en DEV acepta pestañas noviembre sin año y conserva octubre', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'cxorbia-hr-tab-test-'));
  try {
    const sourceFile = path.join(temp, 'source.js');
    const registryFile = path.join(temp, 'registry.json');
    const evidenceFile = path.join(temp, 'evidence.json');
    const visits = [
      { sourceTab: 'OCTUBRE 26', periodKey: '2026-10', country: 'GT' },
      { sourceTab: 'OCTUBRE 26 HN', periodKey: '2026-10', country: 'HN' },
      { sourceTab: 'NOVIEMBRE', periodKey: '2026-11', country: 'GT' },
      { sourceTab: 'NOVIEMBRE HN', periodKey: '2026-11', country: 'HN' }
    ];
    const source = {
      sourceSafe: true,
      generatedAt: '2026-11-03T00:00:00.000Z',
      source: { accessMode: 'sheets_api_service_account', title: 'HR Guatemala - Sincronizacion Google Sheets' },
      tabsRead: [
        { title: 'OCTUBRE 26', country: 'GT', periodKey: '2026-10' },
        { title: 'OCTUBRE 26 HN', country: 'HN', periodKey: '2026-10' },
        { title: 'NOVIEMBRE', country: 'GT', periodKey: '2026-11' },
        { title: 'NOVIEMBRE HN', country: 'HN', periodKey: '2026-11' }
      ],
      visits,
      periods: [{ key: '2026-10' }, { key: '2026-11' }],
      shoppers: [],
      counts: {}
    };
    fs.writeFileSync(sourceFile, `window.CX_TYA_HR_SOURCE_SAFE = ${JSON.stringify(source)};\n`);
    execFileSync(process.execPath, ['tools/hr-source/tya-enforce-live-tab-registry.mjs'], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        CXORBIA_HR_SOURCE_SAFE_OUT: sourceFile,
        CXORBIA_HR_TAB_REGISTRY: registryFile,
        CXORBIA_HR_TAB_REGISTRY_EVIDENCE: evidenceFile,
        CXORBIA_EXPECTED_CURRENT_PERIOD: '2026-11'
      }
    });
    const registry = JSON.parse(fs.readFileSync(registryFile, 'utf8'));
    const evidence = JSON.parse(fs.readFileSync(evidenceFile, 'utf8'));
    assert.equal(registry.requiredCurrentPeriodTabsPresent, true);
    assert.deepEqual(registry.requiredCurrentPeriodTabs, ['NOVIEMBRE', 'NOVIEMBRE HN']);
    assert.equal(evidence.after.visits, 4);
    assert.equal(evidence.after.periods, 2);
    assert.deepEqual(evidence.phantomTabsRejected, []);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test('Cloud Run usa token de metadatos para lectura independiente de Sheets sin secret adicional', () => {
  const result = execFileSync(process.execPath, ['tools/hr-source/tya-build-live-hr-source-safe-r20.mjs', '--provider-auth-self-test'], { cwd: process.cwd(), encoding: 'utf8' });
  const report = JSON.parse(result);
  assert.equal(report.decision, 'PASS_R20_CLOUD_RUN_METADATA_READ_ONLY_AUTH');
  assert.equal(report.negativeRejected, true);
  assert.equal(report.hrWrites, 0);
});

test('si el proveedor ya tiene noviembre, un fallback que solo ve octubre se rechaza', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'cxorbia-hr-nov-failclosed-'));
  try {
    const sourceFile = path.join(temp, 'source.js');
    const registryFile = path.join(temp, 'registry.json');
    const evidenceFile = path.join(temp, 'evidence.json');
    const source = {
      sourceSafe: true,
      source: { accessMode: 'public_gviz_csv_cache_busted' },
      tabsRead: [ { title: 'OCTUBRE 26', country: 'GT', periodKey: '2026-10' } ],
      visits: [ { sourceTab: 'OCTUBRE 26', periodKey: '2026-10', country: 'GT' } ],
      periods: [ { key: '2026-10' } ], shoppers: [], counts: {}
    };
    const registry = {
      schemaVersion: 'cxorbia.tya-live-hr-tab-registry.v1', sourceSafe: true,
      autoDiscovery: true, providerMetadataReadOnly: true,
      registryMode: 'live_provider_metadata_auto_refresh',
      currentCalendarPeriodKey: '2026-11',
      requiredCurrentPeriodTabsPresent: true,
      requiredCurrentPeriodTabs: ['NOVIEMBRE', 'NOVIEMBRE HN'],
      monthlyTabs: ['OCTUBRE 26', 'NOVIEMBRE', 'NOVIEMBRE HN']
    };
    fs.writeFileSync(sourceFile, `window.CX_TYA_HR_SOURCE_SAFE = ${JSON.stringify(source)};\n`);
    fs.writeFileSync(registryFile, JSON.stringify(registry));
    assert.throws(() => execFileSync(process.execPath, ['tools/hr-source/tya-enforce-live-tab-registry.mjs'], {
      cwd: process.cwd(), stdio: 'pipe',
      env: { ...process.env, CXORBIA_HR_SOURCE_SAFE_OUT: sourceFile,
        CXORBIA_HR_TAB_REGISTRY: registryFile,
        CXORBIA_HR_TAB_REGISTRY_EVIDENCE: evidenceFile,
        CXORBIA_EXPECTED_CURRENT_PERIOD: '2026-11' }
    }), error => String(error.stderr).includes('CURRENT_PERIOD_HR_TAB_MAPPING_INCOMPLETE:NOVIEMBRE,NOVIEMBRE HN'));
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});
