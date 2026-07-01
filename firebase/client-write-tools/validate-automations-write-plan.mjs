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
const channels = new Set(['push','whatsapp','correo','sheet']);

for(const [i,item] of plan.entries()){
  const d = item.data || {};
  const okPath = /^tenants\/tya\/(automations|integrationSettings)\/[^/]+$/.test(item.path || '');
  if(!okPath) errors.push(`item ${i}: path invalido`);
  if(d.tenantId !== 'tya') errors.push(`item ${i}: tenantId debe ser tya`);
  if(!d.id) errors.push(`item ${i}: falta id`);
  if(d.id && ids.has(item.path)) errors.push(`item ${i}: path duplicado`);
  if(d.id) ids.add(item.path);
  if((item.path || '').includes('/automations/')){
    if(!d.event) errors.push(`item ${i}: falta event`);
    if(!channels.has(d.channel)) errors.push(`item ${i}: channel invalido`);
    if(typeof d.enabled !== 'boolean') errors.push(`item ${i}: enabled debe ser boolean`);
    if(!d.title) errors.push(`item ${i}: falta title`);
    if(!d.template) warnings.push(`item ${i}: template recomendado`);
  }
  if((item.path || '').includes('/integrationSettings/')){
    if(!d.provider) errors.push(`item ${i}: falta provider`);
    if(d.webhook || d.url || d.secret || d.token || d.key) errors.push(`item ${i}: contiene dato privado no permitido`);
  }
}

console.log(JSON.stringify({ok:errors.length===0, count:plan.length, errors, warnings}, null, 2));
process.exit(errors.length===0 ? 0 : 1);
