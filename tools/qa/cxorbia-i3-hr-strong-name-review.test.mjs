import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {createShopperCommandProvider} from '../../backend/runtime/cxorbia-shopper-command-provider-v1.mjs';

// Isolated in-memory test; never imports Firebase credentials or accesses HR.
const copy=v=>v===undefined?undefined:structuredClone(v);
class Ref{
  constructor(db,path){this.db=db;this.path=path;this.id=path.split('/').at(-1);}
  collection(name){return new Coll(this.db,`${this.path}/${name}`);}
  async get(){return {exists:this.db.rows.has(this.path),id:this.id,data:()=>copy(this.db.rows.get(this.path))};}
  async set(value,opts={}){this.db.rows.set(this.path,opts.merge?{...(this.db.rows.get(this.path)||{}),...copy(value)}:copy(value));}
}
class Coll{
  constructor(db,path){this.db=db;this.path=path;}
  doc(id){return new Ref(this.db,`${this.path}/${id}`);}
  async get(){const docs=[...this.db.rows].filter(([p])=>p.startsWith(this.path+'/')&&p.split('/').length===this.path.split('/').length+1)
    .map(([p,value])=>({id:p.split('/').at(-1),exists:true,data:()=>copy(value)}));return {docs,size:docs.length};}
  where(field,op,value){assert.equal(op,'==');return {limit:()=>({get:async()=>{
    const snap=await this.get(),docs=snap.docs.filter(d=>d.data()?.[field]===value);return {docs,size:docs.length};
  }})};}
}
class Db{
  constructor(){this.rows=new Map();}
  collection(n){return new Coll(this,n);}
  seed(path,value){this.rows.set(path,copy(value));}
  get(path){return copy(this.rows.get(path));}
  async runTransaction(callback){return callback({get:r=>r.get(),set:(r,v,o)=>r.set(v,o)});}
}
class Auth{
  constructor(){this.rows=new Map();this.created=0;}
  absent(){const e=new Error('not found');e.code='auth/user-not-found';throw e;}
  async listUsers(){return {users:[...this.rows.values()].map(copy)};}
  async getUser(uid){return this.rows.has(uid)?copy(this.rows.get(uid)):this.absent();}
  async getUserByEmail(email){return copy([...this.rows.values()].find(r=>r.email===email))||this.absent();}
  async createUser(row){const saved={...copy(row),customClaims:{}};this.rows.set(row.uid,saved);this.created++;return copy(saved);}
  async setCustomUserClaims(uid,claims){this.rows.get(uid).customClaims=copy(claims);}
  async updateUser(uid,patch){Object.assign(this.rows.get(uid),copy(patch));return this.getUser(uid);}
}
const make=()=>{const auth=new Auth(),db=new Db();return {auth,db,provider:createShopperCommandProvider({auth,db,policy:{
  schemaVersion:'cxorbia.shopper-command-provider-policy.v1',enabled:true,allowedTenantIds:['t'],allowedProjectIds:[],hrWrites:false,externalWrites:false,fuzzyMatching:false
}})};};
const row=(id,name,phone,country='GT')=>({id:`visit-${id}`,shopperId:id,shopperCode:id,pais:country,country,shopper:name,whatsapp:phone,sourceSafe:true,piiProtected:true});
const snapshot=(...visits)=>({sourceSafe:true,imported:false,firestoreWrites:0,tenantId:'t',projectId:'p',visits});

test('three-token accent/case normalized same-country name with divergent phones requires review, no auto-merge/duplicate',async()=>{
  const {auth,db,provider}=make(),a='TYA_GT_AAA111',b='TYA_GT_BBB222';
  const hr=snapshot(row(a,'Ana María López','5555 1000'),row(b,'ANA MARIA  LOPEZ','5555 2000'));
  const before=copy(hr),out=await provider.reconcileSnapshot(hr,{sourceRevision:'v1'});
  assert.equal(out.identityReviewCount,1);assert.equal(out.identityHeldShopperCount,2);
  assert.equal(auth.created,0);assert.equal(db.get(`tenants/t/shoppers/${a}`),undefined);
  assert.match(out.identityReviewQueue[0].reason,/STRONG_NAME_CONTACT_REVIEW_REQUIRED/);
  assert.deepEqual(hr,before);
  const replay=await provider.reconcileSnapshot(hr,{sourceRevision:'v1'});
  assert.equal(replay.identityReviewWrites,0);assert.equal(replay.identityHeldShopperCount,2);
});

test('three-token name with one missing phone is held for review, not rejected nor merged',async()=>{
  const {auth,provider}=make();
  const out=await provider.reconcileSnapshot(snapshot(row('GT_C','Lucía Isabel Pérez','5555 1000'),row('GT_D','LUCIA ISABEL PEREZ','')),{sourceRevision:'v1'});
  assert.equal(out.identityReviewCount,1);assert.equal(out.identityHeldShopperCount,2);assert.equal(auth.created,0);
});

test('human resolved_distinct suppresses strong-name review on replay and preserves independent profiles',async()=>{
  const {auth,db,provider}=make(),a='GT_F',b='GT_G',hr=snapshot(row(a,'Ana María López','5555 1000'),row(b,'ANA MARIA LOPEZ','5555 2000'));
  const first=await provider.reconcileSnapshot(hr,{sourceRevision:'v1'}),ids=[a,b].sort();
  const resolutionId='srr_'+crypto.createHash('sha256').update(['t','p',...ids].join('\0')).digest('hex').slice(0,32);
  db.seed(`tenants/t/shopperIdentityReviewResolutions/${resolutionId}`,{
    status:'resolved_distinct',shopperIds:ids,evidenceFingerprint:first.identityReviewQueue[0].evidenceFingerprint,identityRemap:false
  });
  const second=await provider.reconcileSnapshot(hr,{sourceRevision:'v2'});
  assert.equal(second.identityReviewCount,0);assert.equal(second.identityHeldShopperCount,0);
  assert.equal(second.authCreated,2);assert.equal(auth.created,2);
  assert.ok(db.get(`tenants/t/shoppers/${a}`));assert.ok(db.get(`tenants/t/shoppers/${b}`));
});

test('audited exact identity link with divergent phones keeps one canonical and never triggers name-only review',async()=>{
  const {auth,db,provider}=make(),a='TYA_GT_AAA111',b='TYA_GT_BBB222';
  db.seed('tenants/t/shopperIdentityLinks/known',{tenantId:'t',canonicalShopperId:a,sourceSystem:'hr',
    sourceIdentity:{legacyId:b},projectScope:'p',status:'active',authorityType:'provider_exact',authorityRef:'approved'});
  const out=await provider.reconcileSnapshot(snapshot(row(a,'Ana María López','5555 1000'),row(b,'ANA MARIA LOPEZ','5555 2000')),{sourceRevision:'linked'});
  assert.equal(out.identityReviewCount,0);assert.equal(out.identityHeldShopperCount,0);assert.equal(auth.created,1);
  assert.equal(db.get(`tenants/t/shopperIdentityCrosswalk/${b}`).shopperId,a);
});
