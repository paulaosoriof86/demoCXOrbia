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
  constructor(){this._store=new Map();}
  collection(name){return new CollectionRef(this,name);}
  _set(path,value,options={},store=this._store){
    const prior=store.get(path);
    store.set(path,options?.merge&&prior?{...clone(prior),...clone(value)}:clone(value));
  }
  async runTransaction(fn){
    const working=new Map([...this._store].map(([k,v])=>[k,clone(v)]));
    const tx={get:async ref=>new Snapshot(ref.id,working.get(ref.path)),set:(ref,value,options={})=>this._set(ref.path,value,options,working)};
    const result=await fn(tx);this._store=working;return result;
  }
  get(path){return clone(this._store.get(path));}
  seed(path,value){this._store.set(path,clone(value));}
  entries(){return [...this._store.entries()].map(([k,v])=>[k,clone(v)]);}
}
class FakeAuth{
  constructor(){this.users=new Map();this.created=0;this.claimWrites=0;this.passwordWrites=0;}
  missing(){const e=new Error('not found');e.code='auth/user-not-found';return e;}
  async getUser(uid){const u=this.users.get(uid);if(!u)throw this.missing();return clone(u);}
  async getUserByEmail(email){for(const u of this.users.values())if(u.email===email)return clone(u);throw this.missing();}
  async createUser(record){const user={uid:record.uid,email:record.email,disabled:Boolean(record.disabled),customClaims:{}};this.users.set(record.uid,user);this.created++;return clone(user);}
  async setCustomUserClaims(uid,claims){const user=this.users.get(uid);if(!user)throw this.missing();user.customClaims=clone(claims);this.claimWrites++;}
  async updateUser(uid,patch){const user=this.users.get(uid);if(!user)throw this.missing();Object.assign(user,clone(patch));if(Object.hasOwn(patch,'password'))this.passwordWrites++;return clone(user);}
  async verifyIdToken(){return {uid:'admin-1',tenantId:'tenant-a',role:'super',authNamespace:'staff',projectIds:['project-a']};}
}

const policy={schemaVersion:'cxorbia.shopper-command-provider-policy.v1',enabled:true,allowedTenantIds:['tenant-a'],allowedProjectIds:['project-a'],hrWrites:false,externalWrites:false,fuzzyMatching:false};
const snapshot={sourceSafe:true,imported:false,firestoreWrites:0,tenantId:'tenant-a',projectId:'project-a',visits:[{id:'v1',shopperId:'shopper-1',shopperCode:'S1',pais:'GT',sourceSafe:true,piiProtected:true,hrRowId:'TAB!2',sourceTab:'TAB'}]};
const command=(idempotencyKey='gate8-1',payload={})=>({version:'cxorbia-command-adapter-v1',commandType:'shopper.credential.reset',entityType:'shopper',entityId:'shopper-1',tenantId:'tenant-a',projectId:'project-a',periodId:'2026-09',idempotencyKey,payload,authorization:{providerEnforcementRequired:true}});

async function setup(){
  const auth=new FakeAuth(),db=new FakeFirestore();
  db.seed('tenants/tenant-a/users/admin-1',{active:true,tenantId:'tenant-a',role:'super',authNamespace:'staff',projectIds:['project-a']});
  const provider=createShopperCommandProvider({auth,db,policy});
  await provider.reconcileSnapshot(snapshot,{sourceRevision:'hr-rev-1'});
  return {auth,db,provider,uid:stableShopperUid('tenant-a','shopper-1')};
}

test('Gate 8 enrolls a unique server-generated credential on the existing stable UID and stores no raw secret',async()=>{
  const {auth,db,provider,uid}=await setup();
  const beforeProfile=db.get('tenants/tenant-a/shoppers/shopper-1');
  const beforeCross=db.get('tenants/tenant-a/shopperIdentityCrosswalk/shopper-1');
  const result=await provider.execute('staff-token',command());
  assert.equal(result.ok,true);
  assert.equal(result.commandType,'shopper.credential.reset');
  assert.equal(result.entityId,'shopper-1');
  assert.equal(result.credentialIssued,true);
  assert.equal(result.credential.login,'shopper-1');
  assert.equal(result.credential.namespace,'shopper');
  assert.equal(result.credential.oneTimeDisclosure,true);
  assert.equal(result.credential.persist,false);
  assert.ok(result.credential.password.length>=24);
  assert.equal((await auth.getUser(uid)).password,result.credential.password);
  assert.equal(auth.passwordWrites,1);
  assert.equal(result.uidFingerprint,providerUidFingerprint(uid));
  assert.deepEqual(db.get('tenants/tenant-a/shoppers/shopper-1'),beforeProfile);
  assert.deepEqual(db.get('tenants/tenant-a/shopperIdentityCrosswalk/shopper-1'),beforeCross);
  const serializedStore=JSON.stringify(db.entries());
  assert.equal(serializedStore.includes(result.credential.password),false);
  const member=db.get(`tenants/tenant-a/users/${uid}`);
  assert.equal(member.credentialState,'enrolled');
  assert.equal(member.credentialVersion,'cxorbia-shopper-credential-v1');
});

test('Gate 8 replay is idempotent and never re-discloses or rotates the credential',async()=>{
  const {auth,provider,uid}=await setup();
  const first=await provider.execute('staff-token',command('gate8-replay'));
  const firstPassword=first.credential.password;
  const second=await provider.execute('staff-token',command('gate8-replay'));
  assert.equal(second.ok,true);
  assert.equal(second.idempotentReplay,true);
  assert.equal(second.credentialIssued,false);
  assert.equal(Object.hasOwn(second,'credential'),false);
  assert.equal(auth.passwordWrites,1);
  assert.equal((await auth.getUser(uid)).password,firstPassword);
});

test('Gate 8 rejects browser-supplied raw credential material before Auth mutation',async()=>{
  const {auth,provider}=await setup();
  const result=await provider.execute('staff-token',command('gate8-secret',{password:'browser-secret-must-not-pass'}));
  assert.equal(result.ok,false);
  assert.equal(result.code,'SHOPPER_COMMAND_INVALID');
  assert.ok(result.errors.includes('SHOPPER_CREDENTIAL_SECRET_IN_COMMAND_PAYLOAD'));
  assert.equal(auth.passwordWrites,0);
});
