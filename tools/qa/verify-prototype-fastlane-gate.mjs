#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const appDir = path.resolve(arg('--app', 'app'));
const outDir = path.resolve(arg('--out', '.tmp/prototype-fastlane-gate'));
const expectedBaseline = arg('--baseline', null);
const expectedCandidate = arg('--candidate', null);

function read(rel) {
  const file = path.join(appDir, rel);
  if (!fs.existsSync(file)) throw new Error(`Missing required file: ${rel}`);
  return fs.readFileSync(file, 'utf8');
}
function count(re, text) {
  return [...text.matchAll(re)].length;
}
function result(name, pass, evidence) {
  return { name, pass: Boolean(pass), evidence };
}

const data = read('core/data.js');
const router = read('core/router.js');
const midia = read('modules/midia.js');
const shoppers = read('modules/shoppers.js');
const dashboard = read('modules/dashboard.js');
const buildLock = read('core/build-lock.js');

const manifestRun = spawnSync(process.execPath, ['docs/verify-manifest.mjs'], {
  cwd: appDir,
  encoding: 'utf8'
});
const manifestOutput = `${manifestRun.stdout || ''}${manifestRun.stderr || ''}`.trim();

const setProgramDefinitions = count(/(?:^|[\n,]\s*)setProgram\s*\(/gm, data);
const projectBody = (data.match(/(?:^|[\n,]\s*)project\s*\(\)\s*\{([^}]*)\}/m) || [])[1] || '';
const periodBody = (data.match(/(?:^|[\n,]\s*)period\s*\(\)\s*\{([^}]*)\}/m) || [])[1] || '';
const currentProjectStorage = /(?:^|[\n,]\s*)currentProjectId\s*:\s*/m.test(data);
const currentPeriodStorage = /(?:^|[\n,]\s*)currentPeriodId\s*:\s*/m.test(data);
const currentProjectAccessor = /\bget\s+currentProjectId\s*\(/.test(data);

const checks = [
  result('manifest_literal_node_pass', manifestRun.status === 0, {
    exitCode: manifestRun.status,
    tail: manifestOutput.split('\n').slice(-12)
  }),
  result('single_setProgram_definition', setProgramDefinitions === 1, { count: setProgramDefinitions }),
  result('project_and_period_have_independent_storage', currentProjectStorage && currentPeriodStorage && !currentProjectAccessor, {
    currentProjectStorage,
    currentPeriodStorage,
    currentProjectAccessor
  }),
  result('project_and_period_accessors_are_not_aliases',
    Boolean(projectBody && periodBody && projectBody.trim() !== periodBody.trim() && !/return\s+this\.project\s*\(/.test(periodBody)),
    { projectBody: projectBody.trim(), periodBody: periodBody.trim() }
  ),
  result('period_selector_uses_validating_setter',
    /periodSel[\s\S]{0,600}setCurrentPeriod\s*\(/.test(router) &&
    !/periodSel[\s\S]{0,600}setProject\s*\(/.test(router),
    { expected: 'periodSel -> setCurrentPeriod() only' }
  ),
  result('project_selector_uses_project_setter',
    /projSel[\s\S]{0,600}(?:setCurrentProject|setProgram)\s*\(/.test(router),
    { expected: 'projSel -> setCurrentProject()/setProgram()' }
  ),
  result('midia_defaults_to_active_period',
    /_cgProj\s*===\s*['"]ALL['"]\s*\?[\s\S]{0,250}:\s*data\.visitas\s*\(\)/.test(midia) &&
    /Todos los periodos/.test(midia),
    { expected: 'active period default; ALL explicit' }
  ),
  result('rankings_use_authorized_numeric_rating',
    /rankableShoppers/.test(data) &&
    /Number\.isFinite\s*\(\s*s\.rating\s*\)/.test(data) &&
    /rankableShoppers/.test(dashboard),
    { expected: 'protected/no-rating excluded' }
  ),
  result('scoring_card_is_rating_gated',
    /Number\.isFinite\s*\(\s*s\.rating\s*\)/.test(shoppers),
    { expected: 'no active scoring model without numeric source rating' }
  ),
  result('candidate_build_lock_matches_argument',
    !expectedCandidate || buildLock.includes(expectedCandidate),
    { expectedCandidate }
  ),
  result('candidate_declares_previous_baseline',
    !expectedBaseline || buildLock.includes(expectedBaseline),
    { expectedBaseline }
  )
];

const failures = checks.filter(c => !c.pass);
const report = {
  schemaVersion: '1.0.0',
  decision: failures.length ? 'FAIL_PROTOTYPE_FASTLANE_GATE' : 'PASS_PROTOTYPE_FASTLANE_GATE',
  appDir,
  expectedBaseline,
  expectedCandidate,
  checks,
  failures: failures.map(f => f.name),
  acceptanceRule: 'A candidate cannot become baseline/source lock and cannot be empalmed when this gate fails.'
};
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'prototype-fastlane-gate.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
fs.writeFileSync(path.join(outDir, 'prototype-fastlane-gate.md'), [
  '# Prototype fast-lane gate',
  '',
  `Decision: **${report.decision}**`,
  `Failures: ${report.failures.join(', ') || 'none'}`,
  '',
  ...checks.map(c => `- ${c.pass ? 'PASS' : 'FAIL'} — ${c.name}`)
].join('\n') + '\n', 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 4 : 0;
