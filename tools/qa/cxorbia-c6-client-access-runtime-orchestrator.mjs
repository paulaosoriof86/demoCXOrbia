#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';

const requestPath = process.argv[2] || 'backend/config/corte6-client-auth-materialization-request.json';
const root = process.cwd();
const out = process.env.OUT || '.tmp/c6-client-access-repair';
const privateSnapshot = process.env.PRIVATE_SNAPSHOT || '.tmp/c6-client-access-private/private-snapshot.json';
const privateE2E = process.env.PRIVATE_E2E || '.tmp/c6-client-access-private/private-e2e.json';
const rootUrl = process.env.ROOT_URL || 'https://cxorbia-backend-dev.web.app';
const expectedProject = process.env.GCP_PROJECT_ID || 'cxorbia-backend-dev';
const stagePath = path.join(out, 'stage');
const resultPath = path.join(out, 'result.json');
const privateDir = path.dirname(privateSnapshot);
fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(privateDir, { recursive: true });

const safeState = {
  authUserCreates: 0,
  passwordChanges: 0,
  passwordResets: 0,
  firestoreBusinessWrites: 0,
  hrWrites: 0,
  rulesDeploys: 0,
  storageWrites: 0,
  hostingDeploys: 0,
  cloudRunDeploys: 0,
  makeWrites: 0,
  geminiCalls: 0,
  paymentsWrites: 0,
  credentialsExposed: false,
  tokensExposed: false,
  merge: false,
  production: false
};

let applyCompleted = false;
let accessTransactionPassed = false;
let accessProof = null;
const writeStage = state => fs.writeFileSync(stagePath, `${state}\n`, 'utf8');
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const outputFile = name => path.join(out, name);
function fail(code, detail = '') { throw new Error(detail ? `${code}:${detail}` : code); }
function assert(ok, code) { if (!ok) fail(code); }
function run(label, script, args = [], extraEnv = {}, stdoutFile = null) {
  writeStage(label);
  const env = {
    ...process.env,
    CXORBIA_EXPECTED_PROJECT: expectedProject,
    CXORBIA_DEV_ROOT_URL: rootUrl,
    CXORBIA_CLIENT_AUTH_PRIVATE_SNAPSHOT: privateSnapshot,
    CXORBIA_E2E_PRIVATE_CREDENTIALS: privateE2E,
    ...extraEnv
  };
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    env,
    encoding: 'utf8',
    maxBuffer: 100 * 1024 * 1024
  });
  if (stdoutFile) fs.writeFileSync(stdoutFile, String(result.stdout || ''), 'utf8');
  if (result.status !== 0) {
    fail('COMMAND_FAILED', `${label}:${String(result.stderr || result.stdout || '').replace(/[^\x20-\x7E\n]/g, '').slice(0, 3000)}`);
  }
  return String(result.stdout || '').trim();
}
function runJson(label, script, args, extraEnv, file) {
  run(label, script, args, extraEnv, file);
  return readJson(file);
}

function validateRequest(request) {
  assert(request.schemaVersion === 'cxorbia.c6.client-access-runtime-request.v3', 'REQUEST_SCHEMA');
  assert(request.enabled === true && request.consumed === false && request.allowedExecutions === 1, 'REQUEST_STATE');
  assert(request.repository === 'paulaosoriof86/demoCXOrbia' && request.branch === 'docs-tya-v6-v71-audit' && request.pullRequest === 7 && request.environment === 'DEV', 'REQUEST_TARGET');
  const current = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  assert(request.sourceHeadSha === current, 'IMMUTABLE_SOURCE_HEAD_MISMATCH');
  assert(/^[a-f0-9]{40}$/.test(request.sourceHeadSha), 'SOURCE_HEAD_SHA_INVALID');
  assert(request.targetProjectId === expectedProject && request.tenantId === 'tya' && request.projectId === 'cinepolis', 'PROVIDER_SCOPE');
  assert(request.claims?.role === 'cliente' && request.claims?.authNamespace === 'staff' && request.claims?.tenantId === 'tya' && JSON.stringify(request.claims?.projectIds) === '["cinepolis"]', 'CLAIMS_SCOPE');
  assert(request.membershipPath === 'tenants/tya/users/cxorbia-c6-client-tya-cinepolis-v1', 'MEMBERSHIP_SCOPE');
  assert(request.membershipOnlyRepair === true && request.maxUserCreates === 0 && request.maxPasswordChanges === 0 && request.maxPasswordResets === 0 && request.maxClaimsWrites === 0 && request.maxMembershipWrites === 1, 'MEMBERSHIP_ONLY_WRITE_BOUNDS');
  assert(request.uniqueExactTargetRequired === true && request.snapshotRequired === true && request.idempotencyRequired === true && request.readbackRequired === true, 'ACCESS_GATES_REQUIRED');
  assert(request.accessCommitPolicy === 'retain_after_access_pass', 'ACCESS_COMMIT_POLICY_INVALID');
  assert(request.runtimeReadOnly === true && request.rollbackAccessOnRuntimeFailure === false, 'RUNTIME_SEPARATION_POLICY_INVALID');
  assert(request.passwordExposureAllowed === false && request.repositorySecretStorageAllowed === false && request.evidenceSecretStorageAllowed === false, 'SECRET_POLICY');
  for (const key of ['firestoreBusinessWrites', 'hrWrites', 'rulesDeploys', 'storageWrites', 'hostingDeploys', 'cloudRunDeploys', 'makeWrites', 'geminiCalls', 'paymentsWrites']) {
    assert(Number(request[key] || 0) === 0, `UNSAFE_SCOPE_${key}`);
  }
  assert(request.merge === false && request.production === false, 'UNSAFE_RELEASE_SCOPE');
  const prior = readJson('app/docs/evidence/CORTE6-CLIENT-AUTH-MATERIALIZATION-LATEST.json');
  assert(prior.decision === 'PASS_C6_CLIENT_AUTH_MATERIALIZED_AND_RUNTIME_VALIDATED', 'PRIOR_CANONICAL_CLIENT_EVIDENCE_MISSING');
}

function publicFailure(error, rollback, failedStage, request) {
  const runtimeFailure = accessTransactionPassed === true;
  return {
    schemaVersion: 'cxorbia.c6.client-access-runtime-failure.v3',
    generatedAt: new Date().toISOString(),
    decision: runtimeFailure
      ? 'HOLD_PHASE_A_RUNTIME_AFTER_ACCESS_PASS'
      : (rollback?.restoredPreState === true ? 'FAIL_C6_ACCESS_TRANSACTION_ROLLED_BACK' : 'P0_C6_ACCESS_ROLLBACK_FAILED'),
    failureClass: runtimeFailure ? 'RUNTIME_READONLY' : 'ACCESS_TRANSACTION',
    failedStage: failedStage || 'unknown',
    errorCode: String(error?.message || error).replace(/[^A-Z0-9_:.\/-]/gi, '_').slice(0, 1000),
    sourceHeadSha: request?.sourceHeadSha || null,
    accessTransactionPassed,
    accessProof,
    accessRetained: runtimeFailure && request?.accessCommitPolicy === 'retain_after_access_pass',
    rollback,
    ...safeState
  };
}

try {
  writeStage('validate_request');
  const request = readJson(requestPath);
  validateRequest(request);

  const scripts = [
    'tools/qa/cxorbia-c6-client-auth-materialization.mjs',
    'tools/qa/cxorbia-c6-existing-users-e2e-credentials.mjs',
    'tools/qa/cxorbia-c6-existing-client-e2e-credential.mjs',
    'tools/qa/tya-live-hr-dynamic-authority-gate.mjs',
    'tools/qa/tya-c6-remote-parity-gate.mjs',
    'tools/qa/cxorbia-runtime-state-machine.mjs',
    'tools/qa/tya-phase-a-unified-runtime-state-machine-gate.mjs'
  ];
  for (const script of scripts) {
    assert(fs.existsSync(script), `SCRIPT_MISSING_${script}`);
    const syntax = spawnSync(process.execPath, ['--check', script], { encoding: 'utf8' });
    assert(syntax.status === 0, `SCRIPT_SYNTAX_${script}`);
  }

  const snapshot = runJson('access_snapshot', 'tools/qa/cxorbia-c6-client-auth-materialization.mjs', ['--mode=snapshot'], {}, outputFile('access-snapshot.source-safe.json'));
  assert(snapshot.decision === 'PASS_C6_CLIENT_AUTH_MEMBERSHIP_PREWRITE_SNAPSHOT' && snapshot.targetUnique === true && snapshot.passwordSignIn === true, 'ACCESS_SNAPSHOT_NOT_PASS');
  assert(snapshot.authWrites === 0 && snapshot.membershipWrites === 0 && snapshot.authUserCreates === 0, 'ACCESS_SNAPSHOT_UNSAFE');

  const apply = runJson('access_apply', 'tools/qa/cxorbia-c6-client-auth-materialization.mjs', ['--mode=apply'], {}, outputFile('access-apply.source-safe.json'));
  applyCompleted = true;
  assert(['PASS_C6_CLIENT_AUTH_MEMBERSHIP_REPAIRED', 'PASS_C6_CLIENT_AUTH_MEMBERSHIP_IDEMPOTENT_NOOP'].includes(apply.decision), 'ACCESS_APPLY_DECISION');
  assert(Number(apply.authWrites || 0) <= 1 && Number(apply.membershipWrites || 0) <= 1 && Number(apply.authUserCreates || 0) === 0 && apply.passwordSignIn === true, 'ACCESS_APPLY_BOUNDS');

  const idempotency = runJson('access_idempotency', 'tools/qa/cxorbia-c6-client-auth-materialization.mjs', ['--mode=apply'], {}, outputFile('access-idempotency.source-safe.json'));
  assert(idempotency.decision === 'PASS_C6_CLIENT_AUTH_MEMBERSHIP_IDEMPOTENT_NOOP' && idempotency.authWrites === 0 && idempotency.membershipWrites === 0, 'ACCESS_IDEMPOTENCY_NOT_PASS');

  const readback = runJson('access_readback', 'tools/qa/cxorbia-c6-client-auth-materialization.mjs', ['--mode=readback'], {}, outputFile('access-readback.source-safe.json'));
  assert(readback.decision === 'PASS_C6_CLIENT_AUTH_MEMBERSHIP_READBACK' && readback.target?.claimsExact === true && readback.membership?.membershipExact === true && readback.passwordSignIn === true, 'ACCESS_READBACK_NOT_PASS');

  const rollbackProof = runJson('access_rollback_dry_run', 'tools/qa/cxorbia-c6-client-auth-materialization.mjs', ['--mode=rollback-dry-run'], {}, outputFile('access-rollback-proof.source-safe.json'));
  assert(rollbackProof.decision === 'PASS_C6_CLIENT_AUTH_MEMBERSHIP_ROLLBACK_EXACT_DRY_RUN' && rollbackProof.canRollbackExactly === true, 'ACCESS_ROLLBACK_PROOF');

  accessProof = {
    schemaVersion: 'cxorbia.c6.client-access-transaction-proof.v1',
    generatedAt: new Date().toISOString(),
    decision: 'PASS_C6_CLIENT_ACCESS_TRANSACTION',
    sourceHeadSha: request.sourceHeadSha,
    targetUnique: snapshot.targetUnique === true,
    passwordSignIn: readback.passwordSignIn === true,
    claimsExact: readback.target?.claimsExact === true,
    membershipExact: readback.membership?.membershipExact === true,
    applyDecision: apply.decision,
    idempotencyDecision: idempotency.decision,
    rollbackDryRunDecision: rollbackProof.decision,
    authWrites: Number(apply.authWrites || 0),
    claimsWrites: Number(apply.claimsWrites || 0),
    membershipWrites: Number(apply.membershipWrites || 0),
    userCreates: 0,
    passwordChanges: 0,
    passwordResets: 0,
    source: 'provider_readback'
  };
  fs.writeFileSync(outputFile('access-proof.json'), `${JSON.stringify(accessProof, null, 2)}\n`, 'utf8');
  accessTransactionPassed = true;

  const staffShopper = runJson('select_staff_shopper', 'tools/qa/cxorbia-c6-existing-users-e2e-credentials.mjs', [], { PRIVATE_DIR: privateDir, OUT_DIR: out }, outputFile('credential-selection-staff-shopper.source-safe.json'));
  assert(staffShopper.decision === 'PASS_C6_EXISTING_E2E_CREDENTIAL_SELECTION' && staffShopper.authWrites === 0 && staffShopper.passwordChanges === 0 && staffShopper.valuesExported === false, 'STAFF_SHOPPER_SELECTION');
  const clientSelection = runJson('select_canonical_client', 'tools/qa/cxorbia-c6-existing-client-e2e-credential.mjs', [], {}, outputFile('credential-selection-client.source-safe.json'));
  assert(clientSelection.decision === 'PASS_C6_EXISTING_CANONICAL_CLIENT_CREDENTIAL_SELECTION' && clientSelection.claimsValid === true && clientSelection.membershipValid === true, 'CLIENT_SELECTION');
  const privateBundle = readJson(privateE2E);
  assert(privateBundle?.staff?.login && privateBundle?.staff?.password && privateBundle?.shopper?.login && privateBundle?.shopper?.password && privateBundle?.client?.login && privateBundle?.client?.password, 'PRIVATE_BUNDLE_INCOMPLETE');

  run('runtime_live_authority', 'tools/qa/tya-live-hr-dynamic-authority-gate.mjs', [rootUrl], { CXORBIA_LIVE_AUTHORITY_OUTPUT: outputFile('live-hr-authority.source-safe.json') }, outputFile('live-authority.log'));
  const live = readJson(outputFile('live-hr-authority.source-safe.json'));
  assert(live.decision === 'PASS_TYA_LIVE_HR_DYNAMIC_AUTHORITY' && live.frozenVisitCountAssumed === false && live.frozenLatestPeriodAssumed === false, 'LIVE_AUTHORITY');

  run('runtime_remote_parity', 'tools/qa/tya-c6-remote-parity-gate.mjs', [rootUrl], {
    CXORBIA_REMOTE_PARITY_OUTPUT: outputFile('remote-parity.source-safe.json'),
    CXORBIA_REMOTE_PARITY_ATTEMPTS: '3',
    CXORBIA_REMOTE_PARITY_WAIT_MS: '3000'
  }, outputFile('remote-parity.log'));
  const parity = readJson(outputFile('remote-parity.source-safe.json'));
  assert(parity.decision === 'PASS_C6_HOSTING_DEV_REMOTE_PARITY_AND_LIVE_HR' && parity.allCriticalAssetsMatch === true && parity.liveEndpoint?.ok === true, 'REMOTE_PARITY');

  run('runtime_unified_state_machine', 'tools/qa/tya-phase-a-unified-runtime-state-machine-gate.mjs', [rootUrl], {
    CXORBIA_UNIFIED_RUNTIME_OUTPUT: outputFile('unified-runtime.source-safe.json'),
    CXORBIA_ACCESS_TRANSACTION_PROOF: outputFile('access-proof.json')
  }, outputFile('unified-runtime.log'));
  const runtime = readJson(outputFile('unified-runtime.source-safe.json'));
  assert(runtime.decision === 'PASS_PHASE_A_UNIFIED_RUNTIME_STATE_MACHINE', 'UNIFIED_RUNTIME');
  assert(Number(runtime.source?.visits || 0) === Number(live.visits) && runtime.source?.latestPeriod === live.latestPeriod, 'UNIFIED_RUNTIME_LIVE_PARITY');

  const evidence = {
    schemaVersion: 'cxorbia.c6.client-access-and-phase-a-runtime.v3',
    generatedAt: new Date().toISOString(),
    decision: 'PASS_C6_ACCESS_AND_PHASE_A_UNIFIED_RUNTIME',
    sourceHeadSha: request.sourceHeadSha,
    accessTransaction: accessProof,
    runtimeTransaction: {
      readOnly: true,
      liveAuthority: live,
      remoteParity: {
        decision: parity.decision,
        assets: parity.files?.length || 0,
        liveHrOk: parity.liveEndpoint?.ok === true
      },
      unified: runtime
    },
    safety: {
      ...safeState,
      authWrites: accessProof.authWrites,
      claimsWrites: accessProof.claimsWrites,
      membershipWrites: accessProof.membershipWrites
    }
  };
  fs.writeFileSync(resultPath, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ decision: evidence.decision, sourceHeadSha: request.sourceHeadSha, access: accessProof.decision, runtime: runtime.decision, liveVisits: live.visits, latestPeriod: live.latestPeriod }));
} catch (error) {
  const failedStage = fs.existsSync(stagePath) ? fs.readFileSync(stagePath, 'utf8').trim() : 'unknown';
  let rollback = { decision: 'PASS_C6_ACCESS_ROLLBACK_NOT_REQUIRED', restoredPreState: true, authWrites: 0, membershipWrites: 0 };
  const request = fs.existsSync(requestPath) ? readJson(requestPath) : null;
  if (!accessTransactionPassed && applyCompleted && fs.existsSync(privateSnapshot)) {
    try {
      rollback = runJson('access_rollback_after_failure', 'tools/qa/cxorbia-c6-client-auth-materialization.mjs', ['--mode=rollback'], {}, outputFile('access-rollback-after-failure.source-safe.json'));
    } catch (rollbackError) {
      rollback = { decision: 'P0_C6_ACCESS_ROLLBACK_FAILED', restoredPreState: false, errorCode: String(rollbackError?.message || rollbackError).slice(0, 500) };
    }
  }
  const failure = publicFailure(error, rollback, failedStage, request);
  fs.writeFileSync(resultPath, `${JSON.stringify(failure, null, 2)}\n`, 'utf8');
  console.error(JSON.stringify({ decision: failure.decision, failureClass: failure.failureClass, failedStage: failure.failedStage, accessTransactionPassed: failure.accessTransactionPassed, accessRetained: failure.accessRetained }));
  process.exitCode = 1;
}
