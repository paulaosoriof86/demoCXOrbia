import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../../app/modules/historico.js',import.meta.url),'utf8');

function fixture(){
  const ids=['cinepolis-2026-09','cinepolis-2026-10'];
  const periods=ids.map((id,i)=>({id,periodo:i?'2026-10':'2026-09',name:id}));
  const visits=[
    {id:'gt-done',periodId:ids[0],pais:'GT',estado:'realizada',score:90,paymentState:'confirmado'},
    {id:'gt-pending',periodId:ids[0],pais:'GT',estado:'asignada',score:null},
    {id:'hn-done',periodId:ids[0],country:'HN',estado:'realizada',score:70},
    {id:'gt-active',periodId:ids[1],pais:'GT',estado:'asignada'},
    {id:'hn-active',periodId:ids[1],pais:'HN',estado:'realizada'}
  ];
  const listeners=new Map();
  const actions=new Map();
  const exports=[];
  const modals=[];
  const host={
    innerHTML:'',
    querySelector(sel){return {addEventListener:(_event,fn)=>listeners.set(sel,fn)};},
    querySelectorAll(sel){
      if(sel!=='.hVer')return [];
      return periods.map(p=>({dataset:{id:p.id},addEventListener:(_event,fn)=>actions.set(p.id,fn)}));
    }
  };
  const data={
    _visitas:visits,
    currentPeriodId:ids[1],
    currentProgramKey:()=> 'cinepolis',
    programs:()=>[{key:'cinepolis',name:'Cinépolis'}],
    periodsForProgram:()=>periods,
    recordPeriodId:v=>v.periodId,
    periodState:id=>id===ids[0]?'cerrado':'activo',
    visitBucketFns:{realizadas:v=>v.estado==='realizada'},
    periodStats:id=>{
      const vs=visits.filter(v=>v.periodId===id),done=vs.filter(v=>v.estado==='realizada').length;
      return {total:vs.length,done,pct:Math.round(done/vs.length*100)};
    },
    visitContract:v=>({paymentState:v.paymentState||'pendiente'})
  };
  const ui={
    el:()=>host,ph:()=>'',aiBox:()=>'',
    kpi:(label,n)=>`<kpi data-label="${label}" data-value="${n}"></kpi>`,
    modal:(title,html)=>modals.push({title,html})
  };
  const CX={module:(_name,create)=>create({data,ui}),bus:{on(){}},reportKit:{
    exportPDF:spec=>exports.push(spec),
    exportExcel:spec=>{exports.push(spec);return true;},
    exportPPT:spec=>exports.push(spec)
  }};
  ui.toast=()=>{};
  vm.runInNewContext(source,{CX,console,Date,Math,Set,Array,String,Object});
  return {host,listeners,actions,exports,modals,ids};
}

test('Historico conserva universo de periodos y totales completos con todos los paises',()=>{
  const t=fixture();
  assert.match(t.host.innerHTML,/data-label="Visitas totales" data-value="3"/);
  assert.match(t.host.innerHTML,/data-label="Ejecutadas" data-value="2"/);
  assert.match(t.host.innerHTML,/<option value="GT"/);
  assert.match(t.host.innerHTML,/<option value="HN"/);
  assert.doesNotMatch(t.host.innerHTML,/2026-10 · activo/);
});

test('Historico país HN recalcula KPIs, tasa y exportes desde visitas HN, no desde periodos mixtos',()=>{
  const t=fixture();
  t.listeners.get('#hPais')({target:{value:'HN'}});
  assert.match(t.host.innerHTML,/data-label="Visitas totales" data-value="1"/);
  assert.match(t.host.innerHTML,/data-label="Ejecutadas" data-value="1"/);
  assert.match(t.host.innerHTML,/>1\/1 · 100%</);
  assert.match(t.host.innerHTML,/<option value="GT"/,'La opción GT se conserva después del filtro HN');
  t.listeners.get('#hXls')();
  assert.equal(t.exports[0].rows.length,1);
  assert.equal(t.exports[0].rows[0].total,1);
  assert.equal(t.exports[0].rows[0].ejecutadas,1);
  assert.equal(t.exports[0].rows[0].paises,'HN');
  t.actions.get(t.ids[0])();
  assert.match(t.modals[0].html,/Visitas:<\/b> 1/);
  assert.doesNotMatch(t.modals[0].html,/asignada/);
});

test('Historico país GT respeta sus propios pagos y permite incluir periodo activo',()=>{
  const t=fixture();
  t.listeners.get('#hPais')({target:{value:'GT'}});
  assert.match(t.host.innerHTML,/data-label="Visitas totales" data-value="2"/);
  assert.match(t.host.innerHTML,/data-label="Pagos confirmados \(contrato\)" data-value="1"/);
  t.listeners.get('#hEstado')({target:{value:'all'}});
  assert.match(t.host.innerHTML,/data-label="Visitas totales" data-value="3"/);
  assert.match(t.host.innerHTML,/data-label="Periodos" data-value="2"/);
});
