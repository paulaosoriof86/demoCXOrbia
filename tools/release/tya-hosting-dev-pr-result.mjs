#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const outFile = process.argv[2] || '.tmp/r15g-dev-deploy/pr-comment.md';
const read = file => {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return null; }
};
const reports = {
  localSource: read('.tmp/r15g-dev-deploy/source-semantics/report.json'),
  localRoles: read('.tmp/r15g-dev-deploy/role-smoke/phase-a-source-safe-visual-smoke-report.json'),
  localContext: read('.tmp/r15g-dev-deploy/project-period-kpi-history/report.json'),
  remoteSource: read('.tmp/r15g-dev-deploy/remote-source-semantics/report.json'),
  remoteRoles: read('.tmp/r15g-dev-deploy/remote-role-smoke/phase-a-source-safe-visual-smoke-report.json'),
  remoteContext: read('.tmp/r15g-dev-deploy/remote-project-period-kpi-history/report.json')
};
const line = (name, value) => {
  if (!value) return `- ${name}: NOT_REACHED`;
  const blockers = Array.isArray(value.blockers) ? value.blockers.length : 0;
  const warnings = Array.isArray(value.warnings) ? value.warnings.length : 0;
  return `- ${name}: ${value.decision || 'UNKNOWN'} · ok=${value.ok === true} · blockers=${blockers} · warnings=${warnings}`;
};
const jobStatus = process.env.CXORBIA_JOB_STATUS || 'unknown';
const ok = jobStatus === 'success';
const lines = [
  `## CXOrbia TyA · Hosting DEV V159 · ${ok ? 'PASS' : 'HOLD'}`,
  '',
  `- Run: ${process.env.CXORBIA_RUN_ID || 'unknown'} · attempt ${process.env.CXORBIA_RUN_ATTEMPT || 'unknown'}`,
  `- Commit de solicitud: ${process.env.GITHUB_SHA || 'unknown'}`,
  `- Estado del job: ${jobStatus}`,
  '- Alcance: Hosting DEV cxorbia-backend-dev / target cxorbia-dev',
  '- Producción y escrituras de datos: no autorizadas',
  '',
  '### Evidencia sanitizada',
  line('Local source semantics', reports.localSource),
  line('Local roles', reports.localRoles),
  line('Local proyecto/periodo/KPI/histórico', reports.localContext),
  line('Remote source semantics', reports.remoteSource),
  line('Remote roles', reports.remoteRoles),
  line('Remote proyecto/periodo/KPI/histórico', reports.remoteContext),
  '',
  ok
    ? 'Resultado: Hosting DEV publicado y smoke remoto PASS. Pendiente validación visual de Paula antes del freeze.'
    : 'Resultado: HOLD fail-closed. No se declara deploy ni PASS; revisar el primer paso fallido y la evidencia del run.'
];
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, `${lines.join('\n')}\n`, 'utf8');
console.log(JSON.stringify({
  ok,
  decision: ok ? 'PASS_HOSTING_DEV_RESULT_PUBLISHED' : 'HOLD_HOSTING_DEV_RESULT_PUBLISHED',
  outFile,
  jobStatus
}, null, 2));
