import fs from 'node:fs';

const file = process.argv[2];
const errors = [];
const warnings = [];
if(!file){
  console.error('Falta manifest.json');
  process.exit(2);
}
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const ids = new Set();
const kinds = new Set(['brand','resource','manual','academy','evidence','questionnaire','document']);

if(data.tenantId !== 'tya') errors.push('tenantId debe ser tya');
if(!Array.isArray(data.resources)) errors.push('resources debe ser array');

for(const [i,r] of (data.resources || []).entries()){
  if(!r.id) errors.push(`item ${i}: falta id`);
  if(r.id && ids.has(r.id)) errors.push(`item ${i}: id duplicado`);
  if(r.id) ids.add(r.id);
  if(!r.kind || !kinds.has(r.kind)) errors.push(`item ${i}: kind invalido`);
  if(!r.title) errors.push(`item ${i}: falta title`);
  if(!r.fileName) errors.push(`item ${i}: falta fileName`);
  if(!r.storagePath) errors.push(`item ${i}: falta storagePath`);
  if(r.storagePath && !r.storagePath.startsWith(`tenants/${data.tenantId}/`)) errors.push(`item ${i}: storagePath fuera del tenant`);
  if(r.visibleRoles && !Array.isArray(r.visibleRoles)) errors.push(`item ${i}: visibleRoles debe ser array`);
  if(['resource','manual','evidence','questionnaire','document'].includes(r.kind) && !r.projectId) warnings.push(`item ${i}: falta projectId recomendado`);
}

console.log(JSON.stringify({ok:errors.length===0, count:(data.resources||[]).length, errors, warnings}, null, 2));
process.exit(errors.length===0 ? 0 : 1);
