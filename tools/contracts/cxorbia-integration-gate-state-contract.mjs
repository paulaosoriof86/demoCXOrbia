#!/usr/bin/env node
/*
  CXOrbia - reusable integration gate state contract
  Synthetic validation only. No deploy, no provider calls, no DB writes, no imports.
*/

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : '.tmp/cxorbia-integration-gate-state-contract';

const providers = ['firestore', 'auth', 'storage', 'make', 'gemini', 'messaging', 'email', 'payments', 'external_source'];
const states = new Set([
  'off',
  'preview',
  'blocked_missing_config',
  'blocked_review_required',
  'ready_for_gate',
  'active_controlled',
  'paused',
  'failed'
]);

const allowedTransitions = new Set([
  'off->preview',
  'preview->blocked_missing_config',
  'preview->blocked_review_required',
  'preview->ready_for_gate',
  'blocked_missing_config->preview',
  'blocked_review_required->preview',
  'ready_for_gate->active_controlled',
  'active_controlled->paused',
  'paused->active_controlled',
  'active_controlled->failed',
  'failed->preview',
  'active_controlled->off',
  'paused->off',
  'failed->off'
]);

const sampleGateChanges = [
  { provider: 'make', from: 'off', to: 'preview', tenantId: 'tenant-demo', projectId: 'project-demo', authorizedBy: null, evidenceRef: 'doc-preview-plan' },
  { provider: 'gemini', from: 'preview', to: 'ready_for_gate', tenantId: 'tenant-demo', projectId: 'project-demo', authorizedBy: 'human-reviewer', evidenceRef: 'ai-bank-review-approved' },
  { provider: 'storage', from: 'ready_for_gate', to: 'active_controlled', tenantId: 'tenant-demo', projectId: 'project-demo', authorizedBy: 'paula', evidenceRef: 'storage-rules-review' },
  { provider: 'payments', from: 'preview', to: 'active_controlled', tenantId: 'tenant-demo', projectId: 'project-demo', authorizedBy: null, evidenceRef: null },
  { provider: 'external_source', from: 'preview', to: 'blocked_review_required', tenantId: 'tenant-demo', projectId: 'project-demo', authorizedBy: null, evidenceRef: 'conflict-report' }
];

function validateChange(change) {
  const errors = [];
  const warnings = [];
  if (!providers.includes(change.provider)) errors.push('invalid_provider');
  if (!states.has(change.from)) errors.push('invalid_from_state');
  if (!states.has(change.to)) errors.push('invalid_to_state');
  if (!change.tenantId) errors.push('missing_tenantId');
  if (!change.projectId) errors.push('missing_projectId');
  if (!allowedTransitions.has(`${change.from}->${change.to}`)) errors.push('transition_not_allowed');
  if (change.to === 'active_controlled' && !change.authorizedBy) errors.push('missing_authorizedBy_for_active_controlled');
  if (change.to === 'active_controlled' && !change.evidenceRef) errors.push('missing_evidenceRef_for_active_controlled');
  if (change.to.startsWith('blocked') && !change.evidenceRef) warnings.push('blocked_state_without_evidenceRef');
  return { provider: change.provider, from: change.from, to: change.to, ok: errors.length === 0, errors, warnings };
}

const results = sampleGateChanges.map(validateChange);
const failures = results.filter(r => !r.ok);
const report = {
  gate: 'cxorbia-integration-gate-state-contract',
  generatedAt: new Date().toISOString(),
  verdict: failures.length ? 'NO_GO_GATE_STATE_CONTRACT' : 'GO_GATE_STATE_CONTRACT_PREVIEW_ONLY',
  providers,
  states: [...states],
  transitionCount: allowedTransitions.size,
  changeCount: sampleGateChanges.length,
  failureCount: failures.length,
  results,
  reusableCxorbia: true,
  exclusiveClient: false,
  safeState: { deploy: false, providerCalls: false, dbWrites: false, imports: false, production: false }
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'cxorbia-integration-gate-state-contract.json'), JSON.stringify(report, null, 2), 'utf8');
const md = [
  '# CXOrbia integration gate state contract', '',
  `Generated: ${report.generatedAt}`,
  `Verdict: ${report.verdict}`,
  `Providers: ${providers.length}`,
  `States: ${states.size}`,
  `Failures: ${failures.length}`, '',
  '## Results',
  ...results.map(r => `- ${r.provider}: ${r.from} -> ${r.to}: ${r.ok ? 'ok' : r.errors.join(', ')}`), '',
  '## Safe state',
  '- No deploy', '- No provider calls', '- No DB writes', '- No imports', '- No production', ''
].join('\n');
fs.writeFileSync(path.join(outDir, 'cxorbia-integration-gate-state-contract.md'), md, 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
