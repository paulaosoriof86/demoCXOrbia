import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../../app/core/data.js',import.meta.url),'utf8');

function setup(canonical=true){
  const commands=[];
  const CX={
    BRAND:{id:'tya'},
    bus:{on:()=>{},emit:()=>{}},
    session:{role:'admin',user:{}},
    cxDataCommandBoundary:{canonicalMode:()=>canonical,context:()=>({tenantId:'tya',projectId:'cinepolis',periodId:'cinepolis-2026-10',actorId:'operator',role:'admin',projectIds:['cinepolis']})},
    commandAdapter:{execute:command=>{commands.push(command);return Promise.resolve({ok:true,providerAck:true});}}
  };
  vm.runInNewContext(source,{window:{CX},CX,localStorage:{getItem:()=>null,setItem:()=>{}},console},{filename:'data.js',timeout:2500});
  const data=CX.data;
  data.projects=['2025-06','2026-07','2026-08','2026-10'].map(key=>({id:'cinepolis-'+key,projectId:'cinepolis',periodKey:key}));
  data.currentPeriodId='cinepolis-2026-10';
  data.currentProjectId='cinepolis';
  return {data,commands};
}

test('I3 P0: imports R17N period states in English under short ids map exactly to live HR ids',()=>{
  const {data}=setup();
  data.__protectedPeriods=[
    {id:'2025-06',periodId:'2025-06',projectId:'cinepolis',state:'closed',imported:true},
    {id:'2026-07',periodId:'2026-07',projectId:'cinepolis',state:'active',imported:true}
  ];
  assert.equal(data.periodState('cinepolis-2025-06'),'cerrado');
  assert.equal(data.periodState('cinepolis-2026-07'),'activo');
  assert.equal(data.periodState('cinepolis-2026-08'),'activo','no auto-close a missing provider record');
  assert.equal(data.periodState('cinepolis-2026-10'),'activo');
  assert.equal(data._periodMeta()['2025-06'],undefined,'no leak stale short id into UI map');
});

test('I3 P0: provider-managed full ids and native Spanish states remain unchanged',()=>{
  const {data}=setup();
  data.__protectedPeriods=[
    {id:'cinepolis-2025-06',periodId:'cinepolis-2025-06',projectId:'cinepolis',state:'archivado',version:3},
    {id:'cinepolis-2026-07',periodId:'cinepolis-2026-07',projectId:'cinepolis',state:'cerrado',version:1}
  ];
  assert.equal(data.periodState('cinepolis-2025-06'),'archivado');
  assert.equal(data.periodState('cinepolis-2026-07'),'cerrado');
});

test('I3 P0: unknown or malformed imported states cannot silently become a recorded closure',()=>{
  const {data}=setup();
  data.__protectedPeriods=[{id:'2025-06',periodId:'2025-06',projectId:'cinepolis',state:'forbidden'}];
  assert.equal(data._periodMeta()['cinepolis-2025-06'],undefined);
  assert.equal(data.periodState('cinepolis-2025-06'),'activo','preserve existing visible fallback; no fabricated closure');
  assert.equal(data._periodDisplayId({periodId:'2025-99',projectId:'cinepolis'}),'2025-99','do not normalize invalid month');
});

test('I3 P0: exact imported provider id/version is preserved for period lifecycle commands',async()=>{
  const {data,commands}=setup();
  data.__protectedPeriods=[{id:'2025-06',periodId:'2025-06',projectId:'cinepolis',state:'closed',imported:true}];
  await data.reopenPeriod('cinepolis-2025-06');
  assert.equal(commands.length,1);
  assert.equal(commands[0].projectId,'cinepolis');
  assert.equal(commands[0].entityId,'2025-06');
  assert.equal(commands[0].periodId,'2025-06');
  assert.equal(commands[0].expectedVersion,0,'old imported doc lacks version');
  assert.equal(commands[0].payload.state,'activo');
  assert.equal(data.periodState('cinepolis-2025-06'),'cerrado','no optimistic local mutation');
});

test('I3 P0: provider readback updates existing live period without duplicate project identity',()=>{
  const {data}=setup();
  data.__protectedPeriods=[{id:'2025-06',periodId:'2025-06',projectId:'cinepolis',state:'closed'}];
  const oldLength=data.projects.length;
  data.applyPeriodReadback({id:'2025-06',periodId:'2025-06',projectId:'cinepolis',state:'activo',version:1});
  assert.equal(data.projects.length,oldLength);
  assert.equal(data.projects.find(x=>x.id==='cinepolis-2025-06').periodId,'cinepolis-2025-06');
  assert.equal(data.periodState('cinepolis-2025-06'),'activo');
  assert.equal(data.__protectedPeriods.length,1);
});

test('I3 P0: source-safe preview without protected canonical provider retains original metadata contract',()=>{
  const {data}=setup(false);
  assert.equal(data._periodCanonical(),false);
  assert.equal(data.periodState('cinepolis-2025-06'),'activo');
});
