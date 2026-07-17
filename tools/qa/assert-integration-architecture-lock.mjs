#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const contractPath = resolve(root, 'backend/contracts/integration-lane-architecture-lock-v1.json');
const required = [
  'app/docs/ADDENDUM-MAESTRO-ARQUITECTURA-DEFINITIVA-CARRIL-EMPALMES-CXORBIA-20260717.md',
  'tools/integration/workspace-preflight.mjs',
  'tools/integration/empalme-candidate.mjs',
  'tools/integration/run-latest.mjs',
  'tools/integration/CXORBIA-EMPALMAR-ULTIMA-CANDIDATA.cmd',
  'tools/integration/policies/cxorbia-product.json',
  'tools/integration/policies/tenants/tya.json',
  'AGENTS.md'
];

function stop(message) {
  process.stderr.write(`ARCHITECTURE_LOCK_FAIL: ${message}\n`);
  process.exit(2);
}

if (!existsSync(contractPath)) stop('missing architecture contract');
for (const path of required) if (!existsSync(resolve(root, path))) stop(`missing required component: ${path}`);

const contract = JSON.parse(readFileSync(contractPath, 'utf8'));
const product = JSON.parse(readFileSync(resolve(root, 'tools/integration/policies/cxorbia-product.json'), 'utf8'));
const tenant = JSON.parse(readFileSync(resolve(root, 'tools/integration/policies/tenants/tya.json'), 'utf8'));
const agents = readFileSync(resolve(root, 'AGENTS.md'), 'utf8');

if (contract.architectureId !== 'cxorbia-local-deterministic-integration-lane-v1') stop('unexpected architectureId');
if (contract.status !== 'ACTIVE_DEFINITIVE') stop(`architecture not definitive: ${contract.status}`);
if (contract.executionPlane !== 'local_workspace_with_candidate_and_authenticated_git_checkout') stop('wrong execution plane');
if (product.multiTenant !== true) stop('product must be multiTenant');
if (product.rules?.projectSelection !== 'explicit') stop('product project selection must be explicit');
if (product.rules?.noGlobalProjectDefault !== true) stop('global project default is forbidden');
if (tenant.tenantId !== 'tya') stop('wrong tenant policy');
if (tenant.multiProject !== true) stop('TyA must be multiProject');
if (tenant.projectSelection !== 'explicit') stop('TyA project selection must be explicit');
if (tenant.defaultProjectId) stop('TyA cannot define defaultProjectId');
if (tenant.rules?.cinepolisIsProjectNotTenantDefault !== true) stop('Cinepolis must remain a non-default project');
if (tenant.rules?.newProjectsMustBeCreatedFromPlatformConfiguration !== true) stop('new projects must be platform-configurable');
if (contract.invariants?.candidateAndGitCheckoutSameWorkspace !== true) stop('candidate and Git checkout must share one workspace');
if (contract.invariants?.preflightRequired !== true) stop('preflight is required');
if (contract.invariants?.backupAndRollbackRequired !== true) stop('backup and rollback are required');
if (contract.invariants?.idempotencyRegistryRequired !== true) stop('idempotency registry is required');
if (!agents.includes('integration-lane-architecture-lock-v1.json')) stop('AGENTS.md must reference architecture contract');
if (!agents.includes('assert-integration-architecture-lock.mjs')) stop('AGENTS.md must require architecture validator');

process.stdout.write(`${JSON.stringify({
  ok: true,
  state: 'PASS_DEFINITIVE_INTEGRATION_ARCHITECTURE',
  architectureId: contract.architectureId,
  executionPlane: contract.executionPlane,
  multiTenant: product.multiTenant,
  tenantId: tenant.tenantId,
  multiProject: tenant.multiProject,
  projectSelection: tenant.projectSelection,
  globalProjectDefault: false,
  cinepolisNeverDefault: tenant.rules.cinepolisIsProjectNotTenantDefault
}, null, 2)}\n`);
