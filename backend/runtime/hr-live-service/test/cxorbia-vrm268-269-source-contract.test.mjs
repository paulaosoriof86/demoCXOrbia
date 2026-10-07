import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = path => fs.readFileSync(path, 'utf8');

test('VRM-269 removes the visible literal newline between runtime scripts', () => {
  const html = read('app/index-backend-dev.html');
  assert.doesNotMatch(html, /core\/data\.js"><\/script>\\n<script src="core\/shopper-credential-rule\.js/);
  assert.match(html, /core\/data\.js"><\/script>\n<script src="core\/shopper-credential-rule\.js/);
});

test('VRM-268 maps client operations by canonical project and exact active period', () => {
  const period = {id:'cinepolis-2026-10', projectId:'cinepolis', countries:['GT','HN'], programa:[{id:'svc',name:'Servicio',weight:100,questions:[]}]};
  const visits = [
    {id:'v1',projectId:'cinepolis',periodId:period.id,pais:'GT',sucursal:'C. Miraflores',estado:'asignada',score:null,evaluada:false},
    {id:'v2',projectId:'cinepolis',periodId:period.id,pais:'HN',sucursal:'C. Cascadas',estado:'realizada',score:92,evaluada:true,scoreBySection:{svc:92}},
    {id:'old',projectId:'cinepolis',periodId:'cinepolis-2026-09',pais:'GT',sucursal:'C. Miraflores',estado:'realizada',score:80,evaluada:true}
  ];
  const CX = {
    data:{
      _visitas:visits,
      period:()=>period,
      programKey:p=>p.projectId,
      recordPeriodId:v=>v.periodId,
      recordProjectId:v=>v.projectId,
      inScope:()=>true,
      visitFacets:v=>({cancelled:false,questionnaire:Boolean(v.evaluada),submitted:false}),
      visitBucketFns:{asignadas:v=>v.estado==='asignada',realizadas:v=>v.estado==='realizada'}
    },
    dataSource:{mode:'real',showFixtures:()=>false},
    session:{user:{tenantId:'tya'}},
    BRAND:{id:'tya'},
    bus:{on:()=>{}}
  };
  const context={window:{CX},CX,localStorage:{getItem:()=>null,setItem:()=>{}},console};
  vm.runInNewContext(read('app/core/cliente-data.js'),context,{filename:'app/core/cliente-data.js'});
  const C=context.window.CX.clienteData;
  assert.deepEqual(C._periodVisits(period).map(v=>v.id),['v1','v2']);
  assert.equal(C.operacion(period).hasOps,true);
  assert.deepEqual({...C.operacion(period).total},{visitas:2,asignadas:1,realizadas:1,cuestionarios:1,submitidas:0,cobertura:50});
  assert.equal(C.sucursales(period).length,2);
  assert.equal(C.realResults(period).count,1);
});

test('VRM-268 renders real operations even without scorecard branches', () => {
  const source = read('app/modules/cliente.js');
  assert.match(source,/if\(!hasBranches&&!OP\.hasOps\)/);
  assert.doesNotMatch(source,/if\(!hasBranches\)\{/);
});
