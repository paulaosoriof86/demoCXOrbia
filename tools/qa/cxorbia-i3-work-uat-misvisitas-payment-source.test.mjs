import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

/* I3 Work-UAT: isolated source regression, no Firebase/browser/HR/provider calls.
   VRM-271 related scope; historical truth is finance, not HR-owned payment state. */
const source=readFileSync(new URL('../../app/modules/misvisitas.js',import.meta.url),'utf8');

function render(options={}){
  let renderModule=null;
  const calls=[];
  const CX={
    module(name,fn){if(name==='misvisitas')renderModule=fn;},
    session:{role:'shopper',user:{shopperId:'qa-shopper'}},
    addons:{on:()=>false},
    liq:{fromVisita:()=>null},
    paisFlag:()=>'',router:{nav:()=>{}}
  };
  const w={
    CX_TYA_CUMULATIVE_READ_MODEL:{facets:v=>v.canonicalFacets},
    CX_TYA_CANONICAL_FINANCE_READ_MODEL:{fromVisit:(period,v)=>{
      calls.push({periodId:period.id,visitId:v.id});
      return v.id==='qa-paid'
        ? {visitaId:v.id,paymentConfirmed:options.paymentConfirmed===true,
           paymentSourceRef:options.paymentSourceRef||null,
           historicalReconciliationConfirmed:options.historicalReconciliationConfirmed===true}
        : {visitaId:v.id,paymentConfirmed:false};
    }},
    CX_PENDING_SHOPPER_VISIT_ACTION:{visitId:'qa-paid',requestedAt:Date.now(),action:''}
  };
  new Function('CX','window','document','setTimeout',source)(CX,w,{querySelectorAll:()=>[],querySelector:()=>null},()=>{});
  assert.equal(typeof renderModule,'function');
  const vIds=['qa-paid','qa-pending'];
  const rows=vIds.map(id=>({id,shopperId:'qa-shopper',periodId:'qa-2026-09',periodKey:'2026-09',
     sucursal:id,pais:'GT',currency:'Q',estado:'submitida',realizada:'2026-09-12',honorario:60,
     canonicalFacets:{submitted:true,assigned:true}}));
  const current={id:'qa-2026-10',name:'QA current',currency:{GT:'Q'}};
  const data={
    period:()=>current,currentPeriodId:current.id,currentProjectId:'qa',
    projects:[current,{id:'qa-2026-09',name:'QA historic',currency:{GT:'Q'}}],
    recordPeriodId:v=>v.periodId,visitsForShopper:()=>rows,
    visitContract:()=>({paymentState:'pendiente',liquidationState:'pending'}),
    getShopper:()=>({id:'qa-shopper'}),_visitas:rows
  };
  const ui={
    el:()=>({innerHTML:'',querySelectorAll:()=>[],querySelector:()=>null}),
    ph:()=>'<h1>History</h1>',bdg:v=>v,empty:()=>'empty',
    money:(_currency,v)=>String(v),estadoBadge:()=>'<status>',
    aiBox:()=>'note',toast:()=>{}
  };
  const host=renderModule({data,ui});
  assert.match(host.innerHTML,/Historial de visitas/);
  const count=s=>(host.innerHTML.match(new RegExp(s,'g'))||[]).length;
  return {paid:count('Pagado \\(confirmado\\)'),pending:count('Pago pendiente de confirmación'),calls};
}

test('VRM-271 related: historical paid visit uses unique canonical finance source proof',()=>{
  const r=render({paymentConfirmed:true,paymentSourceRef:'qa-provider-ack'});
  assert.equal(r.paid,1);
  assert.equal(r.pending,1);
  assert.equal(r.calls.every(x=>x.periodId==='qa-2026-09'),true);
});
test('no source reference cannot falsely certify paid after financial flag',()=>{
  const r=render({paymentConfirmed:true});
  assert.equal(r.paid,0);assert.equal(r.pending,2);
});
test('historical reconciliation confirmation qualifies payment without a fabricated bank reference',()=>{
  const r=render({paymentConfirmed:true,historicalReconciliationConfirmed:true});
  assert.equal(r.paid,1);assert.equal(r.pending,1);
});
test('source reference alone with paymentConfirmed false never claims paid',()=>{
  const r=render({paymentConfirmed:false,paymentSourceRef:'qa-ref'});
  assert.equal(r.paid,0);assert.equal(r.pending,2);
});
