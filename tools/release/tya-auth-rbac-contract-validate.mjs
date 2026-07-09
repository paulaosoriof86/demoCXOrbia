#!/usr/bin/env node
/* CXOrbia TyA - Auth RBAC contract validator
   Safe validator. No Auth calls, no provider calls, no writes. */

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
  for (const key of ['tenantId', 'projectId', 'userId', 'role']) {
    if (!contract.identityModel?.requiredKeys?.includes(key)) add(hardFails, 'required_identity_key_missing', { key });
  }
  for (const forbidden of ['password', 'idDocumentRaw', 'bankAccountRaw', 'signedNdaRaw', 'providerToken', 'refreshToken', 'privateWebhookUrl']) {
    if (!contract.identityModel?.forbiddenInRepo?.includes(forbidden)) add(hardFails, 'forbidden_field_policy_missing', { forbidden });
  }
  for (const role of ['tenantAdmin', 'projectAdmin', 'financeAdmin', 'certificationAdmin', 'shopper']) {
    if (!contract.roles?.[role]?.phaseA) add(hardFails, 'phase_a_role_missing_or_disabled', { role });
  }
  for (const route of ['dashboard', 'postulaciones', 'reservas', 'automatizaciones', 'cuestionarioShopper', 'finanzas', 'academia', 'diagnostico', 'administrabilidad']) {
    if (!Array.isArray(contract.routeAccessMatrix?.[route]) || !contract.routeAccessMatrix[route].length) add(hardFails, 'route_access_missing', { route });
  }
  for (const gate of ['devAuthConfig', 'devClaimsWrite', 'stagingAuth', 'productionAuthCutover']) {
    if (!contract.gates?.[gate]) add(hardFails, 'gate_missing', { gate });
  }
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
    databaseWrites: false,
    imports: false
  },
  hardFails,
  warnings,
  info
};

if (outDir) {
  const abs = path.join(root, outDir);
  fs.mkdirSync(abs, { recursive: true });
  fs.writeFileSync(path.join(abs, 'auth-rbac-contract-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA Auth RBAC contract report',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Hard fails: ${hardFails.length}`,
    `Warnings: ${warnings.length}`,
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.key ? ` · ${x.key}` : ''}${x.role ? ` · ${x.role}` : ''}${x.route ? ` · ${x.route}` : ''}`) : ['- none']),
    '',
    '## Safe state',
    '- Auth provider not connected',
    '- Frontend not connected',
    '- No custom claims written',
    '- No deploy',
    '- No production',
    '- No provider calls',
    '- No database writes',
    '- No imports',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(abs, 'auth-rbac-contract-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
