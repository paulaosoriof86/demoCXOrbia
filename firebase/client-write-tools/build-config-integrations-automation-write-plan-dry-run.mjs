import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'firebase', 'private-output');
fs.mkdirSync(outDir, { recursive: true });

const inputPath = path.join(outDir, 'config-integrations-automation-dry-run.json');
const validationPath = path.join(outDir, 'config-integrations-automation-validation.json');

if (!fs.existsSync(inputPath)) {
  console.error('No existe dry-run config/integrations/automation:', inputPath);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const validation = fs.existsSync(validationPath) ? JSON.parse(fs.readFileSync(validationPath, 'utf8')) : null;
if (validation && validation.status === 'FAIL') {
  console.error('La validación del dry-run está en FAIL. No se genera write-plan.');
  process.exit(1);
}

function safeId(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-|-$/g, '') || 'item';
}

function op(pathValue, value) {
  return { op: 'set', path: pathValue, data: value };
}

function auditLog(id, area, entityPath, action, afterSanitized) {
  return op(`tenants/tya/configAuditLogs/${id}`, {
    tenantId: 'tya',
    auditId: id,
    area,
    entityPath,
    action,
    beforeSanitized: null,
    afterSanitized,
    createdAt: '__SERVER_TIMESTAMP__',
    createdBy: 'dry-run',
    countryScope: null,
    projectId: afterSanitized?.projectId || null
  });
}

const writePlan = [];
const skipped = [];
const generatedAt = new Date().toISOString();
const batchId = 'config-integrations-automation-dry-run-' + generatedAt.slice(0, 10);

writePlan.push(op(`tenants/tya/configAuditLogs/${batchId}`, {
  tenantId: 'tya',
  auditId: batchId,
  area: 'security',
  entityPath: 'dry-run/write-plan',
  action: 'create',
  beforeSanitized: null,
  afterSanitized: { mode: 'write-plan-dry-run-only', source: inputPath },
  createdAt: '__SERVER_TIMESTAMP__',
  createdBy: 'dry-run',
  countryScope: ['GT', 'HN'],
  projectId: null
}));

for (const item of data.catalog || []) {
  const id = safeId(item.id);
  const pathValue = `globalCatalog/integrations/items/${id}`;
  writePlan.push(op(pathValue, { ...item, id }));
}

if (data.tenantConfig) {
  const pathValue = 'tenants/tya/config/main';
  writePlan.push(op(pathValue, data.tenantConfig));
  writePlan.push(auditLog('audit-tenant-config-main-dry-run', 'tenant', pathValue, 'update', data.tenantConfig));
}

if (data.projectConfig) {
  const projectId = safeId(data.projectConfig.projectId || 'cinepolis-plantilla');
  const pathValue = `tenants/tya/projects/${projectId}/config/main`;
  writePlan.push(op(pathValue, { ...data.projectConfig, projectId }));
  writePlan.push(auditLog('audit-project-config-main-dry-run', 'project', pathValue, 'update', { ...data.projectConfig, projectId }));
}

for (const integration of data.tenantIntegrations || []) {
  const integrationId = safeId(integration.integrationId);
  if (integration.status === 'active' && !integration.secretRef) {
    skipped.push({ type: 'tenantIntegration', integrationId, reason: 'active_without_secretRef' });
    continue;
  }
  const pathValue = `tenants/tya/integrations/${integrationId}`;
  writePlan.push(op(pathValue, { ...integration, integrationId }));
}

for (const rule of data.automationRules || []) {
  const ruleId = safeId(rule.ruleId);
  if (rule.active && ['whatsapp', 'email', 'sheet', 'webhook'].includes(rule.channel) && !rule.integrationId) {
    skipped.push({ type: 'automationRule', ruleId, reason: 'active_without_integration' });
    continue;
  }
  const pathValue = `tenants/tya/automationRules/${ruleId}`;
  writePlan.push(op(pathValue, { ...rule, ruleId }));
}

if (data.aiConfig) {
  const pathValue = 'tenants/tya/config/ai';
  if (data.aiConfig.active && !data.aiConfig.secretRef) skipped.push({ type: 'aiConfig', reason: 'active_without_secretRef' });
  else writePlan.push(op(pathValue, data.aiConfig));
}

const byCollection = {};
for (const item of writePlan) {
  const parts = item.path.split('/').filter(Boolean);
  const col = parts[parts.length - 2] || 'unknown';
  byCollection[col] = (byCollection[col] || 0) + 1;
}

const output = {
  meta: {
    generatedAt,
    mode: 'config-integrations-automation-write-plan-dry-run-only',
    source: inputPath,
    validationStatus: validation?.status || 'not-run',
    rules: [
      'No escribe Firestore.',
      'No incluye secretos.',
      'No activa integraciones sin secretRef.',
      'No activa automatizaciones sin integración real.',
      'No debe ejecutarse sin autorización DEV explícita.'
    ]
  },
  counts: {
    writeOps: writePlan.length,
    skipped: skipped.length,
    byCollection
  },
  writePlan,
  skipped
};

const jsonPath = path.join(outDir, 'config-integrations-automation-write-plan-dry-run.json');
const mdPath = path.join(outDir, 'config-integrations-automation-write-plan-dry-run-summary.md');
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2), 'utf8');

const md = [];
md.push('# Write-plan Configuración / Integraciones / Automatizaciones — dry-run');
md.push('');
md.push('Modo: solo lectura. No escribe Firestore.');
md.push('');
md.push(`Ops candidatas: ${writePlan.length}`);
md.push(`Skipped: ${skipped.length}`);
md.push('');
md.push('## Ops por colección');
md.push('| Colección | Ops |');
md.push('|---|---:|');
Object.entries(byCollection).forEach(([k, v]) => md.push(`| ${k} | ${v} |`));
md.push('');
if (skipped.length) {
  md.push('## Skipped');
  skipped.forEach((x) => md.push(`- ${x.type}: ${x.integrationId || x.ruleId || ''} ${x.reason}`));
  md.push('');
}
md.push('## Salidas');
md.push(`- ${jsonPath}`);
md.push(`- ${mdPath}`);
md.push('');
md.push('## Regla');
md.push('Este write-plan no debe cargarse en Firestore sin revisión, reglas DEV y autorización explícita.');
fs.writeFileSync(mdPath, md.join('\n'), 'utf8');

console.log(md.join('\n'));
process.exit(skipped.length ? 1 : 0);
