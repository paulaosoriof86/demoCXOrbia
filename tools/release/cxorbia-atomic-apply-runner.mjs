#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const requestPath = process.argv[2] || '.github/cxorbia-apply-requests/request.json';
const contractPath = 'backend/contracts/cxorbia-controlled-runners-v1.json';
const reportDir = path.join(root, '.tmp/cxorbia-atomic-apply-runner');
const reportPath = path.join(reportDir, 'report.json');
const reportMdPath = path.join(reportDir, 'report.md');
const report = {
  schemaVersion: '1.0.1',
  runner: 'CXORBIA_ATOMIC_APPLY_RUNNER',
  generatedAt: new Date().toISOString(),
  status: 'HOLD_NOT_RUN',
  repository: process.env.GITHUB_REPOSITORY || null,
  branch: process.env.GITHUB_REF_NAME || null,
  requestPath,
  requestId: null,
  expectedParentSha: null,
  requestCommitSha: null,
  functionalCommitSha: null,
  candidateSha256: null,
  packageSha256: null,
  files: [],
  checks: [],
  blockers: [],
  safeState: {
    deploy: false,
    merge: false,
    production: false,
    providerWrites: false,
    dataWrites: false,
    forcePush: false,
    newBranch: false,
    newPullRequest: false
  }
};

function saveReport() {
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
  const lines = [
    '# CXOrbia atomic apply runner',
    '',
    `- Status: \`${report.status}\``,
    `- Request: \`${report.requestId || 'n/a'}\``,
    `- Parent: \`${report.expectedParentSha || 'n/a'}\``,
    `- Request commit: \`${report.requestCommitSha || 'n/a'}\``,
    `- Functional commit: \`${report.functionalCommitSha || 'n/a'}\``,
    `- Files: ${report.files.length}`,
    '',
    '## Blockers',
    '',
    ...(report.blockers.length ? report.blockers.map(x => `- ${x}`) : ['- none']),
    '',
    '## Checks',
    '',
    ...(report.checks.length ? report.checks.map(x => `- ${x}`) : ['- none'])
  ];
  fs.writeFileSync(reportMdPath, lines.join('\n') + '\n', 'utf8');
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

function readJson(rel) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) hold('required_file_missing', rel);
  try {
    return JSON.parse(fs.readFileSync(abs, 'utf8'));
  } catch (error) {
    hold('invalid_json', `${rel}:${error.message}`);
  }
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, ...(options.env || {}) },
    maxBuffer: 20 * 1024 * 1024
  });
  if (result.status !== 0) {
    hold('command_failed', `${command} ${args.join(' ')} :: ${(result.stderr || result.stdout || '').slice(0, 1200)}`);
  }
  return String(result.stdout || '').trim();
}

function lines(value) {
  return String(value || '')
    .split(/\r?\n/)
    .map(x => x.trim())
    .filter(Boolean);
}

function workingTreeDelta() {
  const paths = new Set([
    ...lines(run('git', ['diff', '--name-only'])),
    ...lines(run('git', ['diff', '--cached', '--name-only'])),
    ...lines(run('git', ['ls-files', '--others', '--exclude-standard']))
  ]);
  return [...paths].sort();
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function normalizeRel(input) {
  const rel = String(input || '').replaceAll('\\', '/').replace(/^\.\//, '');
  if (!rel || rel.startsWith('/') || rel.includes('\0')) hold('invalid_target_path', rel);
  const normalized = path.posix.normalize(rel);
  if (normalized === '..' || normalized.startsWith('../')) hold('path_traversal_forbidden', rel);
  return normalized;
}

function currentFileSha(rel) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) return null;
  const stat = fs.lstatSync(abs);
  if (!stat.isFile()) hold('target_not_regular_file', rel);
  return sha256(fs.readFileSync(abs));
}

function isTextPath(rel) {
  return /\.(?:js|mjs|cjs|json|html?|css|md|txt|yml|yaml|svg|xml|csv)$/i.test(rel);
}

function validateTextSafety(rel, buffer) {
  if (!isTextPath(rel)) return;
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    hold('utf8_bom_forbidden', rel);
  }
  const text = buffer.toString('utf8');
  const secretPatterns = [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /AIza[0-9A-Za-z_-]{30,}/,
    /gh[pousr]_[0-9A-Za-z]{30,}/,
    /(?:api[_-]?key|client[_-]?secret|private[_-]?key)\s*[:=]\s*['"][^'"]{12,}['"]/i
  ];
  for (const pattern of secretPatterns) {
    if (pattern.test(text)) hold('secret_pattern_detected', rel);
  }
}

async function fetchGitBlob(repository, blobSha, token) {
  check(/^[0-9a-f]{40}$/i.test(blobSha), 'blob_sha_format_valid', blobSha);
  const api = process.env.GITHUB_API_URL || 'https://api.github.com';
  const response = await fetch(`${api}/repos/${repository}/git/blobs/${blobSha}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'cxorbia-atomic-apply-runner'
    }
  });
  if (!response.ok) hold('blob_fetch_failed', `${blobSha}:HTTP_${response.status}`);
  const payload = await response.json();
  if (payload.encoding !== 'base64' || typeof payload.content !== 'string') {
    hold('blob_encoding_invalid', blobSha);
  }
  return Buffer.from(payload.content.replace(/\s+/g, ''), 'base64');
}

function verifyAllowedTarget(rel, contract) {
  const policy = contract.atomicApplyPolicy || {};
  const allowed = Array.isArray(policy.allowedTargetPrefixes) ? policy.allowedTargetPrefixes : [];
  const protectedPrefixes = Array.isArray(policy.alwaysProtectedPrefixes) ? policy.alwaysProtectedPrefixes : [];
  const protectedExact = new Set(policy.alwaysProtectedExactPaths || []);
  if (!allowed.some(prefix => rel.startsWith(prefix))) hold('target_outside_allowed_prefix', rel);
  if (protectedPrefixes.some(prefix => rel.startsWith(prefix))) hold('protected_prefix_forbidden', rel);
  if (protectedExact.has(rel)) hold('protected_exact_path_forbidden', rel);
}

function validateRequestCommitOnlyTouchesRequest() {
  const changed = lines(run('git', ['diff', '--name-only', 'HEAD^', 'HEAD'])).sort();
  check(changed.length === 1 && changed[0] === requestPath, 'request_commit_scope_exact', changed.join(','));
}

async function main() {
  const contract = readJson(contractPath);
  const request = readJson(requestPath);
  const repository = process.env.GITHUB_REPOSITORY || '';
  const branch = process.env.GITHUB_REF_NAME || '';
  const token = process.env.GITHUB_TOKEN || '';

  report.requestId = request.requestId || null;
  report.expectedParentSha = request.expectedParentSha || null;
  report.candidateSha256 = request.candidateSha256 || null;
  report.packageSha256 = request.packageSha256 || null;
  report.requestCommitSha = run('git', ['rev-parse', 'HEAD']);

  check(contract.contractId === 'cxorbia-controlled-runners-v1', 'contract_identity_valid');
  check(repository === contract.repository, 'repository_exact', repository);
  check(branch === contract.branch, 'branch_exact', branch);
  check(request.schemaVersion === 'cxorbia.atomic-apply-request.v1', 'request_schema_valid');
  check(request.repository === contract.repository, 'request_repository_exact');
  check(request.branch === contract.branch, 'request_branch_exact');
  check(Number(request.pullRequest) === Number(contract.pullRequest), 'request_pr_exact');
  check(request.atomicApply === true, 'atomic_apply_required');
  check(Number(request.allowedExecutions) === 1, 'single_execution_required');
  check(request.deploy === false && request.merge === false && request.production === false, 'safe_runtime_flags');
  check(request.providerWrites === false && request.dataWrites === false, 'no_provider_or_data_writes');
  check(/^[0-9a-f]{64}$/i.test(String(request.candidateSha256 || '')), 'candidate_sha256_valid');
  check(/^[0-9a-f]{64}$/i.test(String(request.packageSha256 || '')), 'package_sha256_valid');
  check(/^[0-9a-f]{40}$/i.test(String(request.expectedParentSha || '')), 'expected_parent_sha_valid');
  check(typeof request.sourceLockDocument === 'string' && request.sourceLockDocument.startsWith('app/docs/'), 'source_lock_document_present');
  check(token.length > 20, 'github_token_available');

  const parent = run('git', ['rev-parse', 'HEAD^']);
  check(parent === request.expectedParentSha, 'parent_head_exact', parent);
  validateRequestCommitOnlyTouchesRequest();

  const files = Array.isArray(request.files) ? request.files : [];
  const maxFiles = Number(contract.atomicApplyPolicy?.maxFiles || 80);
  check(files.length > 0 && files.length <= maxFiles, 'file_count_allowed', String(files.length));
  const unique = new Set();
  const operations = new Set(contract.atomicApplyPolicy?.allowedOperations || []);
  const maxBytes = Number(contract.atomicApplyPolicy?.maxFileBytes || 5 * 1024 * 1024);

  for (const item of files) {
    const rel = normalizeRel(item.path);
    if (unique.has(rel)) hold('duplicate_target_path', rel);
    unique.add(rel);
    verifyAllowedTarget(rel, contract);
    check(operations.has(item.operation), 'operation_allowed', `${rel}:${item.operation}`);
    check(/^[0-9a-f]{64}$/i.test(String(item.sha256 || '')), 'target_sha256_valid', rel);
    check(item.expectedCurrentSha256 === null || /^[0-9a-f]{64}$/i.test(String(item.expectedCurrentSha256 || '')), 'expected_current_sha256_valid', rel);

    const beforeSha = currentFileSha(rel);
    if (item.operation === 'create') check(beforeSha === null, 'create_target_absent', rel);
    if (item.operation === 'replace') check(beforeSha !== null, 'replace_target_exists', rel);
    if (item.operation === 'delete') check(beforeSha !== null, 'delete_target_exists', rel);
    check(beforeSha === item.expectedCurrentSha256, 'current_sha256_exact', rel);

    const result = {
      path: rel,
      operation: item.operation,
      expectedCurrentSha256: item.expectedCurrentSha256,
      targetSha256: item.sha256,
      gitBlobSha: item.gitBlobSha || null,
      bytes: 0
    };

    const abs = path.join(root, rel);
    if (item.operation === 'delete') {
      fs.rmSync(abs);
    } else {
      check(/^[0-9a-f]{40}$/i.test(String(item.gitBlobSha || '')), 'git_blob_sha_required', rel);
      const buffer = await fetchGitBlob(repository, item.gitBlobSha, token);
      check(buffer.length <= maxBytes, 'file_size_allowed', `${rel}:${buffer.length}`);
      check(Number(item.sizeBytes) === buffer.length, 'file_size_exact', rel);
      check(sha256(buffer) === item.sha256, 'file_sha256_exact', rel);
      validateTextSafety(rel, buffer);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, buffer);
      result.bytes = buffer.length;
      if (/\.(?:js|mjs|cjs)$/i.test(rel)) run('node', ['--check', rel]);
    }
    report.files.push(result);
  }

  run('git', ['rm', '--', requestPath]);
  const changed = workingTreeDelta();
  const expected = [...unique, requestPath].sort();
  check(JSON.stringify(changed) === JSON.stringify(expected), 'working_tree_delta_exact', changed.join(','));

  const status = run('git', ['status', '--porcelain']);
  check(Boolean(status), 'working_tree_has_expected_changes');
  run('git', ['config', 'user.name', 'cxorbia-automation']);
  run('git', ['config', 'user.email', 'cxorbia-automation@users.noreply.github.com']);
  run('git', ['add', '-A', '--', ...expected]);

  const staged = lines(run('git', ['diff', '--cached', '--name-only'])).sort();
  check(JSON.stringify(staged) === JSON.stringify(expected), 'staged_delta_exact', staged.join(','));

  const message = String(request.commitMessage || '').trim();
  check(message.length >= 8 && message.length <= 120 && !/[\r\n]/.test(message), 'commit_message_valid');
  run('git', ['commit', '-m', message]);
  report.functionalCommitSha = run('git', ['rev-parse', 'HEAD']);
  run('git', ['push', 'origin', `HEAD:${contract.branch}`]);

  const post = run('git', ['status', '--porcelain']);
  check(post === '', 'post_commit_worktree_clean');
  report.status = 'APPLIED_AND_VERIFIED';
}

main()
  .catch(error => {
    if (!report.blockers.length) report.blockers.push(String(error?.message || error));
    report.status = 'HOLD_ATOMIC_APPLY';
    process.exitCode = 1;
  })
  .finally(saveReport);
