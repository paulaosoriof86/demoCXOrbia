import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  createShopperCommandProvider,
  providerUidFingerprint,
  stableShopperUid,
  CREDENTIAL_RULE_VERSION,
  DURABLE_CREDENTIAL_SWEEP_VERSION,
  shopperCredentialRule
} from '../../cxorbia-shopper-command-provider-v1.mjs';

const clone=value=>value===undefined?undefined:structuredClone(value);
const shaTest=value=>crypto.createHash('sha256').update(String(value),'utf8').digest('hex');
const internalEmailTest=(tenantId,visibleLogin)=>`${shaTest(`${tenantId}\0shopper\0${String(visibleLogin).toLowerCase()}`).slice(0,48)}@auth.cxorbia.invalid`;
const suffixLoginTest=(baseLogin,tenantId,shopperId,length=4)=>`${baseLogin}.${shaTest(`${tenantId}\0${shopperId}`).slice(0,length)}`;
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
  async get(){
    const prefix=`${this.path}/`,depth=this.path.split('/').length+1,docs=[];
    for(const [path,value] of this.db._store){
      if(path.startsWith(prefix)&&path.split('/').length===depth)docs.push(new Snapshot(path.split('/').at(-1),value));
    }
    return {size:docs.length,docs};
  }
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
  constructor(){this.users=new Map();this.created=0;this.claimWrites=0;this.updated=0;}
  missing(){const e=new Error('not found');e.code='auth/user-not-found';return e;}
  async getUser(uid){const u=this.users.get(uid);if(!u)throw this.missing();return clone(u);}
  async getUserByEmail(email){for(const u of this.users.values())if(u.email===email)return clone(u);throw this.missing();}
  async listUsers(maxResults=1000,pageToken){const all=[...this.users.values()].map(u=>clone(u)),start=pageToken?Number(pageToken):0,users=all.slice(start,start+maxResults),next=start+maxResults<all.length?String(start+maxResults):undefined;return {users,pageToken:next};}
  async createUser(record){if(this.users.has(record.uid))throw new Error('auth/uid-already-exists');const user={uid:record.uid,email:record.email,password:record.password,disabled:Boolean(record.disabled),customClaims:{}};this.users.set(record.uid,user);this.created++;return clone(user);}
  async updateUser(uid,patch){const user=this.users.get(uid);if(!user)throw this.missing();Object.assign(user,clone(patch));this.updated++;return clone(user);}
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
  visits:[{id:'visit-1',tenantId:'tenant-a',projectId,shopperId,shopperCode,pais:revisionCountry,country:revisionCountry,sourceSafe:true,piiProtected:true,shopper:'Persona Prueba',hrRowId:'TAB!2',sourceTab:'TAB'}]
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

test('Gate 6 / owner credential rule materializes visible login and deterministic Auth password without persisting the secret',async()=>{
  const auth=new FakeAuth(),db=new FakeFirestore(),p=provider(auth,db),id='shopper_gt_owner_rule',uid=stableShopperUid('tenant-a',id),pp=paths(id);
  const snap=snapshot({shopperId:id,shopperCode:'TYA_GT_OWNER'});
  snap.visits[0].shopper='Mishael De Paz';
  const result=await p.reconcileSnapshot(snap,{sourceRevision:'rev-owner-rule'});
  assert.equal(result.credentialRuleVersion,CREDENTIAL_RULE_VERSION);
  assert.equal(result.credentialRuleMissing,0);
  const expected=shopperCredentialRule({nombre:'Mishael De Paz'});
  assert.equal(expected.login,'mishael.depaz');
  assert.equal(expected.password,'Mishael123*');
  const user=await auth.getUser(uid);
  assert.equal(user.password,'Mishael123*');
  const member=db.get(`${pp.users}/${uid}`);
  const profile=db.get(pp.profile);
  assert.equal(member.visibleLogin,'mishael.depaz');
  assert.equal(member.credentialRuleVersion,CREDENTIAL_RULE_VERSION);
  assert.equal(profile.username,'mishael.depaz');
  assert.equal(profile.user,'mishael.depaz');
  assert.equal(JSON.stringify([...db._store.values()]).includes('Mishael123*'),false);
});


test('Gate 6 / credential rule strips accents from password and uses first name + first surname',()=>{
  const accent=shopperCredentialRule({nombre:'César Castillo'});
  assert.equal(accent.ok,true);
  assert.equal(accent.login,'cesar.castillo');
  assert.equal(accent.password,'Cesar123*');

  const fourTokens=shopperCredentialRule({nombre:'Ana María Pérez López'});
  assert.equal(fourTokens.login,'ana.perez');
  assert.equal(fourTokens.password,'Ana123*');

  const structured=shopperCredentialRule({nombre:'Ana María Pérez López',firstName:'Ana María',lastName:'Pérez López'});
  assert.equal(structured.login,'ana.perez');
  assert.equal(structured.password,'Ana123*');

  const compound=shopperCredentialRule({nombre:'Mishael De Paz'});
  assert.equal(compound.login,'mishael.depaz');
  assert.equal(compound.password,'Mishael123*');
});

test('Gate 6 / protected HR snapshot uses the trusted ephemeral identity map for the owner credential rule',async()=>{
  const auth=new FakeAuth(),db=new FakeFirestore(),p=provider(auth,db),id='shopper_gt_protected',uid=stableShopperUid('tenant-a',id),pp=paths(id);
  const snap=snapshot({shopperId:id,shopperCode:'TYA_GT_PROTECTED'});
  snap.visits[0].shopper='Shopper protegido';
  const missing=await p.reconcileSnapshot(snap,{sourceRevision:'rev-protected-missing'});
  assert.equal(missing.ok,true);
  assert.equal(missing.status,'committed_with_identity_review');
  assert.equal(missing.identityReviewCount,1);
  assert.equal(missing.identityReviewQueue[0].sourceShopperId,id);
  assert.equal(missing.identityReviewQueue[0].reason,'SHOPPER_CREDENTIAL_NAME_INCOMPLETE');
  assert.equal(db.get(pp.profile),undefined);
  assert.equal(auth.users.size,0);
  const identityByShopperId=new Map([[id,'Mishael De Paz']]);
  const result=await p.reconcileSnapshot(snap,{sourceRevision:'rev-protected',identityByShopperId});
  assert.equal(result.credentialRuleMissing,0);
  assert.equal(result.credentialNormalized,1);
  assert.equal((await auth.getUser(uid)).password,'Mishael123*');
  assert.equal(db.get(`${pp.users}/${uid}`).visibleLogin,'mishael.depaz');
  assert.equal(db.get(pp.profile).username,'mishael.depaz');
  assert.equal(JSON.stringify([...db._store.values()]).includes('Mishael123*'),false);
});

test('Gate 6 / trusted exact identity link reuses one canonical Auth for an HR technical alias',async()=>{
  const auth=new FakeAuth(),db=new FakeFirestore(),p=provider(auth,db),canonical='shopper_gt_cesar_plain',alias='shopper_gt_cesar_accent',canonicalUid=stableShopperUid('tenant-a',canonical);
  const first=snapshot({shopperId:canonical,shopperCode:'TYA_GT_CESAR'});first.visits[0].shopper='Cesar Castillo';
  await p.reconcileSnapshot(first,{sourceRevision:'rev-cesar-1'});
  db.seed('tenants/tenant-a/shopperIdentityLinks/link-cesar',{tenantId:'tenant-a',canonicalShopperId:canonical,sourceSystem:'hr',sourceIdentity:{legacyId:alias},projectScope:'project-a',status:'active',authorityType:'provider_exact',authorityRef:'provider-ack-cesar'});
  const second=snapshot({shopperId:alias,shopperCode:'TYA_GT_CESAR_ALIAS'});second.visits[0].shopper='César Castillo';
  const result=await p.reconcileSnapshot(second,{sourceRevision:'rev-cesar-2'});
  assert.equal(result.authCreated,0);assert.equal(auth.created,1);assert.equal(auth.users.size,1);
  assert.equal((await auth.getUser(canonicalUid)).customClaims.shopperId,canonical);
  assert.equal((await auth.getUser(canonicalUid)).password,'Cesar123*');
  assert.equal(db.get(`tenants/tenant-a/users/${canonicalUid}`).shopperId,canonical);
  assert.deepEqual(db.get(`tenants/tenant-a/shoppers/${canonical}`).sourceShopperIds,[alias]);
  assert.equal(db.get(`tenants/tenant-a/shopperIdentityCrosswalk/${alias}`).shopperId,canonical);
  assert.equal(db.get(`tenants/tenant-a/shopperIdentityCrosswalk/${alias}`).identityMode,'provider_exact_identity_link');
});


test('VRM-081 / exact existing Auth + membership survives incomplete HR name without fabricated credential',async()=>{
  const auth=new FakeAuth(),db=new FakeFirestore(),p=provider(auth,db),id='shopper_gt_incomplete_exact',uid='legacy-exact-uid',pp=paths(id);
  auth.seed({uid,email:'legacy-exact@auth.cxorbia.invalid',password:'KEEP-ME',disabled:false,customClaims:{tenantId:'tenant-a',role:'shopper',authNamespace:'shopper',shopperId:id,projectIds:['project-a']}});
  db.seed(`${pp.users}/${uid}`,{active:true,tenantId:'tenant-a',role:'shopper',authNamespace:'shopper',shopperId:id,projectIds:['project-a'],providerUidFingerprint:providerUidFingerprint(uid)});
  db.seed(pp.cross,{tenantId:'tenant-a',shopperId:id,projectIds:['project-a'],providerUidFingerprint:providerUidFingerprint(uid),sourceStableKey:id,identityMode:'stable_hr_shopper_id',sourceType:'hr_external',fuzzyMatching:false});
  db.seed(pp.profile,{id,shopperId:id,tenantId:'tenant-a',projectIds:['project-a'],sourceType:'hr_external'});
  const snap=snapshot({shopperId:id,shopperCode:'TYA_GT_INCOMPLETE'});
  snap.visits[0].shopper='Shopper protegido';
  const result=await p.reconcileSnapshot(snap,{sourceRevision:'rev-incomplete-exact'});
  assert.equal(result.ok,true);
  assert.equal(result.identityReviewCount,0);
  assert.equal(result.credentialRuleMissing,1);
  assert.equal(auth.created,0);
  assert.equal(auth.updated,0);
  assert.equal((await auth.getUser(uid)).password,'KEEP-ME');
  assert.equal((await auth.getUser(uid)).email,'legacy-exact@auth.cxorbia.invalid');
  assert.equal(db.get(`${pp.users}/${uid}`).shopperId,id);
  assert.equal(db.get(pp.profile).hrSourceRevision,'rev-incomplete-exact');
  assert.equal(db.get(pp.profile).nombre,undefined);
});

test('VRM-081 / distinct current shoppers keep unique base holder and receive deterministic suffixes idempotently',async()=>{
  const auth=new FakeAuth(),db=new FakeFirestore(),p=provider(auth,db);
  const alpha='shopper_gt_alpha',beta='shopper_gt_beta',gamma='shopper_gt_gamma';
  const first=snapshot({shopperId:alpha,shopperCode:'TYA_GT_ALPHA'});first.visits[0].shopper='Patricia Ordoñez';
  await p.reconcileSnapshot(first,{sourceRevision:'rev-visible-holder'});
  const base=snapshot({shopperId:alpha,shopperCode:'TYA_GT_ALPHA'});
  base.visits=[
    {...base.visits[0],id:'visit-alpha',shopperId:alpha,shopperCode:'TYA_GT_ALPHA',shopper:'Patricia Ordoñez'},
    {...base.visits[0],id:'visit-beta',shopperId:beta,shopperCode:'TYA_GT_BETA',shopper:'Patricia Ordoñez'},
    {...base.visits[0],id:'visit-gamma',shopperId:gamma,shopperCode:'TYA_GT_GAMMA',shopper:'Lucia Rivera'}
  ];
  const result=await p.reconcileSnapshot(base,{sourceRevision:'rev-visible-collision'});
  assert.equal(result.ok,true);
  assert.equal(result.status,'committed');
  assert.equal(result.identityReviewCount,0);
  assert.equal(result.reconciledShopperCount,3);
  const alphaUid=stableShopperUid('tenant-a',alpha),betaUid=stableShopperUid('tenant-a',beta);
  assert.equal(db.get(`tenants/tenant-a/users/${alphaUid}`).visibleLogin,'patricia.ordonez');
  const expectedBeta=suffixLoginTest('patricia.ordonez','tenant-a',beta,4);
  assert.equal(db.get(`tenants/tenant-a/users/${betaUid}`).visibleLogin,expectedBeta);
  assert.equal(db.get(`tenants/tenant-a/shoppers/${beta}`).credentialDisambiguationPolicy,'deterministic_technical_suffix');
  assert.equal((await auth.getUser(betaUid)).email,internalEmailTest('tenant-a',expectedBeta));
  assert.equal((await auth.getUser(betaUid)).password,'Patricia123*');
  const created=auth.created,pathsBefore=db.paths();
  const replay=await p.reconcileSnapshot(base,{sourceRevision:'rev-visible-collision'});
  assert.equal(replay.identityReviewCount,0);
  assert.equal(auth.created,created);
  assert.deepEqual(db.paths(),pathsBefore);
  assert.equal(db.get(`tenants/tenant-a/users/${betaUid}`).visibleLogin,expectedBeta);
});

test('VRM-081 / collision group with no unique unsuffixed holder suffixes every member instead of choosing by name',async()=>{
  const auth=new FakeAuth(),db=new FakeFirestore(),p=provider(auth,db);
  const a='shopper_gt_same_a',b='shopper_gt_same_b';
  const snap=snapshot({shopperId:a,shopperCode:'TYA_GT_SAME_A'});
  snap.visits=[
    {...snap.visits[0],id:'visit-a',shopperId:a,shopperCode:'TYA_GT_SAME_A',shopper:'Ana Pérez'},
    {...snap.visits[0],id:'visit-b',shopperId:b,shopperCode:'TYA_GT_SAME_B',shopper:'Ana Pérez'}
  ];
  const result=await p.reconcileSnapshot(snap,{sourceRevision:'rev-all-suffixed'});
  assert.equal(result.identityReviewCount,0);
  const aLogin=db.get(`tenants/tenant-a/users/${stableShopperUid('tenant-a',a)}`).visibleLogin;
  const bLogin=db.get(`tenants/tenant-a/users/${stableShopperUid('tenant-a',b)}`).visibleLogin;
  assert.equal(aLogin,suffixLoginTest('ana.perez','tenant-a',a,4));
  assert.equal(bLogin,suffixLoginTest('ana.perez','tenant-a',b,4));
  assert.notEqual(aLogin,bLogin);
});

test('VRM-081 / deterministic suffix escalates 4 to 6 to 8 without overwriting existing holders',async()=>{
  const auth=new FakeAuth(),db=new FakeFirestore(),p=provider(auth,db),target='shopper_gt_suffix_target';
  const base='ana.perez',l4=suffixLoginTest(base,'tenant-a',target,4),l6=suffixLoginTest(base,'tenant-a',target,6),l8=suffixLoginTest(base,'tenant-a',target,8);
  const holders=[
    ['holder-base',base,'historical_base'],
    ['holder-4',l4,'historical_4'],
    ['holder-6',l6,'historical_6']
  ];
  for(const [uid,login,shopperId] of holders){
    auth.seed({uid,email:internalEmailTest('tenant-a',login),disabled:false,customClaims:{tenantId:'tenant-a',role:'shopper',authNamespace:'shopper',shopperId,projectIds:['legacy-project']}});
  }
  const snap=snapshot({shopperId:target,shopperCode:'TYA_GT_SUFFIX'});snap.visits[0].shopper='Ana Pérez';
  const result=await p.reconcileSnapshot(snap,{sourceRevision:'rev-suffix-8'});
  assert.equal(result.identityReviewCount,0);
  const uid=stableShopperUid('tenant-a',target);
  assert.equal(db.get(`tenants/tenant-a/users/${uid}`).visibleLogin,l8);
  assert.equal((await auth.getUser(uid)).email,internalEmailTest('tenant-a',l8));
  assert.equal((await auth.getUser('holder-4')).email,internalEmailTest('tenant-a',l4));
  assert.equal((await auth.getUser('holder-6')).email,internalEmailTest('tenant-a',l6));
});

test('VRM-081 / proven exact alias self-crosswalk migrates the same principal to canonical idempotently',async()=>{
  const auth=new FakeAuth(),db=new FakeFirestore(),p=provider(auth,db);
  const alias='shopper_gt_legacy_alias',canonical='shp-canonical-existing';
  const first=snapshot({shopperId:alias,shopperCode:'TYA_GT_ALIAS'});first.visits[0].shopper='Cesar Castillo';
  await p.reconcileSnapshot(first,{sourceRevision:'rev-alias-self'});
  const aliasUid=stableShopperUid('tenant-a',alias),aliasCross=`tenants/tenant-a/shopperIdentityCrosswalk/${alias}`;
  db.seed(`tenants/tenant-a/shoppers/${canonical}`,{id:canonical,shopperId:canonical,tenantId:'tenant-a',projectIds:['project-a'],nombre:'Cesar Castillo',firstName:'Cesar',lastName:'Castillo',sourceType:'hr_external'});
  db.seed('tenants/tenant-a/shopperIdentityLinks/link-existing-canonical',{tenantId:'tenant-a',canonicalShopperId:canonical,sourceSystem:'hr',sourceIdentity:{legacyId:alias},projectScope:'project-a',status:'active',authorityType:'provider_exact',authorityRef:'provider-ack-existing-canonical'});
  const result=await p.reconcileSnapshot(first,{sourceRevision:'rev-alias-after-exact-link'});
  assert.equal(result.ok,true);
  assert.equal(result.identityMigrationRequired,false);
  assert.equal(result.identityMigrationCount,0);
  assert.equal(result.aliasMigrated,1);
  assert.equal(auth.created,1);
  assert.equal(auth.users.size,1);
  assert.equal((await auth.getUser(aliasUid)).customClaims.shopperId,canonical);
  assert.equal(db.get(`tenants/tenant-a/users/${aliasUid}`).shopperId,canonical);
  assert.equal(db.get(aliasCross).shopperId,canonical);
  assert.equal(db.get(aliasCross).identityMode,'provider_exact_identity_link');
  assert.deepEqual(db.get(`tenants/tenant-a/shoppers/${canonical}`).sourceShopperIds,[alias]);
  const created=auth.created;
  const replay=await p.reconcileSnapshot(first,{sourceRevision:'rev-alias-after-exact-link'});
  assert.equal(replay.identityMigrationCount,0);
  assert.equal(auth.created,created);
  assert.equal(auth.users.size,1);
});

test('VRM-081 / dual exact principals preserve canonical and retire historical alias idempotently',async()=>{
  const auth=new FakeAuth(),db=new FakeFirestore(),p=provider(auth,db);
  const alias='shopper_gt_dual_alias',canonical='shp-dual-canonical';
  const first=snapshot({shopperId:alias,shopperCode:'TYA_GT_DUAL'});first.visits[0].shopper='Cesar Castillo';
  await p.reconcileSnapshot(first,{sourceRevision:'rev-dual-alias'});
  const aliasUid=stableShopperUid('tenant-a',alias),canonicalUid='canonical-existing-uid';
  db.seed(`tenants/tenant-a/shoppers/${canonical}`,{id:canonical,shopperId:canonical,tenantId:'tenant-a',projectIds:['project-a'],nombre:'Cesar Castillo',firstName:'Cesar',lastName:'Castillo',sourceType:'hr_external'});
  db.seed(`tenants/tenant-a/users/${canonicalUid}`,{active:true,tenantId:'tenant-a',role:'shopper',authNamespace:'shopper',shopperId:canonical,projectIds:['project-a'],providerUidFingerprint:providerUidFingerprint(canonicalUid)});
  auth.seed({uid:canonicalUid,email:'canonical-existing@example.invalid',password:'KEEP-CANONICAL',disabled:false,customClaims:{tenantId:'tenant-a',role:'shopper',authNamespace:'shopper',shopperId:canonical,projectIds:['project-a']}});
  db.seed('tenants/tenant-a/shopperIdentityLinks/link-dual',{tenantId:'tenant-a',canonicalShopperId:canonical,sourceSystem:'hr',sourceIdentity:{legacyId:alias},projectScope:'project-a',status:'active',authorityType:'provider_exact',authorityRef:'provider-ack-dual'});
  const result=await p.reconcileSnapshot(first,{sourceRevision:'rev-dual-canonical'});
  assert.equal(result.identityMigrationCount,0);
  assert.equal(result.aliasMigrated,1);
  assert.equal(result.aliasPrincipalsRetired,1);
  assert.equal((await auth.getUser(canonicalUid)).disabled,false);
  assert.equal((await auth.getUser(canonicalUid)).customClaims.shopperId,canonical);
  assert.equal((await auth.getUser(aliasUid)).disabled,true);
  assert.equal(db.get(`tenants/tenant-a/users/${canonicalUid}`).active,true);
  assert.equal(db.get(`tenants/tenant-a/users/${canonicalUid}`).shopperId,canonical);
  assert.equal(db.get(`tenants/tenant-a/users/${aliasUid}`).active,false);
  assert.equal(db.get(`tenants/tenant-a/users/${aliasUid}`).status,'superseded');
  assert.equal(db.get(`tenants/tenant-a/users/${aliasUid}`).supersededByShopperId,canonical);
  assert.equal(db.get(`tenants/tenant-a/shopperIdentityCrosswalk/${alias}`).shopperId,canonical);
  const replay=await p.reconcileSnapshot(first,{sourceRevision:'rev-dual-canonical'});
  assert.equal(replay.aliasPrincipalsRetired,0);
  assert.equal((await auth.getUser(aliasUid)).disabled,true);
  assert.equal((await auth.getUser(canonicalUid)).disabled,false);
});

test('VRM-081 / two alias-only exact principals choose deterministic non-credential keeper and retire the other',async()=>{
  const auth=new FakeAuth(),db=new FakeFirestore(),p=provider(auth,db);
  const a='shopper_gt_alias_a',b='shopper_gt_alias_z',canonical='shp-alias-pair';
  db.seed(`tenants/tenant-a/shoppers/${canonical}`,{id:canonical,shopperId:canonical,tenantId:'tenant-a',projectIds:['project-a'],nombre:'Cesar Castillo',firstName:'Cesar',lastName:'Castillo',sourceType:'hr_external'});
  for(const [alias,uid] of [[a,'alias-a-uid'],[b,'alias-z-uid']]){
    db.seed(`tenants/tenant-a/shoppers/${alias}`,{id:alias,shopperId:alias,tenantId:'tenant-a',projectIds:['project-a'],nombre:'Cesar Castillo',sourceType:'hr_external'});
    db.seed(`tenants/tenant-a/shopperIdentityCrosswalk/${alias}`,{tenantId:'tenant-a',shopperId:alias,projectIds:['project-a'],providerUidFingerprint:providerUidFingerprint(uid),sourceStableKey:alias,identityMode:'stable_hr_shopper_id',sourceType:'hr_external',fuzzyMatching:false});
    db.seed(`tenants/tenant-a/users/${uid}`,{active:true,tenantId:'tenant-a',role:'shopper',authNamespace:'shopper',shopperId:alias,projectIds:['project-a'],providerUidFingerprint:providerUidFingerprint(uid)});
    auth.seed({uid,email:`${uid}@example.invalid`,password:'LEGACY',disabled:false,customClaims:{tenantId:'tenant-a',role:'shopper',authNamespace:'shopper',shopperId:alias,projectIds:['project-a']}});
    db.seed(`tenants/tenant-a/shopperIdentityLinks/link-${alias}`,{tenantId:'tenant-a',canonicalShopperId:canonical,sourceSystem:'hr',sourceIdentity:{legacyId:alias},projectScope:'project-a',status:'active',authorityType:'provider_exact',authorityRef:`ack-${alias}`});
  }
  const snap=snapshot({shopperId:b,shopperCode:'TYA_GT_ALIAS_Z'});
  snap.visits=[
    {...snap.visits[0],id:'visit-z',shopperId:b,shopperCode:'TYA_GT_ALIAS_Z',shopper:'Cesar Castillo'},
    {...snap.visits[0],id:'visit-a',shopperId:a,shopperCode:'TYA_GT_ALIAS_A',shopper:'Cesar Castillo'}
  ];
  const result=await p.reconcileSnapshot(snap,{sourceRevision:'rev-alias-pair'});
  assert.equal(result.identityReviewCount,0);
  assert.equal(result.identityMigrationCount,0);
  assert.equal(result.aliasMigrated,2);
  assert.equal(result.aliasPrincipalsRetired,1);
  assert.equal(db.get('tenants/tenant-a/users/alias-a-uid').shopperId,canonical);
  assert.equal(db.get('tenants/tenant-a/users/alias-a-uid').active,true);
  assert.equal((await auth.getUser('alias-a-uid')).disabled,false);
  assert.equal((await auth.getUser('alias-a-uid')).customClaims.shopperId,canonical);
  assert.equal(db.get('tenants/tenant-a/users/alias-z-uid').active,false);
  assert.equal((await auth.getUser('alias-z-uid')).disabled,true);
  assert.equal(db.get(`tenants/tenant-a/shopperIdentityCrosswalk/${a}`).shopperId,canonical);
  assert.equal(db.get(`tenants/tenant-a/shopperIdentityCrosswalk/${b}`).shopperId,canonical);
});

test('VRM-081 / multiple credential-bearing alias principals remain fail closed',async()=>{
  const auth=new FakeAuth(),db=new FakeFirestore(),p=provider(auth,db);
  const a='shopper_gt_credential_alias_a',b='shopper_gt_credential_alias_b',canonical='shp-credential-pair';
  db.seed(`tenants/tenant-a/shoppers/${canonical}`,{id:canonical,shopperId:canonical,tenantId:'tenant-a',projectIds:['project-a'],nombre:'Cesar Castillo',sourceType:'hr_external'});
  for(const [alias,uid,login] of [[a,'cred-a','cesar.a'],[b,'cred-b','cesar.b']]){
    db.seed(`tenants/tenant-a/shopperIdentityCrosswalk/${alias}`,{tenantId:'tenant-a',shopperId:alias,projectIds:['project-a'],providerUidFingerprint:providerUidFingerprint(uid),sourceStableKey:alias,identityMode:'stable_hr_shopper_id',sourceType:'hr_external',fuzzyMatching:false});
    db.seed(`tenants/tenant-a/users/${uid}`,{active:true,tenantId:'tenant-a',role:'shopper',authNamespace:'shopper',shopperId:alias,projectIds:['project-a'],providerUidFingerprint:providerUidFingerprint(uid),visibleLogin:login,credentialRuleVersion:CREDENTIAL_RULE_VERSION,credentialState:'enrolled'});
    auth.seed({uid,email:internalEmailTest('tenant-a',login),disabled:false,customClaims:{tenantId:'tenant-a',role:'shopper',authNamespace:'shopper',shopperId:alias,projectIds:['project-a']}});
    db.seed(`tenants/tenant-a/shopperIdentityLinks/link-${alias}`,{tenantId:'tenant-a',canonicalShopperId:canonical,sourceSystem:'hr',sourceIdentity:{legacyId:alias},projectScope:'project-a',status:'active',authorityType:'provider_exact',authorityRef:`ack-${alias}`});
  }
  const snap=snapshot({shopperId:a,shopperCode:'TYA_GT_CRED_A'});
  snap.visits=[
    {...snap.visits[0],id:'cred-a',shopperId:a,shopper:'Cesar Castillo'},
    {...snap.visits[0],id:'cred-b',shopperId:b,shopper:'Cesar Castillo'}
  ];
  await assert.rejects(()=>p.reconcileSnapshot(snap,{sourceRevision:'rev-credential-pair'}),/SHOPPER_EXACT_ALIAS_MULTIPLE_CREDENTIAL_BEARING_PRINCIPALS/);
  assert.equal((await auth.getUser('cred-a')).disabled,false);
  assert.equal((await auth.getUser('cred-b')).disabled,false);
});

test('VRM-081 / exact alias with no prior membership or Auth materializes one canonical principal only',async()=>{
  const auth=new FakeAuth(),db=new FakeFirestore(),p=provider(auth,db);
  const alias='shopper_gt_alias_no_principal',canonical='canonical-no-principal';
  db.seed(`tenants/tenant-a/shoppers/${alias}`,{
    id:alias,shopperId:alias,tenantId:'tenant-a',projectIds:['project-a'],
    nombre:'Cesar Castillo',firstName:'Cesar',lastName:'Castillo',sourceType:'hr_external'
  });
  db.seed(`tenants/tenant-a/shopperIdentityCrosswalk/${alias}`,{
    tenantId:'tenant-a',shopperId:alias,projectIds:['project-a'],
    providerUidFingerprint:providerUidFingerprint('legacy-missing-uid'),
    sourceStableKey:alias,identityMode:'stable_hr_shopper_id',sourceType:'hr_external',fuzzyMatching:false
  });
  db.seed(`tenants/tenant-a/shoppers/${canonical}`,{
    id:canonical,shopperId:canonical,tenantId:'tenant-a',projectIds:['project-a'],
    nombre:'Cesar Castillo',firstName:'Cesar',lastName:'Castillo',sourceType:'hr_external'
  });
  db.seed('tenants/tenant-a/shopperIdentityLinks/link-no-principal',{
    tenantId:'tenant-a',canonicalShopperId:canonical,sourceSystem:'hr',
    sourceIdentity:{legacyId:alias},projectScope:'project-a',status:'active',
    authorityType:'provider_exact',authorityRef:'provider-ack-no-principal'
  });
  const snap=snapshot({shopperId:alias,shopperCode:'TYA_GT_ALIAS_NOPRINCIPAL'});
  snap.visits[0].shopper='Cesar Castillo';
  const result=await p.reconcileSnapshot(snap,{sourceRevision:'rev-alias-no-principal'});
  const uid=stableShopperUid('tenant-a',canonical);
  assert.equal(result.identityMigrationCount,0);
  assert.equal(result.aliasMigrated,1);
  assert.equal(auth.created,1);
  assert.equal(auth.users.size,1);
  assert.equal((await auth.getUser(uid)).customClaims.shopperId,canonical);
  assert.equal(db.get(`tenants/tenant-a/users/${uid}`).shopperId,canonical);
  assert.equal(db.get(`tenants/tenant-a/shopperIdentityCrosswalk/${alias}`).shopperId,canonical);
  assert.equal(db.get(`tenants/tenant-a/shopperIdentityCrosswalk/${alias}`).identityMode,'provider_exact_identity_link');
  const replay=await p.reconcileSnapshot(snap,{sourceRevision:'rev-alias-no-principal'});
  assert.equal(replay.identityMigrationCount,0);
  assert.equal(auth.created,1);
  assert.equal(auth.users.size,1);
});

test('VRM-081 / conflicting exact identity links fail closed and never merge by name',async()=>{
  const auth=new FakeAuth(),db=new FakeFirestore(),p=provider(auth,db),alias='shopper_gt_conflicting_alias';
  db.seed('tenants/tenant-a/shopperIdentityLinks/link-a',{tenantId:'tenant-a',canonicalShopperId:'canonical-a',sourceSystem:'hr',sourceIdentity:{legacyId:alias},projectScope:'project-a',status:'active',authorityType:'provider_exact',authorityRef:'a'});
  db.seed('tenants/tenant-a/shopperIdentityLinks/link-b',{tenantId:'tenant-a',canonicalShopperId:'canonical-b',sourceSystem:'hr',sourceIdentity:{legacyId:alias},projectScope:'project-a',status:'active',authorityType:'provider_exact',authorityRef:'b'});
  const snap=snapshot({shopperId:alias,shopperCode:'TYA_GT_CONFLICT_LINK'});snap.visits[0].shopper='Cesar Castillo';
  await assert.rejects(()=>p.reconcileSnapshot(snap,{sourceRevision:'rev-link-conflict'}),/SHOPPER_IDENTITY_LINK_CONFLICT/);
  assert.equal(auth.created,0);
  assert.equal(db.paths().filter(path=>path.includes('/users/')).length,0);
});

test('VRM-168 / stale tenant adjudication cannot override a live exact HR and Auth principal',async()=>{
  const auth=new FakeAuth(),db=new FakeFirestore(),p=provider(auth,db);
  const source='shopper_gt_live_exact',legacy='s3',uid='live-exact-uid',legacyUid='legacy-target-uid';
  const visibleLogin='paula.osorio',email=internalEmailTest('tenant-a',visibleLogin);
  auth.seed({uid,email,password:'Paula123*',disabled:false,customClaims:{tenantId:'tenant-a',role:'shopper',authNamespace:'shopper',shopperId:source,projectIds:['project-a']}});
  db.seed(`tenants/tenant-a/users/${uid}`,{
    active:true,tenantId:'tenant-a',role:'shopper',authNamespace:'shopper',shopperId:source,projectIds:['project-a'],
    providerUidFingerprint:providerUidFingerprint(uid),visibleLogin,credentialRuleVersion:CREDENTIAL_RULE_VERSION,credentialState:'enrolled'
  });
  db.seed(`tenants/tenant-a/shoppers/${source}`,{
    id:source,shopperId:source,tenantId:'tenant-a',projectIds:['project-a'],sourceType:'hr_external',
    nombre:'Paula Osorio',firstName:'Paula',lastName:'Osorio',visibleLogin,username:visibleLogin,user:visibleLogin,
    credentialRuleVersion:CREDENTIAL_RULE_VERSION,hrSourceRevision:'older-live-revision'
  });
  db.seed(`tenants/tenant-a/shoppers/${legacy}`,{id:legacy,shopperId:legacy,tenantId:'tenant-a',projectIds:['project-a'],sourceType:'hr_external'});
  db.seed(`tenants/tenant-a/users/${legacyUid}`,{
    active:true,tenantId:'tenant-a',role:'shopper',authNamespace:'shopper',shopperId:legacy,projectIds:['project-a'],
    providerUidFingerprint:providerUidFingerprint(legacyUid)
  });
  auth.seed({uid:legacyUid,email:'legacy-target@auth.cxorbia.invalid',disabled:false,customClaims:{tenantId:'tenant-a',role:'shopper',authNamespace:'shopper',shopperId:legacy,projectIds:['project-a']}});
  db.seed(`tenants/tenant-a/shopperIdentityCrosswalk/${source}`,{
    tenantId:'tenant-a',shopperId:legacy,projectIds:['project-a'],providerUidFingerprint:providerUidFingerprint(legacyUid),
    sourceStableKey:source,identityMode:'provider_exact_identity_link',sourceType:'hr_external',fuzzyMatching:false,
    migrationAuthorityType:'tenant_adjudication',migrationAuthorityRef:'historical-adjudication'
  });
  db.seed('tenants/tenant-a/shopperIdentityLinks/stale-tenant-adjudication',{
    tenantId:'tenant-a',canonicalShopperId:legacy,sourceSystem:'hr',sourceIdentityKey:source,
    projectScope:'project-a',status:'materialized',authorityType:'tenant_adjudication',
    authorityRef:'historical-adjudication',periodIndependent:true
  });
  const snap=snapshot({shopperId:source,shopperCode:'TYA_GT_LIVE_EXACT'});
  snap.visits[0].shopper='Paula Osorio';
  const first=await p.reconcileSnapshot(snap,{sourceRevision:'fresh-live-revision'});
  assert.equal(first.ok,true);
  assert.equal(first.tenantAdjudicationSuppressed,1);
  assert.equal(first.staleTenantAdjudicationRepairs,1);
  assert.equal(first.authCreated,0);
  assert.equal((await auth.getUser(uid)).customClaims.shopperId,source);
  assert.equal((await auth.getUser(uid)).disabled,false);
  const repaired=db.get(`tenants/tenant-a/shopperIdentityCrosswalk/${source}`);
  assert.equal(repaired.shopperId,source);
  assert.equal(repaired.sourceStableKey,source);
  assert.equal(repaired.identityMode,'stable_hr_shopper_id');
  assert.equal(repaired.providerUidFingerprint,providerUidFingerprint(uid));
  assert.equal(repaired.migrationAuthorityType,null);
  assert.equal(repaired.migrationAuthorityRef,null);
  assert.equal(repaired.identityRepairAuthority,'live_hr_exact_active_principal');
  const second=await p.reconcileSnapshot(snap,{sourceRevision:'fresh-live-revision'});
  assert.equal(second.ok,true);
  assert.equal(second.tenantAdjudicationSuppressed,1);
  assert.equal(second.staleTenantAdjudicationRepairs,0);
  assert.equal(second.providerWrites,0);
  assert.equal(db.get(`tenants/tenant-a/shopperIdentityCrosswalk/${source}`).shopperId,source);
});

test('Gate 8 / durable legacy shoppers converge to the frozen credential rule outside the current HR snapshot',async()=>{
  const auth=new FakeAuth(),db=new FakeFirestore(),p=provider(auth,db);
  const good='shopper_legacy_good',goodUid='legacy-good-uid',bad='shopper_legacy_incomplete',badUid='legacy-bad-uid';
  auth.seed({uid:goodUid,email:'old-good@example.invalid',disabled:false,customClaims:{tenantId:'tenant-a',role:'shopper',authNamespace:'shopper',shopperId:good,projectIds:['older-project']}});
  auth.seed({uid:badUid,email:'old-bad@example.invalid',disabled:false,customClaims:{tenantId:'tenant-a',role:'shopper',authNamespace:'shopper',shopperId:bad,projectIds:['older-project']}});
  db.seed(`tenants/tenant-a/users/${goodUid}`,{active:true,tenantId:'tenant-a',role:'shopper',authNamespace:'shopper',shopperId:good,projectIds:['older-project'],visibleLogin:'old.login',credentialRuleVersion:'legacy'});
  db.seed(`tenants/tenant-a/shoppers/${good}`,{id:good,shopperId:good,tenantId:'tenant-a',projectIds:['older-project'],displayName:'María López'});
  db.seed(`tenants/tenant-a/users/${badUid}`,{active:true,tenantId:'tenant-a',role:'shopper',authNamespace:'shopper',shopperId:bad,projectIds:['older-project']});
  db.seed(`tenants/tenant-a/shoppers/${bad}`,{id:bad,shopperId:bad,tenantId:'tenant-a',projectIds:['older-project'],nombre:'Monónimo'});

  const first=await p.normalizeDurableCredentials({tenantId:'tenant-a'});
  assert.equal(first.ok,true);
  assert.equal(first.activeShopperMemberships,2);
  assert.equal(first.eligibleShopperCount,1);
  assert.equal(first.normalizedShopperCount,1);
  assert.equal(first.identityReviewCount,1);
  assert.equal(first.identityReviewQueue[0].shopperId,bad);
  assert.equal(first.identityReviewQueue[0].reason,'SHOPPER_CREDENTIAL_NAME_INCOMPLETE');
  assert.equal((await auth.getUser(goodUid)).password,'Maria123*');
  assert.match((await auth.getUser(goodUid)).email,/@auth\.cxorbia\.invalid$/);
  assert.equal(db.get(`tenants/tenant-a/users/${goodUid}`).visibleLogin,'maria.lopez');
  assert.equal(db.get(`tenants/tenant-a/users/${goodUid}`).credentialRuleVersion,CREDENTIAL_RULE_VERSION);
  assert.equal(db.get(`tenants/tenant-a/users/${goodUid}`).credentialSweepVersion,DURABLE_CREDENTIAL_SWEEP_VERSION);
  assert.equal(db.get(`tenants/tenant-a/shoppers/${good}`).username,'maria.lopez');
  assert.equal(db.get(`tenants/tenant-a/shoppers/${good}`).credentialSweepVersion,DURABLE_CREDENTIAL_SWEEP_VERSION);
  assert.equal(JSON.stringify([...db._store.values()]).includes('Maria123*'),false);

  const second=await p.normalizeDurableCredentials({tenantId:'tenant-a'});
  assert.equal(second.normalizedShopperCount,0);
  assert.equal(second.idempotentReplays,1);
  assert.equal(second.identityReviewCount,1);
});


test('Gate 8 / first-name.first-surname remains idempotent after profile normalization',()=>{
  const historical={nombre:'Juan Carlos Pérez Gómez',firstName:'Juan Carlos',lastName:'Pérez Gómez'};
  const first=shopperCredentialRule(historical);
  assert.equal(first.ok,true);
  assert.equal(first.login,'juan.perez');
  assert.equal(first.password,'Juan123*');
  assert.equal(first.firstName,'Juan');
  assert.equal(first.lastName,'Pérez');
  const normalized={...historical,firstName:first.firstName,lastName:first.lastName,visibleLogin:first.login,username:first.login,user:first.login,credentialRuleVersion:CREDENTIAL_RULE_VERSION};
  const second=shopperCredentialRule(normalized);
  assert.deepEqual(second,first);
});

test('Gate 6 / optional HR contact fields materialize from the private exact identity runtime without becoming credential requirements',async()=>{
  const auth=new FakeAuth(),db=new FakeFirestore(),p=provider(auth,db),id='shopper_gt_contact',uid=stableShopperUid('tenant-a',id),pp=paths(id);
  const contactSnapshot=snapshot({shopperId:id,shopperCode:'TYA_GT_CONTACT'});
  contactSnapshot.visits[0].shopper='Shopper protegido';
  const identity=new Map([[id,{displayName:'Paula Osorio',country:'GT',phone:'50255551234',whatsapp:'50255551234',email:'paula@example.com'}]]);
  const first=await p.reconcileSnapshot(contactSnapshot,{sourceRevision:'rev-contact-1',identityByShopperId:identity});
  assert.equal(first.ok,true);
  assert.equal((await auth.getUser(uid)).password,'Paula123*');
  const profile=db.get(pp.profile);
  assert.equal(profile.nombre,'Paula Osorio');
  assert.equal(profile.whatsapp,'50255551234');
  assert.equal(profile.phone,'50255551234');
  assert.equal(profile.email,'paula@example.com');
  assert.equal(profile.country,'GT');
  const noEmail=new Map([[id,{displayName:'Paula Osorio',country:'GT',phone:'50255551234',whatsapp:'50255551234',email:''}]]);
  const second=await p.reconcileSnapshot(contactSnapshot,{sourceRevision:'rev-contact-2',identityByShopperId:noEmail});
  assert.equal(second.ok,true);
  assert.equal(db.get(pp.profile).email,'paula@example.com');
});

test('PRE-I4 VRM-033 technical shopper IDs never become durable human names and exact HR identity restores the name',async()=>{
  const auth=new FakeAuth(),db=new FakeFirestore(),p=provider(auth,db),id='shopper_gt_deadbeef01',uid=stableShopperUid('tenant-a',id),pp=paths(id);
  const snap=snapshot({shopperId:id,shopperCode:'TYA_GT_TECH'});
  snap.visits[0].shopper=id;
  snap.visits[0].nombre=id;
  const unresolved=await p.reconcileSnapshot(snap,{sourceRevision:'rev-tech-unresolved'});
  assert.equal(unresolved.ok,true);
  assert.equal(unresolved.status,'committed_with_identity_review');
  assert.equal(unresolved.identityReviewCount,1);
  assert.equal(unresolved.identityReviewQueue[0].sourceShopperId,id);
  assert.equal(unresolved.identityReviewQueue[0].reason,'SHOPPER_CREDENTIAL_NAME_INCOMPLETE');
  assert.equal(db.get(pp.profile),undefined);
  assert.equal(auth.users.size,0);
  const exact=new Map([[id,{displayName:'Julissa Flores',country:'GT'}]]);
  const resolved=await p.reconcileSnapshot(snap,{sourceRevision:'rev-tech-resolved',identityByShopperId:exact});
  assert.equal(resolved.ok,true);
  assert.equal(resolved.identityReviewCount,0);
  assert.equal(db.get(pp.profile).nombre,'Julissa Flores');
  assert.notEqual(db.get(pp.profile).nombre,id);
  assert.equal((await auth.getUser(uid)).customClaims.shopperId,id);
});



test('VRM-044 shopper.create closes Auth membership profile crosswalk and platform_created identity link idempotently',async()=>{
  const auth=new FakeAuth(),db=new FakeFirestore(),p=provider(auth,db),shopperId='platform-manual-1';
  db.seed('tenants/tenant-a/users/admin-1',{active:true,tenantId:'tenant-a',role:'super',authNamespace:'staff',projectIds:['project-a']});
  const command={
    version:'cxorbia-command-adapter-v1',
    commandType:'shopper.create',
    tenantId:'tenant-a',
    projectId:'project-a',
    periodId:'project-a-2026-09',
    entityId:shopperId,
    idempotencyKey:'vrm044-platform-create-1',
    authorization:{providerEnforcementRequired:true,permission:'shopper.create'},
    payload:{profile:{firstName:'Ana',lastName:'Pérez',nombre:'Ana Pérez',pais:'GT',whatsapp:'50255550000',estado:'Activo',createdVia:'manual'}}
  };
  const first=await p.execute('staff-token',command);
  assert.equal(first.ok,true);
  assert.equal(first.providerAck,true);
  assert.equal(first.entityId,shopperId);
  assert.equal(first.platformCreatedAuthority,true);
  assert.ok(first.identityLinkId);
  const uid=stableShopperUid('tenant-a',shopperId);
  const user=await auth.getUser(uid);
  assert.equal(user.customClaims.shopperId,shopperId);
  assert.equal(db.get(`tenants/tenant-a/users/${uid}`).shopperId,shopperId);
  assert.equal(db.get(`tenants/tenant-a/shoppers/${shopperId}`).sourceType,'platform');
  assert.equal(db.get(`tenants/tenant-a/shopperIdentityCrosswalk/${shopperId}`).identityMode,'stable_platform_shopper_id');
  const linkPath=`tenants/tenant-a/shopperIdentityLinks/${first.identityLinkId}`;
  const link=db.get(linkPath);
  assert.equal(link.canonicalShopperId,shopperId);
  assert.equal(link.sourceSystem,'platform');
  assert.equal(link.sourceIdentityKey,`platform:tenant-a:${shopperId}`);
  assert.deepEqual(link.sourceAliases,[`platform:tenant-a:${shopperId}`,shopperId]);
  assert.equal(link.authorityType,'platform_created');
  assert.equal(link.periodIndependent,true);
  assert.equal(link.providerAck,true);
  assert.equal(link.projectScope,'*');
  assert.ok(link.authorityRef);
  const pathsBefore=db.paths(),createdBefore=auth.created;
  const second=await p.execute('staff-token',command);
  assert.equal(second.ok,true);
  assert.equal(second.idempotentReplay,true);
  assert.equal(second.providerWrites,0);
  assert.deepEqual(db.paths(),pathsBefore);
  assert.equal(auth.created,createdBefore);
  assert.equal(db.paths().filter(x=>x.includes('/shopperIdentityLinks/')).length,1);
});


test('PRE-I4 ADMIN-003 tenant-adjudicated canonical name survives fresh exact HR alias reconciliation',async()=>{
  const auth=new FakeAuth(),db=new FakeFirestore(),p=provider(auth,db);
  const alias='shopper_gt_mishael_alias',canonical='shopper_gt_milton_canonical',uid=stableShopperUid('tenant-a',canonical);
  const pp=paths(canonical),aliasCross=paths(alias).cross;
  const visibleLogin='milton.depaz',email=internalEmailTest('tenant-a',visibleLogin);
  auth.seed({uid,email,disabled:false,customClaims:{authNamespace:'shopper',projectIds:['project-a'],role:'shopper',shopperId:canonical,tenantId:'tenant-a'}});
  db.seed(pp.profile,{
    id:canonical,shopperId:canonical,tenantId:'tenant-a',projectIds:['project-a'],sourceType:'hr_external',
    nombre:'Milton De Paz',firstName:'Milton',lastName:'De Paz',visibleLogin,username:visibleLogin,user:visibleLogin,
    credentialRuleVersion:CREDENTIAL_RULE_VERSION,identityAuthority:'tenant_adjudication',
    identityAuthorityRef:'tenant-owner-adjudication',hrSourceRevision:'older-revision'
  });
  db.seed(`${pp.users}/${uid}`,{
    active:true,tenantId:'tenant-a',role:'shopper',authNamespace:'shopper',shopperId:canonical,projectIds:['project-a'],
    providerUidFingerprint:providerUidFingerprint(uid),visibleLogin,credentialRuleVersion:CREDENTIAL_RULE_VERSION
  });
  db.seed(aliasCross,{
    tenantId:'tenant-a',shopperId:canonical,canonicalShopperId:canonical,sourceStableKey:alias,projectIds:['project-a'],
    providerUidFingerprint:providerUidFingerprint(uid),identityMode:'provider_exact_identity_link',sourceType:'hr_external'
  });
  db.seed('tenants/tenant-a/shopperIdentityLinks/tenant-adjudicated-alias',{
    tenantId:'tenant-a',projectId:'project-a',projectScope:'project-a',canonicalShopperId:canonical,
    sourceSystem:'hr_external',sourceIdentity:{legacyId:alias},status:'confirmed',authorityType:'tenant_adjudication',
    authorityRef:'tenant-owner-adjudication',periodIndependent:true
  });
  const snap=snapshot({shopperId:alias,shopperCode:'TYA_GT_MISHAEL_ALIAS'});
  snap.visits[0].shopper='Mishael De Paz';
  const result=await p.reconcileSnapshot(snap,{sourceRevision:'fresh-alias-revision'});
  assert.equal(result.ok,true);
  const profile=db.get(pp.profile);
  assert.equal(profile.nombre,'Milton De Paz');
  assert.equal(profile.firstName,'Milton');
  assert.equal(profile.lastName,'De Paz');
  assert.equal(profile.visibleLogin,'milton.depaz');
  assert.equal(profile.identityAuthority,'tenant_adjudication');
  assert.equal(profile.identityAuthorityRef,'tenant-owner-adjudication');
  assert.equal(profile.hrSourceRevision,'fresh-alias-revision');
  assert.ok(profile.sourceShopperIds.includes(alias));
  assert.ok(profile.exactAliases.includes(alias));
  assert.equal(db.get(aliasCross).shopperId,canonical);
});

test('PRE-I4 ADMIN-003 same-revision stale tenant-adjudicated alias is repaired before idempotent short-circuit',async()=>{
  const auth=new FakeAuth(),db=new FakeFirestore(),p=provider(auth,db);
  const alias='shopper_gt_mishael_alias_same_rev',canonical='shopper_gt_milton_canonical_same_rev',uid=stableShopperUid('tenant-a',canonical);
  const pp=paths(canonical),aliasCross=paths(alias).cross;
  const visibleLogin='milton.depaz',email=internalEmailTest('tenant-a',visibleLogin),revision='same-live-revision';
  auth.seed({uid,email,disabled:false,customClaims:{authNamespace:'shopper',projectIds:['project-a'],role:'shopper',shopperId:canonical,tenantId:'tenant-a'}});
  db.seed(pp.profile,{
    id:canonical,shopperId:canonical,tenantId:'tenant-a',projectIds:['project-a'],sourceType:'hr_external',
    nombre:'Mishael De Paz',firstName:'Milton',lastName:'De Paz',visibleLogin,username:visibleLogin,user:visibleLogin,
    credentialRuleVersion:CREDENTIAL_RULE_VERSION,identityAuthority:'tenant_adjudication',
    identityAuthorityRef:'tenant-owner-adjudication',hrSourceRevision:revision
  });
  db.seed(`${pp.users}/${uid}`,{
    active:true,tenantId:'tenant-a',role:'shopper',authNamespace:'shopper',shopperId:canonical,projectIds:['project-a'],
    providerUidFingerprint:providerUidFingerprint(uid),visibleLogin,credentialRuleVersion:CREDENTIAL_RULE_VERSION
  });
  db.seed(aliasCross,{
    tenantId:'tenant-a',shopperId:canonical,canonicalShopperId:canonical,sourceStableKey:alias,projectIds:['project-a'],
    providerUidFingerprint:providerUidFingerprint(uid),identityMode:'provider_exact_identity_link',sourceType:'hr_external'
  });
  db.seed('tenants/tenant-a/shopperIdentityLinks/tenant-adjudicated-alias-same-rev',{
    tenantId:'tenant-a',projectId:'project-a',projectScope:'project-a',canonicalShopperId:canonical,
    sourceSystem:'hr_external',sourceIdentity:{legacyId:alias},status:'confirmed',authorityType:'tenant_adjudication',
    authorityRef:'tenant-owner-adjudication',periodIndependent:true
  });
  const snap=snapshot({shopperId:alias,shopperCode:'TYA_GT_MISHAEL_ALIAS_SAME_REV'});
  snap.visits[0].shopper='Mishael De Paz';
  const first=await p.reconcileSnapshot(snap,{sourceRevision:revision});
  assert.equal(first.ok,true);
  assert.ok(first.providerWrites>0);
  const repaired=db.get(pp.profile);
  assert.equal(repaired.nombre,'Milton De Paz');
  assert.equal(repaired.firstName,'Milton');
  assert.equal(repaired.lastName,'De Paz');
  assert.equal(repaired.identityAuthority,'tenant_adjudication');
  assert.equal(repaired.identityAuthorityRef,'tenant-owner-adjudication');
  const pathsAfterFirst=db.paths();
  const second=await p.reconcileSnapshot(snap,{sourceRevision:revision});
  assert.equal(second.ok,true);
  assert.equal(second.providerWrites,0);
  assert.ok(second.idempotentReplays>=1);
  assert.deepEqual(db.paths(),pathsAfterFirst);
  assert.equal(db.get(pp.profile).nombre,'Milton De Paz');
});


test('VRM-185 / admin identity adjudication keeps the unique password-proof principal and preserves HR provenance',async()=>{
  const auth=new FakeAuth(),db=new FakeFirestore(),p=provider(auth,db);
  const canonical='shopper_gt_current_exact',alias='s3',canonicalUid='current-generated-uid',keeperUid='legacy-human-uid';
  db.seed('tenants/tenant-a/users/admin-1',{active:true,tenantId:'tenant-a',role:'super',authNamespace:'staff',projectIds:['project-a']});
  auth.seed({uid:canonicalUid,email:internalEmailTest('tenant-a','paula.osorio.abcd'),disabled:false,customClaims:{tenantId:'tenant-a',role:'shopper',authNamespace:'shopper',shopperId:canonical,projectIds:['project-a']}});
  auth.seed({uid:keeperUid,email:internalEmailTest('tenant-a','paula.osorio'),password:'Paula123*',disabled:false,customClaims:{tenantId:'tenant-a',role:'shopper',authNamespace:'shopper',shopperId:alias,projectIds:['project-a']}});
  db.seed(`tenants/tenant-a/users/${canonicalUid}`,{active:true,tenantId:'tenant-a',role:'shopper',authNamespace:'shopper',shopperId:canonical,projectIds:['project-a'],providerUidFingerprint:providerUidFingerprint(canonicalUid),visibleLogin:'paula.osorio.abcd',credentialRuleVersion:CREDENTIAL_RULE_VERSION});
  db.seed(`tenants/tenant-a/users/${keeperUid}`,{active:true,tenantId:'tenant-a',role:'shopper',authNamespace:'shopper',shopperId:alias,projectIds:['project-a'],providerUidFingerprint:providerUidFingerprint(keeperUid),visibleLogin:'paula.osorio',credentialRuleVersion:CREDENTIAL_RULE_VERSION,credentialPasswordProofVersion:'cxorbia-shopper-password-proof-v2'});
  db.seed(`tenants/tenant-a/shoppers/${canonical}`,{id:canonical,shopperId:canonical,tenantId:'tenant-a',projectIds:['project-a'],sourceType:'hr_external',nombre:'Paula Osorio',firstName:'Paula',lastName:'Osorio',pais:'GT',country:'GT',visibleLogin:'paula.osorio.abcd',credentialRuleVersion:CREDENTIAL_RULE_VERSION,hrSourceRevision:'fresh-live'});
  db.seed(`tenants/tenant-a/shoppers/${alias}`,{id:alias,shopperId:alias,tenantId:'tenant-a',projectIds:['project-a'],sourceType:'hr_external',nombre:'Paula Osorio',firstName:'Paula',lastName:'Osorio',pais:'GT',country:'GT',visibleLogin:'paula.osorio',credentialRuleVersion:CREDENTIAL_RULE_VERSION,credentialPasswordProofVersion:'cxorbia-shopper-password-proof-v2',whatsapp:'50255550000',benefits:['legacy-benefit']});
  db.seed(`tenants/tenant-a/shopperIdentityCrosswalk/${canonical}`,{tenantId:'tenant-a',shopperId:canonical,projectIds:['project-a'],providerUidFingerprint:providerUidFingerprint(canonicalUid),sourceStableKey:canonical,identityMode:'stable_hr_shopper_id',sourceType:'hr_external'});
  db.seed(`tenants/tenant-a/shopperIdentityCrosswalk/${alias}`,{tenantId:'tenant-a',shopperId:alias,projectIds:['project-a'],providerUidFingerprint:providerUidFingerprint(keeperUid),sourceStableKey:alias,identityMode:'stable_hr_shopper_id',sourceType:'hr_external'});
  db.seed('tenants/tenant-a/shopperIdentityLinks/historical-admin-resolution',{tenantId:'tenant-a',canonicalShopperId:alias,sourceSystem:'hr',sourceIdentityKey:canonical,projectScope:'project-a',status:'materialized',authorityType:'tenant_adjudication',authorityRef:'frozen-admin-resolution',periodIndependent:true});
  db.seed('tenants/tenant-a/paymentReconciliations/pay-1',{shopperId:alias,status:'pending'});
  db.seed('tenants/tenant-a/reviewQueue/review-1',{shopperId:alias,candidateShopperIds:[alias]});
  db.seed('tenants/tenant-a/projects/project-a/certifications/cert-1',{shopperId:alias,status:'certificada'});
  db.seed('tenants/tenant-a/projects/project-a/liquidations/liq-1',{shopperId:alias,status:'pending'});
  db.seed('tenants/tenant-a/projects/project-a/postulations/post-1',{shopperId:alias,status:'active'});
  db.seed('tenants/tenant-a/projects/project-a/reservations/res-1',{shopperId:alias,status:'active'});
  db.seed('tenants/tenant-a/projects/project-a/visits/visit-1',{shopperId:alias,hrManaged:{shopperId:alias},status:'submitted'});
  const command={version:'cxorbia-command-adapter-v1',commandType:'shopper.identity.adjudicate',tenantId:'tenant-a',projectId:'project-a',periodId:'project-a-2026-10',entityId:canonical,idempotencyKey:'vrm185-admin-consolidation-1',authorization:{providerEnforcementRequired:true,permission:'shopper.identity.adjudicate'},payload:{canonicalShopperId:canonical,aliasShopperIds:[alias],humanConfirmed:true,reason:'admin_exact_identity_human_adjudication'}};
  const first=await p.execute('staff-token',command);
  assert.equal(first.ok,true,'VRM185_FIRST_RESULT='+JSON.stringify(first));assert.equal(first.providerAck,true);assert.equal(first.identityAdjudicated,true);assert.equal(first.identityConsolidated,true);assert.equal(first.retiredPrincipalCount,1);
  const keeper=await auth.getUser(keeperUid),retired=await auth.getUser(canonicalUid);
  assert.equal(keeper.disabled,false);assert.equal(keeper.customClaims.shopperId,canonical);assert.equal(retired.disabled,true);assert.equal(keeper.password,'Paula123*');
  assert.equal(db.get(`tenants/tenant-a/users/${keeperUid}`).shopperId,canonical);assert.equal(db.get(`tenants/tenant-a/users/${keeperUid}`).active,true);
  assert.equal(db.get(`tenants/tenant-a/users/${canonicalUid}`).active,false);assert.equal(db.get(`tenants/tenant-a/users/${canonicalUid}`).status,'superseded');
  const profile=db.get(`tenants/tenant-a/shoppers/${canonical}`);
  assert.equal(profile.shopperId,canonical);assert.equal(profile.visibleLogin,'paula.osorio');assert.equal(profile.country,'GT');assert.equal(profile.whatsapp,'50255550000');assert.ok(profile.exactAliases.includes(alias));
  assert.equal(db.get(`tenants/tenant-a/shoppers/${alias}`).identityState,'superseded_exact_alias');
  assert.equal(db.get(`tenants/tenant-a/shopperIdentityCrosswalk/${canonical}`).providerUidFingerprint,providerUidFingerprint(keeperUid));
  assert.equal(db.get(`tenants/tenant-a/shopperIdentityCrosswalk/${alias}`).shopperId,canonical);
  assert.equal(db.get('tenants/tenant-a/shopperIdentityLinks/historical-admin-resolution').status,'superseded');
  assert.equal(db.get(`tenants/tenant-a/shopperIdentityLinks/${first.identityLinkId}`).canonicalShopperId,canonical);
  assert.equal(db.get('tenants/tenant-a/paymentReconciliations/pay-1').shopperId,canonical);
  assert.equal(db.get('tenants/tenant-a/reviewQueue/review-1').shopperId,canonical);
  assert.deepEqual(db.get('tenants/tenant-a/reviewQueue/review-1').candidateShopperIds,[canonical]);
  assert.equal(db.get('tenants/tenant-a/projects/project-a/certifications/cert-1').shopperId,canonical);
  assert.equal(db.get('tenants/tenant-a/projects/project-a/liquidations/liq-1').shopperId,canonical);
  assert.equal(db.get('tenants/tenant-a/projects/project-a/postulations/post-1').shopperId,canonical);
  assert.equal(db.get('tenants/tenant-a/projects/project-a/reservations/res-1').shopperId,canonical);
  assert.equal(db.get('tenants/tenant-a/projects/project-a/visits/visit-1').shopperId,canonical);
  assert.equal(db.get('tenants/tenant-a/projects/project-a/visits/visit-1').hrManaged.shopperId,alias);
  const second=await p.execute('staff-token',command);
  assert.equal(second.ok,true);assert.equal(second.idempotentReplay,true);assert.equal(second.providerWrites,0);assert.equal((await auth.getUser(keeperUid)).disabled,false);assert.equal((await auth.getUser(canonicalUid)).disabled,true);
});

test('VRM-185 / admin identity adjudication fails closed when multiple principals have password proof',async()=>{
  const auth=new FakeAuth(),db=new FakeFirestore(),p=provider(auth,db),canonical='shopper_gt_dual_proof',alias='legacy-dual-proof';
  db.seed('tenants/tenant-a/users/admin-1',{active:true,tenantId:'tenant-a',role:'super',authNamespace:'staff',projectIds:['project-a']});
  for(const [id,uid,login] of [[canonical,'dual-current','dual.current'],[alias,'dual-legacy','dual.legacy']]){
    auth.seed({uid,email:internalEmailTest('tenant-a',login),disabled:false,customClaims:{tenantId:'tenant-a',role:'shopper',authNamespace:'shopper',shopperId:id,projectIds:['project-a']}});
    db.seed(`tenants/tenant-a/users/${uid}`,{active:true,tenantId:'tenant-a',role:'shopper',authNamespace:'shopper',shopperId:id,projectIds:['project-a'],providerUidFingerprint:providerUidFingerprint(uid),visibleLogin:login,credentialRuleVersion:CREDENTIAL_RULE_VERSION,credentialPasswordProofVersion:'cxorbia-shopper-password-proof-v2'});
    db.seed(`tenants/tenant-a/shoppers/${id}`,{id,shopperId:id,tenantId:'tenant-a',projectIds:['project-a'],sourceType:'hr_external',nombre:'Persona Exacta',firstName:'Persona',lastName:'Exacta',visibleLogin:login,credentialPasswordProofVersion:'cxorbia-shopper-password-proof-v2'});
    db.seed(`tenants/tenant-a/shopperIdentityCrosswalk/${id}`,{tenantId:'tenant-a',shopperId:id,projectIds:['project-a'],providerUidFingerprint:providerUidFingerprint(uid),sourceStableKey:id,identityMode:'stable_hr_shopper_id',sourceType:'hr_external'});
  }
  const command={version:'cxorbia-command-adapter-v1',commandType:'shopper.identity.adjudicate',tenantId:'tenant-a',projectId:'project-a',periodId:'project-a-2026-10',entityId:canonical,idempotencyKey:'vrm185-dual-proof',authorization:{providerEnforcementRequired:true,permission:'shopper.identity.adjudicate'},payload:{canonicalShopperId:canonical,aliasShopperIds:[alias],humanConfirmed:true}};
  const result=await p.execute('staff-token',command);
  assert.equal(result.ok,false);assert.equal(result.providerWrites,0);assert.equal(result.code,'SHOPPER_IDENTITY_MULTIPLE_PASSWORD_PROOF_PRINCIPALS');
  assert.equal((await auth.getUser('dual-current')).disabled,false);assert.equal((await auth.getUser('dual-legacy')).disabled,false);
});
