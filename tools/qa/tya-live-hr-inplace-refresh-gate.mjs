#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const watcher=read('app/adapters/tya-live-source-refresh-watch.js');
const trigger=read('app/adapters/tya-live-source-fast-trigger.js');
const server=read('backend/runtime/hr-live-service/server.mjs');
const projection=read('app/adapters/tya-corte1-report-projection-live.js');
const inplace=read('app/adapters/tya-live-source-inplace-apply.js');
const r22=read('tools/release/tya-source-safe-live-binding-build-r22.mjs');

assert.equal(watcher.includes('location.reload'),false,'watcher must not reload the document');
assert.equal(trigger.includes('setInterval'),false,'fast trigger must not own polling');
assert.equal(server.includes('if(forceFresh)return inFlight||refreshSnapshot();'),true,'fresh=1 must bypass TTL');
assert.equal(projection.includes('CX_TYA_BUILD_CORTE1_REPORTS'),true,'report projection must be rebuildable');
assert.equal(inplace.includes('CX_TYA_APPLY_LIVE_SNAPSHOT'),true,'in-place apply adapter missing');
assert.equal(r22.indexOf('inplaceTag')<r22.indexOf('reportLiveTag'),true,'in-place adapter must load before report projection');

const events=[];
const storage=new Map();
const context={
  console,
  setTimeout,clearTimeout,setInterval:()=>0,clearInterval,
  CustomEvent:class{constructor(type,init){this.type=type;this.detail=init?.detail;}},
  localStorage:{setItem:(k,v)=>storage.set(k,String(v)),getItem:k=>storage.get(k)||null},
  document:{documentElement:{setAttribute(){}},getElementById(){return null;}},
  window:null,
  CX:{
    BRAND:{id:'tya',demoMode:false},
    dataSource:{mode:'connected',status:'ready',badge:()=>({c:'#0a0',t:'HR viva'})},
    data:{
      projects:[],shoppers:[],_visitas:[],_posts:[],currentProjectId:'cinepolis',currentPeriodId:'cinepolis-2026-07',
      period(){return this.projects.find(p=>p.id===this.currentPeriodId)||{periodKey:'2026-07'};},
      visitas(){return this._visitas.filter(v=>v.projectId===this.currentPeriodId);}
    },
    clienteData:{invalidate(){events.push('invalidate');}},
    bus:{emit:(name,detail)=>events.push([name,detail])}
  }
};
context.window=context;
context.window.addEventListener=()=>{};
context.window.dispatchEvent=e=>events.push([e.type,e.detail]);
vm.createContext(context);
vm.runInContext(projection,context,{filename:'projection.js'});
vm.runInContext(inplace,context,{filename:'inplace.js'});
const snap={sourceSafe:true,imported:false,production:false,tenantId:'tya',projectId:'cinepolis',projectName:'Cinépolis',generatedAt:'2026-07-21T20:00:00Z',source:{title:'HR'},counts:{periods:1,visits:1,tabs:2,byCountry:{GT:1,HN:0}},periods:[{key:'2026-07',label:'JUL 2026',fullLabel:'Julio 2026',total:1,countries:{GT:1,HN:0,total:1}}],visits:[{id:'v1',periodKey:'2026-07',periodLabel:'JUL 2026',pais:'GT',country:'GT',sucursal:'Sucursal A',hasShopper:true,shopperId:'shA',estado:'realizada',realizada:'2026-07-21',canonicalFacets:{assigned:true,realized:true,questionnaire:false,submitted:false,paymentConfirmed:false}}],shoppers:[{id:'shA',nombre:'Shopper protegido',pais:'GT'}],periodOperationalSummary:[{periodKey:'2026-07',total:1}]};
const result=context.CX_TYA_APPLY_LIVE_SNAPSHOT(snap,{revision:'rev-new',sourceReadAt:'2026-07-21T20:00:01Z',latestPeriodKey:'2026-07'},{reason:'gate'});
assert.equal(result.ok,true);
assert.equal(context.CX.data._visitas.length,1);
assert.equal(context.CX.data._visitas[0].shopperId,'shA');
assert.equal(context.CX.data.currentPeriodId,'cinepolis-2026-07');
assert.equal(context.CX.dataSource.status,'ready');
assert.equal(context.CX_TYA_CORTE1_REPORTS.sourceRevision,'rev-new');
assert.equal(context.CX_TYA_CORTE1_REPORTS.rows[0].performed,1);
assert.equal(events.some(e=>Array.isArray(e)&&e[0]==='visit-flow'),true);

console.log(JSON.stringify({decision:'PASS_TYA_LIVE_HR_INPLACE_REFRESH_GATE',documentReload:false,freshBypassesTtl:true,projectionRebuilt:true,snapshotAppliedInMemory:true,sourceRevision:'rev-new'},null,2));
