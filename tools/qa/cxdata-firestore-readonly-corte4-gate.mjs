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
const config = read('app/core/backend-config.js');
const preview = read('app/core/backend-config-preview-dev.js');
const guard = read('app/core/backend-cxdata-readonly-corte4.js');
const devHtml = read('app/index-backend-dev.html');
const prodHtml = read('app/index.html');

assert(baseline.status === 'FROZEN_ACTIVE_BASELINE', 'corte3_active_baseline_not_frozen');
assert(baseline.nextBlock === 'CORTE4_CXDATA_FIRESTORE_READONLY_NEW_EMPTY', 'baseline_next_block_mismatch');

assert(contract.status === 'READONLY_HARDENED_PROVIDER_IDENTITY_PENDING', 'contract_status_mismatch');
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

[
  "enabled: false",
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
  "preservar exactamente la interfaz pública de CX.data",
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

const opTag = '<script src="core/backend-operational-actions.js"></script>';
const guardTag = '<script src="core/backend-cxdata-readonly-corte4.js"></script>';
const bridgeTag = '<script src="core/backend-ui-action-bridge.js"></script>';
assert(count(devHtml, guardTag) === 1, 'readonly_guard_dev_tag_count_must_be_1');
assert(devHtml.indexOf(opTag) >= 0 && devHtml.indexOf(guardTag) > devHtml.indexOf(opTag), 'readonly_guard_must_load_after_operational_actions');
assert(devHtml.indexOf(bridgeTag) > devHtml.indexOf(guardTag), 'readonly_guard_must_load_before_ui_action_bridge');
assert(count(prodHtml, guardTag) === 0, 'readonly_preview_guard_must_not_be_loaded_in_production_entry');
assert(!prodHtml.includes('core/backend-config-preview-dev.js'), 'preview_backend_config_must_not_be_loaded_in_production_entry');

const report = {
  decision: 'PASS_CORTE4_READONLY_HARDENING_ACTIVATION_HOLD_PROVIDER_IDENTITY',
  activeBaseline: baseline.baselineId,
  preserveCxDataInterface: true,
  readOnly: true,
  writeMode: 'disabled',
  emptyBackendFailClosed: true,
  fallbackToMock: false,
  fallbackToLocalStorage: false,
  providerProjectId: contract.firebaseProjectId,
  providerIdentityVerified: false,
  emptyProjectVerified: false,
  activationAllowed: false,
  production: false,
  merge: false,
  writes: false,
  nextGate: 'VERIFY_NEW_CLEAN_FIREBASE_PROJECT_IDENTITY_AND_EMPTY_STATE'
};
console.log(JSON.stringify(report, null, 2));
