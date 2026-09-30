#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';

const CONTRACT = 'backend/contracts/c6-direct-trusted-runner-dev-v1.json';
const SERVER = 'backend/runtime/c6-direct-trusted-runner/server.mjs';
const DOCKERFILE = 'backend/runtime/c6-direct-trusted-runner/Dockerfile';
const CLOUDBUILD = 'backend/runtime/c6-direct-trusted-runner/cloudbuild.yaml';

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function fail(message, details = {}) {
  process.stdout.write(`${JSON.stringify({
    decision: 'HOLD_C6_DIRECT_RUNNER_SOURCE_GATE',
    message,
    providerBoundaryAllowed: false,
    ...details
  }, null, 2)}\n`);
  process.exit(2);
}

for (const file of [CONTRACT, SERVER, DOCKERFILE, CLOUDBUILD]) {
  if (!fs.existsSync(file)) fail('REQUIRED_FILE_MISSING', { file });
}

const contract = JSON.parse(fs.readFileSync(CONTRACT, 'utf8'));
const server = fs.readFileSync(SERVER, 'utf8');
const dockerfile = fs.readFileSync(DOCKERFILE, 'utf8');
const cloudbuild = fs.readFileSync(CLOUDBUILD, 'utf8');

const falseSafetyKeys = [
  'skip13Execution', 'authReads', 'authWrites', 'claimsReads', 'claimsWrites',
  'membershipReads', 'membershipWrites', 'hrReads', 'hrWrites',
  'firestoreReads', 'firestoreWrites', 'rulesWrites', 'storageReads',
  'storageWrites', 'providerReads', 'providerWrites', 'merge', 'production',
  'make', 'gemini', 'payments'
];

const contractOk =
  contract.schemaVersion === 'cxorbia.c6.direct-trusted-runner.dev.v1' &&
  contract.repository === 'paulaosoriof86/demoCXOrbia' &&
  contract.branch === 'docs-tya-v6-v71-audit' &&
  Number(contract.pullRequest) === 7 &&
  contract.environment === 'DEV' &&
  contract.providerProject === 'cxorbia-backend-dev' &&
  contract.region === 'us-central1' &&
  contract.service === 'cxorbia-c6-direct-runner-dev' &&
  contract.invocation?.authentication === 'cloud_run_iam_oidc' &&
  contract.invocation?.allowUnauthenticated === false &&
  contract.invocation?.providerBoundaryEnabled === false &&
  contract.idempotency?.required === true &&
  contract.idempotency?.mode === 'single_instance_memory_dev' &&
  contract.idempotency?.maxInstances === 1 &&
  contract.idempotency?.concurrency === 1 &&
  contract.idempotency?.providerSafeDurability === false &&
  contract.deployment?.authorized === true &&
  Number(contract.deployment?.maximumDeploys) === 1 &&
  contract.deployment?.hostingDeploy === false &&
  contract.deployment?.production === false &&
  falseSafetyKeys.every((key) => contract.safety?.[key] === false);

if (!contractOk) fail('CONTRACT_INVALID');

const forbiddenRuntimeTokens = [
  'firebase-admin', '@google-cloud/firestore', '@google-cloud/storage',
  'googleapis', 'hr-live', 'passwordReset', 'setCustomUserClaims',
  'createUser(', 'updateUser(', 'deleteUser('
];
for (const token of forbiddenRuntimeTokens) {
  if (server.includes(token)) fail('FORBIDDEN_RUNTIME_CAPABILITY', { token });
}

const requiredRuntimeTokens = [
  "'/health'", "'/v1/control-plane/execute'", 'SOURCE_LOCK_MISMATCH',
  'DUPLICATE_REJECTED', 'providerBoundaryAllowed: false',
  'providerReads: 0', 'providerWrites: 0'
];
for (const token of requiredRuntimeTokens) {
  if (!server.includes(token)) fail('REQUIRED_RUNTIME_GUARD_MISSING', { token });
}

if (!dockerfile.includes('USER node')) fail('NON_ROOT_CONTAINER_REQUIRED');
if (!cloudbuild.includes('backend/runtime/c6-direct-trusted-runner/Dockerfile')) {
  fail('CLOUDBUILD_DOCKERFILE_MISMATCH');
}

process.stdout.write(`${JSON.stringify({
  decision: 'PASS_C6_DIRECT_RUNNER_SOURCE_GATE',
  providerBoundaryAllowed: false,
  deploymentAuthorized: true,
  service: contract.service,
  environment: contract.environment,
  files: {
    contract: sha256(CONTRACT),
    server: sha256(SERVER),
    dockerfile: sha256(DOCKERFILE),
    cloudbuild: sha256(CLOUDBUILD)
  },
  providerReads: 0,
  providerWrites: 0,
  production: false
}, null, 2)}\n`);
