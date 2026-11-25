import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {F3_QA,F3_RUN2782_RECOVERY,f3ValidateRun2782RecoveryInputs,f3Run2782ExpectedRows,f3AssessRun2782Documents,f3RecoverRun2782OwnedQa,f3ProbeWriterMcpMetadataOnly,f3VerifyRun2782GtPendingBaseline} from './cxorbia-i3-b14-isolated-provider-writer-qa.mjs';
const root=process.cwd()+'/';
const bytes=()=>({rawBytes:fs.readFileSync(root+F3_RUN2782_RECOVERY.rawPath),authorityBytes:fs.readFileSync(root+F3_RUN2782_RECOVERY.authorityPath),manifestBytes:fs.readFileSync(root+'docs/checkpoints/CXORBIA_I3_F3_REMOTE_FIXTURE_20261124.json')});
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const digest=v=>crypto.createHash('sha256').update(JSON.stringify(stable(v))).digest('hex');
function fixture(){
 const inputs=f3ValidateRun2782RecoveryInputs(bytes()),raw=inputs.raw,owner=raw.qaOwner,project='tenants/tya/projects/'+F3_QA.projectId;
 const time=Date.parse(raw.remoteCommandAttempts.at(-1).finishedAt)-1000,stamp={seconds:Math.floor(time/1000),nanoseconds:0,isEqual(other){return this.seconds===other.seconds;}};
 let plan=f3Run2782ExpectedRows(inputs),rows=[...plan.fixed].map(([path,data])=>({path,data:structuredClone(data),exists:true,updateTime:stamp,updateTimeMs:time}));
 for(const b of raw.remoteBaseline.rows){const path=project+'/visits/'+b.visitId,e=raw.events[0].event;
  const effect=raw.reconciliations[0].durable.effects.flatMap(x=>x.data.operations).find(x=>x.entity===path);
  const data={...Object.fromEntries(effect.fields.map(k=>[k,null])),id:b.visitId,tenantId:'tya',projectId:F3_QA.projectId,periodId:F3_QA.periodId,hrRowId:b.hrRowId,excelWorksheetFingerprint:b.worksheetFingerprint,hrSourceRevision:raw.initialSourceRevision,...b.values,version:1,createdAt:'2026-11-24T21:44:18.680Z',updatedAt:'2026-11-24T21:44:18.681Z'};
  effect.expectedDigest=digest(data);
  if(b.countryCode==='GT')Object.assign(data,{escenario:e.after,version:2,updatedAt:e.createdAt,hrFieldJournalVersion:e.schemaVersion,hrPendingFields:{escenario:{eventId:e.eventId,status:'pending_hr',requestedValue:e.after,baseValue:e.before,baseRevision:e.baseRevision,eventDigest:e.eventDigest,providerAck:false}},hrSyncStatus:'pending_hr'});
  rows.push({path,data,exists:true,updateTime:stamp,updateTimeMs:time});
 }
 plan=f3Run2782ExpectedRows(inputs);for(const row of rows)if(plan.fixed.has(row.path))row.data=structuredClone(plan.fixed.get(row.path));
 const command=raw.remoteCommandAttempts[0].command;
 const c={status:'committed',commandDigest:digest(command),actorUid:owner+'-admin',commandType:command.commandType,entityId:command.entityId,hrFieldEventIds:[raw.events[0].eventId]};
 const a={...c,tenantId:'tya',projectId:F3_QA.projectId,periodId:F3_QA.periodId,idempotencyKey:command.idempotencyKey};
 rows.push(...plan.commandPaths.map((path,i)=>({path,data:i?a:c,exists:true,updateTime:stamp,updateTimeMs:time})));
 return {inputs,rows,lock:{path:raw.scopeLockBaseline.path,exists:true,data:raw.reconciliations[0].durable.scopeLock,updateTime:stamp,updateTimeMs:time},authUser:{uid:owner+'-admin',customClaims:{tenantId:'tya',role:'admin',authNamespace:'staff',projectIds:[F3_QA.projectId],qaOwner:owner},displayName:'CXOrbia isolated QA operator',disabled:false,providerData:[],metadata:{creationTime:'2026-11-24T21:43:50Z'}},now:Date.parse('2026-11-24T22:00:00Z')};
}
test('exact raw receipt and independent root authority validate without provider initialization',()=>{const x=f3ValidateRun2782RecoveryInputs(bytes());assert.equal(x.raw.runId,'45493719666');assert.equal(x.authority.writer.executionCount,0);});
for(const key of ['rawBytes','authorityBytes','manifestBytes'])test('one raw byte changed rejects '+key,()=>{const b=bytes();b[key]=Buffer.concat([b[key],Buffer.from(' ')]);assert.throws(()=>f3ValidateRun2782RecoveryInputs(b),/SHA/);});
test('exact invocation is28documents, one remoteevent and no crosswalk ownership',()=>{const p=f3Run2782ExpectedRows(f3ValidateRun2782RecoveryInputs(bytes()));assert.equal(p.expectedPaths.length,28);assert.equal(p.expectedPaths.some(x=>x.includes('shopperIdentityCrosswalk')),false);assert.equal(new Set(p.expectedPaths).size,28);});
test('typed clean synthetic state is eligible, not B14 PASS',()=>{const p=f3AssessRun2782Documents(fixture());assert.equal(p.expectedPaths.length,28);assert.equal(p.b14Closed,undefined);});
for(const [label,mutate]of [
 ['foreign descendant',x=>x.rows.push({...x.rows[0],path:'tenants/tya/projects/'+F3_QA.projectId+'/foreign/important'})],
 ['missing row',x=>x.rows.pop()],
 ['reverted-write version outside invocation',x=>x.rows[0].updateTimeMs=x.now],
 ['changed fixture owner',x=>x.rows.find(r=>r.path==='tenants/tya/projects/'+F3_QA.projectId).data.qaOwner='another-run'],
 ['changed event owner',x=>x.rows.find(r=>r.path.includes('/hrFieldEvents/')).data.actorUid='another-admin'],
 ['active field lease',x=>Object.assign(x.rows.find(r=>r.path.includes('/hrFieldHeads/')).data,{leaseOwner:'new',leaseUntil:x.now+90000})],
 ['active scope lease',x=>x.lock.data.expiresAt=x.now+120000],
 ['changed lock owner',x=>x.lock.data.attemptId='foreign'],
 ['wrong auth owner',x=>x.authUser.customClaims.qaOwner='foreign'],
 ['auth account with ordinary provider',x=>x.authUser.providerData=[{providerId:'password'}]],
 ['GT pending event drift',x=>x.rows.find(r=>r.path.endsWith(F3_QA.visits.GT)).data.hrPendingFields.escenario.eventId='foreign']
])test('reject before delete: '+label,()=>{const x=fixture();mutate(x);assert.throws(()=>f3AssessRun2782Documents(x));});
test('probe failure is recorded and fresh baseline still attempted; no provider writes',async()=>{
 const inputs=f3ValidateRun2782RecoveryInputs(bytes()),stages=[];let fresh=0;
 await assert.rejects(f3RecoverRun2782OwnedQa({db:{},auth:{},inputs,checkpoint:async(s,r)=>stages.push([s,r.writerProbe?.decision]),probeWriter:async()=>{throw Error('private raw error');},readFreshBaseline:async()=>{fresh++;throw Error('TEST_STOP_BEFORE_DATABASE');}}),/TEST_STOP_BEFORE_DATABASE/);
 assert.equal(fresh,1);assert.deepEqual(stages,[['writerProbe','HOLD_F3_WRITER_INITIALIZE_OR_LISTTOOLS_FAILED']]);
});
test('capture persistence failure prevents fresh read and every deletion',async()=>{
 let reads=0;await assert.rejects(f3RecoverRun2782OwnedQa({db:{},auth:{},inputs:f3ValidateRun2782RecoveryInputs(bytes()),checkpoint:async()=>{throw Error('DISK_FAIL');},probeWriter:async()=>({decision:'PASS',callToolCount:0}),readFreshBaseline:async()=>{reads++;}}),/DISK_FAIL/);assert.equal(reads,0);
});
function probeFixture(){
 let connects=0,lists=0,calls=0,closes=0;
 const properties=Object.fromEntries(['protocolVersion','operation','eventId','eventDigest','fieldKey','periodId','bindingFingerprint'].map(k=>[k,{type:'string'}]));
 const result={tools:[{name:'qa_writer',annotations:{readOnlyHint:false},inputSchema:{properties}}]};
 class Client{async connect(){connects++;}async listTools(){lists++;return result;}async callTool(){calls++;throw Error('MUST_NOT_CALL');}async close(){closes++;}}
 class Transport{constructor(url,options){assert.equal(url.hostname,'eu2.make.com');assert.equal(options.requestInit.headers.Authorization,'Bearer TEST_SECRET_DO_NOT_EMIT');}}
 const cloudClient={request:async()=>({data:{payload:{data:Buffer.from('TEST_SECRET_DO_NOT_EMIT').toString('base64')}}})};
 return {args:{cloudClient,Client,StreamableHTTPClientTransport:Transport},result,counts:()=>({connects,lists,calls,closes})};
}
test('writer metadata probe checks exact contract without invoking a tool',async()=>{
 const f=probeFixture(),out=await f3ProbeWriterMcpMetadataOnly(f.args);assert.equal(out.contractExact,true);assert.equal(out.stage,'contract');assert.deepEqual(f.counts(),{connects:1,lists:1,calls:0,closes:1});assert.doesNotMatch(JSON.stringify(out),/TEST_SECRET/);
});
test('writer metadata probe isolates annotation mismatch as contract HOLD',async()=>{
 const f=probeFixture();delete f.result.tools[0].annotations.readOnlyHint;const out=await f3ProbeWriterMcpMetadataOnly(f.args);assert.equal(out.decision,'HOLD_F3_WRITER_TOOL_CONTRACT');assert.equal(out.tools[0].readOnlyHint,null);assert.equal(f.counts().calls,0);
});
test('writer metadata probe sanitizes secret access failure and preserves HTTP status',async()=>{
 const f=probeFixture();f.args.cloudClient.request=async()=>{throw Object.assign(Error('TEST_SECRET_DO_NOT_EMIT'),{response:{status:403}});};
 const out=await f3ProbeWriterMcpMetadataOnly(f.args);assert.equal(out.stage,'secret_access');assert.equal(out.httpStatus,403);assert.doesNotMatch(JSON.stringify(out),/TEST_SECRET/);assert.equal(f.counts().connects,0);
});

function gtFixture(offset=1){
 const raw=JSON.parse(fs.readFileSync(root+F3_RUN2782_RECOVERY.rawPath,'utf8')),e=raw.events[0].event;
 const effectRecord=structuredClone(raw.reconciliations[0].durable.effects.find(r=>r.data.operations[0].entity.endsWith(e.visitId)).data),effect=effectRecord.operations[0];
 const original=Object.fromEntries(effect.fields.map(k=>[k,null]));Object.assign(original,{id:e.visitId,tenantId:'tya',projectId:e.projectId,periodId:e.periodId,pais:'GT',country:'GT',hrRowId:e.hrRowId,excelWorksheetFingerprint:e.worksheetFingerprint,hrSourceRevision:e.baseRevision,escenario:e.before,tipoCombo:'CXOrbia QA Combo A',shopperId:null,boleto:42,version:1,createdAt:'2026-11-24T21:44:18.680Z',updatedAt:new Date(Date.parse('2026-11-24T21:44:18.680Z')+offset).toISOString()});
 effect.expectedDigest=digest(original);
 const data={...original,escenario:e.after,version:2,updatedAt:e.createdAt,hrSyncStatus:'pending_hr',hrFieldJournalVersion:e.schemaVersion,hrPendingFields:{escenario:{eventId:e.eventId,status:'pending_hr',requestedValue:e.after,baseValue:e.before,baseRevision:e.baseRevision,eventDigest:e.eventDigest,providerAck:false}}};
 return {raw,data,effect,effectRecord,original};
}
for(const offset of [0,1,47])test('unique cryptographic match recovers original updatedAt+'+offset+'ms without mutating live data',()=>{const x=gtFixture(offset),before=JSON.stringify(x.data),result=f3VerifyRun2782GtPendingBaseline(x);assert.equal(result.originalUpdatedAt,x.original.updatedAt);assert.equal(result.expectedDigest,digest(x.original));assert.equal(JSON.stringify(x.data),before);assert.equal(result.providerWrites,0);});
for(const key of ['pais','country','boleto','shopperId','tipoCombo','hrSourceRevision'])test('GT altered original value rejects even with intact pending marker: '+key,()=>{const x=gtFixture();x.data[key]='FOREIGN_VALUE';assert.throws(()=>f3VerifyRun2782GtPendingBaseline(x),/GT_BASELINE_DIGEST_DRIFT/);});
test('GT new field rejects before hash search',()=>{const x=gtFixture();x.data.unowned='foreign';assert.throws(()=>f3VerifyRun2782GtPendingBaseline(x),/GT_BASELINE_FIELD_SET/);});
test('wrong pending value or extra pending metadata rejects',()=>{for(const patch of [{requestedValue:'foreign'},{providerAck:true},{unowned:true}]){const x=gtFixture();Object.assign(x.data.hrPendingFields.escenario,patch);assert.throws(()=>f3VerifyRun2782GtPendingBaseline(x),/GT_PENDING_MUTATION_DRIFT/);}});
test('pending version3 rejects',()=>{const x=gtFixture();x.data.version=3;assert.throws(()=>f3VerifyRun2782GtPendingBaseline(x),/GT_PENDING_MUTATION_DRIFT/);});
test('current updatedAt outside proven command window rejects',()=>{for(const value of ['2026-11-24T21:40:00.000Z','2026-11-24T21:50:00.000Z']){const x=gtFixture();x.data.updatedAt=value;assert.throws(()=>f3VerifyRun2782GtPendingBaseline(x),/GT_PENDING_UPDATED_AT/);}});
test('initial timestamp search wider than2seconds rejects',()=>{const x=gtFixture();x.effectRecord.committedAt=new Date(Date.parse(x.data.createdAt)+2001).toISOString();assert.throws(()=>f3VerifyRun2782GtPendingBaseline(x),/GT_BASELINE_TIME_PROVENANCE/);});
test('initial timestamp outside proven create interval does not match',()=>{const x=gtFixture(128);assert.throws(()=>f3VerifyRun2782GtPendingBaseline(x),/GT_BASELINE_DIGEST_DRIFT/);});
test('no independently acknowledged create proof rejects',()=>{const x=gtFixture();x.effectRecord.readbackVerified=false;assert.throws(()=>f3VerifyRun2782GtPendingBaseline(x),/GT_CREATE_PROOF/);});
