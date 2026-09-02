import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createShopperCommandProvider,
  providerUidFingerprint,
  stableShopperUid
} from '../../cxorbia-shopper-command-provider-v1.mjs';

const clone=value=>value===undefined?undefined:structuredClone(value);
class Snapshot{
  constructor(id,value){this.id=id;this._value=value;this.exists=value!==undefined;}
  data(){return clone(this._value);}
}
class DocRef{
  constructor(db,path){this.db=db;this.path=path;this.id=path.split('/').at(-1);}
  collection(name){return new CollectionRef(this.db,`${this.path}/${name}`);}
  async get(){return new Snapshot(this.id,this.db._store.get(this.path));}
  async set(value,options={}){this.db._set(this.path,value,options);}
}
class Query{
  constructor(db,path,field,value,cap=Infinity){this.db=db;this.path=path;this.field=field;this.value=value;this.cap=cap;}
  limit(n){return new Query(this.db,this.path,this.field,this.value,n);}
  async get(){
    const prefix=`${this.path}/`,depth=this.path.split('/').length+1,docs=[];
    for(const [path,value] of this.db._store){
      if(!path.startsWith(prefix)||path.split('/').length!==depth)continue;
      if(value?.[this.field]===this.value)docs.push(new Snapshot(path.split('/').at(-1),value));
      if(docs.length>=this.cap)break;
    }
    return {size:docs.length,docs};
  }
}
class CollectionRef{
  constructor(db,path){this.db=db;this.path=path;}
  doc(id){return new DocRef(this.db,`${this.path}/${id}`);}
  where(field,op,value){assert.equal(op,'==');return new Query(this.db,this.path,field,value);}
}
class FakeFirestore{
  constructor(){this._store=new Map();this.failNextTransaction=false;}
  collection(name){return new CollectionRef(this,name);}
  _set(path,value,options={},store=this._store){
    const prior=store.get(path);
    store.set(path,options?.merge&&prior?{...clone(prior),...clone(value)}:clone(value));
  }
  async runTransaction(fn){
    const working=new Map([...this._store].map(([k,v])=>[k,clone(v)]));
    const tx={
      get:async ref=>new Snapshot(ref.id,working.get(ref.path)),
      set:(ref,value,options={})=>this._set(ref.path,value,options,working)
    };
    const result=await fn(tx);
    if(this.failNextTransaction){this.failNextTransaction=false;throw new Error('SIMULATED_FIRESTORE_COMMIT_FAILURE');}
    this._store=working;
    return result;
  }
  get(path){return clone(this._store.get(path));}
  seed(path,value){this._store.set(path,clone(value));}
  paths(){return [...this._store.keys()].sort();}
}
class FakeAuth{
  constructor(){this.users=new Map();this.created=0;this.claimWrites=0;}
  missing(){const e=new Error('not found');e.code='auth/user-not-found';return e;}
  async getUser(uid){const u=this.users.get(uid);if(!u)throw this.missing();return clone(u);}
  async getUserByEmail(email){for(const u of this.users.values())if(u.email===email)return clone(u);throw this.missing();}
  async createUser(record){if(this.users.has(record.uid))throw new Error('auth/uid-already-exists');const user={uid:record.uid,email:record.email,disabled:Boolean(record.disabled),customClaims:{}};this.users.set(record.uid,user);this.created++;return clone(user);}
  async setCustomUserClaims(uid,claims){const user=this.users.get(uid);if(!user)throw this.missing();user.customClaims=clone(claims);this.claimWrites++;}
  async verifyIdToken(){return {uid:'admin-1',tenantId:'tenant-a',role:'super',authNamespace:'staff',projectIds:['project-a']};}
  seed(user){this.users.set(user.uid,clone({...user,customClaims:user.customClaims||{}}));}
}

const policy={schemaVersion:'cxorbia.shopper-command-provider-policy.v1',enabled:true,allowedTenantIds:['tenant-a'],allowedProjectIds:[],hrWrites:false,externalWrites:false,fuzzyMatching:false};
const snapshot=({revisionCountry='GT',shopperId='shopper_gt_abc123',shopperCode='TYA_GT_ABC123',projectId='project-a'}={})=>({
  sourceSafe:true,
  imported:false,
  firestoreWrites:0,
  tenantId:'tenant-a',
  projectId,
  visits:[{id:'visit-1',tenantId:'tenant-a',projectId,shopperId,shopperCode,pais:revisionCountry,country:revisionCountry,sourceSafe:true,piiProtected:true,shopper:'Shopper protegido',hrRowId:'TAB!2',sourceTab:'TAB'}]
});
const paths=id=>({
  profile:`tenants/tenant-a/shoppers/${id}`,
  cross:`tenants/tenant-a/shopperIdentityCrosswalk/${id}`,
  users:'tenants/tenant-a/users'
});
const provider=(auth,db)=>createShopperCommandProvider({auth,db,policy});

// 1. Creación inicial: Auth + claims + perfil + membership + crosswalk con identidad estable.
test('Gate 6 / 1 initial HR shopper creates one durable identity',async()=>{
  const auth=new FakeAuth(),db=new FakeFirestore(),p=provider(auth,db),id='shopper_gt_abc123';
  const result=await p.reconcileSnapshot(snapshot(),{sourceRevision:'rev-1'});
  const uid=stableShopperUid('tenant-a',id),pp=paths(id);
  assert.equal(result.ok,true);assert.equal(result.shopperCount,1);assert.equal(result.authCreated,1);assert.equal(auth.created,1);
  const user=await auth.getUser(uid);assert.deepEqual(user.customClaims,{authNamespace:'shopper',projectIds:['project-a'],role:'shopper',shopperId:id,tenantId:'tenant-a'});
  assert.equal(db.get(pp.profile).shopperId,id);assert.equal(db.get(pp.profile).hrSourceRevision,'rev-1');
  assert.equal(db.get(`${pp.users}/${uid}`).shopperId,id);assert.equal(db.get(pp.cross).providerUidFingerprint,providerUidFingerprint(uid));
});

// 2. Replay: la misma revisión no crea otro Auth, perfil, membership ni crosswalk.
test('Gate 6 / 2 exact replay is idempotent and creates no duplicate',async()=>{
  const auth=new FakeAuth(),db=new FakeFirestore(),p=provider(auth,db),id='shopper_gt_abc123';
  await p.reconcileSnapshot(snapshot(),{sourceRevision:'rev-1'});
  const before=db.paths();const authBefore=auth.created;
  const result=await p.reconcileSnapshot(snapshot(),{sourceRevision:'rev-1'});
  assert.equal(result.idempotentReplays,1);assert.equal(result.providerWrites,0);assert.equal(auth.created,authBefore);assert.deepEqual(db.paths(),before);
});

// 3. Nueva revisión HR: actualiza solo managed fields y conserva identidad/campos no HR-managed.
test('Gate 6 / 3 HR-managed update preserves uid and non-HR-managed profile fields',async()=>{
  const auth=new FakeAuth(),db=new FakeFirestore(),p=provider(auth,db),id='shopper_gt_abc123',uid=stableShopperUid('tenant-a',id),pp=paths(id);
  await p.reconcileSnapshot(snapshot(),{sourceRevision:'rev-1'});
  db.seed(pp.profile,{...db.get(pp.profile),marketingConsent:true,preferredChannel:'whatsapp'});
  const result=await p.reconcileSnapshot(snapshot({revisionCountry:'HN',shopperCode:'TYA_HN_ABC123'}),{sourceRevision:'rev-2'});
  assert.equal(result.ok,true);assert.equal(auth.created,1);assert.equal((await auth.getUser(uid)).uid,uid);
  const profile=db.get(pp.profile);assert.equal(profile.country,'HN');assert.equal(profile.shopperCode,'TYA_HN_ABC123');assert.equal(profile.hrSourceRevision,'rev-2');assert.equal(profile.marketingConsent,true);assert.equal(profile.preferredChannel,'whatsapp');
});

// 4. Identidad durable preexistente: reutiliza UID/crosswalk; no crea identidad paralela.
test('Gate 6 / 4 existing shopper membership and crosswalk are reused',async()=>{
  const auth=new FakeAuth(),db=new FakeFirestore(),p=provider(auth,db),id='shopper_gt_abc123',legacyUid='legacy-provider-uid',pp=paths(id);
  auth.seed({uid:legacyUid,email:'legacy@auth.cxorbia.invalid',customClaims:{authNamespace:'shopper',projectIds:['older-project'],role:'shopper',shopperId:id,tenantId:'tenant-a'}});
  db.seed(`${pp.users}/${legacyUid}`,{active:true,tenantId:'tenant-a',role:'shopper',authNamespace:'shopper',shopperId:id,projectIds:['older-project'],providerUidFingerprint:providerUidFingerprint(legacyUid)});
  db.seed(pp.cross,{tenantId:'tenant-a',shopperId:id,projectIds:['older-project'],providerUidFingerprint:providerUidFingerprint(legacyUid),identityMode:'exact_technical_keys_only',fuzzyMatching:false});
  db.seed(pp.profile,{id,shopperId:id,tenantId:'tenant-a',projectIds:['older-project'],customKeep:'yes'});
  const result=await p.reconcileSnapshot(snapshot(),{sourceRevision:'rev-existing'});
  assert.equal(result.authCreated,0);assert.equal(auth.created,0);assert.ok(auth.users.has(legacyUid));assert.equal(auth.users.has(stableShopperUid('tenant-a',id)),false);
  assert.deepEqual(db.get(`${pp.users}/${legacyUid}`).projectIds,['older-project','project-a']);assert.equal(db.get(pp.profile).customKeep,'yes');assert.equal(db.get(pp.cross).providerUidFingerprint,providerUidFingerprint(legacyUid));
});

// 5. Fallo parcial/conflicto: sin ACK, retry seguro con mismo UID y conflicto nunca se sobreescribe.
test('Gate 6 / 5 partial failure and identity conflict fail closed with safe retry',async()=>{
  const auth=new FakeAuth(),db=new FakeFirestore(),p=provider(auth,db),id='shopper_gt_abc123',uid=stableShopperUid('tenant-a',id),pp=paths(id);
  db.failNextTransaction=true;
  await assert.rejects(()=>p.reconcileSnapshot(snapshot(),{sourceRevision:'rev-fail'}),/SIMULATED_FIRESTORE_COMMIT_FAILURE/);
  assert.equal(auth.created,1);assert.ok(auth.users.has(uid));assert.equal(db.get(pp.profile),undefined);assert.equal(db.get(pp.cross),undefined);
  const retry=await p.reconcileSnapshot(snapshot(),{sourceRevision:'rev-fail'});
  assert.equal(retry.ok,true);assert.equal(auth.created,1);assert.equal(db.get(pp.profile).shopperId,id);assert.equal(db.get(pp.cross).providerUidFingerprint,providerUidFingerprint(uid));

  const conflictId='shopper_gt_conflict',cp=paths(conflictId),wrongUid='other-uid';
  db.seed(cp.cross,{tenantId:'tenant-a',shopperId:conflictId,projectIds:['project-a'],providerUidFingerprint:providerUidFingerprint(wrongUid)});
  const conflictSnapshot=snapshot({shopperId:conflictId,shopperCode:'TYA_GT_CONFLICT'});
  await assert.rejects(()=>p.reconcileSnapshot(conflictSnapshot,{sourceRevision:'rev-conflict'}),/SHOPPER_CROSSWALK_UID_CONFLICT/);
  assert.equal(db.get(cp.cross).providerUidFingerprint,providerUidFingerprint(wrongUid));
});
