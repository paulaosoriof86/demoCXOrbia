#!/usr/bin/env node
/* CXOrbia · Corte 4 · CX.data Firestore read-only hardening gate.
   Validates repository contracts only. It does not connect to Firebase,
   deploy, write data, create providers or activate production. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const read = rel => fs.readFileSync(path.resolve(root, rel), 'utf8');
const fail = message => {
  console.error(`HOLD_CXDATA_FIRESTORE_READONLY_CORTE4_GATE: ${message}`);
  process.exit(1);
};
const assert = (condition, message) => { if(!condition) fail(message); };
const count = (text, token) => text.split(token).length - 1;

const contract = JSON.parse(read('backend/contracts/cxdata-firestore-readonly-corte4-v1.json'));
const baseline = JSON.parse(read('app/docs/ACTIVE-BASELINE-CORTE3-V182-20260729.json'));
const existingEvidence = JSON.parse(read('backend/config/phase-a-firebase-existing-dev-provenance-r15c-result.source-safe.json'));
const providerRequest = JSON.parse(read('.github/cxorbia-firebase-requests/corte4-new-empty.json'));
const firebaserc = JSON.parse(read('.firebaserc'));
const firebaseJson = JSON.parse(read('firebase.json'));
const config = read('app/core/backend-config.js');
const preview = read('app/core/backend-config-preview-dev.js');
const guard = read('app/core/backend-cxdata-readonly-corte4.js');
const devHtml = read('app/index-backend-dev.html');
const prodHtml = read('app/index.html');
const currentRules = read('firestore.rules');
const candidateRules = read('backend/rules/firestore.corte4-readonly.rules');

assert(baseline.status === 'FROZEN_ACTIVE_BASELINE', 'corte3_active_baseline_not_frozen');
assert(baseline.nextBlock === 'CORTE4_CXDATA_FIRESTORE_READONLY_NEW_EMPTY', 'baseline_next_block_mismatch');

assert(contract.status === 'READONLY_HARDENED_NEW_PROJECT_REQUEST_PENDING', 'contract_status_mismatch');
assert(contract.firebaseProjectId === 'cxorbia-tya-dev-260729-c4', 'new_candidate_project_id_mismatch');
assert(contract.interface.preserveExactPublicInterface === true, 'cxdata_interface_not_preserved');
assert(contract.readPolicy.readOnly === true, 'read_only_must_be_true');
assert(contract.readPolicy.writeMode === 'disabled', 'write_mode_must_be_disabled');
assert(contract.readPolicy.allowEmptyBackend === true, 'empty_backend_must_be_allowed');
assert(contract.readPolicy.failClosedOnReadError === true, 'read_errors_must_fail_closed');
assert(contract.readPolicy.fallbackToMockOnReadError === false, 'mock_fallback_must_be_false');
assert(contract.readPolicy.fallbackToLocalStorageOnEmpty === false, 'localstorage_empty_fallback_must_be_false');
assert(contract.activationAllowed === false, 'provider_activation_must_remain_blocked');
assert(contract.projectIdentityVerified === false && contract.emptyProjectVerified === false, 'provider_identity_must_remain_pending');
assert(Object.values(contract.writePolicy).every(value => value === false), 'all_write_policy_flags_must_be_false');
assert(contract.identityRules.noLegacyDatabaseConnection === true, 'legacy_database_connection_must_be_forbidden');
assert(contract.identityRules.noLegacyDatabaseCopy === true, 'legacy_database_copy_must_be_forbidden');

const excluded = contract.excludedExistingProjects?.find(item => item.projectId === 'cxorbia-backend-dev');
assert(excluded && excluded.reuseAllowed === false, 'existing_nonempty_project_must_be_excluded');
assert(existingEvidence.target?.projectId === 'cxorbia-backend-dev', 'existing_project_evidence_target_mismatch');
assert(existingEvidence.firestore?.projects > 0 && existingEvidence.firestore?.shoppers > 0, 'existing_project_nonempty_evidence_missing');
assert(existingEvidence.summary?.readOnlyCxDataGateEligible === true, 'existing_project_provenance_evidence_invalid');

assert(providerRequest.schemaVersion === 'cxorbia.firebase-new-empty-request.v1', 'provider_request_schema_mismatch');
assert(providerRequest.enabled === true, 'provider_request_not_enabled');
assert(providerRequest.targetProjectId === contract.firebaseProjectId, 'provider_request_target_mismatch');
assert(providerRequest.reuseExistingProject === false, 'provider_request_must_forbid_existing_reuse');
assert(providerRequest.connectLegacyDatabase === false && providerRequest.copyLegacyDatabase === false, 'provider_request_must_forbid_legacy');
assert(providerRequest.allowedProviderWrites?.projectCreate === true && providerRequest.allowedProviderWrites?.firebaseAdd === true, 'atomic_create_scope_missing');
for (const key of ['billingLink','authWrites','firestoreWrites','storageWrites','rulesDeploy','hostingDeploy','functionsDeploy','imports','dataMigration']) {
  assert(providerRequest.allowedProviderWrites?.[key] === false, `forbidden_provider_write_enabled:${key}`);
}

assert(firebaserc.projects?.default === 'cxorbia-backend-dev', 'current_firebaserc_identity_unexpected');
assert(firebaserc.projects?.dev === 'cxorbia-backend-dev', 'current_firebaserc_dev_identity_unexpected');
assert(firebaserc.projects?.default !== contract.firebaseProjectId, 'candidate_must_not_be_mapped_before_verification');
assert(contract.repositoryMapping.matchesCandidate === false && contract.repositoryMapping.mappingChangeAllowed === false, 'repository_mapping_must_remain_blocked');
assert(firebaseJson.firestore?.rules === 'firestore.rules', 'firebase_json_rules_pointer_unexpected');
assert(contract.rulesCandidate.path === 'backend/rules/firestore.corte4-readonly.rules', 'candidate_rules_path_mismatch');
assert(contract.rulesCandidate.deployed === false, 'candidate_rules_must_not_be_deployed');
assert(contract.rulesCandidate.firebaseJsonPointsToCandidate === false, 'firebase_json_must_not_point_to_candidate_yet');
assert(contract.currentRepositoryRules.readOnlyCompatible === false, 'current_rules_must_be_classified_not_readonly');
assert(currentRules.includes('allow create, update') || currentRules.includes('allow create, update, delete'), 'current_rules_write_paths_not_detected');

[
  "enabled: false",
  "projectId: 'cxorbia-tya-dev-260729-c4'",
  "authDomain: 'cxorbia-tya-dev-260729-c4.firebaseapp.com'",
  "storageBucket: 'cxorbia-tya-dev-260729-c4.firebasestorage.app'",
  "excludedFirebaseProjectIds: ['cxorbia-backend-dev']",
  "readOnly: true",
  "writeMode: 'disabled'",
  "enableDataWrites: false",
  "enableOperationalWrites: false",
  "allowEmptyBackend: true",
  "failClosedOnReadError: true",
  "preserveCxDataInterface: true",
  "newCleanProjectRequired: true",
  "projectIdentityVerified: false",
  "emptyProjectVerified: false",
  "apiKey: null",
  "messagingSenderId: null",
  "appId: null"
].forEach(token => assert(config.includes(token), `backend_config_missing:${token}`));

[
  "readOnly: true",
  "writeMode: 'disabled'",
  "enableDataWrites: false",
  "enableOperationalWrites: false",
  "allowEmptyBackend: true",
  "failClosedOnReadError: true",
  "preserveCxDataInterface: true"
].forEach(token => assert(preview.includes(token), `preview_config_missing:${token}`));

[
  "preserveCxDataInterface:true",
  "writeMode:'disabled'",
  "CX.data.__corte4Readonly = true",
  "CX.backend.writeProject = async function()",
  "CX.backend.writeShopper = async function()",
  "CX.backend.writeVisit = async function()",
  "ns.writesAllowed = function(){ return false; }",
  "clearToBackendEmpty('verified-empty-read')",
  "clearToBackendEmpty('read-error-fail-closed')",
  "fallbackUsed:false"
].forEach(token => assert(guard.includes(token), `readonly_guard_missing:${token}`));

[
  "allow read, write: if false;",
  "allow create, update, delete: if false;",
  "operator read only",
  "No deployment or provider activation is authorized"
].forEach(token => assert(candidateRules.includes(token), `candidate_rules_missing:${token}`));
assert(!candidateRules.includes('allow create: if true'), 'candidate_rules_create_true_forbidden');
assert(!candidateRules.includes('allow update: if true'), 'candidate_rules_update_true_forbidden');
assert(!candidateRules.includes('allow delete: if true'), 'candidate_rules_delete_true_forbidden');

const opTag = '<script src="core/backend-operational-actions.js"></script>';
const guardTag = '<script src="core/backend-cxdata-readonly-corte4.js"></script>';
const bridgeTag = '<script src="core/backend-ui-action-bridge.js"></script>';
assert(count(devHtml, guardTag) === 1, 'readonly_guard_dev_tag_count_must_be_1');
assert(devHtml.indexOf(opTag) >= 0 && devHtml.indexOf(guardTag) > devHtml.indexOf(opTag), 'readonly_guard_must_load_after_operational_actions');
assert(devHtml.indexOf(bridgeTag) > devHtml.indexOf(guardTag), 'readonly_guard_must_load_before_ui_action_bridge');
assert(count(prodHtml, guardTag) === 0, 'readonly_preview_guard_must_not_be_loaded_in_production_entry');
assert(!prodHtml.includes('core/backend-config-preview-dev.js'), 'preview_backend_config_must_not_be_loaded_in_production_entry');

const report = {
  decision: 'PASS_CORTE4_READONLY_HARDENING_NEW_PROJECT_REQUEST_PENDING',
  activeBaseline: baseline.baselineId,
  preserveCxDataInterface: true,
  readOnly: true,
  writeMode: 'disabled',
  emptyBackendFailClosed: true,
  fallbackToMock: false,
  fallbackToLocalStorage: false,
  providerProjectId: contract.firebaseProjectId,
  excludedExistingProjectId: 'cxorbia-backend-dev',
  excludedExistingProjectNonempty: true,
  providerRequestPrepared: true,
  providerRequestResultObserved: false,
  providerIdentityVerified: false,
  emptyProjectVerified: false,
  currentRepositoryMappingStillExistingDev: true,
  currentRulesReadOnlyCompatible: false,
  candidateRulesPrepared: true,
  candidateRulesDeployed: false,
  activationAllowed: false,
  production: false,
  merge: false,
  writes: false,
  nextGate: 'OBSERVE_ATOMIC_NEW_PROJECT_RESULT_VERIFY_EMPTY_THEN_AUTHORIZE_DEV_RULES_DEPLOY'
};
console.log(JSON.stringify(report, null, 2));
