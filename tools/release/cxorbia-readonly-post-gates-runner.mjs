#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import process from 'node:process';
import { spawn, spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const REQUEST_PATH = process.argv[2] || '.github/cxorbia-gate-requests/request.json';
const CONTRACT_PATH = 'backend/contracts/cxorbia-controlled-runners-v1.json';
const REPORT_DIR = path.join(ROOT, '.tmp/cxorbia-readonly-post-gates-runner');
const REPORT_JSON = path.join(REPORT_DIR, 'report.json');
const REPORT_MD = path.join(REPORT_DIR, 'report.md');
const PROFILE_ALIASES = {
  'v174-r20-m1-corte2a': 'V174_R20_M1_CORTE2A',
  'corte3-financial-reconciliation-r20': 'CORTE3_FINANCIAL_RECONCILIATION_R20',
  'corte3-canonical-finance-ui-export-r23': 'CORTE3_CANONICAL_FINANCE_UI_EXPORT_R23'
};
const EXPECTED_SAFE_STATE = {
  repositoryWrites: false,
  dataWrites: false,
  deploy: false,
  merge: false,
  production: false,
  imports: false,
  payments: false,
  make: false,
  gemini: false,
  firestoreWrites: false,
  authWrites: false,
  storageWrites: false,
  hrWrites: false
};

const report = {
  schemaVersion: '1.3.0',
  runner: 'CXORBIA_READONLY_POST_GATES_RUNNER',
  generatedAt: new Date().toISOString(),
  status: 'HOLD_NOT_RUN',
  repository: process.env.GITHUB_REPOSITORY || null,
  branch: process.env.GITHUB_REF_NAME || null,
  requestPath: REQUEST_PATH,
  requestId: null,
  requestCommitSha: null,
  targetHeadSha: null,
  profile: null,
  profileDefinition: null,
  stableVisitIdentity: null,
  checks: [],
  blockers: [],
  commands: [],
  artifacts: [],
  summary: null,
  safeState: { ...EXPECTED_SAFE_STATE }
};

function saveReport() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_JSON, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  const lines = [
    '# CXOrbia read-only post-gates runner',
    '',
    `- Status: \`${report.status}\``,
    `- Request: \`${report.requestId || 'n/a'}\``,
    `- Profile: \`${report.profile || 'n/a'}\``,
    `- Request commit: \`${report.requestCommitSha || 'n/a'}\``,
    `- Target HEAD: \`${report.targetHeadSha || 'n/a'}\``,
    `- Browser required: \`${report.profileDefinition?.browserRequired === true}\``,
    `- Stable visit identity: \`${report.stableVisitIdentity?.version || 'n/a'}\``,
    '',
    '## Summary',
    '',
    '```json',
    JSON.stringify(report.summary, null, 2),
    '```',
    '',
    '## Blockers',
    '',
    ...(report.blockers.length ? report.blockers.map(item => `- ${item}`) : ['- none']),
    '',
    '## Checks',
    '',
    ...(report.checks.length ? report.checks.map(item => `- ${item}`) : ['- none']),
    '',
    '## Commands',
    '',
    ...(report.commands.length ? report.commands.map(item => `- \`${item}\``) : ['- none'])
  ];
  fs.writeFileSync(REPORT_MD, `${lines.join('\n')}\n`, 'utf8');
}

function hold(code, detail = '') {
  const value = detail ? `${code}:${detail}` : code;
  report.blockers.push(value);
  throw new Error(value);
}

function check(condition, code, detail = '') {
  if (!condition) hold(code, detail);
  report.checks.push(detail ? `${code}:${detail}` : code);
}

function readJson(relative) {
  const absolute = path.join(ROOT, relative);
  if (!fs.existsSync(absolute)) hold('required_file_missing', relative);
  try {
    return JSON.parse(fs.readFileSync(absolute, 'utf8'));
  } catch (error) {
    hold('invalid_json', `${relative}:${error.message}`);
  }
}

function run(command, args, options = {}) {
  report.commands.push([command, ...args].join(' '));
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...process.env, ...(options.env || {}) },
    maxBuffer: 60 * 1024 * 1024
  });
  if (result.status !== 0) {
    hold('command_failed', `${command} ${args.join(' ')} :: ${(result.stderr || result.stdout || '').slice(0, 2400)}`);
  }
  return String(result.stdout || '').trim();
}

function normalizeProfile(value) {
  const raw = String(value || '').trim();
  return PROFILE_ALIASES[raw] || raw;
}

function ensureNodeFile(relative) {
  const absolute = path.join(ROOT, relative);
  check(fs.existsSync(absolute), 'script_present', relative);
  run('node', ['--check', relative]);
}

function waitForPort(host, port, timeoutMs = 15000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const socket = net.connect({ host, port });
      socket.once('connect', () => {
        socket.end();
        resolve();
      });
      socket.once('error', () => {
        socket.destroy();
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`server_not_ready:${host}:${port}`));
          return;
        }
        setTimeout(attempt, 200);
      });
    };
    attempt();
  });
}

function readOptionalJson(relative) {
  const absolute = path.join(ROOT, relative);
  return fs.existsSync(absolute) ? JSON.parse(fs.readFileSync(absolute, 'utf8')) : null;
}

async function executeProfile(profile, definition) {
  const evidenceFiles = [];
  let summary = null;

  if (profile === 'V174_R20_M1_CORTE2A') {
    const scripts = [
      'tools/hr-source/tya-build-live-hr-source-safe-r20-inventory.mjs',
      'tools/hr-source/tya-filter-source-safe-to-inventory-r20.mjs',
      'tools/hr-source/tya-stabilize-source-safe-visit-ids-r20.mjs',
      'tools/qa/tya-stable-visit-id-r20-gate.mjs',
      'tools/qa/tya-source-safe-stable-visit-payload-r20-gate.mjs',
      'tools/qa/tya-hr-header-variants-r20-gate.mjs',
      'tools/qa/tya-live-hr-inplace-r22-gate.mjs',
      'tools/qa/tya-corte1-context-history-reports-gate.mjs',
      'tools/qa/tya-corte1-reports-frontend-runtime-gate.mjs',
      'tools/qa/tya-corte2a-shopper-cycle-r20-gate.mjs',
      'tools/qa/tya-v174-r20-m1-corte2a-lock-gate.mjs',
      'tools/release/tya-source-safe-binding-build-r15g.mjs',
      'tools/qa/tya-project-period-kpi-history-gate-r20.mjs',
      'tools/release/tya-v174-r20-source-lock-proposal.mjs',
      'tools/release/tya-v174-corte2a-empalme-directo-verify.mjs'
    ];
    scripts.forEach(ensureNodeFile);
    run('node', ['tools/hr-source/tya-build-live-hr-source-safe-r20-inventory.mjs', '--allow-https', '--out', '.tmp/tya-r20-profile']);
    run('node', ['tools/hr-source/tya-filter-source-safe-to-inventory-r20.mjs', '--in', '.tmp/tya-r20-profile/tya-hr-source-safe-periods.js', '--out', '.tmp/tya-r20-runtime-inventory-filter', '--copy', 'app/data/tya-hr-source-safe-periods.js']);
    run('node', ['tools/hr-source/tya-stabilize-source-safe-visit-ids-r20.mjs', '--in', 'app/data/tya-hr-source-safe-periods.js', '--out', '.tmp/tya-r20-stable-visit-id']);
    run('node', ['tools/qa/tya-stable-visit-id-r20-gate.mjs', '--payload', 'app/data/tya-hr-source-safe-periods.js', '--out', '.tmp/tya-r20-stable-visit-id-gate']);
    run('node', ['tools/qa/tya-source-safe-stable-visit-payload-r20-gate.mjs', '--payload', 'app/data/tya-hr-source-safe-periods.js', '--out', '.tmp/tya-r20-stable-payload-gate']);
    run('node', ['tools/qa/tya-hr-header-variants-r20-gate.mjs']);
    run('node', ['tools/qa/tya-live-hr-inplace-r22-gate.mjs', '--payload', 'app/data/tya-hr-source-safe-periods.js', '--meta', '.tmp/tya-r20-runtime-inventory-filter/tya-hr-source-safe-periods.meta.json', '--out', '.tmp/tya-r20-live-hr-inplace']);
    run('node', ['tools/qa/tya-corte1-context-history-reports-gate.mjs']);
    run('node', ['tools/qa/tya-corte1-reports-frontend-runtime-gate.mjs']);
    run('node', ['tools/qa/tya-corte2a-shopper-cycle-r20-gate.mjs']);
    run('node', ['tools/qa/tya-v174-r20-m1-corte2a-lock-gate.mjs']);
    run('node', ['tools/release/tya-source-safe-binding-build-r15g.mjs', '--source', 'app/data/tya-hr-source-safe-periods.js', '--out', '.tmp/tya-r20-build']);

    const server = spawn('python3', ['-m', 'http.server', '4173', '--directory', '.tmp/tya-r20-build'], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true
    });
    try {
      await waitForPort('127.0.0.1', 4173);
      run('node', ['tools/qa/tya-project-period-kpi-history-gate-r20.mjs', '--base-url', 'http://127.0.0.1:4173/index.html?cxTyaPhaseA=1&r18d=visible']);
    } finally {
      try { process.kill(-server.pid, 'SIGTERM'); } catch {}
    }

    run('node', ['tools/release/tya-v174-r20-source-lock-proposal.mjs', '--build', '.tmp/tya-r20-build', '--out', '.tmp/tya-r20-source-lock-proposal']);
    const sourceLockStageDir = '.tmp/tya-r20-source-lock-verify';
    fs.mkdirSync(path.join(ROOT, sourceLockStageDir), { recursive: true });
    const canonicalBuildLock = path.join(ROOT, 'app/core/build-lock.js');
    const canonicalManifest = path.join(ROOT, 'app/docs/MANIFEST-V174-CORTE2A-EMPALME-DIRECTO-20260722.json');
    const backupBuildLock = fs.readFileSync(canonicalBuildLock);
    const backupManifest = fs.readFileSync(canonicalManifest);
    try {
      fs.copyFileSync(path.join(ROOT, '.tmp/tya-r20-source-lock-proposal/build-lock.js'), canonicalBuildLock);
      fs.copyFileSync(path.join(ROOT, '.tmp/tya-r20-source-lock-proposal/MANIFEST-V174-CORTE2A-EMPALME-DIRECTO-20260722.json'), canonicalManifest);
      run('node', ['tools/release/tya-v174-corte2a-empalme-directo-verify.mjs', '--dir', '.tmp/tya-r20-build', '--out', sourceLockStageDir]);
    } finally {
      fs.writeFileSync(canonicalBuildLock, backupBuildLock);
      fs.writeFileSync(canonicalManifest, backupManifest);
    }

    evidenceFiles.push(
      '.tmp/tya-r20-profile/summary.json',
      '.tmp/tya-r20-runtime-inventory-filter/tya-hr-source-safe-periods.meta.json',
      '.tmp/tya-r20-stable-visit-id/summary.json',
      '.tmp/tya-r20-stable-visit-id-gate/report.json',
      '.tmp/tya-r20-stable-payload-gate/report.json',
      '.tmp/tya-r20-live-hr-inplace/report.json',
      '.tmp/tya-r20-source-lock-proposal/summary.json',
      `${sourceLockStageDir}/report.json`
    );
    summary = {
      status: 'PASS_READONLY_POST_GATES',
      profile,
      browserExecuted: true,
      buildDirectory: '.tmp/tya-r20-build',
      sourceLockProposalDirectory: '.tmp/tya-r20-source-lock-proposal',
      sourceLockVerificationDirectory: sourceLockStageDir,
      stableVisitIdentityVersion: report.stableVisitIdentity?.version || null,
      sourceLockProposalReady: true,
      sourceLockAppliedToBranch: false,
      providerWrites: false,
      dataWrites: false
    };
  } else if (profile === 'CORTE3_FINANCIAL_RECONCILIATION_R20') {
    const scripts = [
      'tools/hr-source/tya-build-live-hr-source-safe-r20-inventory.mjs',
      'tools/hr-source/tya-filter-source-safe-to-inventory-r20.mjs',
      'tools/hr-source/tya-stabilize-source-safe-visit-ids-r20.mjs',
      'tools/qa/tya-stable-visit-id-r20-gate.mjs',
      'tools/qa/tya-source-safe-stable-visit-payload-r20-gate.mjs',
      'tools/migration/tya-reconcile-financial-live-hr-r14c.mjs',
      'tools/qa/tya-corte3-financial-reconciliation-r20-gate.mjs'
    ];
    scripts.forEach(ensureNodeFile);
    run('node', ['tools/hr-source/tya-build-live-hr-source-safe-r20-inventory.mjs', '--allow-https', '--out', '.tmp/tya-corte3-r20-profile']);
    run('node', ['tools/hr-source/tya-filter-source-safe-to-inventory-r20.mjs', '--in', '.tmp/tya-corte3-r20-profile/tya-hr-source-safe-periods.js', '--out', '.tmp/tya-corte3-runtime-inventory-filter-r20', '--copy', 'app/data/tya-hr-source-safe-periods.js']);
    run('node', ['tools/hr-source/tya-stabilize-source-safe-visit-ids-r20.mjs', '--in', 'app/data/tya-hr-source-safe-periods.js', '--out', '.tmp/tya-corte3-stable-visit-id-r20']);
    run('node', ['tools/qa/tya-stable-visit-id-r20-gate.mjs', '--payload', 'app/data/tya-hr-source-safe-periods.js', '--out', '.tmp/tya-corte3-stable-visit-id-gate-r20']);
    run('node', ['tools/qa/tya-source-safe-stable-visit-payload-r20-gate.mjs', '--payload', 'app/data/tya-hr-source-safe-periods.js', '--out', '.tmp/tya-corte3-stable-payload-gate-r20']);
    run('node', ['tools/migration/tya-reconcile-financial-live-hr-r14c.mjs', '--hr', 'app/data/tya-hr-source-safe-periods.js', '--out', '.tmp/phase-a-financial-r14c-live-hr']);
    run('node', ['tools/qa/tya-corte3-financial-reconciliation-r20-gate.mjs', '--current', '.tmp/phase-a-financial-r14c-live-hr', '--review', definition.reviewContract, '--out', '.tmp/tya-corte3-financial-reconciliation-r20']);
    evidenceFiles.push(
      '.tmp/tya-corte3-r20-profile/summary.json',
      '.tmp/tya-corte3-runtime-inventory-filter-r20/tya-hr-source-safe-periods.meta.json',
      '.tmp/tya-corte3-stable-visit-id-r20/summary.json',
      '.tmp/tya-corte3-stable-visit-id-gate-r20/report.json',
      '.tmp/tya-corte3-stable-payload-gate-r20/report.json',
      '.tmp/phase-a-financial-r14c-live-hr/financial-live-hr-reconciliation-r14c.source-safe.json',
      '.tmp/tya-corte3-financial-reconciliation-r20/report.json'
    );
    summary = readOptionalJson('.tmp/tya-corte3-financial-reconciliation-r20/report.json')?.summary || {
      status: 'PASS_READONLY_POST_GATES',
      profile,
      browserExecuted: false,
      providerReads: true,
      stableVisitIdentityVersion: report.stableVisitIdentity?.version || null,
      providerWrites: false,
      dataWrites: false
    };
  } else if (profile === 'CORTE3_CANONICAL_FINANCE_UI_EXPORT_R23') {
    const gate = 'tools/qa/tya-corte3-canonical-finance-ui-export-r23-gate.mjs';
    ensureNodeFile(gate);
    const server = spawn('python3', ['-m', 'http.server', '4173', '--directory', 'app'], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true
    });
    try {
      await waitForPort('127.0.0.1', 4173);
      run('node', [gate, '--base-url', 'http://127.0.0.1:4173/index-backend-dev.html?cxTyaPhaseA=1&r18d=visible', '--out', '.tmp/tya-corte3-canonical-finance-ui-export-r23']);
    } finally {
      try { process.kill(-server.pid, 'SIGTERM'); } catch {}
    }
    evidenceFiles.push(
      '.tmp/tya-corte3-canonical-finance-ui-export-r23/report.json',
      '.tmp/tya-corte3-canonical-finance-ui-export-r23/summary.txt'
    );
    const gateReport = readOptionalJson('.tmp/tya-corte3-canonical-finance-ui-export-r23/report.json');
    summary = {
      status: gateReport?.status === 'PASS' ? 'PASS_READONLY_POST_GATES' : 'HOLD_READONLY_POST_GATES',
      profile,
      browserExecuted: true,
      providerReads: false,
      stableVisitIdentityVersion: report.stableVisitIdentity?.version || null,
      canonicalFinance: gateReport?.summary || null,
      warnings: gateReport?.warnings || [],
      providerWrites: false,
      dataWrites: false
    };
  } else {
    hold('unsupported_profile', profile);
  }

  report.artifacts = evidenceFiles.filter(relative => fs.existsSync(path.join(ROOT, relative)));
  return summary;
}

async function main() {
  const contract = readJson(CONTRACT_PATH);
  const request = readJson(REQUEST_PATH);
  const repository = process.env.GITHUB_REPOSITORY || '';
  const branch = process.env.GITHUB_REF_NAME || '';
  report.requestCommitSha = run('git', ['rev-parse', 'HEAD']);
  report.requestId = request.requestId || null;
  report.targetHeadSha = request.targetHeadSha || null;
  report.profile = normalizeProfile(request.profile || contract.authorizedRunners?.readonlyPostGates?.profile);

  check(contract.contractId === 'cxorbia-controlled-runners-v1', 'contract_identity_valid');
  check(repository === contract.repository, 'repository_exact', repository);
  check(branch === contract.branch, 'branch_exact', branch);
  check(request.schemaVersion === contract.readonlyGatePolicy?.allowedRequestSchema, 'request_schema_valid');
  check(request.repository === contract.repository, 'request_repository_exact');
  check(request.branch === contract.branch, 'request_branch_exact');
  check(Number(request.pullRequest) === Number(contract.pullRequest), 'request_pr_exact');
  check(request.targetHeadSha === run('git', ['rev-parse', 'HEAD^']), 'target_head_exact', request.targetHeadSha);
  check(Array.isArray(request.allowedProfiles) && request.allowedProfiles.map(normalizeProfile).includes(report.profile), 'profile_authorized', report.profile);
  check((contract.authorizedRunners?.readonlyPostGates?.profiles || []).includes(report.profile), 'profile_in_contract', report.profile);

  const definition = contract.authorizedRunners?.readonlyPostGates?.profileDefinitions?.[report.profile] || null;
  check(definition && typeof definition === 'object', 'profile_definition_present', report.profile);
  report.profileDefinition = definition;
  report.stableVisitIdentity = contract.authorizedRunners?.readonlyPostGates?.stableVisitIdentity || null;
  if (definition.stableVisitIdentityRequired === true) {
    check(report.stableVisitIdentity?.version === 'tya-stable-visit-id-r20-row-identity-v1', 'stable_visit_identity_version_exact');
    check(fs.existsSync(path.join(ROOT, report.stableVisitIdentity.helper)), 'stable_visit_identity_helper_present');
    check(fs.existsSync(path.join(ROOT, report.stableVisitIdentity.applyScript)), 'stable_visit_identity_apply_present');
    check(fs.existsSync(path.join(ROOT, report.stableVisitIdentity.contractGate)), 'stable_visit_identity_gate_present');
    check(fs.existsSync(path.join(ROOT, report.stableVisitIdentity.payloadGate)), 'stable_visit_identity_payload_gate_present');
  }
  if (definition.runtimeInventoryFilterRequired === true) {
    check(fs.existsSync(path.join(ROOT, report.stableVisitIdentity.runtimeInventoryFilter)), 'runtime_inventory_filter_present');
  }

  for (const [key, expected] of Object.entries(EXPECTED_SAFE_STATE)) {
    check(request.safeState?.[key] === expected, `safe_state_${key}`);
  }
  check(request.allowedExecutions === 1, 'single_execution_required');
  check(request.repositoryWrites === false, 'repository_writes_forbidden');
  check(request.dataWrites === false, 'data_writes_forbidden');
  check(request.deploy === false && request.merge === false && request.production === false, 'deploy_merge_production_forbidden');
  check(typeof request.sourceLockDocument === 'string' && request.sourceLockDocument.startsWith('app/docs/'), 'source_lock_document_present');

  report.summary = await executeProfile(report.profile, definition);
  const changed = run('git', ['status', '--porcelain']);
  check(changed === '', 'repository_unchanged_after_gates');
  report.status = 'PASS_READONLY_POST_GATES';
}

main()
  .catch(error => {
    if (!report.blockers.length) report.blockers.push(String(error?.message || error));
    report.status = 'HOLD_READONLY_POST_GATES';
    process.exitCode = 1;
  })
  .finally(saveReport);
