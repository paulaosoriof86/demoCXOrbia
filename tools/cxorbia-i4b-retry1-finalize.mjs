#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const requestFile = process.env.REQUEST_FILE;
const outDir = process.env.OUT_DIR;
const evidenceFile = process.env.EVIDENCE_FILE;
if (!requestFile || !outDir || !evidenceFile) throw new Error('I4B_RETRY1_FINALIZER_ENV_MISSING');

const marker = path.join(outDir, 'PREPROVIDER_VALIDATED');
if (!fs.existsSync(marker)) throw new Error('I4B_RETRY1_PREPROVIDER_NOT_VALIDATED__GATE_MUST_REMAIN_UNCONSUMED');

const request = JSON.parse(fs.readFileSync(requestFile, 'utf8'));
const runtimeEvidence = path.join(outDir, 'evidence.json');
if (!fs.existsSync(runtimeEvidence)) {
  const fallback = {
    schemaVersion: 'cxorbia.i4b.visit-lifecycle-e2e.retry1.evidence.v1',
    generatedAt: new Date().toISOString(),
    gateId: request.gateId,
    requestId: request.requestId,
    workflowRunId: Number(process.env.GITHUB_RUN_ID || 0),
    workflowCommitSha: process.env.GITHUB_SHA || null,
    sourceHeadSha: request.sourceHeadSha,
    decision: 'HOLD_I4B_RETRY1_PROVIDER_STAGE_ENTERED__RUNTIME_EVIDENCE_MISSING',
    steps: [],
    checks: {},
    counters: {providerCommandCalls: 0, providerCommittedCalls: 0, providerWritesReported: 0},
    safety: {
      historicalShopperAccess: false,
      realHrVisitMutation: false,
      hrWrites: 0,
      rulesWrites: 0,
      storageWrites: 0,
      makeCalls: 0,
      geminiCalls: 0,
      paymentWrites: 0,
      hostingDeploys: 0,
      cloudRunDeploys: 0,
      merge: false,
      production: false
    },
    errors: ['provider stage was entered but runtime evidence file was missing']
  };
  fs.writeFileSync(runtimeEvidence, JSON.stringify(fallback, null, 2) + '\n');
}

fs.mkdirSync(path.dirname(evidenceFile), {recursive: true});
fs.copyFileSync(runtimeEvidence, evidenceFile);
const evidence = JSON.parse(fs.readFileSync(evidenceFile, 'utf8'));

request.enabled = false;
request.consumed = true;
request.executionsConsumed = 1;
request.consumedAt = new Date().toISOString();
request.status = String(evidence.decision || '').startsWith('PASS_')
  ? 'pass_consumed_provider_verified_retry1'
  : 'hold_consumed_retry1_no_automatic_retry';
request.executionResult = {
  decision: evidence.decision,
  workflowRunId: evidence.workflowRunId,
  workflowCommitSha: evidence.workflowCommitSha,
  providerCommandCalls: evidence.counters?.providerCommandCalls ?? 0,
  providerCommittedCalls: evidence.counters?.providerCommittedCalls ?? 0,
  providerWritesReported: evidence.counters?.providerWritesReported ?? 0,
  syntheticFixtureCreates: evidence.counters?.syntheticFixtureCreates ?? 0,
  syntheticFixtureDeletes: evidence.counters?.syntheticFixtureDeletes ?? 0,
  receiptDocsObserved: evidence.counters?.receiptDocsObserved ?? 0,
  auditDocsObserved: evidence.counters?.auditDocsObserved ?? 0,
  realVisitsUnchanged: evidence.checks?.realVisitsUnchanged ?? null,
  realPostulationsUnchanged: evidence.checks?.realPostulationsUnchanged ?? null,
  historicalShopperAccess: false,
  errors: evidence.errors || []
};
request.nextGate = String(evidence.decision || '').startsWith('PASS_')
  ? 'I4C_HR_BIDIRECTIONAL_SYNC_READINESS_SOURCE_IMPLEMENTATION'
  : 'HOLD_REQUIRES_ADJUDICATION_NO_AUTOMATIC_RETRY';
fs.writeFileSync(requestFile, JSON.stringify(request, null, 2) + '\n');
console.log(JSON.stringify({decision: request.status, gateConsumed: true, runtimeDecision: evidence.decision, nextGate: request.nextGate}));
