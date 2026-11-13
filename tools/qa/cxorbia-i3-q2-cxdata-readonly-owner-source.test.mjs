import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const owner='app/core/backend-cxdata-readonly-corte4.js';
const source=fs.readFileSync(owner,'utf8');
function load({protectedHr=false,humanVisual=false}={}){
  const handlers=new Map(),events=[],invocations=[];
  const original=()=>{invocations.push('unprotected-original');};
  const operations=['performOperationAction','requestAssignVisit','requestRescheduleVisit','requestMarkVisitCompleted','requestMarkQuestionnaire','requestMarkSubmitted','requestApplicationStatus'];
  const operational=Object.fromEntries(operations.map(n=>[n,()=>{invocations.push(n);} ]));
  const data={
    projects:[{id:'project-A'}],periods:[{id:'2026-11'}],_visitas:[{id:'visit-01'}],
    shoppers:[{id:'shopper-01'}],_posts:[{id:'post-01'}],currentProjectId:'project-A',currentPeriodId:'2026-11',
    previewMeta:protectedHr?{hrAuthority:true}:undefined,addProject:original
  };
  const root={
    CX:{
      BACKEND:{previewMode:humanVisual,humanVisualSourceSafe:humanVisual,tenantId:'tenant-A'},
      data,dataSource:{mode:'pending',status:'loading'},
      backend:{writeProject:original,writeShopper:original,writeVisit:original},
      backendOperationalActions:operational,
      bus:{on:(event,callback)=>handlers.set(event,callback),emit:(event,payload)=>events.push({event,payload})}
    },
    CX_PROTECTED_AUTH_HR_AUTHORITY:protectedHr?{applied:true}:undefined,
    CX_TYA_HR_VIVA_SOURCE_SAFE:humanVisual,
    document:{readyState:'complete'},
    Date,console
  };
  root.window=root;
  vm.runInNewContext(source,root,{filename:owner,timeout:1000});
  return {root,data,handlers,events,invocations,operational};
}

test('Q2 readonly owner disables direct backend and operational writes without using a provider',async()=>{
  const {root,invocations,operational,events}=load();
  const {CX}=root;
  assert.equal(CX.BACKEND.readOnly,true);
  assert.equal(CX.BACKEND.enableDataWrites,false);
  assert.equal(CX.BACKEND.enableOperationalWrites,false);
  assert.equal(CX.backend.writeMode(),'disabled');
  assert.equal(CX.backend.isReadOnly(),true);
  for(const name of ['writeProject','writeShopper','writeVisit']){
    const outcome=await CX.backend[name]();
    assert.equal(outcome.ok,false);
    assert.equal(outcome.status,'blocked');
    assert.equal(outcome.readOnly,true);
    assert.equal(outcome.action,name);
  }
  for(const name of Object.keys(operational).filter(n=>n.startsWith('request')||n==='performOperationAction')){
    const outcome=await operational[name]();
    assert.equal(outcome.ok,false,name);
    assert.equal(outcome.action,name);
  }
  assert.equal(operational.writesAllowed(),false);
  assert.equal(operational.requiredDevWriteToken,null);
  assert.deepEqual(invocations,[]);
  assert.ok(events.some(e=>e.event==='backend-write-blocked'));
});

test('Q2 verified nonempty backend event preserves read-only mode and connected datasource',()=>{
  const {root,handlers,data}=load();
  const before=JSON.stringify(data._visitas);
  handlers.get('backend-ready')({counts:{projects:1,visits:1},empty:false});
  assert.equal(root.CX_CORTE4_READONLY.ready,true);
  assert.equal(root.CX_CORTE4_READONLY.readOnly,true);
  assert.equal(root.CX_CORTE4_READONLY.writeMode,'disabled');
  assert.equal(root.CX.dataSource.status,'ready');
  assert.equal(JSON.stringify(data._visitas),before);
});

test('Q2 protected read failure fails closed with no demo/localStorage fallback',()=>{
  const {root,handlers,data,events}=load();
  handlers.get('backend-error')({message:'provider unavailable'});
  assert.equal(root.CX_CORTE4_READONLY.ready,false);
  assert.equal(root.CX_CORTE4_READONLY.fallbackUsed,false);
  assert.equal(root.CX_CORTE4_READONLY.writeMode,'disabled');
  assert.equal(root.CX_BACKEND_LAST_STATE.writes,false);
  assert.equal(root.CX_BACKEND_LAST_STATE.fallbackUsed,false);
  assert.equal(root.CX.dataSource.status,'degraded');
  assert.equal(data.projects.length,0);
  assert.equal(data._visitas.length,0);
  assert.ok(events.some(e=>e.event==='corte4-readonly-empty'));
});

test('Q2 protected HR authority survives verified Firestore empty without data loss',()=>{
  const {root,handlers,data}=load({protectedHr:true});
  const visits=JSON.stringify(data._visitas),shoppers=JSON.stringify(data.shoppers);
  handlers.get('backend-ready')({counts:{projects:0},empty:true});
  assert.equal(JSON.stringify(data._visitas),visits);
  assert.equal(JSON.stringify(data.shoppers),shoppers);
  assert.equal(root.CX_BACKEND_LAST_STATE.operationalAuthorityPreserved,'external_hr');
  assert.equal(root.CX_CORTE4_READONLY.fallbackUsed,false);
  assert.equal(root.CX.dataSource.status,'ready');
  assert.equal(root.CX.dataSource.sourceRef,'hr-live-all-periods+firestore-authenticated-exact-overlay');
});

test('Q2 human source-safe mode is explicit, read-only and independently labeled',()=>{
  const {root,handlers,data}=load({humanVisual:true});
  const before=JSON.stringify(data._visitas);
  assert.equal(root.CX_BACKEND_DATA_SOURCE,'hr-source-safe');
  assert.equal(root.CX_BACKEND_LAST_STATE.auth,'validated-separately');
  assert.equal(root.CX_CORTE4_READONLY.humanVisual,true);
  handlers.get('backend-error')({message:'mock provider error'});
  assert.equal(root.CX_BACKEND_DATA_SOURCE,'hr-source-safe');
  assert.equal(root.CX_BACKEND_LAST_STATE.writes,false);
  assert.equal(root.CX_BACKEND_LAST_STATE.fallbackUsed,false);
  assert.equal(JSON.stringify(data._visitas),before);
});
