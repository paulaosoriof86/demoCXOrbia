import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=readFileSync('app/modules/postulaciones.js','utf8');
const dataSource=readFileSync('app/core/data.js','utf8');
const routerSource=readFileSync('app/core/router.js','utf8');
const dashboardSource=readFileSync('app/modules/dashboard.js','utf8');

const input=[
  {id:'status',status:'pendiente',periodId:'oct',pais:'GT'},
  {id:'case',estado:'Pendiente',periodId:'oct',pais:'HN'},
  {id:'old',estado:'pendiente',periodId:'sep',pais:'GT'},
  {id:'assigned',estado:'pendiente',periodId:'oct',pais:'GT',postulationLifecycle:'transitioned_to_assignment'},
  {id:'archived',estado:'pendiente',periodId:'oct',_archived:true},
  {id:'standby',estado:'standby',periodId:'oct'}
];
const active=()=>input.filter(x=>x.periodId==='oct'&&x?._archived!==true&&x?.active!==false&&x?.postulationLifecycle!=='transitioned_to_assignment');
function moduleCount(){
  const line=src.split('\n').find(x=>x.trim().startsWith('const c=(s)=>activePosts.filter('));
  assert.ok(line,'module count function not found');
  return new Function('activePosts',line+'return c("pendiente");')(active());
}
test('HF16 derives active postulations from shared data authority',()=>{
  assert.match(src,/const activePosts=typeof data\.activePosts==='function'\?data\.activePosts\(\):/);
  assert.match(dataSource,/activePosts\(\)\{return this\.posts\(\)\.filter/);
  assert.match(routerSource,/const n=Number\(CX\.data\?\.kpis\?\.\(\)\?\.postPend\|\|0\)/);
});
test('HF16 state and status fallback/casing agree with rail canonical count',()=>{
  const expected=active().filter(x=>String(x.estado||x.status||'').toLowerCase()==='pendiente').length;
  assert.equal(expected,2);assert.equal(moduleCount(),expected);
});
test('HF16 history, assignment transitions and archived never inflate count',()=>{
  assert.deepEqual(active().map(x=>x.id),['status','case','standby']);
  assert.equal(moduleCount(),2);
  assert.match(src,/const syncPendingRailBadge=\(\)=>\{/);
  assert.match(src,/setTimeout\(syncPendingRailBadge,0\)/);
});
test('HF17 retains cumulative stage and active-agenda distinction until exact HR parity',()=>{
  assert.match(dashboardSource,/scheduled=n\(x=>f\(x\)\.scheduled&&!f\(x\)\.cancelled\)/);
  assert.match(src,/const agendadas=operationalAssignments\.filter\(v=>\{const f=data\.visitFacets/);
  assert.match(src,/f\?f\.scheduled===true&&f\.realized!==true/);
  assert.match(dashboardSource,/\$\{cell\('Con fecha',f\.agend,'amber','agend'\)\}/);
  assert.match(src,/ui\.kpi\('Agendamientos activos',agendadas\.length,'n'\)/);
  assert.match(src,/Agendamientos pendientes de realizar/);
});
