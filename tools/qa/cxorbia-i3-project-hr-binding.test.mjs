import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {repairProjectHrReadBinding,validateB14RuntimeBinding} from './cxorbia-i3-hr-ack-exact-same-revision.mjs';
const root=process.cwd(),text=fs.readFileSync('backend/runtime/hr-live-service/server.mjs','utf8');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const extract=(a,b)=>text.slice(text.indexOf(a),text.indexOf(b,text.indexOf(a)));
const resolverSource=extract('async function resolveProjectHrReadBinding','function canonicalProtectedAuthNamespace');
const resolve=new Function('fs','path','crypto','ROOT','ensureAdmin',resolverSource+';return resolveProjectHrReadBinding;')(fs,path,crypto,root,()=>{throw Error('UNEXPECTED_DEFAULT_DB');});
const timestamp=(ms=Date.parse('2026-11-06T14:47:13.322Z'),extra=0)=>({seconds:Math.floor(ms/1000),nanoseconds:(ms%1000)*1e6+extra,toDate:()=>new Date(ms)});
const scope={tenantId:'tya',projectId:'cinepolis'},id='private-configured-binding',sheetId='configured-workbook-not-global';
const map=JSON.parse(fs.readFileSync('backend/contracts/tya-hr-column-map-r20-v1.json'));
const projectPath='tenants/tya/projects/cinepolis',bindingPath='tenants/tya/integrationSettings/'+id;
const project=()=>({...scope,version:5,operationalSource:{mode:'external',providerType:'google_sheets',readPolicy:'external_live',writePolicy:'external_read_only',providerBindingId:id,mappingRef:map.contractId}});
const binding=()=>({...scope,providerBindingId:id,enabled:true,hrWritesEnabled:false,providerType:'google_sheets',readPolicy:'external_live',writePolicy:'external_read_only',sheetId,mappingRef:map.contractId});
function fake({p=project(),b=binding(),missingProject=false,missingBinding=false}={}){
 const rows=new Map(),reads=[],writes=[];if(!missingProject)rows.set(projectPath,{data:p,time:timestamp()});if(!missingBinding)rows.set(bindingPath,{data:b,time:timestamp()});
 const snap=ref=>({exists:rows.has(ref.path),data:()=>structuredClone(rows.get(ref.path)?.data),updateTime:rows.get(ref.path)?.time});
 const db={doc:p=>({path:p,get:async()=>{reads.push(p);return snap({path:p});}}),runTransaction:async fn=>{
  const pending=[];const value=await fn({get:async ref=>{reads.push(ref.path);return snap(ref);},create:(ref,data)=>{assert.equal(rows.has(ref.path),false);pending.push({ref,data});}});
  for(const {ref,data} of pending){writes.push(ref.path);rows.set(ref.path,{data:structuredClone(data),time:timestamp(Date.parse('2026-11-17T06:00:00Z'))});}return value;
 }};return {db,rows,reads,writes};
}
const expected={projectVersion:5,projectUpdateTime:'2026-11-06T14:47:13.322Z',bindingRefSha256:hash(id),mappingRefSha256:hash(map.contractId),workbookSha256:hash(sheetId)};
test('configured private workbook and exact mapping feed readers without exposing private references',async()=>{
 const f=fake(),r=await resolve(scope,{db:f.db});assert.equal(r.readerEnv.CXORBIA_HR_LIVE_SHEET_ID,sheetId);assert.equal(r.readerEnv.CXORBIA_HR_REQUIRE_PROJECT_BINDING,'true');
 assert.equal(r.readerEnv.CXORBIA_HR_COLUMN_MAP_FILE,path.join(root,'backend/contracts/tya-hr-column-map-r20-v1.json'));
 assert.equal(r.proof.workbookSha256,hash(sheetId));assert.equal(r.proof.mappingSha256,hash(fs.readFileSync(r.readerEnv.CXORBIA_HR_COLUMN_MAP_FILE)));
 assert.ok(!JSON.stringify(r.proof).includes(sheetId));assert.ok(!JSON.stringify(r.proof).includes(id));assert.equal(f.writes.length,0);
});
test('an unconfigured project fails after its exact project lookup without borrowing another binding',async()=>{
 const f=fake();await assert.rejects(resolve({...scope,projectId:'other'},{db:f.db}),/HR_BINDING_PROJECT_MISSING/);
 assert.deepEqual(f.reads,['tenants/tya/projects/other']);assert.equal(f.writes.length,0);
});
for(const [name,opts,code] of [
 ['missing project',{missingProject:true},'PROJECT_MISSING'],['missing private doc',{missingBinding:true},'INTEGRATION_MISSING'],
 ['foreign tenant',{b:{...binding(),tenantId:'foreign'}},'INTEGRATION_SCOPE'],
 ['contradictory project list',{b:{...binding(),projectId:'foreign',projectIds:['cinepolis']}},'INTEGRATION_SCOPE'],
 ['disabled',{b:{...binding(),enabled:false}},'INTEGRATION_POLICY'],
 ['remote write enabled',{b:{...binding(),hrWritesEnabled:true}},'INTEGRATION_POLICY'],
 ['wrong mapping',{b:{...binding(),mappingRef:'other-map'}},'INTEGRATION_REFERENCE'],
 ['ambiguous workbook',{b:{...binding(),spreadsheetId:'different'}},'WORKBOOK_AMBIGUOUS'],
 ['empty workbook',{b:{...binding(),sheetId:''}},'WORKBOOK_MISSING'],
 ['internal source',{p:{...project(),operationalSource:{mode:'internal'}}},'SOURCE_POLICY'],
 ['partial operational source must not fallback',{p:{...project(),routeSource:project().operationalSource,operationalSource:{}}},'SOURCE_POLICY']
])test(name+' rejects safely',async()=>{const f=fake(opts);await assert.rejects(resolve(scope,{db:f.db}),new RegExp(code));assert.equal(f.writes.length,0);});
test('binding fingerprint observes submillisecond changes and rejects missing timestamp',async()=>{const f=fake(),first=await resolve(scope,{db:f.db});f.rows.get(bindingPath).time=timestamp(undefined,1);const second=await resolve(scope,{db:f.db});assert.notEqual(first.proof.bindingFingerprint,second.proof.bindingFingerprint);f.rows.get(bindingPath).time=null;await assert.rejects(resolve(scope,{db:f.db}),/TIMESTAMP_UNVERIFIABLE/);});
test('cache is never used before private scope validation and changed binding forces read',async()=>{
 const source=extract('async function buildSnapshot','async function resolveHrAndProtectedPrincipal');
 const cached={origin:'runtime_refresh',loadedAt:Date.now(),bindingProof:{bindingFingerprint:'old'}};let reads=0;
 const build=new Function('resolveProjectHrReadBinding','refreshSnapshot','cache','CACHE_MS','inFlight','inFlightBinding',source+';return buildSnapshot;')(async s=>{if(s.projectId==='other')throw Error('INVALID_SCOPE');return {proof:{bindingFingerprint:'new'}};},async b=>{reads++;return b;},cached,1e9,null,null);
 await assert.rejects(build({scope:{...scope,projectId:'other'}}),/INVALID_SCOPE/);assert.equal(reads,0);await build({scope});assert.equal(reads,1);
});
test('both readers consume exact env and a mid-read configuration change prevents publishing cache',async()=>{
 const source=extract('async function refreshSnapshot','async function buildSnapshot');const f=fake(),bound=await resolve(scope,{db:f.db});const calls=[];
 const names=['fs','path','os','REGISTRY_FILE','runNode','runIndependentHrSourceReads','parseSnapshot','withDurableProjectConfig','resolveProjectHrReadBinding','snapshotScope','materialize','parseIdentity'];
 const args=[fs,path,os,'/no-registry',async(a,e)=>{calls.push({a,e});},async timed=>{await Promise.all([timed('one',['first']),timed('two',['second'])]);return {};},()=>scope,async s=>s,async()=>({...bound,proof:{...bound.proof,bindingFingerprint:'changed'}}),s=>s,()=>{throw Error('MUST_NOT_PUBLISH');},()=>null];
 const run=new Function(...names,'let inFlight=null,inFlightBinding=null,cache={old:true},lastRefreshStartedAt,lastRefreshError,lastRefreshFinishedAt,lastRefreshDurationMs,lastRefreshStagesMs,lastRefreshProviderReads;'+source+';return {refreshSnapshot,getCache:()=>cache};')(...args);
 await assert.rejects(run.refreshSnapshot(bound),/CHANGED_DURING_READ/);assert.deepEqual(run.getCache(),{old:true});assert.ok(calls.length>=2);for(const call of calls){assert.equal(call.e.CXORBIA_HR_LIVE_SHEET_ID,sheetId);assert.equal(call.e.CXORBIA_HR_COLUMN_MAP_FILE,bound.readerEnv.CXORBIA_HR_COLUMN_MAP_FILE);}assert.ok(calls.every(c=>!fs.existsSync(c.e.CXORBIA_HR_SOURCE_SAFE_OUT)));
});
test('only absent binding is created; independent readback and replay have no additional writes',async()=>{
 const f=fake({missingBinding:true}),before=JSON.stringify(f.rows.get(projectPath).data),input={db:f.db,...scope,expected,sheetId,mappingRef:map.contractId};
 const first=await repairProjectHrReadBinding(input),second=await repairProjectHrReadBinding(input);assert.equal(first.created,true);assert.equal(first.durableReadback,true);assert.equal(second.created,false);assert.equal(second.firestoreWrites,0);assert.deepEqual(f.writes,[bindingPath]);assert.equal(JSON.stringify(f.rows.get(projectPath).data),before);assert.equal(first.hrWrites,0);assert.equal(first.authWrites,0);
});
test('existing private configuration is never overwritten',async()=>{const f=fake();await assert.rejects(repairProjectHrReadBinding({db:f.db,...scope,expected,sheetId,mappingRef:map.contractId}),/EXISTING_CONFLICT/);assert.equal(f.writes.length,0);});
test('project drift blocks repair before create',async()=>{const f=fake({missingBinding:true,p:{...project(),version:6}});await assert.rejects(repairProjectHrReadBinding({db:f.db,...scope,expected,sheetId,mappingRef:map.contractId}),/PROJECT_DRIFT/);assert.equal(f.writes.length,0);});
test('live proof must bind exact private readback, both readers and fingerprint',async()=>{
 const f=fake({missingBinding:true}),first=await repairProjectHrReadBinding({db:f.db,...scope,expected,sheetId,mappingRef:map.contractId}),bound=await resolve(scope,{db:f.db});
 const repair={first,mappingSha256:bound.proof.mappingSha256,replayZeroWrites:true},meta={ok:true,hrWrites:false,production:false,revisionStable:true,revision:'a'.repeat(64),projectReadBinding:{...bound.proof,runtimeConsumptionVerified:true,readerCount:2}};
 assert.equal(validateB14RuntimeBinding(meta,repair).decision,'PASS_VRM358_RUNTIME_CONSUMES_PROJECT_PRIVATE_HR_BINDING');
 assert.throws(()=>validateB14RuntimeBinding({...meta,projectReadBinding:{...meta.projectReadBinding,workbookSha256:'b'.repeat(64)}},repair),/workbookSha256/);
 assert.throws(()=>validateB14RuntimeBinding({...meta,projectReadBinding:{...meta.projectReadBinding,runtimeConsumptionVerified:false}},repair),/PROOF/);
});
