import fs from 'node:fs';
import path from 'node:path';

const fileArg = process.argv[2] || 'claims-dev.template.json';
const filePath = path.resolve(process.cwd(), fileArg);
const plan = JSON.parse(fs.readFileSync(filePath, 'utf8'));

if (!plan.project || !plan.tenantId || !plan.projectId) {
  throw new Error('project, tenantId y projectId son requeridos');
}

if (!Array.isArray(plan.users) || plan.users.length === 0) {
  throw new Error('users debe ser un arreglo no vacío');
}

for (const user of plan.users) {
  if (!user.label) throw new Error('cada usuario requiere label');
  if (!user.emailPlaceholder || !user.emailPlaceholder.endsWith('.invalid')) {
    throw new Error(`emailPlaceholder debe usar dominio .invalid para ${user.label}`);
  }
  if (!user.claims || !user.claims.role || !user.claims.tenantId) {
    throw new Error(`claims incompletos para ${user.label}`);
  }
}

console.log('Plan de claims DEV valido. No crea usuarios y no asigna claims.');
console.log(JSON.stringify(plan, null, 2));
