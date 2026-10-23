#!/usr/bin/env node
'use strict';
// Isolated doubles only: real command runtime and historical providers, no network or SDK initialization.
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(process.argv[2]||path.join(__dirname,'../..'));
const copy=value=>value===undefined?undefined:structuredClone(value);

test('G05 24 concurrent visits complete with five transaction attempts and one receipt per entity',async()=>{
  const f=await setup();f.current.snapshot.shoppers=[];
  f.current.snapshot.visits=Array.from({length:24},(_,i)=>({id:'visit-'+i,visitId:'visit-'+i,hrRowId:'HR!'+(i+2),sourceTab:'HR',sourceRow:i+2,tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',estado:'disponible',status:'disponible',canonicalFacets:{available:true,assigned:false}}));
  const result=await f.run('g05-24-visits-retry-limit-0001');
  assert.equal(result.ok,true);assert.equal(result.firestoreWrites,24);assert.equal(result.unresolvedEffects,0);assert.equal(result.unverifiedEffects,0);
  const visits=f.effects().flatMap(e=>e.operations).filter(o=>o.entity.startsWith('tenants/tenant-a/projects/project-a/visits/'));
  assert.equal(visits.length,24);assert.equal(new Set(visits.map(o=>o.entity)).size,24);
  assert.equal([...f.db.store].filter(([p])=>p.startsWith('tenants/tenant-a/projects/project-a/visits/')).length,24);
});
test('G05 changed verified principal is rejected before acquiring any lease',async()=>{
  let calls=0;const f=await setup({verifyPrincipal:async()=>({uid:calls++?'new-uid':'original-uid',role:'admin',namespace:'staff'})});
  assert.equal((await f.run('g05-changing-principal-0001')).code,'HR_RECONCILIATION_PRINCIPAL_CHANGED');assert.equal(f.db.log.length,0);assert.equal(f.auth.log.length,0);
});
test('G05 pending command key is offered only to its verified actor and same source',async()=>{
  const gate=deferred(),entered=deferred(),held=()=>({reconcileSnapshot:async()=>{entered.resolve();await gate.promise;return {ok:true,status:'committed',providerAck:true};}});
  let actorUid='admin-1';const f=await setup({verifyPrincipal:async()=>({uid:actorUid,role:'admin',namespace:'staff'}),shopperProviderFactory:held,operationalProviderFactory:held});
  const work=f.run('g05-resume-key-owner-0001');await entered.promise;
  assert.equal((await f.run('g05-resume-new-client-0002')).resumeIdempotencyKey,'g05-resume-key-owner-0001');
  actorUid='admin-2';assert.equal((await f.run('g05-resume-other-user-0003')).resumeIdempotencyKey,null);
  actorUid='admin-1';assert.equal((await f.run('g05-resume-new-source-0004',{expectedVersion:'2'.repeat(64),entityId:'2'.repeat(64)})).resumeIdempotencyKey,null);
  gate.resolve();assert.equal((await work).ok,true);
});
async function dispatch(command,{method='POST',authorization='Bearer fixture',writer,configure=()=>{}}={}){
  const {maybeHandleCxorbiaCommandRuntimeRequest}=await import(pathToFileURL(path.join(root,'backend/runtime/hr-live-service/cxorbia-command-runtime-v1.mjs')));
  const req={method,headers:{authorization},async *[Symbol.asyncIterator](){yield JSON.stringify(command);}};
  const res={statusCode:0,setHeader(){},end(value){this.body=value?JSON.parse(value):null;}};
  await maybeHandleCxorbiaCommandRuntimeRequest(req,res,new URL('https://fixture.invalid/v1/cxorbia/commands'),{hrSnapshotReconcile:writer,configure});
  return res;
}
test('G05 existing POST route dispatches fresh writer without requiring bootstrap cache',async()=>{
  const f=await setup();let configured=0;
  const res=await dispatch(f.command('g05-post-no-cache-0001'),{writer:f.reconcile,configure:()=>{configured++;throw Error('NO_CACHE');}});
  assert.equal(res.statusCode,200);assert.equal(res.body.ok,true);assert.equal(configured,0);assert.equal(res.body.authWrites,2);
});
for(const [name,options] of [['non-POST',{method:'GET'}],['missing Bearer',{authorization:''}],['unconfigured writer',{}]])test('G05 command route blocks '+name+' before writes',async()=>{
  const f=await setup();const res=await dispatch(f.command('g05-post-invalid-0001'),{...options,writer:name==='unconfigured writer'?undefined:f.reconcile});
  assert.equal(res.body.ok,false);assert.equal(f.db.log.length,0);assert.equal(f.auth.log.length,0);
});
test('G05 ordinary command still uses the existing provider configuration path',async()=>{
  let configured=0,calledWriter=0;
  const res=await dispatch({commandType:'project.update'},{writer:()=>{calledWriter++;},configure:()=>{configured++;throw Error('EXISTING_CONFIGURATION_GATE');}});
  assert.equal(configured,1);assert.equal(calledWriter,0);assert.equal(res.body.code,'EXISTING_CONFIGURATION_GATE');
});

class MemSnapshot{
  constructor(ref,value){this.ref=ref;this.id=ref.id;this.exists=value!==undefined;this.value=copy(value);}
  data(){return copy(this.value);}
}
class MemQuery{
  constructor(db,path,filters=[],cap=Infinity){Object.assign(this,{db,path,filters,cap});}
  where(field,op,value){assert.equal(op,'==');return new MemQuery(this.db,this.path,[...this.filters,[field,value]],this.cap);}
  limit(cap){return new MemQuery(this.db,this.path,this.filters,cap);}
  async get(){
    const prefix=this.path+'/',depth=this.path.split('/').length+1;
    const docs=[...this.db.store].filter(([path,value])=>path.startsWith(prefix)&&path.split('/').length===depth&&this.filters.every(([k,v])=>value[k]===v)).slice(0,this.cap).map(([path,value])=>new MemSnapshot(new MemDoc(this.db,path),value));
    return {docs,size:docs.length,empty:!docs.length};
  }
}
class MemCollection extends MemQuery{doc(id){if(!id)throw Error('explicit id required');return new MemDoc(this.db,this.path+'/'+id);}}
class MemDoc{
  constructor(db,path){Object.assign(this,{db,path,id:path.split('/').at(-1)});}
  collection(name){return new MemCollection(this.db,this.path+'/'+name);}
  async get(){return new MemSnapshot(this,this.db.store.get(this.path));}
  async set(value,options){return this.db.direct([{type:'set',ref:this,value,options}]);}
}
class MemFirestore{
  constructor(){this.store=new Map();this.versions=new Map();this.log=[];this.callbackCount=0;this.beforeCommit=null;this.afterCommit=null;this.maxAttempts=5;}
  collection(name){return new MemCollection(this,name);}
  seed(path,value){this.store.set(path,copy(value));this.versions.set(path,(this.versions.get(path)||0)+1);}
  read(path){return copy(this.store.get(path));}
  apply(ops){
    const pending=new Map();
    for(const op of ops){
      const path=op.ref.path,prior=pending.has(path)?pending.get(path):this.store.get(path);
      if(op.type==='create'&&prior!==undefined)throw Error('ALREADY_EXISTS');
      const next=op.options?.merge?{...copy(prior||{}),...copy(op.value)}:copy(op.value);pending.set(path,next);
    }
    for(const [path,value]of pending){this.store.set(path,value);this.versions.set(path,(this.versions.get(path)||0)+1);}
    this.log.push(...ops.map(op=>({type:op.type,path:op.ref.path,value:copy(op.value)})));
  }
  async direct(ops){if(this.beforeCommit)await this.beforeCommit({db:this,ops,reads:new Map(),attempt:1});this.apply(ops);if(this.afterCommit)await this.afterCommit({db:this,ops});return {writeTime:'synthetic'};}
  async runTransaction(fn){
    for(let attempt=1;attempt<=this.maxAttempts;attempt++){
      const values=new Map([...this.store].map(([k,v])=>[k,copy(v)])),versions=new Map(this.versions),reads=new Map(),ops=[];
      const tx={get:async ref=>{if(ops.length)throw Error('READ_AFTER_WRITE');reads.set(ref.path,versions.get(ref.path)||0);return new MemSnapshot(ref,values.get(ref.path));}};
      for(const type of ['set','create'])tx[type]=(ref,value,options)=>{ops.push({type,ref,value:copy(value),options});return tx;};
      this.callbackCount++;const result=await fn(tx);
      if(this.beforeCommit)await this.beforeCommit({db:this,ops,reads,attempt});
      if([...reads].some(([p,v])=>(this.versions.get(p)||0)!==v))continue;
      this.apply(ops);
      if(this.afterCommit)await this.afterCommit({db:this,ops});
      return result;
    }
    throw Error('TRANSACTION_RETRY_LIMIT');
  }
}
class MemAuth{
  constructor(){this.users=new Map();this.log=[];this.before=null;this.after=null;}
  missing(){return Object.assign(Error('not found'),{code:'auth/user-not-found'});}
  seed(user){this.users.set(user.uid,copy({...user,customClaims:user.customClaims||{}}));}
  async getUser(uid){const user=this.users.get(uid);if(!user)throw this.missing();return copy(user);}
  async getUserByEmail(email){const u=[...this.users.values()].find(x=>x.email===email);if(!u)throw this.missing();return copy(u);}
  async listUsers(max=1000,token){const start=Number(token||0),values=[...this.users.values()];return {users:copy(values.slice(start,start+max)),pageToken:start+max<values.length?String(start+max):undefined};}
  async verifyIdToken(){return {uid:'admin-1',tenantId:'tenant-a',role:'admin',authNamespace:'staff',projectIds:['project-a']};}
  async write(method,uid,apply){if(this.before)await this.before({method,uid});const result=apply();this.log.push({method,uid});if(this.after)await this.after({method,uid});return copy(result);}
  async createUser(record){return this.write('createUser',record.uid,()=>{if(this.users.has(record.uid))throw Object.assign(Error('exists'),{code:'auth/uid-already-exists'});const user={...copy(record),customClaims:{}};this.users.set(record.uid,user);return user;});}
  async updateUser(uid,patch){return this.write('updateUser',uid,()=>{const user=this.users.get(uid);if(!user)throw this.missing();Object.assign(user,copy(patch));return user;});}
  async setCustomUserClaims(uid,claims){return this.write('setCustomUserClaims',uid,()=>{const user=this.users.get(uid);if(!user)throw this.missing();user.customClaims=copy(claims);});}
}
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
async function setup(options={}){
  const {createHrSnapshotReconciler}=await import(pathToFileURL(path.join(root,'backend/runtime/hr-live-service/cxorbia-command-runtime-v1.mjs')));
  const {stableShopperUid}=await import(pathToFileURL(path.join(root,'backend/runtime/cxorbia-shopper-command-provider-v1.mjs')));
  const db=new MemFirestore(),auth=new MemAuth(),revision='1'.repeat(64);
  const projectPath='tenants/tenant-a/projects/project-a';
  db.seed(projectPath,{tenantId:'tenant-a',projectId:'project-a',operationalSource:{mode:'external',readPolicy:'external_live',providerBindingId:'binding-a',mappingRef:'map-a'}});
  let calls=0,reads=0,clock=1000000;
  let current={revision,snapshot:{sourceSafe:true,imported:false,firestoreWrites:0,tenantId:'tenant-a',projectId:'project-a',projectConfig:{projectId:'project-a'},currentPeriodId:'period-a',shoppers:[{id:'shopper_gt_abc123',nombre:'Persona Prueba',country:'GT',sourceSafe:true,piiProtected:true}],visits:[]}};
  const shopperPolicy=()=>({schemaVersion:'cxorbia.shopper-command-provider-policy.v1',enabled:true,allowedTenantIds:['tenant-a'],allowedProjectIds:['project-a'],hrWrites:false,externalWrites:false,fuzzyMatching:false});
  const operationalPolicy=()=>({schemaVersion:'cxorbia.operational.provider-policy.v1',enabled:true,allowedTenantIds:['tenant-a'],allowedProjectIds:['project-a'],conflictPolicy:'review_no_silent_overwrite',hrWrites:false,makeCalls:false,geminiCalls:false,storageWrites:false,paymentWrites:false});
  const verifyPrincipal=async()=>{calls++;return {uid:'admin-1',role:'admin',namespace:'staff'};};
  const reconcile=createHrSnapshotReconciler({verifyPrincipal,readSnapshot:async()=>{reads++;return current;},ensureAdmin:()=>({auth,db}),shopperPolicy,operationalPolicy,now:()=>clock,...options});
  const command=(key,patch={})=>({version:'cxorbia-command-adapter-v1',commandType:'hr.snapshot.reconcile',entityType:'hrSnapshot',entityId:current.revision,expectedVersion:current.revision,tenantId:'tenant-a',projectId:'project-a',requirePeriod:false,periodId:null,payload:{},idempotencyKey:key,...patch});
  const run=(key,patch={})=>reconcile({req:{headers:{}},command:command(key,patch)});
  const effects=()=>[...db.store].filter(([path])=>path.includes('/effects/')).map(([path,row])=>({path,...copy(row)}));
  return {db,auth,projectPath,run,effects,command,reconcile,uid:stableShopperUid('tenant-a','shopper_gt_abc123'),get current(){return current;},set current(value){current=value;},advance:ms=>{clock+=ms;},principalCalls:()=>calls,readCalls:()=>reads};
}
test('G05 private durable HR source enables a sanitized public snapshot without leaking provider configuration',async()=>{
  const f=await setup();f.current.snapshot.projectConfig={projectId:'project-a'};
  const result=await f.run('g05-private-source-config-0001');
  assert.equal(result.ok,true);assert.equal(result.readbackVerified,true);
  assert.equal(f.current.snapshot.projectConfig.operationalSource,undefined);
  assert.equal(JSON.stringify(result).includes('binding-a'),false);
});
test('G05 public snapshot cannot supply private authority when durable project config is absent',async()=>{
  const f=await setup();f.db.store.delete(f.projectPath);
  f.current.snapshot.projectConfig={operationalSource:{mode:'external',readPolicy:'external_live',providerBindingId:'untrusted-public-binding',mappingRef:'untrusted-public-map'}};
  const result=await f.run('g05-private-source-missing-0001');
  assert.equal(result.code,'HR_RECONCILIATION_LIVE_SOURCE_CONFIG_REQUIRED');
  assert.equal(f.db.log.length,0);assert.equal(f.auth.log.length,0);
});
test('G05 initial shopper records Auth, claims and Firestore by entity without credential persistence',async()=>{
  const f=await setup(),result=await f.run('g05-initial-test-0001');
  assert.equal(result.ok,true);assert.equal(result.authWrites,2);assert.equal(result.firestoreWrites,3);assert.equal(result.providerWrites,5);assert.equal(result.readbackVerified,true);
  assert.equal(result.receiptBinding.actorUid,'admin-1');assert.equal(result.credentialAuthenticationPending,true);
  assert.equal(result.credentialReadback,'PROVIDER_ACK_ONLY_AUTHENTICATION_GATE_PENDING');
  assert.equal(f.effects().length,3);assert.ok(f.effects().every(e=>e.readbackVerified===true));
  const password=(await f.auth.getUser(f.uid)).password,stored=JSON.stringify([...f.db.store]);
  assert.ok(password);assert.equal(stored.includes(password),false);assert.equal(stored.includes('"password":'),false);
});
test('G05 claims-only effect counts even when historical provider reports an idempotent zero',async()=>{
  const f=await setup();assert.equal((await f.run('g05-claims-base-0001')).ok,true);
  const before=f.auth.log.length,user=await f.auth.getUser(f.uid);user.customClaims.tenantId='';f.auth.seed(user);
  const result=await f.run('g05-claims-only-0002');
  assert.equal(result.ok,true);assert.equal(result.authWrites,1);assert.equal(result.firestoreWrites,0);
  assert.deepEqual(f.auth.log.slice(before).map(x=>x.method),['setCustomUserClaims']);assert.equal(result.stages.shoppers.idempotentReplays,1);assert.equal(result.stages.shoppers.providerWrites,0);
});
test('G05 direct identity review set is audited; new command over unchanged review is a no-op',async()=>{
  const f=await setup();delete f.current.snapshot.shoppers[0].nombre;
  const result=await f.run('g05-review-write-0001');
  assert.equal(result.ok,true);assert.equal(result.authWrites,0);assert.equal(result.firestoreWrites,1);assert.equal(result.identityReviewRequired,true);
  assert.ok(f.effects().some(e=>e.operations.some(o=>o.entity.includes('/shopperIdentityReviews/'))));
  const again=await f.run('g05-review-replay-0002');assert.equal(again.ok,true);assert.equal(again.providerWrites,0);
});
test('G05 Firestore callback retry records one committed effect and preserves concurrent fields',async()=>{
  const f=await setup();await f.run('g05-tx-retry-base-0001');const target='tenants/tenant-a/shoppers/shopper_gt_abc123';
  f.current={...f.current,revision:'2'.repeat(64)};
  let injected=0;f.db.beforeCommit=({ops})=>{if(!injected&&ops.some(x=>x.ref.path===target)){injected++;f.db.seed(target,{...f.db.read(target),nonHrOwnedNote:'concurrent-kept'});}};
  const baseline=f.db.log.length,result=await f.run('g05-tx-retry-new-0002');
  assert.equal(result.ok,true);assert.equal(injected,1);assert.equal(result.firestoreWrites,3);
  assert.equal(f.db.read(target).nonHrOwnedNote,'concurrent-kept');
  assert.equal(f.effects().filter(e=>e.path.startsWith(result.receiptPath+'/')&&e.system==='firestore').length,1);
  assert.equal(f.db.log.slice(baseline).filter(x=>x.path===target).length,1);
});
test('G05 lost Auth ACK stays uncertain and retry cannot create a second principal',async()=>{
  const f=await setup();let once=true;
  f.auth.after=({method})=>{if(once&&method==='createUser'){once=false;throw Object.assign(Error('lost SDK ack'),{code:'auth/internal-error'});}};
  const result=await f.run('g05-auth-ack-lost-0001');
  assert.equal(result.ok,false);assert.equal(result.status,'partial');assert.equal(result.unresolvedEffects,1);assert.equal(result.providerWrites,null);assert.equal(f.auth.users.size,1);
  const before=f.auth.log.length,again=await f.run('g05-auth-ack-lost-0001');
  assert.equal(again.code,'HR_RECONCILIATION_UNCERTAIN_EFFECTS_REQUIRE_READBACK');assert.equal(f.auth.log.length,before);assert.equal(f.auth.users.size,1);
});
test('G05 lost Firestore ACK retains atomically committed entity effects and pending readback',async()=>{
  const f=await setup();let once=true;
  f.db.afterCommit=({ops})=>{if(once&&ops.some(o=>o.ref.path==='tenants/tenant-a/shoppers/shopper_gt_abc123')){once=false;throw Object.assign(Error('lost commit ack'),{code:'DEADLINE_EXCEEDED'});}};
  const result=await f.run('g05-fs-ack-lost-0001');
  assert.equal(result.ok,false);assert.equal(result.unverifiedEffects,1);assert.equal(result.firestoreWrites,3);assert.equal(result.unresolvedEffects,0);
  assert.ok(f.db.read('tenants/tenant-a/shoppers/shopper_gt_abc123'));
  assert.equal((await f.run('g05-fs-ack-lost-0001')).code,'HR_RECONCILIATION_UNCERTAIN_EFFECTS_REQUIRE_READBACK');
});
test('G05 retries only unfinished stage without repeating completed shopper effects',async()=>{
  let fail=true;const f=await setup({operationalProviderFactory:()=>({reconcileSnapshot:async()=>{if(fail)throw Error('SYNTHETIC_STAGE_REJECTED');return {ok:true,providerAck:true,status:'committed',providerWrites:0};}})});
  const first=await f.run('g05-stage-retry-0001');assert.equal(first.ok,false);assert.equal(first.unresolvedEffects,0);assert.equal(first.unverifiedEffects,0);
  const before=f.auth.log.length,business=f.db.log.filter(x=>!x.path.includes('/commandReceipts/')).length;fail=false;
  const second=await f.run('g05-stage-retry-0001');assert.equal(second.ok,true);assert.equal(f.auth.log.length,before);assert.equal(f.db.log.filter(x=>!x.path.includes('/commandReceipts/')).length,business);
  assert.deepEqual(second.applicationWritesThisAttempt,{auth:0,firestore:0});
});
test('G05 idempotency binds revision and actor; confirmed replay only reauthorizes and reads receipt',async()=>{
  const f=await setup(),first=await f.run('g05-digest-reuse-0001');assert.equal(first.ok,true);const before=f.db.log.length,reads=f.readCalls(),verified=f.principalCalls();
  assert.equal((await f.run('g05-digest-reuse-0001',{entityId:'2'.repeat(64),expectedVersion:'2'.repeat(64)})).code,'HR_RECONCILIATION_IDEMPOTENCY_CONFLICT');
  const replay=await f.run('g05-digest-reuse-0001');assert.equal(replay.idempotentReplay,true);assert.equal(f.db.log.length,before);assert.equal(f.readCalls(),reads);assert.ok(f.principalCalls()>verified);
  assert.deepEqual(replay.applicationWritesThisAttempt,{auth:0,firestore:0});assert.equal(replay.providerWritesScope,'cumulative_command_effects');
});
test('G05 writer waits for late visit worker after an earlier worker fails',async()=>{
  const f=await setup();f.current.snapshot.shoppers=[];
  const row=(id,n)=>({id,visitId:id,hrRowId:'HR!'+n,sourceTab:'HR',sourceRow:n,tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',estado:'disponible',status:'disponible',canonicalFacets:{available:true,assigned:false}});
  f.current.snapshot.visits=[row('a',2),row('b',3)];
  f.db.seed('tenants/tenant-a/projects/project-a/visits/HR!2',{tenantId:'wrong-tenant',projectId:'project-a',hrRowId:'HR!2'});
  const late=deferred(),release=deferred(),failed=deferred();
  f.db.beforeCommit=async({ops})=>{if(ops.some(x=>x.ref.path==='tenants/tenant-a/projects/project-a/visits/HR!3')){late.resolve();await release.promise;}};
  f.db.afterCommit=({ops})=>{if(ops.some(x=>x.ref.path.includes('/intents/')&&x.value?.status==='failed_before_write'))failed.resolve();};
  let settled=false;const running=f.run('g05-late-worker-test-0001').finally(()=>{settled=true;});
  await Promise.all([late.promise,failed.promise]);for(let i=0;i<10;i++)await Promise.resolve();assert.equal(settled,false);
  release.resolve();const result=await running;assert.equal(result.status,'partial');assert.equal(result.firestoreWrites,1);assert.equal(result.unresolvedEffects,0);assert.equal(result.unverifiedEffects,0);
  assert.ok(f.db.read('tenants/tenant-a/projects/project-a/visits/HR!3'));
});
test('G05 operational conflict receipt counts reviewQueue and visit separately',async()=>{
  const f=await setup({shopperProviderFactory:()=>({reconcileSnapshot:async()=>({ok:true,providerAck:true,status:'committed',providerWrites:0})})});f.current.snapshot.shoppers=[];
  f.current.snapshot.visits=[{id:'a',visitId:'a',hrRowId:'HR!2',sourceTab:'HR',sourceRow:2,tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',shopperId:'hr-assigned',estado:'asignada',status:'asignada',canonicalFacets:{available:false,assigned:true}}];
  f.db.seed('tenants/tenant-a/projects/project-a/visits/HR!2',{tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',hrRowId:'HR!2',shopperId:'platform-assigned',assignmentSource:'platform',assignmentSyncStatus:'pending_hr',estado:'asignada',status:'asignada'});
  const result=await f.run('g05-visit-review-test-0001');assert.equal(result.ok,true);assert.equal(result.firestoreWrites,2);assert.equal(result.reviewWrites,1);assert.equal(result.identityReviewRequired,true);assert.equal(result.stages.visits.providerWrites,1);
});
for(const [name,patch] of [['wrong version',{version:'invalid'}],['missing revision',{expectedVersion:''}],['mutable snapshot payload',{payload:{snapshot:{}}}],['period command',{requirePeriod:true,periodId:'period-a'}],['path injection',{projectId:'p/visits'}],['missing idempotency',{idempotencyKey:''}]]){
  test('G05 invalid '+name+' is rejected before authorization or writes',async()=>{const f=await setup(),r=await f.run('g05-invalid-body-0001',patch);assert.equal(r.ok,false);assert.equal(f.principalCalls(),0);assert.equal(f.db.log.length,0);assert.equal(f.auth.log.length,0);});
}
for(const role of ['shopper','ops','client'])test('G05 verified '+role+' cannot invoke HR writer despite forged client admin',async()=>{
  const f=await setup({verifyPrincipal:async()=>({uid:'forged',role,namespace:role==='shopper'?'shopper':'staff'})});
  const result=await f.run('g05-role-denied-0001',{actor:{role:'super'}});assert.equal(result.ok,false);assert.equal(f.readCalls(),0);assert.equal(f.db.log.length,0);assert.equal(f.auth.log.length,0);
});
for(const [name,alter] of [
 ['unsafe snapshot',f=>f.current.snapshot.sourceSafe=false],['imported snapshot',f=>f.current.snapshot.imported=true],['writer snapshot',f=>f.current.snapshot.firestoreWrites=1],
 ['wrong scope',f=>f.current.snapshot.projectId='project-b'],
 ['internal project',f=>f.db.seed(f.projectPath,{...f.db.read(f.projectPath),operationalSource:{...f.db.read(f.projectPath).operationalSource,mode:'internal'}})],
 ['missing binding',f=>{const project=f.db.read(f.projectPath);delete project.operationalSource.providerBindingId;f.db.seed(f.projectPath,project);}]
])test('G05 '+name+' cannot acquire a writer lease',async()=>{
  const f=await setup();alter(f);const result=await f.run('g05-source-gate-0001');assert.equal(result.ok,false);assert.equal(f.db.log.length,0);assert.equal(f.auth.log.length,0);
});
test('G05 active lease rejects duplicate and different key; partial lease cannot be bypassed',async()=>{
  const wait=deferred(),started=deferred();let fail=true;
  const heldFactory=()=>({reconcileSnapshot:async()=>{started.resolve();await wait.promise;if(fail)throw Error('FIXTURE_STAGE_FAILURE');return {ok:true,status:'committed',providerAck:true};}});
  const f=await setup({shopperProviderFactory:heldFactory,operationalProviderFactory:heldFactory});
  const running=f.run('g05-lease-owner-0001');await started.promise;const before=f.db.log.length;
  assert.equal((await f.run('g05-lease-owner-0001')).code,'HR_RECONCILIATION_IN_PROGRESS');
  assert.equal((await f.run('g05-lease-other-0002')).code,'HR_RECONCILIATION_SCOPE_BUSY');assert.equal(f.db.log.length,before);
  wait.resolve();assert.equal((await running).status,'partial');
  const partial=f.db.log.length;assert.equal((await f.run('g05-lease-other-0002')).code,'HR_RECONCILIATION_SCOPE_BUSY');assert.equal(f.db.log.length,partial);
  fail=false;assert.equal((await f.run('g05-lease-owner-0001')).ok,true);
});
test('G05 rechecks lease after delayed intent commit before dispatching Auth',async()=>{
  const f=await setup({leaseMs:100});let delayed=false;
  f.db.afterCommit=({ops})=>{if(!delayed&&ops.some(op=>op.ref.path.includes('/intents/')&&op.value?.system==='auth')){delayed=true;f.advance(101);}};
  const result=await f.run('g05-expired-before-auth-0001');assert.equal(delayed,true);assert.equal(result.ok,false);assert.equal(f.auth.log.length,0);
});
