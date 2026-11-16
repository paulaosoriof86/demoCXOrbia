import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {validateTerminalHrObservation} from './cxorbia-i3-terminal-hr-observation.mjs';
import {b14PredecessorReadOnly,b14PrincipalOf,b14DiagnosticError,b14RuntimeAuthority,b14WorkbookFromReaders,b14CapabilityVerdict,b14BindingProjection,b14ProjectSourceProjection,b14IntegrationCandidates,b14LeaseReceiptPath} from './cxorbia-i3-hr-ack-exact-same-revision.mjs';
const valid=()=>({ok:true,revision:'a'.repeat(64),sourceSafe:true,refreshError:null,
  writes:false,hrWrites:false,production:false,shopperReconciliation:null,visitReconciliation:null});
test('G05 valid read-only observation passes without inventing reconciliation ACK',()=>{
  const r=validateTerminalHrObservation(valid());
  assert.equal(r.reconciliationCertified,false);assert.equal(r.scope,'HR_OBSERVATION_ONLY_NOT_COMMAND_RECONCILIATION');
  assert.equal(r.providerAck,undefined);
});
for(const [field,value] of [['ok',false],['revision','stale'],['sourceSafe',false],['refreshError','timeout'],
  ['writes',true],['hrWrites',true],['production',true],['writes',undefined]]){
  test('invalid HR observation remains blocked: '+field+'='+String(value),()=>{
    const m=valid();m[field]=value;
    assert.throws(()=>validateTerminalHrObservation(m),/TERMINAL_HR_READ_ONLY_OBSERVATION_INVALID/);
  });
}
test('an old ACK cannot disguise invalid current HR observation',()=>{
  const m=valid();m.sourceSafe=false;m.shopperReconciliation={providerAck:true};m.visitReconciliation={providerAck:true};
  assert.throws(()=>validateTerminalHrObservation(m));
});
test('active terminal preflight invokes the observation predicate and preserves revision stability',()=>{
  const w=fs.readFileSync('.github/workflows/cxorbia-recovery-i3-dev-certification.yml','utf8');
  const job=w.split('\n  certify:')[1].split('\n  live-fixtures:')[0];
  assert.match(job,/node tools\/qa\/cxorbia-i3-terminal-hr-observation\.mjs "\$OUT\/hr-current-live-meta.json"/);
  assert.doesNotMatch(job,/\[\[ "\$\(jq -r '\.shopperReconciliation.providerAck'/);
  assert.match(job,/"\$REV" = "\$PREV_REV"/);
  assert.match(job,/"\$SNAP_REV" = "\$CURRENT_LIVE_HR_REVISION"/);
});
const runtimeFixture=()=>({metadata:{name:'dev-372'},status:{imageDigest:'registry/image@sha256:'+'d'.repeat(64)},spec:{serviceAccountName:'runtime@example.iam.gserviceaccount.com',containers:[{env:[]}]}});
const expectedRuntime={revision:'dev-372',digest:'sha256:'+'d'.repeat(64)};
const readers=["const SHEET_ID=process.env.CXORBIA_HR_LIVE_SHEET_ID||'sheet-example-1';","const SHEET_ID = process.env.CXORBIA_HR_LIVE_SHEET_ID || 'sheet-example-1';"];
test('B14 runtime authority rejects another revision or image and never projects env values',()=>{
 const x=runtimeFixture();x.spec.containers[0].env=[{name:'SAFE_CONFIG',value:'must-not-be-persisted'},{name:'SECRET',valueFrom:{secretKeyRef:{name:'secret-name',key:'1'}}}];
 const r=b14RuntimeAuthority(x,expectedRuntime);assert.equal(r.principal,x.spec.serviceAccountName);assert.equal(JSON.stringify(r).includes('must-not-be-persisted'),false);assert.equal(JSON.stringify(r).includes('secret-name'),false);
 for(const delta of [{revision:'other'},{digest:'sha256:'+'f'.repeat(64)}])assert.throws(()=>b14RuntimeAuthority(x,{...expectedRuntime,...delta}),/DRIFT/);
});
for(const name of ['FIREBASE_SERVICE_ACCOUNT_JSON','CXORBIA_HR_LIVE_SHEET_ID'])test('B14 does not substitute source fallback when runtime override exists: '+name,()=>{
 const x=runtimeFixture();x.spec.containers[0].env=[{name,value:'never-read'}];const a=b14RuntimeAuthority(x,expectedRuntime);const b=b14WorkbookFromReaders(readers,a);assert.equal(b.resolved,false);assert.equal(b.id,undefined);
});
test('B14 uses only the agreeing sealed reader constants with no override',()=>{
 const a=b14RuntimeAuthority(runtimeFixture(),expectedRuntime),r=b14WorkbookFromReaders(readers,a);assert.equal(r.id,'sheet-example-1');assert.match(r.idSha256,/^[a-f0-9]{64}$/);
 assert.equal(b14WorkbookFromReaders([readers[0],readers[1].replace('example-1','other')],a).resolved,false);
});
test('B14 principal resolution uses only public identity accessors, never credentials',async()=>{
 const c={getTargetPrincipal:()=> 'runtime@example.iam.gserviceaccount.com',getCredentials:()=>{throw Error('SECRET_ACCESS');}};
 assert.equal(await b14PrincipalOf(c),'runtime@example.iam.gserviceaccount.com');assert.equal(await b14PrincipalOf({email:'adc@example.iam.gserviceaccount.com'}),'adc@example.iam.gserviceaccount.com');assert.equal(await b14PrincipalOf({}),null);
});
test('B14 canEdit cannot certify an ACK, write execution or domain completion',()=>{
 const r=b14CapabilityVerdict({principalVerified:true,file:{id:'sheet',capabilities:{canEdit:true,canModifyContent:true}},sheets:{spreadsheetId:'sheet'},sheetId:'sheet'});
 assert.equal(r.accessConclusion,'METADATA_EDIT_CAPABILITY_OBSERVED');assert.equal(r.providerAck,false);assert.equal(r.b14Closed,false);assert.equal(r.writeCapabilityExecuted,false);
});
test('B14 wrong identity, wrong workbook and missing metadata cannot prove edit capability',()=>{
 const v={principalVerified:true,file:{id:'sheet',capabilities:{canEdit:true}},sheets:{spreadsheetId:'sheet'},sheetId:'sheet'};
 for(const delta of [{principalVerified:false},{sheets:null},{sheetId:'other'}]){const r=b14CapabilityVerdict({...v,...delta});assert.equal(r.canEditObserved,null);assert.equal(r.metadataIdentityVerified,false);assert.equal(r.b14Closed,false);}
 const denied=b14CapabilityVerdict({...v,file:{id:'sheet',capabilities:{canEdit:false}}});assert.equal(denied.accessConclusion,'METADATA_EDIT_CAPABILITY_FALSE');
});
test('B14 permission diagnostics retain status/reason and exclude tokens, headers and error payloads',()=>{
 const e={message:'Authorization Bearer SECRET',config:{headers:{Authorization:'Bearer SECRET'}},response:{status:403,data:{error:{status:'PERMISSION_DENIED',details:[{reason:'SERVICE_DISABLED'}],message:'SECRET'}}}};
 assert.deepEqual(b14DiagnosticError(e),{httpStatus:403,apiStatus:'PERMISSION_DENIED',reason:'SERVICE_DISABLED',code:null});assert.equal(JSON.stringify(b14DiagnosticError(e)).includes('SECRET'),false);
});
test('B14 binding requires exact tenant/project/workbook and never exposes secretRef payload',()=>{
 const row={tenantId:'tenant',projectIds:['project'],spreadsheetId:'sheet',secretRef:'sensitive-reference',hrWritesEnabled:true};const r=b14BindingProjection(row,'sheet','tenant','project');assert.equal(r.workbookMatches,true);assert.equal(JSON.stringify(r).includes('sensitive-reference'),false);
 assert.equal(b14BindingProjection({...row,tenantId:'foreign'},'sheet','tenant','project').scopeMatches,false);assert.equal(b14BindingProjection(row,'other','tenant','project').workbookMatches,false);assert.equal(b14BindingProjection({...row,spreadsheetId:undefined},'sheet','tenant','project').workbookMatches,null);
});
test('B14 mode keeps the existing HR read-only CLI contract operational',async t=>{
 const {createServer}=await import('node:http'),{spawn}=await import('node:child_process'),{once}=await import('node:events'),{tmpdir}=await import('node:os'),path=await import('node:path');
 let reads=0;const server=createServer((req,res)=>{reads++;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({...valid(),revisionStable:true,imports:false}));});server.listen(0,'127.0.0.1');await once(server,'listening');
 const dir=fs.mkdtempSync(path.join(tmpdir(),'cxorbia-b14-original-'));t.after(()=>{server.close();fs.rmSync(dir,{recursive:true,force:true});});
 const env={...process.env};delete env.CXORBIA_I3_QA_SCOPE;const child=spawn(process.execPath,['tools/qa/cxorbia-i3-hr-ack-exact-same-revision.mjs',dir,'http://127.0.0.1:'+server.address().port,'tenant','project','123456789'],{env});let err='';child.stderr.on('data',x=>{err+=x;});const [code]=await once(child,'exit');assert.equal(code,0,err);assert.equal(reads,2);
 const proof=JSON.parse(fs.readFileSync(path.join(dir,'hr-ack-preflight.json'),'utf8'));assert.equal(proof.decision,'PASS_HR_EXACT_REVISION_READ_ONLY');assert.equal(proof.reconciliationRequiredForRead,false);assert.equal(proof.hrWrites,false);
});
test('B14 metadata preserves operational-source precedence and diagnoses shadowed route without exposing references',()=>{
 const route={mode:'external',readPolicy:'external_live',providerBindingId:'private-binding',mappingRef:'private-map'};
 const r=b14ProjectSourceProjection({operationalSource:{},routeSource:route});assert.equal(r.sourceSelected,'operationalSource');assert.equal(r.sourceConfigGuardPass,false);assert.equal(r.operationalSourceShadowsValidRoute,true);assert.equal(JSON.stringify(r).includes('private-'),false);
 const a=b14ProjectSourceProjection({routeSource:route});assert.equal(a.sourceConfigGuardPass,true);assert.equal(a.selectedReferenceKind,'providerBindingId');assert.equal(a.routeSource.mode.value,'external');
 const masked=b14ProjectSourceProjection({routeSource:route},{parentPresenceComplete:false});assert.equal(masked.sourceSelected,'UNRESOLVED_PARENT_PRESENCE');assert.equal(masked.sourceConfigGuardPass,null);assert.equal(masked.selectedReferenceHash,null);
});
test('B14 alias candidates remain candidates and unsafe document paths are never read',()=>{
 const r=b14IntegrationCandidates({operationalSource:{providerBindingId:'binding',integrationSettingId:'setting',providerRef:'external/path'},routeSource:{integrationSettingId:'route-setting'}});
 assert.equal(r.length,4);assert.equal(r.find(x=>x.kind==='providerRef').validId,false);assert.equal(r.find(x=>x.source==='routeSource').selected,false);
 const safe='tenants/t/commandReceipts/hr-'+'a'.repeat(64);assert.equal(b14LeaseReceiptPath(safe,'t'),safe);
 for(const x of [safe.replace('tenants/t/','tenants/other/'),safe+'/stages/x','tenants/t/commandReceipts/../../secret'])assert.equal(b14LeaseReceiptPath(x,'t'),null);
});

function predecessorReadFixture(){
 const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v,digest=v=>createHash('sha256').update(JSON.stringify(stable(v))).digest('hex');
 const tenantId='tenant-safe',projectId='project-safe',revision='2'.repeat(64),key='old-safe-idempotency-key',actorUid='private-old-actor';
 const oldPath='tenants/'+tenantId+'/commandReceipts/hr-'+digest([projectId,key]);
 const old={tenantId,projectId,sourceRevision:'1'.repeat(64),idempotencyKey:key,actorUid,attemptId:'old-attempt',status:'partial'};old.digest=digest({actorUid,scope:{tenantId,projectId},sourceRevision:old.sourceRevision,commandType:'hr.snapshot.reconcile'});
 const intent={attemptId:'old-attempt',system:'firestore',stage:'visits',status:'pending',operations:[]},effect={attemptId:'old-attempt',system:'firestore',stage:'visits',operations:[{entity:'private-path',operation:'set',expectedDigest:'a'.repeat(64)}]};
 const proof={schemaVersion:'cxorbia.hr-reconciliation-predecessor.v1',receiptPath:oldPath,receiptDigest:old.digest,sourceRevision:old.sourceRevision,actorUidHash:digest(actorUid),attemptId:old.attemptId,status:'partial',journalComplete:true,journalSeal:digest({receipt:old,intents:[['effect-id',intent]],effects:[['effect-id',effect]],stages:{visits:null,shoppers:null}}),intentCount:1,effectCount:1,authWrites:0,firestoreWrites:1,confirmedProviderWrites:1};
 const records=new Map([[oldPath,old],[oldPath+'/intents/effect-id',intent],[oldPath+'/effects/effect-id',effect]]),reads=[];
 const ref=(path,collection=false)=>({path,id:path.split('/').at(-1),isCollection:collection,collection:name=>ref(path+'/'+name,true),doc:id=>ref(path+'/'+id)});
 const db={doc:ref},tx={get:async target=>{reads.push(target.path);if(target.isCollection){const docs=[...records].filter(([p])=>p.startsWith(target.path+'/')&&p.split('/').length===target.path.split('/').length+1).map(([p,v])=>({id:p.split('/').at(-1),data:()=>structuredClone(v)}));return {docs,size:docs.length};}return {exists:records.has(target.path),data:()=>structuredClone(records.get(target.path))};}};
 const nextActor='new-authorized-admin',nextKey='new-safe-idempotency-key',receiptRef=ref('tenants/'+tenantId+'/commandReceipts/hr-'+digest([projectId,nextKey]));
 const receipt={tenantId,projectId,sourceRevision:revision,actorUid:nextActor,idempotencyKey:nextKey,digest:digest({actorUid:nextActor,scope:{tenantId,projectId},sourceRevision:revision,commandType:'hr.snapshot.reconcile'}),status:'committed',predecessorReconciliation:proof,result:{ok:true,committed:true,providerAck:true,readbackVerified:false,sourceRevision:revision,receiptPath:receiptRef.path,receiptBinding:{tenantId,projectId,sourceRevision:revision,actorUid:nextActor,idempotencyKey:nextKey,commandType:'hr.snapshot.reconcile'},predecessorReconciliation:structuredClone(proof)}};
 return {tx,db,receipt,receiptRef,tenantId,projectId,revision,records,reads,oldPath,proof};
}
test('HR349 readonly proof verifies complete historical bytes without exposing identity or treating stored readback false as failure',async()=>{
 const f=predecessorReadFixture(),r=await b14PredecessorReadOnly(f.tx,f);
 assert.equal(r.independentHistoricalReadback,true);assert.equal(r.successorTerminalCommitted,true);assert.equal(r.decision,'PASS_VERIFIED_PREDECESSOR_HISTORY_AND_COMMITTED_SUCCESSOR');assert.equal(r.intentsRead,1);assert.equal(r.effectsRead,1);assert.equal(r.writes,0);
 for(const value of ['private-old-actor','private-path','old-safe-idempotency-key',f.oldPath])assert.equal(JSON.stringify(r).includes(value),false);
});
for(const [name,alter]of [
 ['wrong successor digest',f=>{f.receipt.digest='9'.repeat(64);}],
 ['wrong successor actor binding',f=>{f.receipt.result.receiptBinding.actorUid='another-actor';}],
 ['wrong successor receipt path',f=>{f.receiptRef=f.db.doc('tenants/'+f.tenantId+'/commandReceipts/hr-'+'3'.repeat(64));}],
 ['historical mutation',f=>{f.records.get(f.oldPath).status='committed';}],
 ['late added intent',f=>{f.records.set(f.oldPath+'/intents/late',{status:'pending'});}],
 ['contradictory result proof',f=>{f.receipt.result.predecessorReconciliation.journalSeal='b'.repeat(64);}],
 ['wrong current revision',f=>{f.revision='4'.repeat(64);}],
 ['foreign predecessor',f=>{f.proof.receiptPath=f.oldPath.replace('tenant-safe','foreign');}],
 ['self predecessor',f=>{f.receiptRef=f.db.doc(f.oldPath);}],
 ['counter disagreement',f=>{f.proof.effectCount=2;}]
])test('HR349 readonly proof does not certify '+name,async()=>{const f=predecessorReadFixture();alter(f);const r=await b14PredecessorReadOnly(f.tx,f);assert.equal(r.independentHistoricalReadback,false);assert.equal(r.writes,0);});
test('HR349 running successor remains explicitly uncommitted even with a verified predecessor',async()=>{
 const f=predecessorReadFixture();f.receipt.status='running';f.receipt.result.ok=false;f.receipt.result.committed=false;f.receipt.result.providerAck=false;
 const r=await b14PredecessorReadOnly(f.tx,f);assert.equal(r.independentHistoricalReadback,true);assert.equal(r.successorTerminalCommitted,false);assert.equal(r.decision,'VERIFIED_PREDECESSOR_HISTORY_SUCCESSOR_NOT_COMMITTED');
});
