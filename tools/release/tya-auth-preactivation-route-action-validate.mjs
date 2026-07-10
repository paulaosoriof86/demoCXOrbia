#!/usr/bin/env node
/* CXOrbia Phase A - Auth preactivation route/action validator
   Static/source-safe only. No Firebase/Auth calls, no provider calls, no reads/writes, no deploy. */

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;

const files = {
  matrix: 'backend/contracts/phase-a-auth-preactivation-route-action-v1.json',
  identity: 'backend/config/phase-a-auth-preactivation-identity.source-safe.json',
  rbac: 'backend/contracts/auth-rbac-phase-a-v1.json',
  taxonomy: 'backend/contracts/phase-a-role-taxonomy-org-scope-v1.json',
  frontendConfig: 'app/core/config.js',
  router: 'app/core/router.js',
  data: 'app/core/data.js',
  firebaseRc: '.firebaserc',
  firebaseJson: 'firebase.json',
  deployWorkflow: '.github/workflows/cxorbia-rc-phase-a-staging-deploy.yml'
};

const hardFails = [];
const warnings = [];
const blockers = [];
const info = [];
const add = (list, message, extra = {}) => list.push({ message, ...extra });
const abs = rel => path.join(root, rel);
const exists = rel => fs.existsSync(abs(rel));
const read = rel => fs.readFileSync(abs(rel), 'utf8');
const readJson = rel => JSON.parse(read(rel));
const has = (text, term) => text.includes(term);

for (const [label, rel] of Object.entries(files)) {
  if (!exists(rel)) add(hardFails, 'required_file_missing', { label, file: rel });
  else add(info, 'required_file_present', { label, file: rel });
}

let matrix = null;
let identity = null;
let rbac = null;
let taxonomy = null;
let frontend = '';
let router = '';
let data = '';
let firebaseRc = null;
let firebaseJson = null;
let deployWorkflow = '';

for (const [label, rel] of [['matrix', files.matrix], ['identity', files.identity], ['rbac', files.rbac], ['taxonomy', files.taxonomy], ['firebaseRc', files.firebaseRc], ['firebaseJson', files.firebaseJson]]) {
  if (!exists(rel)) continue;
  try {
    const parsed = readJson(rel);
    if (label === 'matrix') matrix = parsed;
    if (label === 'identity') identity = parsed;
    if (label === 'rbac') rbac = parsed;
    if (label === 'taxonomy') taxonomy = parsed;
    if (label === 'firebaseRc') firebaseRc = parsed;
    if (label === 'firebaseJson') firebaseJson = parsed;
    add(info, 'json_valid', { label, file: rel });
  } catch (error) {
    add(hardFails, 'json_invalid', { label, file: rel, error: String(error.message || error) });
  }
}
if (exists(files.frontendConfig)) frontend = read(files.frontendConfig);
if (exists(files.router)) router = read(files.router);
if (exists(files.data)) data = read(files.data);
if (exists(files.deployWorkflow)) deployWorkflow = read(files.deployWorkflow);

if (matrix) {
  if (matrix.status !== 'safe_preactivation_complete_not_connected') add(hardFails, 'matrix_status_not_safe', { actual: matrix.status });
  const expectedFalse = ['authProviderConnected', 'customClaimsWritten', 'frontendAuthBinding', 'firestoreReads', 'firestoreWrites', 'rulesDeployed', 'providerCalls', 'imports', 'production', 'containsSecrets', 'containsSensitiveData'];
  for (const key of expectedFalse) if (matrix.safeState?.[key] !== false) add(hardFails, 'matrix_safe_state_invalid', { key, actual: matrix.safeState?.[key] });
  for (const role of ['super', 'admin', 'ops', 'coordinador', 'aliado', 'cliente', 'shopper', 'custom']) {
    if (!matrix.roleReconciliation?.[role]) add(hardFails, 'role_reconciliation_missing', { role });
  }
  if (matrix.roleReconciliation?.custom?.defaultDecision !== 'deny') add(hardFails, 'custom_role_not_fail_closed');
  if (matrix.routeActionPolicy?.diagnosticoAndAdministrabilidad?.projectAdminDefault !== 'deny') add(hardFails, 'project_admin_diagnostic_not_denied');
  if (matrix.routeActionPolicy?.financeControl?.rawBankData !== 'deny') add(hardFails, 'raw_bank_data_not_denied');
  if (!Array.isArray(matrix.knownActivationBlockers) || matrix.knownActivationBlockers.length < 6) add(hardFails, 'known_activation_blockers_incomplete');
  for (const item of matrix.knownActivationBlockers || []) add(blockers, item.id, { detail: item.detail });
  for (const gate of ['createTestUsers', 'writeClaims', 'protectedReads', 'deployRules', 'imports', 'production']) {
    if (matrix.activationGates?.[gate] !== 'blocked') add(hardFails, 'activation_gate_not_blocked', { gate, actual: matrix.activationGates?.[gate] });
  }
}

if (identity) {
  if (identity.status !== 'source_safe_not_connected') add(hardFails, 'identity_status_not_safe', { actual: identity.status });
  if (identity.expectedDevProject?.projectId !== 'cxorbia-backend-dev') add(hardFails, 'unexpected_dev_project_id', { actual: identity.expectedDevProject?.projectId });
  if (identity.expectedDevProject?.externalCleanStateVerification?.assertedAsVerified !== false) add(hardFails, 'clean_state_must_not_be_asserted_verified');
  for (const key of ['authProviderConnected', 'customClaimsWritten', 'testUsersCreated', 'firestoreReads', 'firestoreWrites', 'rulesDeployed', 'providerCalls', 'containsRealEmails', 'containsPasswords', 'containsSensitiveData', 'production']) {
    if (identity.safeState?.[key] !== false) add(hardFails, 'identity_safe_state_invalid', { key, actual: identity.safeState?.[key] });
  }
  const requiredPersonas = ['tenantOwner', 'franchiseOwner', 'countryRepresentative', 'operationsCoordinator', 'projectCoordinator', 'fieldRepresentative', 'financeOperator', 'certificationOperator', 'clientBrandAdmin', 'clientBrandViewer', 'shopperEvaluator'];
  const templates = Array.isArray(identity.templates) ? identity.templates : [];
  const personas = new Set(templates.map(t => t.claims?.personaType));
  for (const persona of requiredPersonas) if (!personas.has(persona)) add(hardFails, 'identity_template_missing', { persona });
  const forbidden = new Set(identity.claimShape?.forbidden || []);
  const walk = (value, trail = []) => {
    if (Array.isArray(value)) return value.forEach((item, index) => walk(item, trail.concat(index)));
    if (value && typeof value === 'object') return Object.entries(value).forEach(([key, item]) => {
      if (forbidden.has(key)) add(hardFails, 'forbidden_claim_key_present', { trail: trail.concat(key).join('.') });
      walk(item, trail.concat(key));
    });
    if (typeof value === 'string') {
      if (value.includes('@')) add(hardFails, 'possible_real_email_or_secret_string', { trail: trail.join('.'), preview: value.slice(0, 60) });
      if (/BEGIN PRIVATE KEY|refresh_token|password\s*[:=]/i.test(value)) add(hardFails, 'possible_secret_string', { trail: trail.join('.'), preview: value.slice(0, 60) });
    }
  };
  walk(identity);
  if (identity.customRolePolicy?.defaultDecision !== 'deny' || identity.customRolePolicy?.templateCreated !== false) add(hardFails, 'custom_identity_template_not_fail_closed');
  for (const action of ['createAuthUsers', 'setCustomClaims', 'importLegacyUsers', 'deployFirestoreRules', 'enableProtectedReads', 'enableFirestoreWrites', 'activateProviders', 'productionCutover']) {
    if (!identity.blockedActions?.includes(action)) add(hardFails, 'blocked_action_missing', { action });
  }
}

if (frontend) {
  const requiredTerms = [
    "coordinador:['op','prj','cap']",
    "aliado:['op','prj','cap']",
    "ops:['op','prj','cap']",
    "shopper:['sh','cap']",
    "const cat=CX.MOD_CAT[id] || 'cfg'",
    "return cat==='cap'",
    "CX.PERSONAS",
    "franchiseOwner",
    "countryRepresentative",
    "clientBrandAdmin",
    "clientBrandViewer"
  ];
  for (const term of requiredTerms) if (!has(frontend, term)) add(hardFails, 'frontend_permission_term_missing', { term });
  if (!/CX\.roleCanAccess\s*=\s*function\(role, id\)/.test(frontend)) add(hardFails, 'frontend_role_access_function_missing');
}

if (router) {
  const requiredTerms = [
    "CX.roleCanAccess(gRole,id)",
    "CX.roleCanAccess(CX.session.testRole||role,id)",
    "CX.roleCanAccess(CX.session.testRole||role,id)) return"
  ];
  for (const term of requiredTerms) if (!has(router, term)) add(hardFails, 'router_access_gate_missing', { term });
}

if (data) {
  for (const term of ['projectsFor(role)', 'scopePaises()', 'inScope(pais)', 'scopeProjectId']) {
    if (!has(data, term)) add(hardFails, 'data_scope_enforcement_term_missing', { term });
  }
}

if (rbac && matrix) {
  const projectAdminRoutes = Object.entries(rbac.routeAccessMatrix || {}).filter(([, roles]) => Array.isArray(roles) && roles.includes('projectAdmin')).map(([route]) => route);
  for (const route of ['finanzas', 'automatizaciones', 'diagnostico']) {
    if (!projectAdminRoutes.includes(route)) add(warnings, 'expected_known_rbac_mismatch_not_present', { route, note: 'Review matrix documentation if auth-rbac was already narrowed.' });
  }
  for (const role of ['clientAdmin', 'clientViewer']) if (!rbac.roles?.[role]?.phaseA) add(hardFails, 'rbac_client_role_missing', { role });
  if (rbac.gates?.devClaimsWrite?.status !== 'blocked') add(hardFails, 'rbac_claim_write_not_blocked');
}

if (taxonomy) {
  if (taxonomy.failClosedPolicy?.unknownModule !== 'deny_unless_explicit_allowlist') add(hardFails, 'taxonomy_unknown_module_not_fail_closed');
  for (const persona of ['franchiseOwner', 'countryRepresentative', 'clientBrandAdmin', 'clientBrandViewer']) {
    if (!taxonomy.personaTypes?.[persona]?.phaseA) add(hardFails, 'taxonomy_persona_missing', { persona });
  }
}

if (firebaseRc) {
  if (firebaseRc.projects?.default !== 'cxorbia-backend-dev') add(hardFails, 'firebaserc_default_not_dev', { actual: firebaseRc.projects?.default });
}
if (firebaseJson) {
  if (firebaseJson.hosting?.public !== 'app') add(hardFails, 'firebase_hosting_public_not_app', { actual: firebaseJson.hosting?.public });
}
if (deployWorkflow) {
  if (!/workflow_dispatch\s*:/.test(deployWorkflow)) add(hardFails, 'deploy_workflow_not_manual_dispatch');
  if (/^\s*(push|pull_request|schedule)\s*:/m.test(deployWorkflow)) add(hardFails, 'deploy_workflow_has_automatic_trigger');
  if (!deployWorkflow.includes('DEPLOY_DEV_ROOT')) add(hardFails, 'deploy_manual_confirmation_missing');
}

const report = {
  gate: 'cxorbia-phase-a-auth-preactivation-route-action',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_AUTH_PREACTIVATION_MATRIX' : 'GO_SAFE_AUTH_PREACTIVATION_COMPLETE_NO_PROVIDER_CALLS',
  hardFailCount: hardFails.length,
  warningCount: warnings.length,
  activationBlockerCount: blockers.length,
  safeState: {
    providerCalls: false,
    authProviderConnected: false,
    usersCreated: false,
    claimsWritten: false,
    firestoreReads: false,
    firestoreWrites: false,
    rulesDeployed: false,
    imports: false,
    deploy: false,
    production: false
  },
  hardFails,
  warnings,
  activationBlockers: blockers,
  info
};

if (outDir) {
  const out = path.join(root, outDir);
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'auth-preactivation-route-action-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia Phase A Auth preactivation route/action report',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Hard fails: ${report.hardFailCount}`,
    `Warnings: ${report.warningCount}`,
    `Activation blockers: ${report.activationBlockerCount}`,
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.role ? ` · ${x.role}` : ''}${x.term ? ` · ${x.term}` : ''}${x.file ? ` · ${x.file}` : ''}`) : ['- none']),
    '',
    '## Warnings',
    ...(warnings.length ? warnings.map(x => `- ${x.message}${x.route ? ` · ${x.route}` : ''}`) : ['- none']),
    '',
    '## Activation blockers',
    ...(blockers.length ? blockers.map(x => `- ${x.message}: ${x.detail || ''}`) : ['- none']),
    '',
    '## Safe state',
    '- No Firebase/Auth provider calls',
    '- No users created',
    '- No claims written',
    '- No Firestore reads or writes',
    '- No rules deploy',
    '- No imports',
    '- No deploy or production',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(out, 'auth-preactivation-route-action-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
