import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');
const args = process.argv.slice(2);
const outIndex = args.indexOf('--out');
const outDir = outIndex >= 0
  ? path.resolve(repo, args[outIndex + 1])
  : path.resolve(repo, '.tmp/period-history-integrity');

const readJson = relativePath => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));
const contract = readJson('backend/contracts/phase-a-period-history-integrity-v1.json');
const cfg = readJson('backend/config/phase-a-period-history-integrity-tya.source-safe.json');
const snapshot = readJson(cfg.ciSnapshotFile);
const periods = [...(snapshot.periods || [])].sort((a, b) => String(a.key).localeCompare(String(b.key)));
const blockers = [];
const unique = values => new Set(values).size === values.length;
const monthSerial = key => {
  const match = /^(\d{4})-(\d{2})$/.exec(String(key || ''));
  return match ? Number(match[1]) * 12 + Number(match[2]) - 1 : null;
};

if (snapshot.tenantId !== cfg.tenantId) blockers.push('tenant_mismatch');
if (snapshot.projectId !== cfg.projectId) blockers.push('project_mismatch');
if (!snapshot.sourceSafe || snapshot.imported || snapshot.production) blockers.push('unsafe_snapshot_state');
if ((snapshot.blockers || []).length) blockers.push('snapshot_has_blockers');
if (periods.length !== cfg.expected.periods) blockers.push(`period_count:${periods.length}/${cfg.expected.periods}`);
if (snapshot.counts?.visits !== cfg.expected.totalVisits) blockers.push(`visit_count:${snapshot.counts?.visits}/${cfg.expected.totalVisits}`);
if (periods[0]?.key !== cfg.expected.firstPeriod) blockers.push('first_period_mismatch');
if (periods.at(-1)?.key !== cfg.expected.lastPeriod) blockers.push('last_period_mismatch');
if (!unique(periods.map(period => period.key))) blockers.push('duplicate_period_key');
if (!unique(periods.map(period => period.id))) blockers.push('duplicate_period_id');

for (let index = 1; index < periods.length; index += 1) {
  if (monthSerial(periods[index].key) !== monthSerial(periods[index - 1].key) + 1) {
    blockers.push(`period_gap:${periods[index - 1].key}->${periods[index].key}`);
  }
}

for (const period of periods) {
  if (period.total !== cfg.expected.visitsPerPeriod) blockers.push(`period_total:${period.key}`);
  if (period.expected !== cfg.expected.visitsPerPeriod) blockers.push(`period_expected:${period.key}`);
  for (const [country, expected] of Object.entries(cfg.expected.countriesPerPeriod)) {
    if (Number(period[country] || 0) !== expected) blockers.push(`period_country:${period.key}:${country}`);
  }
  if (!Array.isArray(period.tabs) || period.tabs.length !== 2) blockers.push(`period_tabs:${period.key}`);
}

const active = periods.filter(period => period.state === 'activo');
const historical = periods.filter(period => period.state === 'cerrado');
if (active.length !== cfg.expected.activePeriods) blockers.push(`active_periods:${active.length}/${cfg.expected.activePeriods}`);
if (historical.length !== cfg.expected.historicalPeriods) blockers.push(`historical_periods:${historical.length}/${cfg.expected.historicalPeriods}`);
if (active[0]?.key !== cfg.expected.activePeriod) blockers.push(`active_period:${active[0]?.key || 'none'}`);
if (snapshot.activePeriodId !== active[0]?.id) blockers.push('active_period_id_mismatch');
if (snapshot.counts?.activeVisits !== cfg.expected.visitsPerPeriod) blockers.push('active_visit_count_mismatch');
if (snapshot.counts?.historicalVisits !== cfg.expected.totalVisits - cfg.expected.visitsPerPeriod) blockers.push('historical_visit_count_mismatch');

const result = {
  ok: blockers.length === 0,
  generatedAt: new Date().toISOString(),
  contractId: contract.contractId,
  runtimeSourceFile: cfg.runtimeSourceFile,
  ciSnapshotFile: cfg.ciSnapshotFile,
  payloadSha256: snapshot.payloadSha256,
  counts: snapshot.counts,
  activePeriodId: snapshot.activePeriodId,
  periods,
  warnings: snapshot.warnings,
  blockers,
  safeState: contract.safeState
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'phase-a-period-history-integrity-report.json'), JSON.stringify(result, null, 2) + '\n', 'utf8');
fs.writeFileSync(path.join(outDir, 'phase-a-period-history-integrity-report.md'), `# Phase A period/history integrity\n\nVerdict: **${result.ok ? 'PASS' : 'HOLD'}**\n\n- Periods: ${periods.length}\n- Visits: ${snapshot.counts?.visits || 0}\n- Historical: ${historical.length}\n- Active: ${active[0]?.key || 'none'}\n- Warnings: ${snapshot.warnings || 0}\n- Blockers: ${blockers.length}\n`, 'utf8');
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);
