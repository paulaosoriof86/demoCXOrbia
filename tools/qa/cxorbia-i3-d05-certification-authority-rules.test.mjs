import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {doc,getDoc,setDoc,updateDoc,deleteDoc} from 'firebase/firestore';

const PROJECT='demo-cxorbia-d05-ruleproof',TENANT='tya',PERIOD='cinepolis-2026-10';
let env;
const clone=value=>JSON.parse(JSON.stringify(value));
const path=id=>'tenants/tya/resources/'+id;
const principal=(uid='qa-admin',role='admin',tenantId='tya')=>env.authenticatedContext(uid,{role,tenantId,authNamespace:'staff',projectIds:['cinepolis']}).firestore();
const resource=(id,author='qa-author')=>({id,tenantId:TENANT,projectId:'cinepolis',periodId:PERIOD,
  resourceType:'certification_bank',tipo:'certification_bank',status:'active',version:3,
  createdAt:'2026-10-01T00:00:00Z',createdByUid:author,updatedAt:'2026-10-01T00:00:00Z',updatedByUid:author,n:'QA bank',
  visibleRoles:['super','admin','ops','coordinador','shopper'],targetAll:false,
  bank:{estado:'pending_review',certificationId:'qa',certificationName:'QA bank',generadoPorUid:author,contentRevision:'old',preguntas:Array.from({length:15},(_,i)=>({q:'Q'+i,ops:['A','B','C','D'],correcta:'A',exp:'QA',fuente:'[Página 1]'}))}});
function reviewed(before,uid='qa-admin'){
  const next=clone(before),version=before.version+1,revision='review-'+version;
  next.version=version;next.updatedByUid=uid;next.updatedAt='2026-10-30T00:00:00Z';next.lastIdempotencyKey='qa-review-'+version;
  next.bank.preguntas[0].q='Reviewed '+version;next.bank.contentRevision=revision;next.bank.previousContentRevision=before.bank.contentRevision;
  next.bank.ultimaRevisionPorUid=uid;next.bank.ultimaRevisionAt=next.updatedAt;next.bank.reviewVersion=version;
  next.bank.reviewHistory=[...clone(before.bank.reviewHistory||[]),{at:next.updatedAt,reviewerUid:uid,fromVersion:before.version,toVersion:version,
    previousContentRevision:before.bank.contentRevision,contentRevision:revision,changes:[{index:1,before:before.bank.preguntas[0],after:next.bank.preguntas[0]}],nameChange:null}];
  return next;
}
async function seed(p,value){await env.withSecurityRulesDisabled(ctx=>setDoc(doc(ctx.firestore(),p),value));}
async function read(p){let result;await env.withSecurityRulesDisabled(async ctx=>{result=(await getDoc(doc(ctx.firestore(),p))).data();});return result;}
async function resetPolicy(project={},period=null,periodId=PERIOD){
  await env.withSecurityRulesDisabled(async ctx=>{
    const db=ctx.firestore();await setDoc(doc(db,'tenants/tya/projects/cinepolis'),{id:'cinepolis',tenantId:'tya',projectId:'cinepolis',...project});
    await deleteDoc(doc(db,'tenants/tya/projects/cinepolis/periods/'+PERIOD));await deleteDoc(doc(db,'tenants/tya/projects/cinepolis/periods/2026-10'));
    if(period)await setDoc(doc(db,'tenants/tya/projects/cinepolis/periods/'+periodId),{projectId:'cinepolis',periodId,...period});
  });
}
before(async()=>{
  const address=String(process.env.FIRESTORE_EMULATOR_HOST||'');
  assert.match(address,/^(127\.0\.0\.1|localhost):([1-9][0-9]{0,4})$/,'EMULATOR_ONLY');
  const [host,portText]=address.split(':');const port=Number(portText);
  assert.ok(port>0&&port<=65535,'EMULATOR_PORT_INVALID');
  env=await initializeTestEnvironment({projectId:PROJECT,firestore:{host,port,rules:readFileSync(process.env.D05_RULES_FILE||'firestore.rules','utf8')}});
  await env.clearFirestore();await resetPolicy();
  for(const [uid,role,extra] of [['qa-admin','admin',{}],['qa-author','admin',{}],['qa-super','super',{}],['qa-ops','ops',{}],['qa-coord','coordinador',{}],['qa-inactive','admin',{active:false}],['qa-other-project','admin',{projectIds:['other']}],['qa-mismatch','admin',{role:'ops'}]]){
    await seed('tenants/tya/users/'+uid,{active:true,tenantId:'tya',role,authNamespace:'staff',projectIds:['cinepolis'],...extra});
  }
});
after(async()=>{if(env){try{await env.clearFirestore();}finally{await env.cleanup();}}});

test('D05 Rules allow only a new pending draft with authenticated author',async()=>{
  const b=resource('draft-create','qa-admin');b.version=1;
  await assertSucceeds(setDoc(doc(principal(),path(b.id)),b));
  for(const [id,patch] of [['published-create',{estado:'published'}],['forged-author-create',{generadoPorUid:'forged'}],['forged-review-create',{revisadoPorUid:'forged'}]]){
    const bad={...clone(b),id,bank:{...clone(b.bank),...patch}};await assertFails(setDoc(doc(principal(),path(id)),bad));
  }
});
for(const [uid,role] of [['qa-ops','ops'],['qa-coord','coordinador']])test('D05 Rules preserve ordinary resources but reject bank writes for '+role,async()=>{
  const p=path('ordinary-'+role),db=principal(uid,role),ordinary={projectId:'cinepolis',resourceType:'project_resource',tipo:'text',status:'active'};
  await assertSucceeds(setDoc(doc(db,p),ordinary));await assertSucceeds(updateDoc(doc(db,p),{n:'changed'}));await assertSucceeds(deleteDoc(doc(db,p)));
  const b=resource('operator-'+role);await seed(path(b.id),b);
  await assertFails(setDoc(doc(db,path(b.id)),reviewed(b,uid)));await assertFails(updateDoc(doc(db,path(b.id)),{'bank.estado':'published'}));
  await assertFails(deleteDoc(doc(db,path(b.id))));assert.deepEqual(await read(path(b.id)),b);
});
test('D05 Rules allow current pending review with exact actor/version/history and preserve default same-author review',async()=>{
  await resetPolicy();
  for(const author of ['qa-author','qa-admin']){
    const b=resource('review-'+author,author);await seed(path(b.id),b);const next=reviewed(b);
    await assertSucceeds(setDoc(doc(principal(),path(b.id)),next));assert.deepEqual(await read(path(b.id)),next);
  }
});
test('D05 Rules deny direct publish, configuration, retire and delete of a published bank',async()=>{
  const b=resource('published');b.bank.estado='published';b.bank.revisadoPorUid='qa-admin';await seed(path(b.id),b);
  for(const patch of [{'bank.preguntas':[]},{'bank.gate':100},{status:'deleted'},{'bank.estado':'pending_review'}])await assertFails(updateDoc(doc(principal(),path(b.id)),patch));
  await assertFails(deleteDoc(doc(principal(),path(b.id))));assert.deepEqual(await read(path(b.id)),b);
  const pending=resource('promote');await seed(path(pending.id),pending);await assertFails(updateDoc(doc(principal(),path(pending.id)),{'bank.estado':'published',version:4}));
});
for(const [name,mutate] of [
  ['author',n=>{n.bank.generadoPorUid='forged';}],['reviewer',n=>{n.bank.ultimaRevisionPorUid='forged';}],
  ['created author',n=>{n.createdByUid='forged';}],['project',n=>{n.projectId='other';}],['period',n=>{n.periodId='cinepolis-2026-09';}],
  ['version',n=>{n.version=9;}],['history reviewer',n=>{n.bank.reviewHistory[0].reviewerUid='forged';}],
  ['source',n=>{n.bank.documentSource={source_sha256:'forged'};}],['retype',n=>{n.resourceType='text';n.tipo='text';}],
  ['question count',n=>{n.bank.preguntas.pop();}]
])test('D05 Rules reject modified '+name+' outside the review transition',async()=>{
  const b=resource('tamper-'+name.replace(/ /g,'-'));await seed(path(b.id),b);const next=reviewed(b);mutate(next);
  await assertFails(setDoc(doc(principal(),path(b.id)),next));assert.deepEqual(await read(path(b.id)),b);
});
test('D05 Rules do not allow ordinary resources to become banks through update',async()=>{
  const id='plain-retype';await seed(path(id),{projectId:'cinepolis',resourceType:'text',tipo:'text'});
  const b=resource(id,'qa-admin');b.version=1;await assertFails(setDoc(doc(principal(),path(id)),b));
});
for(const uid of ['qa-inactive','qa-other-project','qa-mismatch','qa-missing'])test('D05 Rules enforce durable membership for '+uid,async()=>{
  const b=resource(uid);await seed(path(b.id),b);await assertFails(setDoc(doc(principal(uid),path(b.id)),reviewed(b,uid)));
});
test('D05 Rules reject anonymous and other-tenant principals',async()=>{
  const b=resource('other-tenant');await seed(path(b.id),b);
  for(const db of [principal('qa-admin','admin','other'),env.unauthenticatedContext().firestore()])await assertFails(setDoc(doc(db,path(b.id)),reviewed(b)));
});
for(const owner of ['project','period'])for(const alias of ['certificationReviewPolicy','certReviewPolicy'])test('D05 Rules enforce '+owner+' '+alias+' with exact legacy period alias',async()=>{
  await resetPolicy(owner==='project'?{[alias]:'maker_checker'}:{},owner==='period'?{[alias]:'maker_checker'}:null,'2026-10');
  const b=resource('policy-'+owner+'-'+alias,'qa-admin');await seed(path(b.id),b);
  await assertFails(setDoc(doc(principal(),path(b.id)),reviewed(b)));
  await assertSucceeds(setDoc(doc(principal('qa-author'),path(b.id)),reviewed(b,'qa-author')));await resetPolicy();
});
test('D05 Rules reject unknown/contradictory policy and duplicate exact period documents',async()=>{
  const b=resource('unknown-policy');await seed(path(b.id),b);
  for(const p of [{certReviewPolicy:'unknown'},{certReviewPolicy:42},{certReviewPolicy:'maker_checker',certificationReviewPolicy:'authorized_admin'}]){
    await resetPolicy(p);await assertFails(setDoc(doc(principal(),path(b.id)),reviewed(b)));
  }
  await resetPolicy({},{});await seed('tenants/tya/projects/cinepolis/periods/2026-10',{projectId:'cinepolis',periodId:'2026-10'});
  await assertFails(setDoc(doc(principal(),path(b.id)),reviewed(b)));await resetPolicy();
});
test('D05 Rules reject changing previous review history and preserve attempt documents',async()=>{
  const initial=resource('history'),b=reviewed(initial);await seed(path(b.id),b);const next=reviewed(b);next.bank.reviewHistory[0].reviewerUid='forged';
  await assertFails(setDoc(doc(principal(),path(b.id)),next));assert.deepEqual(await read(path(b.id)),b);
  const attemptPath='tenants/tya/projects/cinepolis/certifications/qa-attempt',attempt={pass:true,score:100,bankResourceId:b.id};await seed(attemptPath,attempt);
  await assertFails(deleteDoc(doc(principal(),attemptPath)));assert.deepEqual(await read(attemptPath),attempt);
});
test('D05 composed Rules prevent Admin self-granting another project before a bank review',async()=>{
  const uid='qa-other-project',db=principal(uid),memberPath='tenants/tya/users/'+uid;
  const prior=await read(memberPath);
  await assertFails(updateDoc(doc(db,memberPath),{projectIds:['cinepolis','other']}));
  assert.deepEqual(await read(memberPath),prior);
  const b=resource('self-grant');await seed(path(b.id),b);
  await assertFails(setDoc(doc(db,path(b.id)),reviewed(b,uid)));assert.deepEqual(await read(path(b.id)),b);
});
test('D05 composed Rules require staff namespace even when claim and membership agree otherwise',async()=>{
  const uid='qa-wrong-namespace',member={active:true,role:'admin',tenantId:'tya',authNamespace:'client',projectIds:['cinepolis']};
  await seed('tenants/tya/users/'+uid,member);
  const db=env.authenticatedContext(uid,{role:'admin',tenantId:'tya',authNamespace:'client',projectIds:['cinepolis']}).firestore();
  const b=resource('wrong-namespace');await seed(path(b.id),b);await assertFails(setDoc(doc(db,path(b.id)),reviewed(b,uid)));
});
test('D05 composed Rules reject a policy document declaring another period or tenant',async()=>{
  const b=resource('policy-scope');await seed(path(b.id),b);
  for(const period of [{periodId:'cinepolis-2026-09'},{tenantId:'other'},{projectId:'other'}]){
    await resetPolicy({},period);await assertFails(setDoc(doc(principal(),path(b.id)),reviewed(b)));
  }
  await resetPolicy();
});
test('D05 Rules preserve the complete history at the existing 25-review bound',async()=>{
  let b=resource('history-bound');
  for(let index=0;index<24;index++)b=reviewed(b);
  await seed(path(b.id),b);const last=reviewed(b);
  await assertSucceeds(setDoc(doc(principal(),path(b.id)),last));assert.equal((await read(path(b.id))).bank.reviewHistory.length,25);
  await assertFails(setDoc(doc(principal(),path(b.id)),reviewed(last)));assert.deepEqual(await read(path(b.id)),last);
});
