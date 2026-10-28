import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const DESCRIPTOR = 'CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json';
const POINTER = 'CXORBIA_RECOVERY_EXECUTION_CURRENT.json';
const FREEZE = 'CXORBIA_I3_PLAN_CHOQUE_CIERRE_MONOTONICO_FROZEN_2026-10-28.md';
const EXPECTED_BRANCH = 'recovery/cxorbia-phase-a-20260831';

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

export function classifyModules(matrix) {
  const modules = Array.isArray(matrix?.modules) ? matrix.modules : [];
  const counts = {};
  for (const m of modules) {
    const key = String(m.classification || 'UNCLASSIFIED');
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}

export function validateShockContinuity({descriptor: d, pointer: p, matrix: m, gitBlob, freezePath = FREEZE}) {
  const failures = [];
  const check = (condition, code) => { if (!condition) failures.push(code); };
  const matrixPath = String(d.moduleTruthPath || '');
  const actualCounts = classifyModules(m);
  const uniqueDomains = new Set((Array.isArray(m.modules) ? m.modules : []).map(x => x.domain));
  const freezeD = d.activeShockControl || {};
  const freezeP = p.activeShockControl || {};

  check(d.branch === EXPECTED_BRANCH, 'MAPPING_FAILURE:BRANCH');
  check(d.productSourceSha === p.productSourceSha && d.productSourceSha === m?.productSource?.sha,
    'RELEASE_COMPOSITION_FAILURE:SOURCE_POINTER_DESYNC');
  check(Boolean(matrixPath) && p.moduleTruthAuthority?.path === matrixPath,
    'MAPPING_FAILURE:MATRIX_PATH_DESYNC');
  check(Boolean(d.moduleTruthExpectedGitBlob) &&
    p.moduleTruthAuthority?.gitBlob === d.moduleTruthExpectedGitBlob &&
    gitBlob(matrixPath) === d.moduleTruthExpectedGitBlob,
    'MAPPING_FAILURE:MATRIX_BLOB_DESYNC');
  check(Array.isArray(m.modules) && m.modules.length === 21 && uniqueDomains.size === 21,
    'RELEASE_COMPOSITION_FAILURE:DOMAIN_COVERAGE');

  const snapshot = p.activeShockModuleTruth || {};
  check(snapshot.sourceSha === d.productSourceSha && snapshot.matrixPath === matrixPath &&
    snapshot.matrixBlob === d.moduleTruthExpectedGitBlob,
    'MAPPING_FAILURE:CLASSIFICATION_SNAPSHOT_AUTHORITY');
  check(JSON.stringify(snapshot.classificationCounts || {}) === JSON.stringify(actualCounts),
    'MAPPING_FAILURE:CLASSIFICATION_COUNTS_STALE');

  check(freezeD.path === freezePath && freezeP.path === freezePath &&
    Boolean(freezeD.gitBlob) && freezeD.gitBlob === freezeP.gitBlob &&
    gitBlob(freezePath) === freezeD.gitBlob,
    'MAPPING_FAILURE:FROZEN_PRIORITY_BLOB_DESYNC');
  check(freezeD.id === 'CXORBIA-I3-SHOCK-MONOTONIC-CLOSURE-20261028' &&
    freezeD.id === freezeP.id, 'MAPPING_FAILURE:PRIORITY_ID_DESYNC');
  check(Boolean(d.exactNextAction) && d.exactNextAction === p.nextExactAction,
    'MAPPING_FAILURE:NEXT_ACTION_DESYNC');
  check(/G03/.test(d.exactNextAction || '') && /HR/.test(d.exactNextAction || '') &&
    /finanzas/i.test(d.exactNextAction || ''),
    'MAPPING_FAILURE:EXCLUSIVE_FOCAL_LOOP');
  check(p.progressByStageSemantics === 'HISTORICAL_SNAPSHOTS_NOT_RELEASE_AUTHORITY',
    'MAPPING_FAILURE:STALE_PROGRESS_AS_LIVE');
  check(p.state === 'HOLD' && d.production === 'DO_NOT_TOUCH' && p.production === 'DO_NOT_TOUCH' &&
    p.authorizationI4 !== true && d.terminalCertificationAllowed === false,
    'RELEASE_COMPOSITION_FAILURE:PREMATURE_PRODUCTION');

  return {pass: failures.length === 0, failures, matrixPath, sourceSha: d.productSourceSha,
    classificationCounts: actualCounts, domainCount: m.modules?.length || 0,
    status: 'CONTROL_CONTINUITY_ONLY_NOT_I3_CERTIFICATION'};
}

function main() {
  const d = readJson(DESCRIPTOR);
  const p = readJson(POINTER);
  const m = readJson(d.moduleTruthPath);
  const gitBlob = (file) => {
    try { return execFileSync('git', ['rev-parse', `HEAD:${file}`], {encoding: 'utf8'}).trim(); }
    catch { return ''; }
  };
  const result = validateShockContinuity({descriptor: d, pointer: p, matrix: m, gitBlob});
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  if (!result.pass) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
