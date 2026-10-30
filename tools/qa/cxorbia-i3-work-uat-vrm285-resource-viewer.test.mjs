import './cxorbia-i3-d07-authenticated-pdf-resource.test.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// VRM-285. UI-only fixture: no Firebase, HR, Auth or Storage writes.
const source=fs.readFileSync(new URL('../../app/modules/documentos.js',import.meta.url),'utf8');

function fixture(){
  const callbacks=new Map();
  const docs=[{id:'resource-pdf-1',n:'Instructivo Shopper Cinépolis',ic:'📄',
    meta:'instructivo.pdf',tipo:'pdf',url:'https://fixture.invalid/instructivo.pdf',
    projectId:'cinepolis',periodId:'cinepolis-2026-10',resourceType:'project_resource',
    visibleRoles:['admin','shopper']}];
  let uid='admin-dev-uid';
  class Host {
    constructor(){this.html='';this.buttons=[];this.back=null;this.updates=0;this.isConnected=true;}
    set innerHTML(value){this.html=value;this.buttons=[];this.back=null;this.updates++;}
    get innerHTML(){return this.html;}
    querySelector(selector){
      if(selector==='#docBack'&&this.html.includes('id="docBack"'))
        return {addEventListener:(_ev,fn)=>{this.back=fn;}};
      if(selector==='[data-pdf-viewer]'&&this.html.includes('data-pdf-viewer'))
        return {isConnected:true,querySelector:()=>null};
      return null;
    }
    querySelectorAll(selector){
      if(selector!=='[data-doc]')return [];
      return [...this.html.matchAll(/data-doc="([^"]+)"/g)].map((match)=>{
        const b={dataset:{doc:match[1]},click:null,addEventListener:(_ev,fn)=>{b.click=fn;}};
        this.buttons.push(b);return b;
      });
    }
  }
  const ui={el:()=>new Host(),ph:(...args)=>args.join(' '),bdg:(x)=>String(x),
    aiBox:()=>'',degraded:(message,{title}={})=>String(title||'')+' '+String(message||'')};
  const data={currentProjectId:'cinepolis',currentPeriodId:'cinepolis-2026-10',
    _visitas:[],period(){return {id:this.currentPeriodId,name:'OCT 2026'};}};
  const firebase={auth:()=>({currentUser:uid?{uid}:null})};
  const CX={BACKEND:{enabled:true,tenantId:'tya'},data,
    session:{role:'admin',effectiveRole(){return this.role;}},
    backendResources:{
      list:({projectId,periodId,resourceType})=>docs.filter(x=>x.projectId===projectId&&
        x.periodId===periodId&&x.resourceType===resourceType&&
        x.visibleRoles.includes(CX.session.role)),
      load:async()=>docs,
      storageStatus:()=>({authorized:true,configured:true,available:true})
    },
    bus:{on(event,fn){if(!callbacks.has(event))callbacks.set(event,[]);callbacks.get(event).push(fn);},
      emit(event){for(const fn of callbacks.get(event)||[])fn();}},
    module(_name,fn){this.render=fn;}
  };
  const window={firebase};
  vm.runInNewContext(source,{CX,window,firebase,console});
  const mount=()=>CX.render({data,role:CX.session.role,ui});
  const open=host=>{assert.ok(host.buttons.length,'resource action absent');
    host.buttons[0].click();assert.match(host.innerHTML,/id="docBack"/);};
  return {CX,docs,data,window,mount,open,uid:(next)=>{uid=next;}};
}

test('VRM-288: identical Firestore resource notices preserve live controls and do not repaint the viewer',()=>{
  const h=fixture(),host=h.mount();
  h.open(host);
  const afterOpen=host.updates;
  h.CX.bus.emit('resources');
  h.CX.bus.emit('resources');
  assert.equal(host.updates,afterOpen,'unchanged notices must not replace active DOM controls');
  h.window.CX_BACKEND_RESOURCES_STATUS={
    status:'ready',tenantId:'tya',projectId:'cinepolis',periodId:'cinepolis-2026-10',at:'initial'
  };
  h.CX.bus.emit('resources');
  const afterReady=host.updates;
  assert.equal(afterReady,afterOpen,'provider status refresh must not restart an unchanged PDF download');
  h.window.CX_BACKEND_RESOURCES_STATUS.at='retry-timestamp-only';
  h.CX.bus.emit('resources');
  assert.equal(host.updates,afterReady,'retry timestamps alone cannot detach the viewer');
  h.docs[0]={...h.docs[0],version:2,meta:'instructivo-actualizado.pdf'};
  h.CX.bus.emit('resources');
  assert.ok(host.updates>afterReady,'a changed resource version must safely refresh the viewer');
  assert.match(host.innerHTML,/id="docBack"/);
});

test('VRM-288: loading, denied and verified empty are three different states',()=>{
  const h=fixture();
  h.docs.splice(0,h.docs.length);
  const host=h.mount();
  assert.match(host.innerHTML,/Consultando recursos publicados/);
  assert.doesNotMatch(host.innerHTML,/No hay recursos reales publicados/);
  h.window.CX_BACKEND_RESOURCES_STATUS={
    status:'blocked',reason:'RESOURCE_PROVIDER_READ_FAILED',
    tenantId:'tya',projectId:'cinepolis',periodId:'cinepolis-2026-10'
  };
  h.CX.bus.emit('resources');
  assert.match(host.innerHTML,/lectura sin confirmar/);
  assert.doesNotMatch(host.innerHTML,/No hay recursos reales publicados/);
  h.window.CX_BACKEND_RESOURCES_STATUS.status='ready';
  h.window.CX_BACKEND_RESOURCES_STATUS.reason='';
  h.CX.bus.emit('resources');
  assert.match(host.innerHTML,/No hay recursos reales publicados/);
});

test('VRM-288: detached old module cannot be repeatedly rebuilt by provider notices',()=>{
  const h=fixture(),host=h.mount();
  const before=host.updates;
  host.isConnected=false;
  h.docs.push({...h.docs[0],id:'new'}); // unrelated detached host
  h.CX.bus.emit('resources');
  assert.equal(host.updates,before);
});

test('VRM-285: a late resources event and a router remount do not destroy the active PDF reader',()=>{
  const h=fixture(),first=h.mount();
  h.open(first);
  h.CX.bus.emit('resources');
  assert.match(first.innerHTML,/id="docBack"/);
  const afterRouter=h.mount();
  assert.match(afterRouter.innerHTML,/id="docBack"/);
  assert.match(afterRouter.innerHTML,/Instructivo Shopper Cinépolis/);
  assert.match(afterRouter.innerHTML,/data-pdf-viewer/);
  assert.match(afterRouter.innerHTML,/<canvas\b/);
  assert.match(afterRouter.innerHTML,/data-pdf-prev/);
  assert.match(afterRouter.innerHTML,/data-pdf-next/);
  assert.doesNotMatch(afterRouter.innerHTML,/<iframe\b/,'PDF must not fall back to the previously blank native iframe');
  assert.match(afterRouter.innerHTML,/la descarga se habilita tras validar el PDF/);
  assert.match(afterRouter.innerHTML,/data-pdf-download disabled/);
  assert.doesNotMatch(afterRouter.innerHTML,/href="https:\/\/fixture.invalid\/instructivo.pdf"/);
  afterRouter.back();
  assert.doesNotMatch(afterRouter.innerHTML,/id="docBack"/);
  assert.match(afterRouter.innerHTML,/data-doc="resource-pdf-1"/);
  const afterBack=h.mount();
  assert.doesNotMatch(afterBack.innerHTML,/id="docBack"/);
});

test('VRM-285: different auth UID, role, project and period never inherit an old PDF reader',()=>{
  const h=fixture();
  h.open(h.mount());
  h.uid('other-admin-uid');
  assert.doesNotMatch(h.mount().innerHTML,/id="docBack"/);
  h.uid('admin-dev-uid');
  h.CX.session.role='shopper';
  assert.doesNotMatch(h.mount().innerHTML,/id="docBack"/);
  h.CX.session.role='admin';
  h.data.currentProjectId='other-project';
  assert.doesNotMatch(h.mount().innerHTML,/id="docBack"/);
  h.data.currentProjectId='cinepolis';
  h.data.currentPeriodId='cinepolis-2026-09';
  assert.doesNotMatch(h.mount().innerHTML,/id="docBack"/);
});

test('VRM-285: revoked/deleted resource closes the open reader fail-closed',()=>{
  const h=fixture(),host=h.mount();
  h.open(host);
  h.docs.splice(0,h.docs.length);
  h.CX.bus.emit('resources');
  assert.doesNotMatch(host.innerHTML,/id="docBack"/);
  assert.equal(h.CX.docStore.activeViewer,null);
});

test('VRM-285: viewer state is session-scoped presentation state, never localStorage truth',()=>{
  assert.doesNotMatch(source,/localStorage/);
  assert.match(source,/viewerScopeKey/);
  assert.match(source,/firebase\?\.auth/);
  assert.match(source,/CX\.docStore\.activeViewer/);
});

test('D07 Admin-only diagnostic UI exposes safe stage metadata without JWT, UID or path',()=>{
  assert.match(source,/status\.dataset\.d07Stage=stage/);
  assert.match(source,/status\.dataset\.d07Code=safeCode/);
  assert.match(source,/\['super','admin'\]\.includes/);
  assert.match(source,/Diagnóstico D07:/);
  assert.match(source,/diag\.tokenObtained===true/);
  assert.match(source,/HTTP '\+http/);
  assert.doesNotMatch(source,/console\.warn\('\[CX\.documentos PDF\]',String\(error\?\.message/);
  assert.doesNotMatch(source,/localStorage/);
});

// D07: exercise the actual resource reader, document module, central router event
// handler and bus together; individual mocked load functions hid this remount loop.
const d07OwnerSource=path=>fs.readFileSync(new URL('../../'+path,import.meta.url),'utf8');
const d07OwnerClone=value=>structuredClone(value);
const d07OwnerFlush=()=>new Promise(resolve=>setImmediate(resolve));
function d07RouterResourceFixture(role='shopper'){
  let uid='local-'+role,host=null,queryCount=0,renderCount=0,events=0;
  const pending=[],hosts=[],warnings=[];
  let rows=[{id:'res-local',tenantId:'tya',projectId:'cinepolis',periodId:'cinepolis-2026-10',
    status:'active',version:1,resourceType:'project_resource',tipo:'pdf',n:'Instructivo local',
    meta:'Instructivo_Shopper.pdf',storagePath:'tenants/tya/projects/cinepolis/periods/cinepolis-2026-10/resources/folder-local/Instructivo_Shopper.pdf',
    visibleRoles:['admin','shopper']}];
  class Host{
    constructor(){this.html='';this.buttons=[];this.isConnected=false;this.updates=0;}
    set innerHTML(value){this.html=String(value);this.buttons=[];this.back=null;this.updates++;}
    get innerHTML(){return this.html;}
    querySelector(selector){
      if(selector==='#docBack'&&this.html.includes('id="docBack"'))return {addEventListener:(_event,fn)=>{this.back=fn;}};
      if(selector==='[data-pdf-viewer]'&&this.html.includes('data-pdf-viewer'))return {isConnected:this.isConnected,querySelector:()=>null};
      return null;
    }
    querySelectorAll(selector){
      if(selector!=='[data-doc]')return [];
      return [...this.html.matchAll(/data-doc="([^"]+)"/g)].map(match=>{
        const target=this,b={dataset:{doc:match[1]},click:null,get isConnected(){return target.isConnected;},addEventListener:(_event,fn)=>{b.click=fn;}};
        this.buttons.push(b);return b;
      });
    }
  }
  class Query{
    constructor(filters=[]){this.filters=filters;}
    where(field,op,value){return new Query([...this.filters,[field,op,value]]);}
    get(){queryCount++;return new Promise((resolve,reject)=>pending.push({resolve,reject,filters:this.filters}));}
  }
  const ui={el:()=>new Host(),ph:(...args)=>args.join(' '),bdg:value=>String(value),aiBox:()=>'',degraded:(value,{title}={})=>String(title||'')+' '+String(value)};
  const data={currentProjectId:'cinepolis',currentPeriodId:'cinepolis-2026-10',_visitas:[],
    period(){return {id:this.currentPeriodId,name:'October local'};},ctx(){return {projectId:this.currentProjectId,periodId:this.currentPeriodId};}};
  const CX={BACKEND:{enabled:true,tenantId:'tya',resourceStorageAuthorized:true,resourceStorageRulesValidated:true},data,
    session:{role,view:'documentos',effectiveRole(){return this.role;}},module(name,fn){if(name==='documentos')this.documents=fn;},
    router:{buildRail(){},nav(){if(host)host.isConnected=false;host=CX.documents({data,role:CX.session.role,ui});host.isConnected=true;hosts.push(host);renderCount++;}}};
  const firebase={apps:[{}],auth:()=>({currentUser:{uid}}),storage:()=>({}),firestore:()=>({collection:()=>({doc:()=>({collection:()=>new Query()})})})};
  const context={CX,firebase,document:{readyState:'loading',addEventListener(){}},console:{warn:()=>warnings.push('SAFE_LOCAL_WARNING')},setTimeout};context.window=context;context.addEventListener=()=>{};
  vm.createContext(context);
  const bus=d07OwnerSource('app/core/store.js').match(/CX\.bus = \(function\(\)\{[\s\S]*?\}\)\(\);/);assert.ok(bus);
  vm.runInContext(bus[0],context);
  CX.bus.on('resources',()=>events++);
  vm.runInContext(d07OwnerSource('app/core/backend-resources.js'),context);
  vm.runInContext(d07OwnerSource('app/modules/documentos.js'),context);
  const router=d07OwnerSource('app/core/router.js'),start=router.indexOf('(function(){',router.indexOf('SINCRONÍA CENTRAL'));
  assert.ok(start>0);vm.runInContext(router.slice(start),context);
  CX.backendResources.items=d07OwnerClone(rows);context.CX_BACKEND_RESOURCES_STATUS={status:'ready',tenantId:'tya',projectId:data.currentProjectId,periodId:data.currentPeriodId};
  function resolveOne({error=false}={}){
    const q=pending.shift();assert.ok(q,'expected queued Firestore read');
    if(error){q.reject(new Error('LOCAL_READ_DENIED'));return;}
    const selected=rows.filter(row=>q.filters.every(([field,op,value])=>op==='=='?row[field]===value:op==='array-contains'?row[field]?.includes(value):false));
    q.resolve({docs:selected.map(row=>({id:row.id,data:()=>d07OwnerClone(row)}))});
  }
  return {CX,context,rows:()=>rows,setRows:value=>{rows=value;},setUid:value=>{uid=value;},host:()=>host,hosts,pending,resolveOne,
    counts:()=>({queries:queryCount,renders:renderCount,resourceEvents:events,pending:pending.length,detachedHosts:hosts.filter(x=>!x.isConnected).length,warnings:warnings.length})};
}

for(const role of ['admin','shopper'])test('D07 '+role+' identical resource loads settle without hiding remote updates, errors or identity changes',async()=>{
  const h=d07RouterResourceFixture(role);h.CX.router.nav('documentos');
  for(let n=0;n<6&&h.pending.length;n++){h.resolveOne();await d07OwnerFlush();}
  const initial=h.counts();
    assert.equal(initial.queries,2);assert.equal(initial.renders,2);assert.equal(initial.pending,0);assert.equal(initial.resourceEvents,1);
    // Explicit entry still requests the remote metadata, even with unchanged content.
    h.CX.router.nav('documentos');assert.equal(h.pending.length,1);h.resolveOne();await d07OwnerFlush();assert.equal(h.pending.length,0);assert.equal(h.counts().queries,3);
    // Different map-key order does not restart the mounted reader.
    const before=h.counts();h.setRows(h.rows().map(row=>Object.fromEntries(Object.entries(row).reverse())));
    const repeat=h.CX.backendResources.load();h.resolveOne();await repeat;await d07OwnerFlush();assert.equal(h.counts().resourceEvents,before.resourceEvents);assert.equal(h.counts().renders,before.renders);
    // A version change still emits and remounts once, then settles.
    h.setRows(h.rows().map(row=>({...row,version:2})));
    const changed=h.CX.backendResources.load();h.resolveOne();await changed;await d07OwnerFlush();assert.equal(h.pending.length,1);h.resolveOne();await d07OwnerFlush();assert.equal(h.pending.length,0);
    assert.equal(h.counts().resourceEvents,before.resourceEvents+1);
    h.host().buttons[0].click();assert.match(h.host().innerHTML,/data-pdf-viewer/);
    // Revocation/removal closes the active viewer; an empty result is an actual remote result.
    h.setRows([]);const removed=h.CX.backendResources.load();h.resolveOne();await removed;await d07OwnerFlush();h.resolveOne();await d07OwnerFlush();assert.equal(h.pending.length,0);assert.doesNotMatch(h.host().innerHTML,/data-pdf-viewer/);
    // A read error stays blocked, emits once, and does not turn into a remount loop.
    const fail=h.CX.backendResources.load().catch(()=>{});h.resolveOne({error:true});await fail;await d07OwnerFlush();h.resolveOne({error:true});await d07OwnerFlush();assert.equal(h.pending.length,0);assert.equal(h.context.CX_BACKEND_RESOURCES_STATUS.status,'blocked');
    // Recover normally before testing identity; the UID case is not a status change.
    h.CX.router.nav('documentos');h.resolveOne();await d07OwnerFlush();h.resolveOne();await d07OwnerFlush();assert.equal(h.pending.length,0);
    const eventsBeforeUid=h.counts().resourceEvents;
    const stale=h.CX.backendResources.load();h.setUid('local-other-'+role);h.resolveOne();await stale;await d07OwnerFlush();assert.equal(h.counts().resourceEvents,eventsBeforeUid,'late same-role previous UID result must be discarded');
    h.CX.router.nav('documentos');h.resolveOne();await d07OwnerFlush();h.resolveOne();await d07OwnerFlush();assert.equal(h.pending.length,0);assert.equal(h.counts().resourceEvents,eventsBeforeUid+1);
    // Identical empty result still carries a new period/project scope.
    const eventsBeforeScope=h.counts().resourceEvents;h.CX.data.currentPeriodId='cinepolis-2026-09';h.CX.router.nav('documentos');h.resolveOne();await d07OwnerFlush();h.resolveOne();await d07OwnerFlush();assert.equal(h.pending.length,0);assert.equal(h.counts().resourceEvents,eventsBeforeScope+1);
    h.CX.data.currentProjectId='other-project';h.CX.data.currentPeriodId='other-project-2026-09';h.CX.router.nav('documentos');h.resolveOne();await d07OwnerFlush();h.resolveOne();await d07OwnerFlush();assert.equal(h.pending.length,0);assert.equal(h.counts().resourceEvents,eventsBeforeScope+2);
});
