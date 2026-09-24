import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../../../../',import.meta.url));

function apply(snapshot){
  const data={
    projects:[],shoppers:[],_visitas:[],_posts:[],currentProjectId:null,currentPeriodId:null,previewMeta:{},
    period(){return this.projects.find(p=>p.id===this.currentPeriodId)||null;},
    visitas(){return this._visitas.filter(v=>v.periodId===this.currentPeriodId);}
  };
  const context={
    console,
    CX:{data,dataSource:{badge:()=>({c:'#000',t:'test'})},BRAND:{},bus:{emit(){}},clienteData:{invalidate(){}}},
    document:{getElementById(){return null;},documentElement:{setAttribute(){}}},
    localStorage:{setItem(){}},
    CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},
    URLSearchParams
  };
  context.window=context;context.globalThis=context;context.window.CX=context.CX;context.window.dispatchEvent=()=>{};
  vm.runInNewContext(fs.readFileSync(root+'app/adapters/tya-live-source-inplace-apply.js','utf8'),context,{filename:'tya-live-source-inplace-apply.js'});
  context.CX_TYA_APPLY_LIVE_SNAPSHOT(snapshot,{revision:'rev-test',latestPeriodKey:'2026-09'},{reason:'test'});
  return context.CX.data;
}

test('VRM-039 live HR missing honorarium uses configurable project-country tariff without hardcoded totals',()=>{
  const snapshot={
    sourceSafe:true,imported:false,production:false,tenantId:'tya',projectId:'cinepolis',projectName:'Cinépolis',
    tenantName:'TyA',
    projectConfig:{countries:['GT','HN'],currency:{GT:'Q',HN:'L'},honorario:{GT:60,HN:200}},
    periods:[{key:'2026-09',label:'SEPTIEMBRE 26',total:3,countries:{GT:2,HN:1,total:3}}],
    visits:[
      {id:'gt-missing',periodKey:'2026-09',pais:'GT',currency:'Q',honorario:null,estado:'realizada'},
      {id:'hn-missing',periodKey:'2026-09',pais:'HN',currency:'L',honorario:'',estado:'submitida'},
      {id:'gt-explicit',periodKey:'2026-09',pais:'GT',currency:'Q',honorario:75,estado:'realizada'}
    ],
    shoppers:[],periodOperationalSummary:[],counts:{tabs:2,byCountry:{GT:2,HN:1,total:3}}
  };
  const data=apply(snapshot);
  const byId=Object.fromEntries(data._visitas.map(v=>[v.id,v]));
  assert.equal(byId['gt-missing'].honorario,60);
  assert.equal(byId['gt-missing'].honorarioSource,'project_country_config');
  assert.equal(byId['hn-missing'].honorario,200);
  assert.equal(byId['hn-missing'].honorarioSource,'project_country_config');
  assert.equal(byId['gt-explicit'].honorario,75);
  assert.equal(byId['gt-explicit'].honorarioSource,'hr_explicit');
});

test('VRM-039 explicit zero honorarium remains authoritative and missing HR+config stays pending instead of fabricated zero',()=>{
  const snapshot={
    sourceSafe:true,imported:false,production:false,tenantId:'t',projectId:'p',
    projectConfig:{countries:['GT','HN'],currency:{GT:'Q',HN:'L'},honorario:{GT:60}},
    periods:[{key:'2026-09',total:2}],
    visits:[
      {id:'explicit-zero',periodKey:'2026-09',pais:'GT',honorario:0,estado:'realizada'},
      {id:'missing-all',periodKey:'2026-09',pais:'HN',honorario:null,estado:'realizada'}
    ],
    shoppers:[],periodOperationalSummary:[],counts:{}
  };
  const data=apply(snapshot),byId=Object.fromEntries(data._visitas.map(v=>[v.id,v]));
  assert.equal(byId['explicit-zero'].honorario,0);
  assert.equal(byId['explicit-zero'].honorarioSource,'hr_explicit');
  assert.equal(byId['missing-all'].honorario,null);
  assert.equal(byId['missing-all'].honorarioSource,'pending_source');
  assert.equal(byId['missing-all'].honorarioSourceKnown,false);
});

test('VRM-039 source no longer coerces missing HR honorarium to zero',()=>{
  const src=fs.readFileSync(root+'app/adapters/tya-live-source-inplace-apply.js','utf8');
  assert.doesNotMatch(src,/honorario:Number\(v\.honorario\|\|0\)/);
  assert.match(src,/configuredHonorario=identity\.projectConfig\?\.honorario/);
  assert.match(src,/honorarioSourceKnown:honorario!==null/);
});
