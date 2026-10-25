import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const ROOT=new URL('../../../../',import.meta.url);
const read=rel=>fs.readFileSync(new URL(rel,ROOT),'utf8');

function browserContext(){
  const ctx={console,Date,Set,Map,Number,String,Boolean,Array,Object,Math,JSON};
  ctx.CustomEvent=function(name,options={}){this.type=name;this.detail=options.detail;};
  ctx.document={getElementById:()=>null,documentElement:{setAttribute(){}}};
  ctx.localStorage={setItem(){}};
  ctx.window={dispatchEvent(){}};
  ctx.window.CX={BRAND:{},data:{projects:[],shoppers:[],_visitas:[],_posts:[],currentProjectId:null,currentPeriodId:null,visitas(){return this._visitas.filter(v=>v.periodId===this.currentPeriodId);}},dataSource:{},bus:{emit(){}}};
  ctx.CX=ctx.window.CX;
  vm.createContext(ctx);
  return ctx;
}

test('PRE-I4 live HR mapping preserves incomplete reimbursement semantics',()=>{
  const ctx=browserContext();
  vm.runInContext(read('app/adapters/tya-live-source-inplace-apply.js'),ctx);
  const snapshot={
    sourceSafe:true,imported:false,production:false,tenantId:'tya',projectId:'project-x',projectName:'Project X',tenantName:'Tenant',
    projectConfig:{countries:['GT']},periods:[{key:'2026-09',total:2,label:'SEP'}],shoppers:[],periodOperationalSummary:[],
    visits:[
      {id:'known',periodKey:'2026-09',pais:'GT',country:'GT',currency:'Q',estado:'realizada',boleto:45,comboAmt:112},
      {id:'partial',periodKey:'2026-09',pais:'GT',country:'GT',currency:'Q',estado:'realizada',boleto:null,comboAmt:null}
    ]
  };
  ctx.window.CX_TYA_APPLY_LIVE_SNAPSHOT(snapshot,{revision:'r1'});
  const known=ctx.CX.data._visitas.find(v=>v.id==='known');
  const partial=ctx.CX.data._visitas.find(v=>v.id==='partial');
  assert.equal(known.reimbursementPartial,false);
  assert.equal(known.reimbursementSourceComplete,true);
  assert.equal(partial.reimbursementPartial,true);
  assert.equal(partial.reimbursementSourceComplete,false);
  assert.equal(partial.reimbursementSourceStatus,'partial');
  assert.equal(partial.reimbursementBoletoSourceKnown,false);
  assert.equal(partial.reimbursementComboSourceKnown,false);
  assert.equal(partial.boleto,0);
  assert.equal(partial.comboAmt,0);
});

test('PRE-I4 delegated finance fails closed with null income and margin when source is absent',()=>{
  const ctx={console,Date,Number,String,Boolean,Array,Object,Math,JSON,structuredClone};
  ctx.window={};
  const project={id:'project-x',countries:['GT'],modelo:'delegado',coordinationCommission:{}};
  const baseRow={GT:{cur:'Q',visRe:20,ingreso:null,incomeSourceKnown:false,incomeSource:null,honorarioDevengado:1200,honorarioPorPagar:1200,honorarioPagado:0,pagosConfirmados:0,reemb:2710,reimbursementPartial:true,isr:0,regal:0,fijos:0,margen:null,cxp:3910,cxc:null,margenPct:null}};
  ctx.window.CX={data:{},projectFinancialModel:{resolveModel:()=> 'delegado'},fin:{honRecibe:()=>null,porPais:()=>structuredClone(baseRow)}};
  ctx.CX=ctx.window.CX;
  vm.createContext(ctx);
  vm.runInContext(read('app/adapters/tya-delegated-coordination-finance-guard-v1.js'),ctx);
  const out=ctx.CX.fin.porPais({project:()=>project,period:()=>({id:'project-x-2026-09',periodKey:'2026-09'}),periodId:()=> 'project-x-2026-09'}).GT;
  assert.equal(ctx.CX.fin.honRecibe(project,'GT'),null);
  assert.equal(out.ingreso,null);
  assert.equal(out.incomeSourceKnown,false);
  assert.equal(out.incomeSource,null);
  assert.equal(out.margen,null);
  assert.equal(out.margenPct,null);
  assert.equal(out.cxc,null);
  assert.equal(out.commissionAmount,null);
  assert.equal(out.distributedAmount,null);
  assert.equal(out.marginSourceStatus,'pending_or_review');
  assert.equal(out.financialReviewRequired,true);
  assert.equal(out.reimbursementPartial,true);
});


test('PRE-I4 canonical finance read model preserves HR reimbursement partial semantics',()=>{
  const ctx={console,Date,Number,String,Boolean,Array,Object,Math,JSON,URLSearchParams,location:{search:''}};
  ctx.window={CX_DEV_ENTRY_CANONICAL:{canonical:true,protectedRuntime:true,projectId:'project-x'}};
  ctx.window.CX_TYA_CUMULATIVE_READ_MODEL={facets:v=>v.canonicalFacets||{}};
  ctx.window.CX={
    data:{financialMatchForVisit:()=>null},
    liq:{forProject:()=>[],label:s=>[s,'n'],resumen:()=>({})}
  };
  ctx.CX=ctx.window.CX;
  vm.createContext(ctx);
  vm.runInContext(read('app/adapters/tya-canonical-finance-read-model-v2.js'),ctx);
  const data={
    period:()=>({id:'project-x-2026-09',periodKey:'2026-09',countries:['GT']}),
    visitas:()=>[
      {id:'gt-partial',periodKey:'2026-09',pais:'GT',country:'GT',currency:'Q',estado:'realizada',honorario:60,boleto:0,comboAmt:0,reimbursementPartial:true,reimbursementSourceComplete:false,reimbursementSourceStatus:'partial',canonicalFacets:{realized:true}}
    ]
  };
  const rows=ctx.CX.liq.forProject(data);
  assert.equal(rows.length,1);
  assert.equal(rows[0].reimbursementPartial,true);
  assert.equal(rows[0].reimbursementSourceComplete,false);
  assert.equal(rows[0].reimbursementSourceStatus,'partial');
  assert.equal(rows[0].financialSourceStatus,'pending_or_review');
});
