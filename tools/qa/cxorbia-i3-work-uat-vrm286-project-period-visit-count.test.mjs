import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// VRM-286. Pure UI/read-model fixtures: no Auth, Firestore, HR or provider writes.
const source=fs.readFileSync(new URL('../../app/modules/proyectos.js',import.meta.url),'utf8');
const cinepolisPeriods=[
  {id:'cinepolis-2026-09',name:'SEP 2026',periodo:'SEP 2026'},
  {id:'cinepolis-2026-10',name:'OCT 2026',periodo:'OCT 2026'}
];
const retailPeriods=[{id:'retail-2026-10',name:'OCT 2026',periodo:'OCT 2026'}];
function render(rows,{allowCountry=()=>true,groups=['cinepolis']}={}){
  let fn=null;
  const CX={module:(name,renderFn)=>{assert.equal(name,'proyectos');fn=renderFn;},
    paisFlag:code=>code,COUNTRIES:[]};
  vm.runInNewContext(source,{CX,setTimeout:()=>0});
  assert.equal(typeof fn,'function');
  const entries={
    cinepolis:{key:'cinepolis',name:'Cinépolis',periods:cinepolisPeriods,
      sample:{id:'cinepolis-2026-10',name:'Cinépolis',industry:'Cine',accent:'#1579e5',
        countries:['GT','HN'],sucursales:44,scenarios:['WK','WKND']}},
    retail:{key:'retail',name:'Retail',periods:retailPeriods,
      sample:{id:'retail-2026-10',name:'Retail',industry:'Retail',accent:'#1673ea',
        countries:['GT'],sucursales:2,scenarios:['Visita']}}
  };
  const allPeriods=[...cinepolisPeriods,...retailPeriods];
  const data={_visitas:rows,projects:allPeriods,currentPeriodId:'cinepolis-2026-10',
    scopedProyectos:()=>groups.map(x=>entries[x]),
    periodosDe:key=>entries[key].periods,
    recordPeriodId:row=>row.periodId||row.projectId,
    inScope:allowCountry,
    periodState:()=> 'activo',
    period:()=>cinepolisPeriods[1],
    programs:()=>groups.map(x=>entries[x]),
    currentProgramKey:()=> 'cinepolis'};
  const ui={bdg:v=>`<span class="count">${v}</span>`,ph:v=>v,aiBox:()=>''};
  return fn({data,ui});
}

test('VRM-286: group count follows periodId when live HR projectId is the root',()=>{
  const html=render([
    {projectId:'cinepolis',periodId:'cinepolis-2026-09',pais:'GT'},
    {projectId:'cinepolis',periodId:'cinepolis-2026-10',pais:'GT'},
    {projectId:'cinepolis',periodId:'cinepolis-2026-10',pais:'HN'}
  ]);
  assert.match(html,/>3 visitas</);
  assert.doesNotMatch(html,/>0 visitas</);
});

test('VRM-286: another project is not counted, even if its period label matches',()=>{
  const html=render([
    {projectId:'cinepolis',periodId:'cinepolis-2026-10',pais:'GT'},
    {projectId:'retail',periodId:'retail-2026-10',pais:'GT'}
  ],{groups:['cinepolis','retail']});
  assert.equal((html.match(/>1 visitas</g)||[]).length,2);
  assert.doesNotMatch(html,/>2 visitas</);
});

test('VRM-286: restricted country scope excludes unrelated visits',()=>{
  const html=render([
    {projectId:'cinepolis',periodId:'cinepolis-2026-10',pais:'GT'},
    {projectId:'cinepolis',periodId:'cinepolis-2026-10',pais:'HN'}
  ],{allowCountry:country=>country==='GT'});
  assert.match(html,/>1 visitas</);
  assert.doesNotMatch(html,/>2 visitas</);
});

test('VRM-286: internal period-keyed visits retain correct count',()=>{
  const html=render([{projectId:'cinepolis-2026-10',pais:'GT'}]);
  assert.match(html,/>1 visitas</);
});

test('VRM-286: empty authorized group reports zero without inventing visits',()=>{
  assert.match(render([]),/>0 visitas</);
  assert.doesNotMatch(source,/localStorage\.setItem/);
});
