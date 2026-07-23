#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawn, spawnSync } from 'node:child_process';

const root = process.cwd();
const requestPath = process.argv[2] || '.github/cxorbia-gate-requests/request.json';
const contractPath = 'backend/contracts/cxorbia-controlled-runners-v1.json';
const outDir = path.join(root, '.tmp/cxorbia-readonly-post-gates');
const reportPath = path.join(outDir, 'report.json');
const reportMdPath = path.join(outDir, 'report.md');
const serverLogPath = path.join(outDir, 'static-server.log');

const report = {
  schemaVersion: '1.0.0',
  runner: 'CXORBIA_READONLY_POST_GATES_RUNNER',
  generatedAt: new Date().toISOString(),
  status: 'HOLD_NOT_RUN',
  enabled: false,
  requestId: null,
  profile: null,
  repository: process.env.GITHUB_REPOSITORY || null,
  branch: process.env.GITHUB_REF_NAME || null,
  expectedSourceHead: null,
  requestCommitSha: null,
  sourceHeadSha: null,
  gates: [],
  blockers: [],
  warnings: [],
  gitStatusAfter: null,
  safeState: {
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
  }
};

function saveReport() {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
  const lines = [
    '# CXOrbia read-only post-gates',
    '',
    `- Status: \`${report.status}\``,
    `- Request: \`${report.requestId || 'n/a'}\``,
    `- Profile: \`${report.profile || 'n/a'}\``,
    `- Source HEAD: \`${report.sourceHeadSha || 'n/a'}\``,
    '',
    '## Gates',
    '',
    ...(report.gates.length
      ? report.gates.map(gate => `- ${gate.status}: \`${gate.id}\` (${gate.exitCode})`)
      : ['- none']),
    '',
    '## Blockers',
    '',
    ...(report.blockers.length ? report.blockers.map(x => `- ${x}`) : ['- none']),
    '',
    '## Warnings',
    '',
    ...(report.warnings.length ? report.warnings.map(x => `- ${x}`) : ['- none'])
  ];
  fs.writeFileSync(reportMdPath, lines.join('\n') + '\n', 'utf8');
}

function readJson(rel) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) throw new Error(`required_file_missing:${rel}`);
  return JSON.parse(fs.readFileSync(abs, 'utf8'));
}

function git(...args) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`git_failed:${args.join(' ')}:${(result.stderr || '').slice(0, 500)}`);
  return String(result.stdout || '').trim();
}

function assert(condition, code, detail = '') {
  if (!condition) throw new Error(detail ? `${code}:${detail}` : code);
}

function executeGate(id, command, args, env = {}) {
  const startedAt = new Date().toISOString();
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, ...env },
    maxBuffer: 30 * 1024 * 1024
  });
  const stdout = String(result.stdout || '');
  const stderr = String(result.stderr || '');
  const logPath = path.join(outDir, `${id}.log`);
  fs.writeFileSync(logPath, `${stdout}${stderr ? `\n[stderr]\n${stderr}` : ''}`, 'utf8');
  const gate = {
    id,
    command: [command, ...args].join(' '),
    startedAt,
    finishedAt: new Date().toISOString(),
    exitCode: result.status ?? 1,
    status: result.status === 0 ? 'PASS' : 'HOLD',
    logPath: path.relative(root, logPath).replaceAll('\\', '/'),
    stdoutTail: stdout.slice(-1200),
    stderrTail: stderr.slice(-1200)
  };
  report.gates.push(gate);
  return gate;
}

async function waitForServer(url, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  let last = '';
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: 'manual' });
      if (response.ok) return;
      last = `HTTP_${response.status}`;
    } catch (error) {
      last = String(error?.message || error);
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error(`static_server_not_ready:${last}`);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const contract = readJson(contractPath);
  const request = readJson(requestPath);
  report.enabled = request.enabled === true;
  report.requestId = request.requestId || null;
  report.profile = request.profile || null;
  report.expectedSourceHead = request.expectedSourceHead || null;
  report.requestCommitSha = git('rev-parse', 'HEAD');
  report.sourceHeadSha = git('rev-parse', 'HEAD^');

  if (!report.enabled) {
    report.status = 'SKIPPED_DISABLED_REQUEST';
    return;
  }

  assert(contract.contractId === 'cxorbia-controlled-runners-v1', 'contract_identity_invalid');
  assert(process.env.GITHUB_REPOSITORY === contract.repository, 'repository_mismatch', process.env.GITHUB_REPOSITORY || '');
  assert(process.env.GITHUB_REF_NAME === contract.branch, 'branch_mismatch', process.env.GITHUB_REF_NAME || '');
  assert(request.schemaVersion === 'cxorbia.readonly-post-gates-request.v1', 'request_schema_invalid');
  assert(request.repository === contract.repository, 'request_repository_mismatch');
  assert(request.branch === contract.branch, 'request_branch_mismatch');
  assert(Number(request.pullRequest) === Number(contract.pullRequest), 'request_pr_mismatch');
  assert(request.profile === contract.authorizedRunners.readonlyPostGates.profile, 'profile_not_allowed');
  assert(/^[0-9a-f]{40}$/i.test(String(request.expectedSourceHead || '')), 'expected_source_head_invalid');
  assert(report.sourceHeadSha === request.expectedSourceHead, 'source_head_mismatch', `${report.sourceHeadSha}/${request.expectedSourceHead}`);
  assert(request.repositoryWrites === false, 'repository_writes_forbidden');
  assert(request.dataWrites === false && request.deploy === false && request.merge === false && request.production === false, 'unsafe_request_flags');
  assert(request.imports === false && request.payments === false && request.make === false && request.gemini === false, 'unsafe_integration_flags');

  const requestDelta = git('diff', '--name-only', 'HEAD^', 'HEAD').split(/\r?\n/).filter(Boolean).sort();
  assert(requestDelta.length === 1 && requestDelta[0] === requestPath, 'request_commit_scope_invalid', requestDelta.join(','));

  const gatesBeforeServer = [
    ['node-check-builder', 'node', ['--check', 'tools/hr-source/tya-build-live-hr-source-safe-r20-inventory.mjs']],
    ['tya-hr-header-variants-r20-gate', 'node', ['tools/qa/tya-hr-header-variants-r20-gate.mjs']],
    ['tya-build-live-hr-source-safe-r20-inventory', 'node', ['tools/hr-source/tya-build-live-hr-source-safe-r20-inventory.mjs']],
    ['tya-live-hr-inplace-refresh-gate', 'node', ['tools/qa/tya-live-hr-inplace-refresh-gate.mjs']],
    ['tya-corte1-context-history-reports-gate', 'node', ['tools/qa/tya-corte1-context-history-reports-gate.mjs']],
    ['tya-corte1-report-frontend-runtime-gate', 'node', ['tools/qa/tya-corte1-report-frontend-runtime-gate.mjs']]
  ];

  for (const [id, command, args] of gatesBeforeServer) executeGate(id, command, args);

  const serverLog = fs.openSync(serverLogPath, 'w');
  const server = spawn('python3', ['-m', 'http.server', '4173', '--bind', '127.0.0.1', '--directory', 'app'], {
    cwd: root,
    stdio: ['ignore', serverLog, serverLog],
    detached: false
  });

  try {
    await waitForServer('http://127.0.0.1:4173/index.html');
    executeGate(
      'tya-project-period-kpi-history-gate-r20',
      'node',
      [
        'tools/qa/tya-project-period-kpi-history-gate-r20.mjs',
        '--base-url',
        'http://127.0.0.1:4173/index.html?cxTyaPhaseA=1&r18d=visible',
        '--out',
        '.tmp/tya-project-period-kpi-history-r20'
      ]
    );
    executeGate('tya-corte2a-shopper-operation-canonical-gate', 'node', ['tools/qa/tya-corte2a-shopper-operation-canonical-gate.mjs']);
    executeGate('tya-corte1-m1-regression-lock', 'node', ['tools/qa/tya-corte1-m1-regression-lock.mjs']);
    executeGate('tya-v174-corte2a-empalme-directo-verify', 'node', ['tools/release/tya-v174-corte2a-empalme-directo-verify.mjs']);
  } finally {
    server.kill('SIGTERM');
    fs.closeSync(serverLog);
  }

  const holds = report.gates.filter(gate => gate.status !== 'PASS');
  report.gitStatusAfter = git('status', '--porcelain');
  if (report.gitStatusAfter) {
    report.warnings.push('local_generated_files_present_in_ephemeral_checkout');
  }
  report.status = holds.length ? 'HOLD_READONLY_POST_GATES' : 'PASS_READONLY_POST_GATES';
  if (holds.length) report.blockers.push(...holds.map(gate => `${gate.id}:exit_${gate.exitCode}`));
  if (holds.length) process.exitCode = 1;
}

main()
  .catch(error => {
    report.status = 'HOLD_READONLY_POST_GATES';
    report.blockers.push(String(error?.message || error));
    process.exitCode = 1;
  })
  .finally(saveReport);
