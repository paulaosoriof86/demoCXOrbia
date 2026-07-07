#!/usr/bin/env node
/*
  CXOrbia TyA - Today finish readiness checklist
  Static repo readiness validator. No deploy, no provider calls, no DB writes, no imports.
*/

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : '.tmp/tya-phase-a-today-finish-readiness';

const requiredFiles = [
  'app/docs/RC-PHASE-A-CONTROLLED-DECISION-20260706.md',
  'app/docs/PREDEPLOY-CONTROLADO-RC-PHASE-A-20260706.md',
  'app/docs/RC-PHASE-A-STAGING-DEPLOY-RUNBOOK-20260707.md',
  'app/docs/POST-STAGING-SMOKE-CHECKLIST-RC-PHASE-A-20260707.md',
  'tools/release/tya-rc-phase-a-predeploy-gate.mjs',
  'tools/release/tya-rc-phase-a-drift-gate.mjs',
  'tools/qa/tya-phase-a-visual-smoke.mjs',
  'tools/qa/tya-phase-a-remote-smoke.mjs',
  '.github/workflows/cxorbia-rc-phase-a-staging-deploy.yml',
  'app/docs/CLAUDE-PATRONES-REUTILIZABLES-BACKEND-PRODUCTO-CXORBIA-20260707.md',
  'app/docs/ADDENDUM-MAESTRO-PATRONES-REUTILIZABLES-CXORBIA-20260707.md',
  'app/docs/TEMPLATE-CLASIFICACION-BLOQUE-BACKEND-CXORBIA-20260707.md',
  'tools/contracts/cxorbia-project-config-contract.mjs',
  'tools/contracts/cxorbia-integration-gate-state-contract.mjs',
  'tools/contracts/cxorbia-human-review-queue-contract.mjs',
  'tools/migration/tya-assignment-sync-conflict-preview.mjs',
  'tools/migration/tya-assignment-sync-outbox-contract.mjs'
];

const manualCheckpoints = [
  { id: 'staging_url_confirmed', status: 'needs_external_confirmation', owner: 'Paula/GitHub Actions', reason: 'No se puede confirmar URL preview hasta que workflow staging entregue resultado visible.' },
  { id: 'firebase_secret_available', status: 'needs_external_confirmation', owner: 'Paula/GitHub Secrets', reason: 'El secret FIREBASE_SERVICE_ACCOUNT_CXORBIA_BACKEND_DEV no es visible desde el repo por seguridad.' },
  { id: 'post_staging_smoke', status: 'blocked_until_staging_url', owner: 'ChatGPT/Codex', reason: 'Debe ejecutarse despues de existir URL.' },
  { id: 'production_real_authorization', status: 'not_authorized', owner: 'Paula', reason: 'Produccion real, merge final e integraciones reales requieren autorizacion separada.' }
];

const categories = [
  { id: 'gates', label: 'Gates y predeploy', files: requiredFiles.slice(0, 9) },
  { id: 'claude_reusable', label: 'Paquete Claude reutilizable', files: requiredFiles.slice(9, 12) },
  { id: 'contracts_reusable', label: 'Contratos reutilizables', files: requiredFiles.slice(12, 15) },
  { id: 'sync_phase_a', label: 'Sync Phase A asignaciones', files: requiredFiles.slice(15, 17) }
];

function exists(file) {
  return fs.existsSync(path.resolve(file));
}

const fileResults = requiredFiles.map(file => ({ file, exists: exists(file) }));
const missing = fileResults.filter(x => !x.exists);
const categoryResults = categories.map(cat => ({
  id: cat.id,
  label: cat.label,
  total: cat.files.length,
  present: cat.files.filter(exists).length,
  missing: cat.files.filter(file => !exists(file))
}));

const hardFails = missing.length;
const externalBlocks = manualCheckpoints.filter(x => x.status !== 'ready' && x.status !== 'done').length;
const report = {
  gate: 'cxorbia-tya-phase-a-today-finish-readiness',
  generatedAt: new Date().toISOString(),
  verdict: hardFails ? 'NO_GO_REPO_READINESS_MISSING_FILES' : 'GO_REPO_READY_BLOCKED_ONLY_BY_EXTERNAL_STAGING_CONFIRMATION',
  requiredCount: requiredFiles.length,
  missingCount: missing.length,
  externalBlockCount: externalBlocks,
  fileResults,
  categoryResults,
  manualCheckpoints,
  safeState: { deploy: false, production: false, providerCalls: false, dbWrites: false, imports: false, secretsRead: false }
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'phase-a-today-finish-readiness.json'), JSON.stringify(report, null, 2), 'utf8');
const md = [
  '# CXOrbia TyA Phase A today finish readiness', '',
  `Generated: ${report.generatedAt}`,
  `Verdict: ${report.verdict}`,
  `Required files: ${report.requiredCount}`,
  `Missing files: ${report.missingCount}`,
  `External blocks: ${report.externalBlockCount}`, '',
  '## Categories',
  ...categoryResults.map(c => `- ${c.label}: ${c.present}/${c.total}${c.missing.length ? ` missing ${c.missing.join(', ')}` : ''}`), '',
  '## Manual checkpoints',
  ...manualCheckpoints.map(x => `- ${x.id}: ${x.status} / ${x.owner} / ${x.reason}`), '',
  '## Missing files',
  ...(missing.length ? missing.map(x => `- ${x.file}`) : ['- none']), '',
  '## Safe state',
  '- No deploy', '- No production', '- No provider calls', '- No DB writes', '- No imports', '- No secrets read', ''
].join('\n');
fs.writeFileSync(path.join(outDir, 'phase-a-today-finish-readiness.md'), md, 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails ? 1 : 0;
