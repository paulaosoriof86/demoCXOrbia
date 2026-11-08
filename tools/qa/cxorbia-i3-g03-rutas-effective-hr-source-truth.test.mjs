import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../../app/modules/operacion-extra.js',import.meta.url),'utf8');
const hrSource=readFileSync(new URL('../../app/core/hr.js',import.meta.url),'utf8');

function renderRutas({canonical,external=true,sourceRevision='d19eb12ad8c1c5140b5711ea390deaae50b0edd35ff4f982a69bfdcabbc86dd2',rows}={}){
  const modules=new Map();
  const period={id:'cinepolis-2026-10',name:'Cinépolis OCT 2026'};
  const hr={
    _canonical:()=>canonical,
    fuente:()=>external?'google_sheets · vínculo seguro':'Fuente interna del proyecto',
    esOnline:()=>external,
    external:()=>rows||[{extId:'HR-001',visitId:'VIS-001',sucursal:'Sucursal uno',ciudad:'Guatemala',pais:'GT',quincena:'Q1',escenario:'General',fecha:'2026-10-15',fechaProgramada:'2026-10-15',disponibleDesde:'2026-10-11',reembolso:10,shopper:'Operador',estado:'asignada'}],
    diff:()=>({nuevos:[],updates:[],iguales:[],total:1})
  };
  const CX={module:(name,render)=>modules.set(name,render),hr,paisFlag:()=>'',data:{__liveHrSourceRevision:sourceRevision}};
  vm.runInNewContext(source,{CX,setTimeout:()=>{}},{filename:'operacion-extra.js'});
  const ui={el:()=>({innerHTML:''}),ph:(title)=>`<h1>${title}</h1>`,bdg:label=>label,aiBox:label=>label};
  const host=modules.get('rutas')({data:{period:()=>period},ui});
  return host.innerHTML;
}

test('G03: canonical Hojas de Ruta shows actual external provider authority and source revision, never fake local selector',()=>{
  const html=renderRutas({canonical:true,external:true});
  assert.match(html,/google_sheets/);
  assert.match(html,/d19eb12ad8c1/);
  assert.doesNotMatch(html,/id="hrSrc"/);
  assert.doesNotMatch(html,/id="hrSync"/);
  assert.doesNotMatch(html,/id="hrRead"/);
  assert.doesNotMatch(html,/class="inp hr[FR]"/);
  assert.doesNotMatch(html,/id="hrImport"|id="hrNew"/);
  assert.doesNotMatch(html,/Una sola fuente de verdad: edita fechas y reembolsos aquí/);
});

test('G03: canonical Hojas de Ruta without revision must not claim fresh provider read',()=>{
  const html=renderRutas({canonical:true,external:false,sourceRevision:''});
  assert.match(html,/revisi[oó]n no verificada/i);
  assert.doesNotMatch(html,/HR externa conectada: el equipo puede asignar/);
  assert.match(html,/Fuente interna/);
  assert.doesNotMatch(html,/>HR externa</);
  assert.doesNotMatch(html,/id="hrRead"|id="hrSync"/);
});

test('G03: legacy noncanonical HR preview keeps its existing controls without changing data contracts',()=>{
  const html=renderRutas({canonical:false,external:true});
  assert.match(html,/id="hrSrc"/);
  assert.match(html,/id="hrRead"/);
  assert.match(html,/id="hrSync"/);
  assert.match(html,/id="hrImport"/);
});

test('B11: canonical HR Admin separates available-from and actual scheduled dates; unbooked visits cannot look booked',()=>{
  const rows=[
    {extId:'NOVIEMBRE!12',sucursal:'C. Sankris Mall',pais:'GT',disponibleDesde:'2026-11-09',fechaProgramada:'',fecha:'2026-11-09',estado:'pendiente_agendar'},
    {extId:'NOVIEMBRE!15',sucursal:'C. Russ Mall',pais:'GT',disponibleDesde:'2026-11-01',fechaProgramada:'',fecha:'2026-11-01',estado:'pendiente_agendar'},
    {extId:'NOVIEMBRE!16',sucursal:'MC. Jutiapa',pais:'GT',disponibleDesde:'2026-11-02',fechaProgramada:'',fecha:'2026-11-02',estado:'pendiente_asignar'},
    {extId:'NOVIEMBRE!18',sucursal:'MC. Pradera Zacapa',pais:'GT',disponibleDesde:'2026-11-09',fechaProgramada:'',fecha:'2026-11-09',estado:'pendiente_asignar'}
  ];
  const html=renderRutas({canonical:true,rows});
  assert.match(html,/<th>Disponible desde<\/th><th>Fecha programada<\/th>/);
  assert.match(html,/NOVIEMBRE!12[\s\S]*?<td>2026-11-09<\/td><td>—<\/td>/);
  assert.match(html,/NOVIEMBRE!15[\s\S]*?<td>2026-11-01<\/td><td>—<\/td>/);
  assert.match(html,/NOVIEMBRE!16[\s\S]*?<td>2026-11-02<\/td><td>—<\/td>/);
  assert.match(html,/NOVIEMBRE!18[\s\S]*?<td>2026-11-09<\/td><td>—<\/td>/);
  assert.match(html,/HR externa/);
  assert.match(html,/Revisión publicada/);
  assert.doesNotMatch(html,/<th>Fecha<\/th>/);
  assert.doesNotMatch(html,/>Plataforma</);
});

test('B11: canonical source preserves distinct scheduled and available dates from live HR without modifying any row',()=>{
  const live=[
    {id:'visita-pendiente',hrRowId:'NOVIEMBRE!12',periodId:'NOV2026',sucursal:'C. Sankris Mall',agendada:'',disponibleDesde:'2026-11-09'},
    {id:'visita-programada',hrRowId:'NOVIEMBRE!13',periodId:'NOV2026',sucursal:'C. Próxima',agendada:'2026-11-11',disponibleDesde:'2026-11-07'}
  ];
  const project={operationalSource:{mode:'external',providerBindingId:'bound',mappingRef:'map'}};
  const CX={cxDataCommandBoundary:{canonicalMode:()=>true},data:{currentProjectId:'cinepolis',project:()=>project,period:()=>({id:'NOV2026'}),recordPeriodId:v=>v.periodId,__liveHrVisits:live,__liveHrSourceRevision:'7b7b'},bus:{on:()=>{}}};
  const window={CX};
  vm.runInNewContext(hrSource,{CX,window},{filename:'hr.js'});
  const rows=CX.hr.external({id:'NOV2026'});
  assert.equal(rows.length,2);
  assert.equal(rows[0].fechaProgramada,'');
  assert.equal(rows[0].disponibleDesde,'2026-11-09');
  assert.equal(rows[1].fechaProgramada,'2026-11-11');
  assert.equal(rows[1].disponibleDesde,'2026-11-07');
  assert.deepEqual(live.map(v=>v.agendada),['','2026-11-11']);
});
