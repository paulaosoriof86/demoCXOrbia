#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');
const argv = process.argv.slice(2);
const arg = (name, fallback = null) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : fallback;
};
const mode = arg('--mode', 'inspect');
const requestPath = path.resolve(repo, arg('--request', 'backend/requests/i3-5b-provider-exact-crosswalk-one-target.json'));
const resultPath = path.resolve(arg('--result', process.env.RUNNER_TEMP ? `${process.env.RUNNER_TEMP}/i3-5b-provider-exact-crosswalk-result.json` : path.resolve(repo, '.tmp/i3-5b-provider-exact-crosswalk-result.json')));
const stagedRequestPath = path.resolve(arg('--staged-request', process.env.RUNNER_TEMP ? `${process.env.RUNNER_TEMP}/i3-5b-provider-exact-crosswalk-request.json` : path.resolve(repo, '.tmp/i3-5b-provider-exact-crosswalk-request.json')));
const evidencePath = path.resolve(repo, arg('--evidence', 'app/docs/evidence/ITERATION3-I3-5B-PROVIDER-EXACT-CROSSWALK-LATEST.json'));
const stableJson = value => JSON.stringify(value, null, 2) + '\n';
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const appendOutput = (key, value) => {
  if (!process.env.GITHUB_OUTPUT) throw new Error('GITHUB_OUTPUT_REQUIRED');
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`, 'utf8');
};

if (mode === 'inspect') {
  appendOutput('should_execute', 'false');
  if (!fs.existsSync(requestPath)) {
    console.log('I3.5B request absent; provider execution skipped');
    process.exit(0);
  }
  const request = readJson(requestPath);
  const ok = request.schemaVersion === 'cxorbia.i3.5b.provider-exact-crosswalk-request.v1'
    && request.enabled === true
    && request.consumed === false
    && request.gateId === 'I3.5B_PROVIDER_BACKED_EXACT_CROSSWALK_VALIDATE_AND_MATERIALIZE_ONE_TARGET'
    && request.targetProject === 'cxorbia-backend-dev'
    && request.tenantId === 'tya'
    && request.projectId === 'cinepolis'
    && request.periodKey === '2026-08'
    && request.maxProviderWrites === 1
    && request.allowedCollection === 'tenants/tya/shopperIdentityLinks'
    && request.expectedWriteBudget?.firestoreWrites === 1
    && request.expectedWriteBudget?.shopperIdentityLinkWrites === 1
    && request.expectedWriteBudget?.authWrites === 0
    && request.expectedWriteBudget?.passwordResets === 0
    && request.expectedWriteBudget?.historicalShopperAccess === 0
    && request.expectedWriteBudget?.hrWrites === 0
    && request.expectedWriteBudget?.financeWrites === 0
    && request.expectedWriteBudget?.rulesWrites === 0
    && request.expectedWriteBudget?.storageWrites === 0
    && request.expectedWriteBudget?.makeCalls === 0
    && request.expectedWriteBudget?.geminiCalls === 0
    && request.expectedWriteBudget?.paymentWrites === 0
    && request.expectedWriteBudget?.deploys === 0
    && /^[a-f0-9]{40}$/.test(String(request.productTargetHeadSha || ''));
  appendOutput('should_execute', ok ? 'true' : 'false');
  if (ok) {
    appendOutput('product_target_sha', request.productTargetHeadSha);
    appendOutput('request_id', request.requestId);
    fs.mkdirSync(path.dirname(stagedRequestPath), { recursive: true });
    fs.copyFileSync(requestPath, stagedRequestPath);
  }
  console.log(ok ? 'I3.5B exact one-shot request is executable' : 'I3.5B request present but not executable; skipped');
  process.exit(0);
}

if (mode === 'ensure-result') {
  if (fs.existsSync(resultPath)) process.exit(0);
  const fallback = {
    schemaVersion: 'cxorbia.i3.5b.provider-exact-crosswalk-result.v1',
    requestId: process.env.REQUEST_ID || null,
    gateId: 'I3.5B_PROVIDER_BACKED_EXACT_CROSSWALK_VALIDATE_AND_MATERIALIZE_ONE_TARGET',
    productTargetHeadSha: process.env.PRODUCT_TARGET_SHA || null,
    executorHeadSha: process.env.EXECUTOR_SHA || null,
    targetProject: 'cxorbia-backend-dev',
    tenantId: 'tya',
    projectId: 'cinepolis',
    periodKey: '2026-08',
    status: 'WORKFLOW_FAILED_BEFORE_RESULT',
    decision: 'HOLD_I3_5B_WORKFLOW_FAILED_ZERO_WRITES',
    providerAttempted: false,
    providerAck: false,
    readbackReady: false,
    exactIndependentAuthorityDemonstrated: false,
    canonicalProfileExists: false,
    exactAuthorityRecordCount: 0,
    conflictingAuthorityRecordCount: 0,
    existingRelevantIdentityLinks: 0,
    existingExactAuthorizedLink: false,
    materializedIdentityLink: false,
    authorityType: null,
    authorityEvidenceDigest: null,
    identityLinkDocumentFingerprint: null,
    providerReads: {},
    firestoreWrites: 0,
    shopperIdentityLinkWrites: 0,
    safety: {
      historicalShopperAccess: 0,
      historicalShopperLogin: 0,
      historicalShopperRecovery: 0,
      historicalShopperReset: 0,
      authReads: 0,
      authWrites: 0,
      userCreates: 0,
      userUpdates: 0,
      passwordChanges: 0,
      passwordResets: 0,
      hrWrites: 0,
      financeWrites: 0,
      rulesWrites: 0,
      storageWrites: 0,
      makeCalls: 0,
      geminiCalls: 0,
      paymentWrites: 0,
      deploys: 0,
      merge: false,
      production: false
    },
    blockers: ['WORKFLOW_FAILED_BEFORE_RESULT'],
    notes: []
  };
  fs.mkdirSync(path.dirname(resultPath), { recursive: true });
  fs.writeFileSync(resultPath, stableJson(fallback), 'utf8');
  process.exit(0);
}

if (mode === 'consume') {
  const request = readJson(requestPath);
  if (request.requestId !== process.env.REQUEST_ID) throw new Error('REQUEST_ID_DRIFT_BEFORE_CONSUME');
  if (request.consumed === true) throw new Error('REQUEST_ALREADY_CONSUMED_BEFORE_EVIDENCE_PERSIST');
  const result = readJson(resultPath);
  const runId = Number(process.env.RUN_ID || 0);
  const runAttempt = Number(process.env.RUN_ATTEMPT || 0);
  const evidence = {
    ...result,
    githubRunId: runId,
    githubRunAttempt: runAttempt,
    requestConsumed: true,
    noAutomaticRetry: true
  };
  fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
  fs.writeFileSync(evidencePath, stableJson(evidence), 'utf8');
  const consumed = {
    schemaVersion: request.schemaVersion,
    requestId: request.requestId,
    enabled: false,
    consumed: true,
    gateId: request.gateId,
    productTargetHeadSha: request.productTargetHeadSha,
    targetProject: request.targetProject,
    tenantId: request.tenantId,
    projectId: request.projectId,
    periodKey: request.periodKey,
    maxProviderWrites: request.maxProviderWrites,
    allowedCollection: request.allowedCollection,
    status: result.status,
    decision: result.decision,
    providerAttempted: result.providerAttempted === true,
    providerAck: result.providerAck === true,
    readbackReady: result.readbackReady === true,
    exactIndependentAuthorityDemonstrated: result.exactIndependentAuthorityDemonstrated === true,
    materializedIdentityLink: result.materializedIdentityLink === true,
    firestoreWrites: Number(result.firestoreWrites || 0),
    shopperIdentityLinkWrites: Number(result.shopperIdentityLinkWrites || 0),
    historicalShopperAccess: Number(result.safety?.historicalShopperAccess || 0),
    authWrites: Number(result.safety?.authWrites || 0),
    passwordResets: Number(result.safety?.passwordResets || 0),
    githubRunId: runId,
    githubRunAttempt: runAttempt,
    noAutomaticRetry: true
  };
  fs.writeFileSync(requestPath, stableJson(consumed), 'utf8');
  process.exit(0);
}

throw new Error(`UNSUPPORTED_MODE:${mode}`);
