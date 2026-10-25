#!/usr/bin/env node
/*
  CXOrbia - Firestore Phase A manifest contract
  Synthetic validation only. No deploy, no provider calls, no DB writes, no imports.
*/

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : '.tmp/cxorbia-firestore-phase-a-manifest-contract';

const collections = [
  { name: 'tenants', scope: 'tenant', requiredKeys: ['tenantId', 'displayName', 'status'], gate: 'disabled' },
  { name: 'projects', scope: 'project', requiredKeys: ['tenantId', 'projectId', 'displayName', 'country', 'currency', 'status'], gate: 'disabled' },
  { name: 'visits', scope: 'project', requiredKeys: ['tenantId', 'projectId', 'visitId', 'status', 'sourceRef'], gate: 'disabled' },
  { name: 'assignments', scope: 'project', requiredKeys: ['tenantId', 'projectId', 'visitId', 'assignmentSource', 'assignmentSyncStatus'], gate: 'disabled' },
  { name: 'applications', scope: 'project', requiredKeys: ['tenantId', 'projectId', 'applicationId', 'visitId', 'shopperId', 'status'], gate: 'disabled' },
  { name: 'shoppers', scope: 'tenant', requiredKeys: ['tenantId', 'shopperId', 'status'], gate: 'disabled' },
  { name: 'certificationStates', scope: 'project', requiredKeys: ['tenantId', 'projectId', 'shopperId', 'certificationId', 'status'], gate: 'disabled' },
  { name: 'settlements', scope: 'project', requiredKeys: ['tenantId', 'projectId', 'periodId', 'shopperId', 'status'], gate: 'disabled' },
  { name: 'integrationOutbox', scope: 'project', requiredKeys: ['tenantId', 'projectId', 'eventId', 'direction', 'status'], gate: 'disabled' },
  { name: 'reviewQueue', scope: 'project', requiredKeys: ['tenantId', 'projectId', 'reviewId', 'entityType', 'issueType', 'status'], gate: 'disabled' },
  { name: 'academyContent', scope: 'tenant', requiredKeys: ['tenantId', 'contentId', 'contentType', 'status'], gate: 'disabled' },
  { name: 'auditEvents', scope: 'tenant', requiredKeys: ['tenantId', 'eventId', 'actorRef', 'action', 'createdAt'], gate: 'disabled' }
];

const allowedScopes = new Set(['tenant', 'project']);
const allowedGates = new Set(['disabled', 'preview', 'ready_for_gate', 'active_controlled']);

function validateCollection(col) {
  const errors = [];
  const warnings = [];
  if (!col.name) errors.push('missing_name');
  if (!allowedScopes.has(col.scope)) errors.push('invalid_scope');
  if (!Array.isArray(col.requiredKeys) || col.requiredKeys.length === 0) errors.push('missing_requiredKeys');
  if (!allowedGates.has(col.gate)) errors.push('invalid_gate');
  if (!col.requiredKeys.includes('tenantId')) errors.push('missing_tenantId_key');
  if (col.scope === 'project' && !col.requiredKeys.includes('projectId')) errors.push('project_scope_missing_projectId_key');
  if (col.gate === 'active_controlled') warnings.push('active_controlled_not_expected_in_repo_contract');
  return { name: col.name, ok: errors.length === 0, errors, warnings, scope: col.scope, gate: col.gate, requiredKeys: col.requiredKeys };
}

const results = collections.map(validateCollection);
const failures = results.filter(r => !r.ok);
const byScope = results.reduce((acc, r) => {
  acc[r.scope] = (acc[r.scope] || 0) + 1;
  return acc;
}, {});

const report = {
  gate: 'cxorbia-firestore-phase-a-manifest-contract',
  generatedAt: new Date().toISOString(),
  verdict: failures.length ? 'NO_GO_FIRESTORE_MANIFEST_CONTRACT' : 'GO_FIRESTORE_MANIFEST_PREVIEW_ONLY',
  collectionCount: collections.length,
  failureCount: failures.length,
  byScope,
  results,
  reusableCxorbia: true,
  exclusiveClient: false,
  safeState: { deploy: false, providerCalls: false, dbWrites: false, imports: false, production: false }
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'cxorbia-firestore-phase-a-manifest-contract.json'), JSON.stringify(report, null, 2), 'utf8');
const md = [
  '# CXOrbia Firestore Phase A manifest contract', '',
  `Generated: ${report.generatedAt}`,
  `Verdict: ${report.verdict}`,
  `Collections: ${report.collectionCount}`,
  `Failures: ${report.failureCount}`, '',
  '## Collections',
  ...results.map(r => `- ${r.name}: ${r.scope} / ${r.gate} / ${r.ok ? 'ok' : r.errors.join(', ')}`), '',
  '## Safe state',
  '- No deploy', '- No provider calls', '- No DB writes', '- No imports', '- No production', ''
].join('\n');
fs.writeFileSync(path.join(outDir, 'cxorbia-firestore-phase-a-manifest-contract.md'), md, 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
