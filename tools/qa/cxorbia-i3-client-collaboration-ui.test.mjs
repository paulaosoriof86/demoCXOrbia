import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createOperationalCommandProvider} from '../../backend/runtime/cxorbia-operational-command-provider-v1.mjs';

const source=fs.readFileSync('app/modules/cliente-insights.js','utf8');
const settle=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
class Element{
  constructor(){this.listeners={};this.value='';this.dataset={};this.disabled=false;this.innerHTML='';this.nodes=new Map();}
  addEventListener(name,fn){this.listeners[name]=fn;}
  querySelector(id){if(!this.nodes.has(id))this.nodes.set(id,new Element());return this.nodes.get(id);}
  querySelectorAll(selector){return selector==='.npsN'?Array.from({length:11},(_,i)=>{const b=this.querySelector('.npsN'+i);b.dataset.n=String(i);return b;}):[];}
  fire(){return this.listeners.click?.({preventDefault(){}});}
}
function fixture({server=[],uid='client-a',role='cliente',failWrite=false,failRead=false,delayWrite=null}={}){
  let factory,counter=0,closes=0,storageAttempts=0;const host=new Element(),toasts=[],dialogs=[],calls=[];
  const state={uid,role,projectId:'project-a',periodId:'period-a',failWrite,failRead,delayWrite};
  const auth=()=>({authenticated:true,role:state.role,authNamespace:'staff',tenantId:'tenant-a',projectIds:[state.projectId]});
  const data={currentProjectId:'project-a',currentPeriodId:'period-a',period:()=>({id:state.periodId,name:'Programa',industry:'Retail'}),ctx:()=>({tenantId:'tenant-a',projectId:state.projectId,periodId:state.periodId}),visitas:()=>[]};
  const CX={data,session:{role, user:{name:'Cliente',clientPreviewReadOnly:false}},BACKEND:{enabled:true,enableCommandWrites:true,tenantId:'tenant-a'},backendAuth:{context:auth},module:(name,fn)=>{factory=fn;},notif:{push:()=>false}};
  CX.backendBulletins={listClientCollaboration:async()=>{
    if(state.failRead)throw Error('SERVER_READ_UNAVAILABLE');
    return {ok:true,source:'firestore_server',tenantId:'tenant-a',projectId:state.projectId,periodId:state.periodId,actorUid:state.uid,
      entries:server.filter(x=>x.projectId===state.projectId&&x.periodId===state.periodId&&(x.requesterUid===state.uid||['admin','super'].includes(state.role))).map(x=>({...x}))};
  }};
  for(const [method,kind] of [['submitClientNps','nps'],['createClientNote','note'],['requestClientMeeting','meeting']])data[method]=async payload=>{
    const actor=state.uid,project=state.projectId,period=state.periodId;calls.push({method,payload:{...payload},actor});
    if(state.delayWrite)await state.delayWrite;
    if(state.failWrite)return {ok:false,providerAck:false,status:'blocked',successUiAllowed:false};
    const id=kind+'-'+actor+'-'+payload.clientRequestId;let row=server.find(x=>x.id===id);
    if(!row){row={...payload,id,kind,tenantId:'tenant-a',projectId:project,periodId:period,requesterUid:actor,requesterName:'Cliente',createdAt:'2026-11-15T12:00:00Z',status:'pending',version:1};server.push(row);}
    return {ok:true,providerAck:true,status:'committed',successUiAllowed:true,readbackVerified:true,tenantId:'tenant-a',projectId:project,periodId:period,entityId:id,actorUid:actor};
  };
  const ui={el:()=>host,ph:()=>'',statusBdg:()=>'<span>pendiente</span>',aiBox:t=>t,toast:(message,tone)=>toasts.push({message,tone}),modal:(title,html,{onMount})=>{const ov=new Element();ov.innerHTML=html;dialogs.push(ov);onMount(ov,()=>{closes++;});return ov;}};
  const firebase={auth:()=>({currentUser:state.uid?{uid:state.uid}:null})};
  const crypto={randomUUID:()=>`request-00000000-${++counter}`};const window={CX,firebase,crypto};
  Object.defineProperty(window,'CX_BACKEND_AUTHORIZED_STATE',{get:()=>({tenantId:'tenant-a',principal:{...auth(),actorUid:state.principalUid||state.uid}})});
  vm.runInNewContext(source,{CX,window,firebase,crypto,Date,console,setTimeout,clearTimeout,localStorage:{getItem:()=>null,setItem(){storageAttempts++;throw Error('STORAGE_FULL');}}});
  factory({data,ui});
  return {host,CX,window,state,server,toasts,calls,dialogs,closes:()=>closes,storageAttempts:()=>storageAttempts,
    async open(kind){await settle();await host.querySelector({nps:'#npsBtn',note:'#notaBtn',meeting:'#reuBtn'}[kind]).fire();const ov=dialogs.at(-1);assert.ok(ov,'DIALOG_NOT_OPENED');
      if(kind==='nps'){ov.querySelector('#npsCom').value='Comentario';return {ov,button:ov.querySelectorAll('.npsN')[9]};}
      if(kind==='note'){ov.querySelector('#ntTema').value='Hallazgo';ov.querySelector('#ntTxt').value='Detalle';return {ov,button:ov.querySelector('#ntOk')};}
      ov.querySelector('#ruTema').value='Revisión';ov.querySelector('#ruF').value='2099-12-15';ov.querySelector('#ruH').value='10:00';ov.querySelector('#ruM').value='Presencial';return {ov,button:ov.querySelector('#ruOk')};
    }};
}

for(const kind of ['nps','note','meeting'])test(`${kind}: failed provider never closes the form or announces success`,async()=>{
  const x=fixture({failWrite:true}),{button}=await x.open(kind);await button.fire();await settle();
  assert.equal(x.closes(),0);assert.equal(x.toasts.filter(x=>x.tone==='ok').length,0);assert.equal(x.server.length,0);assert.equal(x.storageAttempts(),0);assert.equal(x.calls.length,1);
});
test('all three successful commands require server readback and survive a new authorized session',async()=>{
  const server=[],x=fixture({server});
  for(const kind of ['nps','note','meeting']){const {button}=await x.open(kind);await button.fire();await settle();}
  assert.equal(x.closes(),3);assert.equal(x.toasts.filter(x=>x.tone==='ok').length,3);assert.equal(server.length,3);assert.equal(x.storageAttempts(),0);
  const again=fixture({server});await settle();assert.match(again.host.innerHTML,/Hallazgo/);assert.match(again.host.innerHTML,/Revisión/);assert.match(again.host.innerHTML,/1 respuesta\(s\)/);
  const other=fixture({server,uid:'client-b'});await settle();assert.doesNotMatch(other.host.innerHTML,/Hallazgo|Revisión<\/b>/);assert.match(other.host.innerHTML,/0 respuesta\(s\)/);
});
test('committed but unreadable write holds the modal; retry uses the same key and creates no duplicate',async()=>{
  const x=fixture(),{button}=await x.open('note');x.state.failRead=true;await button.fire();await settle();assert.equal(x.server.length,1);assert.equal(x.closes(),0);assert.equal(x.toasts.filter(x=>x.tone==='ok').length,0);
  x.state.failRead=false;await button.fire();await settle();assert.equal(x.server.length,1);assert.equal(x.closes(),1);assert.equal(x.calls[0].payload.clientRequestId,x.calls[1].payload.clientRequestId);
});
test('two concurrent clicks invoke only one command and acknowledge once',async()=>{
  let release;const delay=new Promise(r=>{release=r;}),x=fixture({delayWrite:delay}),{button}=await x.open('note');const a=button.fire(),b=button.fire();await settle();assert.equal(x.calls.length,1);release();await Promise.all([a,b]);await settle();assert.equal(x.server.length,1);assert.equal(x.closes(),1);
});
for(const key of ['uid','projectId','periodId','generation'])test('a late ACK after changing '+key+' never publishes into the new context',async()=>{
  let release;const delay=new Promise(r=>{release=r;}),x=fixture({delayWrite:delay}),{button}=await x.open('note');const pending=button.fire();await settle();
  if(key==='generation')x.window.CX_PROTECTED_AUTH_HR_AUTHORITY={sessionGeneration:'new'};else x.state[key]='other';
  release();await pending;await settle();assert.equal(x.closes(),0);assert.equal(x.toasts.filter(x=>x.tone==='ok').length,0);assert.doesNotMatch(x.host.innerHTML,/Hallazgo<\/b>/);
});
for(const patch of [{readbackVerified:false},{actorUid:'other'},{projectId:'other'},{periodId:'other'},{tenantId:'other'}])test('UI refuses an apparently successful ACK with wrong proof '+JSON.stringify(patch),async()=>{
 const x=fixture(),{button}=await x.open('note'),original=x.CX.data.createClientNote;x.CX.data.createClientNote=async p=>({...await original(p),...patch});
 await button.fire();await settle();assert.equal(x.closes(),0);assert.equal(x.toasts.filter(x=>x.tone==='ok').length,0);
});
for(const patch of [{actorUid:'other'},{projectId:'other'},{periodId:'other'},{source:'local_cache'}])test('UI refuses mismatched independent read '+JSON.stringify(patch),async()=>{
 const x=fixture(),{button}=await x.open('note'),original=x.CX.backendBulletins.listClientCollaboration;x.CX.backendBulletins.listClientCollaboration=async()=>({...await original(),...patch});
 await button.fire();await settle();assert.equal(x.closes(),0);assert.equal(x.toasts.filter(x=>x.tone==='ok').length,0);
});
test('durable text is escaped and the administrative client preview never writes',async()=>{
  const server=[{id:'a',kind:'note',tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',requesterUid:'client-a',requesterName:'<script>actor</script>',subject:'<img src=x onerror=bad()>',detail:'<svg onload=bad()>',createdAt:'2026-11-15',status:'pending',version:1}];
  const x=fixture({server});await settle();assert.match(x.host.innerHTML,/&lt;img/);assert.doesNotMatch(x.host.innerHTML,/<img src=x|<svg onload|<script>actor/);
  const admin=fixture({server,uid:'admin-a',role:'admin'});admin.CX.session.user.clientPreviewReadOnly=true;await settle();await admin.host.querySelector('#notaBtn').fire();assert.equal(admin.dialogs.length,0);assert.equal(admin.calls.length,0);
});
test('a Firebase UID not bound to the authorized backend principal cannot submit',async()=>{
 const x=fixture();x.state.principalUid='stale-actor';await settle();x.host.querySelector('#notaBtn').fire();assert.equal(x.dialogs.length,0);assert.equal(x.calls.length,0);
});

// Exercise all five production owners together. The only substitutes are Firebase IO and DOM.
function integratedStore(){
 const rows=new Map(),reads=[],commands=[];let tail=Promise.resolve();
 const copy=x=>x===undefined?undefined:JSON.parse(JSON.stringify(x));
 const snapshot=(path,row)=>({id:path.split('/').at(-1),exists:row!==undefined,data:()=>copy(row),metadata:{fromCache:false}});
 const doc=path=>({path,id:path.split('/').at(-1),collection:name=>collection(path+'/'+name),get:async()=>snapshot(path,rows.get(path))});
 const collection=(path,conditions=[])=>({path,doc:id=>doc(path+'/'+id),where:(key,op,value)=>collection(path,[...conditions,{key,op,value}]),get:async options=>{
   assert.equal(options?.source,'server');reads.push({path,conditions:copy(conditions),source:options.source});
   const found=[...rows].filter(([p,v])=>p.startsWith(path+'/')&&!p.slice(path.length+1).includes('/')&&conditions.every(c=>c.op==='array-contains'?(v[c.key]||[]).includes(c.value):v[c.key]===c.value));
   return {metadata:{fromCache:false},forEach:fn=>found.forEach(([p,v])=>fn(snapshot(p,v)))};
 }});
 const db={collection,runTransaction:fn=>{const task=tail.then(async()=>{const changes=[];let wrote=false;const result=await fn({get:async r=>{assert.equal(wrote,false);return snapshot(r.path,rows.get(r.path));},create:(r,v)=>{assert.equal(rows.has(r.path),false);wrote=true;changes.push([r.path,copy(v)]);},set:(r,v)=>{wrote=true;changes.push([r.path,copy(v)]);}});changes.forEach(([p,v])=>rows.set(p,v));return result;});tail=task.catch(()=>{});return task;}};
 const claims={};for(const [uid,role] of [['client-a','cliente'],['client-b','cliente'],['admin-a','admin']]){
   claims[uid]={uid,role,authNamespace:'staff',tenantId:'tenant-a',projectIds:['project-a']};rows.set('tenants/tenant-a/users/'+uid,{...claims[uid],name:'Verificado '+uid,status:'active'});
 }
 rows.set('tenants/tenant-a/projects/project-a',{id:'project-a',tenantId:'tenant-a',state:'activo',timeZone:'UTC'});
 rows.set('tenants/tenant-a/projects/project-a/periods/period-a',{id:'period-a',tenantId:'tenant-a',projectId:'project-a',state:'activo'});
 const provider=createOperationalCommandProvider({db,auth:{verifyIdToken:async token=>copy(claims[token])},policy:{schemaVersion:'cxorbia.operational.provider-policy.v1',enabled:true,allowedTenantIds:['tenant-a'],allowedProjectIds:[],conflictPolicy:'review_no_silent_overwrite',hrWrites:false,makeCalls:false,geminiCalls:false,storageWrites:false,paymentWrites:false}});
 return {db,rows,reads,commands,claims,provider};
}
function fullSession(store,uid){
 let factory,closes=0,counter=0;const host=new Element(),dialogs=[],toasts=[];
 const auth=store.claims[uid],data={period:()=>({id:'period-a',name:'Programa',industry:'Retail'}),ctx:()=>({tenantId:'tenant-a',projectId:'project-a',periodId:'period-a'}),currentProjectId:'project-a',currentPeriodId:'period-a',visitas:()=>[]};
 const CX={data,session:{role:auth.role,user:{name:'UI name is not authority',clientPreviewReadOnly:auth.role==='admin'}},BACKEND:{enabled:true,enableCommandWrites:true,tenantId:'tenant-a',previewMode:false},backendAuth:{context:()=>({role:auth.role,authNamespace:auth.authNamespace,tenantId:auth.tenantId,projectIds:auth.projectIds,authenticated:true,shopperId:null,provider:'firebase',source:'custom-claims-current-rules'})},module:(name,fn)=>{factory=fn;}};
 const firebase={apps:[{}],auth:()=>({currentUser:{uid}}),firestore:()=>store.db};
 const window={CX,firebase,crypto:{randomUUID:()=>`integration-${uid}-${++counter}`},CX_BACKEND_AUTHORIZED_STATE:{tenantId:'tenant-a',principal:{...auth,actorUid:uid}},addEventListener(){}};
 const context=vm.createContext({CX,window,firebase,console,Date,queueMicrotask,setTimeout:()=>0,clearTimeout(){},document:{readyState:'complete',addEventListener(){}}});
 for(const path of ['app/adapters/cxorbia-command-adapter-v1.js','app/adapters/cxorbia-cxdata-command-boundary-v1.js','app/core/backend-bulletins.js'])vm.runInContext(fs.readFileSync(path,'utf8'),context,{filename:path});
 CX.commandAdapter.registerTransport('test-real-provider',{execute:async command=>{store.commands.push(JSON.parse(JSON.stringify(command)));return store.provider.execute(uid,JSON.parse(JSON.stringify(command)));}});CX.commandAdapter.useTransport('test-real-provider');
 const ui={el:()=>host,ph:()=>'',statusBdg:()=>'<span>pendiente</span>',aiBox:t=>t,toast:(message,tone)=>toasts.push({message,tone}),modal:(title,html,{onMount})=>{const ov=new Element();ov.innerHTML=html;dialogs.push(ov);onMount(ov,()=>{closes++;});}};
 vm.runInContext(source,context);factory({data,ui});
 return {host,CX,toasts,dialogs,closes:()=>closes};
}
test('real UI, boundary, adapter, provider and server reader persist all three flows across independent sessions with private scope',async()=>{
 const store=integratedStore(),a=fullSession(store,'client-a');await settle();
 for(const kind of ['nps','note','meeting']){
   a.host.querySelector({nps:'#npsBtn',note:'#notaBtn',meeting:'#reuBtn'}[kind]).fire();const ov=a.dialogs.at(-1);
   if(kind==='nps'){ov.querySelector('#npsCom').value='Programa';await ov.querySelectorAll('.npsN')[9].fire();}
   if(kind==='note'){ov.querySelector('#ntTema').value='Nota integrada';ov.querySelector('#ntTxt').value='Persistencia verificada';await ov.querySelector('#ntOk').fire();}
   if(kind==='meeting'){ov.querySelector('#ruTema').value='Reunión integrada';ov.querySelector('#ruF').value='2099-12-15';ov.querySelector('#ruH').value='10:00';ov.querySelector('#ruM').value='Presencial';await ov.querySelector('#ruOk').fire();}
   await settle();
 }
 assert.equal(a.closes(),3,JSON.stringify(a.toasts));assert.equal(store.commands.length,3);assert.equal([...store.rows.keys()].filter(p=>p.includes('/bulletins/')).length,3);
 const again=fullSession(store,'client-a');await settle();assert.match(again.host.innerHTML,/Nota integrada/);assert.match(again.host.innerHTML,/Reunión integrada/);assert.match(again.host.innerHTML,/1 respuesta\(s\)/);
 const b=fullSession(store,'client-b');await settle();assert.doesNotMatch(b.host.innerHTML,/Nota integrada|Reunión integrada|Persistencia verificada/);
 const admin=fullSession(store,'admin-a');await settle();assert.match(admin.host.innerHTML,/Nota integrada/);assert.match(admin.host.innerHTML,/Verificado client-a/);admin.host.querySelector('#notaBtn').fire();assert.equal(admin.dialogs.length,0);
 const attempt=await admin.CX.data.createClientNote({subject:'Spoof',detail:'No',clientRequestId:'admin-attempt-01'},{ackAware:true});assert.equal(attempt.ok,false);assert.equal(store.commands.length,3);
 const replay=await store.provider.execute('client-a',store.commands[1]);assert.equal(replay.ok,true);assert.equal(replay.providerWrites,0);assert.equal([...store.rows.keys()].filter(p=>p.includes('/bulletins/')).length,3);
 assert.ok(store.reads.some(x=>x.conditions.some(c=>c.key==='targetUserIds'&&c.op==='array-contains'&&c.value==='client-b')));
 assert.ok(store.reads.every(x=>x.source==='server'));
});
