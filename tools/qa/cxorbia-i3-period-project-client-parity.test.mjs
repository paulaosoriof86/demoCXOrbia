import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source=path=>fs.readFileSync(new URL('../../'+path,import.meta.url),'utf8');

function fixture(){
  const modules=new Map(),modals=[];
  const CX={
    BRAND:{id:'fixture-tenant'},
    bus:{on:()=>{},emit:()=>{}},
    session:{role:'admin',user:{}},
    module:(name,create)=>modules.set(name,create),
    reportKit:{exportPDF:()=>{},exportExcel:()=>{},exportPPT:()=>{}}
  };
  const window={CX};
  const localStorage={getItem:()=>null,setItem:()=>{}};
  const context={window,CX,localStorage,setTimeout:()=>{},console};
  vm.runInNewContext(source('app/core/data.js'),context,{filename:'data.js',timeout:2500});

  const periodA={id:'period-a',projectId:'cinepolis',name:'Cinépolis Septiembre 2026',program:'cinepolis',periodKey:'2026-09',client:'Marca Cinépolis',countries:['GT','HN'],industry:'Cines'};
  const periodB={...periodA,id:'period-b',name:'Cinépolis Octubre 2026',periodKey:'2026-10'};
  const other={id:'period-other',projectId:'otro',name:'Otro Octubre 2026',program:'Otro',periodKey:'2026-10',client:'Otra Marca',countries:['GT'],industry:'Retail'};
  const visits=[
    {id:'v-a-date',projectId:'cinepolis',periodId:'period-a',estado:'asignada',realizada:'2026-09-12',pais:'GT',sucursal:'GT Uno'},
    {id:'v-a-open',projectId:'cinepolis',periodId:'period-a',estado:'disponible',pais:'HN',sucursal:'HN Dos'},
    {id:'v-b-done',projectId:'cinepolis',periodId:'period-b',estado:'cuestionario',realizada:'2026-10-14',pais:'HN',sucursal:'HN Tres'},
    {id:'v-other',projectId:'otro',periodId:'period-other',estado:'realizada',realizada:'2026-10-01',pais:'GT',sucursal:'Otra'}
  ];
  Object.assign(CX.data,{projects:[periodA,periodB,other],_visitas:visits,currentPeriodId:'period-b',currentProjectId:'cinepolis'});
  vm.runInNewContext(source('app/modules/clientes.js'),context,{filename:'clientes.js',timeout:2500});
  vm.runInNewContext(source('app/modules/historico.js'),context,{filename:'historico.js',timeout:2500});

  const host={innerHTML:'',buttons:[],querySelector:()=>({addEventListener:()=>{}}),querySelectorAll(selector){
    if(selector!=='.hVer')return [];
    if(this.buttons.length)return this.buttons;
    this.buttons=[...this.innerHTML.matchAll(/class="btn btn-ghost btn-sm hVer" data-id="([^"]+)"/g)].map(match=>{
      const item={dataset:{id:match[1]},click:null,addEventListener(type,callback){if(type==='click')this.click=callback;}};
      return item;
    });
    return this.buttons;
  }};
  const ui={
    el:()=>host,ph:title=>`<h1>${title}</h1>`,
    kpi:(label,value)=>`<span data-kpi="${label}">${value}</span>`,
    aiBox:label=>label,
    modal:(title,html)=>modals.push({title,html})
  };
  return {data:CX.data,host,ui,modules,modals,context};
}

test('P0: periodo y Dashboard usan la misma definición canónica de realizada por fecha/facets',()=>{
  const {data}=fixture();
  assert.equal(data.recordPeriodId(data._visitas[0]),'period-a');
  assert.equal(data.periodStats('period-a').total,2);
  assert.equal(data.periodStats('period-a').done,1,'realización fechada aunque estado textual siga asignada');
  assert.equal(data.periodStats('period-b').done,1);
  assert.equal(data.periodStats('period-other').done,1);
  assert.equal(data.periodStats('period-a').done,data._visitas.filter(v=>data.recordPeriodId(v)==='period-a'&&data.visitBucketFns.realizadas(v)).length);
});

test('P0: cliente agrupa un proyecto de negocio con dos periodos y conserva sus tres visitas',()=>{
  const {data}=fixture();
  const client=data.clients.find(c=>c.name==='Marca Cinépolis');
  assert.ok(client);
  assert.equal(data.projectsForClient(client.id).length,2,'la función original conserva las rondas');
  assert.equal(data.businessProjectsForClient(client.id).length,1,'no confunde periodo con proyecto');
  assert.equal(data.businessProjectsForClient(client.id)[0].periods.length,2);
  const stats=data.clientStats(client.id);
  assert.equal(stats.proyectos,1);
  assert.equal(stats.visitas,3);
  assert.equal(stats.realizadas,2);
  assert.equal(stats.cumpl,67);
  assert.equal(data.clientStats(data.clients.find(c=>c.name==='Otra Marca').id).visitas,1,'otro proyecto aislado');
});

test('P0: Histórico muestra países y desglose del periodo usando periodId, no projectId',()=>{
  const {data,host,ui,modules,modals}=fixture();
  data.periodState=id=>id==='period-a'?'cerrado':'activo';
  const renderer=modules.get('historico');
  assert.equal(typeof renderer,'function');
  renderer({data,ui});
  assert.match(host.innerHTML,/Cerrados\/archivados/);
  assert.match(host.innerHTML,/Septiembre 2026/);
  assert.match(host.innerHTML,/GT · HN/);
  assert.doesNotMatch(host.innerHTML,/Otro Octubre 2026/);
  const rows=host.querySelectorAll('.hVer');
  rows.find(r=>r.dataset.id==='period-a').click();
  assert.match(modals[0].html,/Desglose por estado/);
  assert.match(modals[0].html,/asignada/);
  assert.match(modals[0].html,/disponible/);
  assert.doesNotMatch(modals[0].html,/Sin visitas\./);
});

test('P0: configuración de proyecto también selecciona por recordPeriodId; formularios conservan periodos',()=>{
  const projects=source('app/modules/proyectos.js');
  const clients=source('app/modules/clientes.js');
  assert.match(projects,/const projConfig=\(pr\)=>\{ const v=data\._visitas\.filter\(x=>data\.recordPeriodId\(x\)===pr\.id\)/);
  assert.doesNotMatch(projects,/const projConfig=\(pr\)=>\{ const v=data\._visitas\.filter\(x=>x\.projectId===pr\.id\)/);
  assert.match(clients,/p\.periods\.length\} periodo\(s\)/);
  assert.match(clients,/businessProjectsForClient\(c\.id\)/);
});
