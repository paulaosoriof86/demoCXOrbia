import test from 'node:test';
import assert from 'node:assert/strict';
import {
  certificationRouteScope,
  certificationBankFingerprint,
  calculateCertificationAttempt,
  historicalCarryoverDecision,
  withDocumentId,
  resolveCertificationReviewPolicy,
  certificationPeriodDocumentIds,
  saveCertificationBankLifecycle,
  persistGeneratedDraft
} from '../certification-runtime.mjs';

assert.deepEqual(withDocumentId('recert-123',{providerAck:true}),{id:'recert-123',providerAck:true});
assert.throws(()=>withDocumentId('',{}),/PERSISTENCE_DOCUMENT_ID_REQUIRED/);

assert.deepEqual(
  certificationRouteScope('/api/tenants/tya/projects/cinepolis/certifications/attempt'),
  {tenantId:'tya',projectId:'cinepolis',action:'attempt'}
);

const bank={
  preguntas:[
    {q:'Q1',ops:['A','B'],correcta:'A',exp:'x'},
    {q:'Q2',ops:['C','D'],correcta:'D',exp:'y'}
  ],
  gate:80,
  contentRevision:'rev-exact',
  historicalEquivalenceKeys:['legacy-cert-1']
};

assert.equal(certificationBankFingerprint(bank),'rev-exact');

const passed=calculateCertificationAttempt(bank,['A','D']);
assert.equal(passed.score,100);
assert.equal(passed.pass,true);

const failed=calculateCertificationAttempt(bank,['A','C']);
assert.equal(failed.score,50);
assert.equal(failed.pass,false);

assert.throws(
  ()=>calculateCertificationAttempt(bank,['A']),
  /CERT_ANSWERS_INCOMPLETE/
);

const valid=historicalCarryoverDecision({
  records:[{projectId:'cinepolis',sourceLegacyStatus:'approved',sourceCertificationId:'legacy-cert-1'}],
  bank,
  projectId:'cinepolis',
  shopperId:'s1'
});
assert.equal(valid.state,'valid_reusable');
assert.equal(valid.eligibilityGranted,true);

const nonEquivalent=historicalCarryoverDecision({
  records:[{projectId:'cinepolis',sourceLegacyStatus:'approved',sourceCertificationId:'other'}],
  bank,
  projectId:'cinepolis',
  shopperId:'s1'
});
assert.equal(nonEquivalent.state,'non_equivalent');
assert.equal(nonEquivalent.eligibilityGranted,false);

const recert=historicalCarryoverDecision({
  records:[{projectId:'cinepolis',sourceLegacyStatus:'approved',sourceCertificationId:'legacy-cert-1'}],
  bank,
  projectId:'cinepolis',
  shopperId:'s1',
  recertifications:[{status:'active',scope:'all',createdAt:'2026-09-30T00:00:00Z'}]
});
assert.equal(recert.state,'recertification_required');
assert.equal(recert.eligibilityGranted,false);

console.log(JSON.stringify({
  decision:'PASS_PREI4_CERT_RES_CONTRACT',
  attemptScore:passed.score,
  carryover:valid.state,
  production:false
}));

// D05 lifecycle core: in-memory transactions, no network/identity/provider writes.
const lifecycleClone=value=>JSON.parse(JSON.stringify(value));
function lifecycleFixture(options={}){
  const scope={tenantId:'tya',projectId:'cinepolis'},periodId='cinepolis-2026-10',rid='certbank-cinepolis-'+periodId+'-qa';
  const projectPath='tenants/tya/projects/cinepolis',resourcePath='tenants/tya/resources/'+rid;
  const author=options.author||'qa-author',uid=options.uid||'qa-admin',role=options.role||'admin';
  const draft={id:rid,tenantId:'tya',projectId:'cinepolis',periodId,resourceType:'certification_bank',tipo:'certification_bank',status:'active',version:3,
    n:'QA publication bank',createdByUid:author,updatedByUid:author,createdAt:'2026-10-01T00:00:00Z',
    bank:{certificationId:'qa',certificationName:'QA publication bank',estado:'pending_review',generadoPorUid:author,
      contentRevision:'qa-version-3',gate:80,required:true,requestedQuestionCount:15,
      preguntas:Array.from({length:15},(_,i)=>({q:'QA '+i,ops:['A','B','C','D'],correcta:'A',exp:'QA',fuente:'[Página 1]'}))}};
  const member={role,authNamespace:'staff',active:true,tenantId:'tya',projectIds:['cinepolis'],...(options.member||{})};
  const docs=new Map([[projectPath,{id:'cinepolis',projectId:'cinepolis',tenantId:'tya',version:2,...(options.project||{})}],
    [resourcePath,{...draft,...(options.resource||{})}],['tenants/tya/users/'+uid,member]]);
  if(options.period)docs.set(projectPath+'/periods/'+(options.periodDocumentId||periodId),{projectId:'cinepolis',periodId:options.periodDocumentId||periodId,...options.period});
  if(options.duplicatePeriod)docs.set(projectPath+'/periods/2026-10',{projectId:'cinepolis',periodId:'2026-10',certReviewPolicy:'maker_checker'});
  const attemptPath=projectPath+'/certifications/attempt-existing';
  const attempt={pass:true,score:100,shopperId:'qa-shopper',bankResourceId:rid,contentRevision:'old-revision'};
  docs.set(attemptPath,lifecycleClone(attempt));
  const stats={reads:[],writes:[],transactions:0};
  class Ref{
    constructor(path){this.path=path;this.id=path.split('/').at(-1);}
    collection(name){return {doc:id=>new Ref(this.path+'/'+name+'/'+id)};}
    async get(){stats.reads.push(this.path);return snap(this,docs.get(this.path));}
  }
  function snap(ref,value){
    const raw=value===undefined?undefined:lifecycleClone(value);
    if(options.corruptReadback&&stats.writes.length&&ref.path===resourcePath)raw.bank.preguntas[0].q='corrupt readback';
    if(stats.writes.length&&raw&&typeof options.mutateReadback==='function')options.mutateReadback(raw,{path:ref.path,id:ref.id,resourcePath});
    return {id:ref.id,exists:raw!==undefined,data:()=>raw};
  }
  const db={collection:name=>({doc:id=>new Ref(name+'/'+id)}),async runTransaction(fn){
    stats.transactions++;
    const pending=[];
    await fn({get:async ref=>{stats.reads.push(ref.path);return snap(ref,docs.get(ref.path));},
      set(ref,data){pending.push({path:ref.path,data:lifecycleClone(data)});}});
    for(const row of pending){docs.set(row.path,row.data);stats.writes.push(row.path);}
  }};
  const principal={uid,role,namespace:'staff'};
  const body={bankResourceId:rid,periodId,expectedVersion:3,expectedContentRevision:'qa-version-3',idempotencyKey:'qa-key'};
  return {db,scope,principal,body,stats,docs,draft,resourcePath,attemptPath,attempt,
    run:(action='publish',patch={},idem='qa-key')=>saveCertificationBankLifecycle(db,scope,principal,{...body,...patch},action,idem)};
}

test('D05 default policy allows same authorized author; explicit aliases require distinct reviewer',()=>{
  assert.equal(resolveCertificationReviewPolicy({}).mode,'authorized_admin');
  for(const alias of ['certificationReviewPolicy','certReviewPolicy'])for(const policy of ['maker_checker','distinct_reviewer','two_person']){
    const r=resolveCertificationReviewPolicy({[alias]:policy});assert.equal(r.requiresDistinctReviewer,true);assert.equal(r.authority,'firestore_project');
  }
  assert.equal(resolveCertificationReviewPolicy({certReviewPolicy:'maker_checker'},{certificationReviewPolicy:'authorized_admin'}).authority,'firestore_period');
  for(const bad of ['unknown',{},true,null,''])assert.throws(()=>resolveCertificationReviewPolicy({certReviewPolicy:bad}),/CERT_REVIEW_POLICY_INVALID/);
  assert.throws(()=>resolveCertificationReviewPolicy({certReviewPolicy:'maker_checker',certificationReviewPolicy:'authorized_admin'}),/ALIAS_CONFLICT/);
  assert.throws(()=>resolveCertificationReviewPolicy({certReviewPolicy:42},{certReviewPolicy:'authorized_admin'}),/POLICY_INVALID/);
});
test('D05 exact period aliases follow the existing UI mapping',()=>{
  assert.deepEqual(certificationPeriodDocumentIds('cinepolis','cinepolis-2026-10'),['cinepolis-2026-10','2026-10']);
  assert.deepEqual(certificationPeriodDocumentIds('cinepolis','2026-10'),['2026-10','cinepolis-2026-10']);
  assert.deepEqual(certificationPeriodDocumentIds('cinepolis','cinepolis-period-opaque'),['cinepolis-period-opaque']);
  assert.throws(()=>certificationPeriodDocumentIds('cinepolis','../other'),/SCOPE_INVALID/);
});
test('D05 publication sets authenticated reviewer, preserves author/questions and confirms exact readback',async()=>{
  const h=lifecycleFixture(),r=await h.run();
  assert.equal(r.providerWrites,2);assert.equal(r.readbackVerified,true);assert.equal(r.item.version,4);
  assert.equal(r.item.bank.estado,'published');assert.equal(r.item.bank.generadoPorUid,'qa-author');assert.equal(r.item.bank.revisadoPorUid,'qa-admin');
  assert.deepEqual(r.item.bank.preguntas,h.draft.bank.preguntas);assert.equal(r.receipt.authorUid,'qa-author');
  assert.equal(r.receipt.actorUid,'qa-admin');assert.equal(r.receipt.fromVersion,3);assert.equal(r.receipt.entityVersion,4);
  assert.equal(r.item.bank.publicationAuthority.receiptId,r.receipt.id);
  assert.deepEqual(h.docs.get(h.attemptPath),h.attempt);assert.equal(r.attemptWrites,0);
});
test('D05 default does not impose global maker-checker',async()=>{
  const h=lifecycleFixture({author:'qa-admin'}),r=await h.run();assert.equal(r.item.bank.revisadoPorUid,r.item.bank.generadoPorUid);
});
for(const owner of ['project','period'])for(const alias of ['certificationReviewPolicy','certReviewPolicy']){
  test('D05 enforces distinct reviewer from '+owner+' '+alias+', including legacy month document',async()=>{
    const options={author:'qa-admin',[owner]:{[alias]:'maker_checker'},...(owner==='period'?{periodDocumentId:'2026-10'}:{})};
    const h=lifecycleFixture(options);await assert.rejects(()=>h.run(),/DISTINCT_REVIEWER_REQUIRED/);assert.equal(h.stats.writes.length,0);
  });
}
for(const role of ['ops','coordinador','shopper','cliente'])test('D05 denies publication role '+role+', without writes',async()=>{
  const h=lifecycleFixture({role});await assert.rejects(()=>h.run(),/AUTHORIZED_ADMIN_REQUIRED/);assert.equal(h.stats.writes.length,0);
});
for(const [name,member] of [['inactive',{active:false}],['role mismatch',{role:'ops'}],['wrong namespace',{authNamespace:'shopper'}],['other project',{projectIds:['other']}],['other tenant',{tenantId:'other'}]]){
  test('D05 transaction rechecks '+name+' membership',async()=>{
    const h=lifecycleFixture({member});await assert.rejects(()=>h.run(),/PROJECT_MEMBERSHIP_DENIED/);assert.equal(h.stats.writes.length,0);
  });
}
for(const [name,patch] of [['forged reviewer',{revisadoPorUid:'forged'}],['forged author',{generadoPorUid:'forged'}],['caller policy',{policy:'authorized_admin'}],['whole replacement bank',{bank:{estado:'published'}}]]){
  test('D05 rejects '+name+' in publication payload',async()=>{
    const h=lifecycleFixture();await assert.rejects(()=>h.run('publish',patch),/PAYLOAD_INVALID/);assert.equal(h.stats.writes.length,0);
  });
}
test('D05 stale version and source revision fail without a write',async()=>{
  for(const patch of [{expectedVersion:2},{expectedContentRevision:'other'}]){
    const h=lifecycleFixture();await assert.rejects(()=>h.run('publish',patch),/EXPECTED_VERSION_CONFLICT/);assert.equal(h.stats.writes.length,0);
  }
});
test('D05 replay returns the same receipt with no second write and rejects changed command',async()=>{
  const h=lifecycleFixture(),first=await h.run(),second=await h.run();assert.equal(second.idempotentReplay,true);
  assert.equal(second.providerWrites,0);assert.equal(second.receipt.id,first.receipt.id);assert.equal(h.stats.writes.length,2);
  await assert.rejects(()=>h.run('publish',{expectedVersion:4}),/IDEMPOTENCY_REUSE_DIFFERENT_PAYLOAD/);
  assert.equal(h.stats.writes.length,2);
});
test('D05 duplicate period authorities and explicit unknown policies fail closed',async()=>{
  for(const options of [{period:{},duplicatePeriod:true},{project:{certReviewPolicy:'new_unrecognized_policy'}},{period:{certReviewPolicy:false}}]){
    const h=lifecycleFixture(options);await assert.rejects(()=>h.run(),/POLICY_(PERIOD_AMBIGUOUS|INVALID)/);assert.equal(h.stats.writes.length,0);
  }
});
test('D05 other project/period/type cannot be published through a resource ID',async()=>{
  for(const resource of [{projectId:'other'},{periodId:'cinepolis-2026-09'},{resourceType:'text'},{tipo:'text'},{tenantId:'other'}]){
    const h=lifecycleFixture({resource});await assert.rejects(()=>h.run(),/SCOPE_MISMATCH/);assert.equal(h.stats.writes.length,0);
  }
});
test('D05 committed state is never reported successful after corrupt exact readback',async()=>{
  const h=lifecycleFixture({corruptReadback:true});await assert.rejects(()=>h.run(),/DURABLE_READBACK_MISMATCH/);
  assert.equal(h.stats.writes.length,2);assert.equal(h.docs.get(h.resourcePath).bank.estado,'published');
});
test('D05 configuration changes only the authorized requirement and records a new revision',async()=>{
  const h=lifecycleFixture(),r=await h.run('configure',{gate:90,required:false});
  assert.equal(r.item.bank.gate,90);assert.equal(r.item.bank.required,false);assert.notEqual(r.item.bank.contentRevision,'qa-version-3');
  assert.equal(r.item.bank.estado,'pending_review');assert.deepEqual(r.item.bank.preguntas,h.draft.bank.preguntas);
  assert.equal(r.item.bank.generadoPorUid,'qa-author');assert.deepEqual(h.docs.get(h.attemptPath),h.attempt);
});
test('D05 retirement preserves the complete bank and existing attempts; no physical delete',async()=>{
  const h=lifecycleFixture(),r=await h.run('retire');assert.equal(r.item.status,'deleted');assert.equal(r.item.bank.estado,'withdrawn');
  assert.deepEqual(r.item.bank.preguntas,h.draft.bank.preguntas);assert.equal(r.item.bank.contentRevision,'qa-version-3');
  assert.deepEqual(h.docs.get(h.attemptPath),h.attempt);assert.equal(h.stats.writes.length,2);
  assert.ok(h.stats.writes.every(path=>path===h.resourcePath||path.startsWith('tenants/tya/commandReceipts/cert-bank-')));
});

// Independent D05 review: the remote document and receipt must independently
// confirm the completed transaction. Corruption is injected only during reads.
for(const [name,kind,mutate] of [
  ['stored ID differs','resource',row=>{row.id='other-id';}],
  ['stored ID missing','resource',row=>{delete row.id;}],
  ['receipt status differs','receipt',row=>{row.status='blocked';}],
  ['receipt provider ACK differs','receipt',row=>{row.providerAck=false;}],
  ['receipt actor differs','receipt',row=>{row.actorUid='other-actor';}],
  ['receipt project differs','receipt',row=>{row.projectId='other-project';}],
  ['receipt entity differs','receipt',row=>{row.entityId='other-bank';}],
  ['receipt version differs','receipt',row=>{row.entityVersion=999;}]
])test('D05 refuses successful ACK when '+name+' in exact readback',async()=>{
  const h=lifecycleFixture({mutateReadback:(row,ref)=>{
    if(kind==='resource'?ref.path===ref.resourcePath:ref.path.includes('/commandReceipts/'))mutate(row);
  }});
  await assert.rejects(()=>h.run(),/CERT_BANK_DURABLE_READBACK_MISMATCH/);
  assert.equal(h.stats.transactions,1,'no automatic retry after committed write');
  assert.equal(h.stats.writes.length,2,'exactly one resource plus one receipt commit');
  assert.equal(h.docs.get(h.resourcePath).bank.estado,'published','commit is not mislabeled as zero writes');
  assert.equal(h.docs.get(h.resourcePath).id,h.draft.id,'the stored record is untouched by the read corruption');
  assert.deepEqual(h.docs.get(h.attemptPath),h.attempt,'existing attempts remain unchanged');
});
test('D05 requires staff namespace even when Admin/Super token and member agree otherwise',async()=>{
  for(const role of ['admin','super'])for(const namespace of ['client','shopper','']){
    const h=lifecycleFixture({role,member:{authNamespace:namespace}});
    h.principal.namespace=namespace;
    await assert.rejects(()=>h.run(),/AUTH_FAILURE:CERT_BANK_AUTHORIZED_ADMIN_REQUIRED/);
    assert.equal(h.stats.transactions,0);assert.equal(h.stats.writes.length,0);
  }
});

for(const tombstone of ['real-retirement','deleted-only','withdrawn-only'])test('D05 preserves the previous bank when generation targets '+tombstone,async()=>{
  const h=lifecycleFixture(),sourceSha256='a'.repeat(64),periodId=h.body.periodId;
  const rid='certbank-cinepolis-'+periodId+'-ai-'+sourceSha256.slice(0,12),path='tenants/tya/resources/'+rid;
  const original=lifecycleClone(h.docs.get(h.resourcePath));original.id=rid;
  original.status=tombstone==='deleted-only'?'deleted':'active';
  original.bank.estado=tombstone==='withdrawn-only'?'withdrawn':tombstone==='real-retirement'?'published':'pending_review';
  h.docs.delete(h.resourcePath);h.docs.set(path,original);h.body.bankResourceId=rid;
  const attempt=lifecycleClone(h.docs.get(h.attemptPath));attempt.bankResourceId=rid;h.docs.set(h.attemptPath,attempt);
  if(tombstone==='real-retirement'){
    const retired=await h.run('retire');assert.equal(retired.item.bank.estado,'withdrawn');assert.equal(retired.item.status,'deleted');
  }
  const bankBefore=lifecycleClone(h.docs.get(path)),writesBefore=h.stats.writes.length,transactionsBefore=h.stats.transactions;
  const generated={preguntas:original.bank.preguntas.map(q=>({...q,q:'replacement '+q.q})),requestedQuestionCount:15,
    gate:80,provider:'local-test-double',model:'local-test-double',contentRevision:'new-generated-revision',generationAttempts:1};
  await assert.rejects(()=>persistGeneratedDraft(h.db,h.scope,{uid:'another-author',role:'ops',namespace:'staff'},
    {periodId,certificationName:'Replacement bank',questionCount:15,gate:80},
    {sourceSha256,sourceTitle:'Existing source',documentSource:{mode:'manual_text'}},generated,'new-generation-key'),
    /AI_PERSISTENCE_DRAFT_RETIRED/);
  assert.equal(h.stats.transactions,transactionsBefore+1);
  assert.equal(h.stats.writes.length,writesBefore,'regeneration adds no resource or receipt write');
  assert.deepEqual(h.docs.get(path),bankBefore,'withdrawn bank identity, content, author and history survive');
  assert.deepEqual(h.docs.get(h.attemptPath),attempt,'existing attempt survives');
});
