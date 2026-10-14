import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {collection,doc,getDoc,getDocs,query,setDoc,where} from 'firebase/firestore';

// I3 B7 — emulator only; no Firebase production/DEV credentials, no provider writes.
const PROJECT='demo-cxorbia-b7-ruleproof';
const TENANT='tya';
const own='shopper_gt_exact_test_a';
const other='shopper_gt_exact_test_b';
let env;

const notice=(id)=>'tenants/'+TENANT+'/bulletins/'+id;
const fire=(ctx)=>ctx.firestore();
const context=(uid,sid,role='shopper',tenantId=TENANT)=>env.authenticatedContext(uid,{
  role,tenantId,shopperId:sid,projectIds:['cinepolis'],country:'GT'
});
before(async()=>{
  if(!process.env.FIRESTORE_EMULATOR_HOST)throw new Error('EMULATOR_ONLY_NO_LIVE_FIRESTORE');
  env=await initializeTestEnvironment({projectId:PROJECT,firestore:{rules:readFileSync('firestore.rules','utf8')}});
  await env.withSecurityRulesDisabled(async ctx=>{
    const db=fire(ctx);
    const target=(sid)=>({
      tenantId:TENANT,status:'active',toRole:'shopper',title:'Notificación individual',
      targetAll:false,targetRoles:['shopper'],targetProjectIds:['cinepolis'],
      targetCountries:['GT'],targetTenants:[TENANT],targetUserIds:[],
      targetShopperIds:[sid],entityType:'visit',entityId:'visit_test',
      operational:true
    });
    await setDoc(doc(db,notice('for-a')),target(own));
    await setDoc(doc(db,notice('for-b')),target(other));
    await setDoc(doc(db,notice('announcement')),{
      tenantId:TENANT,status:'active',targetAll:true,targetShopperIds:[],
      targetUserIds:[],title:'Comunicado general'
    });
  });
});
after(async()=>{if(env)await env.cleanup()});

test('B7 exact-target shopper may get own notification',async()=>{
  const d=await assertSucceeds(getDoc(doc(fire(context('uid-a',own)),notice('for-a'))));
  assert.equal(d.exists(),true);
});

test('B7 exact-target shopper may query own array-contains list',async()=>{
  const db=fire(context('uid-a',own));
  const s=await assertSucceeds(getDocs(query(collection(db,'tenants',TENANT,'bulletins'),where('targetShopperIds','array-contains',own))));
  assert.deepEqual(s.docs.map(x=>x.id),['for-a']);
});

test('B7 exact-target shopper may query own array-contains + active status',async()=>{
  const db=fire(context('uid-a',own));
  const s=await assertSucceeds(getDocs(query(collection(db,'tenants',TENANT,'bulletins'),
    where('targetShopperIds','array-contains',own),where('status','==','active'))));
  assert.deepEqual(s.docs.map(x=>x.id),['for-a']);
});

test('B7 never leaks another shopper notice despite matching role, project, tenant, country',async()=>{
  const db=fire(context('uid-a',own));
  await assertFails(getDoc(doc(db,notice('for-b'))));
  await assertFails(getDocs(query(collection(db,'tenants',TENANT,'bulletins'),where('targetShopperIds','array-contains',other))));
});

test('B7 denies unfiltered shopper collection query',async()=>{
  const db=fire(context('uid-a',own));
  await assertFails(getDocs(collection(db,'tenants',TENANT,'bulletins')));
});

test('B7 denies wrong role, other tenant and unauthenticated get',async()=>{
  await assertFails(getDoc(doc(fire(context('uid-c',own,'cliente')),notice('for-a'))));
  await assertFails(getDoc(doc(fire(context('uid-d',own,'shopper','other-tenant')),notice('for-a'))));
  await assertFails(getDoc(doc(fire(env.unauthenticatedContext()),notice('for-a'))));
});

test('B7 preserves genuine tenant-wide notice and operator read',async()=>{
  const db=fire(context('uid-a',own));
  const d=await assertSucceeds(getDoc(doc(db,notice('announcement'))));
  assert.equal(d.exists(),true);
  const admin=fire(context('uid-admin','', 'admin'));
  await assertSucceeds(getDoc(doc(admin,notice('for-b'))));
});
