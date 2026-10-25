import fs from 'node:fs';

const input = process.argv[2];
if(!input){
  console.error('Falta write-plan.json');
  process.exit(2);
}

const parsed = JSON.parse(fs.readFileSync(input, 'utf8'));
const plan = parsed.writePlan || [];
const errors = [];
const warnings = [];
const ids = new Set();
const providers = new Set(['gemini','openai','anthropic','custom']);

for(const [i,item] of plan.entries()){
  const d = item.data || {};
  if(!/^tenants\/tya\/aiSettings\/[^/]+$/.test(item.path || '')) errors.push(`item ${i}: path invalido`);
  if(d.tenantId !== 'tya') errors.push(`item ${i}: tenantId debe ser tya`);
  if(!d.id) errors.push(`item ${i}: falta id`);
  if(d.id && ids.has(d.id)) errors.push(`item ${i}: id duplicado`);
  if(d.id) ids.add(d.id);
  if(!providers.has(d.provider)) errors.push(`item ${i}: provider invalido`);
  if(!d.model) errors.push(`item ${i}: falta model`);
  if(!['active','draft','disabled'].includes(d.status)) errors.push(`item ${i}: status invalido`);
  if(d.apiKey || d.key || d.token || d.secret || d.credential) errors.push(`item ${i}: dato privado no permitido`);
  if(d.clientCallable === true) warnings.push(`item ${i}: clientCallable true no recomendado`);
}

console.log(JSON.stringify({ok:errors.length===0, count:plan.length, errors, warnings}, null, 2));
process.exit(errors.length===0 ? 0 : 1);
