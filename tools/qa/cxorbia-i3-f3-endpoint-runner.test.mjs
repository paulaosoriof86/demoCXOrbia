import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {createHash} from 'node:crypto';
import {EventEmitter} from 'node:events';
import {createServer,request as httpRequest} from 'node:http';
import fs from 'node:fs';
import {F3_QA,assertF3EndpointScope,f3FixtureDocuments,f3FieldCommand,assertF3RemoteAck,f3OwnedCleanupPath,f3ProbeWriterMcpMetadataOnly,f3RequireWriterMetadataBeforeFixtures,f3DropEndpointResponse,f3AssertLostResponseJournal,f3AssertLostResponseReplay,f3RequireRemoteRestoredBeforeCleanup} from './cxorbia-i3-b14-isolated-provider-writer-qa.mjs';
import {validateProjectPayload} from '../../backend/runtime/cxorbia-project-command-provider-v1.mjs';
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
function fixture(){
 const headers=['fixtureId','fieldValue','eventId','eventDigest','País','ID CINEMA','CIUDAD','Shopping','Franja Horaria','Formato de Cine','Tipo de Combo','Tipo de Compra','Método de Pago','Quincena','Shopper Asignado','Telefono','Mail','Disponible a partir de','Fecha programada','Control día s/ franja horaria','Fecha realizada','Fecha Cuestionario completado','Precio de boleto','Precio de combo','Honorarios','Fecha submitido'];
 const env={CXORBIA_F3_QA_ENDPOINT_GATE:'PAULA_AUTHORIZED_ISOLATED_F3_ENDPOINT_20261124',GITHUB_REF:'refs/heads/recovery/cxorbia-phase-a-20260831',GITHUB_REPOSITORY:'paulaosoriof86/demoCXOrbia',GITHUB_RUN_ID:'45247111111',GITHUB_RUN_ATTEMPT:'1',CXORBIA_F3_QA_BASE_URL:F3_QA.baseUrl,GOOGLE_CLOUD_PROJECT:F3_QA.firebaseProject,
  CXORBIA_F3_QA_SOURCE_SHA:'a'.repeat(40),CXORBIA_F3_QA_SOURCE_TREE:'b'.repeat(40),CXORBIA_F3_QA_RUNTIME_REVISION:'cxorbia-live-hr-dev-00999-abc',CXORBIA_F3_QA_RUNTIME_DIGEST:'sha256:'+'c'.repeat(64),CXORBIA_F3_QA_HOSTING_VERSION:'sites/cxorbia-backend-dev/versions/abcdef123'};
 const countries=Object.fromEntries(F3_QA.countries.map(country=>[country,{driveId:F3_QA.driveId,itemId:F3_QA.items[country],worksheetName:'CXR_B14_QA_'+country+'_20261119',worksheetId:'qa-'+country,worksheetFingerprint:sha('qa-'+country),headerValues:headers,rowIdentityValues:country==='GT'?['Guatemala','2022002','C. Miraflores']:['Honduras','2052001','C. Las Cascadas Honduras'],providerReadStatus:200,providerExecutionId:'e'.repeat(32),observedAt:'2026-11-24T12:00:00.000Z'}]));
 return {env,manifest:{schemaVersion:'cxorbia.f3.remote-fixture.v1',tenantId:'tya',projectId:F3_QA.projectId,periodId:F3_QA.periodId,countries}};
}
test('F3 exact QA scope yields deterministic run ownership without initializing any provider',()=>{const h=fixture();assert.deepEqual(assertF3EndpointScope(h.env,h.manifest),{runId:'45247111111',runAttempt:'1',owner:'f3-qa-45247111111-1'});});
test('F3 accepts Graph numeric cinema IDs in both countries without changing raw evidence',()=>{
 const h=fixture();for(const country of F3_QA.countries)h.manifest.countries[country].rowIdentityValues[1]=Number(h.manifest.countries[country].rowIdentityValues[1]);
 const before=JSON.stringify(h.manifest);assert.equal(assertF3EndpointScope(h.env,h.manifest).owner,'f3-qa-45247111111-1');assert.equal(JSON.stringify(h.manifest),before);
});
for(const value of [2022003,['2022002'],{toString:()=> '2022002'},null,true,2022002.5])test('F3 rejects foreign or nonscalar cinema identity '+JSON.stringify(value),()=>{
 const h=fixture();h.manifest.countries.GT.rowIdentityValues[1]=value;assert.throws(()=>assertF3EndpointScope(h.env,h.manifest),/F3_QA_HEADER_IDENTITY/);
});
for(const [key,value]of [['CXORBIA_F3_QA_ENDPOINT_GATE',''],['GITHUB_REF','refs/heads/main'],['GITHUB_REPOSITORY','another/repo'],['CXORBIA_F3_QA_BASE_URL','https://tya-plataforma.web.app'],['GOOGLE_CLOUD_PROJECT','tya-plataforma'],['CXORBIA_F3_QA_RUNTIME_DIGEST','tag-latest'],['CXORBIA_F3_QA_SOURCE_SHA','latest']])test('F3 rejects unauthorized or unpinned '+key,()=>{const h=fixture();h.env[key]=value;assert.throws(()=>assertF3EndpointScope(h.env,h.manifest));});
for(const mutate of [h=>h.manifest.projectId='cinepolis',h=>h.manifest.countries.GT.worksheetName='NOVIEMBRE 26',h=>h.manifest.countries.GT.worksheetFingerprint='f'.repeat(64),h=>h.manifest.countries.GT.providerReadStatus=201,h=>h.manifest.countries.GT.rowIdentityValues[1]='foreign',h=>h.manifest.countries.GT.headerValues.push('drift')])test('F3 remote manifest drift stops all setup writes',()=>{const h=fixture();mutate(h);assert.throws(()=>assertF3EndpointScope(h.env,h.manifest));});
test('F3 generated private bindings satisfy real project contract and exact 26-column range',()=>{
 const h=fixture(),owner=assertF3EndpointScope(h.env,h.manifest).owner,docs=f3FixtureDocuments(h.manifest,owner),project=docs.find(x=>x.path.includes('/projects/')).data;
 assert.equal(validateProjectPayload(project).ok,true);assert.equal(project.operationalSource.providerBindingId,undefined);assert.equal(project.operationalSource.mappingRef,undefined);
 for(const row of docs.filter(x=>x.path.includes('/integrationSettings/'))){assert.equal(row.data.readRangeAddress,'A1:Z2');assert.equal(row.data.hrWritesEnabled,true);assert.equal(row.data.qaOwner,owner);assert.deepEqual(row.data.fieldWriter.allowedFields,F3_QA.fields);assert.equal(row.data.periodSheets[0].periodId,F3_QA.periodId);}
 assert.equal(docs.length,7);assert.equal(docs.some(x=>x.path.includes('/projects/cinepolis')),false);
});
test('F3 command freezes exact raw null and source revision for that visit',()=>{
 const visit={id:F3_QA.visits.HN,tenantId:'tya',projectId:F3_QA.projectId,periodId:F3_QA.periodId,pais:'HN',hrRowId:'CXR_B14_QA_HN_20261119!2',agendada:null};
 const command=f3FieldCommand({owner:'f3-qa-1-1',serial:1,visit,revision:'a'.repeat(64),version:3,fieldKey:'agendada',value:'2026-11-29'});visit.agendada='changed';assert.equal(command.payload.baseFieldValues.agendada,null);assert.equal(command.periodId,F3_QA.periodId);assert.equal(command.expectedVersion,3);
 assert.throws(()=>f3FieldCommand({owner:'x',serial:1,visit:{...visit,projectId:'cinepolis'},revision:'a'.repeat(64),version:3,fieldKey:'agendada',value:null}));
});
test('F3 endpoint cannot claim success from Firestore-only ACK or pending provider',()=>{
 const ack={ok:true,status:'committed',hrProviderAck:true,readbackVerified:true,successUiAllowed:true,hrFieldEventIds:['hfe-'+'e'.repeat(64)]};assert.equal(assertF3RemoteAck(ack),ack.hrFieldEventIds[0]);
 for(const patch of [{hrProviderAck:false},{readbackVerified:false},{status:'pending_hr'},{successUiAllowed:false},{hrFieldEventIds:[]}])assert.throws(()=>assertF3RemoteAck({...ack,...patch}));
});
test('F3 cleanup only owns isolated paths and command IDs explicitly journaled in the run',()=>{
 const owner='f3-qa-45247111111-1';assert.equal(f3OwnedCleanupPath('tenants/tya/projects/'+F3_QA.projectId+'/hrFieldEvents/hfe-qa',owner),true);
 for(const p of ['tenants/tya/projects/cinepolis/visits/real','tenants/other/projects/'+F3_QA.projectId,'tenants/tya/users/real-admin','tenants/tya/shopperIdentityCrosswalk/shopper_gt_unknown'])assert.equal(f3OwnedCleanupPath(p,owner),false);
 const receipt='tenants/tya/commandReceipts/'+'a'.repeat(40);assert.equal(f3OwnedCleanupPath(receipt+'/effects/1',owner,[receipt]),true);
});
test('F3 live branch uses real authenticated endpoint, bounded replay and readback without logging credentials',()=>{
 const source=fs.readFileSync(new URL('./cxorbia-i3-b14-isolated-provider-writer-qa.mjs',import.meta.url),'utf8');
 assert.ok(source.includes("F3_QA.baseUrl+'/v1/cxorbia/commands'"));assert.ok(source.includes("F3_QA.baseUrl+'/api/tenants/tya/projects/'"));assert.ok(source.includes('for(let attempt=0;attempt<3;attempt++)'));
 assert.ok(source.includes('F3_QA_ACTIVE_REMOTE_LEASE'));assert.ok(source.includes('item.event=event;item.delivery='));assert.ok(source.includes('F3_QA_CLEANUP_DRIFT'));
 assert.ok(!source.includes('console.log(token'));assert.ok(!source.includes('console.log(custom'));assert.ok(!source.includes('recursiveDelete('));assert.ok(source.includes('PASS_B14_ISOLATED_PROVIDER_ACK_AND_READBACK_ONLY'));
});

function endpointMetadataFixture({present=false,hint}={}){
 const counts={connect:0,list:0,call:0,close:0},properties=Object.fromEntries(['protocolVersion','operation','eventId','eventDigest','fieldKey','periodId','bindingFingerprint'].map(k=>[k,{}]));
 const tool={name:'qa_writer',annotations:present?{readOnlyHint:hint}:{},inputSchema:{properties}},list={tools:[tool]};
 class Client{async connect(){counts.connect++;}async listTools(){counts.list++;return list;}async callTool(){counts.call++;throw Error('UNEXPECTED_WRITE');}async close(){counts.close++;}}
 class StreamableHTTPClientTransport{constructor(){}}
 return {counts,list,args:{cloudClient:{request:async()=>({data:{payload:{data:Buffer.from('LOCAL_NOT_A_CREDENTIAL').toString('base64')}}})},Client,StreamableHTTPClientTransport}};
}
for(const [name,present,hint,accept,type] of [['omitted',false,undefined,true,'undefined'],['explicit undefined',true,undefined,true,'undefined'],['false',true,false,true,'boolean'],['null',true,null,false,'null'],['true',true,true,false,'boolean'],['string',true,'false',false,'string'],['number',true,0,false,'number']])test('F3 endpoint metadata preflight '+name+' preserves presence/type and stops incompatible fixture setup',async()=>{
 const f=endpointMetadataFixture({present,hint}),probe=await f3ProbeWriterMcpMetadataOnly(f.args);let setupWrites=0;
 const proceed=()=>{f3RequireWriterMetadataBeforeFixtures(probe);setupWrites++;};
 if(accept)proceed();else assert.throws(proceed,/PROVIDER_FAILURE:F3_QA_WRITER_METADATA_CONTRACT/);
 assert.equal(setupWrites,accept?1:0);assert.equal(probe.tools[0].readOnlyHintPresent,present);assert.equal(probe.tools[0].readOnlyHintType,type);assert.deepEqual(f.counts,{connect:1,list:1,call:0,close:1});assert.doesNotMatch(JSON.stringify(probe),/LOCAL_NOT_A_CREDENTIAL/);
});
for(const [name,mutate] of [['cursor',f=>f.list.nextCursor='more'],['no tools',f=>f.list.tools=[]],['missing property',f=>delete f.list.tools[0].inputSchema.properties.eventId],['transport failure',f=>f.args.cloudClient.request=async()=>{throw Object.assign(Error('secret URL TOKEN'),{status:503});}]])test('F3 endpoint metadata preflight fail-closed '+name,async()=>{
 const f=endpointMetadataFixture();mutate(f);const probe=await f3ProbeWriterMcpMetadataOnly(f.args);assert.throws(()=>f3RequireWriterMetadataBeforeFixtures(probe),/F3_QA_WRITER_METADATA_CONTRACT/);assert.equal(f.counts.call,0);assert.doesNotMatch(JSON.stringify(probe),/secret URL TOKEN|LOCAL_NOT_A_CREDENTIAL/);
});
test('F3 endpoint calls metadata preflight before any fixture creation, independently from the historical cleanup wrapper',()=>{
 const source=fs.readFileSync(new URL('./cxorbia-i3-b14-isolated-provider-writer-qa.mjs',import.meta.url),'utf8'),start=source.indexOf('async function runF3EndpointProbe(){');
 const body=source.slice(start,source.indexOf('async function runF3Run2768',start)>start?source.indexOf('async function runF3Run2768',start):source.indexOf('export const F3_RUN2782',start));
 assert.ok(body.indexOf('receipt.writerProbe=await f3ProbeWriterMcpMetadataOnly')>0);
 assert.ok(body.indexOf('f3RequireWriterMetadataBeforeFixtures(receipt.writerProbe)')<body.indexOf('baselineReady=true'));
 assert.ok(body.indexOf('f3RequireWriterMetadataBeforeFixtures(receipt.writerProbe)')<body.indexOf('await db.doc(rec.path).create(rec.data)'));
 assert.ok(!body.includes('runF3Run2782Recovery()'));
});

// Client response-loss contract in the existing F3 QA gate.
{
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const sha=v=>createHash('sha256').update(typeof v==='string'?v:JSON.stringify(stable(v))).digest('hex');
const owner='f3-qa-49999999999-1';
function fixture(){
  const command=f3FieldCommand({owner,serial:1,visit:{id:F3_QA.visits.GT,tenantId:'tya',projectId:F3_QA.projectId,periodId:F3_QA.periodId,country:'GT',
    hrRowId:'CXR_B14_QA_GT_20261119!2',escenario:'CXOrbia QA Escenario A'},revision:'a'.repeat(64),version:1,fieldKey:'escenario',value:'CXOrbia QA Escenario B'});
  const headKey=sha(['tya',F3_QA.projectId,F3_QA.periodId,'GT',F3_QA.visits.GT,'escenario']),eventId='hfe-'+sha([headKey,command.idempotencyKey]),
    commandReceiptId=sha(command.tenantId+'\0'+command.projectId+'\0'+command.periodId+'\0'+command.idempotencyKey).slice(0,40);
  const event={schemaVersion:'cxorbia.hr-field-event.v1',eventId,commandReceiptId,idempotencyKey:command.idempotencyKey,origin:'platform',actorUid:owner+'-admin',
    tenantId:'tya',projectId:F3_QA.projectId,periodId:F3_QA.periodId,countryCode:'GT',visitId:F3_QA.visits.GT,hrRowId:command.payload.hrRowId,fieldKey:'escenario',
    before:'CXOrbia QA Escenario A',after:'CXOrbia QA Escenario B',baseRevision:command.payload.sourceRevision};
  event.eventDigest=sha(event);
  const delivery={eventId,eventDigest:event.eventDigest,status:'committed',providerAck:true,writeAckVerified:true,readbackVerified:true,
    remoteWriteRequests:1,providerExecutionId:'b'.repeat(32)};
  const snap=data=>({exists:true,data,updateTime:{seconds:100,nanoseconds:5}});
  const proof={commandReceipt:snap({status:'committed',providerAck:true,commandDigest:sha(command),actorUid:owner+'-admin',commandType:command.commandType,
      entityId:command.entityId,hrFieldEventIds:[eventId]}),
    event:snap(event),delivery:snap(delivery),head:snap({latestEventId:eventId,pendingEventId:null,leaseOwner:null,leaseUntil:0,confirmedValue:event.after}),
    visit:snap({escenario:event.after,hrManaged:{escenario:event.after},hrPendingFields:{},hrSyncStatus:'synced'}),
    audit:snap({actorUid:owner+'-admin',idempotencyKey:command.idempotencyKey,commandType:command.commandType,tenantId:'tya',projectId:F3_QA.projectId,
      periodId:F3_QA.periodId,entityId:command.entityId}),
    attempts:[{id:'first-effect',...snap({attemptId:'first',...delivery})},{id:'first-intent',...snap({attemptId:'first',eventId,eventDigest:event.eventDigest,recoveryOnly:false})}]};
  const transport={requestBodyFinished:true,responseHeadersObserved:true,httpStatus:200,bodyBytesConsumed:0,semanticAckObserved:false,
    clientConnectionDestroyed:true,commandDigest:sha(command),idempotencyKey:command.idempotencyKey};
  const response={status:200,body:{ok:true,status:'committed',hrProviderAck:true,readbackVerified:true,successUiAllowed:true,hrFieldEventIds:[eventId],
    idempotentReplay:true,providerWrites:0,idempotencyKey:command.idempotencyKey}};
  return {command,owner,proof,transport,response};
}
function eventTransport({httpStatus=200,finish=true,error=false}={}){
  const calls=[],request=new EventEmitter(),response=new EventEmitter();
  response.statusCode=httpStatus;response.pause=()=>{calls.push('pause');};response.destroy=()=>{calls.push('destroy-response');};
  response.read=()=>{throw Error('BODY_CONSUMED');};response.resume=()=>{throw Error('BODY_CONSUMED');};
  request.destroy=()=>{calls.push('destroy-request');};
  request.end=body=>{calls.push({sent:JSON.parse(body)});queueMicrotask(()=>{
    if(finish)request.emit('finish');if(error){request.emit('error',Error('PRIVATE_TRANSPORT_DETAIL'));return;}request.emit('response',response);
  });};
  const requestImpl=(url,options)=>{calls.push({url,options});return request;};
  return {requestImpl,calls};
}
test('real helper closes response before consuming body; headers/status are not semantic ACK',async()=>{
  const h=fixture(),wire=eventTransport(),proof=await f3DropEndpointResponse({...h,token:'LOCAL_DUMMY_NOT_A_SECRET',requestImpl:wire.requestImpl});
  assert.equal(proof.bodyBytesConsumed,0);assert.equal(proof.semanticAckObserved,false);assert.equal(proof.clientConnectionDestroyed,true);
  assert.equal(wire.calls.filter(x=>x.sent).length,1);assert.deepEqual(wire.calls.find(x=>x.sent).sent,h.command);
  assert.equal(wire.calls[0].options.headers['Idempotency-Key'],h.command.idempotencyKey);
  assert.equal(wire.calls[0].url,F3_QA.baseUrl+'/v1/cxorbia/commands');assert.deepEqual(wire.calls.slice(-3),['pause','destroy-response','destroy-request']);
  assert.doesNotMatch(JSON.stringify(proof),/LOCAL_DUMMY_NOT_A_SECRET|Bearer|Authorization|headers/);
  assert.equal(f3AssertLostResponseJournal({...h,transport:proof}).eventId,h.proof.event.data.eventId);
});
for(const [name,mutate] of [
  ['real project',c=>c.projectId='cinepolis'],['other key',c=>c.idempotencyKey+='-other'],['HN',c=>c.payload.countryCode='HN'],
  ['second field',c=>c.payload.patch.tipoCombo='other'],['foreign base',c=>c.payload.baseFieldValues.escenario='unexpected']
])test('fault injector rejects '+name+' before opening a connection',async()=>{
  const h=fixture();mutate(h.command);let opened=0;
  await assert.rejects(f3DropEndpointResponse({...h,token:'dummy',requestImpl:()=>{opened++;}}),/F3_LOST_RESPONSE_SCOPE/);assert.equal(opened,0);
});
test('transport failure before headers is not counted as lost committed ACK and leaks no private error',async()=>{
  const h=fixture(),wire=eventTransport({error:true});
  await assert.rejects(f3DropEndpointResponse({...h,token:'dummy',requestImpl:wire.requestImpl}),error=>{
    assert.equal(error.message,'ENVIRONMENT_FAILURE:F3_LOST_RESPONSE_TRANSPORT');assert.equal(error.transportObservation.responseHeadersObserved,false);
    assert.equal(error.transportObservation.semanticAckObserved,false);assert.doesNotMatch(JSON.stringify(error),/PRIVATE_TRANSPORT_DETAIL|dummy/);return true;
  });
});
test('response without finished request and response503 cannot satisfy the ACK-loss proof',async()=>{
  const h=fixture();await assert.rejects(f3DropEndpointResponse({...h,token:'dummy',requestImpl:eventTransport({finish:false}).requestImpl}),/BODY_NOT_SENT/);
  const transport=await f3DropEndpointResponse({...h,token:'dummy',requestImpl:eventTransport({httpStatus:503}).requestImpl});
  assert.throws(()=>f3AssertLostResponseJournal({...h,transport}),/NOT_INJECTED/);
});
test('independent exact journal establishes original commit; same-event replay leaves remote write count unknown',()=>{
  const h=fixture(),result=f3AssertLostResponseReplay({...h,before:h.proof,after:structuredClone(h.proof)});
  assert.equal(result.eventId,h.proof.event.data.eventId);assert.equal(result.declaredOriginalRemoteWriteRequests,1);
  assert.equal(result.newJournalAttempts,0);assert.equal(result.newLocalCommandWrites,0);assert.equal(result.remoteReplayWrites,null);
  assert.equal(result.remoteReplayWriteCountProven,false);assert.equal(result.remoteExecutionAuditRequired,true);
});
for(const [name,mutate] of [
  ['consumed body',h=>h.transport.bodyBytesConsumed=1],['observed ACK',h=>h.transport.semanticAckObserved=true],
  ['foreign command digest',h=>h.proof.commandReceipt.data.commandDigest='f'.repeat(64)],
  ['foreign actor',h=>h.proof.commandReceipt.data.actorUid='other'],['unrelated event',h=>h.proof.commandReceipt.data.hrFieldEventIds=['hfe-'+'f'.repeat(64)]],
  ['tampered journal',h=>h.proof.event.data.after='different'],['unknown remote count',h=>h.proof.delivery.data.remoteWriteRequests=null],
  ['zero declared original writes',h=>h.proof.delivery.data.remoteWriteRequests=0],['missing effect',h=>h.proof.attempts=h.proof.attempts.slice(1)],
  ['extra delivery attempt',h=>h.proof.attempts.push(structuredClone(h.proof.attempts[1]))],
  ['live lease',h=>h.proof.head.data.leaseOwner='running'],['not settled',h=>h.proof.visit.data.hrSyncStatus='pending_hr']
])test('independent commit proof rejects '+name,()=>{const h=fixture();mutate(h);assert.throws(()=>f3AssertLostResponseJournal(h));});
for(const [name,mutate] of [
  ['changed timestamp only',h=>h.after.delivery.updateTime.nanoseconds++],['changed journal',h=>h.after.audit.data.changed=true],
  ['new replay key',h=>h.response.body.idempotencyKey+='-new'],['unknown local write count',h=>delete h.response.body.providerWrites],
  ['nonzero local write count',h=>h.response.body.providerWrites=1],['not idempotent',h=>h.response.body.idempotentReplay=false]
])test('replay proof rejects '+name,()=>{
  const h=fixture();h.before=h.proof;h.after=structuredClone(h.proof);mutate(h);assert.throws(()=>f3AssertLostResponseReplay(h),/REPLAY_MUTATED/);
});
test('lost response is a remote attempt that preserves fixture until exact restoration',()=>{
  const r={remoteCommandAttempts:[{state:'RESPONSE_BODY_LOST_RESTORE_STILL_REQUIRED'}],remoteValuesRestored:false};
  assert.throws(()=>f3RequireRemoteRestoredBeforeCleanup(r),/REMOTE_RESTORE_REQUIRED/);
  r.remoteValuesRestored=true;assert.equal(f3RequireRemoteRestoredBeforeCleanup(r),'REMOTE_VALUES_RESTORED');
});
test('runner uses same existing first command, independent reads before a single replay, and preserves Make-side limitation',()=>{
  const source=fs.readFileSync(new URL('./cxorbia-i3-b14-isolated-provider-writer-qa.mjs',import.meta.url),'utf8'),
    body=source.slice(source.indexOf('const postWithLostClientResponse='),source.indexOf('let serial=0;'));
  assert.match(source,/loseClientResponse:country==='GT'&&fieldKey==='escenario'/);
  assert.ok(body.indexOf('await readLive()')<body.indexOf('response=await send(command)'));
  assert.equal((body.match(/await send\(command\)/g)||[]).length,1);assert.doesNotMatch(body,/postWithBoundedRecovery|idempotencyKey\s*=/);
  assert.match(body,/requiredObservedThroughUtc/);assert.match(body,/scenarioId:10199316/);assert.match(source,/provider_response_loss_live_fault_injection/);
});

test('loopback only: client loses first real HTTP body, independent committed state precedes exact replay',async t=>{
  const h=fixture();let physicalWrites=0,committed=null,requests=0,firstBodyTimer;
  const server=createServer((req,res)=>{
    let text='';req.on('data',c=>{text+=c;});req.on('end',()=>{
      const command=JSON.parse(text);assert.deepEqual(command,h.command);assert.equal(req.headers['idempotency-key'],h.command.idempotencyKey);requests++;
      if(!committed){physicalWrites++;committed=structuredClone(h.proof);res.writeHead(200,{'Content-Type':'application/json'});res.flushHeaders();
        firstBodyTimer=setTimeout(()=>res.end(JSON.stringify({...h.response.body,idempotentReplay:false,providerWrites:8})),50);
      }else{res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(h.response.body));}
    });
  });
  try{await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});}
  catch(error){if(['EACCES','EPERM'].includes(error.code)){t.skip('Loopback sockets denied; event-boundary doubles above still ran.');return;}throw error;}
  try{
    const localUrl='http://127.0.0.1:'+server.address().port+'/v1/cxorbia/commands';
    const requestImpl=(target,options)=>{assert.equal(target,F3_QA.baseUrl+'/v1/cxorbia/commands');return httpRequest(localUrl,options);};
    const transport=await f3DropEndpointResponse({...h,token:'LOCAL_TEST_ONLY',requestImpl}),before=structuredClone(committed);
    assert.equal(requests,1);assert.equal(physicalWrites,1);assert.equal(transport.bodyBytesConsumed,0);assert.equal(transport.semanticAckObserved,false);
    f3AssertLostResponseJournal({...h,transport,proof:before});assert.equal(committed.visit.data.escenario,h.command.payload.patch.escenario);
    const response=await new Promise((resolve,reject)=>{const req=httpRequest(localUrl,{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':h.command.idempotencyKey}},res=>{
      let body='';res.on('data',chunk=>{body+=chunk;});res.on('end',()=>resolve({status:res.statusCode,body:JSON.parse(body)}));
    });req.on('error',reject);req.end(JSON.stringify(h.command));});
    const result=f3AssertLostResponseReplay({...h,transport,before,after:committed,response});
    assert.equal(requests,2);assert.equal(physicalWrites,1);assert.equal(result.newJournalAttempts,0);
    // The loopback knows its own counter; a future real Make run still needs an independent audit.
    assert.equal(result.remoteReplayWrites,null);
  }finally{clearTimeout(firstBodyTimer);server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});

}
