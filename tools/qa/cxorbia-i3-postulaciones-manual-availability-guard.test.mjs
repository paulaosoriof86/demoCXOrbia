import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../../app/modules/postulaciones.js',import.meta.url),'utf8');
const ctx={CX:{adminPostulacionesActions:{},module:()=>{}}};
vm.runInNewContext(source,ctx,{filename:'app/modules/postulaciones.js'});
const offerable=ctx.CX.adminPostulacionesActions.isManualAssignmentCandidate;
const flags={available:true,eligibilityBlocked:false,assigned:false,scheduled:false,
  realized:false,questionnaire:false,submitted:false,outOfRange:false,cancelled:false,
  liquidationConfirmed:false,paymentConfirmed:false};
const data={visitFacets:v=>v.canonicalFacets};
const visit=(estado,extra={},override={})=>({estado,canonicalFacets:{...flags,...override},...extra});

test('Manual assignment only offers a truly available unowned visit',()=>{
  assert.equal(offerable(visit('disponible'),data),true);
  assert.equal(offerable(visit('realizada'),data),false);
  assert.equal(offerable(visit('fuera_rango'),data),false);
  assert.equal(offerable(visit('disponible',{realizada:'2026-10-28'}),data),false);
  assert.equal(offerable(visit('disponible',{shopperId:'id-1'}),data),false);
  assert.equal(offerable(visit('disponible',{agendada:'2026-10-28'}),data),false);
  assert.equal(offerable(visit('disponible',{}, {eligibilityBlocked:true}),data),false);
  assert.equal(offerable(visit('disponible',{}, {paymentConfirmed:true}),data),false);
});

test('Missing data, terminal state or canonical facets never make an unsafe offer',()=>{
  assert.equal(offerable(null,data),false);
  assert.equal(offerable(visit('disponible',{_archived:true}),data),false);
  assert.equal(offerable(visit('disponible',{submittedAt:'2026-10-28'}),data),false);
  assert.equal(offerable({estado:'disponible'},{visitFacets:()=>null}),true);
  assert.equal(offerable({estado:'realizada'},{visitFacets:()=>null}),false);
});

test('Both initial selector and pre-create/commit guard use the same predicate',()=>{
  assert.match(source,/const disp=data\.visitas\(\)\.filter\(v=>CX\.adminPostulacionesActions\.isManualAssignmentCandidate\(v,data\)\)/);
  assert.match(source,/const latest=data\.visitas\(\)\.find\(v=>String\(v\.id\|\|v\.visitId\)===String\(vid\)\)/);
  assert.match(source,/if\(!CX\.adminPostulacionesActions\.isManualAssignmentCandidate\(latest,data\)\)throw new Error/);
  assert.ok(source.indexOf('isManualAssignmentCandidate(latest,data)')<source.indexOf('await data.addShopper({via:\'asignacion_manual\''));
});
