#!/usr/bin/env node
/* CXOrbia V57 · Validate resources write-plan. No conecta Firebase. */

import fs from 'node:fs';

const input = process.argv[2];
if(!input){
  console.error('Uso: node validate-resources-write-plan.mjs <write-plan.json>');
  process.exit(2);
}

const parsed = JSON.parse(fs.readFileSync(input, 'utf8'));
const plan = parsed.writePlan || [];
const errors = [];
const warnings = [];
const ids = new Set();
const kinds = new Set(['brand','resource','manual','academy','evidence','questionnaire','document']);

for(const [i,item] of plan.entries()){
  const d = item.data || {};
  if(!/^tenants\/tya\/resources\/[^/]+$/.test(item.path || '')) errors.push(`item ${i}: path invalido`);
  if(d.tenantId !== 'tya') errors.push(`item ${i}: tenantId debe ser tya`);
  if(!d.id) errors.push(`item ${i}: falta id`);
  if(d.id && ids.has(d.id)) errors.push(`item ${i}: id duplicado`);
  if(d.id) ids.add(d.id);
  if(!d.kind || !kinds.has(d.kind)) errors.push(`item ${i}: kind invalido`);
  if(!d.title) errors.push(`item ${i}: falta title`);
  if(!d.fileName) errors.push(`item ${i}: falta fileName`);
  if(!d.storagePath) errors.push(`item ${i}: falta storagePath`);
  if(d.storagePath && !d.storagePath.startsWith('tenants/tya/')) errors.push(`item ${i}: storagePath fuera de tenant`);
  if(!Array.isArray(d.visibleRoles)) warnings.push(`item ${i}: visibleRoles recomendado`);
}

console.log(JSON.stringify({ok:errors.length===0, count:plan.length, errors, warnings}, null, 2));
process.exit(errors.length===0 ? 0 : 1);
