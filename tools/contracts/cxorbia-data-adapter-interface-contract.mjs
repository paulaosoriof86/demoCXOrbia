#!/usr/bin/env node
/*
  CXOrbia - data adapter interface contract
  Synthetic validation only. No deploy, no provider calls, no DB writes, no imports.
*/

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : '.tmp/cxorbia-data-adapter-interface-contract';

const requiredMethods = [
  { name: 'list', type: 'read', requiredArgs: ['collection'], returns: 'array' },
  { name: 'get', type: 'read', requiredArgs: ['collection', 'id'], returns: 'object_or_null' },
  { name: 'set', type: 'write', requiredArgs: ['collection', 'id', 'data'], returns: 'object' },
  { name: 'update', type: 'write', requiredArgs: ['collection', 'id', 'patch'], returns: 'object' },
  { name: 'remove', type: 'write', requiredArgs: ['collection', 'id'], returns: 'object' },
  { name: 'query', type: 'read', requiredArgs: ['collection', 'where'], returns: 'array' },
  { name: 'transaction', type: 'write', requiredArgs: ['steps'], returns: 'object' }
];

const adapters = [
  { adapterId: 'localStorage', status: 'current', gate: 'active_local_only', methods: ['list', 'get', 'set', 'update', 'remove', 'query', 'transaction'], preservesInterface: true },
  { adapterId: 'firestore', status: 'planned', gate: 'disabled', methods: ['list', 'get', 'set', 'update', 'remove', 'query', 'transaction'], preservesInterface: true },
  { adapterId: 'mockStaging', status: 'planned', gate: 'preview', methods: ['list', 'get', 'set', 'update', 'remove', 'query', 'transaction'], preservesInterface: true }
];

const allowedGates = new Set(['active_local_only', 'disabled', 'preview', 'ready_for_gate', 'active_controlled']);

function validateAdapter(adapter) {
  const errors = [];
  const warnings = [];
  if (!adapter.adapterId) errors.push('missing_adapterId');
  if (!allowedGates.has(adapter.gate)) errors.push('invalid_gate');
  if (!Array.isArray(adapter.methods)) errors.push('invalid_methods');
  if (adapter.preservesInterface !== true) errors.push('interface_not_preserved');
  for (const method of requiredMethods) {
    if (!adapter.methods?.includes(method.name)) errors.push(`missing_method_${method.name}`);
  }
  if (adapter.adapterId === 'firestore' && adapter.gate === 'active_controlled') warnings.push('firestore_active_requires_external_authorization');
  return { adapterId: adapter.adapterId, ok: errors.length === 0, errors, warnings, gate: adapter.gate, methodCount: adapter.methods?.length || 0 };
}

const results = adapters.map(validateAdapter);
const failures = results.filter(r => !r.ok);
const report = {
  gate: 'cxorbia-data-adapter-interface-contract',
  generatedAt: new Date().toISOString(),
  verdict: failures.length ? 'NO_GO_DATA_ADAPTER_INTERFACE_CONTRACT' : 'GO_DATA_ADAPTER_INTERFACE_PREVIEW_ONLY',
  adapterCount: adapters.length,
  requiredMethods,
  failureCount: failures.length,
  results,
  reusableCxorbia: true,
  exclusiveClient: false,
  safeState: { deploy: false, providerCalls: false, dbWrites: false, imports: false, production: false }
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'cxorbia-data-adapter-interface-contract.json'), JSON.stringify(report, null, 2), 'utf8');
const md = [
  '# CXOrbia data adapter interface contract', '',
  `Generated: ${report.generatedAt}`,
  `Verdict: ${report.verdict}`,
  `Adapters: ${report.adapterCount}`,
  `Failures: ${report.failureCount}`, '',
  '## Required methods',
  ...requiredMethods.map(m => `- ${m.name}: ${m.type} / ${m.returns}`), '',
  '## Results',
  ...results.map(r => `- ${r.adapterId}: ${r.gate} / ${r.ok ? 'ok' : r.errors.join(', ')}`), '',
  '## Safe state',
  '- No deploy', '- No provider calls', '- No DB writes', '- No imports', '- No production', ''
].join('\n');
fs.writeFileSync(path.join(outDir, 'cxorbia-data-adapter-interface-contract.md'), md, 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
