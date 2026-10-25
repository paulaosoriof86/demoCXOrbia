#!/usr/bin/env node
/* CXOrbia Phase A - static validation of Firebase DEV read-only clean-state gate.
   This validator performs no provider calls and uses no credentials. */

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;

const files = {
  contract: 'backend/contracts/phase-a-firebase-dev-clean-state-read-only-gate-v1.json',
  config: 'backend/config/phase-a-firebase-dev-clean-state-read-only.source-safe.json',
  runner: 'tools/release/tya-firebase-dev-clean-state-read-only.mjs',
  manualWorkflow: '.github/workflows/cxorbia-firebase-dev-clean-state-read-only-run.yml',
  staticWorkflow: '.github/workflows/cxorbia-firebase-dev-clean-state-read-only-gate.yml',
  firebaserc: '.firebaserc',
  firebaseJson: 'firebase.json'
};

const hardFails = [];
const warnings = [];
const info = [];
const add = (list, message, extra = {}) => list.push({ message, ...extra });
const absolute = rel => path.join(root, rel);
const exists = rel => fs.existsSync(absolute(rel));
const read = rel => fs.readFileSync(absolute(rel), 'utf8');
const readJson = rel => JSON.parse(read(rel));

for (const [label, rel] of Object.entries(files)) {
  if (!exists(rel)) add(hardFails, 'required_file_missing', { label, file: rel });
  else add(info, 'required_file_present', { label, file: rel });
}

let contract;
let config;
let firebaserc;
let firebaseJson;
for (const [label, rel] of [['contract', files.contract], ['config', files.config], ['firebaserc', files.firebaserc], ['firebaseJson', files.firebaseJson]]) {
  if (!exists(rel)) continue;
  try {
    const value = readJson(rel);
    if (label === 'contract') contract = value;
    if (label === 'config') config = value;
    if (label === 'firebaserc') firebaserc = value;
    if (label === 'firebaseJson') firebaseJson = value;
    add(info, 'json_valid', { label, file: rel });
  } catch (error) {
    add(hardFails, 'json_invalid', { label, file: rel, error: String(error.message || error) });
  }
}

const runner = exists(files.runner) ? read(files.runner) : '';
const manualWorkflow = exists(files.manualWorkflow) ? read(files.manualWorkflow) : '';
const staticWorkflow = exists(files.staticWorkflow) ? read(files.staticWorkflow) : '';
const confirmation = 'VERIFY_FIREBASE_DEV_READ_ONLY';

if (contract) {
  if (contract.status !== 'prepared_manual_provider_read_blocked') add(hardFails, 'contract_status_not_blocked', { actual: contract.status });
  if (contract.executionGate?.mode !== 'manual_workflow_dispatch_only') add(hardFails, 'contract_execution_mode_not_manual');
  if (contract.executionGate?.exactConfirmation !== confirmation) add(hardFails, 'contract_confirmation_mismatch');
  if (contract.executionGate?.currentAuthorization !== false) add(hardFails, 'contract_must_not_claim_authorization');
  if (contract.executionGate?.providerCallsBeforeAuthorization !== 'blocked') add(hardFails, 'provider_calls_not_blocked');
  const expectedFalse = ['providerCallsExecuted', 'authUsersCreated', 'claimsWritten', 'firestoreReadsExecuted', 'firestoreWrites', 'storageReadsExecuted', 'storageWrites', 'functionReadsExecuted', 'rulesDeployed', 'imports', 'deploy', 'production', 'containsSecrets', 'containsSensitiveData'];
  for (const key of expectedFalse) if (contract.safeState?.[key] !== false) add(hardFails, 'contract_safe_state_invalid', { key, actual: contract.safeState?.[key] });
  for (const action of ['createAuthUser', 'setCustomClaims', 'writeFirestoreDocument', 'deployFirestoreRules', 'uploadStorageObject', 'createOrUpdateFunction', 'deployHosting', 'productionAccess']) {
    if (!contract.prohibitedActions?.includes(action)) add(hardFails, 'prohibited_action_missing', { action });
  }
  for (const decision of ['CLEAN_STATE_VERIFIED_READ_ONLY', 'NONEMPTY_REVIEW_REQUIRED', 'INCONCLUSIVE_PERMISSION_OR_API', 'TARGET_MISMATCH_HARD_STOP']) {
    if (!contract.decisionModel?.[decision]) add(hardFails, 'decision_model_missing', { decision });
  }
}

if (config) {
  if (config.status !== 'prepared_not_executed') add(hardFails, 'config_status_not_prepared', { actual: config.status });
  if (config.target?.projectId !== 'cxorbia-backend-dev') add(hardFails, 'config_project_mismatch', { actual: config.target?.projectId });
  if (config.target?.storageBucket !== 'cxorbia-backend-dev.firebasestorage.app') add(hardFails, 'config_bucket_mismatch', { actual: config.target?.storageBucket });
  if (config.execution?.providerRunAuthorized !== false) add(hardFails, 'config_must_not_claim_provider_authorization');
  if (config.execution?.manualOnly !== true) add(hardFails, 'config_manual_only_missing');
  if (config.execution?.exactConfirmation !== confirmation) add(hardFails, 'config_confirmation_mismatch');
  if (config.expectedBeforeExecution?.assertedAsVerified !== false) add(hardFails, 'expected_counts_must_not_be_asserted_verified');
  if (config.report?.allowedArtifactPath !== '.tmp/firebase-dev-clean-state-read-only-report') add(hardFails, 'artifact_path_not_sanitized_report_only');
}

if (firebaserc && firebaserc.projects?.default !== 'cxorbia-backend-dev') add(hardFails, 'firebaserc_default_not_dev', { actual: firebaserc.projects?.default });
if (firebaseJson && firebaseJson.hosting?.public !== 'app') add(hardFails, 'firebase_hosting_public_not_app', { actual: firebaseJson.hosting?.public });

if (runner) {
  const requiredTerms = [
    confirmation,
    'auth.listUsers(1000',
    'db.listCollections()',
    'collection.limit(1).select().get()',
    'bucket.getFiles({ autoPaginate: false, maxResults: 1 })',
    'identitytoolkit.googleapis.com/admin/v2/projects/',
    'cloudfunctions.googleapis.com/v2/projects/',
    'firestore.googleapis.com/v1/projects/',
    'firebaserules.googleapis.com/v1/projects/',
    "method: 'GET'",
    'NONEMPTY_REVIEW_REQUIRED',
    'INCONCLUSIVE_PERMISSION_OR_API',
    'TARGET_MISMATCH_HARD_STOP',
    'piiOutput: false',
    'credentialsOutput: false'
  ];
  for (const term of requiredTerms) if (!runner.includes(term)) add(hardFails, 'runner_required_term_missing', { term });

  const forbiddenPatterns = [
    { id: 'auth_create_user', re: /\.createUser\s*\(/ },
    { id: 'auth_update_user', re: /\.updateUser\s*\(/ },
    { id: 'auth_delete_user', re: /\.deleteUser\s*\(/ },
    { id: 'claims_write', re: /setCustomUserClaims\s*\(/ },
    { id: 'firestore_set', re: /\.(set|create|update|delete)\s*\([^)]*\)/ },
    { id: 'storage_upload', re: /\.(upload|save|delete)\s*\(/ },
    { id: 'http_write_method', re: /method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/i },
    { id: 'firebase_deploy', re: /firebase(?:-tools)?[^\n]{0,60}\bdeploy\b/i },
    { id: 'function_invoke', re: /httpsCallable\s*\(|\.call\s*\(/ }
  ];
  for (const item of forbiddenPatterns) if (item.re.test(runner)) add(hardFails, 'runner_forbidden_write_pattern', { pattern: item.id });
}

if (manualWorkflow) {
  if (!/^\s*workflow_dispatch\s*:/m.test(manualWorkflow)) add(hardFails, 'manual_workflow_dispatch_missing');
  if (/^\s*(push|pull_request|schedule)\s*:/m.test(manualWorkflow)) add(hardFails, 'manual_workflow_has_automatic_trigger');
  for (const term of [confirmation, 'FIREBASE_SERVICE_ACCOUNT_CXORBIA_BACKEND_DEV', 'CXORBIA_CONFIRM', 'GOOGLE_APPLICATION_CREDENTIALS', 'firebase-dev-clean-state-read-only-report', 'Cleanup temporary credential']) {
    if (!manualWorkflow.includes(term)) add(hardFails, 'manual_workflow_required_term_missing', { term });
  }
  if (/firebase(?:-tools)?[^\n]{0,60}\bdeploy\b/i.test(manualWorkflow)) add(hardFails, 'manual_workflow_contains_deploy');
  if (/\bgcloud\b[^\n]{0,100}\b(create|update|delete|deploy|functions call)\b/i.test(manualWorkflow)) add(hardFails, 'manual_workflow_contains_write_command');
  if (/path:\s*\.tmp\s*$/m.test(manualWorkflow)) add(hardFails, 'manual_workflow_uploads_entire_tmp');
}

if (staticWorkflow) {
  if (!staticWorkflow.includes('workflow_dispatch:')) add(hardFails, 'static_workflow_dispatch_missing');
  if (!staticWorkflow.includes('tya-firebase-dev-clean-state-read-only-gate-validate.mjs')) add(hardFails, 'static_workflow_validator_missing');
  if (staticWorkflow.includes('FIREBASE_SERVICE_ACCOUNT_CXORBIA_BACKEND_DEV')) add(hardFails, 'static_workflow_must_not_reference_provider_secret');
  if (staticWorkflow.includes('tya-firebase-dev-clean-state-read-only.mjs --out')) add(hardFails, 'static_workflow_must_not_execute_provider_runner');
}

const report = {
  gate: 'cxorbia-firebase-dev-clean-state-read-only-static-gate',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_FIREBASE_DEV_READ_ONLY_GATE' : 'GO_SAFE_FIREBASE_DEV_READ_ONLY_GATE_PREPARED_NOT_EXECUTED',
  hardFailCount: hardFails.length,
  warningCount: warnings.length,
  executionAuthorization: false,
  safeState: {
    providerCalls: false,
    credentialsUsed: false,
    authReads: false,
    authWrites: false,
    firestoreReads: false,
    firestoreWrites: false,
    storageReads: false,
    storageWrites: false,
    functionReads: false,
    functionWritesOrInvocations: false,
    rulesDeploy: false,
    hostingDeploy: false,
    imports: false,
    production: false
  },
  hardFails,
  warnings,
  info
};

if (outDir) {
  const out = path.join(root, outDir);
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'firebase-dev-clean-state-read-only-static-gate-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia Firebase DEV clean-state read-only static gate',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Hard fails: ${report.hardFailCount}`,
    `Warnings: ${report.warningCount}`,
    `Execution authorization: ${report.executionAuthorization}`,
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.file ? ` · ${x.file}` : ''}${x.term ? ` · ${x.term}` : ''}${x.pattern ? ` · ${x.pattern}` : ''}`) : ['- none']),
    '',
    '## Safe state',
    '- Static validation only',
    '- No provider calls or credentials',
    '- No Auth, Firestore, Storage or Functions reads/writes',
    '- No rules or Hosting deploy',
    '- No imports or production',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(out, 'firebase-dev-clean-state-read-only-static-gate-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
