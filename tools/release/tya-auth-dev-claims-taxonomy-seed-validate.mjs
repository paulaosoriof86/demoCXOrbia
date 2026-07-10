#!/usr/bin/env node
/* CXOrbia Phase A - Auth DEV claims taxonomy seed validator.
   Safe validator only: no Firebase calls, no Auth writes, no Firestore writes. */

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;

const contractPath = 'backend/contracts/phase-a-auth-dev-claims-taxonomy-seed-v2.json';
const configPath = 'backend/config/phase-a-auth-dev-claims-taxonomy-seed.source-safe.json';
const taxonomyPath = 'backend/contracts/phase-a-role-taxonomy-org-scope-v1.json';
const authBasePath = 'backend/contracts/auth-rbac-phase-a-v1.json';

const hardFails = [];
const warnings = [];
const info = [];
function add(list, message, extra = {}) { list.push({ message, ...extra }); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function readJson(rel) { return JSON.parse(read(rel)); }

function loadJson(rel, label) {
  if (!exists(rel)) {
    add(hardFails, `${label}_missing`, { file: rel });
    return null;
  }
  try {
    const parsed = readJson(rel);
    add(info, `${label}_json_valid`, { file: rel });
    return parsed;
  } catch (err) {
    add(hardFails, `${label}_json_invalid`, { file: rel, error: String(err.message || err) });
    return null;
  }
}

const contract = loadJson(contractPath, 'claims_taxonomy_contract');
const config = loadJson(configPath, 'claims_taxonomy_config');
const taxonomy = loadJson(taxonomyPath, 'role_taxonomy_contract');
const authBase = loadJson(authBasePath, 'auth_base_contract');

const forbiddenKeyFragments = [
  'email', 'mail', 'password', 'phone', 'rawname', 'documentraw', 'bankaccountraw',
  'signedndaraw', 'providertoken', 'privatewebhookurl', 'sourceprivateurl', 'workbookraw',
  'secret', 'token', 'apikey', 'privatekey'
];
const emailLike = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

function scanValue(value, pathLabel) {
  if (value == null) return;
  if (Array.isArray(value)) {
    value.forEach((item, idx) => scanValue(item, `${pathLabel}[${idx}]`));
    return;
  }
  if (typeof value === 'object') {
    for (const [key, inner] of Object.entries(value)) {
      const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (forbiddenKeyFragments.some(fragment => normalized.includes(fragment))) {
        add(hardFails, 'forbidden_key_in_claim_template', { path: `${pathLabel}.${key}` });
      }
      scanValue(inner, `${pathLabel}.${key}`);
    }
    return;
  }
  if (typeof value === 'string') {
    if (emailLike.test(value)) add(hardFails, 'email_like_value_detected', { path: pathLabel });
    if (/password|secret|private_key|refresh_token|provider_token/i.test(value)) {
      add(hardFails, 'secret_like_value_detected', { path: pathLabel });
    }
  }
}

if (contract) {
  if (contract.status !== 'draft_safe_not_connected') add(hardFails, 'contract_status_not_safe', { status: contract.status });
  for (const [key, expected] of Object.entries({
    authProviderConnected: false,
    usersCreated: false,
    claimsWritten: false,
    frontendConnected: false,
    firestoreWritesEnabled: false,
    importsEnabled: false,
    productionEnabled: false,
    containsSecrets: false,
    containsSensitiveData: false
  })) {
    if (contract.safeState?.[key] !== expected) add(hardFails, 'safe_state_invalid', { key, expected, actual: contract.safeState?.[key] });
  }
  for (const key of ['tenantId', 'role', 'personaType', 'scope', 'permissionsVersion']) {
    if (!contract.claimShape?.required?.includes(key)) add(hardFails, 'claim_required_key_missing', { key });
  }
  for (const gate of ['devClaimsDryRun', 'devClaimsWrite', 'clientRolesActivation', 'productionClaims']) {
    if (!contract.gates?.[gate]) add(hardFails, 'gate_missing', { gate });
  }
}

if (config) {
  for (const [key, expected] of Object.entries({
    usesRealEmails: false,
    usesRealNames: false,
    usesRealPhones: false,
    usesPasswords: false,
    writesClaims: false,
    createsUsers: false,
    containsSecrets: false,
    containsSensitiveData: false
  })) {
    if (config.safeState?.[key] !== expected) add(hardFails, 'config_safe_state_invalid', { key, expected, actual: config.safeState?.[key] });
  }
  if (!Array.isArray(config.templates) || !config.templates.length) add(hardFails, 'claim_templates_missing');
  const templatesByPersona = new Map((config.templates || []).map(t => [t.personaType, t]));
  for (const persona of contract?.personaTemplatesRequired || []) {
    if (!templatesByPersona.has(persona)) add(hardFails, 'persona_template_missing', { persona });
  }
  for (const tpl of config.templates || []) {
    scanValue(tpl, `template:${tpl.templateId || tpl.personaType || 'unknown'}`);
    for (const required of contract?.claimShape?.required || []) {
      if (tpl[required] === undefined || tpl[required] === null || tpl[required] === '') {
        add(hardFails, 'template_required_claim_missing', { templateId: tpl.templateId, required });
      }
    }
    const expectedRole = contract?.personaToTechnicalRole?.[tpl.personaType];
    if (expectedRole && tpl.role !== expectedRole) {
      add(hardFails, 'persona_role_mismatch', { personaType: tpl.personaType, expectedRole, actualRole: tpl.role });
    }
    const allowedScopes = contract?.scopeRules?.[tpl.personaType] || [];
    if (allowedScopes.length && !allowedScopes.includes(tpl.scope)) {
      add(hardFails, 'persona_scope_not_allowed', { personaType: tpl.personaType, scope: tpl.scope, allowedScopes });
    }
    if (['projectAdmin', 'financeAdmin', 'certificationAdmin', 'clientAdmin', 'clientViewer'].includes(tpl.role)) {
      if (!Array.isArray(tpl.projectIds) || !tpl.projectIds.length) add(hardFails, 'project_scoped_role_without_projectIds', { templateId: tpl.templateId, role: tpl.role });
    }
    if (tpl.role === 'shopper' && !tpl.shopperId) add(hardFails, 'shopper_template_without_opaque_shopperId', { templateId: tpl.templateId });
  }
  for (const [key, expected] of Object.entries({
    setCustomClaims: false,
    createAuthUsers: false,
    importUsers: false,
    deployRules: false,
    productionCutover: false
  })) {
    if (config.futureWriteBlocked?.[key] !== expected) add(hardFails, 'future_write_gate_not_blocked', { key, expected, actual: config.futureWriteBlocked?.[key] });
  }
}

if (taxonomy) {
  const personaMap = taxonomy.personaTypes || taxonomy.personas || taxonomy.operationalPersonas || {};
  for (const persona of contract?.personaTemplatesRequired || []) {
    if (!personaMap[persona]) add(warnings, 'persona_not_found_in_taxonomy_contract_shape', { persona });
  }
}

if (authBase) {
  for (const role of ['tenantAdmin', 'projectAdmin', 'financeAdmin', 'certificationAdmin', 'shopper']) {
    if (!authBase.roles?.[role]) add(hardFails, 'base_auth_role_missing', { role });
  }
  for (const role of ['clientAdmin', 'clientViewer']) {
    if (!authBase.roles?.[role]) add(warnings, 'client_role_not_yet_in_base_auth_contract', { role, action: 'mustUpdateBeforeActivation' });
  }
}

const report = {
  gate: 'cxorbia-phase-a-auth-dev-claims-taxonomy-seed',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_AUTH_CLAIMS_TAXONOMY_SEED' : 'GO_SAFE_AUTH_CLAIMS_TAXONOMY_SEED_NOT_CONNECTED',
  hardFailCount: hardFails.length,
  warningCount: warnings.length,
  safeState: {
    authProviderConnected: false,
    usersCreated: false,
    claimsWritten: false,
    frontendConnected: false,
    firestoreWrites: false,
    imports: false,
    production: false
  },
  hardFails,
  warnings,
  info
};

if (outDir) {
  const abs = path.join(root, outDir);
  fs.mkdirSync(abs, { recursive: true });
  fs.writeFileSync(path.join(abs, 'auth-claims-taxonomy-seed-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia Phase A Auth claims taxonomy seed report',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Hard fails: ${hardFails.length}`,
    `Warnings: ${warnings.length}`,
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}`) : ['- none']),
    '',
    '## Warnings',
    ...(warnings.length ? warnings.map(x => `- ${x.message}${x.role ? ` · ${x.role}` : ''}`) : ['- none']),
    '',
    '## Safe state',
    '- No Auth provider calls',
    '- No users created',
    '- No claims written',
    '- No Firestore writes',
    '- No imports',
    '- No production',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(abs, 'auth-claims-taxonomy-seed-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
