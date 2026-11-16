import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {providerUidFingerprint,stableShopperUid} from '../../backend/runtime/cxorbia-shopper-command-provider-v1.mjs';
import {validateTerminalHrObservation} from './cxorbia-i3-terminal-hr-observation.mjs';
import {b14ReadJournalPage,b14SummarizeCurrentJournal,b14PredecessorReadOnly,b14PrincipalOf,b14DiagnosticError,b14RuntimeAuthority,b14WorkbookFromReaders,b14CapabilityVerdict,b14BindingProjection,b14ProjectSourceProjection,b14IntegrationCandidates,b14LeaseReceiptPath,hrCrosswalkUidDiagnosis,hrCrosswalkUidReadOnly,hrUidAuthorityProjection,validateHrUidDiagnosticBinding} from './cxorbia-i3-hr-ack-exact-same-revision.mjs';
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

const uidDiagHash=v=>createHash('sha256').update(String(v)).digest('hex');
const uidDiagStamp={seconds:1794787200,nanoseconds:123456789};
const uidDiagDoc=(collection,id,data)=>({id,path:'tenants/tenant-safe/'+collection+'/'+id,updateTime:{...uidDiagStamp},data});
const uidDiagMember=(uid='private-selected-uid',shopperId='private-source-id',extra={})=>uidDiagDoc('users',uid,{tenantId:'tenant-safe',shopperId,active:true,role:'shopper',authNamespace:'shopper',projectIds:['project-safe'],...extra});
const uidDiagAuth=(uid='private-selected-uid',shopperId='private-source-id',extra={})=>({uid,disabled:false,email:'private@example.invalid',displayName:'Private Name',passwordHash:'private-password-hash',customClaims:{tenantId:'tenant-safe',shopperId,role:'shopper',authNamespace:'shopper',projectIds:['project-safe']},...extra});
const uidDiagFixture=()=>({tenantId:'tenant-safe',projectId:'project-safe',sourceIds:['private-source-id'],users:[uidDiagMember()],links:[],crosswalks:[uidDiagDoc('shopperIdentityCrosswalk','private-source-id',{tenantId:'tenant-safe',sourceStableKey:'private-source-id',shopperId:'private-source-id',providerUidFingerprint:providerUidFingerprint('private-old-uid'),sourceType:'hr_external',identityMode:'stable_hr_shopper_id'})],profiles:[uidDiagDoc('shoppers','private-source-id',{tenantId:'tenant-safe',projectIds:['project-safe']})],authUsers:[uidDiagAuth(),uidDiagAuth('private-old-uid')],providerUidFingerprint,stableShopperUid});
const uidDiagLink=(extra={})=>uidDiagDoc('shopperIdentityLinks','private-link-id',{tenantId:'tenant-safe',status:'active',authorityType:'provider_exact',authorityRef:'private-authority-ref',projectScope:'TENANT',canonicalShopperId:'private-canonical-id',sourceSystem:'hr',sourceId:'private-source-id',...extra});
test('HR UID observer preserves membership selection and reports old owner only as evidence',()=>{
 const f=uidDiagFixture(),r=hrCrosswalkUidDiagnosis(f),c=r.conflicts[0];
 assert.equal(c.uidSelectionBranch,'CANONICAL_MEMBERSHIP');assert.equal(c.selectedUidFingerprint,providerUidFingerprint('private-selected-uid'));
 assert.equal(c.storedFingerprintAuthOwners.length,1);assert.equal(c.selectedMembershipExact,true);
 assert.equal(r.fullReconciliationClosed,false);for(const k of ['firestoreWrites','authWrites','hrWrites','providerCommandCalls'])assert.equal(r[k],0);
 const text=JSON.stringify(r);for(const value of ['private-selected-uid','private-old-uid','private-source-id','private@example.invalid','Private Name','private-password-hash'])assert.equal(text.includes(value),false);
});
test('HR UID observer cannot hide a malformed nonempty fingerprint by sanitizing it',()=>{
 const f=uidDiagFixture();f.crosswalks[0].data.providerUidFingerprint='private-invalid-fingerprint';
 const r=hrCrosswalkUidDiagnosis(f);assert.equal(r.conflicts.length,1);assert.equal(r.matched,0);assert.equal(r.conflicts[0].storedUidFingerprint,null);
 assert.equal(r.conflicts[0].storedUidFingerprintInvalidHash,uidDiagHash('private-invalid-fingerprint'));assert.equal(JSON.stringify(r).includes('private-invalid-fingerprint'),false);
});
test('HR UID observer trims owner inputs but does not normalize fingerprint case',()=>{
 const f=uidDiagFixture(),fp=providerUidFingerprint('private-selected-uid');f.crosswalks[0].data.providerUidFingerprint=' '+fp+' ';
 assert.equal(hrCrosswalkUidDiagnosis(f).matched,1);f.crosswalks[0].data.providerUidFingerprint=fp.toUpperCase();
 assert.equal(hrCrosswalkUidDiagnosis(f).conflicts.length,1);
});
test('HR UID observer masks unexpected persisted metadata without changing selection',()=>{
 const f=uidDiagFixture();for(const k of ['status','identityState','providerUidFingerprint'])f.users[0].data[k]='private-'+k;
 for(const k of ['identityAuthority','identityAuthorityRef','hrSourceRevision','providerUidFingerprint'])f.profiles[0].data[k]='private-'+k;
 for(const k of ['identityMode','migrationAuthorityType','migrationAuthorityRef'])f.crosswalks[0].data[k]='private-'+k;
 f.authUsers[0].customClaims.role='private-role';f.authUsers[0].customClaims.authNamespace='private-namespace';
 const r=hrCrosswalkUidDiagnosis(f);assert.equal(r.conflicts.length,1);
 for(const k of ['status','identityState','providerUidFingerprint','identityAuthority','identityAuthorityRef','hrSourceRevision','identityMode','migrationAuthorityType','migrationAuthorityRef','role','namespace'])assert.equal(JSON.stringify(r).includes('private-'+k),false,k);
});
test('HR UID observer follows a TENANT link exactly',()=>{
 const f=uidDiagFixture();f.links=[uidDiagLink()];f.crosswalks[0].data.shopperId='private-canonical-id';
 f.users=[uidDiagMember('private-selected-uid','private-canonical-id')];f.profiles=[uidDiagDoc('shoppers','private-canonical-id',{})];
 const c=hrCrosswalkUidDiagnosis(f).conflicts[0];assert.equal(c.canonicalIdHash,uidDiagHash('private-canonical-id'));assert.equal(c.linkEvidence.length,1);
});
for(const [name,delta]of [['other project',{projectScope:'project-foreign'}],['other tenant',{tenantId:'tenant-foreign'}],['period scoped',{periodId:'period-private'}],['untrusted authority',{authorityType:'untrusted'}]])
 test('HR UID observer excludes '+name+' identity links',()=>{const f=uidDiagFixture();f.links=[uidDiagLink(delta)];const c=hrCrosswalkUidDiagnosis(f).conflicts[0];assert.equal(c.sourceIsCanonical,true);assert.equal(c.linkEvidence.length,0);});
test('HR UID observer distinguishes exact alias self-map and source-scope conflicts',()=>{
 const f=uidDiagFixture();f.links=[uidDiagLink()];f.profiles=[uidDiagDoc('shoppers','private-canonical-id',{})];
 let r=hrCrosswalkUidDiagnosis(f);assert.equal(r.exceptions[0].reason,'EXACT_ALIAS_SELF_MAP_EXCEPTION');assert.equal(r.conflicts.length,0);
 f.crosswalks[0].data.tenantId='foreign';r=hrCrosswalkUidDiagnosis(f);assert.equal(r.unresolved[0].reason,'CROSSWALK_SCOPE_PREDICATE');
});
test('HR UID observer suppresses adjudication only for the exact active source principal',()=>{
 const f=uidDiagFixture();f.links=[uidDiagLink({authorityType:'tenant_adjudication'})];
 Object.assign(f.crosswalks[0].data,{shopperId:'private-canonical-id',identityMode:'provider_exact_identity_link',migrationAuthorityType:'tenant_adjudication'});
 let r=hrCrosswalkUidDiagnosis(f);assert.equal(r.exceptions[0].reason,'SUPPRESSED_TENANT_ADJUDICATION_EXCEPTION');
 f.authUsers[0].disabled=true;r=hrCrosswalkUidDiagnosis(f);assert.equal(r.exceptions.length,0);assert.equal(r.conflicts[0].canonicalIdHash,uidDiagHash('private-canonical-id'));
});
test('HR UID observer keeps single inactive membership before a different exact Auth principal',()=>{
 const f=uidDiagFixture();Object.assign(f.users[0].data,{active:false,status:'inactive'});
 const c=hrCrosswalkUidDiagnosis(f).conflicts[0];assert.equal(c.membershipSelection,'SINGLE_FALLBACK');assert.equal(c.uidSelectionBranch,'CANONICAL_MEMBERSHIP');
 assert.equal(c.selectedUidFingerprint,providerUidFingerprint('private-selected-uid'));
});
test('HR UID observer rejects ambiguous membership and conservative query bound',()=>{
 const f=uidDiagFixture();f.users.push(uidDiagMember('private-second-uid'));assert.equal(hrCrosswalkUidDiagnosis(f).unresolved[0].reason,'MEMBERSHIP_DUPLICATE');
 f.users=Array.from({length:8},(_,i)=>uidDiagMember('private-uid-'+i));assert.equal(hrCrosswalkUidDiagnosis(f).unresolved[0].reason,'MEMBERSHIP_QUERY_BOUND_REACHED');
});
test('HR UID observer selects active membership over a superseded alias',()=>{
 const f=uidDiagFixture();f.users.push(uidDiagMember('private-alias-uid','private-source-id',{active:false,status:'superseded',identityState:'superseded_exact_alias'}));
 assert.equal(hrCrosswalkUidDiagnosis(f).conflicts[0].selectedUidFingerprint,providerUidFingerprint('private-selected-uid'));
});
test('HR UID observer recovers only one enabled exact Auth principal',()=>{
 const f=uidDiagFixture();f.users=[];f.authUsers=[uidDiagAuth()];let r=hrCrosswalkUidDiagnosis(f);assert.equal(r.conflicts[0].uidSelectionBranch,'EXACT_RECOVERED_AUTH');
 f.authUsers.push(uidDiagAuth('private-other-uid'));assert.equal(hrCrosswalkUidDiagnosis(f).unresolved[0].reason,'AUTH_PRINCIPAL_AMBIGUOUS');
 f.authUsers=[uidDiagAuth('private-selected-uid','private-source-id',{disabled:true})];assert.equal(hrCrosswalkUidDiagnosis(f).unresolved[0].reason,'AUTH_PRINCIPAL_DISABLED');
 f.authUsers=[];r=hrCrosswalkUidDiagnosis(f);assert.equal(r.conflicts[0].uidSelectionBranch,'DETERMINISTIC_NEW_UID');
});
test('HR UID observer uses tenants and singular project claims with inferred shopper namespace',()=>{
 const f=uidDiagFixture();f.users=[];f.authUsers=[uidDiagAuth('private-selected-uid','private-source-id',{customClaims:{tenants:['tenant-safe'],shopperId:'private-source-id',role:'shopper',projectId:'project-safe'}})];
 assert.equal(hrCrosswalkUidDiagnosis(f).conflicts[0].uidSelectionBranch,'EXACT_RECOVERED_AUTH');
});
function uidDiagIoFixture(options={}){
 const f=uidDiagFixture(),collections={users:f.users,shopperIdentityLinks:f.links,shopperIdentityCrosswalk:f.crosswalks,shoppers:f.profiles,shopperIdentityReviewResolutions:[]};let transactions=0,authCalls=0;
 const mutations=[];const failWrite=name=>()=>{mutations.push(name);throw Error('UNEXPECTED_WRITE_'+name);};
 const db={collection(name){assert.equal(name,'tenants');return{doc(id){assert.equal(id,f.tenantId);return{collection(collection){return{select(...mask){assert.ok(mask.length);assert.equal(mask.some(k=>/email|name|password|login|phone|credential/i.test(k)&&!['authNamespace','sourceNamespace'].includes(k)),false);return{collection,mask};}};}};}};},
 async runTransaction(fn,config){assert.deepEqual(config,{readOnly:true});transactions++;
  return fn({get:async query=>({docs:collections[query.collection].map(d=>({id:d.id,ref:{path:d.path},updateTime:{...uidDiagStamp,nanoseconds:uidDiagStamp.nanoseconds+(options.nanosecondDrift&&transactions===2?1:0)},data:()=>structuredClone(d.data)}))}),set:failWrite('set'),update:failWrite('update'),delete:failWrite('delete')});}};
 const auth={createUser:failWrite('createUser'),updateUser:failWrite('updateUser'),deleteUser:failWrite('deleteUser'),setCustomUserClaims:failWrite('claims'),async listUsers(size,token){assert.equal(size,1000);authCalls++;
  if(token&&options.repeatToken)return{users:[],pageToken:'next'};
  const u=structuredClone(token?f.authUsers[1]:f.authUsers[0]);if(options.authDrift&&authCalls>2)u.customClaims.projectIds=['foreign'];
  return{users:[u],...(token?{}:{pageToken:'next'})};}};
 return{args:{db,auth,snapshot:{tenantId:f.tenantId,projectId:f.projectId,sourceSafe:true,imported:false,_runtime:{revision:'a'.repeat(64)},shoppers:[{shopperId:'private-source-id'}],visits:[]},tenantId:f.tenantId,projectId:f.projectId,revision:'a'.repeat(64),sourceDir:process.cwd()},stats:()=>({transactions,authCalls,mutations})};
}
test('HR UID IO uses read-only transactions, complete Auth pagination and stable second reads',async()=>{
 const f=uidDiagIoFixture(),r=await hrCrosswalkUidReadOnly(f.args);
 assert.equal(r.completeAuthPagination,true);assert.equal(r.independentReadStability,true);assert.equal(r.conflicts[0].storedFingerprintAuthOwners.length,1);
 assert.deepEqual(f.stats(),{transactions:2,authCalls:4,mutations:[]});assert.deepEqual(r.conflicts[0].crossUpdateTime,uidDiagStamp);
 assert.equal(JSON.stringify(r).includes('private-selected-uid'),false);assert.equal(JSON.stringify(r).includes('private@example.invalid'),false);
});
test('HR UID IO rejects nanosecond drift within the same millisecond',async()=>{
 await assert.rejects(()=>hrCrosswalkUidReadOnly(uidDiagIoFixture({nanosecondDrift:true}).args),/HR_UID_DIAG_IDENTITY_CHANGED_DURING_READ/);
});
test('HR UID IO rejects Auth claim drift and repeated page tokens',async()=>{
 await assert.rejects(()=>hrCrosswalkUidReadOnly(uidDiagIoFixture({authDrift:true}).args),/HR_UID_DIAG_IDENTITY_CHANGED_DURING_READ/);
 await assert.rejects(()=>hrCrosswalkUidReadOnly(uidDiagIoFixture({repeatToken:true}).args),/HR_UID_DIAG_AUTH_PAGINATION/);
});
test('HR UID IO rejects revision or tenant mismatch before reads',async()=>{
 const f=uidDiagIoFixture();f.args.snapshot._runtime.revision='b'.repeat(64);
 await assert.rejects(()=>hrCrosswalkUidReadOnly(f.args),/HR_UID_DIAG_SOURCE/);assert.deepEqual(f.stats(),{transactions:0,authCalls:0,mutations:[]});
});

function uidAuthorityFixture(){
 const canonical='private-source-id',keeper='private-selected-uid',retired='private-old-uid',ref='private-receipt',linkId='private-current-link';
 const f=uidDiagFixture();f.users.push(uidDiagMember(retired,canonical,{active:false,status:'superseded',identityState:'superseded_exact_alias',supersededByShopperId:canonical,supersededByUidFingerprint:providerUidFingerprint(keeper)}));
 f.profiles[0].data.identityAuthorityRef=ref;Object.assign(f.crosswalks[0].data,{identityAuthorityRef:ref,identityAuthority:'tenant_adjudication',providerUidFingerprint:providerUidFingerprint(keeper)});
 f.links=[uidDiagDoc('shopperIdentityLinks',linkId,{tenantId:f.tenantId,canonicalShopperId:canonical,projectScope:f.projectId,status:'active',authorityType:'tenant_adjudication',authorityRef:ref,providerAck:true,humanConfirmed:true})];
 const receipt={...uidDiagDoc('commandReceipts',ref,{status:'committed',commandType:'shopper.identity.adjudicate',commandDigest:'a'.repeat(64),shopperId:canonical,providerAck:true,actorUid:'private-admin-uid',identityLinkId:linkId,identityConsolidated:true,keeperUidFingerprint:providerUidFingerprint(keeper),retiredPrincipalCount:1}),exists:true};
 const conflict={sourceIdHash:uidDiagHash('private-alias-source'),canonicalIdHash:uidDiagHash(canonical),selectedUidHash:uidDiagHash(keeper),selectedUidFingerprint:providerUidFingerprint(keeper),linkEvidence:[],storedFingerprintMembershipOwners:[{uidHash:uidDiagHash(retired)}]};
 return{...f,diagnosis:{conflicts:[conflict]},receipts:[receipt],resolutions:[]};
}
test('HR UID authority projection preserves exact keeper receipt, canonical crosswalk and retired target facts',()=>{
 const f=uidAuthorityFixture(),r=hrUidAuthorityProjection(f)[0];
 assert.equal(r.canonicalCrosswalk.keeperMatches,true);assert.equal(r.canonicalCrosswalk.profileAuthorityRefMatches,true);
 assert.equal(r.retiredMembershipTargets[0].targetCanonicalMatches,true);assert.equal(r.retiredMembershipTargets[0].targetKeeperMatches,true);
 const a=r.authorityReceipts[0];assert.equal(a.exists,true);assert.equal(a.keeperMatches,true);assert.equal(a.canonicalMatches,true);assert.equal(a.providerAck,true);assert.equal(a.identityConsolidated,true);
 assert.equal(a.identityLink.scopeExact,true);assert.equal(a.identityLink.authorityRefMatches,true);assert.equal(a.identityLink.humanConfirmed,true);
 assert.equal(r.repairAuthorized,undefined);
 for(const value of ['private-source-id','private-selected-uid','private-old-uid','private-receipt','private-admin-uid','private-current-link'])assert.equal(JSON.stringify(r).includes(value),false);
});
for(const [name,change,path] of [
 ['missing receipt',f=>f.receipts=[],r=>r.authorityReceipts[0].exists],
 ['different keeper',f=>f.receipts[0].data.keeperUidFingerprint='b'.repeat(64),r=>r.authorityReceipts[0].keeperMatches],
 ['missing keeper',f=>delete f.receipts[0].data.keeperUidFingerprint,r=>r.authorityReceipts[0].keeperMatches],
 ['other canonical',f=>f.receipts[0].data.shopperId='private-other',r=>r.authorityReceipts[0].canonicalMatches],
 ['uncommitted receipt',f=>f.receipts[0].data.status='partial',r=>r.authorityReceipts[0].status=== 'committed'],
 ['missing ACK',f=>f.receipts[0].data.providerAck=false,r=>r.authorityReceipts[0].providerAck],
 ['different authority',f=>f.links[0].data.authorityRef='private-other',r=>r.authorityReceipts[0].identityLink.authorityRefMatches],
 ['foreign tenant',f=>f.links[0].data.tenantId='foreign',r=>r.authorityReceipts[0].identityLink.scopeExact],
 ['foreign project',f=>f.links[0].data.projectScope='foreign',r=>r.authorityReceipts[0].identityLink.scopeExact],
 ['period scoped link',f=>f.links[0].data.periodId='private-period',r=>r.authorityReceipts[0].identityLink.scopeExact],
 ['retired target other keeper',f=>f.users[1].data.supersededByUidFingerprint='b'.repeat(64),r=>r.retiredMembershipTargets[0].targetKeeperMatches],
 ['retired target other canonical',f=>f.users[1].data.supersededByShopperId='private-other',r=>r.retiredMembershipTargets[0].targetCanonicalMatches],
 ['canonical crosswalk other authority',f=>f.crosswalks[0].data.identityAuthorityRef='private-other',r=>r.canonicalCrosswalk.profileAuthorityRefMatches]
])test('HR UID authority projection does not invent '+name,()=>{
 const f=uidAuthorityFixture();change(f);assert.equal(path(hrUidAuthorityProjection(f)[0]),false);
});
test('HR UID authority projection exposes same-project distinct decisions without identity remap',()=>{
 const f=uidAuthorityFixture();f.resolutions=[uidDiagDoc('shopperIdentityReviewResolutions','private-resolution',{tenantId:f.tenantId,projectScope:f.projectId,status:'resolved_distinct',shopperIds:['private-alias-source','private-source-id'],evidenceFingerprint:'a'.repeat(64),identityRemap:false})];
 const r=hrUidAuthorityProjection(f)[0];assert.equal(r.distinctDecisions.length,1);assert.equal(r.distinctDecisions[0].identityRemap,false);
 f.resolutions[0].data.projectScope='other';assert.equal(hrUidAuthorityProjection(f)[0].distinctDecisions.length,0);
});
test('HR UID authority projection never treats malformed references or fingerprints as approved',()=>{
 const f=uidAuthorityFixture();f.profiles[0].data.identityAuthorityRef='private/path/receipt';f.receipts=[];f.users[1].data.supersededByUidFingerprint='private-value';
 const r=hrUidAuthorityProjection(f)[0];assert.equal(r.authorityReceipts[0].referenceValid,false);assert.equal(r.authorityReceipts[0].exists,false);assert.equal(r.retiredMembershipTargets[0].targetKeeperMatches,false);assert.equal(JSON.stringify(r).includes('private-value'),false);
});

function uidAuthorityIoFixture({receiptDrift=false}={}){
 const f=uidAuthorityFixture(),alias='private-alias-source',canonical='private-source-id';
 Object.assign(f.links[0].data,{sourceSystem:'hr_external',sourceIdentityKey:alias,exactAliases:[alias]});
 f.crosswalks.push(uidDiagDoc('shopperIdentityCrosswalk',alias,{tenantId:f.tenantId,sourceStableKey:alias,shopperId:canonical,providerUidFingerprint:providerUidFingerprint('private-old-uid'),sourceType:'hr_external',identityMode:'provider_exact_identity_link'}));
 f.authUsers[1].disabled=true;
 const collections={users:f.users,shopperIdentityLinks:f.links,shopperIdentityCrosswalk:f.crosswalks,shoppers:f.profiles,shopperIdentityReviewResolutions:[]};
 let txCount=0,receiptReads=0,writes=0;
 const forbidden=()=>{writes++;throw Error('WRITE_FORBIDDEN');};
 const db={collection(name){assert.equal(name,'tenants');return{doc(id){assert.equal(id,f.tenantId);return{collection(name){return{select:(...mask)=>({name,mask}),doc:id=>({id,path:'tenants/'+f.tenantId+'/'+name+'/'+id})};}};}};},
 async runTransaction(fn,config){assert.deepEqual(config,{readOnly:true});txCount++;
  return fn({get:async q=>({docs:collections[q.name].map(d=>({id:d.id,ref:{path:d.path},updateTime:uidDiagStamp,data:()=>structuredClone(d.data)}))}),
   getAll:async(...args)=>{receiptReads++;const mask=args.pop();assert.ok(mask.fieldMask.includes('keeperUidFingerprint'));return args.map(ref=>{const d=f.receipts.find(x=>x.id===ref.id);return{id:ref.id,ref,exists:!!d,updateTime:{...uidDiagStamp,nanoseconds:uidDiagStamp.nanoseconds+(receiptDrift&&receiptReads===2?1:0)},data:()=>structuredClone(d?.data||{})};});},
   set:forbidden,update:forbidden,delete:forbidden});}};
 const auth={listUsers:async()=>({users:f.authUsers}),createUser:forbidden,updateUser:forbidden,deleteUser:forbidden,setCustomUserClaims:forbidden};
 return{args:{db,auth,snapshot:{tenantId:f.tenantId,projectId:f.projectId,sourceSafe:true,imported:false,_runtime:{revision:'a'.repeat(64)},shoppers:[{shopperId:alias}],visits:[]},tenantId:f.tenantId,projectId:f.projectId,revision:'a'.repeat(64),sourceDir:process.cwd()},stats:()=>({txCount,receiptReads,writes})};
}
test('HR UID IO reads authority receipts twice under read-only transactions and exposes no principal identifiers',async()=>{
 const f=uidAuthorityIoFixture(),r=await hrCrosswalkUidReadOnly(f.args);
 assert.equal(r.authorityChains.length,1);assert.equal(r.authorityChains[0].authorityReceipts[0].keeperMatches,true);assert.equal(r.authorityChains[0].retiredMembershipTargets[0].targetKeeperMatches,true);
 assert.deepEqual(f.stats(),{txCount:4,receiptReads:2,writes:0});assert.match(r.authorityReceiptsSha256,/^[a-f0-9]{64}$/);assert.equal(JSON.stringify(r).includes('private-selected-uid'),false);
});
test('HR UID IO refuses receipt nanosecond drift during authority readback',async()=>{
 const f=uidAuthorityIoFixture({receiptDrift:true});await assert.rejects(()=>hrCrosswalkUidReadOnly(f.args),/HR_UID_DIAG_IDENTITY_CHANGED_DURING_READ/);assert.equal(f.stats().writes,0);
});

function hrUidBindingFixture(){
 const sourceSha='a'.repeat(40),sourceTree='b'.repeat(40),seal={mode:'CURRENT_SOURCE_SERVING',sourceSha,sourceTree,runtimeRevision:'dev-r1',runtimeDigest:'sha256:'+'c'.repeat(64),hostingVersion:'sites/dev/versions/current',hrRevision:'d'.repeat(64),receiptPath:'docs/checkpoints/paired.json',receiptBlob:'e'.repeat(40)};
 const material={...seal,builds:1,runtimeDeploys:1,hostingDeploys:1};
 const descriptor={productSourceSha:sourceSha,productTreeAuthority:sourceTree,postDeployRunSeal:seal,currentMaterialization:material,hrUidReadOnlyRequest:{...seal,scope:'HR_DURABLE_REVISION_READONLY',enabled:true,production:false,providerWrites:0}};
 const pointer={productSourceSha:sourceSha,productTree:sourceTree,postDeployRunSeal:structuredClone(seal),production:'DO_NOT_TOUCH',authorizationI4:false};
 const receipt={schemaVersion:'cxorbia.i3.current-source-dev-materialization.v1',sourceSha,sourceTree,materialization:material,production:false,i4Authorized:false,productionUnchanged:true};
 return{descriptor,pointer,receipt,sourceSha,sourceTree,receiptBlob:seal.receiptBlob,treeExact:true,productDiffClean:true,branchName:'recovery/cxorbia-phase-a-20260831',writeGate:''};
}
test('HR UID readonly gate accepts only the explicit current exact paired source and receipt',()=>{
 const f=hrUidBindingFixture(),r=validateHrUidDiagnosticBinding(f);assert.equal(r.sourceSha,f.sourceSha);assert.equal(r.production,false);
 assert.equal(r.scope,'EXACT_CURRENT_PAIRED_DEV_READ_ONLY');
});
for(const [name,change] of [
 ['fixture write gate',f=>f.writeGate='PAULA_AUTHORIZED_RUN2382_DEV_ONLY'],
 ['other branch',f=>f.branchName='main'],
 ['product uncommitted drift',f=>f.productDiffClean=false],
 ['wrong tree',f=>f.treeExact=false],
 ['different source',f=>f.sourceSha='f'.repeat(40)],
 ['foreign receipt blob',f=>f.receiptBlob='f'.repeat(40)],
 ['pending successor',f=>f.descriptor.pendingDevSuccessor={sourceSha:'f'.repeat(40)}],
 ['hosting-only state',f=>f.pointer.currentHostingOnlyDevMaterialization={}],
 ['different served revision',f=>f.descriptor.postDeployRunSeal.runtimeRevision='dev-old'],
 ['another pinned HR revision',f=>f.descriptor.hrUidReadOnlyRequest.hrRevision='f'.repeat(64)],
 ['disabled request',f=>f.descriptor.hrUidReadOnlyRequest.enabled=false],
 ['provider writes requested',f=>f.descriptor.hrUidReadOnlyRequest.providerWrites=1],
 ['production authorized',f=>f.pointer.authorizationI4=true],
 ['production receipt',f=>f.receipt.production=true],
 ['missing paired build',f=>f.receipt.materialization.builds=0]
])test('HR UID readonly gate rejects '+name,()=>{
 const f=hrUidBindingFixture();change(f);assert.throws(()=>validateHrUidDiagnosticBinding(f),/HR_UID_READONLY_/);
});


const currentJournalStable=v=>Array.isArray(v)?v.map(currentJournalStable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,currentJournalStable(v[k])])):v;
const currentJournalHash=v=>createHash('sha256').update(JSON.stringify(currentJournalStable(v))).digest('hex');
function currentJournalFixture({auth=false,oldAttempt=false,credentialPending=false}={}){
 const tenantId='tenant-safe',projectId='project-safe',revision='e'.repeat(64),actorUid='private-actor-uid',idempotencyKey='private-native-command-key',attemptId='attempt-new',stamp='2026-11-16T07:00:00.000Z',system=auth?'auth':'firestore';
 const receiptPath='tenants/'+tenantId+'/commandReceipts/hr-'+currentJournalHash([projectId,idempotencyKey]);
 const op={entity:auth?'private-shopper-uid':'tenants/'+tenantId+'/shoppers/private-shopper-id',operation:auth?'updateUser':'set',fields:['active'],expectedDigest:'f'.repeat(64)};
 const effect={stage:'shoppers',system,attemptId:oldAttempt?'attempt-old':attemptId,sourceRevision:revision,operations:[op],providerAck:true,readbackVerified:true,credentialAuthenticationPending:credentialPending,committedAt:stamp,readbackAt:stamp,...(auth?{readbackDigest:op.expectedDigest}:{})};
 const intent={stage:effect.stage,system,attemptId:effect.attemptId,status:'pending',startedAt:stamp,operations:auth?[structuredClone(op)]:[]};
 const receipt={version:'cxorbia.hr-reconciliation-receipt.v1',tenantId,projectId,sourceRevision:revision,actorUid,idempotencyKey,attemptId,status:'committed',digest:currentJournalHash({actorUid,scope:{tenantId,projectId},sourceRevision:revision,commandType:'hr.snapshot.reconcile'})};
 receipt.result={commandType:'hr.snapshot.reconcile',tenantId,projectId,sourceRevision:revision,receiptPath,receiptBinding:{tenantId,projectId,sourceRevision:revision,actorUid,idempotencyKey,commandType:'hr.snapshot.reconcile'},providerWritesScope:'cumulative_command_effects',intentCollectionPath:receiptPath+'/intents',effectCollectionPath:receiptPath+'/effects',status:'committed',ok:true,committed:true,providerAck:true,readbackVerified:false,authWrites:auth?1:0,firestoreWrites:auth?0:1,confirmedProviderWrites:1,providerWrites:1,unresolvedEffects:0,unverifiedEffects:0,credentialAuthenticationPending:credentialPending,credentialReadback:credentialPending?'PROVIDER_ACK_ONLY_AUTHENTICATION_GATE_PENDING':'NO_CREDENTIAL_CHANGE',applicationWritesThisAttempt:{auth:!oldAttempt&&auth?1:0,firestore:!oldAttempt&&!auth?1:0}};
 return {receipt,receiptPath,tenantId,projectId,revision,intents:[{id:'private-operation-id',data:intent}],effects:[{id:'private-operation-id',data:effect}],complete:true};
}
function journalPagesFixture(count,{repeat=false,failPage=0}={}){
 const docs=Array.from({length:count},(_,n)=>({id:String(n).padStart(6,'0'),ref:{path:'safe/collection/'+n},data:()=>({n})})),calls=[],cursors=[];
 const query={startAfter(cursor){cursors.push(cursor);return make(cursor);},limit(size){return {size,cursor:null};}};
 const make=cursor=>({limit:size=>({size,cursor})});
 const tx={get:async q=>{calls.push(q);if(calls.length===failPage)throw Error('server page unavailable');const start=q.cursor?docs.indexOf(q.cursor)+1:0;const page=repeat&&q.cursor?docs.slice(0,q.size):docs.slice(start,start+q.size);return {size:page.length,docs:page};}};
 return {docs,calls,cursors,query,tx};
}
for(const n of [0,500,501])test('current journal pagination reads every document and proves end '+n,async()=>{
 const f=journalPagesFixture(n),r=await b14ReadJournalPage(f.tx,f.query);
 assert.equal(r.complete,true);assert.equal(r.size,n);assert.equal(r.pages,n>=500?2:1);assert.equal(new Set(r.docs.map(d=>d.id)).size,n);
 if(n>=500)assert.equal(f.cursors[0],f.docs[499]);
});
test('current journal pagination rejects repeated cursor records',async()=>{const f=journalPagesFixture(501,{repeat:true});await assert.rejects(()=>b14ReadJournalPage(f.tx,f.query),/CURSOR_REPEATED/);});
test('current journal pagination propagates later server failure',async()=>{const f=journalPagesFixture(501,{failPage:2});await assert.rejects(()=>b14ReadJournalPage(f.tx,f.query),/server page unavailable/);});
test('current journal pagination does not label a full final page complete',async()=>{const f=journalPagesFixture(100);await assert.rejects(()=>b14ReadJournalPage(f.tx,f.query,{pageSize:1,maxPages:100}),/PAGE_LIMIT/);});
test('current journal pagination rejects invalid options before IO',async()=>{const f=journalPagesFixture(1);await assert.rejects(()=>b14ReadJournalPage(f.tx,f.query,{pageSize:501}),/PAGINATION_OPTIONS/);assert.equal(f.calls.length,0);});
for(const options of [{},{auth:true},{auth:true,oldAttempt:true},{auth:true,credentialPending:true}])test('current journal verifies exact operations including cumulative earlier attempt '+JSON.stringify(options),()=>{
 const f=currentJournalFixture(options),r=b14SummarizeCurrentJournal(f);
 assert.equal(r.journalVerified,true);assert.equal(r.receiptTerminalCommitted,true);assert.equal(r.confirmedProviderWritesObserved,1);
 assert.equal(r.authenticationVerified,false);assert.equal(r.remoteHrAck,false);assert.equal(r.b14Closed,false);assert.equal(r.writes,0);
 assert.equal(r.decision,options.credentialPending?'VERIFIED_COMMITTED_JOURNAL_AUTHENTICATION_PENDING':'VERIFIED_COMMITTED_JOURNAL_NO_CREDENTIAL_CHANGE');
 for(const secret of ['private-actor-uid','private-native-command-key','private-shopper-uid','private-shopper-id','private-operation-id',f.receiptPath])assert.equal(JSON.stringify(r).includes(secret),false);
});
for(const [label,change]of [
 ['wrong receipt actor',f=>{f.receipt.result.receiptBinding.actorUid='foreign';}],
 ['wrong receipt counts',f=>{f.receipt.result.providerWrites=0;}],
 ['wrong effect system',f=>{f.effects[0].data.system='auth';}],
 ['wrong effect stage',f=>{f.effects[0].data.stage='visits';}],
 ['wrong effect attempt',f=>{f.effects[0].data.attemptId='not-intent';}],
 ['wrong effect revision',f=>{f.effects[0].data.sourceRevision='b'.repeat(64);}],
 ['unsafe entity path',f=>{f.effects[0].data.operations[0].entity='tenants/foreign/shoppers/private';}],
 ['orphan effect',f=>{f.effects[0].id='orphan';}],
 ['duplicate intent',f=>{f.intents.push(structuredClone(f.intents[0]));}],
 ['duplicate effect',f=>{f.effects.push(structuredClone(f.effects[0]));}],
 ['pending without effect',f=>{f.effects=[];}],
 ['uncertain without effect',f=>{f.effects=[];f.intents[0].data.status='uncertain';}],
 ['missing effect ACK',f=>{f.effects[0].data.providerAck=false;}],
 ['incomplete journal',f=>{f.complete=false;}]
])test('current journal refuses '+label,()=>{const f=currentJournalFixture();change(f);assert.equal(b14SummarizeCurrentJournal(f).journalVerified,false);});
for(const [label,change]of [
 ['operation differs',f=>{f.effects[0].data.operations[0].fields=['other'];}],
 ['readback differs',f=>{f.effects[0].data.readbackDigest='b'.repeat(64);}]
])test('current journal refuses Auth '+label,()=>{const f=currentJournalFixture({auth:true});change(f);assert.equal(b14SummarizeCurrentJournal(f).journalVerified,false);});
test('current journal counts a finished Firestore no_effect separately from unresolved Auth',()=>{
 const f=currentJournalFixture(),r=f.receipt.result;f.effects=[];f.intents[0].data.status='no_effect';f.intents[0].data.finishedAt='2026-11-16T07:00:01.000Z';
 Object.assign(r,{firestoreWrites:0,providerWrites:0,confirmedProviderWrites:0,applicationWritesThisAttempt:{auth:0,firestore:0}});
 assert.equal(b14SummarizeCurrentJournal(f).journalVerified,true);
 f.intents[0].data.system='auth';assert.equal(b14SummarizeCurrentJournal(f).journalVerified,false);
});
test('current journal detects an unverified effect beyond the old 501 document bound',()=>{
 const f=currentJournalFixture(),intent=f.intents[0],effect=f.effects[0];
 f.intents=Array.from({length:502},(_,i)=>({id:'i'+i,data:structuredClone(intent.data)}));f.effects=Array.from({length:502},(_,i)=>({id:'i'+i,data:structuredClone(effect.data)}));f.effects[501].data.readbackVerified=false;
 Object.assign(f.receipt.result,{firestoreWrites:502,providerWrites:502,confirmedProviderWrites:502,unverifiedEffects:1,applicationWritesThisAttempt:{auth:0,firestore:502}});
 const r=b14SummarizeCurrentJournal(f);assert.equal(r.complete,true);assert.equal(r.effectsObserved,502);assert.equal(r.unverifiedEffectsObserved,1);assert.equal(r.countsMatch,true);assert.equal(r.journalVerified,false);
});
