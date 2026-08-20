#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const lockPath = path.join(root, 'backend', 'config', 'cxorbia-phase-a-continuity-lock.json');
const gateEvidencePath = path.join(root, 'backend', 'config', 'cxorbia-production-promotion-gate-evidence.json');

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

if (!lock.syncEpoch) fail('continuity lock has no syncEpoch');
if (!lock.planId) fail('continuity lock has no planId');
if (lock.resumeProtocol?.conversationIndependent !== true) fail('conversationIndependent must be true');
if (lock.resumeProtocol?.onMismatch !== 'CONTINUITY_DRIFT_BLOCKED') fail('mismatch state must fail closed');
if (lock.hardStops?.cutoverBeforeRootCauseClosedPass !== false) fail('cutoverBeforeRootCauseClosedPass must remain false');
if (lock.hardStops?.cutoverWithoutExplicitAuthorization !== false) fail('cutoverWithoutExplicitAuthorization must remain false');
if (lock.hardStops?.rebuildBeforePromotion !== false) fail('rebuildBeforePromotion must remain false');
if (lock.formalProgress?.productionIsAuthorized !== false) fail('productionIsAuthorized must remain false before G1 authorization');
if (lock.currentIteration !== 'I5-R2') fail(`unexpected currentIteration ${lock.currentIteration}`);

const iterations = Array.isArray(lock.iterations) ? lock.iterations : [];
if (iterations.length !== 6) fail(`expected 6 bounded iterations, found ${iterations.length}`);
const r1 = iterations.find((item) => item.id === 'I5-R1');
if (!r1 || r1.status !== 'PASS' || r1.weight !== 2) fail('I5-R1 must be PASS with weight 2');
const totalWeight = iterations.reduce((sum, item) => sum + Number(item.weight || 0), 0);
if (totalWeight !== 15) fail(`I5 subweights must total 15, found ${totalWeight}`);

if (gateEvidence.syncEpoch !== lock.syncEpoch) fail('production gate evidence syncEpoch does not match continuity lock');
if (gateEvidence.functionalSourceLock !== lock.functionalSourceLock) fail('functional source lock mismatch');
if (gateEvidence.productionTarget?.projectId !== lock.productionProjectId) fail('production project mismatch');

const synchronizedDocs = [
  'app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md',
  'app/docs/EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md',
  'app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md',
  'app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md',
  'app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md',
  'app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md',
  'app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md'
];

for (const rel of synchronizedDocs) {
  const content = read(path.join(root, rel));
  if (!content.includes(lock.syncEpoch)) fail(`${rel} does not contain syncEpoch ${lock.syncEpoch}`);
  if (!content.includes(lock.planId)) fail(`${rel} does not contain planId ${lock.planId}`);
}

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
console.log('nextAction=I5-R2_CONTROL_PLANE_AND_DOCUMENT_DRIFT_CLOSURE');
