#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const contractPath = path.join(root, 'backend', 'config', 'cxorbia-production-promotion-contract.json');
const evidencePath = path.join(root, 'backend', 'config', 'cxorbia-production-promotion-gate-evidence.json');

function fail(message) {
  console.error(`BLOCKED_INTERNAL: ${message}`);
  process.exit(2);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    fail(`cannot read/parse ${path.relative(root, file)}: ${error.message}`);
  }
}

const contract = readJson(contractPath);
const evidence = readJson(evidencePath);
const required = Array.isArray(contract.requiredGates) ? contract.requiredGates : [];

if (!required.length) fail('promotion contract has no requiredGates');
if (!contract.rules || contract.rules.failClosed !== true) fail('promotion contract is not fail-closed');
if (contract.rules.sameTestedArtifact !== true) fail('sameTestedArtifact must be true');
if (contract.rules.noRebuild !== true) fail('noRebuild must be true');
if (contract.rules.rollbackRequired !== true) fail('rollbackRequired must be true');
if (contract.rules.humanApprovalRequired !== true) fail('humanApprovalRequired must be true');

const evidenceGates = evidence.gates || {};
const evidenceNames = Object.keys(evidenceGates).sort();
const requiredNames = [...required].sort();
if (JSON.stringify(evidenceNames) !== JSON.stringify(requiredNames)) {
  fail(`gate set mismatch; required=${requiredNames.join(',')} evidence=${evidenceNames.join(',')}`);
}

const authorizationGate = 'EXPLICIT_CUTOVER_AUTHORIZATION';
for (const gate of required) {
  const item = evidenceGates[gate];
  if (!item || !item.status) fail(`missing status for ${gate}`);
  if (gate !== authorizationGate && item.status !== 'PASS') {
    fail(`${gate} is ${item.status}, expected PASS`);
  }
  if (gate !== authorizationGate && !item.evidenceRef) {
    fail(`${gate} has no evidenceRef`);
  }
}

if (evidence.productionDeploymentExecuted !== false) {
  fail('evidence must remain productionDeploymentExecuted=false before cutover');
}
if (!evidence.safety || evidence.safety.productionWritesAuthorized !== false) {
  fail('productionWritesAuthorized must remain false before explicit authorization');
}

const authStatus = evidenceGates[authorizationGate].status;
if (authStatus === 'PENDING') {
  console.log('READY_FOR_EXPLICIT_AUTHORIZATION');
  console.log('technicalGates=5/5 PASS');
  console.log('cutoverAuthorization=PENDING');
  console.log('productionDeploymentAllowed=false');
  process.exit(0);
}

if (authStatus !== 'PASS') fail(`${authorizationGate} has invalid status ${authStatus}`);
if (!evidenceGates[authorizationGate].evidenceRef) fail('explicit authorization PASS requires evidenceRef');
if (evidence.safety.productionWritesAuthorized !== true) fail('authorization PASS requires productionWritesAuthorized=true');

console.log('AUTHORIZED_READY_DEPLOY');
console.log('technicalGates=5/5 PASS');
console.log('cutoverAuthorization=PASS');
console.log('productionDeploymentAllowed=true');
