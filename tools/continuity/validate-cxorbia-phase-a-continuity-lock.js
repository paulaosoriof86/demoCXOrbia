#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const lockPath = path.join(root, 'backend', 'config', 'cxorbia-phase-a-continuity-lock.json');
const gateEvidencePath = path.join(root, 'backend', 'config', 'cxorbia-production-promotion-gate-evidence.json');
const consumedLedgerPath = path.join(root, 'backend', 'config', 'cxorbia-consumed-one-shot-gates.json');
const aliasRegistryPath = path.join(root, 'backend', 'config', 'cxorbia-evidence-aliases.json');
const liveRequestPath = path.join(root, '.github', 'cxorbia-gate-requests', 'request.json');

function fail(message) {
  console.error(`CONTINUITY_DRIFT_BLOCKED: ${message}`);
  process.exit(2);
}

function read(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (error) {
    fail(`cannot read ${path.relative(root, file)}: ${error.message}`);
  }
}

function readJson(file) {
  try {
    return JSON.parse(read(file));
  } catch (error) {
    fail(`cannot parse ${path.relative(root, file)}: ${error.message}`);
  }
}

const lock = readJson(lockPath);
const gateEvidence = readJson(gateEvidencePath);
const consumedLedger = readJson(consumedLedgerPath);
const aliasRegistry = readJson(aliasRegistryPath);
const liveRequest = readJson(liveRequestPath);

if (!lock.syncEpoch) fail('continuity lock has no syncEpoch');
if (!lock.planId) fail('continuity lock has no planId');
if (lock.resumeProtocol?.conversationIndependent !== true) fail('conversationIndependent must be true');
if (lock.resumeProtocol?.onMismatch !== 'CONTINUITY_DRIFT_BLOCKED') fail('mismatch state must fail closed');
if (lock.hardStops?.cutoverBeforeRootCauseClosedPass !== false) fail('cutoverBeforeRootCauseClosedPass must remain false');
if (lock.hardStops?.cutoverWithoutExplicitAuthorization !== false) fail('cutoverWithoutExplicitAuthorization must remain false');
if (lock.hardStops?.rebuildBeforePromotion !== false) fail('rebuildBeforePromotion must remain false');
if (lock.formalProgress?.productionIsAuthorized !== false) fail('productionIsAuthorized must remain false before G1 authorization');

const iterations = Array.isArray(lock.iterations) ? lock.iterations : [];
const expectedIds = ['I5-R1', 'I5-R2', 'I5-R3', 'I5-R4', 'I5-G1', 'I5-G2'];
if (iterations.length !== expectedIds.length) fail(`expected 6 bounded iterations, found ${iterations.length}`);
if (JSON.stringify(iterations.map((item) => item.id)) !== JSON.stringify(expectedIds)) fail('bounded iteration order changed');
const totalWeight = iterations.reduce((sum, item) => sum + Number(item.weight || 0), 0);
if (totalWeight !== 15) fail(`I5 subweights must total 15, found ${totalWeight}`);
const current = iterations.find((item) => item.id === lock.currentIteration);
if (!current) fail(`currentIteration ${lock.currentIteration} is not in bounded plan`);
if (!['ACTIVE', 'PENDING_AUTHORIZATION'].includes(current.status)) fail(`currentIteration ${lock.currentIteration} must be ACTIVE or PENDING_AUTHORIZATION, found ${current.status}`);
const completedWeight = iterations.filter((item) => item.status === 'PASS').reduce((sum, item) => sum + Number(item.weight || 0), 0);
const expectedProgress = 85 + completedWeight;
if (lock.formalProgress?.completed !== expectedProgress) fail(`formal progress ${lock.formalProgress?.completed} does not match PASS weight ${expectedProgress}`);
if (lock.formalProgress?.pending !== 100 - expectedProgress) fail('formal pending percentage is inconsistent');

for (const controlled of [gateEvidence, consumedLedger, aliasRegistry]) {
  if (controlled.syncEpoch !== lock.syncEpoch) fail('machine-readable control syncEpoch mismatch');
  if (controlled.planId && controlled.planId !== lock.planId) fail('machine-readable control planId mismatch');
}
if (gateEvidence.functionalSourceLock !== lock.functionalSourceLock) fail('functional source lock mismatch');
if (gateEvidence.productionTarget?.projectId !== lock.productionProjectId) fail('production project mismatch');

const synchronizedDocs = [
  'app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md',
  'app/docs/EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md',
  'app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md',
  'app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md',
  'app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md',
  'app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md',
  'app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md',
  'CAMBIOS-BACKEND.md',
  'RESUMEN-PARA-CLAUDE.md',
  'PENDIENTES-PROTOTIPO.md'
];

for (const rel of synchronizedDocs) {
  const content = read(path.join(root, rel));
  if (!content.includes(lock.syncEpoch)) fail(`${rel} does not contain syncEpoch ${lock.syncEpoch}`);
  if (!content.includes(lock.planId)) fail(`${rel} does not contain planId ${lock.planId}`);
  if (!content.includes(lock.currentIteration)) fail(`${rel} does not contain currentIteration ${lock.currentIteration}`);
}

for (const rel of ['CAMBIOS-BACKEND.md', 'RESUMEN-PARA-CLAUDE.md', 'PENDIENTES-PROTOTIPO.md']) {
  const content = read(path.join(root, rel));
  if (!content.includes('ACTIVE_BLOCKER: `NONE`')) fail(`${rel} must declare ACTIVE_BLOCKER NONE`);
  if (!content.includes('PREPROD_PROJECT_CREATOR_ROUTE: `SUPERSEDED`')) fail(`${rel} must mark PREPROD Project Creator route SUPERSEDED`);
}

if (consumedLedger.policy?.consumedRequestsAreImmutable !== true) fail('consumed request ledger must be immutable');
if (consumedLedger.policy?.rerunSameRequestIdAllowed !== false) fail('consumed request IDs must not be rerunnable');
const consumed = Array.isArray(consumedLedger.consumedRequests) ? consumedLedger.consumedRequests : [];
if (!consumed.length) fail('consumed request ledger is empty');
const currentLedgerEntry = consumed.find((item) => item.requestId === liveRequest.requestId);
if (currentLedgerEntry) {
  if (liveRequest.enabled !== false || liveRequest.consumed !== true) fail('live consumed request has been re-enabled');
  if (liveRequest.allowedExecutions !== liveRequest.executionsConsumed) fail('live consumed request execution count drifted');
  if (!String(liveRequest.status || '').startsWith('consumed')) fail('live request status is not terminal consumed');

  const decision = String(liveRequest.decision || '');
  const terminalPass = decision.startsWith('PASS');
  const terminalSafeHarnessHold = decision.startsWith('HOLD_') && liveRequest.productP0Proven === false;
  if (!terminalPass && !terminalSafeHarnessHold) {
    fail('live consumed request is neither PASS nor an explicit non-product terminal HOLD');
  }
  if (terminalSafeHarnessHold && !String(liveRequest.holdClassification || '').startsWith('HARNESS_')) {
    fail('non-product HOLD must be classified as HARNESS_*');
  }
  if (currentLedgerEntry.decision !== liveRequest.decision) fail('consumed ledger decision mismatch');
  if (terminalSafeHarnessHold && currentLedgerEntry.productP0Proven !== false) fail('ledger must preserve productP0Proven=false for harness HOLD');

  if (liveRequest.deployedProductSourceHeadSha !== lock.functionalSourceLock) fail('live consumed request source lock mismatch');
  for (const flag of ['repositoryWrites', 'dataWrites', 'providerWrites', 'deploy', 'merge', 'production']) {
    if (liveRequest[flag] !== false) fail(`live consumed request unexpectedly has ${flag}=true`);
    if (currentLedgerEntry[flag] !== false) fail(`ledger consumed request unexpectedly has ${flag}=true`);
  }
}

if (aliasRegistry.policy?.aliasesDoNotCreateNewWork !== true) fail('evidence aliases must not create new work');
if (aliasRegistry.policy?.namingDifferenceDoesNotAuthorizeRerun !== true) fail('evidence naming differences must not authorize reruns');
const aliases = Array.isArray(aliasRegistry.aliases) ? aliasRegistry.aliases : [];
const requiredAliases = [
  'PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY',
  'PASS_READONLY_POST_GATES',
  'PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_ADMIN_RUNTIME_READONLY',
  'PASS_I3_11C_R3C_DEV_HOSTING_MATERIALIZATION_REMOTE_PARITY'
];
for (const name of requiredAliases) {
  const item = aliases.find((entry) => entry.evidenceName === name);
  if (!item) fail(`missing canonical evidence alias ${name}`);
  if (item.rerunPolicy !== 'NO_RERUN_WITHOUT_P0_PROVEN') fail(`unsafe rerun policy for ${name}`);
}

const superseded = Array.isArray(lock.supersededRoutes) ? lock.supersededRoutes : [];
const preprodRoute = superseded.find((item) => item.id === 'PREPROD_PROJECT_CREATOR_ROUTE');
if (!preprodRoute || preprodRoute.status !== 'SUPERSEDED') fail('PREPROD Project Creator route is not durably superseded');
if (preprodRoute.replacement !== 'PROMOTE_EXISTING_CLEAN_PROJECT') fail('PREPROD replacement topology mismatch');

const validRootCauseStatuses = new Set(['PASS', 'PENDING', 'IN_REMEDIATION']);
for (const item of lock.rootCauses || []) {
  if (!item.id || !item.name || !validRootCauseStatuses.has(item.status)) {
    fail(`invalid rootCause entry ${JSON.stringify(item)}`);
  }
}

console.log('CONTINUITY_LOCK_PASS');
console.log(`syncEpoch=${lock.syncEpoch}`);
console.log(`planId=${lock.planId}`);
console.log(`currentIteration=${lock.currentIteration}`);
console.log(`formalProgress=${lock.formalProgress.completed}/100`);
console.log('conversationIndependent=true');
console.log('consumedOneShotGateLedger=PASS');
console.log('consumedTerminalHarnessHoldPolicy=PASS');
console.log('evidenceAliasRegistry=PASS');
console.log('preprodProjectCreatorRoute=SUPERSEDED');
console.log(`nextAction=${current.name}`);
