#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const contractPath = 'backend/contracts/tya-dev-scenario-lab-runner-v1.json';
const schemaPath = 'backend/contracts/tya-dev-scenario-lab-evidence-schema-v1.json';
const labPath = 'app/core/dev-scenario-lab.js';
const stateMachinePath = 'tools/qa/cxorbia-runtime-state-machine.mjs';
const releaseSlicePath = 'backend/contracts/tya-phase-a-core-operations-shopper-release-slice-v1.json';
const rootEntryGatePath = 'tools/qa/tya-c6-dev-root-entrypoint-source-gate.mjs';
const rootEntryOutputPath = '.tmp/tya-dev-scenario-lab-source-contract/root-entrypoint-source-report.json';
const outputPath = process.env.CXORBIA_SCENARIO_LAB_SOURCE_GATE_OUTPUT || '.tmp/tya-dev-scenario-lab-source-contract/report.json';
const blockers = [];
const warnings = [];
const checks = [];

function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}
function exists(relative) {
  return fs.existsSync(path.join(root, relative));
}
function add(list, code, detail = null) {
  list.push(detail == null ? { code } : { code, detail });
}
function parse(relative) {
  try { return JSON.parse(read(relative)); }
  catch (error) { add(blockers, 'INVALID_JSON', { path: relative, error: error.message }); return null; }
}
function requireFile(relative) {
  if (!exists(relative)) add(blockers, 'FILE_MISSING', relative);
  else add(checks, 'FILE_PRESENT', relative);
}
function requireText(source, marker, code) {
  if (!source.includes(marker)) add(blockers, code, marker);
  else add(checks, code, marker);
}
function forbidText(source, marker, code) {
  if (source.includes(marker)) add(blockers, code, marker);
  else add(checks, code, marker);
}
function syntax(relative) {
  const result = spawnSync(process.execPath, ['--check', relative], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) add(blockers, 'SYNTAX_FAIL', { path: relative, detail: String(result.stderr || result.stdout || '').slice(0, 1200) });
  else add(checks, 'SYNTAX_PASS', relative);
}
function unique(values) {
  return new Set(values).size === values.length;
}

for (const file of [contractPath, schemaPath, labPath, stateMachinePath, releaseSlicePath, rootEntryGatePath, 'firebase.json', 'app/index-backend-dev.html', 'app/index.html']) requireFile(file);

let contract = null;
let schema = null;
let release = null;
let rootEntry = null;
if (!blockers.length) {
  contract = parse(contractPath);
  schema = parse(schemaPath);
  release = parse(releaseSlicePath);
  syntax(labPath);
  syntax(stateMachinePath);
  syntax(rootEntryGatePath);
  syntax('tools/qa/tya-dev-scenario-lab-source-contract-gate.mjs');

  const rootRun = spawnSync(process.execPath, [rootEntryGatePath], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, CXORBIA_ROOT_ENTRY_SOURCE_OUTPUT: rootEntryOutputPath },
    maxBuffer: 10 * 1024 * 1024
  });
  try {
    rootEntry = JSON.parse(String(rootRun.stdout || '').trim());
  } catch (error) {
    add(blockers, 'ROOT_ENTRYPOINT_SOURCE_GATE_OUTPUT_INVALID', {
      error: error.message,
      stderr: String(rootRun.stderr || '').slice(0, 1200)
    });
  }
  if (rootRun.status !== 0) add(blockers, 'ROOT_ENTRYPOINT_SOURCE_GATE_EXIT_NONZERO', rootRun.status);
  if (rootEntry?.decision !== 'PASS_C6_DEV_ROOT_ENTRYPOINT_SOURCE_PARITY') add(blockers, 'ROOT_ENTRYPOINT_SOURCE_GATE_NOT_PASS', rootEntry?.decision || null);
  if (rootEntry?.decision === 'PASS_C6_DEV_ROOT_ENTRYPOINT_SOURCE_PARITY') add(checks, 'ROOT_ENTRYPOINT_SOURCE_GATE_PASS', rootEntry.decision);
}

if (contract && schema && release) {
  if (contract.contractId !== 'tya-dev-scenario-lab-runner-v1') add(blockers, 'CONTRACT_ID_INVALID');
  if (contract.repository !== 'paulaosoriof86/demoCXOrbia' || contract.branch !== 'docs-tya-v6-v71-audit' || Number(contract.pullRequest) !== 7 || contract.environment !== 'DEV') add(blockers, 'CONTRACT_TARGET_INVALID');
  if (contract.releaseSlice !== 'ADMIN_OPERATIONS_AND_SHOPPER' || contract.clientPortalBlocksInitialCutover !== false) add(blockers, 'RELEASE_SLICE_INVALID');
  if (release.contractId !== 'tya-phase-a-core-operations-shopper-release-slice-v1' || release.releaseStrategy !== 'core_operations_and_shopper_first') add(blockers, 'RELEASE_SLICE_AUTHORITY_MISMATCH');

  const expectedStates = [
    'AUTH_READY','CLAIMS_READY','MEMBERSHIP_READY','DATA_READY','SHELL_READY','ROUTE_READY',
    'VIEW_READY','DOMAIN_READY','SCENARIO_READY','SCENARIO_EXECUTED','CROSS_MODULE_VERIFIED','CLEANUP_VERIFIED'
  ];
  if (JSON.stringify(contract.runtimeStateOrder) !== JSON.stringify(expectedStates)) add(blockers, 'RUNTIME_STATE_ORDER_INVALID');
  else add(checks, 'RUNTIME_STATE_ORDER_EXACT');

  const expectedProfiles = [
    'CORE_OPERATIONS_ADMIN','SHOPPER_FULL_CYCLE','CROSS_MODULE_CONSISTENCY',
    'RELOAD_NEW_TAB_STABILITY','EXPORTS_AND_VISIBLE_EVIDENCE'
  ];
  const profileIds = (contract.profiles || []).map(item => item.id);
  if (JSON.stringify(profileIds) !== JSON.stringify(expectedProfiles) || !unique(profileIds)) add(blockers, 'PROFILE_SET_INVALID', profileIds);
  else add(checks, 'PROFILE_SET_EXACT');

  const admin = contract.profiles.find(item => item.id === 'CORE_OPERATIONS_ADMIN');
  const shopper = contract.profiles.find(item => item.id === 'SHOPPER_FULL_CYCLE');
  const requiredAdminRoutes = ['dashboard','historico','visitas','postulaciones','shoppers','reservas','financiero'];
  const requiredShopperRoutes = ['miperfil','visitas','misvisitas','reservas','aprendizaje','cert','mireportes'];
  for (const route of requiredAdminRoutes) if (!admin?.requiredRoutes?.includes(route)) add(blockers, 'ADMIN_ROUTE_MISSING', route);
  for (const route of requiredShopperRoutes) if (!shopper?.requiredRoutes?.includes(route)) add(blockers, 'SHOPPER_ROUTE_MISSING', route);
  if (!blockers.some(item => /ROUTE_MISSING/.test(item.code))) add(checks, 'REQUIRED_ROUTES_PRESENT');

  const policy = contract.auditEntityPolicy || {};
  if (policy.prefix !== 'AUDIT-' || policy.syntheticOnly !== true || policy.realPiiAllowed !== false || policy.legacyDatabaseConnectionAllowed !== false || policy.directDatabaseInsertionAsNormalOperationAllowed !== false || policy.writeExecutionAuthorizedByThisContract !== false) add(blockers, 'AUDIT_ENTITY_POLICY_UNSAFE');
  else add(checks, 'AUDIT_ENTITY_POLICY_FAIL_CLOSED');

  const cleanup = contract.cleanup || {};
  if (cleanup.exactAuditIdsRequired !== true || cleanup.deleteOnlyEntitiesCreatedBySameRun !== true || cleanup.crossTenantDeletesForbidden !== true || cleanup.preexistingEntityMutationForbidden !== true || cleanup.orphansAllowed !== false || cleanup.secondRuntimeAttemptAfterCleanupFailureAllowed !== false) add(blockers, 'CLEANUP_POLICY_UNSAFE');
  else add(checks, 'CLEANUP_POLICY_EXACT');

  const currentMode = contract.currentMode || {};
  if (currentMode.sourceOnlyPreparation !== true || currentMode.runtimeExecution !== false || currentMode.browserExecution !== false || currentMode.providerReads !== false || currentMode.providerWrites !== false || currentMode.deploy !== false || currentMode.merge !== false || currentMode.production !== false) add(blockers, 'CURRENT_MODE_NOT_SOURCE_ONLY');
  else add(checks, 'CURRENT_MODE_SOURCE_ONLY');

  if (schema.$id !== 'cxorbia://contracts/tya-dev-scenario-lab-evidence-schema-v1') add(blockers, 'EVIDENCE_SCHEMA_ID_INVALID');
  const topRequired = new Set(schema.required || []);
  for (const field of contract.evidence?.requiredTopLevelFields || []) if (!topRequired.has(field)) add(blockers, 'SCHEMA_TOP_FIELD_MISSING', field);
  const decisionEnum = schema.properties?.decision?.enum || [];
  for (const decision of ['PASS_CORE_OPERATIONS_SHOPPER_SCENARIO_LAB','FAIL_CORE_OPERATIONS_SHOPPER_SCENARIO_LAB_CLEANED','P0_CORE_OPERATIONS_SHOPPER_SCENARIO_LAB_CLEANUP_FAILED']) if (!decisionEnum.includes(decision)) add(blockers, 'SCHEMA_DECISION_MISSING', decision);
  if (!blockers.some(item => item.code.startsWith('SCHEMA_'))) add(checks, 'EVIDENCE_SCHEMA_CONTRACT_ALIGNED');

  const labSource = read(labPath);
  for (const marker of expectedProfiles) requireText(labSource, `'${marker}'`, `LAB_PROFILE_${marker}`);
  requireText(labSource, "schemaVersion==='cxorbia.dev-scenario-lab.runner-evidence.v1'", 'LAB_EVIDENCE_SCHEMA_REQUIRED');
  requireText(labSource, 'baselineRestoredAfterCleanup', 'LAB_CLEANUP_FIELD_REQUIRED');
  requireText(labSource, 'CX.devScenarioLab.ingest', 'LAB_INGEST_CONTRACT_PRESENT');
  requireText(labSource, 'BLOCKED_SCENARIO_EXECUTED_AWAITING_CONTROLLED_RUNNER', 'LAB_CONTROLLED_RUNNER_MARKER_PRESENT');
  forbidText(labSource, "SCENARIO_EXECUTED:{ok:true", 'LAB_FALSE_SCENARIO_PASS_FORBIDDEN');
  forbidText(labSource, "CLEANUP_VERIFIED:{ok:true", 'LAB_FALSE_CLEANUP_PASS_FORBIDDEN');

  const stateSource = read(stateMachinePath);
  for (const marker of expectedStates.slice(0, 8)) requireText(stateSource, `'${marker}'`, `STATE_MACHINE_${marker}`);

  const routeSources = {
    dashboard: 'app/modules/dashboard.js',
    historico: 'app/modules/historico.js',
    visitas: 'app/modules/visitas.js',
    postulaciones: 'app/modules/postulaciones.js',
    shoppers: 'app/modules/shoppers.js',
    reservas: 'app/modules/reservas.js',
    financiero: 'app/modules/finanzas.js',
    miperfil: 'app/modules/shopper-perfil.js',
    misvisitas: 'app/modules/shopper-extra.js',
    aprendizaje: 'app/modules/aprendizaje.js',
    cert: 'app/modules/certificaciones.js',
    mireportes: 'app/modules/operacion-extra.js'
  };
  for (const [route, sourcePath] of Object.entries(routeSources)) {
    if (!exists(sourcePath)) {
      add(warnings, 'ROUTE_SOURCE_PATH_NOT_CONFIRMED', { route, sourcePath });
      continue;
    }
    const source = read(sourcePath);
    const regex = new RegExp(`CX\\.module\\(\\s*['\"]${route}['\"]`);
    if (!regex.test(source)) add(warnings, 'ROUTE_REGISTRATION_NOT_CONFIRMED_IN_EXPECTED_FILE', { route, sourcePath });
    else add(checks, 'ROUTE_REGISTRATION_CONFIRMED', { route, sourcePath });
  }

  const serialized = JSON.stringify({ contract, schema });
  if (/-----BEGIN .*PRIVATE KEY-----|\"private_key\"\s*:|\"type\"\s*:\s*\"service_account\"|@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/i.test(serialized)) add(blockers, 'CONTRACT_CONTAINS_SECRET_OR_PII_PATTERN');
  else add(checks, 'CONTRACT_SECRET_PII_SCAN_PASS');
}

const report = {
  schemaVersion: 'cxorbia.tya-dev-scenario-lab-source-contract-gate.v2',
  generatedAt: new Date().toISOString(),
  decision: blockers.length ? 'HOLD_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT' : 'PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT',
  blockers,
  warnings,
  checks,
  rootEntrypoint: rootEntry,
  fingerprints: {
    contractSha256: exists(contractPath) ? crypto.createHash('sha256').update(read(contractPath)).digest('hex') : null,
    evidenceSchemaSha256: exists(schemaPath) ? crypto.createHash('sha256').update(read(schemaPath)).digest('hex') : null,
    firebaseConfigSha256: exists('firebase.json') ? crypto.createHash('sha256').update(read('firebase.json')).digest('hex') : null,
    canonicalEntrypointSha256: exists('app/index-backend-dev.html') ? crypto.createHash('sha256').update(read('app/index-backend-dev.html')).digest('hex') : null
  },
  safety: {
    sourceOnly: true,
    credentialsUsed: false,
    browserExecuted: false,
    runtimeExecuted: false,
    providerReads: false,
    providerWrites: false,
    deploy: false,
    merge: false,
    production: false
  }
};

fs.mkdirSync(path.dirname(path.join(root, outputPath)), { recursive: true });
fs.writeFileSync(path.join(root, outputPath), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report, null, 2));
if (blockers.length) process.exit(1);
