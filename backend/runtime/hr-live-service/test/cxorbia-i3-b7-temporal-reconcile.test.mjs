import test from 'node:test';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createOperationalCommandProvider} from '../../cxorbia-operational-command-provider-v1.mjs';

// Local in-memory fake: absolutely no external provider, HR, Firebase or Auth writes.
const clone=v=>v===undefined?undefined:structuredClone(v);
class Ref {
  constructor(db,path){this.db=db;this.path=path;this.id=path.split('/').at(-1);}
  collection(n){return new Ref(this.db,this.path+'/'+n);}
  doc(n){return new Ref(this.db,this.path+'/'+n);}
  async get(){return {exists:this.db.rows.has(this.path),data:()=>clone(this.db.rows.get(this.path))};}
}
class FakeDb {
  constructor(){this.rows=new Map();}
  collection(n){return new Ref(this,n);}
  seed(p,v){this.rows.set(p,clone(v));}
  read(p){return clone(this.rows.get(p));}
  async runTransaction(fn){
    const next=new Map([...this.rows].map(([k,v])=>[k,clone(v)]));
    const tx={
      get:async r=>({exists:next.has(r.path),data:()=>clone(next.get(r.path))}),
      create:(r,v)=>{if(next.has(r.path))throw Error('ALREADY_EXISTS');next.set(r.path,clone(v));},
      set:(r,v,o={})=>next.set(r.path,o.merge&&next.has(r.path)?{...clone(next.get(r.path)),...clone(v)}:clone(v)),
      delete:r=>next.delete(r.path)
    };
    const result=await fn(tx);this.rows=next;return result;
  }
}
const auth={verifyIdToken:async()=>({uid:'admin-1',tenantId:'tenant-a',role:'admin',authNamespace:'staff',projectIds:['project-a']})};
const policy={schemaVersion:'cxorbia.operational.provider-policy.v1',enabled:true,allowedTenantIds:['tenant-a'],allowedProjectIds:['project-a'],conflictPolicy:'review_no_silent_overwrite',hrWrites:false,makeCalls:false,geminiCalls:false,storageWrites:false,paymentWrites:false};
const provider=db=>createOperationalCommandProvider({auth,db,policy});
const projectPath='tenants/tenant-a/projects/project-a',visitPath=projectPath+'/visits/HR!2';
const hr=fields=>({sourceSafe:true,imported:false,firestoreWrites:0,tenantId:'tenant-a',projectId:'project-a',currentPeriodId:'period-a',visits:[{hrRowId:'HR!2',visitId:'logical-visit',periodId:'period-a',sourceTab:'HR',sourceRow:2,estado:'disponible',status:'disponible',shopperId:null,sucursal:'Sala Alfa',ciudad:'Ciudad',canonicalFacets:{available:true,assigned:false},...fields}]});
const command=id=>({version:'cxorbia-command-adapter-v1',commandType:'reservation.create',entityType:'reservation',entityId:'rsv-'+id,tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',expectedVersion:'absent',idempotencyKey:'b7-'+id,authorization:{providerEnforcementRequired:true},payload:{visitId:'HR!2',hrRowId:'HR!2',branchId:'sala-alfa|ciudad',shopperId:'shopper-a',status:'solicitada'}});
function setup(){
  const db=new FakeDb();
  db.seed('tenants/tenant-a/users/admin-1',{active:true,tenantId:'tenant-a',role:'admin',authNamespace:'staff',projectIds:['project-a']});
  db.seed(projectPath,{reservationWindowMode:'future_only',timeZone:'America/Guatemala'});
  return db;
}
function seedOld(db,dates){
  db.seed(visitPath,{id:'HR!2',visitId:'HR!2',hrRowId:'HR!2',tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',estado:'disponible',status:'disponible',shopperId:null,sucursal:'Sala Alfa',ciudad:'Ciudad',protectedOperatorNote:'preserve',version:4,...dates});
}
test('I3 B7: stale durable date blocks before HR reconciliation, then HR date enables ACK with idempotent replay',async()=>{
  const db=setup(),p=provider(db);
  seedOld(db,{periodKey:'2026-01',disponibleDesde:'2026-01-05',availableFrom:'2026-01-05'});
  const rejected=await p.execute('fixture-token',command('before'));
  assert.equal(rejected.code,'OPS_RESERVATION_FUTURE_WINDOW_REQUIRED');
  assert.equal(rejected.providerAck,false);assert.equal(rejected.providerWrites,0);
  const fresh=hr({periodKey:'2099-11',disponibleDesde:'2099-11-05',availableFrom:'2099-11-05'});
  const first=await p.reconcileSnapshot(fresh,{sourceRevision:'HR-EXACT-REV-1'});
  assert.equal(first.providerWrites,1);assert.equal(first.hrWrites,0);
  const row=db.read(visitPath);
  assert.equal(row.periodKey,'2099-11');assert.equal(row.disponibleDesde,'2099-11-05');assert.equal(row.availableFrom,'2099-11-05');
  assert.equal(row.periodId,'period-a');assert.equal(row.protectedOperatorNote,'preserve');
  const replay=await p.reconcileSnapshot(fresh,{sourceRevision:'HR-EXACT-REV-1'});
  assert.equal(replay.providerWrites,0);assert.equal(replay.idempotentReplays,1);
  const saved=await p.execute('fixture-token',command('after'));
  assert.equal(saved.ok,true);assert.equal(saved.providerAck,true);assert.equal(saved.status,'committed');
  const again=await p.execute('fixture-token',command('after'));
  assert.equal(again.idempotentReplay,true);assert.equal(again.providerWrites,0);
});
test('I3 B7: removal of HR future fields invalidates stale window, never fabricates available dates',async()=>{
  const db=setup(),p=provider(db);
  seedOld(db,{periodKey:'2099-11',disponibleDesde:'2099-11-05',availableFrom:'2099-11-05'});
  const fix=await p.reconcileSnapshot(hr({}),{sourceRevision:'HR-EXACT-REV-2'});
  assert.equal(fix.providerWrites,1);
  const row=db.read(visitPath);
  assert.equal(row.periodKey,null);assert.equal(row.disponibleDesde,null);assert.equal(row.availableFrom,null);
  assert.equal(row.periodId,'period-a');
  const rejected=await p.execute('fixture-token',command('missing-date'));
  assert.equal(rejected.code,'OPS_RESERVATION_FUTURE_WINDOW_REQUIRED');
  assert.equal(rejected.providerAck,false);assert.equal(rejected.providerWrites,0);
});
test('I3 B7 dashboard and postulations share the same scoped direct request modal',async()=>{
  const fs=await import('node:fs'),vm=await import('node:vm');
  const cx={module(){},notif:{pushDurable:async payload=>{sent.push(payload);return {ok:true,providerAck:true};}}};
  const sent=[],modalCalls=[],notices=[],events={};
  const win={CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY:async()=>({ok:true})};
  vm.runInNewContext(fs.readFileSync('app/modules/postulaciones.js','utf8'),{CX:cx,window:win,setTimeout:()=>{}},{timeout:5000});
  const visits=[
    {id:'visit-a',shopperId:'shopper-a',shopper:'Alice',sucursal:'Sucursal A',pais:'GT',estado:'asignada'},
    {id:'visit-b',shopperId:'shopper-b',shopper:'Bob',sucursal:'Sucursal B',pais:'HN',estado:'asignada'}
  ];
  const data={_posts:[],visitas:()=>visits,inScope:()=>true,currentProjectId:'project-a',currentPeriodId:'period-a',getShopper:()=>null};
  const ui={modal:(name,body,opts)=>modalCalls.push({name,body,opts}),toast:(...a)=>notices.push(a),empty:()=>'',aiBox:()=>''};
  const owner=cx.adminPostulacionesActions;
  assert.equal(typeof owner.openRequest,'function');
  assert.equal(typeof owner.openAgenda,'function');
  assert.equal(owner.openRequest({data,ui,visitIds:['visit-a'],defaultType:'agendar'}),true);
  assert.match(modalCalls[0].body,/Sucursal A/);
  assert.doesNotMatch(modalCalls[0].body,/Sucursal B/);
  const fake=(value='')=>({value,addEventListener:(name,cb)=>{events[name]=cb;},disabled:false,textContent:''});
  const items={'#rqTipo':fake(), '#rqSh':fake('visit:visit-a'),'#rqNota':fake(''), '#rqSend':fake()};
  const ov={querySelector:key=>items[key]||fake()};
  modalCalls[0].opts.onMount(ov,()=>{});
  assert.equal(items['#rqTipo'].value,'agendar');
  await events.click();
  assert.equal(sent.length,1);
  assert.equal(sent[0].shopperId,'shopper-a');
  assert.equal(sent[0].entityId,'visit-a');
  assert.equal(sent[0].eventKey,'admin_request_agendar');
  const dash=fs.readFileSync('app/modules/dashboard.js','utf8');
  assert.match(dash,/owner\.openRequest\(\{data,ui,visitIds:ids/);
  assert.match(dash,/owner\.openAgenda\(\{data,ui,visitIds:ids/);
  assert.doesNotMatch(dash,/CX_PENDING_ADMIN_OPERATION_ACTION/);
});

test('I3 B7 shared agenda modal reviews exact durable pending date with provider ACK',async()=>{
  const fs=await import('node:fs'),vm=await import('node:vm');
  const actions=[],toast=[],shown=[];
  const cx={module(){},permissions:{gate:()=>true},backend:{refresh:async()=>{}},notif:{pushDurable:async()=>({ok:true,providerAck:true})}};
  vm.runInNewContext(fs.readFileSync('app/modules/postulaciones.js','utf8'),{CX:cx,window:{},setTimeout:()=>{}},{timeout:5000});
  // Keep provider-eligible calendar fixtures relative to execution day; prior hardcoded
  // Oct 18, 2026 became expired and correctly failed closed on Oct 19.
  const isoAfter=days=>new Date(Date.now()+days*86400000).toISOString().slice(0,10);
  const scheduleDate=isoAfter(6),proposedDate=isoAfter(7);
  const records=[
    {id:'visit-c',shopperId:'shopper-c',shopper:'Carlos',sucursal:'Centro C',pais:'GT',agendada:scheduleDate,rescheduleRequest:{status:'pending_review',newDate:proposedDate}},
    {id:'visit-d',shopperId:'shopper-d',shopper:'Diana',sucursal:'Centro D',pais:'HN',agendada:scheduleDate,rescheduleRequest:{status:'pending_review',newDate:isoAfter(8)}}
  ];
  const data={visitas:()=>records,visitFacets:()=>({scheduled:true,realized:false}),currentProjectId:'project-a',currentPeriodId:'period-a',requestVisitReschedule:async(...args)=>{actions.push(args);return {ok:true,status:'committed',providerAck:true,successUiAllowed:true};}};
  const ui={modal:(...args)=>shown.push(args),toast:(...args)=>toast.push(args),empty:()=>'',aiBox:()=>''};
  const ok=cx.adminPostulacionesActions.openAgenda({data,ui,visitIds:['visit-c']});
  assert.equal(ok,true);assert.match(shown[0][1],/Centro C/);assert.doesNotMatch(shown[0][1],/Centro D/);
  assert.match(shown[0][1],/Fechas pendientes de autorización/);assert.match(shown[0][1],/data-date-decision="approved"/);
  const approval={dataset:{vid:'visit-c',dateDecision:'approved'},textContent:'Autorizar',disabled:false,addEventListener:(_event,cb)=>approval.click=cb};
  shown[0][2].onMount({querySelectorAll:selector=>selector==='[data-date-decision]'?[approval]:[]},()=>{});
  await approval.click();assert.equal(actions.length,1);
  assert.equal(actions[0][0],'visit-c');assert.equal(actions[0][1],proposedDate);assert.equal(actions[0][2].ackAware,true);
  assert.equal(actions[0][2].decision,'approved');
  // Expired proposals must remain non-authorizable even when a newer valid case passes.
  assert.equal(cx.adminPostulacionesActions.rescheduleReadiness({rescheduleRequest:{newDate:'2020-01-01'}},data).eligible,false);
});

test('I3 B7 direct contextual menu uses existing Postulaciones owner, scoped assignment and ACK',async()=>{
  const fs=await import('node:fs'),vm=await import('node:vm');
  const log=[],dialogs=[];
  const cx={module(){},permissions:{gate:()=>true},backend:{refresh:async()=>{}},notif:{pushDurable:async()=>({ok:true,providerAck:true})}};
  vm.runInNewContext(fs.readFileSync('app/modules/postulaciones.js','utf8'),{CX:cx,window:{},setTimeout:()=>{}},{timeout:5000});
  const v={id:'v-active',shopperId:null,sucursal:'Sucursal Activa',pais:'GT',estado:'disponible'};
  const data={visitas:()=>[v],visitFacets:()=>({available:true}),inScope:()=>true,shoppers:[{id:'s-1',nombre:'Shopper Uno',pais:'GT',projectIds:['p-1']},{id:'s-2',nombre:'Shopper Dos',pais:'HN',projectIds:['p-1']}],currentProjectId:'p-1',currentPeriodId:'period-1',assignVisit:async(...args)=>{log.push(args);return{ok:true,status:'committed',providerAck:true,successUiAllowed:true}}};
  const ui={modal:(...args)=>dialogs.push(args),toast:()=>{}};
  const owner=cx.adminPostulacionesActions;
  assert.equal(typeof owner.openContext,'function');
  assert.equal(owner.openContext({data,ui,visitId:v.id}),true);
  assert.match(dialogs[0][1],/Asignar shopper/);
  assert.doesNotMatch(dialogs[0][1],/Reasignar visita/);
  const button={dataset:{cxAdminAction:'assign'},addEventListener:(_name,cb)=>button.click=cb};
  dialogs[0][2].onMount({querySelectorAll:()=>[button]},()=>{});
  button.click();
  assert.equal(dialogs.length,2);
  assert.match(dialogs[1][1],/Shopper Uno/);assert.doesNotMatch(dialogs[1][1],/Shopper Dos/);
  const items={'#cxDashShopper':{value:'s-1'},'#cxDashAssignOk':{disabled:false,textContent:'Confirmar',addEventListener:(_name,cb)=>items['#cxDashAssignOk'].click=cb}};
  dialogs[1][2].onMount({querySelector:key=>items[key]},()=>{});
  await items['#cxDashAssignOk'].click();
  assert.equal(log.length,1);assert.equal(log[0][0],'v-active');assert.equal(log[0][1],'s-1');assert.equal(log[0][2].ackAware,true);
  assert.equal(log[0][2].assignmentSource,'platform');
});
test('I3 B7 cancellation modal fails closed before remote ACK',async()=>{
  const fs=await import('node:fs'),vm=await import('node:vm');
  const requests=[],dialogs=[],messages=[];
  const cx={module(){},permissions:{gate:()=>true},backend:{refresh:async()=>{}}};
  vm.runInNewContext(fs.readFileSync('app/modules/postulaciones.js','utf8'),{CX:cx,window:{},setTimeout:()=>{}},{timeout:5000});
  const v={id:'v-cancel',shopperId:'s-cancel',sucursal:'Centro',pais:'GT',cancelRequest:{status:'pending_review',reason:'No puedo asistir'}};
  const data={visitas:()=>[v],currentProjectId:'p-1',requestVisitCancel:async(...args)=>{requests.push(args);return{ok:false,providerAck:false,status:'blocked'}}};
  const ui={modal:(...args)=>dialogs.push(args),toast:(...args)=>messages.push(args)};
  assert.equal(cx.adminPostulacionesActions.openCancellation({data,ui,visitId:v.id,decision:'approved'}),true);
  const items={'#cxDashCancelReason':{value:'Revisado y autorizado'},'#cxDashCancelOk':{disabled:false,textContent:'Confirmar',addEventListener:(_name,cb)=>items['#cxDashCancelOk'].click=cb}};
  let closed=false;dialogs[0][2].onMount({querySelector:key=>items[key]},()=>{closed=true});
  await items['#cxDashCancelOk'].click();
  assert.equal(closed,false);assert.equal(requests.length,1);assert.equal(requests[0][0],v.id);
  assert.equal(requests[0][1].decision,'approved');assert.equal(requests[0][1].ackAware,true);
  assert.equal(messages.at(-1)[1],'warn');
});

test('I3 B7 filter applies search to both posts and HR assignments and closes stale KPI modals',()=>{
 const src=fs.readFileSync('app/modules/postulaciones.js','utf8');
 assert.match(src,/document\.querySelectorAll\('#poAssignedGroups \[data-cx-assignment-card\]'\)/);
 assert.match(src,/document\.querySelectorAll\('#poAssignedGroups \[data-cx-assignment-group\]'\)/);
 assert.match(src,/searchable\.includes\(q\)/);
 assert.match(src,/projectOk&&countryOk&&stateOk/);
 assert.match(src,/\{replaceExisting:true,onMount:\(ov,close\)=>ov\.querySelectorAll\('\.poRowGest'\)/);
 assert.match(src,/Sin solicitudes vigentes en esta categoría\.'\),\{replaceExisting:true,onMount:/);
 assert.match(src,/document\.querySelectorAll\('#pGroups \[data-pid\]'\)/);
});
