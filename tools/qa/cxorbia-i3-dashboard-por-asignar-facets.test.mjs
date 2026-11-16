import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const dashboard = readFileSync(new URL('../../app/modules/dashboard.js', import.meta.url), 'utf8');
const data = readFileSync(new URL('../../app/core/data.js', import.meta.url), 'utf8');
const hrFixture=JSON.parse(readFileSync(new URL('./fixtures/cxorbia-i3-b11-run2537-stage-keysets.json',import.meta.url),'utf8'));

function actualDashboard(rows,hrRows=rows){
  const CX={paisFlag:x=>x,paisLabel:x=>x};
  const model=runInNewContext('({'+data.slice(data.indexOf('  visitFacets(v){'),data.indexOf('  /* ---- Fase 5: alcance'))+'})',{CX});CX.data=model;
  model.measurementWindow=()=>({label:'period'});
  let modal=null;const handlers={};
  const keys=['total','asign','sinagend','sinasign','real','pend','cuest','submit','liq','fuera','agend'];
  const host={querySelectorAll(selector){const kind={'[data-fase]':'fase','[data-kpi]':'kpi','[data-alert]':'alert'}[selector];return (kind==='fase'?['GT','HN'].flatMap(c=>keys.map(k=>c+'|'+k)):keys).map(id=>({dataset:{[kind]:id},querySelector(){return {textContent:id+' ›'};},addEventListener(event,fn){handlers[kind+':'+id]=fn;}}));}};
  const start=dashboard.includes('  const phasePredicates=')?dashboard.indexOf('  const phasePredicates='):dashboard.indexOf('  const phaseFlow=');
  const phase=dashboard.slice(start,dashboard.indexOf('  const shoppersPool='));
  const drill=dashboard.slice(dashboard.indexOf('  const drill='),dashboard.indexOf('  /* tile clickeable */'));
  const binds=dashboard.slice(dashboard.indexOf('    const F={'),dashboard.indexOf('    const dx=host.querySelector'));
  const api=runInNewContext(phase+'\n'+drill+'\n'+binds+'\n({phaseFlow})',{CX,data:model,BF:model.visitBucketFns,pool:()=>rows.filter(x=>!x._archived),hrPool:()=>hrRows.filter(x=>!x._archived),host,ui:{estadoBadge:()=>'',empty:()=>'',modal:(title,html)=>{modal={title,html};}}});
  return {flow:c=>api.phaseFlow(c),click(kind,id){handlers[kind+':'+id]();return {...modal,ids:[...modal.html.matchAll(/<tr data-vrow="([^"]+)"/g)].map(x=>x[1]).sort()};}};
}

for(const country of ['GT','HN'])for(const [stage,facet] of [['agend','scheduled'],['cuest','questionnaire'],['submit','submitted']])test(`actual ${country} ${stage} tile and modal represent the same independent HR identities`,()=>{
  const rows=structuredClone(hrFixture.rows),dash=actualDashboard(rows),expected=rows.filter(v=>v.pais===country&&v.canonicalFacets[facet]&&!v.canonicalFacets.cancelled).map(v=>v.id).sort();
  assert.equal(dash.flow(country)[stage][0],expected.length);const modal=dash.click('fase',country+'|'+stage);assert.deepEqual(modal.ids,expected);assert.ok(modal.title.endsWith(' · '+expected.length));
  if(stage==='cuest')assert.doesNotMatch(modal.html,/Recuérdales enviar el cuestionario/);
});

test('cumulative stage repair preserves pending KPI and alert identities',()=>{
  const rows=structuredClone(hrFixture.rows),dash=actualDashboard(rows);
  for(const kind of ['kpi','alert'])for(const [key,predicate] of [['agend',f=>f.scheduled&&!f.realized&&!f.cancelled],['cuest',f=>f.realized&&!f.questionnaire&&!f.cancelled],['submit',f=>f.questionnaire&&!f.submitted&&!f.cancelled]]){
    assert.deepEqual(dash.click(kind,key).ids,rows.filter(v=>predicate(v.canonicalFacets)).map(v=>v.id).sort());
  }
});

test('stage counts and details exclude cancelled/archived records and retain HR-owned assignment source',()=>{
  const rows=[{id:'live',pais:'GT',canonicalFacets:{available:false,assigned:true,scheduled:true,realized:true,questionnaire:true,submitted:true,cancelled:false}},
    {id:'cancelled',pais:'GT',canonicalFacets:{available:false,assigned:true,scheduled:true,realized:true,questionnaire:true,submitted:true,cancelled:true}},
    {id:'archived',pais:'GT',_archived:true,canonicalFacets:{available:false,assigned:true,scheduled:true,realized:true,questionnaire:true,submitted:true,cancelled:false}}];
  const hr=[{...rows[0],id:'hr-assigned'}],dash=actualDashboard(rows,hr);
  for(const key of ['agend','real','cuest','submit']){assert.equal(dash.flow('GT')[key][0],1);assert.deepEqual(dash.click('fase','GT|'+key).ids,['live']);}
  assert.equal(dash.flow('GT').asign[0],1);assert.deepEqual(dash.click('fase','GT|asign').ids,['hr-assigned']);
});

test('the dashboard assignment bucket uses its canonical visit-facet predicate', () => {
  const source = dashboard.match(/const porAsignar\s*=\s*all\.filter\(([^;]+)\);/);
  assert.ok(source, 'Dashboard assignment bucket must be present');
  assert.equal(source[1].trim(), 'BF.sinAsignar');
  assert.match(dashboard, /bucket\('👤 Pendientes por asignar','purple',porAsignar,/);
});

test('realized, cancelled, and assigned visits cannot appear as pending assignments', () => {
  const source = data.match(/\bsinAsignar\s*:\s*(v=>\{const f=CX\.data\.visitFacets\(v\);return [^}]+\})\s*,/);
  assert.ok(source, 'Canonical unassigned visit predicate must be present');
  const predicate = runInNewContext(`(${source[1]})`, {
    CX: {data: {visitFacets: visit => visit.canonicalFacets}},
  });
  const records = [
    {id: 'available-no-owner', canonicalFacets: {assigned: false, realized: false, cancelled: false}},
    {id: 'realized-no-owner', canonicalFacets: {assigned: false, realized: true, cancelled: false}},
    {id: 'cancelled-no-owner', canonicalFacets: {assigned: false, realized: false, cancelled: true}},
    {id: 'assigned', canonicalFacets: {assigned: true, realized: false, cancelled: false}},
  ];
  assert.deepEqual(records.filter(predicate).map(visit => visit.id), ['available-no-owner']);
});
