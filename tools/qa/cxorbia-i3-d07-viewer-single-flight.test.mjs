import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// D07 P0 source-only fixture: no Firebase, Storage, HR or data mutations.
const source=fs.readFileSync(new URL('../../app/modules/documentos.js',import.meta.url),'utf8');
const tick=()=>new Promise(resolve=>setImmediate(resolve));

function fixture(){
  const resource={id:'pdf-control',tipo:'pdf',n:'Instructivo',meta:'instructivo.pdf',
    projectId:'cinepolis',periodId:'oct-2026',visibleRoles:['admin'],storagePath:'protected/path'};
  let callCount=0,readPdf;
  const data={currentProjectId:'cinepolis',currentPeriodId:'oct-2026',_visitas:[],
    period(){return {id:this.currentPeriodId,name:'OCT 2026'};}};
  const firebase={auth:()=>({currentUser:{uid:'admin-fixture'}})};
  const warnings=[];
  const CX={BACKEND:{enabled:true,tenantId:'tya'},data,
    session:{role:'admin',effectiveRole(){return this.role;}},
    backendResources:{list:()=>[resource],load:async()=>[resource],
      storageStatus:()=>({authorized:true}),
      readPublishedPdf:(...args)=>{callCount++;return readPdf(...args);}},
    bus:{on(){}},module(_name,renderer){this.render=renderer;}};
  const ui={el:()=>new Host(),ph:()=>'',bdg:()=>'',aiBox:()=>'',degraded:x=>x};
  const document={createElement:()=>({dataset:{},style:{},
    addEventListener(_event,fn){this.click=fn;}})};
  const window={firebase};
  vm.runInNewContext(source,{CX,window,firebase,document,console:{warn:(...args)=>warnings.push(args)}});
  return {CX,ui,data,resource,warnings,setRead:fn=>{readPdf=fn;},calls:()=>callCount,
    mount(){return CX.render({data,role:'admin',ui});}};
}

class Host {
  constructor(){this.html='';this.isConnected=true;this.buttons=[];this.slot=null;}
  set innerHTML(value){this.html=value;this.buttons=[];this.slot=value.includes('data-pdf-viewer')?new Slot():null;}
  get innerHTML(){return this.html;}
  contains(slot){return this.slot===slot;}
  querySelector(selector){
    if(selector==='[data-pdf-viewer]')return this.slot;
    if(selector==='#docBack'||selector==='#docPrint')return {addEventListener(){}};
    return null;
  }
  querySelectorAll(selector){
    if(selector!=='[data-doc]')return [];
    return [...this.html.matchAll(/data-doc="([^"]+)"/g)].map(match=>{
      const button={dataset:{doc:match[1]},addEventListener(_event,fn){this.click=fn;}};
      this.buttons.push(button);return button;
    });
  }
  open(){assert.ok(this.buttons[0]);this.buttons[0].click();assert.ok(this.slot);}
}

class Slot {
  constructor(){this.isConnected=true;this.clientWidth=800;
    this.status={dataset:{},textContent:'Preparando vista previa del PDF…',
      appendChild(button){this.retry=button;}};
    this.canvas={};this.prev={disabled:true};this.next={disabled:true};
    this.position={textContent:'Página pendiente'};}
  querySelector(selector){return ({'[data-pdf-status]':this.status,canvas:this.canvas,
    '[data-pdf-prev]':this.prev,'[data-pdf-next]':this.next,
    '[data-pdf-page]':this.position})[selector]||null;}
}

test('D07 shares one authenticated GET across router remounts and only retries on a click',async()=>{
  const h=fixture();let finish;
  h.setRead(()=>new Promise(resolve=>{finish=resolve;}));
  const first=h.mount();first.open();await tick();
  const remount=h.mount();await tick();
  assert.equal(h.calls(),1,'a router remount must not issue a second GET');
  finish({ok:false,code:'RESOURCE_READ_GET_FAILED',diagnostic:{stage:'GET',errorType:'TypeError'}});
  await tick();
  assert.equal(first.slot.status.dataset.pdfStatus,'failed');
  assert.equal(remount.slot.status.dataset.pdfStatus,'failed');
  assert.match(remount.slot.status.textContent,/RESOURCE_READ_GET_FAILED/);
  const third=h.mount();await tick();
  assert.equal(h.calls(),1,'the same failed PDF must not trigger an automatic fetch loop');
  assert.equal(third.slot.status.dataset.pdfStatus,'failed');
  assert.equal(h.warnings.length,1,'repeated remounts must not flood diagnostics');
  h.setRead(()=>Promise.resolve({ok:false,code:'RESOURCE_READ_GET_FAILED',
    diagnostic:{stage:'GET',errorType:'TypeError'}}));
  third.slot.status.retry.click();await tick();
  assert.equal(h.calls(),2,'the explicitly requested retry must issue a fresh GET');
});

test('D07 preserves independent authenticated bytes for download when pdf.js takes render ownership',()=>{
  assert.match(source,/const downloadBytes=authenticatedBytes\.slice\(\);/);
  assert.match(source,/new Blob\(\[downloadBytes\],\{type:'application\/pdf'\}\)/);
  assert.doesNotMatch(source,/new Blob\(\[authenticatedBytes\]/);
});
