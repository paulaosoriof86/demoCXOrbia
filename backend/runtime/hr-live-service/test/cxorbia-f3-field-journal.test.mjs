import test from 'node:test';
import assert from 'node:assert/strict';
import {createOperationalCommandProvider,dispatchOperationalHrFields} from '../../cxorbia-operational-command-provider-v1.mjs';
import {executeExcelFieldEventThroughMake} from '../../cxorbia-make-graph-provider-v1.mjs';
const clone=v=>v===undefined?undefined:structuredClone(v);
const recursiveMerge=(a,b)=>Object.fromEntries([...new Set([...Object.keys(a||{}),...Object.keys(b||{})])].map(k=>[k,Object.hasOwn(b||{},k)?b[k]&&typeof b[k]==='object'&&!Array.isArray(b[k])?recursiveMerge(a?.[k],b[k]):clone(b[k]):clone(a[k])]));
class Ref{constructor(db,path){this.db=db;this.path=path;this.id=path.split('/').at(-1);}collection(k){return new Collection(this.db,this.path+'/'+k);}async get(){return snap(this,this.db.store.get(this.path));}}
class Collection{constructor(db,path){this.db=db;this.path=path;}doc(k){return new Ref(this.db,this.path+'/'+k);}}
const snap=(ref,value)=>({id:ref.id,exists:value!==undefined,data:()=>clone(value)});
class DB{
 constructor(){this.store=new Map();this.writes=0;}
 collection(k){return new Collection(this,k);}
 async runTransaction(fn){const rows=new Map([...this.store].map(([k,v])=>[k,clone(v)]));let writes=0;
  const tx={get:async ref=>{assert.equal(writes,0,'Firestore reads must precede writes');return snap(ref,rows.get(ref.path));},
   set:(ref,value,options={})=>{writes++;rows.set(ref.path,options.mergeFields?{...rows.get(ref.path),...clone(value)}:options.merge?recursiveMerge(rows.get(ref.path),value):clone(value));},
   create:(ref,value)=>{assert.ok(!rows.has(ref.path));writes++;rows.set(ref.path,clone(value));},delete:ref=>{writes++;rows.delete(ref.path);}};
  const result=await fn(tx);this.store=rows;this.writes+=writes;return result;
 }
}
const period='project-a-2025-06',visitId='hr_visit_a',path='tenants/tenant-a/projects/project-a/visits/'+visitId;
const policy={schemaVersion:'cxorbia.operational.provider-policy.v1',enabled:true,allowedTenantIds:['tenant-a'],allowedProjectIds:['project-a'],conflictPolicy:'review_no_silent_overwrite',hrWrites:false,makeCalls:false,geminiCalls:false,storageWrites:false,paymentWrites:false};
function fixture(){
 const db=new DB(),actor={uid:'operator-1',tenantId:'tenant-a',role:'admin',authNamespace:'staff',projectIds:['project-a']};
 db.store.set('tenants/tenant-a/users/operator-1',{...actor,active:true});
 db.store.set('tenants/tenant-a/shoppers/shopper-qa',{tenantId:'tenant-a',pais:'GT',nombre:'QA Shopper Exact'});
 const row={cinemaId:'2022002',sucursal:'C. Miraflores',id:visitId,visitId,tenantId:'tenant-a',projectId:'project-a',periodId:period,periodKey:'2025-06',pais:'GT',country:'GT',
  hrRowId:'JUNIO 25!2',sourceTab:'JUNIO 25',sourceRow:2,excelWorksheetFingerprint:'b'.repeat(64),escenario:'Boletería',tipoCombo:'A',
  shopperId:null,estado:'disponible',canonicalFacets:{available:true,assigned:false},version:1};
 db.store.set(path,clone(row));
 const snapshot={sourceSafe:true,imported:false,firestoreWrites:0,tenantId:'tenant-a',projectId:'project-a',source:{providerType:'excel_online'},
  periods:[{id:period,periodId:period,projectId:'project-a',key:'2025-06'}],visits:[row]};
 const provider=()=>createOperationalCommandProvider({db,auth:{verifyIdToken:async()=>actor},policy,hrSnapshot:snapshot,hrRevision:'a'.repeat(64),hrFieldJournalEnabled:true});
 const command={version:'cxorbia-command-adapter-v1',commandType:'visit.hr.fields.update',entityType:'visit',entityId:visitId,
  tenantId:'tenant-a',projectId:'project-a',periodId:period,expectedVersion:1,idempotencyKey:'fixture-field-command-1',
  authorization:{providerEnforcementRequired:true,permission:'visit.hr.fields.update'},
  payload:{visitId,hrRowId:row.hrRowId,patch:{escenario:'APP',tipoCombo:'B'},baseFieldValues:{escenario:'Boletería',tipoCombo:'A'}}};
 return {db,provider,command,snapshot,events:()=>[...db.store].filter(([p])=>p.includes('/hrFieldEvents/')).map(([,v])=>clone(v))};
}
function makeFixture(){let writes=0,reads=0,remote=new Map(),loseResponse=false,staleReads=0;
 const run=async req=>{
  const key=req.fieldKey,existing=remote.get(key),base={...req,readStatus:200,preconditionAllowed:true,observedValue:existing?.value??req.expectedBeforeValue,
   remoteReceiptVerified:!!existing,remoteWriteStatus:existing?200:null,remoteEventId:existing?.eventId??null,remoteEventDigest:existing?.eventDigest??null,
   currentEventId:existing?.eventId??null,providerExecutionId:'e'.repeat(32),observedHeaderValues:req.expectedHeaderValues,observedRowIdentityValues:req.expectedRowIdentityValues};
  if(req.operation==='inspect_event'){
   reads++;if(existing&&staleReads>0){staleReads--;return {...base,observedValue:req.expectedBeforeValue,currentEventId:null,remoteReceiptVerified:false};}
   return base;
  }
  assert.equal(req.operation,'write_field');writes++;remote.set(key,{value:req.fieldValue,eventId:req.eventId,eventDigest:req.eventDigest});
  if(loseResponse){loseResponse=false;throw new Error('simulated lost response');}
  return {...base,writeStatus:200,writeAttempted:true,status:'ACK_READBACK_PENDING'};
 };
 const target=e=>({...e,schemaVersion:'cxorbia.hr-field-target.v1',resolvedFromPrivateBinding:true,
  bindingFingerprint:'c'.repeat(64),rowIdentityFingerprint:'d'.repeat(64),headerFingerprint:'f'.repeat(64),driveId:'qa-drive',itemId:'qa-item',worksheetId:'qa-sheet',rangeAddress:'K2',
  expectedBeforeValue:e.before,fieldValue:e.after,expectedHeaderValues:['Field'],expectedRowIdentityValues:['id','branch'],headerRangeAddress:'A1:A1',rowRangeAddress:'A2:A2',rowIdentityColumnIndexes:[0,1],writeCapability:{enabled:true,protocolVersion:'cxorbia.hr-field-transport.v1',
   remoteEventReceipt:true,observedBaseGuard:true,allowedFields:['escenario','tipoCombo','shopperId']}});
 return {run,target,writes:()=>writes,reads:()=>reads,remote,loseNextResponse:()=>{loseResponse=true;},staleReads:n=>{staleReads=n;},
  write:(e,options)=>executeExcelFieldEventThroughMake({event:e,target:target(e),runScenario:run,...options})};
}
test('F3 journal creates independent field intents for the exact historical period; no UI success before remote ACK',async()=>{
 const h=fixture(),r=await h.provider().execute('verified',h.command);
 assert.equal(r.status,'pending_hr');assert.equal(r.localCommitted,true);assert.equal(r.providerAck,false);assert.equal(r.successUiAllowed,false);
 const events=h.events();assert.equal(events.length,2);assert.ok(events.every(e=>e.periodId===period&&e.origin==='platform'&&e.actorUid==='operator-1'));
 assert.deepEqual(events.map(e=>[e.fieldKey,e.before,e.after]),[['escenario','Boletería','APP'],['tipoCombo','A','B']]);
 const before=h.db.writes,replay=await h.provider().execute('verified',h.command);assert.equal(replay.idempotentReplay,true);assert.equal(h.db.writes,before);assert.deepEqual(replay.hrFieldEventIds,r.hrFieldEventIds);
});
test('F3 journal rejects a changed payload under the same idempotency key',async()=>{
 const h=fixture();await h.provider().execute('verified',h.command);h.command.payload.patch.tipoCombo='C';const before=h.db.writes;
 const r=await h.provider().execute('verified',h.command);assert.equal(r.code,'OPS_IDEMPOTENCY_KEY_REUSED_DIFFERENT_PAYLOAD');assert.equal(h.db.writes,before);
});
test('F3 journal rejects stale per-field base and creates zero intent/visit writes',async()=>{
 const h=fixture();h.command.payload.baseFieldValues.escenario='old source';const before=h.db.writes;
 const r=await h.provider().execute('verified',h.command);assert.equal(r.code,'OPS_HR_FIELD_BASE_CONFLICT');assert.equal(h.db.writes,before);assert.equal(h.events().length,0);
});
test('F3 journal does not overwrite an unsettled field with a different command',async()=>{
 const h=fixture();await h.provider().execute('verified',h.command);h.command.idempotencyKey='second-command';h.command.expectedVersion=2;
 const before=h.db.writes,r=await h.provider().execute('verified',h.command);assert.equal(r.code,'OPS_HR_FIELD_PREDECESSOR_UNSETTLED');assert.equal(h.db.writes,before);
});
test('F3 existing assignment command queues the same field journal instead of claiming remote success',async()=>{
 const h=fixture();h.command.commandType='visit.assign';h.command.authorization.permission='visit.assign';h.command.payload={visitId,hrRowId:h.snapshot.visits[0].hrRowId,shopperId:'shopper-qa',assignmentSource:'platform',baseFieldValues:{shopperId:null}};
 const r=await h.provider().execute('verified',h.command);assert.equal(r.status,'pending_hr');assert.equal(h.events()[0].fieldKey,'shopperId');assert.equal(h.events()[0].after,'shopper-qa');
});
test('F3 provider ACK waits for separately invoked readback; stale immediate reads cause no second PATCH',async()=>{
 const h=fixture(),local=await h.provider().execute('verified',h.command),m=makeFixture();m.staleReads(1);
 const r=await dispatchOperationalHrFields({db:h.db,command:h.command,result:local,writeField:m.write});
 assert.equal(r.ok,true);assert.equal(r.hrProviderAck,true);assert.equal(r.successUiAllowed,true);assert.equal(m.writes(),2);assert.ok(m.reads()>=5);
 assert.deepEqual(h.db.store.get(path).hrPendingFields,{});
 const replay=await h.provider().execute('verified',h.command),again=await dispatchOperationalHrFields({db:h.db,command:h.command,result:replay,writeField:m.write});
 assert.equal(again.hrProviderAck,true);assert.equal(m.writes(),2);
});
test('F3 lost response recovers from exact remote receipt without repeating a PATCH',async()=>{
 const h=fixture();h.command.payload.patch={escenario:'APP'};const local=await h.provider().execute('verified',h.command),m=makeFixture();m.loseNextResponse();
 const first=await dispatchOperationalHrFields({db:h.db,command:h.command,result:local,writeField:m.write});assert.equal(first.status,'pending_hr');assert.equal(first.successUiAllowed,false);assert.equal(m.writes(),1);
 const replay=await h.provider().execute('verified',h.command),second=await dispatchOperationalHrFields({db:h.db,command:h.command,result:replay,writeField:m.write});
 assert.equal(second.hrProviderAck,true);assert.equal(second.successUiAllowed,true);assert.equal(m.writes(),1);
});
test('F3 plain reflection without remote event receipt never becomes remote write ACK',async()=>{
 const h=fixture();h.command.payload.patch={escenario:'APP'};await h.provider().execute('verified',h.command);const e=h.events()[0],m=makeFixture();
 const reply=await executeExcelFieldEventThroughMake({event:e,target:m.target(e),recoveryOnly:true,
  runScenario:async req=>({...req,readStatus:200,observedValue:'APP',observedHeaderValues:req.expectedHeaderValues,observedRowIdentityValues:req.expectedRowIdentityValues,remoteReceiptVerified:false,currentEventId:null})});
 assert.equal(reply.providerAck,false);assert.equal(reply.status,'pending_hr');assert.equal(reply.providerWriteRequests,0);
});
test('F3 remote changed base yields explicit conflict with zero write requests',async()=>{
 const h=fixture();h.command.payload.patch={escenario:'APP'};const local=await h.provider().execute('verified',h.command),m=makeFixture();
 m.remote.set('escenario',{value:'KIOSCO',eventId:'newer-external',eventDigest:'d'.repeat(64)});
 const r=await dispatchOperationalHrFields({db:h.db,command:h.command,result:local,writeField:m.write});
 assert.equal(r.status,'conflict');assert.equal(r.successUiAllowed,false);assert.equal(m.writes(),0);assert.equal(h.db.store.get(path).hrPendingFields.escenario.status,'conflict');
});
test('F3 foreign scope ACK is never accepted',async()=>{
 const h=fixture();h.command.payload.patch={escenario:'APP'};const local=await h.provider().execute('verified',h.command),m=makeFixture();
 const r=await dispatchOperationalHrFields({db:h.db,command:h.command,result:local,writeField:async(e,o)=>({...await m.write(e,o),periodId:'foreign-period'})});
 assert.equal(r.status,'pending_hr');assert.equal(r.hrProviderAck,false);assert.equal(r.successUiAllowed,false);
});
test('F3 matching HR echo preserves pending intent, appends observation and invents no edit or write ACK',async()=>{
 const h=fixture();h.command.payload.patch={escenario:'APP'};await h.provider().execute('verified',h.command);
 const remote=clone(h.snapshot);remote.visits[0].escenario='APP';
 await h.provider().reconcileSnapshot(remote,{sourceRevision:'b'.repeat(64)});
 assert.equal(h.events().length,1);const observations=[...h.db.store].filter(([p])=>p.includes('/observations/'));
 assert.equal(observations.length,1);assert.equal(observations[0][1].providerAck,false);assert.equal(observations[0][1].sourceEditTime,null);
 assert.equal(h.db.store.get(path).hrPendingFields.escenario.status,'pending_hr');
 assert.equal(h.db.store.get(path).escenario,'APP');
 const before=h.db.writes;await h.provider().reconcileSnapshot(remote,{sourceRevision:'b'.repeat(64)});assert.equal(h.db.writes,before);
});
test('F3 divergent external edit is an auditable causal conflict and prevents automatic dispatch',async()=>{
 const h=fixture();h.command.payload.patch={escenario:'APP'};const local=await h.provider().execute('verified',h.command);
 const remote=clone(h.snapshot);remote.visits[0].escenario='KIOSCO';
 await h.provider().reconcileSnapshot(remote,{sourceRevision:'c'.repeat(64)});
 const event=h.events().find(e=>e.origin==='hr');assert.ok(event);assert.equal(event.causalEvidence,'concurrent_or_unknown');
 assert.equal(event.actorUid,null);assert.equal(event.sourceEditTime,null);assert.equal(event.after,'KIOSCO');
 assert.equal(h.db.store.get(path).escenario,'KIOSCO');assert.equal(h.db.store.get(path).hrPendingFields.escenario.requestedValue,'APP');
 let calls=0;const r=await dispatchOperationalHrFields({db:h.db,command:h.command,result:local,writeField:async()=>{calls++;}});
 assert.equal(r.status,'conflict');assert.equal(calls,0);assert.equal(r.successUiAllowed,false);
});
test('F3 external field event has observation time only; later platform change follows exact field predecessor',async()=>{
 const h=fixture();h.db.store.set(path,{...h.db.store.get(path),hrManaged:clone(h.snapshot.visits[0])});
 h.snapshot.visits[0].escenario='KIOSCO';
 await h.provider().reconcileSnapshot(h.snapshot,{sourceRevision:'d'.repeat(64)});
 const source=h.events().find(e=>e.origin==='hr');assert.ok(source);assert.equal(source.actorUid,null);assert.equal(source.sourceEditTime,null);
 h.command.payload.patch={escenario:'APP'};h.command.payload.baseFieldValues.escenario='KIOSCO';h.command.expectedVersion=h.db.store.get(path).version;
 const r=await h.provider().execute('verified',h.command);assert.equal(r.status,'pending_hr');
 const platform=h.events().find(e=>e.origin==='platform');assert.equal(platform.baseEventId,source.eventId);assert.equal(platform.baseEventOrigin,'hr');assert.equal(platform.causalSequence,source.causalSequence+1);
});
import fs from 'node:fs';
import vm from 'node:vm';
test('F3 browser adapter rejects a Firestore-only ACK for field events and accepts exact remote proof',async()=>{
 const events=[],CX={BACKEND:{enabled:true,enableCommandWrites:true,tenantId:'tenant-a'},session:{role:'admin'},
  backendAuth:{context:()=>({authenticated:true,tenantId:'tenant-a',role:'admin',projectIds:['project-a']})},bus:{emit:(...x)=>events.push(x)}};
 const root={CX},sandbox={window:root,CX,Date,console};vm.runInNewContext(fs.readFileSync(new URL('../../../../app/adapters/cxorbia-command-adapter-v1.js',import.meta.url),'utf8'),sandbox);
 let reply={ok:true,status:'committed',providerAck:true,hrFieldEventIds:['field-1'],hrProviderAck:false};
 CX.commandAdapter.registerTransport('fake',{execute:async()=>reply});CX.commandAdapter.useTransport('fake');
 const input={...fixture().command,actor:{role:'admin',projectIds:['project-a']}};
 const blocked=await CX.commandAdapter.execute(input);assert.equal(blocked.successUiAllowed,false);assert.equal(events.filter(x=>x[0]==='command-committed').length,0);
 reply={...reply,hrProviderAck:true,readbackVerified:true};const ack=await CX.commandAdapter.execute(input);
 assert.equal(ack.successUiAllowed,true);assert.equal(events.filter(x=>x[0]==='command-committed').length,1);
});
test('F3 command boundary takes historical period and base fields from that exact live visit',async()=>{
 const h=fixture(),calls=[],row=h.snapshot.visits[0];const CX={BACKEND:{enabled:true,tenantId:'tenant-a'},
  data:{_visitas:[row],__liveHrVisits:[row],currentPeriodId:'project-a-2026-11',previewMeta:{sourceRevision:'a'.repeat(64)},ctx:()=>({projectId:'project-a',periodId:'project-a-2026-11'})},
  backendAuth:{context:()=>({authenticated:true,tenantId:'tenant-a',role:'admin',projectIds:['project-a']})},
  session:{role:'admin'},commandAdapter:{execute:async command=>{calls.push(command);return {status:'pending_hr',successUiAllowed:false};}}};
 const root={CX,addEventListener(){}},document={readyState:'loading',addEventListener(){}};
 vm.runInNewContext(fs.readFileSync(new URL('../../../../app/adapters/cxorbia-cxdata-command-boundary-v1.js',import.meta.url),'utf8'),{window:root,CX,document,Date,console});
 CX.cxDataCommandBoundary.install('test');await CX.data.updateHrVisitFields(visitId,{tipoCombo:null},{ackAware:true});
 assert.equal(calls.length,1);assert.equal(calls[0].periodId,period);assert.equal(calls[0].payload.periodId,period);
 assert.equal(calls[0].payload.baseFieldValues.tipoCombo,'A');assert.equal(calls[0].payload.patch.tipoCombo,null);assert.equal(calls[0].payload.countryCode,'GT');
});
import {Readable} from 'node:stream';
import {maybeHandleCxorbiaCommandRuntimeRequest} from '../cxorbia-command-runtime-v1.mjs';
async function httpCommand(h,writer){
 const req=Readable.from([JSON.stringify(h.command)]);req.method='POST';req.headers={authorization:'Bearer fixture'};
 let body;const res={setHeader(){},end(value){body=JSON.parse(value);}};
 await maybeHandleCxorbiaCommandRuntimeRequest(req,res,new URL('http://localhost/v1/cxorbia/commands'),{
  configure:async()=>({db:h.db,auth:{verifyIdToken:async()=>({uid:'operator-1',tenantId:'tenant-a',role:'admin',authNamespace:'staff',projectIds:['project-a']})},
    operationalPolicy:policy,hrSnapshot:h.snapshot,hrRevision:'a'.repeat(64),hrFieldJournalEnabled:true,writeHrField:writer})});
 return {status:res.statusCode,body};
}
test('F3 existing command HTTP route returns 202 while writer is not provisioned; no success claim',async()=>{
 const h=fixture(),r=await httpCommand(h);assert.equal(r.status,202);assert.equal(r.body.localCommitted,true);assert.equal(r.body.hrProviderAck,false);assert.equal(r.body.successUiAllowed,false);
});
test('F3 existing command HTTP route dispatches and replays exact remote receipts without extra writes',async()=>{
 const h=fixture(),m=makeFixture(),r=await httpCommand(h,m.write);assert.equal(r.status,200);assert.equal(r.body.hrProviderAck,true);assert.equal(m.writes(),2);
 const replay=await httpCommand(h,m.write);assert.equal(replay.status,200);assert.equal(replay.body.idempotentReplay,true);assert.equal(m.writes(),2);
});
import {createHash} from 'node:crypto';
import {resolveExcelFieldWriteTarget,encodeExcelHrFieldValue,decodeExcelHrFieldValue} from '../../cxorbia-make-graph-provider-v1.mjs';
const columns=JSON.parse(fs.readFileSync(new URL('../../../contracts/tya-hr-column-map-r20-v1.json',import.meta.url),'utf8'));
const cinemas=JSON.parse(fs.readFileSync(new URL('../../../contracts/tya-cinepolis-cinema-identity-r20-v1.json',import.meta.url),'utf8'));
function targetFixture({countryCode='GT',periodId='project-a-2025-06',fieldKey='tipoCombo',before='A',after=null}={}){
 const header=Object.values(columns.columns).map(c=>c.aliases[0]),keys=Object.keys(columns.columns),row=header.map(()=>''),cell=(k,v)=>{row[keys.indexOf(k)]=v;};
 for(const [k,v] of Object.entries({pais:countryCode==='GT'?'Guatemala':'Honduras',idCinema:countryCode==='GT'?'2022002':'2052001',
  ciudad:countryCode==='GT'?'Guatemala':'Tegucigalpa',shopping:countryCode==='GT'?'C. Miraflores':'C. Las Cascadas Honduras',
  quincena:'1Q',franja:'WKND',tipoCombo:'A',tipoCompra:'Boletería',shopper:'p x asignar',controlDia:'P x asignar'}))cell(k,v);
 const worksheetId='qa-worksheet',worksheetName='JUNIO 25',worksheetFingerprint=createHash('sha256').update(worksheetId).digest('hex');
 const event={schemaVersion:'cxorbia.hr-field-event.v1',eventId:'hfe-'+'a'.repeat(64),eventDigest:'b'.repeat(64),tenantId:'tenant-a',projectId:'project-a',periodId,countryCode,
  visitId:'qa-logical-visit',hrRowId:worksheetName+'!2',fieldKey,before,after,worksheetFingerprint,
  sourceRowIdentity:{cinemaId:row[keys.indexOf('idCinema')],sucursal:row[keys.indexOf('shopping')]}};
 const cap={schemaVersion:'cxorbia.hr-field-writer-binding.v1',enabled:true,protocolVersion:'cxorbia.hr-field-transport.v1',remoteEventReceipt:true,observedBaseGuard:true,
  allowedFields:['tipoCombo','escenario','agendada'],fieldMap:{tipoCombo:{columnKey:'tipoCombo',valueKind:'text'},escenario:{columnKey:'tipoCompra',valueKind:'text'},agendada:{columnKey:'fechaProgramada',valueKind:'date'}},rowIdentityColumns:['idCinema','shopping']};
 const binding={scope:{tenantId:event.tenantId,projectId:event.projectId,periodId,countryCode},proof:{bindingFingerprint:'c'.repeat(64),writePolicy:'bidirectional_gated'},privateProvider:{providerBindingId:'qa-country-binding',driveId:'qa-drive',itemId:'qa-item',worksheets:[{worksheetId,worksheetName}]}};
 const db={doc:requested=>{assert.equal(requested,'tenants/tenant-a/integrationSettings/qa-country-binding');return {get:async()=>({exists:true,data:()=>({fieldWriter:cap,hrWritesEnabled:true})})};}};
 const args={db,event,columnMap:columns,cinemaRegistry:cinemas,resolveBinding:async request=>{assert.equal(request.periodId,periodId);assert.equal(request.countryCode,countryCode);return binding;},
  readBinding:async()=>({proof:{bindingFingerprint:binding.proof.bindingFingerprint,externalRevisionIndependentlyVerified:true},privateProviderRows:[{worksheetId,values:[header,row]}]})};
 return {args,event,cap,row,keys};
}
test('F3 private target resolves both countries and historical/current period bindings without caller coordinates',async()=>{
 for(const countryCode of ['GT','HN'])for(const periodId of ['project-a-2025-06','project-a-2026-11']){
  const h=targetFixture({countryCode,periodId}),target=await resolveExcelFieldWriteTarget(h.args);
  assert.equal(target.periodId,periodId);assert.equal(target.countryCode,countryCode);assert.equal(target.fieldValue,'');
  assert.equal(target.decodeCell(target.fieldValue),null);assert.equal(target.expectedBeforeValue,'A');assert.equal(target.writeCapability,h.cap);
  assert.equal(target.rowIdentityColumnIndexes.length,2);assert.equal(target.expectedHeaderValues.length,h.keys.length);
 }
});
test('F3 Graph clear encodes functional null as empty string and date readback accepts Excel serial',()=>{
 for(const kind of ['text','date','money','shopper'])assert.equal(encodeExcelHrFieldValue(null,kind),'');
 assert.equal(decodeExcelHrFieldValue('','date'),null);assert.equal(decodeExcelHrFieldValue(null,'text'),null);
 const serial=(Date.UTC(2026,10,24)-Date.UTC(1899,11,30))/86400000;
 assert.equal(decodeExcelHrFieldValue(serial,'date'),'2026-11-24');assert.equal(encodeExcelHrFieldValue('2026-11-24','date'),'2026-11-24');
});
test('F3 private target rejects a changed row business owner and disabled writer capability before a write',async()=>{
 const h=targetFixture();h.row[h.keys.indexOf('idCinema')]='2052001';await assert.rejects(resolveExcelFieldWriteTarget(h.args),/FIELD_BUSINESS_IDENTITY_CHANGED/);
 const disabled=targetFixture();disabled.cap.enabled=false;await assert.rejects(resolveExcelFieldWriteTarget(disabled.args),/FIELD_WRITER_NOT_ENABLED/);
});
test('F3 shopper alias is explicit, scoped and idempotent; an existing different owner blocks all writes',async()=>{
 const h=fixture();h.command.commandType='visit.assign';h.command.authorization.permission='visit.assign';h.command.payload={visitId,hrRowId:h.snapshot.visits[0].hrRowId,shopperId:'shopper-qa',assignmentSource:'platform',baseFieldValues:{shopperId:null}};
 await h.provider().execute('verified',h.command);const event=h.events()[0],binding=event.providerValueBinding;
 assert.equal(binding.canonicalShopperId,'shopper-qa');assert.equal(binding.remoteLabel,'QA Shopper Exact');
 const cross=h.db.store.get('tenants/tenant-a/shopperIdentityCrosswalk/'+binding.sourceShopperId);
 assert.equal(cross.shopperId,'shopper-qa');assert.equal(cross.bindingBasis,'explicit_platform_assignment');assert.equal(cross.originEventId,event.eventId);
 const other=fixture();other.command=clone(h.command);other.db.store.set('tenants/tenant-a/shopperIdentityCrosswalk/'+binding.sourceShopperId,{tenantId:'tenant-a',shopperId:'other-person'});
 const before=other.db.writes,result=await other.provider().execute('verified',other.command);assert.equal(result.code,'OPS_HR_FIELD_SHOPPER_LABEL_COLLISION');assert.equal(other.db.writes,before);
});

test('F3 target cannot reinterpret a newly changed HR shopper label as the event base',async()=>{
 const h=targetFixture({fieldKey:'shopperId',before:'canonical-old',after:'canonical-new'});
 h.cap.allowedFields.push('shopperId');h.cap.fieldMap.shopperId={columnKey:'shopper',valueKind:'shopper'};
 h.row[h.keys.indexOf('shopper')]='CXOrbia QA unrelated new shopper';
 const settings=h.args.db.doc;h.args.db.doc=path=>path.includes('/integrationSettings/')?settings(path):{get:async()=>({exists:false,data:()=>undefined})};
 await assert.rejects(resolveExcelFieldWriteTarget(h.args),/FIELD_SOURCE_BASE_CHANGED/);
});
test('F3 remote receipt without a proven provider execution identifier remains pending',async()=>{
 const h=fixture();h.command.payload.patch={escenario:'APP'};await h.provider().execute('verified',h.command);
 const event=h.events()[0],m=makeFixture();await m.write(event,{});
 const result=await executeExcelFieldEventThroughMake({event,target:m.target(event),recoveryOnly:true,
  runScenario:async input=>({...await m.run(input),providerExecutionId:''})});
 assert.equal(result.providerAck,false);assert.equal(result.status,'pending_hr');assert.equal(m.writes(),1);
});
test('F3 server captures command dependencies per request and defaults writer capability off',async()=>{
 const source=fs.readFileSync(new URL('../server.mjs',import.meta.url),'utf8');
 const start=source.indexOf('function configureCommandRuntime('),end=source.indexOf('const explicitHrReconciliation=',start);
 const current={snapshot:{tenantId:'tenant-a',projectId:'project-a',source:{providerType:'excel_online'}},revision:'a'.repeat(64),identity:new Map()};
 const policy=s=>({allowedProjectIds:[s.projectId]});
 const context={Map,F3_HR_FIELDS_ENABLED:false,ensureAdmin:()=>({auth:{},db:{}}),shopperPolicy:policy,projectPolicy:policy,
  operationalPolicy:policy,commercialPolicy:policy,academyPolicy:policy,cache:{snapshot:{projectId:'other-project'},revision:'other'},writeOriginalHrField:()=>{throw Error('must not be invoked');}};
 vm.createContext(context);vm.runInContext(source.slice(start,end),context);
 const result=context.configureCommandRuntime(current.snapshot,current);
 assert.equal(result.hrSnapshot.projectId,'project-a');assert.equal(result.hrRevision,current.revision);
 assert.equal(result.hrFieldJournalEnabled,false);assert.equal(result.writeHrField,undefined);
});

test('F3 recovery distinguishes remote receipt plus stale before read from proven divergent value',async()=>{
 const h=fixture();h.command.payload.patch={escenario:'APP'};await h.provider().execute('verified',h.command);const e=h.events()[0],m=makeFixture();
 for(const [raw,expected] of [[e.before,'pending_hr'],['EXTERNAL_EDIT','conflict']]){
  let writeCalls=0;const result=await executeExcelFieldEventThroughMake({event:e,target:m.target(e),recoveryOnly:true,runScenario:async request=>{
   if(request.operation==='write_field')writeCalls++;
   return {...request,status:'CONFLICT_NOOP',readStatus:200,observedValue:raw,observedHeaderValues:request.expectedHeaderValues,observedRowIdentityValues:request.expectedRowIdentityValues,remoteReceiptVerified:true,remoteWriteStatus:200,remoteEventId:e.eventId,remoteEventDigest:e.eventDigest,currentEventId:null,providerExecutionId:'e'.repeat(32)};
  }});assert.equal(result.status,expected);assert.equal(result.providerAck,false);assert.equal(result.successUiAllowed,undefined);assert.equal(writeCalls,0);
 }
});

test('F3 server turns only independently proved changed-base target guard into terminal conflict without Make',async()=>{
 const source=fs.readFileSync(new URL('../server.mjs',import.meta.url),'utf8'),first=source.indexOf('async function writeOriginalHrField('),last=source.indexOf('async function verifiedProtectedPrincipal(',first);
 const event=targetFixture().event;let calls=0,mode='changed',reads=0;
 const context={ensureAdmin:()=>({db:{}}),loadExcelMappingLibrary:()=>({}),readOriginalThroughToolbox:()=>{},
  resolveCountryHrPeriodBinding:async()=>({proof:{bindingFingerprint:mode==='binding-change'&&++reads>1?'different':'fixed'},privateProvider:{mappingRef:'fixture'}}),
  resolveExcelFieldWriteTarget:async()=>{throw Error(mode==='other'?'MAPPING_FAILURE:B14_FIELD_ROW_REFERENCE':'MAPPING_FAILURE:B14_FIELD_SOURCE_BASE_CHANGED');},
  withOriginalToolboxWriter:()=>{calls++;throw Error('unexpected writer');}};
 vm.createContext(context);vm.runInContext(source.slice(first,last),context);
 const result=await context.writeOriginalHrField(event,{recoveryOnly:true});assert.equal(result.status,'conflict');assert.equal(result.code,'HR_FIELD_REMOTE_BASE_CONFLICT');assert.equal(result.providerWriteRequests,0);assert.equal(result.eventDigest,event.eventDigest);assert.equal(calls,0);
 mode='other';await assert.rejects(context.writeOriginalHrField(event,{}),/FIELD_ROW_REFERENCE/);
 mode='binding-change';reads=0;await assert.rejects(context.writeOriginalHrField(event,{}),/FIELD_BINDING_CHANGED/);assert.equal(calls,0);
});
