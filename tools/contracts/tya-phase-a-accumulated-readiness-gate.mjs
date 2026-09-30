#!/usr/bin/env node
/* CXOrbia TyA - Phase A accumulated readiness gate
   Safe validator. No provider calls, no database writes, no imports, no deploy, no runtime switch.

   Purpose: consolidate Phase A readiness across continuity, state machine,
   admin actions, queues, Claude/prototype and Academia documentation.
*/

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;
const contractPath = 'backend/contracts/phase-a-accumulated-readiness-gate-v1.json';

const hardFails = [];
const warnings = [];
const info = [];
function add(list, message, extra = {}) { list.push({ message, ...extra }); }
function abs(rel) { return path.join(root, rel); }
function exists(rel) { return rel ? fs.existsSync(abs(rel)) : true; }
function readJson(rel) { return JSON.parse(fs.readFileSync(abs(rel), 'utf8')); }

let contract = null;
try {
  contract = readJson(contractPath);
  add(info, 'contract_loaded', { file: contractPath });
} catch (err) {
  add(hardFails, 'contract_missing_or_invalid', { file: contractPath, error: String(err.message || err) });
}

if (contract) {
  if (contract.mode !== 'source_safe_contract_only_no_writes') add(hardFails, 'contract_mode_must_be_no_writes', { mode: contract.mode });

  const principles = contract.readinessPrinciples || {};
  for (const principle of [
    'doNotRepeatLevel0Level1',
    'level0RecognizedAsReadyForProjectPeriodReadiness',
    'level1PreviouslyWorkedNoRestart',
    'phaseARealControlledOperation',
    'hrAsOperationalSource',
    'multiProjectRequired',
    'cinepolisAsConfigurableProject',
    'noSyntheticFixtureAsRealEvidence',
    'noDerivedTmpOutputAsOriginalEvidence',
    'runtimeRequiresExplicitPaulaGo',
    'noWritesBeforeFinalGates',
    'documentClaudeAcademiaPending'
  ]) {
    if (principles[principle] !== true) add(hardFails, 'required_readiness_principle_missing_or_false', { principle });
  }

  for (const block of contract.requiredContractBlocks || []) {
    if (block.contractFile && !exists(block.contractFile)) add(hardFails, 'required_contract_file_missing', { blockId: block.blockId, file: block.contractFile });
    if (block.validatorFile && !exists(block.validatorFile)) add(hardFails, 'required_validator_file_missing', { blockId: block.blockId, file: block.validatorFile });
    if (block.docFile && !exists(block.docFile)) add(hardFails, 'required_doc_file_missing', { blockId: block.blockId, file: block.docFile });
    if (block.contractFile && exists(block.contractFile)) add(info, 'required_contract_file_present', { blockId: block.blockId, file: block.contractFile });
    if (block.validatorFile && exists(block.validatorFile)) add(info, 'required_validator_file_present', { blockId: block.blockId, file: block.validatorFile });
    if (block.docFile && exists(block.docFile)) add(info, 'required_doc_file_present', { blockId: block.blockId, file: block.docFile });
  }

  const requiredAreas = new Set((contract.phaseAReadinessAreas || []).map((x) => x.area));
  for (const area of ['HR source-safe/full-flow', 'sync HR/plataforma', 'certificaciones preservadas', 'liquidaciones/pagos junio', 'acciones administrativas', 'colas operativas', 'Claude/prototipo', 'Academia']) {
    if (!requiredAreas.has(area)) add(hardFails, 'required_phase_a_readiness_area_missing', { area });
  }

  const hardStops = new Set(contract.hardStopsBeforeRuntimeDevGo || []);
  for (const stop of ['runtimeSwitchWithoutPaulaGo', 'firestoreWritesBeforeGate', 'hrWritesBeforeGate', 'importsBeforeGate', 'realPaymentBeforeGate', 'syntheticFixtureUsedAsRealEvidence', 'derivedTmpOutputUsedAsOriginalEvidence', 'uiModulePatchedFromBackend', 'level0Level1RestartedWithoutCause']) {
    if (!hardStops.has(stop)) add(hardFails, 'required_hard_stop_missing', { stop });
  }

  const goCriteria = new Set(contract.goCriteriaBeforeRuntimeDevRequest || []);
  for (const criterion of ['requiredContractBlocksPresent', 'noReversionCheckpointPresent', 'operationalContinuityGatePresent', 'stateMachinePresent', 'adminActionsAuditPresent', 'operationalQueuesPresent', 'claudeAndPrototypePendingDocumented', 'academiaImpactDocumented', 'noRuntimeWritesImportsDeployPayments', 'explicitPaulaGoRequestedOnlyAfterCleanGate']) {
    if (!goCriteria.has(criterion)) add(hardFails, 'go_criterion_missing', { criterion });
  }

  const safe = contract.safeStateExpected || {};
  for (const [key, expected] of Object.entries(safe)) {
    if (expected !== false) add(hardFails, 'safe_state_expected_must_be_false', { key, expected });
  }
}

for (const protectedPath of ['app/modules', 'app/core']) {
  // This validator does not inspect git diff; it only records that protected paths are hard-stop areas.
  add(info, 'protected_path_not_modified_by_this_validator', { path: protectedPath });
}

const report = {
  gate: 'cxorbia-tya-phase-a-accumulated-readiness-gate',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_PHASE_A_ACCUMULATED_READINESS_BLOCKED' : 'GO_PHASE_A_ACCUMULATED_READINESS_NO_RUNTIME',
  productionDecision: 'BLOCK_RUNTIME_IMPORTS_WRITES_DEPLOY_UNTIL_CLEAN_FINAL_GATE_AND_PAULA_GO',
  counts: {
    requiredBlocks: contract?.requiredContractBlocks?.length || 0,
    readinessAreas: contract?.phaseAReadinessAreas?.length || 0,
    hardStops: contract?.hardStopsBeforeRuntimeDevGo?.length || 0,
    goCriteria: contract?.goCriteriaBeforeRuntimeDevRequest?.length || 0,
    hardFails: hardFails.length,
    warnings: warnings.length,
    info: info.length
  },
  nextStep: hardFails.length
    ? 'Fix only root cause in accumulated readiness. Do not repeat Level 0/1, do not activate runtime, writes, imports, deploy or payments.'
    : 'Continue Phase A using accumulated readiness as source lock. Prepare final runtime DEV request only after clean gate and explicit Paula GO.',
  safeState: {
    runtimeConnected: false,
    frontendModified: false,
    modulesModified: false,
    firestoreWrites: false,
    importsExecuted: false,
    hrWrites: false,
    oldDatabaseConnected: false,
    deploy: false,
    production: false,
    rawPii: false,
    makeGeminiLive: false,
    realPayments: false
  },
  hardFails,
  warnings,
  info
};

if (outDir) {
  const target = abs(outDir);
  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(path.join(target, 'phase-a-accumulated-readiness-gate-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA Phase A accumulated readiness gate',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Production decision: ${report.productionDecision}`,
    '',
    '## Counts',
    `- Required blocks: ${report.counts.requiredBlocks}`,
    `- Readiness areas: ${report.counts.readinessAreas}`,
    `- Hard stops: ${report.counts.hardStops}`,
    `- GO criteria: ${report.counts.goCriteria}`,
    `- Hard fails: ${report.counts.hardFails}`,
    `- Warnings: ${report.counts.warnings}`,
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.blockId ? ` · ${x.blockId}` : ''}${x.file ? ` · ${x.file}` : ''}${x.area ? ` · ${x.area}` : ''}${x.stop ? ` · ${x.stop}` : ''}${x.criterion ? ` · ${x.criterion}` : ''}`) : ['- none']),
    '',
    '## Warnings',
    ...(warnings.length ? warnings.map(x => `- ${x.message}`) : ['- none']),
    '',
    '## Next step',
    `- ${report.nextStep}`,
    '',
    '## Safe state',
    '- Runtime not connected',
    '- Frontend not modified',
    '- Modules not modified',
    '- No Firestore writes',
    '- No imports',
    '- No HR writes',
    '- No old database connected',
    '- No deploy',
    '- No production',
    '- No raw PII',
    '- No Make/Gemini live',
    '- No real payments',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(target, 'phase-a-accumulated-readiness-gate-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
