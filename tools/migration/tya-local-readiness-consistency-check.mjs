#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'app/contracts/local-readiness-consistency-phase-a.tya.contract.json');
const gateFlags = ['runtimeEnabled', 'productionAllowed', 'firestoreWritesAllowed', 'storageWritesAllowed', 'makeWriteAllowed', 'emailSendAllowed', 'whatsappSendAllowed', 'geminiAllowed', 'importRealDataAllowed', 'deployAllowed', 'mergeAllowed'];

function readText(relPath) {
  const filePath = path.join(root, relPath);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf8');
}

function readJson(relPath) {
  const text = readText(relPath);
  if (text === null) return null;
  return JSON.parse(text);
}

function has(text, needle) {
  return typeof text === 'string' && text.includes(needle);
}

try {
  const contract = readJson('app/contracts/local-readiness-consistency-phase-a.tya.contract.json');
  if (!contract) throw new Error('Missing local readiness consistency contract');
  const issues = [];
  const warnings = [];

  for (const flag of gateFlags) {
    if (contract[flag] !== false) issues.push(`contract_${flag}_not_false`);
  }

  const fileChecks = (contract.filesToCheck || []).map((file) => ({ path: file, exists: fs.existsSync(path.join(root, file)) }));
  for (const row of fileChecks) if (!row.exists) issues.push(`missing_file:${row.path}`);

  const preflightDoc = readText('app/docs/PREFLIGHT-LOCAL-READINESS-PHASE-A-TYA-20260705.md') || '';
  const runbookDoc = readText('app/docs/RUNBOOK-LOCAL-READINESS-PHASE-A-TYA-20260705.md') || '';
  const preflightScript = readText('tools/migration/tya-local-readiness-preflight.mjs') || '';
  const runbookScript = readText('tools/migration/tya-phase-a-local-readiness-runbook.mjs') || '';

  for (const command of contract.expectedCommands || []) {
    if (!has(preflightDoc, command) && !has(runbookDoc, command)) issues.push(`documented_command_missing:${command}`);
  }

  for (const prefix of contract.expectedOutputPrefixes || []) {
    const documented = has(runbookDoc, prefix);
    const scripted = has(runbookScript, prefix);
    if (!documented) issues.push(`output_prefix_not_documented:${prefix}`);
    if (!scripted) issues.push(`output_prefix_not_scripted:${prefix}`);
  }

  const requiredScriptRefs = [
    'tya-synthetic-input-pack-preview-runner.mjs',
    'tya-synthetic-input-pack-readiness-map-preview.mjs',
    'tya-readiness-map-to-release-snapshot-preview-bridge.mjs',
    'tya-release-readiness-snapshot-preview-validator.mjs',
    'tya-release-readiness-sanitized-report.mjs',
    'tya-controlled-production-matrix-preview.mjs'
  ];
  for (const ref of requiredScriptRefs) {
    if (!has(runbookScript, ref)) issues.push(`runbook_missing_script_ref:${ref}`);
  }

  const contractRefs = [
    'local-readiness-preflight-phase-a.tya.contract.json',
    'phase-a-local-readiness-runbook.tya.contract.json'
  ];
  for (const ref of contractRefs) {
    if (!has(preflightScript, ref) && !has(runbookScript, ref) && !has(preflightDoc, ref) && !has(runbookDoc, ref)) warnings.push(`contract_ref_not_visible:${ref}`);
  }

  const contractsToInspect = [
    'app/contracts/local-readiness-preflight-phase-a.tya.contract.json',
    'app/contracts/phase-a-local-readiness-runbook.tya.contract.json'
  ];
  for (const contractFile of contractsToInspect) {
    const payload = readJson(contractFile);
    if (!payload) continue;
    for (const flag of gateFlags) {
      if (payload[flag] === true) issues.push(`${contractFile}_${flag}_true`);
    }
  }

  const report = {
    check: 'tya-local-readiness-consistency-check',
    status: issues.length ? 'review_required' : 'consistency_preview_ready',
    productionAllowed: false,
    deployAllowed: false,
    mergeAllowed: false,
    importRealDataAllowed: false,
    fileChecks,
    issues,
    warnings,
    nextSafeSteps: [
      'If consistency_preview_ready, local preflight can be executed before the runbook.',
      'If review_required, correct docs/scripts before local execution.',
      'Do not use this check as production approval.'
    ]
  };
  console.log(JSON.stringify(report, null, 2));
  if (issues.length) process.exitCode = 2;
} catch (error) {
  console.error(JSON.stringify({ check: 'tya-local-readiness-consistency-check', status: 'error', productionAllowed: false, error: error.message }, null, 2));
  process.exitCode = 1;
}
