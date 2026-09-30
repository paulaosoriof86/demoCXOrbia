#!/usr/bin/env node
/* CXOrbia Phase A - Auth DEV claims seed plan validator
   Safe validator. No Firebase/Auth calls, no provider calls, no writes. */

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;

const contractPath = 'backend/contracts/phase-a-auth-dev-claims-seed-readiness-v1.json';
const rbacPath = 'backend/contracts/auth-rbac-phase-a-v1.json';
const seedPath = 'backend/config/phase-a-auth-dev-claims-seed.source-safe.json';

const hardFails = [];
const warnings = [];
const info = [];
function add(list, message, extra = {}) { list.push({ message, ...extra }); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function readJson(rel) { return JSON.parse(read(rel)); }
function isPlainObject(value) { return value && typeof value === 'object' && !Array.isArray(value); }
function scanStrings(value, visitor, trail = []) {
  if (typeof value === 'string') visitor(value, trail);
  else if (Array.isArray(value)) value.forEach((item, index) => scanStrings(item, visitor, trail.concat(index)));
  else if (isPlainObject(value)) Object.entries(value).forEach(([key, item]) => scanStrings(item, visitor, trail.concat(key)));
}

let contract = null;
let rbac = null;
let seed = null;
for (const [label, file] of [['contract', contractPath], ['rbac', rbacPath], ['seed', seedPath]]) {
  if (!exists(file)) add(hardFails, `${label}_file_missing`, { file });
}
if (exists(contractPath)) {
  try { contract = readJson(contractPath); add(info, 'contract_json_valid', { file: contractPath }); }
  catch (err) { add(hardFails, 'contract_json_invalid', { file: contractPath, error: String(err.message || err) }); }
}
if (exists(rbacPath)) {
  try { rbac = readJson(rbacPath); add(info, 'rbac_json_valid', { file: rbacPath }); }
  catch (err) { add(hardFails, 'rbac_json_invalid', { file: rbacPath, error: String(err.message || err) }); }
}
if (exists(seedPath)) {
  try { seed = readJson(seedPath); add(info, 'seed_json_valid', { file: seedPath }); }
  catch (err) { add(hardFails, 'seed_json_invalid', { file: seedPath, error: String(err.message || err) }); }
}

if (contract) {
  if (contract.status !== 'draft_safe_not_connected') add(hardFails, 'contract_status_not_safe', { status: contract.status });
  for (const [key, expected] of Object.entries({
    authProviderConnected: false,
    customClaimsWritten: false,
    frontendConnected: false,
    databaseWritesEnabled: false,
    importsEnabled: false,
    productionEnabled: false,
    containsSecrets: false,
    containsSensitiveData: false,
    containsRawEmails: false,
    containsPasswords: false
  })) {
    if (contract.safeState?.[key] !== expected) add(hardFails, 'contract_safe_state_invalid', { key, expected, actual: contract.safeState?.[key] });
  }
  for (const role of ['tenantAdmin', 'projectAdmin', 'financeAdmin', 'certificationAdmin', 'shopper']) {
    if (!contract.claimModel?.allowedRoles?.includes(role)) add(hardFails, 'allowed_role_missing_in_claim_model', { role });
  }
  for (const key of ['email', 'phone', 'password', 'dpi', 'idDocumentRaw', 'bankAccountRaw', 'providerToken', 'privateSourceUrl']) {
    if (!contract.claimModel?.forbiddenClaimKeys?.includes(key)) add(hardFails, 'forbidden_claim_key_missing', { key });
  }
  if (contract.activationGates?.devClaimsWrite?.status !== 'blocked') add(hardFails, 'dev_claims_write_not_blocked');
  if (contract.activationGates?.productionClaims?.status !== 'blocked') add(hardFails, 'production_claims_not_blocked');
}

const rbacRoles = rbac?.roles || {};
const allowedRoles = contract?.claimModel?.allowedRoles || ['tenantAdmin', 'projectAdmin', 'financeAdmin', 'certificationAdmin', 'shopper'];
if (rbac) {
  for (const role of allowedRoles) {
    if (!rbacRoles[role]?.phaseA) add(hardFails, 'role_not_enabled_in_auth_rbac_contract', { role });
  }
  for (const gate of ['devAuthConfig', 'devClaimsWrite', 'stagingAuth', 'productionAuthCutover']) {
    if (!rbac.gates?.[gate]) add(hardFails, 'rbac_gate_missing', { gate });
  }
}

if (seed) {
  for (const [key, expected] of Object.entries({
    authProviderConnected: false,
    customClaimsWritten: false,
    containsRealEmails: false,
    containsPasswords: false,
    containsSensitiveData: false,
    productionEnabled: false
  })) {
    if (seed.safeState?.[key] !== expected) add(hardFails, 'seed_safe_state_invalid', { key, expected, actual: seed.safeState?.[key] });
  }
  if (!Array.isArray(seed.claimTemplates) || !seed.claimTemplates.length) add(hardFails, 'claim_templates_missing');
  const seenRoles = new Set();
  for (const template of seed.claimTemplates || []) {
    const role = template.claims?.role;
    seenRoles.add(role);
    if (!template.templateId) add(hardFails, 'template_id_missing');
    if (!template.userRef || !String(template.userRef).startsWith('user_ref_')) add(hardFails, 'user_ref_not_source_safe', { templateId: template.templateId, userRef: template.userRef });
    if (!allowedRoles.includes(role)) add(hardFails, 'template_role_not_allowed', { templateId: template.templateId, role });
    if (!template.claims?.tenantId) add(hardFails, 'template_tenant_missing', { templateId: template.templateId });
    if (!template.claims?.authScopeVersion) add(hardFails, 'template_auth_scope_version_missing', { templateId: template.templateId });
    const requires = contract?.claimModel?.constraints?.[role] || {};
    if (requires.requiresProject && !template.claims?.projectId && !Array.isArray(template.claims?.projectIds)) add(hardFails, 'project_scope_required_missing', { templateId: template.templateId, role });
    if (requires.requiresShopperId && !template.claims?.shopperId) add(hardFails, 'shopper_id_required_missing', { templateId: template.templateId, role });
    for (const forbiddenKey of contract?.claimModel?.forbiddenClaimKeys || []) {
      if (Object.prototype.hasOwnProperty.call(template.claims || {}, forbiddenKey)) add(hardFails, 'forbidden_claim_present', { templateId: template.templateId, forbiddenKey });
    }
  }
  for (const role of allowedRoles) {
    if (!seenRoles.has(role)) add(hardFails, 'seed_template_missing_for_role', { role });
  }
  for (const action of ['setCustomClaims', 'importUsers', 'deployRules', 'productionCutover']) {
    if (!seed.blockedWriteActions?.includes(action)) add(hardFails, 'blocked_write_action_missing', { action });
  }
  scanStrings(seed, (value, trail) => {
    if (value.includes('@')) add(hardFails, 'possible_email_or_secret_string_in_seed', { trail: trail.join('.'), valuePreview: value.slice(0, 80) });
    if (/password|private_key|BEGIN PRIVATE KEY|refresh_token/i.test(value)) add(hardFails, 'possible_secret_string_in_seed', { trail: trail.join('.'), valuePreview: value.slice(0, 80) });
  });
}

const report = {
  gate: 'cxorbia-phase-a-auth-dev-claims-seed-plan',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_AUTH_DEV_CLAIMS_SEED_PLAN' : 'GO_SAFE_AUTH_DEV_CLAIMS_SEED_PLAN_NO_WRITES',
  hardFailCount: hardFails.length,
  warningCount: warnings.length,
  safeState: {
    authProviderConnected: false,
    customClaimsWritten: false,
    providerCalls: false,
    databaseWrites: false,
    deploy: false,
    production: false,
    imports: false,
    containsRawEmails: false,
    containsPasswords: false
  },
  hardFails,
  warnings,
  info
};

if (outDir) {
  const abs = path.join(root, outDir);
  fs.mkdirSync(abs, { recursive: true });
  fs.writeFileSync(path.join(abs, 'auth-dev-claims-seed-plan-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia Phase A Auth DEV claims seed plan report',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Hard fails: ${hardFails.length}`,
    `Warnings: ${warnings.length}`,
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.role ? ` · ${x.role}` : ''}${x.templateId ? ` · ${x.templateId}` : ''}${x.key ? ` · ${x.key}` : ''}`) : ['- none']),
    '',
    '## Safe state',
    '- No Auth provider calls',
    '- No custom claims written',
    '- No database writes',
    '- No deploy',
    '- No production',
    '- No imports',
    '- No raw emails or passwords expected',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(abs, 'auth-dev-claims-seed-plan-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
