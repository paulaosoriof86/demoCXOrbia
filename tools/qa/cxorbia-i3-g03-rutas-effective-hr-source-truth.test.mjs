import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../../app/modules/operacion-extra.js',import.meta.url),'utf8');

function renderRutas({canonical,external=true,sourceRevision='d19eb12ad8c1c5140b5711ea390deaae50b0edd35ff4f982a69bfdcabbc86dd2'}={}){
  const modules=new Map();
  const period={id:'cinepolis-2026-10',name:'Cinépolis OCT 2026'};
  const hr={
    _canonical:()=>canonical,
    fuente:()=>external?'google_sheets · vínculo seguro':'Fuente interna del proyecto',
    esOnline:()=>external,
    external:()=>[{extId:'HR-001',visitId:'VIS-001',sucursal:'Sucursal uno',ciudad:'Guatemala',pais:'GT',quincena:'Q1',escenario:'General',fecha:'2026-10-15',reembolso:10,shopper:'Operador',estado:'asignada'}],
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
  assert.doesNotMatch(html,/id="hrRead"|id="hrSync"/);
});

test('G03: legacy noncanonical HR preview keeps its existing controls without changing data contracts',()=>{
  const html=renderRutas({canonical:false,external:true});
  assert.match(html,/id="hrSrc"/);
  assert.match(html,/id="hrRead"/);
  assert.match(html,/id="hrSync"/);
  assert.match(html,/id="hrImport"/);
});
