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
    constructor(){this.html='';this.buttons=[];this.back=null;}
    set innerHTML(value){this.html=value;this.buttons=[];this.back=null;}
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
    aiBox:()=>'',degraded:()=>''};
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
  return {CX,docs,data,mount,open,uid:(next)=>{uid=next;}};
}

test('VRM-285: a late resources event and a router remount do not destroy the active PDF reader',()=>{
  const h=fixture(),first=h.mount();
  h.open(first);
  h.CX.bus.emit('resources');
  assert.match(first.innerHTML,/id="docBack"/);
  const afterRouter=h.mount();
  assert.match(afterRouter.innerHTML,/id="docBack"/);
  assert.match(afterRouter.innerHTML,/Instructivo Shopper Cinépolis/);
  assert.match(afterRouter.innerHTML,/iframe/);
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
