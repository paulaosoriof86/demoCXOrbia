#!/usr/bin/env node
/* CXOrbia Phase A protected read access adapter validator.
   No Firebase calls, no Firestore calls, no Auth calls, no writes. */

import fs from 'node:fs';
import path from 'node:path';
import { buildProtectedReadPlan } from '../../backend/adapters/protected-read-access-adapter.preview.mjs';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;

const contractPath = 'backend/contracts/phase-a-protected-read-access-adapter-v1.json';
const routeConfigPath = 'backend/config/phase-a-protected-read-access.routes.source-safe.json';
const hardFails = [];
const warnings = [];
const info = [];
function add(list, message, extra = {}) { list.push({ message, ...extra }); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function readJson(rel) { return JSON.parse(read(rel)); }

let contract = null;
let routeConfig = null;
for (const rel of [contractPath, routeConfigPath, 'backend/adapters/protected-read-access-adapter.preview.mjs']) {
  if (!exists(rel)) add(hardFails, 'required_file_missing', { file: rel });
  else add(info, 'required_file_present', { file: rel });
}
try { if (exists(contractPath)) contract = readJson(contractPath); } catch (err) { add(hardFails, 'contract_json_invalid', { error: String(err.message || err) }); }
try { if (exists(routeConfigPath)) routeConfig = readJson(routeConfigPath); } catch (err) { add(hardFails, 'route_config_json_invalid', { error: String(err.message || err) }); }

if (contract) {
  if (contract.status !== 'draft_safe_not_connected') add(hardFails, 'contract_status_not_safe', { status: contract.status });
  for (const [key, expected] of Object.entries({
    firebaseImported: false,
    firestoreConnected: false,
    authConnected: false,
    frontendConnected: false,
    writesEnabled: false,
    productionEnabled: false,
    containsSecrets: false,
    containsSensitiveData: false
  })) {
    if (contract.safeState?.[key] !== expected) add(hardFails, 'safe_state_invalid', { key, expected, actual: contract.safeState?.[key] });
  }
  for (const key of ['tenantId', 'role', 'personaType', 'scope', 'permissionsVersion']) {
    if (!contract.requiredContextKeys?.includes(key)) add(hardFails, 'required_context_key_missing', { key });
  }
  for (const resource of ['shopperProtectedProfile', 'certificationAttempts', 'certificationCarryovers', 'protectedLiquidations', 'protectedPaymentBatches', 'reviewQueue', 'protectedReadsAudit']) {
    if (!contract.protectedResources?.[resource]) add(hardFails, 'protected_resource_missing', { resource });
  }
}

if (routeConfig) {
  if (routeConfig.status !== 'source_safe_preview_not_connected') add(hardFails, 'route_config_status_not_safe', { status: routeConfig.status });
  for (const route of ['admin.shoppers.protectedProfile', 'admin.certifications.attempts', 'admin.certifications.carryover', 'finance.liquidations.protected', 'finance.paymentBatches.protected', 'ops.reviewQueue', 'audit.protectedReads']) {
    if (!routeConfig.routes?.[route]) add(hardFails, 'route_missing', { route });
  }
}

const contexts = {
  tenantOwner: { tenantId: 'tenant_demo', role: 'tenantAdmin', personaType: 'tenantOwner', scope: 'tenant', permissionsVersion: 'phase-a-v1', userId: 'user_ref_tenant_owner', projectIds: ['project_demo'], countryIds: ['COUNTRY_A'] },
  projectCoordinator: { tenantId: 'tenant_demo', role: 'projectAdmin', personaType: 'projectCoordinator', scope: 'tenantProject', permissionsVersion: 'phase-a-v1', userId: 'user_ref_project_coord', projectIds: ['project_demo'], countryIds: ['COUNTRY_A'] },
  financeOperator: { tenantId: 'tenant_demo', role: 'financeAdmin', personaType: 'financeOperator', scope: 'tenantProject', permissionsVersion: 'phase-a-v1', userId: 'user_ref_finance', projectIds: ['project_demo'], countryIds: ['COUNTRY_A'] },
  certificationOperator: { tenantId: 'tenant_demo', role: 'certificationAdmin', personaType: 'certificationOperator', scope: 'tenantProject', permissionsVersion: 'phase-a-v1', userId: 'user_ref_cert', projectIds: ['project_demo'], countryIds: ['COUNTRY_A'] },
  clientViewer: { tenantId: 'tenant_demo', role: 'clientViewer', personaType: 'clientBrandViewer', scope: 'tenantProject', permissionsVersion: 'phase-a-v1', userId: 'user_ref_client', projectIds: ['project_demo'], countryIds: ['COUNTRY_A'] },
  shopperOwn: { tenantId: 'tenant_demo', role: 'shopper', personaType: 'shopperEvaluator', scope: 'ownTenantOrProject', permissionsVersion: 'phase-a-v1', userId: 'user_ref_shopper', shopperId: 'shopper_ref_001', projectIds: ['project_demo'], countryIds: ['COUNTRY_A'] }
};

const requests = [
  { resource: 'shopperProtectedProfile', operation: 'read', shopperId: 'shopper_ref_001', entityId: 'shopper_ref_001', reason: 'phase_a_policy_test' },
  { resource: 'certificationCarryovers', operation: 'read', projectId: 'project_demo', entityId: 'carryover_ref_001', reason: 'phase_a_policy_test' },
  { resource: 'protectedLiquidations', operation: 'read', projectId: 'project_demo', shopperId: 'shopper_ref_001', entityId: 'liquidation_ref_001', requestedFields: ['statusBucket'], reason: 'phase_a_policy_test' },
  { resource: 'protectedPaymentBatches', operation: 'read', projectId: 'project_demo', entityId: 'batch_ref_001', reason: 'phase_a_policy_test' },
  { resource: 'reviewQueue', operation: 'read', entityId: 'review_ref_001', reason: 'phase_a_policy_test' }
];

const plans = contract ? Object.fromEntries(Object.entries(contexts).map(([key, context]) => [key, buildProtectedReadPlan({ contract, context, requests })])) : {};

if (plans.clientViewer?.results?.some((r) => r.allowed)) add(hardFails, 'client_viewer_should_not_read_protected_operational_data');
if (!plans.financeOperator?.results?.some((r) => r.allowed && r.policy.resource === 'protectedLiquidations')) add(hardFails, 'finance_operator_should_read_protected_liquidations');
if (plans.shopperOwn?.results?.some((r) => r.allowed && r.policy.resource === 'protectedPaymentBatches')) add(hardFails, 'shopper_should_not_read_payment_batches');
if (!plans.shopperOwn?.results?.some((r) => r.allowed && r.policy.resource === 'shopperProtectedProfile')) add(hardFails, 'shopper_should_read_own_protected_profile');

const report = {
  gate: 'phase-a-protected-read-access-adapter',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_PROTECTED_READ_ACCESS_ADAPTER' : 'GO_SAFE_PROTECTED_READ_ACCESS_ADAPTER_DRY_RUN',
  hardFailCount: hardFails.length,
  warningCount: warnings.length,
  safeState: { firebaseCalls: false, firestoreCalls: false, authCalls: false, writes: false, deploy: false, production: false, imports: false, sensitiveData: false },
  hardFails,
  warnings,
  info,
  plans
};

if (outDir) {
  const abs = path.join(root, outDir);
  fs.mkdirSync(abs, { recursive: true });
  fs.writeFileSync(path.join(abs, 'protected-read-access-adapter-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# Protected read access adapter report',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Hard fails: ${hardFails.length}`,
    `Warnings: ${warnings.length}`,
    '',
    '## Safe state',
    '- No Firebase calls',
    '- No Firestore calls',
    '- No Auth calls',
    '- No writes',
    '- No deploy',
    '- No production',
    '- No sensitive data',
    '',
    '## Personas checked',
    ...Object.keys(plans).map((key) => `- ${key}: allowed ${plans[key].allowedCount}, denied ${plans[key].deniedCount}`),
    ''
  ].join('\n');
  fs.writeFileSync(path.join(abs, 'protected-read-access-adapter-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
