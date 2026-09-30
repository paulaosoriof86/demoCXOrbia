#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const outDir = path.join(root, '.tmp/tya-c6-client-route-source-static');
fs.mkdirSync(outDir, { recursive: true });
const blockers = [];
const checks = [];
const forensicGate = 'tools/qa/cxorbia-forensic-control-plane-stabilization-gate.mjs';

if (!fs.existsSync(path.join(root, forensicGate))) blockers.push(`FILE_MISSING:${forensicGate}`);
else {
  const syntax = spawnSync(process.execPath, ['--check', forensicGate], { cwd: root, encoding: 'utf8' });
  if (syntax.status !== 0) blockers.push(`SYNTAX_FAIL:${forensicGate}:${String(syntax.stderr || syntax.stdout || '').slice(0, 1000)}`);
  else checks.push(`SYNTAX_PASS:${forensicGate}`);
}

let forensic = null;
if (!blockers.length) {
  const run = spawnSync(process.execPath, [forensicGate], { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  if (run.status !== 0) blockers.push(`FORENSIC_CONTROL_PLANE_GATE_FAILED:${String(run.stderr || run.stdout || '').replace(/\s+/g, ' ').slice(0, 1800)}`);
  else {
    try {
      forensic = JSON.parse(run.stdout);
      if (forensic.decision !== 'PASS_FORENSIC_CONTROL_PLANE_STABILIZATION') blockers.push(`FORENSIC_CONTROL_PLANE_DECISION_INVALID:${forensic.decision || 'missing'}`);
      else checks.push('PASS_FORENSIC_CONTROL_PLANE_STABILIZATION');
    } catch (error) {
      blockers.push(`FORENSIC_CONTROL_PLANE_OUTPUT_INVALID:${error.message}`);
    }
  }
}

const report = {
  schemaVersion: 'cxorbia.c6.client-route-source-static.v2',
  generatedAt: new Date().toISOString(),
  decision: blockers.length ? 'HOLD_C6_CLIENT_ROUTE_SOURCE_STATIC' : 'PASS_C6_CLIENT_ROUTE_SOURCE_STATIC',
  blockers,
  checks,
  forensicControlPlaneDecision: forensic?.decision || null,
  sourceOnly: true,
  providerReads: false,
  providerWrites: false,
  credentialsUsed: false,
  browserExecuted: false,
  runtimeExecuted: false,
  authWrites: 0,
  firestoreWrites: 0,
  membershipWrites: 0,
  deploy: false,
  merge: false,
  production: false
};
fs.writeFileSync(path.join(outDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
fs.writeFileSync(path.join(outDir, 'report.md'), [
  '# C6 Client route source/static compatibility gate',
  '',
  `Decision: **${report.decision}**`,
  '',
  `Forensic control plane: **${report.forensicControlPlaneDecision || 'not-run'}**`,
  '',
  '## Blockers',
  ...(blockers.length ? blockers.map(item => `- ${item}`) : ['- none']),
  '',
  '## Checks',
  ...checks.map(item => `- ${item}`)
].join('\n') + '\n', 'utf8');
console.log(JSON.stringify(report, null, 2));
if (blockers.length) process.exit(1);
