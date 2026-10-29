import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {createShopperCommandProvider} from '../../backend/runtime/cxorbia-shopper-command-provider-v1.mjs';

// In-memory Firestore/Auth exercise the actual provider; no Firebase network.
const copy=x=>x===undefined?undefined:structuredClone(x);
class Snap{
  constructor(id,value){this.id=id;this.value=copy(value);this.exists=value!==undefined;}
  data(){return copy(this.value);}
}
class Doc{
  constructor(db,path){this.db=db;this.path=path;this.id=path.split('/').at(-1);}
  collection(name){return new Collection(this.db,`${this.path}/${name}`);}
  async get(){return new Snap(this.id,this.db.data.get(this.path));}
  async set(value,options={}){this.db.put(this.path,value,options);}
}
class Query{
  constructor(db,path,field,value){this.db=db;this.path=path;this.field=field;this.value=value;this.cap=Infinity;}
  limit(n){this.cap=n;return this;}
  async get(){
    const docs=[];for(const [path,value] of this.db.data){
      if(!path.startsWith(this.path+'/')||path.split('/').length!==this.path.split('/').length+1)continue;
      if(value?.[this.field]!==this.value)continue;
      docs.push(new Snap(path.split('/').at(-1),value));if(docs.length>=this.cap)break;
    }return {docs,size:docs.length};
  }
}
class Collection{
  constructor(db,path){this.db=db;this.path=path;}
  doc(id){return new Doc(this.db,`${this.path}/${id}`);}
  where(field,op,value){assert.equal(op,'==');return new Query(this.db,this.path,field,value);}
  async get(){
    const docs=[];for(const [path,value] of this.db.data){
      if(path.startsWith(this.path+'/')&&path.split('/').length===this.path.split('/').length+1)
        docs.push(new Snap(path.split('/').at(-1),value));
    }return {docs,size:docs.length};
  }
}
class MemoryDb{
  constructor(){this.data=new Map();}
  collection(name){return new Collection(this,name);}
  put(path,value,options={}){this.data.set(path,options?.merge?{...(this.data.get(path)||{}),...copy(value)}:copy(value));}
  seed(path,value){this.put(path,value);}
  get(path){return copy(this.data.get(path));}
  paths(){return [...this.data.keys()].sort();}
  async runTransaction(fn){
    const tx={get:ref=>ref.get(),set:(ref,value,options)=>this.put(ref.path,value,options)};
    return fn(tx);
  }
}
class MemoryAuth{
  constructor(){this.users=new Map();this.created=0;}
  missing(){const e=new Error('not found');e.code='auth/user-not-found';return e;}
  async getUser(uid){if(!this.users.has(uid))throw this.missing();return copy(this.users.get(uid));}
  async getUserByEmail(email){const user=[...this.users.values()].find(u=>u.email===email);if(!user)throw this.missing();return copy(user);}
  async listUsers(){return {users:[...this.users.values()].map(copy)};}
  async createUser(data){if(this.users.has(data.uid))throw new Error('duplicate auth');const u={...copy(data),customClaims:{}};this.users.set(u.uid,u);this.created++;return copy(u);}
  async updateUser(uid,patch){const u=this.users.get(uid);if(!u)throw this.missing();Object.assign(u,copy(patch));return copy(u);}
  async setCustomUserClaims(uid,claims){const u=this.users.get(uid);if(!u)throw this.missing();u.customClaims=copy(claims);}
}
const policy={schemaVersion:'cxorbia.shopper-command-provider-policy.v1',enabled:true,allowedTenantIds:['tenant-a'],allowedProjectIds:[],hrWrites:false,externalWrites:false,fuzzyMatching:false};
const make=()=>{
  const db=new MemoryDb(),auth=new MemoryAuth();
  return {db,auth,provider:createShopperCommandProvider({auth,db,policy})};
};
const row=(shopperId,country,name,phone)=>({id:`visit-${shopperId}`,shopperId,shopperCode:shopperId,pais:country,country,shopper:name,whatsapp:phone,sourceSafe:true,piiProtected:true});
const snapshot=(...rows)=>({sourceSafe:true,imported:false,firestoreWrites:0,tenantId:'tenant-a',projectId:'project-a',visits:rows});
const profilePath=id=>`tenants/tenant-a/shoppers/${id}`;
const reviewPath=result=>`tenants/tenant-a/shopperIdentityReviews/${result.identityReviewQueue[0].reviewId}`;
const hash=value=>crypto.createHash('sha256').update(value,'utf8').digest('hex');

test('I3 P0 / two new HR rows with accent/case and HN local/prefix stay in one durable review, no Auth or profiles',async()=>{
  const {auth,db,provider}=make(),a='TYA_HN_AAA111',b='TYA_HN_BBB222';
  const hr=snapshot(row(a,'HN','Héctor Sánchez','9999-1234'),row(b,'Honduras','HECTOR  SANCHEZ','+504 9999 1234'));
  const originalHr=copy(hr);
  const first=await provider.reconcileSnapshot(hr,{sourceRevision:'hr-hn-first'});
  assert.equal(first.providerAck,true);assert.equal(first.status,'committed_with_identity_review');
  assert.equal(first.identityReviewCount,1);assert.equal(first.identityHeldShopperCount,2);
  assert.equal(first.reconciledShopperCount,0);assert.equal(auth.created,0);
  assert.equal(db.get(profilePath(a)),undefined);assert.equal(db.get(profilePath(b)),undefined);
  assert.equal(db.get(reviewPath(first)).status,'active');
  assert.deepEqual(hr,originalHr); // authoritative HR input is read-only
  assert.equal(db.paths().filter(p=>/\/(?:visits|paymentReconciliations|liquidations|payments)\//.test(p)).length,0);
  const replay=await provider.reconcileSnapshot(hr,{sourceRevision:'hr-hn-first'});
  assert.equal(replay.identityReviewCount,1);assert.equal(replay.identityReviewWrites,0);
  assert.equal(replay.identityHeldShopperCount,2);assert.equal(auth.created,0);
  assert.equal(db.paths().filter(p=>p.includes('/shopperIdentityReviews/')).length,1);
});

test('I3 P0 / country-own eight-digit and dial-prefix equivalence works for GT HN NI SV',async()=>{
  for(const [country,dial] of [['GT','502'],['HN','504'],['NI','505'],['SV','503']]){
    const {auth,provider}=make();
    const out=await provider.reconcileSnapshot(snapshot(
      row(`${country}_LOCAL` ,country,'María López','5555 4321'),
      row(`${country}_INTL`,country,'MARIA LOPEZ',`00${dial}55554321`)
    ),{sourceRevision:`hr-${country}`});
    assert.equal(out.identityReviewCount,1,country);
    assert.equal(out.identityHeldShopperCount,2,country);
    assert.equal(auth.created,0,country);
  }
});

test('I3 P0 / different countries or substantive phone differences are never auto-merged or held as one candidate',async()=>{
  const cases=[
    [row('GT_A','GT','María López','5555 4321'),row('HN_B','HN','Maria Lopez','5555 4321')],
    [row('GT_C','GT','María López','5555 4321'),row('GT_D','GT','Maria Lopez','5555 4322')]
  ];
  for(const [a,b] of cases){
    const {auth,provider}=make();
    const out=await provider.reconcileSnapshot(snapshot(a,b),{sourceRevision:`distinct-${a.shopperId}`});
    assert.equal(out.identityReviewCount,0);assert.equal(out.identityHeldShopperCount,0);
    assert.equal(auth.created,2);assert.equal(out.authCreated,2);
  }
});

test('I3 P0 / same country and phone with different human names never supplies authority to link them',async()=>{
  const {auth,provider}=make();
  const out=await provider.reconcileSnapshot(snapshot(
    row('GT_PERSONA_A','GT','Ana Martínez','5555 4321'),
    row('GT_PERSONA_B','GT','Beatriz Martínez','+502 5555 4321')
  ),{sourceRevision:'hr-family-shared-phone'});
  assert.equal(out.identityReviewCount,0);assert.equal(out.identityHeldShopperCount,0);
  assert.equal(out.authCreated,2);assert.equal(auth.created,2);
});

test('I3 P0 / an existing canonical HR profile survives while its new unlinked homonym is held',async()=>{
  const {auth,db,provider}=make(),a='TYA_GT_CANON1',b='TYA_GT_NEW002';
  const canonical=row(a,'GT','Ana Pérez','50255557777');
  const start=await provider.reconcileSnapshot(snapshot(canonical),{sourceRevision:'hr-canonical'});
  assert.equal(start.authCreated,1);
  const existing=copy(db.get(profilePath(a)));
  const next=await provider.reconcileSnapshot(snapshot(canonical,row(b,'Guatemala','ANA PEREZ','5555-7777')),{sourceRevision:'hr-new'});
  assert.equal(next.identityReviewCount,1);assert.equal(next.identityHeldShopperCount,1);
  assert.equal(next.authCreated,0);assert.equal(auth.created,1);
  assert.equal(db.get(profilePath(b)),undefined);
  assert.equal(db.get(profilePath(a)).shopperId,existing.shopperId);
});

test('I3 P0 / audited exact HR link outranks human-name resemblance; one technical principal, zero review',async()=>{
  const {auth,db,provider}=make(),canonical='TYA_GT_LINK01',alias='TYA_GT_ALIAS02';
  db.seed('tenants/tenant-a/shopperIdentityLinks/link-alias',{
    tenantId:'tenant-a',canonicalShopperId:canonical,sourceSystem:'hr',
    sourceIdentity:{legacyId:alias},projectScope:'project-a',status:'active',
    authorityType:'provider_exact',authorityRef:'signed-ack-canonical'
  });
  const out=await provider.reconcileSnapshot(snapshot(
    row(canonical,'GT','Máría Torres','5555 1000'),row(alias,'GT','MARIA TORRES','50255551000')
  ),{sourceRevision:'hr-exact-link'});
  assert.equal(out.identityReviewCount,0);assert.equal(out.identityHeldShopperCount,0);
  assert.equal(auth.created,1);assert.equal(db.get(profilePath(alias)),undefined);
  assert.equal(db.get(`tenants/tenant-a/shopperIdentityCrosswalk/${alias}`).shopperId,canonical);
});

test('I3 P0 / an evidenced human distinct resolution permits two separate source IDs on next HR revision',async()=>{
  const {auth,db,provider}=make(),a='TYA_GT_DIST01',b='TYA_GT_DIST02';
  const hr=snapshot(row(a,'GT','Marta Ruiz','5555 1999'),row(b,'GT','MARTA RUIZ','50255551999'));
  const first=await provider.reconcileSnapshot(hr,{sourceRevision:'hr-before-human'});
  assert.equal(first.identityHeldShopperCount,2);const review=first.identityReviewQueue[0];
  const ids=[a,b].sort(),resolutionId='srr_'+hash(['tenant-a','project-a',...ids].join('\0')).slice(0,32);
  db.seed(`tenants/tenant-a/shopperIdentityReviewResolutions/${resolutionId}`,{
    status:'resolved_distinct',shopperIds:ids,evidenceFingerprint:review.evidenceFingerprint,identityRemap:false
  });
  const next=await provider.reconcileSnapshot(hr,{sourceRevision:'hr-after-human'});
  assert.equal(next.identityReviewCount,0);assert.equal(next.identityHeldShopperCount,0);
  assert.equal(next.authCreated,2);assert.equal(auth.created,2);
  assert.ok(db.get(profilePath(a)));assert.ok(db.get(profilePath(b)));
});

test('I3 P0 / an unlinked HR newcomer in a later single-person snapshot cannot duplicate a prior canonical',async()=>{
  const {auth,db,provider}=make(),a='TYA_GT_PRIOR01',b='TYA_GT_LATER02';
  const first=await provider.reconcileSnapshot(snapshot(row(a,'GT','José Molina','50255559999')),{sourceRevision:'hr-before'});
  assert.equal(first.authCreated,1);assert.equal(auth.created,1);
  const original=copy(db.get(profilePath(a)));
  const later=snapshot(row(b,'Guatemala','JOSE  MOLINA','5555-9999'));
  const blocked=await provider.reconcileSnapshot(later,{sourceRevision:'hr-after'});
  assert.equal(blocked.identityReviewCount,1);assert.equal(blocked.identityHeldShopperCount,1);
  assert.equal(blocked.authCreated,0);assert.equal(blocked.reconciledShopperCount,0);
  assert.deepEqual(blocked.identityReviewQueue[0].shopperIds,[a,b].sort());
  assert.equal(auth.created,1);assert.equal(db.get(profilePath(b)),undefined);
  assert.deepEqual(db.get(profilePath(a)),original);
  const replay=await provider.reconcileSnapshot(later,{sourceRevision:'hr-after'});
  assert.equal(replay.identityReviewCount,1);assert.equal(replay.identityReviewWrites,0);
  assert.equal(db.paths().filter(p=>p.includes('/shopperIdentityReviews/')).length,1);
});

test('I3 P0 / the same established canonical can replay alone, while different new names/countries remain distinct',async()=>{
  const {auth,db,provider}=make(),a='TYA_GT_SAME01',b='TYA_GT_OTHER02',c='TYA_HN_OTHER03';
  const record=row(a,'GT','Diana López','5555 7777');
  await provider.reconcileSnapshot(snapshot(record),{sourceRevision:'hr-one'});
  const replay=await provider.reconcileSnapshot(snapshot(record),{sourceRevision:'hr-one'});
  assert.equal(replay.identityReviewCount,0);assert.equal(replay.authCreated,0);
  const different=await provider.reconcileSnapshot(snapshot(
    row(b,'GT','Diana Pérez','50255557777'),row(c,'HN','Diana López','5555 7777')
  ),{sourceRevision:'hr-different'});
  assert.equal(different.identityReviewCount,0);assert.equal(different.identityHeldShopperCount,0);
  assert.equal(different.authCreated,2);assert.equal(auth.created,3);
  assert.ok(db.get(profilePath(b)));assert.ok(db.get(profilePath(c)));
});

test('I3 P0 / protected distinct decision allows later single HR newcomer without linking to prior person',async()=>{
  const {auth,db,provider}=make(),a='TYA_HN_ORIG01',b='TYA_HN_NEW002';
  await provider.reconcileSnapshot(snapshot(row(a,'HN','Elena García','9999 1001')),{sourceRevision:'hr-first'});
  const newRow=snapshot(row(b,'Honduras','ELENA GARCIA','+50499991001'));
  const held=await provider.reconcileSnapshot(newRow,{sourceRevision:'hr-review'});
  assert.equal(held.identityHeldShopperCount,1);
  const ids=[a,b].sort(),review=held.identityReviewQueue[0];
  const resolutionId='srr_'+hash(['tenant-a','project-a',...ids].join('\0')).slice(0,32);
  db.seed(`tenants/tenant-a/shopperIdentityReviewResolutions/${resolutionId}`,{
    status:'resolved_distinct',shopperIds:ids,evidenceFingerprint:review.evidenceFingerprint,identityRemap:false
  });
  const resolved=await provider.reconcileSnapshot(newRow,{sourceRevision:'hr-review-2'});
  assert.equal(resolved.identityReviewCount,0);assert.equal(resolved.identityHeldShopperCount,0);
  assert.equal(resolved.authCreated,1);assert.equal(auth.created,2);
  assert.ok(db.get(profilePath(a)));assert.ok(db.get(profilePath(b)));
});
