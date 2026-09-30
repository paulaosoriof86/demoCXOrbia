import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'firebase', 'private-output');
fs.mkdirSync(outDir, { recursive: true });

const argFile = process.argv.find((x) => x.startsWith('--file='));
const planPath = path.resolve(argFile ? argFile.slice('--file='.length) : path.join(outDir, 'financial-tya-write-plan-dry-run.json'));

if (!fs.existsSync(planPath)) {
  console.error('No existe write-plan:', planPath);
  process.exit(1);
}

const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
const ops = Array.isArray(plan.writePlan) ? plan.writePlan : [];
const fail = [];
const review = [];

const allowed = new Set(['auditLogs', 'shopperBenefits', 'financialMovements', 'paymentLots', 'reconciliations', 'shopperAliases']);
const required = {
  shopperBenefits: ['id', 'tenantId', 'clientId', 'projectId', 'visitId', 'shopperId', 'country', 'currency', 'periodId', 'totalBenefit', 'status'],
  financialMovements: ['id', 'tenantId', 'clientId', 'projectId', 'periodId', 'country', 'currency', 'amount', 'direction', 'category', 'status'],
  paymentLots: ['id', 'tenantId', 'clientId', 'projectId', 'periodId', 'country', 'currency', 'benefitIds', 'amount', 'status'],
  auditLogs: ['id', 'tenantId', 'type', 'status'],
};

function colFromPath(p) {
  const parts = String(p || '').split('/').filter(Boolean);
  return parts[parts.length - 2] || '';
}

function projectFromPath(p) {
  const parts = String(p || '').split('/').filter(Boolean);
  const idx = parts.indexOf('projects');
  return idx >= 0 ? parts[idx + 1] : null;
}

const seen = new Set();
for (const [idx, op] of ops.entries()) {
  const col = colFromPath(op.path);
  const data = op.data || {};

  if (op.op !== 'set') fail.push(`op_${idx}:unsupported_op`);
  if (!op.path) fail.push(`op_${idx}:missing_path`);
  if (seen.has(op.path)) fail.push(`op_${idx}:duplicate_path`);
  seen.add(op.path);
  if (!String(op.path || '').startsWith('tenants/tya/')) fail.push(`op_${idx}:wrong_tenant_path`);
  if (!allowed.has(col)) fail.push(`op_${idx}:collection_not_allowed:${col}`);

  for (const field of (required[col] || [])) {
    if (data[field] === undefined || data[field] === null || data[field] === '') fail.push(`op_${idx}:${col}:missing:${field}`);
  }

  if (data.tenantId && data.tenantId !== 'tya') fail.push(`op_${idx}:${col}:wrong_tenant_data`);
  if (data.clientId && data.clientId !== 'cinepolis') fail.push(`op_${idx}:${col}:wrong_client_data`);

  const pid = projectFromPath(op.path);
  if (pid && data.projectId && pid !== data.projectId) fail.push(`op_${idx}:${col}:project_mismatch`);

  if (col === 'financialMovements' && !['income', 'expense'].includes(data.direction)) fail.push(`op_${idx}:bad_direction`);
  if (col === 'financialMovements' && typeof data.amount !== 'number') fail.push(`op_${idx}:bad_amount`);
  if (col === 'shopperBenefits' && Number(data.totalBenefit || 0) < 0) fail.push(`op_${idx}:negative_benefit`);
  if (col === 'paymentLots' && (!Array.isArray(data.benefitIds) || !data.benefitIds.length)) fail.push(`op_${idx}:lot_without_benefits`);

  if (JSON.stringify(data).includes('__SERVER_TIMESTAMP__')) review.push(`op_${idx}:${col}:timestamp_placeholder`);
}

const byCollection = {};
for (const op of ops) {
  const col = colFromPath(op.path);
  byCollection[col] = (byCollection[col] || 0) + 1;
}

const result = {
  generatedAt: new Date().toISOString(),
  mode: 'write-plan-validation-read-only',
  planPath,
  status: fail.length ? 'FAIL' : review.length ? 'REVIEW' : 'OK',
  counts: { ops: ops.length, fail: fail.length, review: review.length, byCollection },
  fail,
  review,
};

const outJson = path.join(outDir, 'financial-tya-write-plan-validation.json');
const outMd = path.join(outDir, 'financial-tya-write-plan-validation-summary.md');
fs.writeFileSync(outJson, JSON.stringify(result, null, 2), 'utf8');

const md = [];
md.push('# Validación write-plan financiero TyA');
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
  fail.slice(0, 100).forEach((x) => md.push(`- ${x}`));
}
if (review.length) {
  md.push('## Review');
  review.slice(0, 150).forEach((x) => md.push(`- ${x}`));
}
md.push('');
md.push('## Salidas');
md.push(`- ${outJson}`);
md.push(`- ${outMd}`);
fs.writeFileSync(outMd, md.join('\n'), 'utf8');

console.log(md.join('\n'));
process.exit(fail.length ? 2 : review.length ? 1 : 0);
