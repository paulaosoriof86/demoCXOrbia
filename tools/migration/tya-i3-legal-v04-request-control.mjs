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
const requestPath = path.resolve(repo, arg('--request', 'backend/requests/i3-legal-v04-materialization-dev.json'));
const resultPath = path.resolve(arg('--result', process.env.RUNNER_TEMP ? `${process.env.RUNNER_TEMP}/i3-legal-v04-result.json` : path.resolve(repo, '.tmp/i3-legal-v04-result.json')));
const stagedRequestPath = path.resolve(arg('--staged-request', process.env.RUNNER_TEMP ? `${process.env.RUNNER_TEMP}/i3-legal-v04-request.json` : path.resolve(repo, '.tmp/i3-legal-v04-request.json')));
const evidencePath = path.resolve(repo, arg('--evidence', 'app/docs/evidence/ITERATION3-LEGAL-V04-MATERIALIZATION-DEV-LATEST.json'));
const stableJson = value => JSON.stringify(value, null, 2) + '\n';
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const appendOutput = (key, value) => {
  if (!process.env.GITHUB_OUTPUT) throw new Error('GITHUB_OUTPUT_REQUIRED');
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`, 'utf8');
};

if (mode === 'inspect') {
  appendOutput('should_execute', 'false');
  if (!fs.existsSync(requestPath)) {
    console.log('request absent; provider execution skipped');
    process.exit(0);
  }
  const request = readJson(requestPath);
  const ok = request.schemaVersion === 'cxorbia.i3.legal-v04-materialization-request.v1'
    && request.enabled === true
    && request.consumed === false
    && request.authorizationGate === 'PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3'
    && request.targetProject === 'cxorbia-backend-dev'
    && request.tenantId === 'tya'
    && /^[a-f0-9]{40}$/.test(String(request.sourceHeadSha || ''));
  appendOutput('should_execute', ok ? 'true' : 'false');
  if (ok) {
    appendOutput('source_sha', request.sourceHeadSha);
    appendOutput('request_id', request.requestId);
    fs.mkdirSync(path.dirname(stagedRequestPath), { recursive: true });
    fs.copyFileSync(requestPath, stagedRequestPath);
  }
  console.log(ok ? 'exact one-shot request is executable' : 'request present but not executable; skipped');
  process.exit(0);
}

if (mode === 'ensure-result') {
  if (fs.existsSync(resultPath)) process.exit(0);
  const fallback = {
    schemaVersion: 'cxorbia.i3.legal-v04-materialization-result.v1',
    requestId: process.env.REQUEST_ID || null,
    sourceHeadSha: process.env.SOURCE_SHA || null,
    targetProject: 'cxorbia-backend-dev',
    targetTenant: 'tya',
    status: 'WORKFLOW_FAILED_BEFORE_RESULT',
    providerAttempted: false,
    providerAck: false,
    committed: false,
    readbackReady: false,
    legalContentId: null,
    legalVersion: null,
    contentDigest: null,
    firestoreWrites: 0,
    legalProfileWrites: 0,
    legalProviderWrites: 0,
    legalContentWrites: 0,
    legalAcceptanceWrites: 0,
    authWrites: 0,
    passwordResets: 0,
    historicalCredentialAccess: 0,
    historicalReconciliationWrites: 0,
    hrWrites: 0,
    rulesWrites: 0,
    storageWrites: 0,
    makeWrites: 0,
    geminiCalls: 0,
    paymentWrites: 0,
    deploys: 0,
    automaticAcceptance: false,
    humanAcceptanceRequired: true,
    production: false,
    merge: false,
    blockers: ['WORKFLOW_FAILED_BEFORE_RESULT']
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
    authorizationGate: request.authorizationGate,
    sourceHeadSha: request.sourceHeadSha,
    targetProject: request.targetProject,
    tenantId: request.tenantId,
    commandType: request.commandType,
    status: result.status,
    providerAttempted: result.providerAttempted === true,
    providerAck: result.providerAck === true,
    committed: result.committed === true,
    readbackReady: result.readbackReady === true,
    legalContentId: result.legalContentId || null,
    legalVersion: result.legalVersion || null,
    contentDigest: result.contentDigest || null,
    firestoreWrites: Number(result.firestoreWrites || 0),
    legalAcceptanceWrites: Number(result.legalAcceptanceWrites || 0),
    authWrites: Number(result.authWrites || 0),
    passwordResets: Number(result.passwordResets || 0),
    historicalCredentialAccess: Number(result.historicalCredentialAccess || 0),
    historicalReconciliationWrites: Number(result.historicalReconciliationWrites || 0),
    automaticAcceptance: false,
    humanAcceptanceStillRequired: true,
    githubRunId: runId,
    githubRunAttempt: runAttempt,
    noAutomaticRetry: true
  };
  fs.writeFileSync(requestPath, stableJson(consumed), 'utf8');
  process.exit(0);
}

throw new Error(`UNSUPPORTED_MODE:${mode}`);
