import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// Isolated I3 source QA: no browser automation, provider, HR, or real writes.
const source=readFileSync(new URL('../../app/modules/misvisitas.js',import.meta.url),'utf8');
const fixture=[
  {id:'oct-pending',periodId:'cinepolis-2026-10',periodKey:'2026-10',sucursal:'Oct pending questionnaire',estado:'Pend. cuestionario',realizada:'2026-10-31',honorario:60,currency:'Q',pais:'GT',canonicalFacets:{assigned:true,realized:true,submitted:false}},
  {id:'nov-scheduled',periodId:'cinepolis-2026-11',periodKey:'2026-11',sucursal:'Nov scheduled',estado:'Agendada',agendada:'2026-11-03',honorario:60,currency:'Q',pais:'HN',canonicalFacets:{assigned:true,scheduled:true,realized:false,submitted:false}},
  {id:'sep-complete',periodId:'cinepolis-2026-09',periodKey:'2026-09',sucursal:'Sep completed',estado:'submitida',realizada:'2026-09-28',honorario:60,currency:'Q',pais:'GT',canonicalFacets:{assigned:true,realized:true,submitted:true}}
];

function render(periodId){
  let moduleFn;
  const CX={module:(name,fn)=>{if(name==='misvisitas')moduleFn=fn;},session:{role:'shopper',user:{shopperId:'qa-shopper'}},addons:{on:()=>false},liq:{fromVisita:()=>null},paisFlag:p=>p,router:{nav:()=>{}}};
  const win={CX_TYA_CUMULATIVE_READ_MODEL:{facets:v=>v.canonicalFacets},CX_TYA_CANONICAL_FINANCE_READ_MODEL:{fromVisit:()=>({paymentConfirmed:false})}};
  new Function('CX','window','document','setTimeout',source)(CX,win,{querySelectorAll:()=>[],querySelector:()=>null},()=>{});
  const p={id:periodId,name:'Cinépolis',periodKey:periodId.slice(-7)};
  const data={period:()=>p,currentPeriodId:periodId,projects:[p],recordPeriodId:v=>v.periodId,visitsForShopper:()=>fixture,visitContract:()=>({liquidationState:'pending',paymentState:'no_aplica'}),getShopper:()=>({id:'qa-shopper'}),_visitas:fixture};
  const host={innerHTML:'',querySelector:()=>null,querySelectorAll(selector){
    if(selector==='[data-view]')return [...this.innerHTML.matchAll(/data-view="([a-z]+)"/g)].map(([,view])=>({dataset:{view},addEventListener:(_event,handler)=>{host.events.set(view,handler);}}));
    return [];
  },events:new Map()};
  const ui={el:()=>host,ph:()=>'<h1>Mis Visitas</h1>',bdg:label=>label,estadoBadge:s=>s,empty:()=>'<div>Sin datos</div>',money:(_cur,n)=>String(n),aiBox:()=>'',toast:()=>{}};
  moduleFn({data,ui});
  const switchTo=view=>{const action=host.events.get(view);assert.ok(action,`Missing ${view} tab`);action();return host.innerHTML;};
  return {host,switchTo};
}

test('October: scheduled November visit remains reachable but outside completed history',()=>{
  const {host,switchTo}=render('cinepolis-2026-10');
  assert.match(host.innerHTML,/Activas 1/);assert.match(host.innerHTML,/Historial 1/);assert.match(host.innerHTML,/Otros períodos 1/);
  const historic=switchTo('historial');
  assert.match(historic,/sep-complete/);assert.doesNotMatch(historic,/nov-scheduled|oct-pending/);
  const other=switchTo('otros');
  assert.match(other,/nov-scheduled/);assert.match(other,/2026-11/);assert.doesNotMatch(other,/sep-complete|oct-pending/);
});

test('November: pending October questionnaire stays pending in other periods',()=>{
  const {host,switchTo}=render('cinepolis-2026-11');
  assert.match(host.innerHTML,/Activas 1/);assert.match(host.innerHTML,/Historial 1/);assert.match(host.innerHTML,/Otros períodos 1/);
  const historic=switchTo('historial');assert.match(historic,/sep-complete/);assert.doesNotMatch(historic,/oct-pending/);
  const other=switchTo('otros');assert.match(other,/oct-pending/);assert.match(other,/2026-10/);assert.doesNotMatch(other,/nov-scheduled/);
});

test('Other-period preview is read-only; no cross-period schedule or questionnaire action',()=>{
  const {switchTo}=render('cinepolis-2026-10');
  const html=switchTo('otros');
  assert.match(html,/Selecciona el período correspondiente/);
  for(const forbidden of ['data-sched=','data-quest=','data-reprog=','data-doc=','data-cancel='])assert.equal(html.includes(forbidden),false,forbidden);
});

test('Fixture inventory remains partitioned, without lost or duplicated visits',()=>{
  for(const period of ['cinepolis-2026-10','cinepolis-2026-11']){
    const {host,switchTo}=render(period);
    const active=host.innerHTML.match(/data-visit-card="([^"]+)"/g)||[];
    const history=switchTo('historial').match(/data-history-visit="([^"]+)"/g)||[];
    const other=switchTo('otros').match(/data-history-visit="([^"]+)"/g)||[];
    assert.equal(active.length+history.length+other.length,fixture.length);
    assert.equal(new Set([...active,...history,...other].map(x=>x.slice(x.indexOf('"')+1,-1))).size,fixture.length);
  }
});
