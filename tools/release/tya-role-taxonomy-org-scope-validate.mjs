#!/usr/bin/env node
/* CXOrbia Phase A - role taxonomy org scope validator
   Safe validator. No Auth calls, no Firebase calls, no writes, no provider calls. */

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;

const contractPath = 'backend/contracts/phase-a-role-taxonomy-org-scope-v1.json';
const configPath = 'backend/config/phase-a-role-taxonomy-personas.source-safe.json';
const authContractPath = 'backend/contracts/auth-rbac-phase-a-v1.json';

const hardFails = [];
const warnings = [];
const info = [];
function add(list, message, extra = {}) { list.push({ message, ...extra }); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function readJson(rel) { return JSON.parse(read(rel)); }

let contract = null;
let config = null;
let auth = null;

for (const rel of [contractPath, configPath, authContractPath]) {
  if (!exists(rel)) add(hardFails, 'required_file_missing', { file: rel });
}

try { if (exists(contractPath)) contract = readJson(contractPath); } catch (err) { add(hardFails, 'contract_json_invalid', { file: contractPath, error: String(err.message || err) }); }
try { if (exists(configPath)) config = readJson(configPath); } catch (err) { add(hardFails, 'config_json_invalid', { file: configPath, error: String(err.message || err) }); }
try { if (exists(authContractPath)) auth = readJson(authContractPath); } catch (err) { add(hardFails, 'auth_contract_json_invalid', { file: authContractPath, error: String(err.message || err) }); }

if (contract) {
  if (contract.status !== 'draft_safe_not_connected') add(hardFails, 'taxonomy_status_not_safe', { status: contract.status });
  for (const [key, expected] of Object.entries({
    authProviderConnected: false,
    customClaimsWritten: false,
    frontendConnected: false,
    databaseWritesEnabled: false,
    productionEnabled: false,
    containsSecrets: false,
    containsSensitiveData: false
  })) {
    if (contract.safeState?.[key] !== expected) add(hardFails, 'safe_state_invalid', { key, expected, actual: contract.safeState?.[key] });
  }
  for (const persona of [
    'tenantOwner',
    'franchiseOwner',
    'countryRepresentative',
    'operationsCoordinator',
    'projectCoordinator',
    'fieldRepresentative',
    'financeOperator',
    'certificationOperator',
    'clientBrandAdmin',
    'clientBrandViewer',
    'shopperEvaluator'
  ]) {
    if (!contract.personaTypes?.[persona]?.phaseA) add(hardFails, 'phase_a_persona_missing_or_disabled', { persona });
  }
  for (const role of ['tenantAdmin', 'projectAdmin', 'financeAdmin', 'certificationAdmin', 'clientAdmin', 'clientViewer', 'shopper']) {
    if (!contract.technicalRoles?.[role]?.phaseA) add(hardFails, 'phase_a_technical_role_missing_or_disabled', { role });
  }
  for (const route of ['dashboard', 'visits', 'postulations', 'assignments', 'shoppersProtected', 'finance', 'certifications', 'academia', 'diagnostico', 'administrabilidad']) {
    if (!Array.isArray(contract.routeIntentMap?.[route]) || !contract.routeIntentMap[route].length) add(hardFails, 'route_intent_missing', { route });
  }
  for (const bundle of ['tenantConfiguration', 'projectOperations', 'fieldOperations', 'finance', 'certification', 'clientReporting', 'shopperSelfService']) {
    if (!Array.isArray(contract.permissionBundles?.[bundle]) || !contract.permissionBundles[bundle].length) add(hardFails, 'permission_bundle_missing', { bundle });
  }
}

if (config && contract) {
  const templates = Array.isArray(config.personaTemplates) ? config.personaTemplates : [];
  if (!templates.length) add(hardFails, 'persona_templates_missing');
  const byPersona = new Set(templates.map(t => t.personaType));
  for (const persona of Object.keys(contract.personaTypes || {}).filter(p => contract.personaTypes[p]?.phaseA)) {
    if (!byPersona.has(persona)) add(hardFails, 'persona_template_missing', { persona });
  }
  for (const template of templates) {
    if (!template.tenantId || !template.role || !template.personaType || !template.scope || !template.permissionsVersion) {
      add(hardFails, 'template_required_field_missing', { templateId: template.templateId || '(no id)' });
    }
    if (template.email || template.phone || template.password || template.rawEmail || template.rawPhone || template.privateSourceUrl || template.providerToken) {
      add(hardFails, 'template_contains_forbidden_sensitive_key', { templateId: template.templateId || '(no id)' });
    }
    const expectedRole = contract.personaTypes?.[template.personaType]?.mapsToRole;
    if (expectedRole && template.role !== expectedRole) {
      add(hardFails, 'persona_role_mapping_mismatch', { templateId: template.templateId, personaType: template.personaType, expectedRole, actualRole: template.role });
    }
    if (['tenantProject', 'tenantProjectOrCountry', 'ownTenantOrProject'].includes(template.scope) && !Array.isArray(template.projectIds) && template.personaType !== 'tenantOwner') {
      add(warnings, 'project_scoped_template_without_projectIds', { templateId: template.templateId, personaType: template.personaType });
    }
  }
}

if (auth && contract) {
  const missingInAuth = [];
  for (const role of ['tenantAdmin', 'projectAdmin', 'financeAdmin', 'certificationAdmin', 'shopper']) {
    if (!auth.roles?.[role]) missingInAuth.push(role);
  }
  if (missingInAuth.length) add(hardFails, 'auth_contract_missing_base_roles', { roles: missingInAuth });
  for (const role of ['clientAdmin', 'clientViewer']) {
    if (!auth.roles?.[role]) add(warnings, 'new_role_not_yet_in_auth_contract', { role, note: 'Expected as Phase A expanded/client-facing taxonomy; update auth-rbac before activation.' });
  }
}

const report = {
  gate: 'cxorbia-phase-a-role-taxonomy-org-scope',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_ROLE_TAXONOMY' : 'GO_SAFE_ROLE_TAXONOMY_NOT_CONNECTED',
  hardFailCount: hardFails.length,
  warningCount: warnings.length,
  safeState: {
    authProviderConnected: false,
    customClaimsWritten: false,
    frontendConnected: false,
    databaseWrites: false,
    deploy: false,
    production: false,
    providerCalls: false,
    containsSensitiveData: false
  },
  hardFails,
  warnings,
  info
};

if (outDir) {
  const abs = path.join(root, outDir);
  fs.mkdirSync(abs, { recursive: true });
  fs.writeFileSync(path.join(abs, 'role-taxonomy-org-scope-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia Phase A role taxonomy org scope report',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Hard fails: ${hardFails.length}`,
    `Warnings: ${warnings.length}`,
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.persona ? ` · ${x.persona}` : ''}${x.role ? ` · ${x.role}` : ''}${x.route ? ` · ${x.route}` : ''}${x.templateId ? ` · ${x.templateId}` : ''}`) : ['- none']),
    '',
    '## Warnings',
    ...(warnings.length ? warnings.map(x => `- ${x.message}${x.role ? ` · ${x.role}` : ''}${x.templateId ? ` · ${x.templateId}` : ''}`) : ['- none']),
    '',
    '## Safe state',
    '- Auth provider not connected',
    '- No claims written',
    '- Frontend not connected',
    '- No database writes',
    '- No deploy',
    '- No production',
    '- No provider calls',
    '- No sensitive data',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(abs, 'role-taxonomy-org-scope-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
