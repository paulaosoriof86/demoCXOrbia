import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'firebase', 'private-output');
const filePath = path.join(outDir, 'config-integrations-automation-write-plan-dry-run.json');

if (!fs.existsSync(filePath)) {
  console.error('No existe write-plan:', filePath);
  process.exit(1);
}

const plan = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const ops = Array.isArray(plan.writePlan) ? plan.writePlan : [];
const fail = [];
const review = [];
const secretPattern = /apiKey|password|token|secret|clientSecret|refreshToken|accessToken/i;
const allowedCollections = new Set(['items', 'config', 'integrations', 'automationRules', 'automationRuns', 'configAuditLogs']);

function colFromPath(p) {
  const parts = String(p || '').split('/').filter(Boolean);
  return parts[parts.length - 2] || '';
}

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

const seen = new Set();
for (const [idx, op] of ops.entries()) {
  const col = colFromPath(op.path);
  if (op.op !== 'set') fail.push(`op_${idx}:unsupported_op:${op.op}`);
  if (!op.path) fail.push(`op_${idx}:missing_path`);
  if (seen.has(op.path)) fail.push(`op_${idx}:duplicate_path:${op.path}`);
  seen.add(op.path);
  if (/\/\/|\.\.|^\//.test(String(op.path || ''))) fail.push(`op_${idx}:unsafe_path:${op.path}`);
  if (!String(op.path || '').startsWith('tenants/tya/') && !String(op.path || '').startsWith('globalCatalog/integrations/items/')) fail.push(`op_${idx}:path_out_of_scope:${op.path}`);
  if (!allowedCollections.has(col)) fail.push(`op_${idx}:collection_not_allowed:${col}`);
  const data = op.data || {};
  if (String(op.path || '').startsWith('tenants/tya/') && data.tenantId && data.tenantId !== 'tya') fail.push(`op_${idx}:wrong_tenant_data:${data.tenantId}`);
  const secretKeys = hasSecretKey(data);
  if (secretKeys.length) fail.push(`op_${idx}:secret_keys_present:${secretKeys.join('|')}`);
  if (JSON.stringify(data).includes('__SERVER_TIMESTAMP__')) review.push(`op_${idx}:server_timestamp_placeholder:${op.path}`);
  if (col === 'integrations' && data.status === 'active' && !data.secretRef) fail.push(`op_${idx}:active_integration_without_secretRef:${op.path}`);
  if (col === 'automationRules' && data.active && ['whatsapp', 'email', 'sheet', 'webhook'].includes(data.channel) && !data.integrationId) fail.push(`op_${idx}:active_rule_without_integration:${op.path}`);
  if (String(op.path || '').endsWith('/config/ai') && data.active && !data.secretRef) fail.push(`op_${idx}:active_ai_without_secretRef`);
}

const byCollection = {};
for (const op of ops) {
  const col = colFromPath(op.path);
  byCollection[col] = (byCollection[col] || 0) + 1;
}

const result = {
  generatedAt: new Date().toISOString(),
  mode: 'config-integrations-automation-write-plan-validation-read-only',
  filePath,
  status: fail.length ? 'FAIL' : review.length ? 'REVIEW' : 'OK',
  counts: { ops: ops.length, fail: fail.length, review: review.length, byCollection },
  fail,
  review
};

const outJson = path.join(outDir, 'config-integrations-automation-write-plan-validation.json');
const outMd = path.join(outDir, 'config-integrations-automation-write-plan-validation-summary.md');
fs.writeFileSync(outJson, JSON.stringify(result, null, 2), 'utf8');

const md = [];
md.push('# Validación write-plan Configuración / Integraciones / Automatizaciones');
md.push('');
md.push('Modo: solo lectura. No escribe Firestore.');
md.push('');
md.push(`Estado: ${result.status}`);
md.push(`Ops: ${ops.length}`);
md.push(`Fail: ${fail.length}`);
md.push(`Review: ${review.length}`);
md.push('');
md.push('## Ops por colección');
md.push('| Colección | Ops |');
md.push('|---|---:|');
Object.entries(byCollection).forEach(([k, v]) => md.push(`| ${k} | ${v} |`));
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
