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
const required = Array.isArray(contract.requiredPreCutoverGates)
  ? contract.requiredPreCutoverGates
  : [];

if (!contract.authorized) fail('promotion contract is not authorized');
if (contract.strategy !== 'PROMOTE_EXISTING_CLEAN_PROJECT') {
  fail(`unexpected promotion strategy ${contract.strategy}`);
}
if (!required.length) fail('promotion contract has no requiredPreCutoverGates');
if (contract.productionProjectId !== evidence.productionTarget?.projectId) {
  fail('production project mismatch between contract and evidence');
}
if (contract.productionHostingTarget !== evidence.productionTarget?.hostingTarget) {
  fail('hosting target mismatch between contract and evidence');
}
if (contract.productionHostingSite !== evidence.productionTarget?.hostingSite) {
  fail('hosting site mismatch between contract and evidence');
}
if (contract.productionCloudRunService !== evidence.productionTarget?.cloudRunService) {
  fail('Cloud Run service mismatch between contract and evidence');
}
if (contract.productionCloudRunRegion !== evidence.productionTarget?.cloudRunRegion) {
  fail('Cloud Run region mismatch between contract and evidence');
}
if (evidence.productionTarget?.promotesExistingCleanProject !== true) {
  fail('evidence must promote the existing clean project');
}
if (evidence.productionTarget?.createsAdditionalPreprodProject !== false) {
  fail('additional PREPROD project creation must remain false');
}
if (contract.writesAuthorizedByThisContract !== false) fail('contract unexpectedly authorizes writes');
if (contract.deployAuthorizedByThisContract !== false) fail('contract unexpectedly authorizes deploy');
if (contract.mergeAuthorizedByThisContract !== false) fail('contract unexpectedly authorizes merge');
if (contract.productionCutoverAuthorizedByThisContract !== false) fail('contract unexpectedly authorizes cutover');

const safety = evidence.safety || {};
if (safety.failClosed !== true) fail('evidence is not fail-closed');
if (safety.sameTestedArtifactRequired !== true) fail('sameTestedArtifactRequired must be true');
if (safety.noRebuild !== true) fail('noRebuild must be true');
if (safety.rollbackRequired !== true) fail('rollbackRequired must be true');
if (safety.humanApprovalRequired !== true) fail('humanApprovalRequired must be true');

const evidenceGates = evidence.gates || {};
const evidenceNames = Object.keys(evidenceGates).sort();
const requiredNames = [...required].sort();
if (JSON.stringify(evidenceNames) !== JSON.stringify(requiredNames)) {
  fail(`gate set mismatch; required=${requiredNames.join(',')} evidence=${evidenceNames.join(',')}`);
}

const authorizationGate = 'EXPLICIT_CUTOVER_AUTHORIZATION';
if (!required.includes(authorizationGate)) fail('contract is missing explicit cutover authorization gate');

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
  fail('productionDeploymentExecuted must remain false before cutover');
}

const authStatus = evidenceGates[authorizationGate].status;
if (authStatus === 'PENDING') {
  if (safety.productionWritesAuthorized !== false) fail('productionWritesAuthorized must be false while authorization is pending');
  if (safety.deploymentAuthorized !== false) fail('deploymentAuthorized must be false while authorization is pending');
  if (safety.mergeAuthorized !== false) fail('mergeAuthorized must be false while authorization is pending');
  if (safety.productionCutoverAuthorized !== false) fail('productionCutoverAuthorized must be false while authorization is pending');
  console.log('READY_FOR_EXPLICIT_AUTHORIZATION_AFTER_ROOT_CAUSE_CLOSURE');
  console.log('technicalGates=5/5 PASS');
  console.log('cutoverAuthorization=PENDING');
  console.log('productionDeploymentAllowed=false');
  process.exit(0);
}

if (authStatus !== 'PASS') fail(`${authorizationGate} has invalid status ${authStatus}`);
if (!evidenceGates[authorizationGate].evidenceRef) fail('explicit authorization PASS requires evidenceRef');
if (safety.productionWritesAuthorized !== true) fail('authorization PASS requires productionWritesAuthorized=true');
if (safety.deploymentAuthorized !== true) fail('authorization PASS requires deploymentAuthorized=true');
if (safety.productionCutoverAuthorized !== true) fail('authorization PASS requires productionCutoverAuthorized=true');

console.log('AUTHORIZED_READY_DEPLOY');
console.log('technicalGates=5/5 PASS');
console.log('cutoverAuthorization=PASS');
console.log('productionDeploymentAllowed=true');
