import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'firebase', 'private-output');
const filePath = path.join(outDir, 'config-integrations-automation-dry-run.json');

if (!fs.existsSync(filePath)) {
  console.error('No existe dry-run:', filePath);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const fail = [];
const review = [];

const secretPattern = /apiKey|password|token|secret|clientSecret|refreshToken|accessToken/i;
const allowedIntegrationStatus = new Set(['draft', 'configured', 'validated', 'active', 'failed', 'revoked', 'disabled']);
const allowedRuleChannels = new Set(['push', 'whatsapp', 'email', 'sheet', 'webhook', 'task']);

function hasSecretKey(obj, pathName = '') {
  if (!obj || typeof obj !== 'object') return [];
  const found = [];
  for (const [key, value] of Object.entries(obj)) {
    const p = pathName ? `${pathName}.${key}` : key;
    if (secretPattern.test(key)) found.push(p);
    if (value && typeof value === 'object') found.push(...hasSecretKey(value, p));
  }
  return found;
}

function required(obj, fields, prefix) {
  for (const field of fields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === '') fail.push(`${prefix}:missing:${field}`);
  }
}

const catalog = Array.isArray(data.catalog) ? data.catalog : [];
const tenantIntegrations = Array.isArray(data.tenantIntegrations) ? data.tenantIntegrations : [];
const automationRules = Array.isArray(data.automationRules) ? data.automationRules : [];

if (!catalog.length) fail.push('catalog:empty');
if (!tenantIntegrations.length) fail.push('tenantIntegrations:empty');
if (!automationRules.length) fail.push('automationRules:empty');

const catalogIds = new Set();
for (const item of catalog) {
  required(item, ['id', 'category', 'name', 'plan', 'requiredFields', 'secretFields', 'status'], `catalog:${item.id || 'no-id'}`);
  if (catalogIds.has(item.id)) fail.push(`catalog:duplicate:${item.id}`);
  catalogIds.add(item.id);
  if (!Array.isArray(item.secretFields)) fail.push(`catalog:${item.id}:secretFields_not_array`);
  if (!Array.isArray(item.requiredFields)) fail.push(`catalog:${item.id}:requiredFields_not_array`);
}

for (const integration of tenantIntegrations) {
  required(integration, ['tenantId', 'integrationId', 'status', 'planAllowed', 'configPublic', 'updatedAt'], `tenantIntegration:${integration.integrationId || 'no-id'}`);
  if (integration.tenantId !== 'tya') fail.push(`tenantIntegration:${integration.integrationId}:wrong_tenant`);
  if (!catalogIds.has(integration.integrationId)) fail.push(`tenantIntegration:${integration.integrationId}:not_in_catalog`);
  if (!allowedIntegrationStatus.has(integration.status)) fail.push(`tenantIntegration:${integration.integrationId}:bad_status:${integration.status}`);
  const secretKeys = hasSecretKey(integration.configPublic || {});
  if (secretKeys.length) fail.push(`tenantIntegration:${integration.integrationId}:configPublic_has_secret_keys:${secretKeys.join('|')}`);
  if (integration.status === 'active' && !integration.secretRef) review.push(`tenantIntegration:${integration.integrationId}:active_without_secretRef`);
}

for (const rule of automationRules) {
  required(rule, ['tenantId', 'ruleId', 'event', 'active', 'channel', 'target', 'template'], `automationRule:${rule.ruleId || 'no-id'}`);
  if (rule.tenantId !== 'tya') fail.push(`automationRule:${rule.ruleId}:wrong_tenant`);
  if (!allowedRuleChannels.has(rule.channel)) fail.push(`automationRule:${rule.ruleId}:bad_channel:${rule.channel}`);
  const secretKeys = hasSecretKey(rule);
  if (secretKeys.length) fail.push(`automationRule:${rule.ruleId}:has_secret_keys:${secretKeys.join('|')}`);
  if (rule.active && !rule.integrationId && ['whatsapp', 'email', 'sheet', 'webhook'].includes(rule.channel)) review.push(`automationRule:${rule.ruleId}:active_without_integration`);
}

if (data.aiConfig) {
  const aiSecrets = hasSecretKey(data.aiConfig);
  if (aiSecrets.length) fail.push(`aiConfig:has_secret_keys:${aiSecrets.join('|')}`);
  if (data.aiConfig.active && !data.aiConfig.secretRef) fail.push('aiConfig:active_without_secretRef');
}

const result = {
  generatedAt: new Date().toISOString(),
  mode: 'config-integrations-automation-validation-read-only',
  filePath,
  status: fail.length ? 'FAIL' : review.length ? 'REVIEW' : 'OK',
  counts: {
    catalog: catalog.length,
    tenantIntegrations: tenantIntegrations.length,
    automationRules: automationRules.length,
    fail: fail.length,
    review: review.length
  },
  fail,
  review
};

const outJson = path.join(outDir, 'config-integrations-automation-validation.json');
const outMd = path.join(outDir, 'config-integrations-automation-validation-summary.md');
fs.writeFileSync(outJson, JSON.stringify(result, null, 2), 'utf8');

const md = [];
md.push('# Validación Configuración / Integraciones / Automatizaciones');
md.push('');
md.push('Modo: solo lectura. No escribe Firestore.');
md.push('');
md.push(`Estado: ${result.status}`);
md.push(`Catalog: ${catalog.length}`);
md.push(`Tenant integrations: ${tenantIntegrations.length}`);
md.push(`Automation rules: ${automationRules.length}`);
md.push(`Fail: ${fail.length}`);
md.push(`Review: ${review.length}`);
md.push('');
if (fail.length) {
  md.push('## Fail');
  fail.forEach((x) => md.push(`- ${x}`));
  md.push('');
}
if (review.length) {
  md.push('## Review');
  review.forEach((x) => md.push(`- ${x}`));
  md.push('');
}
md.push('## Salidas');
md.push(`- ${outJson}`);
md.push(`- ${outMd}`);
fs.writeFileSync(outMd, md.join('\n'), 'utf8');

console.log(md.join('\n'));
process.exit(fail.length ? 2 : review.length ? 1 : 0);
