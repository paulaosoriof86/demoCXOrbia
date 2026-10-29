import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../../app/modules/cert.js', import.meta.url), 'utf8');

function renderCert({ selected='main', state='pending_review' }={}) {
  let factory;
  const CX={
    module: (name, fn) => { assert.equal(name,'cert'); factory=fn; },
    dataSource: { showFixtures: () => true },
    session: { role:'admin' },
  };
  const window={ CX, CX_CERT_SELECTED_ID:selected };
  vm.runInNewContext(source,{ CX, window, setTimeout:()=>0 },{ filename:'cert.js' });
  CX.certStore._demo.p1={
    main:{ certificationId:'main',certificationName:'Banco Uno',estado:state,preguntas:[{q:'Prueba',ops:['Sí','No'],correcta:'Sí'}],gate:80 },
    two:{ certificationId:'two',certificationName:'Banco Dos',estado:'published',preguntas:[{q:'Prueba',ops:['Sí','No'],correcta:'Sí'}],gate:80 },
  };
  const data={
    period:()=>({id:'p1',name:'Octubre 2026'}),currentProjectId:'cinepolis',
    programs:()=>[{key:'cinepolis',name:'Cinépolis'}],shoppers:[],
  };
  const ui={
    ph:()=>'<header>Certificación</header>',
    kpi:(name,value)=>`<div>${name}: ${value}</div>`,
    degraded:message=>`<aside>${message}</aside>`,
    bar:()=>'',aiBox:()=>'',
  };
  return { html:factory({role:'admin',data,ui}),banks:CX.certStore._demo.p1 };
}

test('selector y estado principal humanizan pending_review y published sin tocar enums',()=>{
  const {html,banks}=renderCert();
  assert.match(html,/Banco Uno · Pendiente de revisión/);
  assert.match(html,/Banco Dos · Publicado/);
  assert.match(html,/<span class="bdg bdg-n">Pendiente de revisión<\/span>/);
  assert.doesNotMatch(html,/>pending_review<|· pending_review|>published<|· published/);
  assert.equal(banks.main.estado,'pending_review');
  assert.equal(banks.two.estado,'published');
});

test('published muestra etiqueta humana también en el encabezado',()=>{
  const {html}=renderCert({selected:'two'});
  assert.match(html,/<span class="bdg bdg-n">Publicado<\/span>/);
  assert.doesNotMatch(html,/>published</);
});

test('un estado técnico desconocido no se filtra como etiqueta visible',()=>{
  const {html,banks}=renderCert({state:'future_internal_state'});
  assert.match(html,/Banco Uno · Estado por verificar/);
  assert.match(html,/<span class="bdg bdg-n">Estado por verificar<\/span>/);
  assert.doesNotMatch(html,/future_internal_state/);
  assert.equal(banks.main.estado,'future_internal_state');
});
