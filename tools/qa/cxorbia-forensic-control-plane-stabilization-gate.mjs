#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const outDir = path.join(root, '.tmp/cxorbia-forensic-control-plane-stabilization');
fs.mkdirSync(outDir, { recursive: true });
const blockers = [];
const checks = [];
const warnings = [];
const contractPath = 'backend/contracts/cxorbia-active-runtime-control-plane-v1.json';

const add = (list, code, detail = '') => list.push(detail ? `${code}:${detail}` : code);
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const exists = relative => fs.existsSync(path.join(root, relative));
const requireFile = relative => {
  if (!exists(relative)) add(blockers, 'FILE_MISSING', relative);
  else add(checks, 'FILE_PRESENT', relative);
};
const requireMarker = (source, marker, code) => {
  if (!source.includes(marker)) add(blockers, code, marker);
  else add(checks, code, marker);
};
const forbidMarker = (source, marker, code) => {
  if (source.includes(marker)) add(blockers, code, marker);
  else add(checks, code, marker);
};
const syntax = relative => {
  const result = spawnSync(process.execPath, ['--check', relative], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) add(blockers, 'SYNTAX_FAIL', `${relative}:${String(result.stderr || result.stdout || '').slice(0, 1000)}`);
  else add(checks, 'SYNTAX_PASS', relative);
};

requireFile(contractPath);
let contract = null;
if (!blockers.length) {
  try { contract = JSON.parse(read(contractPath)); }
  catch (error) { add(blockers, 'CONTRACT_INVALID_JSON', error.message); }
}

if (contract) {
  if (contract.contractId !== 'cxorbia-active-runtime-control-plane-v1') add(blockers, 'CONTRACT_ID_INVALID');
  if (contract.repository !== 'paulaosoriof86/demoCXOrbia' || contract.branch !== 'docs-tya-v6-v71-audit' || Number(contract.pullRequest) !== 7) add(blockers, 'CONTRACT_TARGET_INVALID');
  const expectedOrder = ['AUTH_READY', 'CLAIMS_READY', 'MEMBERSHIP_READY', 'DATA_READY', 'SHELL_READY', 'ROUTE_READY', 'VIEW_READY', 'DOMAIN_READY'];
  if (JSON.stringify(contract.runtimeStateOrder) !== JSON.stringify(expectedOrder)) add(blockers, 'STATE_ORDER_INVALID');
  else add(checks, 'STATE_ORDER_EXACT');
  if (contract.transactions?.access?.commitPolicy !== 'retain_after_access_pass' || contract.transactions?.access?.invalidatedByReadOnlyRuntimeFailure !== false) add(blockers, 'ACCESS_TRANSACTION_SEPARATION_INVALID');
  else add(checks, 'ACCESS_TRANSACTION_SEPARATED');
  if (contract.transactions?.runtime?.usesSingleBrowserAuthority !== true || contract.transactions?.runtime?.providerWrites !== false) add(blockers, 'RUNTIME_TRANSACTION_INVALID');
  else add(checks, 'RUNTIME_SINGLE_AUTHORITY_READONLY');

  const active = contract.activePath || {};
  for (const key of ['request', 'workflow', 'orchestrator', 'stateMachine', 'runtimeGate', 'staticGate']) requireFile(active[key]);
  for (const entry of contract.historicalNotActive || []) requireFile(entry.path);

  if (!blockers.length) {
    for (const relative of [active.orchestrator, active.stateMachine, active.runtimeGate, active.staticGate]) syntax(relative);
    const workflow = read(active.workflow);
    const orchestrator = read(active.orchestrator);
    const stateMachine = read(active.stateMachine);
    const runtimeGate = read(active.runtimeGate);

    requireMarker(workflow, 'ref: ${{ github.sha }}', 'WORKFLOW_CAPTURES_TRIGGER_COMMIT');
    requireMarker(workflow, 'cp "$REQUEST_PATH" "$REQUEST_COPY"', 'WORKFLOW_COPIES_REQUEST_BEFORE_DETACH');
    requireMarker(workflow, 'git checkout --detach "$SOURCE_SHA"', 'WORKFLOW_DETACHED_SOURCE_SHA');
    requireMarker(workflow, 'test "$(git rev-parse HEAD)" = "$SOURCE_SHA"', 'WORKFLOW_VERIFIES_EXACT_SHA');
    requireMarker(workflow, 'REQUEST_ID_CHANGED_DURING_RUN', 'WORKFLOW_ATOMIC_REQUEST_CONSUMPTION');
    forbidMarker(workflow, 'ref: docs-tya-v6-v71-audit', 'WORKFLOW_BRANCH_NAME_CHECKOUT_FORBIDDEN');

    requireMarker(orchestrator, "request.schemaVersion === 'cxorbia.c6.client-access-runtime-request.v3'", 'ORCHESTRATOR_REQUEST_V3');
    requireMarker(orchestrator, 'request.sourceHeadSha === current', 'ORCHESTRATOR_EXACT_SOURCE_SHA');
    forbidMarker(orchestrator, "rev-parse', 'HEAD^", 'ORCHESTRATOR_HEAD_PARENT_INFERENCE_FORBIDDEN');
    requireMarker(orchestrator, "accessCommitPolicy === 'retain_after_access_pass'", 'ORCHESTRATOR_ACCESS_COMMIT_POLICY');
    requireMarker(orchestrator, 'runtimeReadOnly === true && request.rollbackAccessOnRuntimeFailure === false', 'ORCHESTRATOR_RUNTIME_SEPARATED');
    requireMarker(orchestrator, "'tools/qa/tya-phase-a-unified-runtime-state-machine-gate.mjs'", 'ORCHESTRATOR_SINGLE_RUNTIME_GATE');
    requireMarker(orchestrator, "'runtime_unified_state_machine'", 'ORCHESTRATOR_UNIFIED_RUNTIME_STAGE');
    requireMarker(orchestrator, 'if (!accessTransactionPassed && applyCompleted', 'ORCHESTRATOR_ROLLBACK_ONLY_ACCESS_FAILURE');
    requireMarker(orchestrator, "decision: 'PASS_C6_CLIENT_ACCESS_TRANSACTION'", 'ORCHESTRATOR_ACCESS_PASS_DECISION');
    forbidMarker(orchestrator, 'tya-c6-unified-human-auth-browser-smoke.mjs', 'DUPLICATE_STAFF_SHOPPER_GATE_INACTIVE');
    forbidMarker(orchestrator, 'tya-c6-client-auth-browser-smoke.mjs', 'DUPLICATE_CLIENT_GATE_INACTIVE');
    forbidMarker(orchestrator, 'tya-phase-a-remote-domain-dynamic-wrapper.mjs', 'STRING_WRAPPER_INACTIVE');
    forbidMarker(orchestrator, "run('runtime_client'", 'DUPLICATE_CLIENT_RUNTIME_STAGE_FORBIDDEN');

    for (const marker of ['AUTH_READY', 'CLAIMS_READY', 'MEMBERSHIP_READY', 'DATA_READY', 'SHELL_READY', 'ROUTE_READY', 'VIEW_READY', 'DOMAIN_READY']) requireMarker(stateMachine, `'${marker}'`, `STATE_${marker}_PRESENT`);
    requireMarker(stateMachine, 'confidentialityPending', 'STATE_CONFIDENTIALITY_OBSERVABLE');
    requireMarker(stateMachine, 'railBuilt', 'STATE_RAIL_OBSERVABLE');
    requireMarker(stateMachine, 'navItemPresent', 'STATE_NAV_ITEM_OBSERVABLE');
    requireMarker(stateMachine, 'navActive', 'STATE_NAV_HIGHLIGHT_SEPARATE');
    requireMarker(stateMachine, 'routeReady = !expectedRoute || routeId === expectedRoute', 'STATE_ROUTE_AUTHORITY_NOT_NAV_HIGHLIGHT');
    forbidMarker(stateMachine, 'waitForFunction(', 'STATE_MACHINE_COMPOSITE_WAIT_FORBIDDEN');

    requireMarker(runtimeGate, "from './cxorbia-runtime-state-machine.mjs'", 'UNIFIED_GATE_IMPORTS_STATE_MACHINE');
    requireMarker(runtimeGate, "['dashboard','visitas','postulaciones','shoppers','financiero','reservas']", 'UNIFIED_GATE_ADMIN_PHASE_A_ROUTES');
    requireMarker(runtimeGate, "['miperfil','misvisitas','visitas','reservas']", 'UNIFIED_GATE_SHOPPER_PHASE_A_ROUTES');
    requireMarker(runtimeGate, "['cli_dashboard']", 'UNIFIED_GATE_CLIENT_ROUTE');
    requireMarker(runtimeGate, 'for(let i=1;i<=3;i+=1)', 'UNIFIED_GATE_THREE_RELOADS');
    requireMarker(runtimeGate, "stage=principal+'_new_tab'", 'UNIFIED_GATE_NEW_TAB');
    requireMarker(runtimeGate, "decision:'PASS_PHASE_A_UNIFIED_RUNTIME_STATE_MACHINE'", 'UNIFIED_GATE_PASS_DECISION');
    requireMarker(runtimeGate, 'failureClass:classifyRuntimeFailure(error)', 'UNIFIED_GATE_FAILURE_CLASSIFICATION');
    forbidMarker(runtimeGate, 'waitForFunction(', 'UNIFIED_GATE_COMPOSITE_WAIT_FORBIDDEN');

    const inactive = new Set((contract.historicalNotActive || []).map(item => item.path));
    for (const expected of [
      'tools/qa/tya-c6-unified-human-auth-browser-smoke.mjs',
      'tools/qa/tya-c6-client-auth-browser-smoke.mjs',
      'tools/qa/tya-c6-remote-domain-finance-portals-reservations-gate.mjs',
      'tools/qa/tya-phase-a-remote-domain-dynamic-wrapper.mjs'
    ]) {
      if (!inactive.has(expected)) add(blockers, 'HISTORICAL_GATE_NOT_CLASSIFIED_INACTIVE', expected);
      else add(checks, 'HISTORICAL_GATE_CLASSIFIED_INACTIVE', expected);
    }
  }
}

const report = {
  schemaVersion: 'cxorbia.forensic-control-plane-stabilization.v1',
  generatedAt: new Date().toISOString(),
  decision: blockers.length ? 'HOLD_FORENSIC_CONTROL_PLANE_STABILIZATION' : 'PASS_FORENSIC_CONTROL_PLANE_STABILIZATION',
  blockers,
  warnings,
  checks,
  classification: {
    provenSystemicCause: 'fragmented_control_plane_and_conflicting_readiness_contracts',
    activeBrowserAuthorities: blockers.length ? null : 1,
    sourcePinnedToImmutableSha: blockers.length ? null : true,
    accessAndRuntimeSeparated: blockers.length ? null : true,
    historicalEvidenceDeleted: false
  },
  sourceOnly: true,
  credentialsUsed: false,
  providerReads: false,
  providerWrites: false,
  browserExecuted: false,
  runtimeExecuted: false,
  deploy: false,
  merge: false,
  production: false
};
fs.writeFileSync(path.join(outDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
fs.writeFileSync(path.join(outDir, 'report.md'), [
  '# CXOrbia forensic control-plane stabilization gate',
  '',
  `Decision: **${report.decision}**`,
  '',
  '## Blockers',
  ...(blockers.length ? blockers.map(item => `- ${item}`) : ['- none']),
  '',
  '## Checks',
  ...checks.map(item => `- ${item}`),
  '',
  '## Safety',
  '- source-only',
  '- no credentials',
  '- no provider reads or writes',
  '- no browser/runtime',
  '- no deploy/merge/production'
].join('\n') + '\n', 'utf8');
console.log(JSON.stringify(report, null, 2));
if (blockers.length) process.exit(1);
