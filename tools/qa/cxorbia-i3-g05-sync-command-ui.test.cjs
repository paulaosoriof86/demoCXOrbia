#!/usr/bin/env node
'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(process.argv[2]||path.join(__dirname,'../..'));
const revision='a'.repeat(64),otherRevision='b'.repeat(64);

test('G05 rejects cross-tenant receipt even when adapter reconstructs top-level tenant',async()=>{
  const f=fixture();f.setTransport(command=>f.ack(command,{tenantId:'tenant-b',receiptPath:'tenants/tenant-b/commandReceipts/hr-'+'c'.repeat(64)}));
  const result=await f.sync();assert.equal(result.ok,false);noSideWrites(f);
});
test('G05 rejects a different receipt key in the same tenant',async()=>{
  const f=fixture();f.setTransport(command=>f.ack(command,{receiptPath:'tenants/tenant-a/commandReceipts/hr-'+'c'.repeat(64)}));
  assert.equal((await f.sync()).ok,false);noSideWrites(f);
});
test('G05 rejects receipt binding from another verified actor',async()=>{
  const f=fixture();f.setTransport(command=>{const result=f.ack(command);result.receiptBinding.actorUid='another-admin';return result;});
  assert.equal((await f.sync()).ok,false);noSideWrites(f);
});
test('G05 suppresses publication when role changes inside the same context object',async()=>{
  const f=fixture(),wait=deferred();f.setTransport(()=>wait.promise);const work=f.sync();
  f.context().role='super';f.authority.role='super';wait.resolve(f.ack(f.calls.commands[0]));
  assert.equal((await work).publishUiAllowed,false);noSideWrites(f);
});
test('G05 button rechecks session after bridge resolves and before toast',async()=>{
  const f=fixture();f.mount();const original=f.CX.hrSource.emitBackend.bind(f.CX.hrSource);
  f.CX.hrSource.emitBackend=async(...args)=>{const result=await original(...args);assert.equal(result.publishUiAllowed,true);f.setContext({...f.context()});return result;};
  await f.click();assert.equal(f.calls.toasts.length,0);noSideWrites(f);
});
test('G05 resumes the same authenticated pending command after lost browser memory',async()=>{
  const f=fixture();f.setTransport(command=>f.calls.commands.length===1?{
    ok:false,status:'blocked',providerAck:false,providerWrites:null,code:'HR_RECONCILIATION_SCOPE_BUSY',resumeIdempotencyKey:'hr-sync-prior-verified-key-0001'
  }:f.ack(command));
  const result=await f.sync();assert.equal(result.ok,true);assert.equal(f.calls.commands.length,2);assert.equal(f.calls.commands[1].idempotencyKey,'hr-sync-prior-verified-key-0001');noSideWrites(f);
});

const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
function fixture(){
  const calls={commands:[],saves:0,projectWrites:0,legacyFetches:0,refreshes:0,toasts:[],draws:0},nodes=new Map();
  let context={authenticated:true,role:'admin',authNamespace:'staff',tenantId:'tenant-a',projectIds:['project-a']};
  let user={uid:'admin-a'},moduleFactory,transport=async command=>ack(command);
  const project={id:'project-a',tenantId:'tenant-a',name:'Fixture',operationalSource:{mode:'external',readPolicy:'external_live',writePolicy:'external_read_only',providerBindingId:'binding-a',mappingRef:'mapping-a'}};
  const data={currentProjectId:'project-a',__backendAllProjectRecords:[project],__liveHrSourceRevision:revision,previewMeta:{sourceRevision:revision,tenantId:'tenant-a',projectId:'project-a',hrAuthority:true},project:()=>project,updateProject:()=>{calls.projectWrites++;throw Error('UNEXPECTED_PROJECT_WRITE');}};
  const host={querySelector:id=>{if(!nodes.has(id))nodes.set(id,{disabled:false,handlers:{},addEventListener(type,fn){this.handlers[type]=fn;}});return nodes.get(id);},querySelectorAll:()=>[],set innerHTML(value){calls.draws++;this.html=value;},get innerHTML(){return this.html;}};
  const ui={el:()=>host,ph:()=>'',bdg:()=>'',toast:(...args)=>calls.toasts.push(args)};
  const CX={data,ui,BACKEND:{enableCommandWrites:true},backendAuth:{context:()=>context},backend:{authContext:()=>({authenticated:true,role:'admin'}),refresh:()=>{calls.refreshes++;}},cxDataCommandBoundary:{canonicalMode:()=>true},dataSource:{runtimeReadActive:true,runtimeSyncActive:false},session:{role:'admin',effectiveRole:()=>context?.role||'admin'},bus:{on(){},emit(){}},module:(name,fn)=>{moduleFactory=fn;}};
  const authority={applied:true,actorUid:'admin-a',role:'admin',authNamespace:'staff',tenantId:'tenant-a',projectId:'project-a'};
  const sandbox={CX,crypto,TextEncoder,Uint8Array,console,Date,Map,Set,Promise,JSON,Object,String,Array,Boolean,Number,RegExp,localStorage:{getItem(){throw Error('UNEXPECTED_LOCAL_STORAGE');},setItem(){throw Error('UNEXPECTED_LOCAL_STORAGE');}},firebase:{auth:()=>({currentUser:user})},CX_PROTECTED_AUTH_HR_AUTHORITY:authority,fetch:()=>{calls.legacyFetches++;throw Error('UNEXPECTED_LEGACY_ENDPOINT');},setInterval:()=>0,clearInterval(){},setTimeout:()=>0};
  sandbox.window=sandbox;vm.createContext(sandbox);
  for(const file of ['app/adapters/cxorbia-command-adapter-v1.js','app/modules/hr-source.js','app/core/backend-hr-source-bridge.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),sandbox,{filename:file});
  CX.hrSource.save=async()=>{calls.saves++;return {ok:false};};
  CX.commandAdapter.registerTransport('fixture',{execute:async command=>{calls.commands.push(command);return transport(command);}});
  CX.commandAdapter.useTransport('fixture');
  function ack(command,extra={}){return {ok:true,status:'committed',committed:true,providerAck:true,readbackVerified:true,successUiAllowed:true,unresolvedEffects:0,unverifiedEffects:0,sourceRevision:command.expectedVersion,tenantId:command.tenantId,projectId:command.projectId,receiptPath:'tenants/tenant-a/commandReceipts/hr-'+crypto.createHash('sha256').update(JSON.stringify([command.projectId,command.idempotencyKey])).digest('hex'),receiptBinding:{tenantId:command.tenantId,projectId:command.projectId,sourceRevision:command.expectedVersion,actorUid:'admin-a',idempotencyKey:command.idempotencyKey,commandType:'hr.snapshot.reconcile'},providerWrites:5,authWrites:2,firestoreWrites:3,...extra};}
  return {CX,calls,data,project,authority,sandbox,host,ack,
    context:()=>context,setContext:value=>{context=value;},setUser:value=>{user=value;},
    setTransport:fn=>{transport=fn;},
    sync:()=>CX.hrSource.emitBackend('sync-request','project-a'),
    mount:()=>moduleFactory({data,ui}),
    click:()=>{const button=host.querySelector('#hsSync');return button.handlers.click({currentTarget:button});}
  };
}
function noSideWrites(f){assert.equal(f.calls.saves,0);assert.equal(f.calls.projectWrites,0);assert.equal(f.calls.legacyFetches,0);assert.equal(f.calls.refreshes,0);}
test('G05 canonical connected external_live source syncs with canImport false and existing command contract',async()=>{
  const f=fixture();assert.equal(f.CX.hrSource.get('project-a').estado,'connected');assert.equal(f.CX.hrSource.get('project-a').canImport,false);
  const result=await f.sync();assert.equal(result.ok,true);assert.equal(result.viewRefreshVerified,false);assert.equal(result.viewRefresh,'pending');assert.equal(result.publishUiAllowed,true);
  assert.equal(f.CX.hrSource.get('project-a').canImport,false);assert.equal(f.calls.commands.length,1);
  const command=f.calls.commands[0];assert.equal(command.version,'cxorbia-command-adapter-v1');assert.equal(command.commandType,'hr.snapshot.reconcile');assert.equal(command.entityId,revision);assert.equal(command.expectedVersion,revision);assert.equal(command.requirePeriod,false);assert.equal(command.periodId,null);assert.deepEqual(Object.keys(command.payload),[]);assert.equal(command.requestedAt,null);noSideWrites(f);
});
for(const [name,alter] of [
 ['unauthenticated',f=>f.setContext(null)],
 ['non-staff namespace',f=>f.context().authNamespace='shopper'],
 ['ops presented as shell admin',f=>{f.context().role='ops';f.CX.session.effectiveRole=()=> 'admin';}],
 ['missing UID',f=>f.setUser(null)],
 ['wrong active project',f=>f.data.currentProjectId='project-b'],
 ['membership project denied',f=>f.context().projectIds=[]],
 ['wrong record tenant',f=>f.project.tenantId='tenant-b'],
 ['internal source',f=>f.project.operationalSource.mode='internal'],
 ['snapshot import source',f=>f.project.operationalSource.readPolicy='external_snapshot_import'],
 ['binding missing',f=>delete f.project.operationalSource.providerBindingId],
 ['mapping missing',f=>delete f.project.operationalSource.mappingRef],
 ['live revision missing',f=>f.data.__liveHrSourceRevision=''],
 ['metadata revision differs',f=>f.data.previewMeta.sourceRevision=otherRevision],
 ['metadata scope differs',f=>f.data.previewMeta.projectId='project-b'],
 ['metadata tenant differs',f=>f.data.previewMeta.tenantId='tenant-b'],
 ['metadata not authoritative',f=>f.data.previewMeta.hrAuthority=false],
 ['authority not applied',f=>f.authority.applied=false],
 ['authority different UID',f=>f.authority.actorUid='admin-b'],
 ['authority different role',f=>f.authority.role='super'],
 ['authority different namespace',f=>f.authority.authNamespace='shopper'],
 ['authority different project',f=>f.authority.projectId='project-b'],
 ['command writes disabled',f=>f.CX.BACKEND.enableCommandWrites=false]
])test('G05 blocks '+name+' before transport',async()=>{
  const f=fixture();alter(f);const result=await f.sync();assert.equal(result.ok,false);assert.equal(f.calls.commands.length,0);noSideWrites(f);
});
test('G05 real super context is accepted even when its shell is admin',async()=>{
  const f=fixture();f.context().role='super';f.authority.role='super';f.context().projectIds=[];f.CX.session.effectiveRole=()=> 'admin';
  const result=await f.sync();assert.equal(result.ok,true);assert.equal(f.calls.commands.length,1);noSideWrites(f);
});
for(const [name,raw] of [
 ['false ACK despite binding',{ok:false,status:'blocked',providerAck:false,providerBindingId:'binding-a',sourceRef:'binding-a'}],
 ['missing readback',{ok:true,status:'committed',committed:true,providerAck:true,successUiAllowed:true}],
 ['unresolved effects',{unresolvedEffects:1}],
 ['unverified effects',{unverifiedEffects:1}],
 ['different revision',{sourceRevision:otherRevision}],
 ['partial effects',{ok:false,status:'partial',committed:false,providerAck:false,providerWrites:2,authWrites:2,firestoreWrites:0,unresolvedEffects:0,unverifiedEffects:0}]
])test('G05 never fabricates sync success for '+name,async()=>{
  const f=fixture();f.setTransport(command=>Promise.resolve(name==='missing readback'||name==='false ACK despite binding'?raw:f.ack(command,raw)));
  const result=await f.sync();assert.equal(result.ok,false);assert.equal(result.providerAck,false);assert.equal(result.successUiAllowed,false);
  if(name==='partial effects'){assert.equal(result.providerWrites,2);assert.equal(result.authWrites,2);}noSideWrites(f);
});
test('G05 in-flight duplicate calls share a command; uncertain retry retains its key',async()=>{
  const f=fixture(),wait=deferred();f.setTransport(()=>wait.promise);
  const a=f.sync(),b=f.sync();assert.equal(f.calls.commands.length,1);
  wait.resolve({ok:false,status:'partial',providerAck:false,providerWrites:1});await Promise.all([a,b]);
  const key=f.calls.commands[0].idempotencyKey;f.setTransport(command=>f.ack(command));assert.equal((await f.sync()).ok,true);
  assert.equal(f.calls.commands[1].idempotencyKey,key);await f.sync();assert.notEqual(f.calls.commands[2].idempotencyKey,key);noSideWrites(f);
});
test('G05 transport failure is unknown, preserves key and never reports zero writes',async()=>{
  const f=fixture();f.setTransport(()=>{throw Error('fixture timeout');});const first=await f.sync();assert.equal(first.providerWrites,null);assert.equal(first.ok,false);
  const key=f.calls.commands[0].idempotencyKey;f.setTransport(c=>f.ack(c));assert.equal((await f.sync()).ok,true);assert.equal(f.calls.commands[1].idempotencyKey,key);noSideWrites(f);
});
for(const change of ['project','principal','same-UID new session'])test('G05 suppresses late UI publication after '+change,async()=>{
  const f=fixture(),wait=deferred();f.setTransport(()=>wait.promise);const result=f.sync(),command=f.calls.commands[0];
  if(change==='project')f.data.currentProjectId='project-b';
  if(change==='principal')f.setUser({uid:'admin-b'});
  if(change==='same-UID new session')f.setContext({...f.context()});
  wait.resolve(f.ack(command));const done=await result;assert.equal(done.publishUiAllowed,false);assert.equal(f.CX.backendHrSourceBridge.last,null);noSideWrites(f);
});
test('G05 button disables while waiting, does not redraw early, and labels confirmed view pending',async()=>{
  const f=fixture(),wait=deferred();f.mount();const before=f.calls.draws;f.setTransport(()=>wait.promise);
  const first=f.click();assert.equal(f.host.querySelector('#hsSync').disabled,true);await f.click();assert.equal(f.calls.commands.length,1);assert.equal(f.calls.toasts.length,0);assert.equal(f.calls.draws,before);
  wait.resolve(f.ack(f.calls.commands[0]));await first;assert.equal(f.host.querySelector('#hsSync').disabled,false);assert.equal(f.calls.toasts.length,1);assert.match(f.calls.toasts[0][0],/vista pendiente/);assert.equal(f.calls.draws,before);noSideWrites(f);
});
