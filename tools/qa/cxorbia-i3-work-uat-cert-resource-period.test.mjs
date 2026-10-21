import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Scope-only source regression: no Firebase/Auth/HR/network writes.
const resourcesSource=fs.readFileSync(new URL('../../app/core/backend-resources.js',import.meta.url),'utf8');
const routerSource=fs.readFileSync(new URL('../../app/core/router.js',import.meta.url),'utf8');
const SEP='cinepolis-2026-09',OCT='cinepolis-2026-10';
const items=[
 {id:'sept-draft',projectId:'cinepolis',periodId:SEP,status:'active',resourceType:'certification_bank',visibleRoles:['shopper','admin'],bank:{estado:'pending_review',preguntas:new Array(10).fill({q:'fixture'})}},
 {id:'oct-published',projectId:'cinepolis',periodId:OCT,status:'active',resourceType:'certification_bank',visibleRoles:['shopper','admin'],bank:{estado:'published',preguntas:new Array(8).fill({q:'fixture'})}},
 {id:'other-project-bank',projectId:'other-project',periodId:'other-project-2026-10',status:'active',resourceType:'certification_bank',visibleRoles:['shopper','admin'],bank:{estado:'published',preguntas:new Array(4).fill({q:'fixture'})}}
];
function harness({deferred=false,fail=false}={}){
 const bus=new Map(),dom=new Map(),pending=[],emitted=[];
 const cx={BACKEND:{enabled:true,tenantId:'qa-tenant'},data:{currentProjectId:'cinepolis',currentPeriodId:SEP,ctx(){return{projectId:this.currentProjectId,periodId:this.currentPeriodId};}},session:{role:'shopper',effectiveRole(){return this.role;}},bus:{
  on(k,fn){if(!bus.has(k))bus.set(k,[]);bus.get(k).push(fn);},
  emit(k,x){emitted.push({k,x});return Promise.all((bus.get(k)||[]).map(fn=>fn(x)));}
 }};
 class Query {
  constructor(conditions=[]){this.conditions=conditions;}
  where(field,op,value){return new Query([...this.conditions,{field,op,value}]);}
  snapshot(){return{docs:items.filter(row=>this.conditions.every(([f,op,v])=>op==='=='?row[f]===v:op==='array-contains'?row[f].includes(v):false)).map(row=>({id:row.id,data:()=>row}))};}
  get(){if(fail)return Promise.reject(new Error('MOCK_FIRESTORE_DENIED'));if(deferred)return new Promise((resolve,reject)=>pending.push({resolve,reject,snapshot:()=>this.snapshot()}));return Promise.resolve(this.snapshot());}
 }
 const firebase={apps:[{}],auth:()=>({currentUser:{uid:'qa-user'}}),firestore:()=>({collection:()=>({doc:()=>({collection:()=>new Query()})})})};
 const win={CX:cx,firebase,addEventListener(k,fn){if(!dom.has(k))dom.set(k,[]);dom.get(k).push(fn);}};
 vm.runInNewContext(resourcesSource,{window:win,document:{readyState:'complete'},firebase,CX:cx,console,setTimeout});
 return {cx,win,pending,emitted,emit:(k,x)=>cx.bus.emit(k,x),dom:(k)=>{for(const f of dom.get(k)||[])f({detail:{}})},banks:(periodId,projectId='cinepolis')=>cx.backendResources.list({projectId,periodId,resourceType:'certification_bank'})};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
test('D/Cert: published October bank reloads after the protected HR authority changes period',async()=>{
 const h=harness();await h.emit('backend-ready',{source:'firestore'});
 assert.equal(h.banks(SEP).length,1);
 assert.equal(h.banks(OCT).length,0);
 h.cx.data.currentPeriodId=OCT;
 h.dom('cx:protected-auth-hr-authority-ready');await flush();
 assert.deepEqual(Array.from(h.banks(OCT),x=>x.id),['oct-published']);
 assert.equal(h.banks(SEP).length,0);
 assert.equal(h.win.CX_BACKEND_RESOURCES_STATUS.periodId,OCT);
 assert.equal(h.emitted.filter(e=>e.k==='resources').length,2);
 assert.match(routerSource,/\['visit-flow','shoppers','clients','programa','project','resources'\]/);
});
test('D/Cert: later stale September response never replaces the current October bank',async()=>{
 const h=harness({deferred:true});
 const p=h.emit('backend-ready',{source:'firestore'});
 h.cx.data.currentPeriodId=OCT;h.dom('cx:protected-auth-hr-authority-ready');
 assert.equal(h.pending.length,2);
 h.pending[1].resolve(h.pending[1].snapshot());await flush();
 assert.deepEqual(Array.from(h.banks(OCT),x=>x.id),['oct-published']);
 h.pending[0].resolve(h.pending[0].snapshot());await p;await flush();
 assert.deepEqual(Array.from(h.banks(OCT),x=>x.id),['oct-published']);
});
test('D/Cert: project change never retains another project or period in cache',async()=>{
 const h=harness();await h.emit('backend-ready',{source:'firestore'});
 h.cx.data.currentProjectId='other-project';h.cx.data.currentPeriodId='other-project-2026-10';
 await h.emit('project',{source:'fixture'});await flush();
 assert.deepEqual(Array.from(h.banks('other-project-2026-10','other-project'),x=>x.id),['other-project-bank']);
 assert.equal(h.banks(OCT).length,0);
});
test('D/Cert: provider read error is fail-closed, not an unverified empty-bank PASS',async()=>{
 const h=harness({fail:true});
 await assert.rejects(h.cx.backendResources.load(),/MOCK_FIRESTORE_DENIED/);
 assert.equal(h.win.CX_BACKEND_RESOURCES_STATUS.status,'blocked');
 assert.equal(h.win.CX_BACKEND_RESOURCES_STATUS.reason,'RESOURCE_PROVIDER_READ_FAILED');
 assert.equal(h.banks(SEP).length,0);
});
