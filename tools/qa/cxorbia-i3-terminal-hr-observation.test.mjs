import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {providerUidFingerprint,stableShopperUid} from '../../backend/runtime/cxorbia-shopper-command-provider-v1.mjs';
import {validateTerminalHrObservation} from './cxorbia-i3-terminal-hr-observation.mjs';
import {b14PredecessorReadOnly,b14PrincipalOf,b14DiagnosticError,b14RuntimeAuthority,b14WorkbookFromReaders,b14CapabilityVerdict,b14BindingProjection,b14ProjectSourceProjection,b14IntegrationCandidates,b14LeaseReceiptPath,hrCrosswalkUidDiagnosis,hrCrosswalkUidReadOnly} from './cxorbia-i3-hr-ack-exact-same-revision.mjs';
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
 const f=uidDiagFixture(),collections={users:f.users,shopperIdentityLinks:f.links,shopperIdentityCrosswalk:f.crosswalks,shoppers:f.profiles};let transactions=0,authCalls=0;
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
