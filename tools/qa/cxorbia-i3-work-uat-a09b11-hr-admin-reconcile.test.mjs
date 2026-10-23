import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';

// I3 A09/B11: isolated browser-UI regression. Never contacts Firebase, Auth or HR.
const script=readFileSync(new URL('../../app/modules/visitas.js',import.meta.url),'utf8');
const REV='d19eb12ad8c1c5140b5711ea390deaae50b0edd35ff4f982a69bfdcabbc86dd2';
class Node {
  constructor(){this.listeners=new Map();this.disabled=false;this.checked=false;this.textContent='';this.value='';this.dataset={};}
  addEventListener(type,handler){const arr=this.listeners.get(type)||[];arr.push(handler);this.listeners.set(type,arr);}
  async fire(type){for(const fn of this.listeners.get(type)||[])await fn({currentTarget:this});}
}
function harness({hostname='cxorbia-backend-dev.web.app',staffRole='admin',viewRole='admin',providerResult,authenticated=true,externalHr=true,programKey='cinepolis',lateRerenderMs=0}={}){
  let module;
  const tasks=[],toasts=[],calls=[],reads=[],navs=[],nodes=new Map(),modal={};
  const elem=id=>{if(!nodes.has(id))nodes.set(id,new Node());return nodes.get(id);};
  const data={
    previewMeta:{sourceRevision:REV},period:()=>({id:'cinepolis-2026-10',name:'Cinépolis octubre 2026',operationalSource:externalHr?{mode:'external'}:{}}),
    _visitas:[],visitas:()=>[],projects:[],scopedProyectos:()=>[],kpis:()=>({
      asignadas:{t:0},realizadas:{t:0},sinAsignar:{t:0},fueraRango:{t:0}
    }),currentProgramKey:()=>programKey,visitFacets:()=>null,visitBucketFns:{
      asignadas:()=>false,realizadas:()=>false,sinAsignar:()=>false,fueraRango:()=>false
    }
  };
  const ui={
    ph:()=>'<h1>Visitas</h1>',kpi:()=>'<div>0</div>',empty:()=>'<p>Sin datos</p>',aiBox:()=>'<div></div>',modal:(title,html,{onMount}={})=>{
      modal.title=title;modal.html=html;modal.nodes=new Map();modal.closed=false;
      const overlay={querySelector:sel=>{
        if(!modal.nodes.has(sel)){
          const element=new Node();
          if(sel==='#hrCommandExecute')element.disabled=true;
          modal.nodes.set(sel,element);
        }
        return modal.nodes.get(sel);
      }};
      onMount?.(overlay,()=>{modal.closed=true;});
    },toast:(message,kind)=>{toasts.push({message,kind});}
  };
  const cx={
    module:(name,fn)=>{assert.equal(name,'visitas');module=fn;},
    BACKEND:{tenantId:'tya',defaultProjectId:'cinepolis',canonicalBackendProjectId:'cxorbia-backend-dev',enableCommandWrites:true},
    session:{_visAll:false,view:'visitas'},
    backendAuth:{context:()=>({authenticated,role:staffRole,tenantId:'tya',authNamespace:'staff'})},
    commandAdapter:{execute:async input=>{calls.push(input);return providerResult||{
      ok:true,status:'committed',providerAck:true,readbackVerified:true,receiptPath:'tenants/tya/commandReceipts/hr-test',
      unresolvedEffects:0,unverifiedEffects:0,authWrites:0,firestoreWrites:3
    };}},
    ui,router:{nav:route=>navs.push(route)},data
  };
  const window={
    location:{hostname},CX_PROTECTED_DEV_RUNTIME:true,crypto:webcrypto,TextEncoder,
    firebase:{auth:()=>({currentUser:{uid:'admin-test',getIdTokenResult:async()=>({claims:{role:staffRole,authNamespace:'staff',tenantId:'tya'}})}})},
    CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY:async reason=>{
      reads.push(reason);
      if(reason==='admin_visits_hr_command_preflight'&&lateRerenderMs>0){
        setTimeout(()=>{navs.push('visitas');if(modal.title)modal.closed=true;},lateRerenderMs);
      }
      return {ok:true};
    }
  };
  window.CX=cx;
  vm.runInNewContext(script,{window,CX:cx,document:{
    getElementById:id=>id==='vReconcileHr'&&!html.includes('id="vReconcileHr"')?null:elem(id),
    querySelectorAll:()=>[]
  },setTimeout:(fn,delay)=>delay>0?setTimeout(fn,delay):tasks.push(fn),Date,Uint8Array,console});
  let html=module({data,role:viewRole,ui});
  for(const task of tasks)task();
  return {html,cx,data,modal,toasts,calls,reads,navs,node:elem,window};
}

test('A09/B11 protected admin command stays hidden outside exact DEV/admin project scope',()=>{
  for(const opts of [
    {hostname:'cxorbia.example.org'},
    {viewRole:'ops'},
    {programKey:'other-project'}
  ]){
    const h=harness(opts);
    assert.doesNotMatch(h.html,/id="vReconcileHr"/);
    assert.match(h.html,/id="vRefreshHR"/,'read-only refresh remains available');
  }
});

test('VRM283 an admin can discover the action, but stale or unauthorized staff sessions cannot execute it',async()=>{
  for(const opts of [{staffRole:'ops'},{authenticated:false}]){
    const h=harness(opts);
    assert.match(h.html,/id="vReconcileHr"/);
    await h.node('vReconcileHr').fire('click');
    assert.equal(h.calls.length,0);
    assert.equal(h.modal.title,undefined);
    assert.ok(h.toasts.some(t=>t.kind==='err'));
  }
});

test('VRM283 protects live Cinépolis HR when period metadata lacks external source mode',()=>{
  const h=harness({externalHr:false});
  assert.match(h.html,/id="vReconcileHr"/,'authenticated DEV admin command must be discoverable');
  assert.doesNotMatch(h.html,/id="addV"/,'legacy local creation must not masquerade as persistent HR creation');
  assert.match(h.html,/id="vRefreshHR"/,'read-only refresh remains available');
});

test('VRM284 modal opens after HR refresh rerender instead of being immediately closed by router',async()=>{
  const h=harness({lateRerenderMs:55,externalHr:false});
  await h.node('vReconcileHr').fire('click');
  assert.equal(h.reads[0],'admin_visits_hr_command_preflight');
  assert.ok(h.navs.includes('visitas'),'the delayed route rerender occurred');
  assert.equal(h.modal.closed,false,'the human confirmation remains visible after router nav');
  assert.equal(h.modal.nodes.get('#hrCommandExecute').disabled,true);
  assert.equal(h.calls.length,0,'the preflight and dialog have no durable writes');
});

test('A09/B11 human confirmation + command uses exact scoped revision with provider readback',async()=>{
  const h=harness();
  assert.match(h.html,/id="vReconcileHr"/);
  assert.equal(h.calls.length,0);
  await h.node('vReconcileHr').fire('click');
  assert.equal(h.reads[0],'admin_visits_hr_command_preflight');
  assert.equal(h.calls.length,0,'read-only preflight and opening modal cannot write');
  assert.equal(h.modal.nodes.get('#hrCommandExecute').disabled,true);
  const check=h.modal.nodes.get('#hrCommandHumanConfirm');
  check.checked=true;await check.fire('change');
  assert.equal(h.modal.nodes.get('#hrCommandExecute').disabled,false);
  await h.modal.nodes.get('#hrCommandExecute').fire('click');
  assert.equal(h.calls.length,1,'exactly one provider command');
  assert.equal(h.calls[0].commandType,'hr.snapshot.reconcile');
  assert.equal(h.calls[0].entityType,'hrSnapshot');
  assert.equal(h.calls[0].entityId,REV);
  assert.equal(h.calls[0].expectedVersion,REV);
  assert.equal(h.calls[0].tenantId,'tya');
  assert.equal(h.calls[0].projectId,'cinepolis');
  assert.equal(h.calls[0].requirePeriod,false);
  assert.equal(h.calls[0].periodId,null);
  assert.equal(h.calls[0].idempotencyKey.length,78);
  assert.equal(Object.keys(h.calls[0].payload).length,0);
  assert.equal(h.calls[0].authorization.providerEnforcementRequired,true);
  assert.match(h.modal.nodes.get('#hrCommandStatus').textContent,/ACK confirmado y recibo persistente/);
  assert.equal(h.reads.at(-1),'admin_visits_post_provider_readback');
  assert.deepEqual(h.navs,['visitas']);
  assert.ok(h.toasts.some(t=>t.kind==='ok'));
});

test('A09/B11 no confirmation or partial ACK never reports success, never auto-retries',async()=>{
  const h=harness({providerResult:{ok:false,status:'partial',providerAck:false,code:'HR_RECONCILIATION_PARTIAL'}});
  await h.node('vReconcileHr').fire('click');
  assert.equal(h.calls.length,0);
  const check=h.modal.nodes.get('#hrCommandHumanConfirm');
  check.checked=true;await check.fire('change');
  await h.modal.nodes.get('#hrCommandExecute').fire('click');
  assert.equal(h.calls.length,1);
  assert.match(h.modal.nodes.get('#hrCommandStatus').textContent,/HOLD · HR_RECONCILIATION_PARTIAL/);
  assert.equal(h.toasts.some(t=>t.kind==='ok'),false);
});

test('A09/B11 revision drift between preflight and confirmation fails closed',async()=>{
  const h=harness();
  await h.node('vReconcileHr').fire('click');
  h.data.previewMeta.sourceRevision='f'.repeat(64);
  const check=h.modal.nodes.get('#hrCommandHumanConfirm');
  check.checked=true;await check.fire('change');
  await h.modal.nodes.get('#hrCommandExecute').fire('click');
  assert.equal(h.calls.length,0);
  assert.match(h.modal.nodes.get('#hrCommandStatus').textContent,/HR_ADMIN_SCOPE_OR_REVISION_CHANGED/);
});
