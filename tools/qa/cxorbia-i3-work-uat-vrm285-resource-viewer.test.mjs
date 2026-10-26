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
  assert.ok(afterReady>afterOpen,'a real provider status transition can repaint');
  h.window.CX_BACKEND_RESOURCES_STATUS.at='retry-timestamp-only';
  h.CX.bus.emit('resources');
  assert.equal(host.updates,afterReady,'retry timestamps alone cannot detach the viewer');
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
  assert.match(afterRouter.innerHTML,/abre el PDF original en otra pestaña/);
  assert.match(afterRouter.innerHTML,/rel="noopener noreferrer"/);
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
