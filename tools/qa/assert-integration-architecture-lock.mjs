#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const contractPath = resolve(root, 'backend/contracts/integration-lane-architecture-lock-v1.json');
const addendumPath = resolve(root, 'app/docs/ADDENDUM-MAESTRO-EJECUCION-DIRECTA-EMPALMES-CXORBIA-20260716.md');
const agentsPath = resolve(root, 'AGENTS.md');
const productPolicyPath = resolve(root, 'tools/integration/policies/cxorbia-product.json');
const tenantPolicyPath = resolve(root, 'tools/integration/policies/tenants/tya.json');

function stop(message) {
  process.stderr.write(`DIRECT_ORBIT_METHOD_LOCK_FAIL: ${message}\n`);
  process.exit(2);
}

for (const [label, path] of [
  ['contract', contractPath],
  ['prevalent addendum', addendumPath],
  ['AGENTS.md', agentsPath],
  ['product policy', productPolicyPath],
  ['TyA policy', tenantPolicyPath]
]) {
  if (!existsSync(path)) stop(`missing ${label}`);
}

const contract = JSON.parse(readFileSync(contractPath, 'utf8'));
const addendum = readFileSync(addendumPath, 'utf8');
const agents = readFileSync(agentsPath, 'utf8');
const product = JSON.parse(readFileSync(productPolicyPath, 'utf8'));
const tenant = JSON.parse(readFileSync(tenantPolicyPath, 'utf8'));

if (contract.architectureId !== 'cxorbia-orbit-direct-repository-apply-v1') stop('unexpected architectureId');
if (contract.status !== 'ACTIVE_DEFINITIVE') stop(`method not active: ${contract.status}`);
if (contract.executionPlane !== 'authenticated_direct_repository_operations') stop('wrong execution plane');
if (contract.invariants?.multiTenant !== true) stop('CXOrbia must remain multi-tenant');
if (contract.invariants?.tenantMultiProjectRequired !== true) stop('tenants must remain multi-project');
if (contract.invariants?.projectSelection !== 'explicit') stop('project selection must remain explicit');
if (contract.invariants?.globalProjectDefaultAllowed !== false) stop('global project default is forbidden');
if (contract.invariants?.directApplyRequiredAfterGo !== true) stop('direct apply after GO is required');
if (contract.invariants?.newMethodologyForbiddenAfterGo !== true) stop('new methodology after GO must be forbidden');
if (contract.invariants?.manualActionByPaulaForbidden !== true) stop('manual action by Paula must be forbidden');
if (contract.tenantRules?.tya?.multiProject !== true) stop('TyA must remain multi-project');
if (contract.tenantRules?.tya?.defaultProjectId) stop('TyA cannot define defaultProjectId');
if (contract.tenantRules?.tya?.cinepolisNeverGlobalDefault !== true) stop('Cinépolis must remain non-default');
if (contract.currentCandidate?.candidateId !== 'V156') stop('unexpected active candidate');
if (contract.currentCandidate?.state !== 'AUDITED_GO_READY_DIRECT_APPLY') stop('V156 must remain ready for direct apply');
if (contract.currentCandidate?.operation !== 'APPLY_DELTA_DIRECTLY') stop('V156 operation must be APPLY_DELTA_DIRECTLY');

if (product.multiTenant !== true) stop('product policy must remain multi-tenant');
if (product.integrationMethod !== 'APPLY_DELTA_DIRECTLY') stop('product policy must require direct apply');
if (product.rules?.localIncomingLaneRequired !== false) stop('product policy must reject incoming lane');
if (product.rules?.manualActionByPaulaAllowed !== false) stop('product policy must reject manual action by Paula');
if (product.rules?.newMethodologyAfterGoAllowed !== false) stop('product policy must reject new methodology after GO');
if (tenant.multiProject !== true) stop('TyA policy must remain multi-project');
if (tenant.projectSelection !== 'explicit') stop('TyA project selection must remain explicit');
if (tenant.integrationMethod !== 'APPLY_DELTA_DIRECTLY') stop('TyA policy must require direct apply');
if (tenant.rules?.localIncomingLaneRequired !== false) stop('TyA policy must reject incoming lane');
if (tenant.rules?.manualActionByPaulaAllowed !== false) stop('TyA policy must reject manual action by Paula');

for (const required of [
  'ACTIVO, DEFINITIVO, OBLIGATORIO Y PREVALENTE',
  'APPLY_DELTA_DIRECTLY',
  'incoming/',
  'PowerShell para Paula',
  'Ningún documento posterior puede sustituir esta metodología'
]) {
  if (!addendum.includes(required)) stop(`prevalent addendum missing marker: ${required}`);
}

for (const required of [
  'Método obligatorio basado en Orbit',
  'APPLY_DELTA_DIRECTLY',
  'incoming/',
  'Ningún agente puede sustituir esta metodología'
]) {
  if (!agents.includes(required)) stop(`AGENTS.md missing marker: ${required}`);
}

const forbiddenActiveFiles = [
  'app/docs/ADDENDUM-MAESTRO-ARQUITECTURA-DEFINITIVA-CARRIL-EMPALMES-CXORBIA-20260717.md',
  'app/docs/ADDENDUM-MAESTRO-CARRIL-OPERATIVO-LOCAL-REUTILIZABLE-CXORBIA-20260717.md',
  'tools/integration/run-latest.mjs',
  'tools/integration/CXORBIA-EMPALMAR-ULTIMA-CANDIDATA.cmd',
  'tools/integration/workspace-preflight.mjs',
  'tools/integration/empalme-candidate.mjs',
  'tools/integration/lib.mjs',
  'tools/integration/README.md'
];

for (const path of forbiddenActiveFiles) {
  if (existsSync(resolve(root, path))) stop(`revoked local-lane component still active: ${path}`);
}

process.stdout.write(`${JSON.stringify({
  ok: true,
  state: 'PASS_ORBIT_DIRECT_APPLY_METHOD_LOCK',
  architectureId: contract.architectureId,
  executionPlane: contract.executionPlane,
  liveBranch: contract.liveBranch,
  candidateId: contract.currentCandidate.candidateId,
  candidateState: contract.currentCandidate.state,
  operation: contract.currentCandidate.operation,
  multiTenant: true,
  multiProject: true,
  projectSelection: 'explicit',
  cinepolisNeverDefault: true,
  localLanePresent: false
}, null, 2)}\n`);
