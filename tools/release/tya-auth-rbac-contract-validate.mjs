#!/usr/bin/env node
/* CXOrbia TyA - Auth RBAC contract validator.
   Safe validator only: no Auth/Firebase/provider calls and no writes except optional local report. */

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;

const contractPath = 'backend/contracts/auth-rbac-phase-a-v1.json';
const hardFails = [];
const warnings = [];
const info = [];

function add(list, message, extra = {}) { list.push({ message, ...extra }); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function readJson(rel) { return JSON.parse(read(rel)); }

let contract = null;
if (!exists(contractPath)) add(hardFails, 'auth_rbac_contract_missing', { file: contractPath });
else {
  try {
    contract = readJson(contractPath);
    add(info, 'contract_json_valid', { file: contractPath });
  } catch (err) {
    add(hardFails, 'contract_json_invalid', { file: contractPath, error: String(err.message || err) });
  }
}

if (contract) {
  if (contract.status !== 'draft_safe_not_connected') add(hardFails, 'contract_status_not_safe', { status: contract.status });

  for (const [key, expected] of Object.entries({
    authProviderConnected: false,
    frontendConnected: false,
    writesEnabled: false,
    customClaimsWritten: false,
    productionEnabled: false,
    containsSecrets: false,
    containsSensitiveData: false
  })) {
    if (contract.safeState?.[key] !== expected) add(hardFails, 'safe_state_invalid', { key, expected, actual: contract.safeState?.[key] });
  }

  for (const key of ['tenantId', 'userId', 'role', 'personaType', 'scope', 'permissionsVersion']) {
    if (!contract.identityModel?.requiredKeys?.includes(key)) add(hardFails, 'required_identity_key_missing', { key });
  }

  for (const forbidden of ['password', 'email', 'phone', 'rawName', 'idDocumentRaw', 'bankAccountRaw', 'signedNdaRaw', 'providerToken', 'refreshToken', 'privateWebhookUrl', 'privateSourceUrl', 'workbookRaw']) {
    if (!contract.identityModel?.forbiddenInRepo?.includes(forbidden)) add(hardFails, 'forbidden_field_policy_missing', { forbidden });
  }

  for (const [policy, expected] of Object.entries({
    unknownRolePolicy: 'deny',
    unknownPersonaPolicy: 'deny',
    missingScopePolicy: 'deny'
  })) {
    if (contract.identityModel?.[policy] !== expected) add(hardFails, 'fail_closed_identity_policy_missing', { policy, expected, actual: contract.identityModel?.[policy] });
  }

  for (const role of ['tenantAdmin', 'projectAdmin', 'financeAdmin', 'certificationAdmin', 'clientAdmin', 'clientViewer', 'shopper']) {
    if (!contract.roles?.[role]?.phaseA) add(hardFails, 'phase_a_role_missing_or_disabled', { role });
  }

  for (const [persona, role] of Object.entries({
    tenantOwner: 'tenantAdmin',
    franchiseOwner: 'tenantAdmin',
    countryRepresentative: 'projectAdmin',
    operationsCoordinator: 'projectAdmin',
    projectCoordinator: 'projectAdmin',
    fieldRepresentative: 'projectAdmin',
    financeOperator: 'financeAdmin',
    certificationOperator: 'certificationAdmin',
    clientBrandAdmin: 'clientAdmin',
    clientBrandViewer: 'clientViewer',
    shopperEvaluator: 'shopper'
  })) {
    if (contract.personaRolePolicy?.[persona] !== role) add(hardFails, 'persona_role_policy_mismatch', { persona, expectedRole: role, actualRole: contract.personaRolePolicy?.[persona] });
  }
  if (contract.personaRolePolicy?.custom !== 'explicit_mapping_required_default_deny') add(hardFails, 'custom_persona_must_default_deny');

  for (const route of ['dashboard', 'postulaciones', 'reservas', 'automatizaciones', 'cuestionarioShopper', 'finanzas', 'academia', 'diagnostico', 'administrabilidad', 'clientPortal']) {
    if (!Array.isArray(contract.routeAccessMatrix?.[route]) || !contract.routeAccessMatrix[route].length) add(hardFails, 'route_access_missing', { route });
  }

  if (!contract.routeAccessMatrix?.clientPortal?.includes('clientAdmin') || !contract.routeAccessMatrix?.clientPortal?.includes('clientViewer')) {
    add(hardFails, 'client_portal_roles_missing');
  }
  if (contract.routeAccessMatrix?.postulaciones?.some((role) => ['clientAdmin', 'clientViewer'].includes(role))) {
    add(hardFails, 'client_role_must_not_access_operational_postulations');
  }
  if (contract.routeAccessMatrix?.administrabilidad?.some((role) => role !== 'tenantAdmin')) {
    add(hardFails, 'administrability_must_remain_tenant_admin_only');
  }

  for (const gate of ['devAuthConfig', 'devClaimsDryRun', 'devClaimsWrite', 'devProtectedReads', 'stagingAuth', 'productionAuthCutover']) {
    if (!contract.gates?.[gate]) add(hardFails, 'gate_missing', { gate });
  }
  if (contract.gates?.devClaimsDryRun?.status !== 'allowed_validator_only') add(hardFails, 'claims_dry_run_gate_invalid', { actual: contract.gates?.devClaimsDryRun?.status });
  for (const gate of ['devClaimsWrite', 'devProtectedReads', 'stagingAuth', 'productionAuthCutover']) {
    if (contract.gates?.[gate]?.status !== 'blocked') add(hardFails, 'activation_gate_must_be_blocked', { gate, actual: contract.gates?.[gate]?.status });
  }

  if (contract.protectedDataPolicy?.unknownRoute !== 'deny') add(hardFails, 'unknown_route_must_deny');
  if (contract.protectedDataPolicy?.unknownModule !== 'deny_unless_explicit_allowlist') add(hardFails, 'unknown_module_policy_not_fail_closed');
  if (contract.protectedDataPolicy?.financeAdmin !== 'no_raw_bank_data') add(hardFails, 'finance_raw_bank_policy_missing');
}

const report = {
  gate: 'cxorbia-tya-auth-rbac-contract',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_AUTH_RBAC_CONTRACT' : 'GO_SAFE_AUTH_RBAC_CONTRACT_NOT_CONNECTED',
  hardFailCount: hardFails.length,
  warningCount: warnings.length,
  safeState: {
    authProviderConnected: false,
    frontendConnected: false,
    customClaimsWritten: false,
    deploy: false,
    production: false,
    providerCalls: false,
    databaseReads: false,
    databaseWrites: false,
    imports: false
  },
  hardFails,
  warnings,
  info
};

if (outDir) {
  const outputRoot = path.join(root, outDir);
  fs.mkdirSync(outputRoot, { recursive: true });
  fs.writeFileSync(path.join(outputRoot, 'auth-rbac-contract-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA Auth RBAC contract report',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Hard fails: ${hardFails.length}`,
    `Warnings: ${warnings.length}`,
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map((x) => `- ${x.message}${x.key ? ` · ${x.key}` : ''}${x.role ? ` · ${x.role}` : ''}${x.route ? ` · ${x.route}` : ''}${x.persona ? ` · ${x.persona}` : ''}`) : ['- none']),
    '',
    '## Safe state',
    '- Auth provider not connected',
    '- Frontend not connected',
    '- No custom claims written',
    '- No database reads or writes',
    '- No deploy or production',
    '- No provider calls or imports',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(outputRoot, 'auth-rbac-contract-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
