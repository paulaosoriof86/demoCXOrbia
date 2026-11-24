import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {approvedScenarioDefinitions,restoreScenarioDimensions,observeRestoredScenarioDimensions} from './cxorbia-i3-gthn-existing-dev-readback.mjs';
const definitions=[{key:'a',label:'Configured A',sourceField:'a'},{key:'b',label:'Configured B',sourceField:'b'}];
const scope={tenantId:'t',projectId:'p'};
const source={mode:'external',providerType:'excel_online',readPolicy:'external_live',
 writePolicy:'external_read_only',periodDiscovery:'provider_auto',countryBindings:[{countryCode:'GT'},{countryCode:'HN'}]};
function fixture(extra={},options={}){
 let value={tenantId:'t',projectId:'p',name:'Preserved',version:12,updatedAt:'unchanged',operationalSource:source,...extra};
 let revision=1,writes=0,transactions=0,gets=0;
 const snapshot=()=>({exists:true,data:()=>structuredClone(value),updateTime:{seconds:100,nanoseconds:revision}});
 const ref={path:'tenants/t/projects/p',get:async()=>{gets++;if(options.missingReadback&&writes)return{exists:true,data:()=>({...value,scenarioDimensions:null}),updateTime:{seconds:100,nanoseconds:revision}};return snapshot();}};
 const db={runTransaction:async fn=>{
  transactions++;options.beforeTx?.({mutate:v=>{value={...value,...v};},bump:()=>revision++});
  let patch;
  const result=await fn({get:async r=>{assert.equal(r,ref);return snapshot();},update:(r,p)=>{
    assert.equal(r,ref);assert.deepEqual(Object.keys(p),['scenarioDimensions']);patch=p;
  }});
  if(patch){value={...value,...structuredClone(patch)};writes++;revision++;}
  if(options.loseAck)throw Error('provider response lost');
  return result;
 }};
 return {db,ref,observe:()=>({value:structuredClone(value),writes,transactions,gets,revision})};
}
test('approved absent field commits once and exact replay writes zero while preserving the project',async()=>{
 const f=fixture(),before=f.observe().value,events=[];
 const first=await restoreScenarioDimensions({...f,scope,definitions,onProgress:e=>events.push(e)});
 assert.equal(first.configWrites,1);assert.equal(first.providerAck,true);assert.equal(first.configReadbackVerified,true);
 assert.equal(first.projectRestSha256Before,first.projectRestSha256After);
 assert.equal(first.operationalSourceSha256Before,first.operationalSourceSha256After);
 const second=await restoreScenarioDimensions({...f,scope,definitions});
 assert.equal(second.decision,'ALREADY_EXACT');assert.equal(second.configWrites,0);assert.equal(second.idempotentReplay,true);
 assert.equal(second.projectUpdateTimeBefore,second.projectUpdateTimeAfter);
 const current=f.observe();assert.equal(current.writes,1);assert.equal(current.transactions,1);
 assert.deepEqual(current.value,{...before,scenarioDimensions:definitions});
 assert.ok(events.some(e=>e.stage==='REMOTE_COMMIT_ACK'));
});
test('already exact metadata never opens a write transaction',async()=>{
 const f=fixture({scenarioDimensions:definitions});
 const r=await restoreScenarioDimensions({...f,scope,definitions});
 assert.equal(r.configWrites,0);assert.equal(r.providerAck,false);assert.equal(f.observe().transactions,0);
});
test('read-only continuation cannot restore an absent catalog and uses no writer dependency',async()=>{
 const f=fixture(),authority=await restoreScenarioDimensions({...f,scope,definitions});
 const observed=await observeRestoredScenarioDimensions({ref:f.ref,scope,definitions,authority});
 assert.equal(observed.configWrites,0);assert.equal(observed.providerAck,false);assert.equal(f.observe().writes,1);
 const absent=fixture();
 await assert.rejects(observeRestoredScenarioDimensions({ref:absent.ref,scope,definitions,authority}),/READONLY_RESTORATION_DRIFT/);
 assert.equal(absent.observe().writes,0);assert.equal(absent.observe().transactions,0);
});
test('different or explicitly empty catalog is a conflict, never interpreted as absent',async()=>{
 for(const scenarioDimensions of [[],[{key:'other'}],null]){
  const f=fixture({scenarioDimensions});
  await assert.rejects(restoreScenarioDimensions({...f,scope,definitions}),/CATALOG_CONFLICT/);
  assert.equal(f.observe().writes,0);assert.equal(f.observe().transactions,0);
 }
});
test('concurrent updateTime or remaining-document change rejects the CAS without a write',async()=>{
 for(const beforeTx of [x=>x.bump(),x=>x.mutate({name:'Concurrent'})]){
  const f=fixture({}, {beforeTx});
  await assert.rejects(restoreScenarioDimensions({...f,scope,definitions}),/CAS_CONFLICT/);
  assert.equal(f.observe().writes,0);
 }
});
test('lost response is not called an ACK; fresh recovery sees exact metadata and performs no second write',async()=>{
 const events=[],f=fixture({}, {loseAck:true});
 await assert.rejects(restoreScenarioDimensions({...f,scope,definitions,onProgress:e=>events.push(e)}),/response lost/);
 assert.equal(f.observe().writes,1);assert.equal(events.some(x=>x.stage==='REMOTE_COMMIT_ACK'),false);
 const replay=await restoreScenarioDimensions({...f,scope,definitions});
 assert.equal(replay.decision,'ALREADY_EXACT');assert.equal(replay.configWrites,0);assert.equal(f.observe().writes,1);
});
test('incomplete durable readback holds after recorded ACK and never rolls back or retries a write',async()=>{
 const events=[],f=fixture({}, {missingReadback:true});
 await assert.rejects(restoreScenarioDimensions({...f,scope,definitions,onProgress:e=>events.push(e)}),/DURABLE_FIELD/);
 assert.equal(f.observe().writes,1);assert.equal(events.filter(e=>e.stage==='REMOTE_COMMIT_ACK').length,1);
});
test('catalog is parsed as JSON and bound to the approved fixture hash and project',()=>{
 const payload={tenantId:'t',projectId:'p',projectConfig:{scenarioDimensions:definitions}};
 const raw=Buffer.from('/* fixture */window.CX_TYA_HR_SOURCE_SAFE = '+JSON.stringify(payload)+';');
 const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
 const authority={sha256:hash(raw),definitions,definitionsSha256:hash(JSON.stringify(definitions))};
 assert.deepEqual(approvedScenarioDefinitions(raw,authority,scope),definitions);
 assert.throws(()=>approvedScenarioDefinitions(Buffer.concat([raw,Buffer.from(' ')]),authority,scope),/FIXTURE_SHA/);
 assert.throws(()=>approvedScenarioDefinitions(raw,authority,{...scope,projectId:'other'}),/APPROVED_CATALOG/);
 assert.throws(()=>approvedScenarioDefinitions(raw,{...authority,definitionsSha256:'0'.repeat(64)},scope),/APPROVED_CATALOG/);
});
