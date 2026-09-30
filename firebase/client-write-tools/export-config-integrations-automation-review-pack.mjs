import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'firebase', 'private-output');
fs.mkdirSync(outDir, { recursive: true });

function readJson(fileName) {
  const p = path.join(outDir, fileName);
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

const dryRun = readJson('config-integrations-automation-dry-run.json');
const validation = readJson('config-integrations-automation-validation.json');
const writePlan = readJson('config-integrations-automation-write-plan-dry-run.json');
const writeValidation = readJson('config-integrations-automation-write-plan-validation.json');

const review = {
  generatedAt: new Date().toISOString(),
  mode: 'config-integrations-automation-review-pack-read-only',
  available: {
    dryRun: !!dryRun,
    validation: !!validation,
    writePlan: !!writePlan,
    writeValidation: !!writeValidation
  },
  counts: {
    dryRun: dryRun?.counts || null,
    validation: validation?.counts || null,
    writePlan: writePlan?.counts || null,
    writeValidation: writeValidation?.counts || null
  },
  reviewQueues: {
    validationFail: validation?.fail || [],
    validationReview: validation?.review || [],
    writeSkipped: writePlan?.skipped || [],
    writeValidationFail: writeValidation?.fail || [],
    writeValidationReview: writeValidation?.review || [],
    integrationsNeedConfig: (dryRun?.tenantIntegrations || []).filter((x) => x.status === 'draft'),
    automationRulesInactive: (dryRun?.automationRules || []).filter((x) => x.active === false),
    catalogSecretFields: (dryRun?.catalog || []).filter((x) => Array.isArray(x.secretFields) && x.secretFields.length).map((x) => ({ integrationId: x.id, name: x.name, secretFields: x.secretFields }))
  }
};

const outJson = path.join(outDir, 'config-integrations-automation-review-pack.json');
const outMd = path.join(outDir, 'config-integrations-automation-review-pack.md');
const integrationsCsv = path.join(outDir, 'config-integrations-automation-review-integrations.csv');
const automationsCsv = path.join(outDir, 'config-integrations-automation-review-automations.csv');

fs.writeFileSync(outJson, JSON.stringify(review, null, 2), 'utf8');

const md = [];
md.push('# Paquete de revisión — Configuración / Integraciones / Automatizaciones');
md.push('');
md.push('Modo: solo lectura. Resume lo que debe revisarse antes de cualquier carga DEV.');
md.push('');
md.push('## Disponibilidad');
Object.entries(review.available).forEach(([k, v]) => md.push(`- ${k}: ${v ? 'sí' : 'no'}`));
md.push('');
md.push('## Conteos');
Object.entries(review.counts).forEach(([k, v]) => md.push(`- ${k}: ${v ? JSON.stringify(v) : 'no disponible'}`));
md.push('');
md.push('## Colas de revisión');
Object.entries(review.reviewQueues).forEach(([k, v]) => md.push(`- ${k}: ${Array.isArray(v) ? v.length : 0}`));
md.push('');
md.push('## Decisión');
md.push('- Las integraciones quedan en draft hasta tener configuración real y credenciales seguras.');
md.push('- Las automatizaciones quedan inactivas hasta tener integración real y prueba verificable.');
md.push('- No cargar DEV si la validación tiene FAIL.');
md.push('- No activar nada sin autorización explícita.');
md.push('');
md.push('## Archivos');
md.push(`- ${outJson}`);
md.push(`- ${outMd}`);
md.push(`- ${integrationsCsv}`);
md.push(`- ${automationsCsv}`);
fs.writeFileSync(outMd, md.join('\n'), 'utf8');

const integrationLines = ['integrationId,name,status,planAllowed,requiresCredentialFields,lastTestStatus,lastError'];
for (const item of dryRun?.tenantIntegrations || []) {
  const catalog = (dryRun.catalog || []).find((x) => x.id === item.integrationId) || {};
  const row = [item.integrationId, catalog.name || '', item.status, item.planAllowed, (catalog.secretFields || []).join('|'), item.lastTestStatus, item.lastError]
    .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`);
  integrationLines.push(row.join(','));
}
fs.writeFileSync(integrationsCsv, integrationLines.join('\n'), 'utf8');

const automationLines = ['ruleId,event,label,active,channel,target,integrationId,countryScope'];
for (const item of dryRun?.automationRules || []) {
  const row = [item.ruleId, item.event, item.label, item.active, item.channel, item.target, item.integrationId, (item.countryScope || []).join('|')]
    .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`);
  automationLines.push(row.join(','));
}
fs.writeFileSync(automationsCsv, automationLines.join('\n'), 'utf8');

console.log(md.join('\n'));
process.exit(Object.values(review.reviewQueues).some((x) => Array.isArray(x) && x.length) ? 1 : 0);
