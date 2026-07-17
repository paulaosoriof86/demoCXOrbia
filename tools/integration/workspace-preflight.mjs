#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, readJson, sha256File, git, tryCommand, normalizeRepoPath, assertCandidatePathAllowed } from './lib.mjs';

export function runWorkspacePreflight(options) {
  const checks = [];
  const add = (id, ok, detail) => checks.push({ id, ok: Boolean(ok), detail });
  const repoRoot = resolve(options.repoRoot || process.cwd());
  const candidatePath = options.candidate ? resolve(options.candidate) : null;
  const planPath = options.plan ? resolve(options.plan) : null;
  const productPolicyPath = options.policy ? resolve(options.policy) : null;
  const tenantPolicyPath = options.tenantPolicy ? resolve(options.tenantPolicy) : null;

  add('candidateReadable', Boolean(candidatePath && existsSync(candidatePath)), candidatePath || 'missing --candidate');
  add('planReadable', Boolean(planPath && existsSync(planPath)), planPath || 'missing --plan');
  add('productPolicyReadable', Boolean(productPolicyPath && existsSync(productPolicyPath)), productPolicyPath || 'missing --policy');
  add('tenantPolicyReadable', Boolean(tenantPolicyPath && existsSync(tenantPolicyPath)), tenantPolicyPath || 'missing --tenant-policy');

  let plan = null;
  let productPolicy = null;
  let tenantPolicy = null;
  try {
    if (planPath && existsSync(planPath)) plan = readJson(planPath);
    if (productPolicyPath && existsSync(productPolicyPath)) productPolicy = readJson(productPolicyPath);
    if (tenantPolicyPath && existsSync(tenantPolicyPath)) tenantPolicy = readJson(tenantPolicyPath);
  } catch (error) {
    add('configurationJsonValid', false, String(error.message || error));
  }

  let detectedRoot = null;
  try {
    detectedRoot = git(['rev-parse', '--show-toplevel'], { cwd: repoRoot });
    add('gitRepositoryMounted', true, detectedRoot);
  } catch (error) {
    add('gitRepositoryMounted', false, String(error.stderr || error.message || error));
  }

  let remote = null;
  let branch = null;
  let head = null;
  if (detectedRoot) {
    try {
      remote = git(['config', '--get', 'remote.origin.url'], { cwd: detectedRoot });
      const expectedRepo = productPolicy?.repositoryFullName || plan?.repositoryFullName;
      const normalizedRemote = remote.replace(/\.git$/i, '').replace(/^git@github\.com:/i, 'https://github.com/');
      const expectedFragment = expectedRepo ? `github.com/${expectedRepo}` : null;
      add('correctRepository', Boolean(!expectedFragment || normalizedRemote.includes(expectedFragment)), `${remote}${expectedRepo ? ` | expected ${expectedRepo}` : ''}`);
    } catch (error) {
      add('correctRepository', false, String(error.stderr || error.message || error));
    }

    try {
      branch = git(['branch', '--show-current'], { cwd: detectedRoot });
      const expectedBranch = plan?.expectedBranch || productPolicy?.expectedBranch;
      add('correctBranch', Boolean(branch && (!expectedBranch || branch === expectedBranch)), `${branch || '(detached)'}${expectedBranch ? ` | expected ${expectedBranch}` : ''}`);
    } catch (error) {
      add('correctBranch', false, String(error.stderr || error.message || error));
    }

    try {
      head = git(['rev-parse', 'HEAD'], { cwd: detectedRoot });
      const expectedHead = plan?.expectedHead || null;
      add('expectedHead', Boolean(!expectedHead || head === expectedHead), `${head}${expectedHead ? ` | expected ${expectedHead}` : ''}`);
    } catch (error) {
      add('expectedHead', false, String(error.stderr || error.message || error));
    }

    try {
      const status = git(['status', '--porcelain=v1'], { cwd: detectedRoot });
      add('cleanWorkingTree', status.length === 0, status || 'clean');
    } catch (error) {
      add('cleanWorkingTree', false, String(error.stderr || error.message || error));
    }

    if (branch) {
      const pushDryRun = tryCommand('git', ['push', '--dry-run', 'origin', `HEAD:${branch}`], { cwd: detectedRoot });
      add('gitWriteAuthenticated', pushDryRun.ok, pushDryRun.ok ? (pushDryRun.stderr || pushDryRun.stdout || 'dry-run OK') : (pushDryRun.stderr || pushDryRun.error || 'dry-run failed'));
    }
  }

  const primary = process.platform === 'win32' ? tryCommand('tar', ['--version']) : tryCommand('unzip', ['-v']);
  const fallback = process.platform === 'win32' ? tryCommand('bsdtar', ['--version']) : tryCommand('tar', ['--version']);
  add('zipExtractorAvailable', primary.ok || fallback.ok, primary.ok ? 'primary extractor available' : (fallback.ok ? 'fallback extractor available' : `${primary.stderr || primary.error || ''} ${fallback.stderr || fallback.error || ''}`.trim()));

  if (candidatePath && existsSync(candidatePath) && plan) {
    try {
      const actualSha = sha256File(candidatePath);
      add('candidateIdentity', actualSha === plan.candidateSha256, `${actualSha} | expected ${plan.candidateSha256}`);
    } catch (error) {
      add('candidateIdentity', false, String(error.message || error));
    }
  }

  if (plan && productPolicy && tenantPolicy) {
    try {
      const files = [...(plan.files?.added || []), ...(plan.files?.modified || []), ...(plan.files?.removed || [])].map(normalizeRepoPath);
      for (const path of files) assertCandidatePathAllowed(path, productPolicy, tenantPolicy);
      add('candidatePathsAllowed', true, `${files.length} rutas autorizadas`);
    } catch (error) {
      add('candidatePathsAllowed', false, String(error.message || error));
    }
    add('multiTenantPolicy', productPolicy.multiTenant === true && tenantPolicy.multiProject === true, `product.multiTenant=${productPolicy.multiTenant}; tenant.multiProject=${tenantPolicy.multiProject}`);
    add('projectSelectionExplicit', tenantPolicy.projectSelection === 'explicit', `projectSelection=${tenantPolicy.projectSelection}`);
    add('noGlobalProjectDefault', !tenantPolicy.defaultProjectId, tenantPolicy.defaultProjectId ? `defaultProjectId=${tenantPolicy.defaultProjectId}` : 'no default project');
  }

  const ok = checks.every((check) => check.ok);
  return { ok, state: ok ? 'PASS_REPO_WORKSPACE' : 'FAIL_REPO_WORKSPACE', checkedAt: new Date().toISOString(), repoRoot: detectedRoot || repoRoot, remote, branch, head, candidatePath, planPath, checks };
}

function main() {
  const args = parseArgs();
  const here = dirname(fileURLToPath(import.meta.url));
  const result = runWorkspacePreflight({ repoRoot: args.repo || process.cwd(), candidate: args.candidate, plan: args.plan, policy: args.policy || resolve(here, 'policies/cxorbia-product.json'), tenantPolicy: args['tenant-policy'] || resolve(here, 'policies/tenants/tya.json') });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exitCode = result.ok ? 0 : 2;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('workspace-preflight.mjs')) main();
