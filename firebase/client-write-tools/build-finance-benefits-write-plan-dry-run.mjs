import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'firebase', 'private-output');
fs.mkdirSync(outDir, { recursive: true });

const inputPath = path.join(outDir, 'finance-benefits-from-hr-v4-dry-run.json');
if (!fs.existsSync(inputPath)) {
  console.error('No existe dry-run de beneficios:', inputPath);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const benefits = Array.isArray(data.shopperBenefits) ? data.shopperBenefits : [];
const now = new Date().toISOString();

const writeOps = benefits.map((benefit) => ({
  op: 'set',
  path: `tenants/${benefit.tenantId}/shopperBenefits/${benefit.benefitId}`,
  doc: {
    ...benefit,
    writePlanCreatedAt: now
  }
}));

const byCountry = benefits.reduce((acc, b) => {
  acc[b.country] = acc[b.country] || { count: 0, total: 0, honorarium: 0, reimbursements: 0 };
  acc[b.country].count += 1;
  acc[b.country].total += b.totalCalculated || 0;
  acc[b.country].honorarium += b.honorariumAmount || 0;
  acc[b.country].reimbursements += (b.ticketReimbursementAmount || 0) + (b.comboReimbursementAmount || 0) + (b.otherReimbursementAmount || 0);
  return acc;
}, {});

const output = {
  meta: {
    generatedAt: now,
    mode: 'finance-benefits-write-plan-dry-run-read-only',
    sourceFile: inputPath,
    note: 'No escribe Firestore. Solo genera operaciones candidatas para revision.'
  },
  counts: {
    shopperBenefits: benefits.length,
    writeOps: writeOps.length
  },
  byCountry,
  writeOps
};

const outJson = path.join(outDir, 'finance-benefits-write-plan-dry-run.json');
const outMd = path.join(outDir, 'finance-benefits-write-plan-dry-run-summary.md');
fs.writeFileSync(outJson, JSON.stringify(output, null, 2), 'utf8');

const md = [];
md.push('# Write-plan Finanzas — shopperBenefits');
md.push('');
md.push('Modo: solo lectura. No escribe Firestore.');
md.push('');
md.push(`Beneficios: ${benefits.length}`);
md.push(`Operaciones candidatas: ${writeOps.length}`);
md.push('');
md.push('## Por país');
for (const [country, item] of Object.entries(byCountry)) {
  md.push(`- ${country}: ${item.count} beneficios · total ${item.total.toFixed(2)} · honorarios ${item.honorarium.toFixed(2)} · reembolsos ${item.reimbursements.toFixed(2)}`);
}
md.push('');
md.push('## Gate');
md.push('No cargar a Firestore DEV sin validacion OK y autorizacion explicita.');
md.push('');
md.push('## Salidas');
md.push(`- ${outJson}`);
md.push(`- ${outMd}`);
fs.writeFileSync(outMd, md.join('\n'), 'utf8');
console.log(md.join('\n'));
