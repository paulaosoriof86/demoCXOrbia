import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../../app/modules/postulaciones.js',import.meta.url),'utf8');
const context={CX:{adminPostulacionesActions:{},module:()=>{}}};
vm.runInNewContext(source,context,{filename:'app/modules/postulaciones.js'});
const countries=context.CX.adminPostulacionesActions.countryFilterValues;

test('Postulaciones offers GT and HN from assigned HR visits even with zero valid postulations',()=>{
  const result=countries([{pais:''},{pais:null},{pais:'HN'}],[{pais:'GT'},{pais:'HN'},{pais:'GT'}]);
  assert.deepEqual(Array.from(result),['GT','HN']);
});

test('Country selector excludes blank values and uses both operational sources',()=>{
  assert.deepEqual(Array.from(countries([{pais:' GT '},{pais:'SV'}],[{pais:'NI'},{pais:'GT'}])),['GT','NI','SV']);
  assert.match(source,/countryFilterValues\(posts,operationalAssignments\)/);
  assert.match(source,/id="pPais"[^\n]+escapeAssignment\(c\)/);
});
