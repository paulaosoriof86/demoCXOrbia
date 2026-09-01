#!/usr/bin/env node
/* CXOrbia TyA - post-V96 DEV Auth/Firestore activation readiness.
   Safe-only: no Firebase/Auth/Firestore/provider calls. Optional --out writes local reports only. */

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;
const hardFails = [];
const warnings = [];
const info = [];
const blockers = [
  'new_clean_firebase_dev_project_not_configured',
  'auth_provider_not_configured',
  'test_users_not_created',
  'custom_claims_not_written',
  'firestore_rules_not_deployed',
  'protected_reads_not_enabled',
  'firestore_writes_not_authorized',
  'cx_data_runtime_switch_not_authorized',
  'real_import_not_authorized',
  'visual_smoke_by_role_pending',
  'production_go_not_authorized'
];

const files = {
  readiness: 'backend/contracts/phase-a-dev-auth-firestore-activation-readiness-post-v96-v1.json',
  config: 'backend/config/phase-a-dev-auth-firestore-activation-readiness-post-v96.source-safe.json',
  sourceLock: 'app/docs/SOURCE-LOCK-EMPALME-PROTOTIPO-POST-V96-20260710.md',
  auth: 'backend/contracts/auth-rbac-phase-a-v1.json',
  taxonomy: 'backend/contracts/phase-a-role-taxonomy-org-scope-v1.json',
  personaConfig: 'backend/config/phase-a-role-taxonomy-personas.source-safe.json',
  claims: 'backend/contracts/phase-a-auth-dev-claims-taxonomy-seed-v2.json',
  claimsConfig: 'backend/config/phase-a-auth-dev-claims-taxonomy-seed.source-safe.json',
  schema: 'backend/contracts/phase-a-protected-firestore-schema-dev-readiness-v1.json',
  rulesContract: 'backend/contracts/phase-a-protected-firestore-rules-dev-draft-v1.json',
  rules: 'backend/rules/firestore.phase-a-protected-dev.rules.draft',
  candidates: 'backend/contracts/phase-a-hr-source-safe-to-protected-candidates-v1.json',
  moduleReadiness: 'backend/contracts/phase-a-module-readiness-matrix-v1.json',
  projectSeed: 'backend/config/tya-phase-a-platform-project-config.source-safe.json',
  connectionGate: 'backend/contracts/phase-a-real-connection-readiness-gate-v1.json'
};

const add = (list, message, extra = {}) => list.push({ message, ...extra });
const abs = (rel) => path.join(root, rel);
const exists = (rel) => fs.existsSync(abs(rel));
const read = (rel) => fs.readFileSync(abs(rel), 'utf8');
const loadJson = (key, rel) => {
  if (!exists(rel)) { add(hardFails, 'required_file_missing', { key, file: rel }); return null; }
  try { const value = JSON.parse(read(rel)); add(info, 'json_valid', { key, file: rel }); return value; }
  catch (error) { add(hardFails, 'json_invalid', { key, file: rel, error: String(error.message || error) }); return null; }
};
const mustContain = (source, required, label) => required.forEach((value) => {
  if (!Array.isArray(source) || !source.includes(value)) add(hardFails, `${label}_missing`, { value });
});
const mustBeFalse = (obj, keys, label) => keys.forEach((key) => {
  if (obj?.[key] !== false) add(hardFails, `${label}_must_be_false`, { key, actual: obj?.[key] });
});

const loaded = {};
for (const [key, rel] of Object.entries(files)) {
  if (rel.endsWith('.json')) loaded[key] = loadJson(key, rel);
  else if (!exists(rel)) add(hardFails, 'required_file_missing', { key, file: rel });
  else { loaded[key] = read(rel); add(info, 'text_file_present', { key, file: rel }); }
}

const roles = ['tenantAdmin', 'projectAdmin', 'financeAdmin', 'certificationAdmin', 'clientAdmin', 'clientViewer', 'shopper'];
const personas = ['tenantOwner', 'franchiseOwner', 'countryRepresentative', 'operationsCoordinator', 'projectCoordinator', 'fieldRepresentative', 'financeOperator', 'certificationOperator', 'clientBrandAdmin', 'clientBrandViewer', 'shopperEvaluator'];
const requiredClaims = ['tenantId', 'role', 'personaType', 'scope', 'permissionsVersion'];

if (loaded.readiness) {
  if (loaded.readiness.status !== 'draft_safe_not_connected') add(hardFails, 'readiness_status_not_safe');
  mustBeFalse(loaded.readiness.safeState, Object.keys(loaded.readiness.safeState || {}), 'readiness_safe_state');
  mustContain(loaded.readiness.claimModel?.required, requiredClaims, 'readiness_claim');
  mustContain(loaded.readiness.claimModel?.technicalRolesPhaseA, roles, 'readiness_role');
  for (const key of ['unknownRolePolicy', 'unknownPersonaPolicy', 'missingScopePolicy', 'missingTenantPolicy']) {
    if (loaded.readiness.claimModel?.[key] !== 'deny') add(hardFails, 'readiness_not_fail_closed', { key });
  }
  if (loaded.readiness.sourceLock?.productionGo !== false) add(hardFails, 'source_lock_must_not_be_production_go');
  if (loaded.readiness.tenantProjectSeed?.tenantId !== 'tya' || loaded.readiness.tenantProjectSeed?.projectId !== 'cinepolis') add(hardFails, 'tya_cinepolis_seed_invalid');
  if (loaded.readiness.tenantProjectSeed?.hardcodedGlobalLogic !== false || loaded.readiness.tenantProjectSeed?.periodIsProjectFilter !== true) add(hardFails, 'project_period_or_hardcode_policy_invalid');
  if (loaded.readiness.phaseADomains?.certifications?.carryoverRequired !== true) add(hardFails, 'certification_carryover_missing');
  if (loaded.readiness.phaseADomains?.liquidationsPayments?.june !== 'payment_and_liquidation_control_not_pending_visits') add(hardFails, 'june_payment_control_policy_invalid');
  if (loaded.readiness.phaseADomains?.reviewQueue?.silentOverwrite !== false) add(hardFails, 'silent_overwrite_must_be_false');
}

if (loaded.config) {
  if (loaded.config.status !== 'source_safe_readiness_only_not_connected') add(hardFails, 'config_status_not_safe');
  mustBeFalse(loaded.config.activationFlags, Object.keys(loaded.config.activationFlags || {}), 'activation_flag');
  mustContain(loaded.config.requiredTechnicalRoles, roles, 'config_role');
  mustContain(loaded.config.requiredProtectedDomains, ['shopperProtectedProfiles', 'shopperIdentityLinks', 'certificationAttempts', 'certificationCarryovers', 'protectedLiquidations', 'protectedPaymentBatches', 'reviewQueue', 'protectedReadAudit'], 'protected_domain');
  mustContain(loaded.config.requiredSourceSafeCandidateGroups, ['shopperPublicRefs', 'shopperIdentityLinkCandidates', 'certificationCarryoverCandidates', 'protectedLiquidationCandidates', 'protectedPaymentBatchCandidates', 'reviewQueueCandidates', 'auditEventCandidates'], 'candidate_group');
  if (loaded.config.environment?.projectId !== null || loaded.config.environment?.legacyProjectAllowed !== false) add(hardFails, 'dev_environment_must_remain_unconfigured_and_new');
  if (loaded.config.safety?.sourceSafe !== true) add(hardFails, 'config_not_source_safe');
  mustBeFalse(loaded.config.safety, ['containsSecrets', 'containsSensitiveData', 'containsRawEmails', 'containsPasswords', 'containsRawHr', 'containsBankData', 'containsDpi', 'containsPrivateUrls'], 'config_safety');
}

if (loaded.auth) {
  mustContain(loaded.auth.identityModel?.requiredKeys, ['tenantId', 'userId', ...requiredClaims.slice(1)], 'auth_claim');
  roles.forEach((role) => { if (loaded.auth.roles?.[role]?.phaseA !== true) add(hardFails, 'auth_role_missing', { role }); });
  if (loaded.auth.identityModel?.unknownRolePolicy !== 'deny' || loaded.auth.identityModel?.unknownPersonaPolicy !== 'deny' || loaded.auth.identityModel?.missingScopePolicy !== 'deny') add(hardFails, 'auth_not_fail_closed');
  if (loaded.auth.personaRolePolicy?.countryRepresentative !== 'projectAdmin') add(hardFails, 'country_representative_not_project_admin', { source: 'auth' });
  if (!loaded.auth.routeAccessMatrix?.clientPortal?.includes('clientAdmin') || !loaded.auth.routeAccessMatrix?.clientPortal?.includes('clientViewer')) add(hardFails, 'client_portal_roles_missing');
}

if (loaded.taxonomy) {
  roles.forEach((role) => { if (loaded.taxonomy.technicalRoles?.[role]?.phaseA !== true) add(hardFails, 'taxonomy_role_missing', { role }); });
  if (loaded.taxonomy.personaTypes?.countryRepresentative?.mapsToRole !== 'projectAdmin') add(hardFails, 'country_representative_not_project_admin', { source: 'taxonomy' });
  if (loaded.taxonomy.failClosedPolicy?.unknownTechnicalRole !== 'deny' || loaded.taxonomy.failClosedPolicy?.unknownPersonaType !== 'deny' || loaded.taxonomy.failClosedPolicy?.missingScope !== 'deny') add(hardFails, 'taxonomy_not_fail_closed');
}

if (loaded.claims) {
  mustContain(loaded.claims.claimShape?.required, requiredClaims, 'claims_contract_claim');
  if (loaded.claims.personaToTechnicalRole?.countryRepresentative !== 'projectAdmin') add(hardFails, 'country_representative_not_project_admin', { source: 'claims' });
}

const maps = [];
if (loaded.auth?.personaRolePolicy) maps.push(['auth', loaded.auth.personaRolePolicy]);
if (loaded.taxonomy?.personaTypes) maps.push(['taxonomy', Object.fromEntries(Object.entries(loaded.taxonomy.personaTypes).map(([k, v]) => [k, v.mapsToRole]))]);
if (loaded.claims?.personaToTechnicalRole) maps.push(['claims', loaded.claims.personaToTechnicalRole]);
if (loaded.personaConfig?.personaTemplates) maps.push(['personaConfig', Object.fromEntries(loaded.personaConfig.personaTemplates.map((x) => [x.personaType, x.role]))]);
if (loaded.claimsConfig?.templates) maps.push(['claimsConfig', Object.fromEntries(loaded.claimsConfig.templates.map((x) => [x.personaType, x.role]))]);
personas.forEach((persona) => {
  const values = maps.map(([source, map]) => ({ source, role: map?.[persona] })).filter((x) => x.role && !String(x.role).includes('explicit_'));
  const unique = [...new Set(values.map((x) => x.role))];
  if (!values.length) add(hardFails, 'persona_missing', { persona });
  else if (unique.length !== 1) add(hardFails, 'persona_role_inconsistent', { persona, values });
});

if (loaded.schema) {
  mustBeFalse(loaded.schema.safeState, ['firestoreConnected', 'frontendConnected', 'writesEnabled', 'importsEnabled', 'productionEnabled', 'containsSecrets', 'containsSensitiveData'], 'schema_safe_state');
  ['shopperProtectedProfiles', 'shopperIdentityLinks', 'certificationAttempts', 'certificationCarryovers', 'protectedLiquidations', 'protectedPaymentBatches', 'protectedReadAudit', 'reviewQueue'].forEach((collection) => {
    if (!loaded.schema.collections?.[collection]) add(hardFails, 'protected_collection_missing', { collection });
  });
}

if (loaded.rulesContract) mustBeFalse(loaded.rulesContract.safeState, ['rulesDeployed', 'authEnabled', 'frontendConnected', 'writesEnabled', 'importsEnabled', 'paymentStateWritesEnabled', 'productionEnabled', 'containsSecrets', 'containsSensitiveData'], 'rules_safe_state');
if (typeof loaded.rules === 'string') {
  if (!/Draft only:\s*do not deploy/i.test(loaded.rules)) add(hardFails, 'rules_missing_do_not_deploy_banner');
  if (/allow\s+(create|update|delete|write)[^;]*:\s*if\s+true\s*;/i.test(loaded.rules)) add(hardFails, 'rules_contain_open_write');
  const denials = loaded.rules.match(/allow\s+create,\s*update,\s*delete:\s*if\s+false\s*;/g) || [];
  if (denials.length < 6) add(warnings, 'rules_write_denials_lower_than_expected', { count: denials.length });
}

if (loaded.candidates) {
  if (loaded.candidates.safeState?.usesSourceSafeInputOnly !== true) add(hardFails, 'candidates_not_source_safe_only');
  mustBeFalse(loaded.candidates.safeState, ['readsLiveHr', 'firestoreConnected', 'authConnected', 'writesEnabled', 'importsEnabled', 'productionEnabled', 'containsSensitiveData', 'containsSecrets'], 'candidates_safe_state');
  ['shopperPublicRefs', 'shopperIdentityLinkCandidates', 'certificationCarryoverCandidates', 'protectedLiquidationCandidates', 'protectedPaymentBatchCandidates', 'reviewQueueCandidates', 'auditEventCandidates'].forEach((group) => {
    if (loaded.candidates.outputCandidateGroups?.[group]?.writeStatus !== 'not_written') add(hardFails, 'candidate_group_not_blocked', { group });
  });
}

if (loaded.moduleReadiness) mustContain(loaded.moduleReadiness.requiredModules, ['usersRolesScopes', 'shoppersProtectedProfiles', 'certificationsCarryover', 'liquidationsPayments', 'reviewQueueConflicts', 'auditEvents', 'integrationsGates', 'cxDataBackendSwitch'], 'module_readiness');
if (loaded.projectSeed) {
  const project = (loaded.projectSeed.projects || []).find((x) => x.tenantId === 'tya' && x.projectId === 'cinepolis');
  if (!project) add(hardFails, 'cinepolis_seed_missing');
  else {
    if (project.periods?.projectSelectorMustNotContainPeriod !== true) add(hardFails, 'project_period_separation_missing');
    if (project.certification?.mode !== 'preserve_existing_presented_certifications') add(hardFails, 'carryover_seed_policy_missing');
    if (project.payments?.juneIsPaymentControlNotVisitsToRepeat !== true) add(hardFails, 'june_seed_policy_missing');
    ['make', 'gemini', 'hrWriteback'].forEach((gate) => { if (!String(project.integrations?.[gate] || '').includes('gate_off')) add(hardFails, 'project_gate_not_off', { gate }); });
  }
}
if (loaded.connectionGate) {
  mustBeFalse(loaded.connectionGate.safeState, ['connectsToRealDatabase', 'writesFirestore', 'writesAuth', 'importsRealData', 'deploysRules', 'productionEnabled', 'containsSecrets', 'containsSensitiveData'], 'connection_gate_safe_state');
  mustContain(loaded.connectionGate.mustPassBeforeAnyRealConnection, ['roleTaxonomyComplete', 'authClaimsSeedReady', 'protectedReadAccessPolicyReady', 'sourceSafeToProtectedCandidatesReady', 'certificationCarryoverPathReady', 'liquidationPaymentPreviewPathReady', 'reviewQueuePathReady', 'auditEventsPathReady', 'gatesRemainBlockedUntilExplicitGO'], 'connection_requirement');
}
if (typeof loaded.sourceLock === 'string') {
  if (!/post-V96/i.test(loaded.sourceLock) || !/source lock operativo actualizado/i.test(loaded.sourceLock)) add(hardFails, 'post_v96_source_lock_missing');
  if (!/No se declara GO de producci[oó]n real/i.test(loaded.sourceLock)) add(hardFails, 'production_no_go_missing');
}

const verdict = hardFails.length ? 'NO_GO_DEV_AUTH_FIRESTORE_ACTIVATION_READINESS' : (warnings.length ? 'READINESS_PREPARED_WITH_WARNINGS_NOT_ACTIVATED' : 'READINESS_PREPARED_NOT_ACTIVATED');
const report = {
  gate: 'cxorbia-tya-phase-a-dev-auth-firestore-activation-readiness-post-v96',
  generatedAt: new Date().toISOString(), sourceLock: 'post-V96', verdict,
  hardFailCount: hardFails.length, warningCount: warnings.length, blockerCount: blockers.length,
  safeState: { firebaseCalls: false, authCalls: false, firestoreCalls: false, providerCalls: false, databaseReads: false, databaseWrites: false, claimsWrites: false, rulesDeploy: false, frontendChanges: false, cxDataSwitch: false, imports: false, payments: false, production: false, sensitiveData: false },
  hardFails, warnings, blockers, info,
  nextGate: 'Separate explicit authorization is required before configuring a new clean Firebase DEV environment.'
};

if (outDir) {
  const dir = abs(outDir); fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'dev-auth-firestore-activation-readiness-post-v96-report.json'), JSON.stringify(report, null, 2), 'utf8');
  fs.writeFileSync(path.join(dir, 'dev-auth-firestore-activation-readiness-post-v96-report.md'), [
    '# DEV Auth/Firestore activation readiness post-V96', '',
    `Generated: ${report.generatedAt}`, `Verdict: ${verdict}`,
    `Hard fails: ${hardFails.length}`, `Warnings: ${warnings.length}`,
    `Activation blockers retained: ${blockers.length}`, '',
    'No Firebase/Auth/Firestore/provider calls, reads, writes, deploy, import, payment or production.', ''
  ].join('\n'), 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
