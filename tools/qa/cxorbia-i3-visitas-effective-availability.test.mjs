import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const source=readFileSync(new URL('../../app/modules/visitas.js',import.meta.url),'utf8');
const body=source.match(/const effectiveAvailable=\(v\)=>\{([\s\S]*?)\n  \};/);
assert.ok(body,'A single shared effective-availability predicate is required');
const makePredicate=(visitFacets)=>runInNewContext(`(v=>{${body[1]}\n})`,{data:{visitFacets}});

const availableFacets={available:true,eligibilityBlocked:false,assigned:false,scheduled:false,
  realized:false,questionnaire:false,submitted:false,outOfRange:false,cancelled:false,
  liquidationConfirmed:false,paymentConfirmed:false};
const mk=(estado,extra={},facets={})=>({estado,canonicalFacets:{...availableFacets,...facets},...extra});

test('the sole available October visit remains offerable; completed/out-of-range are not',()=>{
  const isAvailable=makePredicate(v=>v.canonicalFacets);
  assert.equal(isAvailable(mk('disponible')),true,'#737 Carchá available');
  assert.equal(isAvailable(mk('fuera_rango',{}, {outOfRange:true})),false,'#732 outside range');
  assert.equal(isAvailable(mk('realizada',{}, {realized:true})),false,'#738 already realized');
});

test('stale canonical available=true does not override terminal status, dates or owner',()=>{
  const isAvailable=makePredicate(v=>v.canonicalFacets);
  assert.equal(isAvailable(mk('realizada')),false,'source status outweighs stale facets');
  assert.equal(isAvailable(mk('disponible',{realizada:'2026-10-25'})),false,'actual realization date');
  assert.equal(isAvailable(mk('disponible',{shopperId:'shopper-1'})),false,'already assigned');
  assert.equal(isAvailable(mk('disponible',{agendada:'2026-10-26'})),false,'scheduled without owner');
  assert.equal(isAvailable(mk('disponible',{_archived:true})),false,'archived');
  assert.equal(isAvailable(mk('disponible',{}, {eligibilityBlocked:true})),false,'provider explicit block');
  assert.equal(isAvailable(mk('disponible',{}, {submitted:true})),false,'submitted');
  assert.equal(isAvailable(mk('disponible',{}, {paymentConfirmed:true})),false,'paid');
});

test('fallback is fail-closed and no adapter object means only real available status',()=>{
  const isAvailable=makePredicate(()=>null);
  assert.equal(isAvailable({estado:'disponible'}),true);
  assert.equal(isAvailable({estado:'realizada'}),false);
  assert.equal(isAvailable({estado:'disponible',cancelled:true}),false);
  assert.equal(isAvailable(null),false);
});

test('Admin KPI, visible label, assignment CTA and Shopper provider use shared predicate',()=>{
  assert.match(source,/const isAvailableAdmin=effectiveAvailable;/);
  assert.match(source,/all\.filter\(isAvailableAdmin\)/);
  assert.match(source,/if\(effectiveAvailable\(v\)\) return \{key:'disponible'/);
  assert.match(source,/\$\{effectiveAvailable\(v\)\?`<button class="btn btn-soft btn-sm" data-assign=/);
  assert.match(source,/const list=Array\.isArray\(providerCandidates\)\?providerCandidates\.filter\(v=>/);
  assert.match(source,/periodIdOf\(v\)===data\.currentPeriodId&&effectiveAvailable\(v\)/);
  assert.match(source,/const stillAvailable=\(\)=>effectiveAvailable\(/);
  assert.match(source,/if\(!stillAvailable\(\)\)/);
});

test('Previously approved zero-offer explanation remains present and period-scoped',()=>{
  assert.match(source,/const scopedProjectPool=data\._visitas\.filter\(/);
  assert.match(source,/const scopePool=scopedProjectPool\.filter\(v=>periodIdOf\(v\)===data\.currentPeriodId\)/);
  assert.match(source,/const pendingCountry=Array\.isArray\(countryScope\)&&countryScope\.length===0/);
  assert.match(source,/const historicalAvailable=otherPeriodPool\.some\(effectiveAvailable\)/);
  assert.match(source,/id="cx-available-empty-reason" role="status"/);
  assert.match(source,/No pudimos confirmar el país de tu expediente/);
  assert.match(source,/no son postulables en el período activo/);
});
