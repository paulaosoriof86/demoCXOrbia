import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {commandDigest, requireProviderAck, reservationLifecyclePassed, restoreAssignment,
  FIXTURE_INPUT_FILES,FIXTURE_TEST_IDS,fixtureFileHash,validateFixturePrerequisites,
  validateFixtureHrObservation,readFixtureFinalHr,validateSealedFixtureReceipt,dispatchTrackedFixtureCreation,requireFixtureCreationReceipt,
  fixtureApplicationId,fixturePlatformIdentityLinkId,fixtureAuthSnapshot,requireFixtureShopperOwnership,
  requireFixtureApplicationOwnership,fixtureProposedDate,deleteOwnedFixtureDocuments} from './cxorbia-i3-live-fixture-contract.mjs';

const ack={ok:true,committed:true,providerAck:true,successUiAllowed:true};
for(const key of Object.keys(ack))for(const value of [false,undefined,'true'])test(`reject ${key}=${value}`,()=>{
  assert.throws(()=>requireProviderAck({...ack,[key]:value},'RESERVE'),/ACK_NOT_COMMITTED/);
});
test('read-only reservation readiness never proves CRUD',()=>assert.equal(reservationLifecyclePassed({ok:true,source:'durable_provider',created:false,statusAck:false,deleted:false}),false));
const lifecycle={operationKind:'SYNTHETIC_PROVIDER_LIFECYCLE',production:false,duplicateCount:0,
  ...Object.fromEntries(['created','createAck','statusAck','deleted','deleteAck','independentFirestoreReadback','reloadReadback','absentAfterReload','idempotentReplay','cleanupVerified'].map(k=>[k,true]))};
test('complete observed reservation lifecycle qualifies',()=>assert.equal(reservationLifecyclePassed(lifecycle),true));
for(const key of Object.keys(lifecycle).filter(k=>lifecycle[k]===true))test('no reservation PASS without '+key,()=>assert.equal(reservationLifecyclePassed({...lifecycle,[key]:false}),false));

const time=n=>({isEqual:other=>other?.nanoseconds===n,nanoseconds:n});
function fixture(){
  const before={tenantId:'t',projectId:'p',periodId:'period',shopperId:null,estado:'disponible',status:'disponible',version:4,hrRowId:'hr-1',retained:'business-field'};
  const command={commandType:'visit.assign',entityId:'v',tenantId:'t',projectId:'p',periodId:'period',idempotencyKey:'fixture',expectedVersion:4,payload:{shopperId:'qa',hrRowId:'hr-1'}};
  const after={...before,shopperId:'qa',estado:'asignada',status:'asignada',assignmentSource:'platform',assignmentSyncStatus:'pending_hr',lastSyncedAt:null,updatedAt:'2026-11-15T01:00:00Z',version:5};
  const state={visit:after,visitTime:time(2),receipt:{status:'committed',providerAck:true,commandDigest:commandDigest(command),commandType:command.commandType,entityId:'v',actorUid:'admin'},receiptTime:time(2),writes:0};
  const snap=kind=>({exists:state[kind]!=null,data:()=>structuredClone(state[kind]),updateTime:state[kind+'Time']});
  const ref={path:'visits/v',get:async()=>snap('visit')},receiptRef={path:'receipts/r'};
  const db={runTransaction:async fn=>fn({get:async r=>snap(r===ref?'visit':'receipt'),set:(r,data)=>{assert.equal(r,ref);state.visit=structuredClone(data);state.visitTime=time(3);state.writes++;}})};
  return {db,state,journal:{ref,receiptRef,beforeData:before,beforeUpdateTime:time(1),command,actorUid:'admin',submitted:true,requestResolved:false}};
}
test('lost HTTP response after committed assignment still restores exact before image',async()=>{
  const {db,state,journal}=fixture();const r=await restoreAssignment(db,journal);
  assert.equal(r.exactReadback,true);assert.deepEqual(state.visit,journal.beforeData);assert.equal(state.writes,1);
  await restoreAssignment(db,journal);assert.equal(state.writes,1);
});
for(const [name,mutate,code] of [
  ['later same-millisecond write',s=>s.visitTime=time(3),'CONCURRENT_WRITE'],
  ['different target',s=>s.receipt.entityId='other','RECEIPT_MISMATCH'],
  ['different actor',s=>s.receipt.actorUid='other','RECEIPT_MISMATCH'],
  ['different digest',s=>s.receipt.commandDigest='0'.repeat(64),'RECEIPT_MISMATCH'],
  ['false provider ACK',s=>s.receipt.providerAck=false,'RECEIPT_MISMATCH'],
  ['unrelated field edited',s=>s.visit.retained='changed','POSTIMAGE_CONFLICT'],
  ['different assigned shopper',s=>s.visit.shopperId='real-shopper','POSTIMAGE_CONFLICT'],
  ['later version',s=>s.visit.version=6,'POSTIMAGE_CONFLICT'],
  ['missing receipt',s=>s.receipt=null,'RECEIPT_MISSING'],
  ['missing visit',s=>s.visit=null,'VISIT_MISSING']
])test('restore fails closed: '+name,async()=>{
  const {db,state,journal}=fixture();mutate(state);
  await assert.rejects(restoreAssignment(db,journal),new RegExp(code));assert.equal(state.writes,0);assert.notEqual(journal.restored,true);
});
test('ambiguous in-flight request is not called clean merely because before image remains',async()=>{
  const {db,state,journal}=fixture();state.visit=structuredClone(journal.beforeData);state.visitTime=time(1);state.receipt=null;
  await assert.rejects(restoreAssignment(db,journal),/AMBIGUOUS_REQUEST/);assert.equal(state.writes,0);
});
test('known blocked command leaves exact before image without writes',async()=>{
  const {db,state,journal}=fixture();state.visit=structuredClone(journal.beforeData);state.visitTime=time(1);state.receipt=null;journal.outcome='BLOCKED_NO_WRITES';
  assert.equal((await restoreAssignment(db,journal)).writes,0);
});
test('committed HTTP ACK without durable receipt does not authorize cleanup',async()=>{
  const {db,state,journal}=fixture();state.visit=structuredClone(journal.beforeData);state.visitTime=time(1);state.receipt=null;journal.outcome='COMMITTED_ACK';
  await assert.rejects(restoreAssignment(db,journal),/AMBIGUOUS_REQUEST/);
});
test('readback error prevents fixture cleanup authorization',async()=>{
  const {db,journal}=fixture();journal.ref.get=async()=>{throw new Error('readback unavailable');};
  await assert.rejects(restoreAssignment(db,journal),/readback unavailable/);assert.notEqual(journal.restored,true);
});
test('lost creation response preserves every registered target and durable intent before POST',async()=>{
  const events=[],journal={command:{idempotencyKey:'one'},entityId:'new',actorUid:'a'},targets=['profile','membership','crosswalk','link','auth','receipt'];
  await assert.rejects(dispatchTrackedFixtureCreation({journal,checkAbsence:async()=>true,
    register:()=>events.push(...targets),persist:async()=>events.push('journal:'+journal.submitted),
    send:async()=>{assert.deepEqual(events.slice(0,6),targets);assert.equal(events.at(-1),'journal:true');throw new Error('lost response');}}),/lost response/);
  assert.equal(journal.submitted,true);assert.equal(journal.outcome,'AMBIGUOUS');assert.equal(events.at(-1),'journal:true');
  assert.throws(()=>requireFixtureCreationReceipt(journal,null),/UNRESOLVED/);
});
test('preexisting identity-link or postulation blocks registration and dispatch',async()=>{
  let registered=false,sent=false;
  await assert.rejects(dispatchTrackedFixtureCreation({journal:{},checkAbsence:async()=>false,
    register:()=>{registered=true;},persist:async()=>{},send:async()=>{sent=true;}}),/PREFLIGHT_COLLISION/);
  assert.equal(registered,false);assert.equal(sent,false);
});
test('provider blocked with zero reported writes cannot certify a partial creation clean',async()=>{
  const journal={command:{commandType:'shopper.create'},entityId:'qa',actorUid:'a'};
  await dispatchTrackedFixtureCreation({journal,checkAbsence:async()=>true,register:()=>{},persist:async()=>{},
    send:async()=>({ok:false,providerWrites:0,status:'blocked'})});
  assert.throws(()=>requireFixtureCreationReceipt(journal,null),/UNRESOLVED/);
});
test('exact committed receipt resolves a lost creation response; unrelated actor or entity does not',()=>{
  const journal={preflightAbsent:true,submitted:true,command:{commandType:'shopper.create',tenantId:'t',projectId:'p',periodId:'period',idempotencyKey:'run'},entityId:'qa',actorUid:'a'};
  const receipt={status:'committed',providerAck:true,commandType:'shopper.create',commandDigest:commandDigest(journal.command),shopperId:'qa',actorUid:'a'};
  assert.equal(requireFixtureCreationReceipt(journal,receipt),true);
  for(const patch of [{actorUid:'other'},{shopperId:'other'},{commandDigest:'old'},{providerAck:false}])
    assert.throws(()=>requireFixtureCreationReceipt(journal,{...receipt,...patch}),/UNRESOLVED_OR_FOREIGN/);
});
test('empty or wrong-provider receipt cannot resolve an ambiguous creation',()=>{
  const bad={preflightAbsent:true,submitted:true,command:{},entityId:''};
  assert.throws(()=>requireFixtureCreationReceipt(bad,{status:'committed',providerAck:true,commandDigest:commandDigest({})}),/UNRESOLVED_OR_FOREIGN/);
  const j={preflightAbsent:true,submitted:true,command:{commandType:'shopper.create',tenantId:'t',projectId:'p',periodId:'period',idempotencyKey:'run'},entityId:'qa',actorUid:'a'};
  const r={status:'committed',providerAck:true,commandType:'shopper.create',commandDigest:commandDigest(j.command),entityId:'qa',actorUid:'a'};
  assert.throws(()=>requireFixtureCreationReceipt(j,r),/UNRESOLVED_OR_FOREIGN/);
  for(const key of ['tenantId','projectId','periodId','idempotencyKey']){
    const invalid=structuredClone(j);delete invalid.command[key];
    assert.throws(()=>requireFixtureCreationReceipt(invalid,{...r,shopperId:'qa',commandDigest:commandDigest(invalid.command)}),/UNRESOLVED_OR_FOREIGN/);
  }
});
function shopperOwnershipFixture(){
  const command={tenantId:'t',projectId:'p'},entityId='s',uid='uid',key='platform:t:s';
  const fingerprint=crypto.createHash('sha256').update('cxorbia-provider-uid-v1\0'+uid).digest('hex');
  const profile={nombre:'Nora Test',pais:'GT',whatsapp:'123',email:''},visibleLogin='nora.test',identityLinkId=fixturePlatformIdentityLinkId('t','s');
  const j={command,entityId,receiptId:'receipt',fixture:{uid,internalEmail:'qa@auth.cxorbia.invalid',profile,visibleLogin,identityLinkId}};
  const scope={tenantId:'t',shopperId:'s',projectIds:['p']};
  const docs={profile:{...scope,...profile,id:'s',sourceType:'platform',sourceIdentityKey:key,createdVia:'live-fixture',hrSourceRevision:null,visibleLogin},
    membership:{...scope,active:true,role:'shopper',authNamespace:'shopper',providerUidFingerprint:fingerprint,visibleLogin},
    crosswalk:{...scope,authNamespace:'shopper',providerUidFingerprint:fingerprint,sourceStableKey:'s',sourceType:'platform',identityMode:'stable_platform_shopper_id',fuzzyMatching:false},
    link:{tenantId:'t',identityLinkId,canonicalShopperId:'s',sourceSystem:'platform',projectScope:'*',sourceIdentityKey:key,
      sourceAliases:[key,'s'],status:'active',authorityType:'platform_created',authorityRef:'receipt',periodIndependent:true,providerAck:true,providerUidFingerprint:fingerprint}};
  const user={uid,email:j.fixture.internalEmail,disabled:false,customClaims:{authNamespace:'shopper',projectIds:['p'],role:'shopper',shopperId:'s',tenantId:'t'},metadata:{creationTime:'time'}};
  return {j,docs,user};
}
test('committed synthetic shopper ownership binds all four docs and complete Auth claims',()=>{
  const x=shopperOwnershipFixture();assert.equal(requireFixtureShopperOwnership(x.j,x.docs,x.user),true);
  assert.equal(fixtureAuthSnapshot(x.user).creationTime,'time');
});
test('Auth snapshot preserves observable concurrent edits while allowing ordinary sign-ins',()=>{
  const {user}=shopperOwnershipFixture(),snapshot=fixtureAuthSnapshot(user);
  assert.deepEqual(fixtureAuthSnapshot({...user,metadata:{...user.metadata,lastSignInTime:'later'}}),snapshot);
  for(const patch of [{phoneNumber:'+123'},{emailVerified:true},{tokensValidAfterTime:'later'},{providerData:[{providerId:'google.com'}]},
    {multiFactor:{enrolledFactors:[{uid:'new'}]}}])assert.notDeepEqual(fixtureAuthSnapshot({...user,...patch}),snapshot);
});
test('cleanup checks new commercial references inside the same transaction before deleting any identity',async()=>{
  const ref={path:'profiles/qa'},query={},snapshot={ref,exists:true,updateTime:time(1),data:()=>({owned:true})};
  let deletes=0;
  const db={runTransaction:async callback=>callback({get:async target=>target===query?
    {docs:[{ref:{path:'visits/new-commercial-reference'}}]}:snapshot,delete:()=>{deletes++;}})};
  await assert.rejects(deleteOwnedFixtureDocuments(db,{referenceQueries:[{query,label:'visits'}],ownedPaths:new Set([ref.path]),removals:[snapshot]}),/COMMERCIAL_REFERENCE/);
  assert.equal(deletes,0);
});
test('cleanup transaction verifies all owned versions before its first delete',async()=>{
  const events=[],query={},ref={path:'profile'},snapshot={ref,exists:true,updateTime:time(1),data:()=>({owned:true})};
  const db={runTransaction:async callback=>callback({get:async target=>{events.push(target===query?'references':'owned');return target===query?{docs:[]}:snapshot;},
    delete:(target,condition)=>{events.push('delete');assert.equal(target,ref);assert.equal(condition.lastUpdateTime,snapshot.updateTime);}})};
  assert.equal((await deleteOwnedFixtureDocuments(db,{referenceQueries:[{query,label:'visits'}],ownedPaths:new Set([ref.path]),removals:[snapshot]})).deleted,1);
  assert.deepEqual(events,['references','owned','delete']);
  snapshot.updateTime=time(2);
  const prior={...snapshot,updateTime:time(1)};
  await assert.rejects(deleteOwnedFixtureDocuments(db,{referenceQueries:[],ownedPaths:new Set([ref.path]),removals:[prior]}),/CONCURRENT_DOCUMENT/);
});
for(const [name,change] of [
  ['foreign UID',x=>x.user.uid='other'],['additional privilege',x=>x.user.customClaims.admin=true],
  ['another project',x=>x.docs.profile.projectIds.push('other')],['another receipt',x=>x.docs.link.authorityRef='other'],
  ['HR adoption',x=>x.docs.crosswalk.sourceType='hr_external'],['profile changed',x=>x.docs.profile.whatsapp='999']
])test('cleanup preserves identity with '+name,()=>{
  const x=shopperOwnershipFixture();change(x);assert.throws(()=>requireFixtureShopperOwnership(x.j,x.docs,x.user),/OWNERSHIP_CONFLICT/);
});
test('application cleanup binds exact period, HR row and business payload',()=>{
  const command={tenantId:'t',projectId:'p',periodId:'nov',payload:{visitId:'v',shopperId:'s',hrRowId:'hr',proposedDate:'2026-11-16',note:'fixture'}};
  const j={command,entityId:'app'},a={id:'app',applicationId:'app',postulationId:'app',tenantId:'t',projectId:'p',periodId:'nov',
    visitId:'v',visitaId:'v',shopperId:'s',hrRowId:'hr',fechaProp:'2026-11-16',note:'fixture',source:'platform',status:'pendiente',estado:'pendiente',version:1};
  assert.equal(requireFixtureApplicationOwnership(j,a),true);
  for(const patch of [{periodId:'oct'},{hrRowId:'other'},{status:'aprobada'},{version:2},{shopperId:'other'}])
    assert.throws(()=>requireFixtureApplicationOwnership(j,{...a,...patch}),/OWNERSHIP_CONFLICT/);
});
test('application date uses current project-local day inside explicit HR window',()=>{
  const project={timeZone:'America/Guatemala'},now=new Date('2026-11-16T01:00:00Z');
  assert.equal(fixtureProposedDate({measurementWindowStart:'2026-11-01',measurementWindowEnd:'2026-11-15'},project,now),'2026-11-15');
  assert.equal(fixtureProposedDate({measurementWindowStart:'2026-11-16',measurementWindowEnd:'2026-11-30'},project,now),'2026-11-16');
  for(const visit of [{measurementWindowStart:'2026-10-01',measurementWindowEnd:'2026-10-31'},
    {measurementWindowStart:'2026-11-01'},{measurementWindowStart:'2026-19-01',measurementWindowEnd:'2026-19-31'}])
    assert.equal(fixtureProposedDate(visit,project,now),null);
});
test('preflight resource identifiers include tenant, project, target and idempotency authority',()=>{
  const command={tenantId:'t',projectId:'p',payload:{visitId:'v',shopperId:'s'},idempotencyKey:'run'};
  const app=fixtureApplicationId(command),link=fixturePlatformIdentityLinkId('t','s');
  assert.match(app,/^app-[a-f0-9]{24}$/);assert.match(link,/^irl_[a-f0-9]{32}$/);
  assert.notEqual(fixtureApplicationId({...command,projectId:'other'}),app);
  assert.notEqual(fixtureApplicationId({...command,idempotencyKey:'other'}),app);
  assert.notEqual(fixturePlatformIdentityLinkId('other','s'),link);
});

function prerequisiteFixture(){
  const expected={sourceSha:'a'.repeat(40),sourceTree:'b'.repeat(40),controlHeadSha:'c'.repeat(40),runId:'123',runAttempt:'2',
    firebaseProject:'cxorbia-backend-dev',hostingUrl:'https://cxorbia-backend-dev.web.app',tenantId:'tenant-a',projectId:'project-a',
    periodId:'project-a-current',artifactSha256:fixtureFileHash(Buffer.from([0,128,255,10])),runtimeRevision:'dev-r1',
    runtimeDigest:'sha256:'+'d'.repeat(64),hostingVersion:'sites/dev/versions/v1',hrRevision:'e'.repeat(64)};
  const data={preterminal:{decision:'PASS_C3_PRETERMINAL_SOURCE_READY_EXACT_DEV',sourceSha:expected.sourceSha,sourceTree:expected.sourceTree,
      sourceReadyModules:21,moduleCount:21,matchModules:4,pendingFiles:0,production:false,allApprovedOwnersLoaded:true,
      runtimeRevision:expected.runtimeRevision,runtimeDigest:expected.runtimeDigest,hostingVersion:expected.hostingVersion,firestoreRulesSha256:'f'.repeat(64)},
    sourceQa:{decision:'PASS_I3_SAME_RUN_PATH_BOUND_SOURCE_QA',sourceSha:expected.sourceSha,sourceTree:expected.sourceTree,
      controlSha:expected.controlHeadSha,runId:123,runAttempt:2,production:false},
    human:{decision:'PASS_I3_HUMAN_LIVE_ACCEPTANCE',sourceSha:expected.sourceSha,sourceRevision:expected.hrRevision,
      routeInventory:{expectedRoleRouteEntries:56},production:false,issues:[],pageErrors:[]},
    probes:{decision:'PASS_I3_ATOMIC_FUNCTIONAL_PROBES',sourceSha:expected.sourceSha,sourceRevision:expected.hrRevision,production:false},
    focal:{decision:'PASS_PRE_I4_FOCAL_HUMAN_BROWSER',sourceSha:expected.sourceSha,hrRevision:expected.hrRevision,periodId:expected.periodId,production:false},
    oracle:{decision:'PASS_C3_TERMINAL_HR_SEMANTIC_ORACLE',sourceRevision:expected.hrRevision,currentPeriodId:expected.periodId,projectId:expected.projectId,production:false},
    hr:{_runtime:{revision:expected.hrRevision}},
    hrMeta:{ok:true,revision:expected.hrRevision,revisionStable:true,sourceSafe:true,refreshError:null,writes:false,hrWrites:false,production:false,
      shopperReconciliation:{providerAck:null},visitReconciliation:{providerAck:null}},
    hrStability:{decision:'PASS_TERMINAL_HR_STABLE_REVISION',revision:expected.hrRevision,reconciliationCertified:false,production:false},
    runtimeService:{status:{latestCreatedRevisionName:'dev-r1',latestReadyRevisionName:'dev-r1',traffic:[{revisionName:'dev-r1',percent:100}]}},
    runtime:{metadata:{name:'dev-r1'},status:{imageDigest:expected.runtimeDigest}},hosting:{release:{version:{name:expected.hostingVersion}}},
    rules:{decision:'PASS_TERMINAL_FIRESTORE_RULES_EXACT',production:false,sha256:'f'.repeat(64)}};
  const raw={};
  const refresh=()=>{
    raw[FIXTURE_INPUT_FILES.sourceQa]=Buffer.from(JSON.stringify(data.sourceQa));
    data.preterminal.sameRunSourceQa={receiptSha256:fixtureFileHash(raw[FIXTURE_INPUT_FILES.sourceQa])};
    for(const [key,file] of Object.entries(FIXTURE_INPUT_FILES))raw[file]=Buffer.from(JSON.stringify(data[key]));
    b.evidence=Object.fromEntries(Object.entries(FIXTURE_INPUT_FILES).map(([key,file])=>[key,{path:file,sha256:fixtureFileHash(raw[file])}]));
  };
  const b={schemaVersion:'cxorbia.i3.live-fixture-prerequisites.v1',proofStage:'PRE_CERTIFICATION',certified:false,phaseAComplete:false,
    gate20:'HOLD',gate21:'HOLD',production:false,...expected,artifactFile:'cxorbia-i3-certified-source.tar'};
  refresh();const context={expected,readBytes:file=>raw[file],artifactBytes:Buffer.from([0,128,255,10])};
  return {b,expected,data,raw,refresh,context};
}
test('same-run DEV and source-ready21 allow functional evidence while integral MATCH stays4 and no certificate exists',()=>{
  const x=prerequisiteFixture(),out=validateFixturePrerequisites(x.b,x.context);
  assert.equal(out.preterminal.matchModules,4);assert.equal(x.b.certified,false);assert.equal(x.b.gate20,'HOLD');
  assert.equal(x.b.phaseAComplete,false);assert.equal(x.data.hrMeta.shopperReconciliation.providerAck,null);
});
for(const key of ['sourceSha','sourceTree','controlHeadSha','runId','runAttempt','firebaseProject','hostingUrl','tenantId','projectId',
  'periodId','artifactSha256','runtimeRevision','runtimeDigest','hostingVersion','hrRevision'])test('fixture rejects mismatched expected '+key,()=>{
  const x=prerequisiteFixture();x.context.expected={...x.expected,[key]:'different'};
  assert.throws(()=>validateFixturePrerequisites(x.b,x.context),/FIXTURE_BINDING_EXPECTED/);
});
for(const key of ['certified','phaseAComplete','production'])test('functional input cannot claim '+key,()=>{
  const x=prerequisiteFixture();x.b[key]=true;assert.throws(()=>validateFixturePrerequisites(x.b,x.context),/BINDING_SCOPE/);
});
test('TAR bytes are hashed as binary; altered archive is rejected',()=>{
  const x=prerequisiteFixture();x.context.artifactBytes=Buffer.from([0,128,254,10]);
  assert.throws(()=>validateFixturePrerequisites(x.b,x.context),/ARTIFACT_BYTES/);
});
test('a path outside the exact evidence inventory cannot be read',()=>{
  const x=prerequisiteFixture();x.b.evidence.hr.path='../hr-current-live.json';
  assert.throws(()=>validateFixturePrerequisites(x.b,x.context),/EVIDENCE_PATH_hr/);
});
test('changing a file after binding fails even if its semantic values look correct',()=>{
  const x=prerequisiteFixture();x.raw[FIXTURE_INPUT_FILES.human]=Buffer.from(JSON.stringify(x.data.human)+' ');
  assert.throws(()=>validateFixturePrerequisites(x.b,x.context),/EVIDENCE_HASH_human/);
});
for(const [name,change,code] of [
  ['older source',x=>x.data.preterminal.sourceSha='0'.repeat(40),'PRETERMINAL'],
  ['incomplete source coverage',x=>x.data.preterminal.pendingFiles=1,'PRETERMINAL'],
  ['other source QA attempt',x=>x.data.sourceQa.runAttempt=1,'SOURCE_QA'],
  ['human different HR',x=>x.data.human.sourceRevision='0'.repeat(64),'HUMAN'],
  ['focal stale September',x=>x.data.focal.periodId='project-a-previous','FOCAL'],
  ['oracle other project',x=>x.data.oracle.projectId='other','ORACLE_PERIOD'],
  ['HR unstable',x=>x.data.hrMeta.revisionStable=false,'HR_STABLE_REVISION'],
  ['runtime has no traffic',x=>x.data.runtimeService.status.traffic[0].percent=0,'RUNTIME_REVISION_TRAFFIC'],
  ['another Hosting',x=>x.data.hosting.release.version.name='old','HOSTING_VERSION']
])test('pre-certification proof rejects '+name,()=>{
  const x=prerequisiteFixture();change(x);x.refresh();assert.throws(()=>validateFixturePrerequisites(x.b,x.context),new RegExp(code));
});
test('read-only HR health permits absent mutation ACK; writes and another revision are rejected',()=>{
  const x=prerequisiteFixture();assert.equal(validateFixtureHrObservation(x.data.hrMeta,x.b.hrRevision).reconciliationCertified,false);
  assert.throws(()=>validateFixtureHrObservation({...x.data.hrMeta,hrWrites:true},x.b.hrRevision),/READ_ONLY/);
  assert.throws(()=>validateFixtureHrObservation(x.data.hrMeta,'0'.repeat(64)),/HR_STABLE_REVISION/);
});
function sealedFixture(){
  const {b,data}=prerequisiteFixture(),bindingHash='1'.repeat(64),liveHash='2'.repeat(64),artifactHash=b.artifactSha256;
  const finalRaw=Object.fromEntries(Object.entries({service:data.runtimeService,revision:data.runtime,hosting:data.hosting,hr:data.hr,meta:data.hrMeta})
    .map(([key,value])=>['final-'+key+'.json',Buffer.from(JSON.stringify(value))]));
  const live={decision:'PASS_I3_LIVE_FIXTURES_V2',proofStage:'PRE_CERTIFICATION',certifiedAtExecution:false,phaseAComplete:false,
    production:false,cleanup:{ok:true,creationJournalsResolved:true},cleanupError:null,buildCountThisRun:0,deployCountThisRun:0,hrWrites:0,
    finalEvidence:Object.fromEntries(Object.keys(finalRaw).map(file=>[file.slice(6,-5),{path:file,sha256:fixtureFileHash(finalRaw[file])}])),
    prerequisitesSha256:bindingHash,hrRevision:b.hrRevision,finalHrRevision:b.hrRevision,finalDevIdentityVerified:true,
    tests:FIXTURE_TEST_IDS.map(id=>({id,ok:true})),...Object.fromEntries(['sourceSha','sourceTree','artifactSha256','runtimeRevision',
      'runtimeDigest','hostingVersion','runId','runAttempt','controlHeadSha'].map(k=>[k,b[k]]))};
  const manifest={decision:'PASS_I3_ONE_ARTIFACT_READY_FOR_GATE21',production:false,buildCount:1,artifactPackCount:1,
    rebuildAfterCertification:false,moduleTruth:{phaseAComplete:true,allModulesMatch:true},artifactSha256:artifactHash,
    liveFixtures:{evidenceSha256:liveHash,prerequisitesSha256:bindingHash},i3CertificationSourceSha:b.sourceSha,i3CertificationSourceTree:b.sourceTree,
    controlHeadSha:b.controlHeadSha,runId:b.runId,runAttempt:b.runAttempt,devRuntimeRevision:b.runtimeRevision,runtimeImageDigest:b.runtimeDigest,
    hostingVersionName:b.hostingVersion,certificationHrRevision:b.hrRevision};
  return {manifest,live,finalRaw,context:{binding:b,bindingHash,liveHash,artifactHash,readFinalBytes:file=>finalRaw[file]}};
}
test('sealed verification links unchanged functional evidence and TAR to the later certificate without new mutations',()=>{
  const x=sealedFixture();assert.equal(validateSealedFixtureReceipt(x.manifest,x.live,x.context).writes,0);
});
for(const [name,change] of [
  ['four matches presented as certificate',x=>x.manifest.moduleTruth.allModulesMatch=false],
  ['altered fixture hash',x=>x.context.liveHash='3'.repeat(64)],['repacked TAR',x=>x.context.artifactHash='3'.repeat(64)],
  ['cleanup failure',x=>x.live.cleanup.ok=false],['nine tests',x=>x.live.tests.pop()],
  ['duplicate test',x=>x.live.tests[9]=x.live.tests[0]],['HR changed during tests',x=>x.live.finalHrRevision='3'.repeat(64)],
  ['different run',x=>x.live.runId='999'],['different source',x=>x.live.sourceSha='f'.repeat(40)],
  ['pretended prior certification',x=>x.live.certifiedAtExecution=true],
  ['unresolved creation journal',x=>x.live.cleanup.creationJournalsResolved=false],
  ['missing final identity files',x=>delete x.live.finalEvidence],
  ['altered final Hosting readback',x=>x.finalRaw['final-hosting.json']=Buffer.from('{}')],
  ['unread final identity',x=>delete x.context.readFinalBytes]
])test('sealed receipt rejects '+name,()=>{const x=sealedFixture();change(x);assert.throws(()=>validateSealedFixtureReceipt(x.manifest,x.live,x.context));});
test('single workflow gathers fixtures before strict21 and only verifies them after certification',()=>{
  const workflow=fs.readFileSync(new URL('../../.github/workflows/cxorbia-recovery-i3-dev-certification.yml',import.meta.url),'utf8');
  const certify=workflow.split('  certify:\n')[1].split('  live-fixtures:\n')[0];
  const fixtures=workflow.split('  live-fixtures:\n')[1].split('  gate21:\n')[0];
  const pre=certify.indexOf('I3_FIXTURE_STAGE=PRE_CERTIFICATION'),strict=certify.indexOf('TERMINAL_LEDGER=');
  assert.ok(pre>certify.indexOf('PASS_PRE_I4_FOCAL_HUMAN_BROWSER')&&pre<strict);
  assert.equal((certify.match(/tar -C/g)||[]).length,1);assert.match(certify,/PASS_C3_TERMINAL_MODULE_TRUTH_21_21/);
  assert.match(certify,/verify-live/);assert.match(fixtures,/verify-sealed/);assert.doesNotMatch(fixtures,/RECOVERY-I3-LIVE-FIXTURES|credentials_json|npm install|tar -xf/);
  assert.match(workflow,/cancel-in-progress: false/);assert.ok(Buffer.byteLength(workflow)<510000);
});

const reservationHarness=fs.readFileSync(new URL('../../.github/control/RECOVERY-I3-LIVE-FIXTURES-20260920-V4.mjs',import.meta.url),'utf8').split('async function adminReservationReadback(')[1].split('\nasync function ')[0];
const reservationWaitExpression=reservationHarness.match(/await page\.waitForFunction\((uid => [^\n]+), staffUid, \{timeout:150000\}\);/)?.[1];
assert.ok(reservationWaitExpression,'test must execute the actual reservation authentication wait');
const reservationWait=window=>vm.runInNewContext('('+reservationWaitExpression+')',{window})('staff-uid');
const readyReservationWindow=()=>({CX:{backendAuth:{context:()=>({authenticated:true})},data:{__protectedReservations:[],setCurrentPeriod:()=>true}},firebase:{auth:()=>({currentUser:{uid:'staff-uid'}})},CX_PROTECTED_AUTH_HR_AUTHORITY:{applied:true}});
test('reservation wait requires the complete authenticated exact-UID state',()=>assert.equal(reservationWait(readyReservationWindow()),true));
for(const [name,alter]of [
 ['backend context null during reload',w=>{w.CX.backendAuth.context=()=>null;}],
 ['backend context undefined during startup',w=>{w.CX.backendAuth.context=()=>undefined;}],
 ['Firebase auth null during startup',w=>{w.firebase.auth=()=>null;}],
 ['Firebase auth undefined during reload',w=>{w.firebase.auth=()=>undefined;}],
 ['unauthenticated',w=>{w.CX.backendAuth.context=()=>({authenticated:false});}],
 ['different UID',w=>{w.firebase.auth=()=>({currentUser:{uid:'other'}});}],
 ['authority not applied',w=>{w.CX_PROTECTED_AUTH_HR_AUTHORITY.applied=false;}],
 ['reservations not loaded',w=>{w.CX.data.__protectedReservations=null;}],
 ['period setter unavailable',w=>{delete w.CX.data.setCurrentPeriod;}]
])test('reservation wait remains false without throwing: '+name,()=>{
 const w=readyReservationWindow();alter(w);assert.equal(reservationWait(w),false);
});

function finalHrRequestFixture(){
  const revision='d'.repeat(64),observed=[],waits=[],calls=[];
  const meta={ok:true,revision,revisionStable:true,sourceSafe:true,refreshError:null,writes:false,hrWrites:false,production:false};
  const good=format=>({status:200,ok:true,json:async()=>format==='json'?{snapshot:{_runtime:{revision}}}:meta});
  return{revision,meta,observed,waits,calls,good,
    args:{expectedRevision:revision,onAttempt:row=>observed.push(row),wait:async ms=>waits.push(ms)}};
}
test('final HR 503 then live success preserves exact JSON/meta proof and records the retry',async()=>{
  const f=finalHrRequestFixture();const out=await readFixtureFinalHr({...f.args,request:async(format,attempt)=>{f.calls.push([format,attempt]);return format==='json'&&attempt===1?{status:503,ok:false}:f.good(format);}});
  assert.equal(out.revision,f.revision);assert.equal(out.hr.snapshot._runtime.revision,f.revision);assert.equal(out.meta.revision,f.revision);
  assert.deepEqual(f.calls,[['json',1],['json',2],['meta',1]]);assert.deepEqual(f.waits,[1000]);
  assert.deepEqual(f.observed[0],{format:'json',attempt:1,httpStatus:503,retryScheduled:true});
});
test('final HR retries meta independently without substituting the JSON snapshot for metadata',async()=>{
  const f=finalHrRequestFixture();await readFixtureFinalHr({...f.args,request:async(format,attempt)=>{f.calls.push([format,attempt]);return format==='meta'&&attempt===1?{status:503,ok:false}:f.good(format);}});
  assert.deepEqual(f.calls,[['json',1],['meta',1],['meta',2]]);assert.deepEqual(f.waits,[1000]);
});
for(const status of [429,502,503,504])test('final HR repeated '+status+' exhausts exactly four reads and remains HOLD',async()=>{
  const f=finalHrRequestFixture();let cancelled=0;
  await assert.rejects(readFixtureFinalHr({...f.args,request:async format=>{f.calls.push(format);return{status,ok:false,body:{cancel:async()=>cancelled++}};}}),new RegExp('FIXTURE_FINAL_HR_HTTP_'+status));
  assert.equal(f.calls.length,4);assert.equal(cancelled,4);assert.deepEqual(f.waits,[1000,2000,4000]);assert.equal(f.observed.at(-1).retryScheduled,false);
});
for(const status of [400,401,403,404,500])test('final HR '+status+' is rejected without retry or auth substitution',async()=>{
  const f=finalHrRequestFixture();await assert.rejects(readFixtureFinalHr({...f.args,request:async()=>{f.calls.push(1);return{status,ok:false};}}),new RegExp('FIXTURE_FINAL_HR_HTTP_'+status));
  assert.equal(f.calls.length,1);assert.deepEqual(f.waits,[]);
});
for(const name of ['TypeError','AbortError','TimeoutError'])test('final HR '+name+' has a bounded transport retry',async()=>{
  const f=finalHrRequestFixture();await readFixtureFinalHr({...f.args,request:async(format,attempt)=>{if(format==='json'&&attempt===1)throw Object.assign(new Error('untrusted provider details'),{name});return f.good(format);}});
  assert.deepEqual(f.waits,[1000]);assert.equal(f.observed[0].transportError,name);assert.ok(!JSON.stringify(f.observed).includes('untrusted'));
});
test('final HR repeated transport timeout is not a success or an unbounded loop',async()=>{
  const f=finalHrRequestFixture();let calls=0;await assert.rejects(readFixtureFinalHr({...f.args,request:async()=>{calls++;throw Object.assign(new Error('timeout'),{name:'TimeoutError'});}}),/FIXTURE_FINAL_HR_TRANSPORT_TimeoutError/);
  assert.equal(calls,4);assert.deepEqual(f.waits,[1000,2000,4000]);
});
test('final HR arbitrary request error is not retried',async()=>{
  const f=finalHrRequestFixture();await assert.rejects(readFixtureFinalHr({...f.args,request:async()=>{throw new Error('programming defect');}}),/NON_RETRYABLE_ERROR/);assert.deepEqual(f.waits,[]);
});
test('final HR invalid JSON is rejected without retry',async()=>{
  const f=finalHrRequestFixture();await assert.rejects(readFixtureFinalHr({...f.args,request:async()=>({status:200,ok:true,json:async()=>{throw new SyntaxError('bad json');}})}),/JSON_INVALID/);assert.deepEqual(f.waits,[]);
});
test('final HR another snapshot revision fails immediately even after a transient 503',async()=>{
  const f=finalHrRequestFixture();await assert.rejects(readFixtureFinalHr({...f.args,request:async(_,attempt)=>attempt===1?{status:503,ok:false}:{status:200,ok:true,json:async()=>({_runtime:{revision:'e'.repeat(64)}})}}),/FINAL_HR_CHANGED/);
  assert.deepEqual(f.waits,[1000]);
});
for(const [name,mutate] of [
  ['another meta revision',m=>m.revision='e'.repeat(64)],
  ['unstable metadata',m=>m.revisionStable=false],
  ['HR write',m=>m.hrWrites=true],
  ['refresh error',m=>m.refreshError='error']
])test('final HR cannot certify '+name,async()=>{
  const f=finalHrRequestFixture();mutate(f.meta);
  await assert.rejects(readFixtureFinalHr({...f.args,request:async format=>f.good(format)}),/SOURCE_FAILURE|RELEASE_COMPOSITION_FAILURE/);assert.deepEqual(f.waits,[]);
});
test('final HR invalid expected revision is rejected before network reads',async()=>{
  let called=false;await assert.rejects(readFixtureFinalHr({expectedRevision:'',request:async()=>{called=true;}}),/REQUEST_BINDING/);assert.equal(called,false);
});
test('final HR inconsistent HTTP ok flag is rejected',async()=>{
  const f=finalHrRequestFixture();await assert.rejects(readFixtureFinalHr({...f.args,request:async()=>({status:503,ok:true,json:async()=>f.meta})}),/HTTP_RESPONSE_INVALID/);assert.deepEqual(f.waits,[]);
});
