import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import vm from 'node:vm';
import {digest,projectIdFor,projectCommandPaths,observeCountryUpdate,validateCountryReadback,composeTenantCountryReceipts,countryConfigurationReady,installCountryUiObservation} from './cxorbia-i3-project-country-live-proof.mjs';
import {validReadonlyReceipt} from './cxorbia-i3-tenant-readonly-acceptance.test.mjs';
const descriptor=JSON.parse(fs.readFileSync('CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json','utf8'));
const mod=JSON.parse(fs.readFileSync(descriptor.moduleTruthPath,'utf8')).modules.find(x=>x.domain==='tenant-admin-config-branding');
function countryReadyFixture(){
  const expected={tenantId:'tenant-a',projectId:'fixture-a',version:1,countries:['GT']},button={isConnected:true,disabled:false,getClientRects:()=>[{}]};
  const body={isConnected:true,querySelectorAll:()=>[{dataset:{rmc:'GT'}}]};
  const resources={status:'ready',source:'firestore',tenantId:'tenant-a',projectId:'fixture-a',periodId:''};
  const cx={data:{currentProjectId:'fixture-a',__backendAllProjectRecords:[{id:'fixture-a',version:1,countries:['GT']}]},session:{view:'config'},
    dataSource:{status:'ready',updating:false,sourceRef:'firestore-internal:tenant-a:fixture-a'},
    backendResources:{scope:()=>({tenantId:'tenant-a',projectId:'fixture-a',periodId:''})},connectedAdminConfig:{enabled:()=>true,updateProjectCountries(){}}};
  return {expected,button,body,cx,resources,document:{querySelector:()=>body,querySelectorAll:s=>s.includes('#addPais')?[button]:[{}]}};
}
function ready(f){return vm.runInNewContext('('+countryConfigurationReady.toString()+')(expected)',{window:{CX:f.cx,CX_BACKEND_RESOURCES_STATUS:f.resources},document:f.document,expected:f.expected});}
test('country action waits for current provider publication without inventing a period for an internal draft',()=>assert.equal(ready(countryReadyFixture()),true));
test('provider publication is awaited before opening Config, and final readiness still requires its live UI',()=>{
  const f=countryReadyFixture();f.cx.session.view='dashboard';f.body.isConnected=false;
  f.expected.requireUi=false;assert.equal(ready(f),true);
  f.resources.status='loading';assert.equal(ready(f),false);
  f.resources.status='ready';f.expected.requireUi=true;assert.equal(Boolean(ready(f)),false);
});
test('internal ready publication remains authoritative when its non-authoritative legacy updating flag is still true',()=>{
  const f=countryReadyFixture();f.cx.dataSource.updating=true;assert.equal(ready(f),true);
  f.cx.dataSource.status='updating';assert.equal(ready(f),false);
});
for(const [name,change] of [
  ['resources pending',f=>f.resources.status='loading'],['foreign resource tenant',f=>f.resources.tenantId='other'],
  ['foreign resource project',f=>f.resources.projectId='other'],['stale period',f=>f.resources.periodId='old'],
  ['HR source still selected',f=>f.cx.dataSource.sourceRef='hr-live'],['authority updating',f=>f.cx.dataSource.status='updating'],
  ['stale fixture version',f=>f.cx.data.__backendAllProjectRecords[0].version=2],['unexpected preimage',f=>f.cx.data.__backendAllProjectRecords[0].countries=['GT','HN']],
  ['foreign active project',f=>f.cx.data.currentProjectId='other'],['different route',f=>f.cx.session.view='dashboard'],
  ['disabled provider',f=>f.cx.connectedAdminConfig.enabled=()=>false],['detached button',f=>f.button.isConnected=false],
  ['hidden button',f=>f.button.getClientRects=()=>[]],['disabled button',f=>f.button.disabled=true],
  ['wrong visible country',f=>f.body.querySelectorAll=()=>[{dataset:{rmc:'HN'}}]],
  ['ambiguous button',f=>f.document.querySelectorAll=s=>s.includes('#addPais')?[f.button,f.button]:[{}]]
])test('country action remains blocked on '+name,()=>{const f=countryReadyFixture();change(f);assert.equal(Boolean(ready(f)),false);});
test('passive modal trace preserves remount and removal order without recording body text or issuing product actions',()=>{
  let mutations,click,resources,currentButton={},time=0;
  const window={CX:{data:{currentProjectId:'fixture-a'},session:{view:'config'},bus:{on:(event,listener)=>{assert.equal(event,'resources');resources=listener;}}},addEventListener(){}};
  const document={body:{},querySelector:()=>currentButton,addEventListener:(event,listener)=>{assert.equal(event,'click');click=listener;}};
  class Observer{constructor(callback){mutations=callback;}observe(target,options){assert.equal(target,document.body);assert.equal(options.subtree,true);}}
  vm.runInNewContext('('+installCountryUiObservation.toString()+')()',{window,document,MutationObserver:Observer,performance:{now:()=>++time}});
  const dialog={nodeType:1,matches:s=>s==='.cx-ov',querySelectorAll:s=>s==='[data-c]'?[{dataset:{c:'HN'}}]:[],getAttribute:()=> 'Agregar país',innerText:'PRIVATE BODY'};
  click({isTrusted:true,target:{closest:()=>({id:'addPais',dataset:{}})}});
  mutations([{addedNodes:[dialog],removedNodes:[]}]);
  resources({status:'ready',source:'firestore',projectId:'fixture-a',privateField:'PRIVATE BODY'});
  currentButton={};mutations([{addedNodes:[],removedNodes:[dialog]}]);
  const trace=window.__CX_I3_COUNTRY_UI_TRACE;
  assert.deepEqual(Array.from(trace.events,x=>x.kind),['OBSERVATION_INSTALLED','NATIVE_CLICK','DIALOG_ADDED','RESOURCES_PUBLICATION','COUNTRY_BUTTON_REPLACED','DIALOG_REMOVED']);
  assert.equal(trace.events[1].trusted,true);assert.equal(trace.viewGeneration,1);assert.equal(JSON.stringify(trace).includes('PRIVATE BODY'),false);
  for(let i=0;i<180;i++)resources({status:'ready'});assert.equal(trace.events.length,160);assert.ok(trace.dropped>0);
  trace.active=false;const count=trace.dropped;resources({status:'ready'});assert.equal(trace.dropped,count);
});
test('country observer keeps exact request scope and waits for the click before returning its response',async()=>{
  const response={url:()=>'/v1/cxorbia/commands',request:()=>({postDataJSON:()=>({commandType:'project.update',projectId:'owned-project'})})};
  const events=[];
  const page={waitForResponse(predicate,options){
    assert.equal(options.timeout,60000);assert.equal(predicate(response),true);
    assert.equal(predicate({...response,request:()=>({postDataJSON:()=>({commandType:'project.update',projectId:'other-project'})})}),false);
    assert.equal(predicate({...response,request:()=>({postDataJSON:()=>({commandType:'project.create',projectId:'owned-project'})})}),false);
    assert.equal(predicate({...response,url:()=>'/other-endpoint'}),false);
    events.push('observer');return Promise.resolve(response);
  }};
  const actual=await observeCountryUpdate({page,projectId:'owned-project',click:async()=>{events.push('click:start');await new Promise(resolve=>setTimeout(resolve,5));events.push('click:settled');}});
  events.push('returned');assert.equal(actual,response);assert.deepEqual(events,['observer','click:start','click:settled','returned']);
});
test('country observer propagates response failure only after the in-flight click has settled',async()=>{
  const error=new Error('RESPONSE_TIMEOUT'),events=[];
  const page={waitForResponse:()=>Promise.reject(error)};
  await assert.rejects(async()=>{
    try{await observeCountryUpdate({page,projectId:'owned-project',click:async()=>{await new Promise(resolve=>setTimeout(resolve,10));events.push('click:settled');}});}
    finally{events.push('cleanup');}
  },e=>e===error);
  assert.deepEqual(events,['click:settled','cleanup']);
});
test('country observer preserves a late response timeout after a successful click',async()=>{
  const error=new Error('RESPONSE_TIMEOUT');
  const page={waitForResponse:()=>new Promise((resolve,reject)=>setTimeout(()=>reject(error),10))};
  await assert.rejects(observeCountryUpdate({page,projectId:'owned-project',click:async()=>{}}),e=>e===error);
});
test('synchronous and asynchronous click failures cannot leave a fatal response rejection after cleanup',()=>{
  const owner=new URL('./cxorbia-i3-project-country-live-proof.mjs',import.meta.url).href;
  const code=`import assert from 'node:assert/strict';import {observeCountryUpdate} from ${JSON.stringify(owner)};
    for(const delayed of [false,true]){
      const error=new Error('CLICK_TIMEOUT');const events=[];
      const page={waitForResponse:()=>new Promise((resolve,reject)=>setTimeout(()=>reject(new Error('RESPONSE_TIMEOUT')),25))};
      try{await observeCountryUpdate({page,projectId:'owned-project',click:delayed?async()=>{await new Promise(r=>setTimeout(r,5));throw error;}:()=>{throw error;}});assert.fail('click error was suppressed');}
      catch(e){assert.equal(e,error);events.push('click:failed');}finally{events.push('cleanup');}
      await new Promise(r=>setTimeout(r,45));assert.deepEqual(events,['click:failed','cleanup']);
    }console.log('PASS_LATE_REJECTION_HANDLED_WITH_ORIGINAL_CLICK_FAILURE');`;
  const child=spawnSync(process.execPath,['--unhandled-rejections=strict','--input-type=module','-e',code],{encoding:'utf8',timeout:5000});
  assert.equal(child.status,0,child.stderr);assert.match(child.stdout,/PASS_LATE_REJECTION_HANDLED_WITH_ORIGINAL_CLICK_FAILURE/);
});
function fixture(){
  const scope={projectId:'p',tenantId:'t',periodId:'qa-period',name:'I3 QA',runId:'123',staffUid:'staff'};
  const command={commandType:'project.update',idempotencyKey:'own-command',tenantId:'t',projectId:'p',periodId:'qa-period',payload:{periodId:'qa-period',countries:['GT','HN'],currency:{GT:'Q',HN:'L'}}};
  const record={id:'p',projectId:'p',tenantId:'t',periodId:'qa-period',name:'I3 QA',qaOnly:true,qaRunId:'123',createdBy:'staff',version:2,countries:['GT','HN'],currency:{GT:'Q',HN:'L'},operationalSource:{mode:'internal',writePolicy:'platform_only'}};
  const ack={ok:true,status:'committed',tenantId:'t',periodId:'qa-period',committed:true,providerAck:true,successUiAllowed:true,readbackVerified:true,commandType:'project.update',idempotencyKey:'own-command',projectId:'p',entityVersion:2};
  const receipt={status:'committed',providerAck:true,commandDigest:digest(command),projectId:'p',periodId:'qa-period',commandType:'project.update',actorUid:'staff',entityVersion:2};
  const audit={tenantId:'t',projectId:'p',entityType:'project',periodId:'qa-period',entityId:'p',commandType:'project.update',actorUid:'staff',idempotencyKey:'own-command'};
  return {scope,command,record,ack,receipt,audit};
}
test('project identity, command paths and stable digest match the provider contract',()=>{
  assert.equal(projectIdFor('t','  I3 QA Países  '),projectIdFor('t','i3 qa paises'));
  assert.notEqual(projectIdFor('t','I3 QA'),projectIdFor('other','I3 QA'));
  const f=fixture(),p=projectCommandPaths('t',f.command);
  assert.equal(p.receipt,'tenants/t/commandReceipts/'+digest('t\0own-command').slice(0,40));
  assert.equal(p.audit,'tenants/t/entityAuditTrail/project-'+digest('own-command').slice(0,32));
  assert.equal(digest({b:2,a:1}),digest({a:1,b:2}));
});
test('real ACK needs exact independent project, receipt and audit ownership',()=>assert.equal(validateCountryReadback(fixture()).pass,true));
for(const [name,mutate] of [
  ['fake ACK',f=>f.ack.providerAck=false],['foreign tenant',f=>f.command.tenantId='other'],
  ['foreign project',f=>f.record.id='other'],['unowned fixture',f=>f.record.qaOnly=false],
  ['other run',f=>f.record.qaRunId='999'],['wrong actor',f=>f.record.createdBy='other'],
  ['commercial period',f=>f.command.payload.periodId='commercial'],['external source',f=>f.record.operationalSource.mode='external'],
  ['newer foreign version',f=>f.record.version=3],['wrong command digest',f=>f.receipt.commandDigest='bad'],
  ['receipt absent',f=>f.receipt=null],['audit foreign actor',f=>f.audit.actorUid='other'],
  ['missing country',f=>f.record.countries=['GT']],['missing currency',f=>delete f.record.currency.HN]
])test('rejects '+name,()=>{const f=fixture();mutate(f);assert.equal(validateCountryReadback(f).pass,false);});
function composite(){
  const readonly=validReadonlyReceipt();readonly.readOnlyProof.commandWritesEnabled=true;
  const identity={sourceSha:'a'.repeat(40),sourceTree:'b'.repeat(40),runtimeRevision:'runtime',runtimeDigest:'sha256:'+'c'.repeat(64),hostingVersion:'hosting'};
  Object.assign(readonly,identity);
  return {readonly,country:{...identity,decision:'PASS_I3_PROJECT_COUNTRY_UI_PROVIDER_RELOAD_REPLAY_CLEANUP',actionReal:true,providerAck:true,durableReadback:true,reloadProof:true,noDuplicateRegression:true,cleanupVerified:true,samePrincipal:true,commercialProjectUnchanged:true}};
}
test('domain proof combines readonly obligations and actual provider mutation without pretending the write branch is readonly',()=>{
  const f=composite(),receipts=composeTenantCountryReceipts(f.readonly,f.country,mod);
  assert.equal(receipts[0].operationKind,'MUTATION');assert.equal(receipts[0].validation.pass,true);
  assert.deepEqual(receipts[1].findingIds,['VRM-335']);assert.deepEqual(receipts[1].ownerPaths,['app/modules/configuracion.js']);
  assert.equal(f.readonly.operationKind,'READ_ONLY');assert.equal(f.readonly.readOnlyProof.commandWritesEnabled,true);
});
for(const key of ['actionReal','providerAck','durableReadback','reloadProof','noDuplicateRegression','cleanupVerified','samePrincipal','commercialProjectUnchanged'])test('no domain promotion without '+key,()=>{
  const f=composite();f.country[key]=false;assert.equal(composeTenantCountryReceipts(f.readonly,f.country,mod)[0].validation.pass,false);
});
test('unknown navigation writes, wrong source and incomplete readonly evidence still block the composed proof',()=>{
  for(const mutate of [f=>f.readonly.readOnlyProof.configurationMutationRequestsObserved=1,f=>f.country.sourceSha='d'.repeat(40),f=>f.readonly.readOnlyProof.checksAfterReload.pop()]){
    const f=composite();mutate(f);assert.equal(composeTenantCountryReceipts(f.readonly,f.country,mod)[0].validation.pass,false);
  }
});
