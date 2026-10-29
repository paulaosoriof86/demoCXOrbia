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

test('Admin Postulaciones renders assigned visits and country options with one in-scope HTML escape helper',()=>{
  let render;
  const testContext={
    CX:{adminPostulacionesActions:{},module:(name,callback)=>{if(name==='postulaciones')render=callback;}},
    setTimeout:()=>0,
  };
  vm.runInNewContext(source,testContext,{filename:'app/modules/postulaciones.js'});
  assert.equal(typeof render,'function');
  const visit={id:'v-1',shopperId:'s-1',shopper:'Ana & B',sucursal:'Sucursal',ciudad:'Ciudad <centro>',pais:'GT',assignmentSource:'hr',estado:'asignada'};
  const data={
    period:()=>({name:'OCT 2026'}),_posts:[],inScope:()=>true,projects:[],
    currentProjectId:'cinepolis',currentPeriodId:'cinepolis-2026-10',
    visitas:()=>[visit],visitFacets:()=>({assigned:true,cancelled:false,scheduled:false,realized:false}),
  };
  const ui={ph:()=>'',kpi:()=>'',bdg:label=>String(label),empty:()=>''};
  const html=render({data,ui});
  assert.match(html,/<option value="GT">GT<\/option>/);
  assert.match(html,/Ana &amp; B/);
  assert.match(html,/Ciudad &lt;centro&gt;/);
  assert.doesNotMatch(html,/Ana & B/);
});
