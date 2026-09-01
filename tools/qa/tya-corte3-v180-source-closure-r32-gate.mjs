#!/usr/bin/env node
/* CXOrbia TyA · Corte 3 source-closure gate R32.
   Consolidated source sweep after V180 passed R26-R31.

   Boundary:
   - This gate covers reproducible source defects in the Corte 3 financial surfaces.
   - Canonical TyA counts, mobile/browser behavior, allowed-host runtime and opening
     downloaded PDF/XLSX are POST-APPLY evidence. Their absence alone must not create
     another frontend-candidate round.
   - After R26-R32 pass, the allowed path is APPLY_DELTA_DIRECTLY and runtime validation,
     not an invented R33 for missing environment evidence.
*/
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';

const root=path.resolve(process.argv[2]||'.');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const src={
  fin:read('app/modules/finanzas.js'),
  core:read('app/core/finanzas-core.js'),
  ben:read('app/modules/beneficios.js')
};
const results=[];
const check=(condition,id,detail='')=>{
  const pass=Boolean(condition);
  results.push({id,pass,detail});
  if(!pass)process.exitCode=1;
};
const section=(text,start,end)=>{
  const a=text.indexOf(start);
  const b=a>=0&&end?text.indexOf(end,a+start.length):-1;
  return a>=0?text.slice(a,b>=0?b:text.length):'';
};
const mov=section(src.fin,"CX.module('movimientos'","CX.module('liquidaciones'");
const liq=section(src.fin,"CX.module('liquidaciones'","CX.module('lotes'");
const lot=section(src.fin,"CX.module('lotes'",'');
const histCxp=section(liq,"const ac=host.querySelector('#addCxp')","const pay=host.querySelector('#payDraft')");
const liqExport=section(liq,"const lx=host.querySelector('#liqExport')","host.querySelectorAll('[data-kpi]')");
const lotModal=section(lot,"ui.modal('Lote '","}});");

/* Semantic harness for core review exclusion and no budget fabrication. */
let coreSemantic={loaded:false,reviewExcluded:false,budgetNotFabricated:false,error:null};
try{
  const sandbox={
    window:{},
    console,
    Date,
    Math,
    Object,
    Array,
    Number,
    String,
    Set,
    Map,
    JSON
  };
  sandbox.window=sandbox;
  sandbox.CX={bus:{emit(){}},BRAND:{id:'tya'},data:{}};
  vm.runInNewContext(src.core,sandbox,{filename:'app/core/finanzas-core.js'});
  coreSemantic.loaded=Boolean(sandbox.CX&&sandbox.CX.fin&&sandbox.CX.finStore);
  const p={
    id:'cinepolis',
    countries:['GT'],
    currency:{GT:'Q'},
    honRecibe:{GT:100},
    honorario:{GT:60},
    modelo:'delegado'
  };
  const exact={
    id:'exact-1',pais:'GT',moneda:'Q',honorario:60,reembolso:20,total:80,
    estado:'validada',reviewRequired:false,financialSourceStatus:'exact',
    liquidationState:'ready',paymentState:'pending',paymentConfirmed:false
  };
  const review={
    id:'review-1',pais:'GT',moneda:'Q',honorario:600,reembolso:200,total:800,
    estado:'validada',reviewRequired:true,financialSourceStatus:'pending_or_review',
    liquidationState:'pending_financial_source',paymentState:'pending_source_confirmation',
    paymentConfirmed:false
  };
  sandbox.CX.liq={forProject(){return [exact,review];}};
  const data={
    project:()=>p,
    period:()=>({id:'2026-05'}),
    periodId:()=> '2026-05',
    tenantId:()=> 'tya'
  };
  const got=sandbox.CX.fin.porPais(data).GT;
  coreSemantic.reviewExcluded=Boolean(
    got &&
    got.visRe===1 &&
    got.ingreso===100 &&
    got.honorarioDevengado===60 &&
    got.reemb===20 &&
    got.cxp===80 &&
    got.cxc===100
  );

  sandbox.CX.finStore._presM={
    cinepolis:{'2026-04':{coordinacion:100}}
  };
  const may=sandbox.CX.finStore.pres('cinepolis','2026-05');
  coreSemantic.budgetNotFabricated=
    may &&
    Object.keys(may).length===0 &&
    !('coordinacion' in may);
}catch(error){
  coreSemantic.error=String(error&&error.stack||error);
}

check(coreSemantic.loaded,
  'core_semantic_harness_loads',
  coreSemantic.error||'Could not evaluate finanzas-core.js in the source harness.');
check(coreSemantic.reviewExcluded,
  'core_review_rows_do_not_affect_financial_metrics',
  'Rows marked reviewRequired/pending_or_review/pending_financial_source/pending_source_confirmation must be excluded before country metrics and dashboard export.');
check(coreSemantic.budgetNotFabricated,
  'budget_read_does_not_copy_previous_period',
  'Opening a period without a sourced budget must return an empty/pending state, not clone the prior period.');

check(/reviewRequired|financialSourceStatus|liquidationState|paymentState/.test(src.core),
  'core_financial_review_contract_is_explicit');
check(!/const\s+ls\s*=\s*liq\.filter\(l=>l\.pais===c\);/.test(src.core),
  'core_country_rows_are_filtered_by_review_contract',
  'A country-only filter still admits fail-closed review rows.');

/* CxP aggregation must have one owner per source. */
check(!/_one\.cxp\s*\+\s*cxpLiq\s*\+\s*_one\.financiamiento/.test(mov),
  'single_currency_cxp_is_not_double_counted',
  'aggByCur.cxp already receives manual CxP and liquidations; do not add them again.');
check(!/\(a\.cxp\|\|0\)\s*\+\s*\(a\.financiamiento\|\|0\)/.test(mov),
  'multi_currency_cxp_is_not_double_counted',
  'Financing already has a CxP record and must not be re-added to the same KPI.');

/* Liquidations: unresolved currency and source-review rows stay outside money/actions/export. */
check(!/ui\.money\(l\.moneda\s*,/.test(liq),
  'liquidation_surfaces_do_not_render_unresolved_currency_as_money',
  'Every direct liquidación money render needs a resolved-currency branch.');
check(/key:['"]moneda['"]/.test(liqExport),
  'liquidation_export_includes_currency_column');
check(/pending_currency|Pendiente de moneda|reviewRequired|pending_or_review/.test(liqExport) &&
      /return/.test(liqExport),
  'liquidation_export_fails_closed_for_unresolved_or_review_rows',
  'Export must block or explicitly separate unresolved/review rows using a supported report contract.');
check(/id=['"]le_(pais|moneda)['"]/.test(liq),
  'liquidation_edit_can_resolve_country_or_currency',
  'Historical liquidations need a way to resolve currency before editing amounts.');
check(!/p\.currency\[r\.pais\]\s*\|\|\s*defCur/.test(histCxp),
  'historical_cxp_has_no_first_currency_fallback');
check(/filter\([^)]*(?:PENDING_CURRENCY|currencyOf|moneda)/.test(histCxp) ||
      /cxps[\s\S]{0,800}(?:PENDING_CURRENCY|Pendiente de moneda)[\s\S]{0,220}(?:disabled|return)/i.test(histCxp),
  'historical_cxp_list_excludes_or_blocks_unresolved_currency');
check(/#payCxp[\s\S]{0,1300}(?:PENDING_CURRENCY|currencyOf|Pendiente de moneda)[\s\S]{0,260}return/i.test(histCxp),
  'historical_cxp_payment_handler_fails_closed',
  'The click handler must re-check currency; hiding a button alone is insufficient.');

/* Lotes: review state and action state must match. */
check(!/\$\{_m\(r\.cur,r\.monto\)\}/.test(lotModal) ||
      /r\.cur===PENDING_CURRENCY\?/.test(lotModal),
  'lot_modal_header_does_not_render_pending_currency_as_money');
check(/r\.cur!==PENDING_CURRENCY[\s\S]{0,320}(?:loteMark|Marcar pagado)|r\.estado===['"]Revisi[oó]n requerida['"][\s\S]{0,320}(?:disabled|Bloqueado)/i.test(lotModal),
  'lot_mark_paid_is_not_offered_for_review_rows');
check(/loteMark[\s\S]{0,1000}(?:PENDING_CURRENCY|Revisi[oó]n requerida)[\s\S]{0,260}return/i.test(lotModal),
  'lot_mark_paid_handler_fails_closed');
check(/loteExp[\s\S]{0,900}(?:PENDING_CURRENCY|Revisi[oó]n requerida)[\s\S]{0,260}return/i.test(lotModal),
  'lot_export_fails_closed');

/* Shopper benefits: unresolved currency must be visible review, not silently omitted. */
check(/pendingCurrency|Pendiente de moneda|Revisi[oó]n/i.test(src.ben),
  'benefits_has_visible_unresolved_currency_state');
check(!/ui\.money\(l\.moneda\s*,/.test(src.ben),
  'benefits_do_not_render_missing_currency_as_money');
check(/all\.forEach\(l=>\{[\s\S]{0,360}(?:if\s*\([^\)]*(?:!cu|cu===['"]—['"]|PENDING_CURRENCY)[^\)]*\)[\s\S]{0,220}(?:return|pending|review))/i.test(src.ben),
  'benefits_exclude_unresolved_currency_before_aggregation');

/* Module-scope runtime harness: helpers used by Liquidaciones/Lotes must exist in their
   own callback scope or at top level. node --check cannot catch this ReferenceError. */
let moduleScope={loaded:false,lotesLoads:false,historicalCxpHandlerLoads:false,errors:[]};
try{
  const modules={};
  const noop=()=>{};
  const fakeNode=()=>({
    innerHTML:'',
    addEventListener:noop,
    querySelector:()=>null,
    querySelectorAll:()=>[],
    style:{},
    dataset:{},
    value:'',
    textContent:'',
    checked:false
  });
  const CX={
    module:(name,fn)=>{modules[name]=fn;},
    dataSource:{showFixtures:()=>true},
    BRAND:{id:'tya'},
    liq:{
      forProject:()=>[],
      resumen:()=>({porEstado:{},hon:0,reemb:0,total:0}),
      label:()=>['x','n']
    },
    finStore:{
      draft:()=>[],
      _draft:{},
      cxp:()=>[{id:'cxp1',origen:'liquidacion',saldo:100,pais:'GT'}],
      cxc:()=>[],
      clearDraft:noop,
      abonarCxp:noop,
      payVisits:noop
    },
    fin:{},
    permissions:{gate:()=>true,ctx:x=>x},
    bus:{emit:noop,on:noop},
    paisFlag:()=>'',paisLabel:x=>x
  };
  const ui={
    el:()=>fakeNode(),
    ph:()=>'',bdg:()=>'',kpi:()=>'',aiBox:()=>'',degraded:()=>'',empty:()=>'',money:(c,n)=>`${c} ${n}`,
    modal:noop,toast:noop
  };
  const data={
    period:()=>({id:'cinepolis',name:'Cinepolis',countries:['GT','HN'],currency:{GT:'Q',HN:'L'},modelo:'delegado'}),
    visitas:()=>[],_visitas:[]
  };
  const sandbox={CX,window:{},console,Date,Math,Object,Array,Number,String,Set,Map,JSON,setTimeout:noop,document:{querySelectorAll:()=>[]}};
  sandbox.window=sandbox;
  vm.runInNewContext(src.fin,sandbox,{filename:'app/modules/finanzas.js'});
  moduleScope.loaded=Boolean(modules.liquidaciones&&modules.lotes);
  try{
    modules.lotes({data,ui});
    moduleScope.lotesLoads=true;
  }catch(error){
    moduleScope.errors.push({surface:'lotes',error:String(error&&error.stack||error)});
  }
  try{
    let addCxpHandler=null;
    const host=fakeNode();
    host.querySelector=(sel)=>{
      if(sel==='#addCxp') return {addEventListener:(event,fn)=>{if(event==='click')addCxpHandler=fn;}};
      return null;
    };
    modules.liquidaciones({data,ui:{...ui,el:()=>host}});
    if(addCxpHandler){
      addCxpHandler();
      moduleScope.historicalCxpHandlerLoads=true;
    }else{
      moduleScope.errors.push({surface:'liquidaciones_addCxp',error:'handler_not_captured'});
    }
  }catch(error){
    moduleScope.errors.push({surface:'liquidaciones_addCxp',error:String(error&&error.stack||error)});
  }
}catch(error){
  moduleScope.errors.push({surface:'module_registration',error:String(error&&error.stack||error)});
}
check(moduleScope.loaded,'finance_modules_register_in_runtime_harness',moduleScope.errors.map(x=>x.error).join(' | '));
check(moduleScope.lotesLoads,'lotes_has_no_cross_module_scope_reference','Lotes must not reference PENDING_CURRENCY or other helpers declared only inside Movimientos.');
check(moduleScope.historicalCxpHandlerLoads,'historical_cxp_has_no_cross_module_scope_reference','Liquidaciones must not reference currencyOf/PENDING_CURRENCY declared only inside Movimientos.');

/* Final source boundary: no new source gate should be invented for environment-only proof. */
check(true,
  'runtime_evidence_is_post_apply_not_a_source_hold',
  'Canonical May counts, mobile, allowed host and opened PDF/XLSX are mandatory after direct apply, but their absence is not a frontend source defect.');

const report={
  gateId:'tya-corte3-v180-source-closure-r32',
  generatedAt:new Date().toISOString(),
  root,
  status:process.exitCode?'HOLD':'PASS',
  results,
  semanticEvidence:{core:coreSemantic,moduleScope},
  boundary:{
    sourceClosure:true,
    runtimeEvidenceRequiredAfterApply:true,
    noFurtherSourceGateForMissingEnvironmentEvidence:true
  },
  safeState:{
    sourceOnly:true,
    deploy:false,
    production:false,
    merge:false,
    writes:false,
    paymentsExecuted:0,
    batchesImported:0
  }
};
const out=path.join(root,'.tmp/tya-corte3-v180-source-closure-r32');
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');

if(process.exitCode){
  console.error('HOLD_TYA_CORTE3_V180_SOURCE_CLOSURE_R32');
  for(const x of results.filter(x=>!x.pass)){
    console.error(`${x.id}${x.detail?`: ${x.detail}`:''}`);
  }
}else{
  console.log('PASS_TYA_CORTE3_V180_SOURCE_CLOSURE_R32');
}
