import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import {F3_QA,assertF3EndpointScope,f3FixtureDocuments,f3FieldCommand,assertF3RemoteAck,f3OwnedCleanupPath,f3ProbeWriterMcpMetadataOnly,f3RequireWriterMetadataBeforeFixtures} from './cxorbia-i3-b14-isolated-provider-writer-qa.mjs';
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
