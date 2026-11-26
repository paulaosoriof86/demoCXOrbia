// Native QA only. Uses the existing dispatcher and Firebase password auth in DEV.
// A proof against a loopback dispatcher is recorded separately from a served release.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import {createRequire} from 'node:module';
import {randomBytes,createHash} from 'node:crypto';
import {maybeHandleCxorbiaCommandRuntimeRequest} from '../../backend/runtime/hr-live-service/cxorbia-command-runtime-v1.mjs';

const projectId='cxorbia-backend-dev',run=process.env.CXORBIA_E10_QA_RUN;
assert.match(run||'',/^[a-f0-9]{32}$/);
const out=process.env.CXORBIA_E10_QA_RECEIPT;
assert(out && !fs.existsSync(out));
const requireAdmin=createRequire((process.env.CXORBIA_QA_DEPENDENCIES||process.cwd())+'/package.json');
const {initializeApp,applicationDefault,deleteApp}=requireAdmin('firebase-admin/app');
const {getAuth}=requireAdmin('firebase-admin/auth'),{getFirestore}=requireAdmin('firebase-admin/firestore');
const app=initializeApp({projectId,credential:applicationDefault()}),auth=getAuth(app),db=getFirestore(app);
const tenantId='qa-e10-'+run,project='qa-import',periodId='qa-2026-11',uid='e10-'+run;
const email=uid+'@qa.example.invalid',password=randomBytes(32).toString('hex');
const base='tenants/'+tenantId+'/projects/'+project,member='tenants/'+tenantId+'/users/'+uid,period=base+'/periods/'+periodId;
const seed=new Map([[base,{tenantId,projectId:project,version:1,countries:['CO'],currency:{CO:'COP'},qaRun:run,
  operationalSource:{mode:'internal',providerType:'internal_firestore',readPolicy:'internal_live',writePolicy:'platform_only'}}],
  [period,{tenantId,projectId:project,periodId,sourceMode:'internal',state:'activo',version:1,qaRun:run}],
  [member,{tenantId,uid,role:'admin',authNamespace:'staff',projectIds:[project],active:true,qaRun:run}]]);
const policy={schemaVersion:'cxorbia.operational.provider-policy.v1',enabled:true,allowedTenantIds:[tenantId],allowedProjectIds:[project],
  conflictPolicy:'review_no_silent_overwrite',hrWrites:false,makeCalls:false,geminiCalls:false,storageWrites:false,paymentWrites:false};
const receipt={nativeRun:run,environment:projectId,mode:'NATIVE_FIRESTORE_AND_AUTH_LOOPBACK_DISPATCHER',production:false,realImports:0,steps:[]};
let ownedAuth=false,seeded=false,server,plan;
const check=(name)=>receipt.steps.push(name);
const rows=[{ref:'sample-1',sucursal:'Sucursal 17',fecha:'2026-11-21',ciudad:'Ciudad'},
  {ref:'sample-1',sucursal:'Sucursal 17',fecha:'2026-11-21',ciudad:'Ciudad'},
  {ref:'sample-1',sucursal:'Otra sucursal',fecha:'2026-11-22'},
  {ref:'sample-2',sucursal:'Otra sucursal',fecha:'2026-10-10'}];
const bytes=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const ordered=v=>Array.isArray(v)?v.map(ordered):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,ordered(v[k])])):v;
const same=(a,b)=>assert.deepEqual(ordered(a),ordered(b));
const payload={rows,countryCode:'CO',sourceDigest:bytes(rows),mappingDigest:bytes(['ref','sucursal','fecha','ciudad'])};
const command=(type,body=payload)=>({version:'cxorbia-command-adapter-v1',commandType:'import.visits.'+type,
  entityType:'hrImport',tenantId,projectId:project,periodId,idempotencyKey:'preview',expectedVersion:'current',payload:body,
  authorization:{permission:'import.visits.'+type,providerEnforcementRequired:true}});
try{
  const init=await (await fetch('https://cxorbia-backend-dev.web.app/__/firebase/init.json')).json();
  assert.equal(init.projectId,projectId);assert(init.apiKey);
  const login=async()=>{
    const response=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+encodeURIComponent(init.apiKey),
      {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,returnSecureToken:true})});
    assert.equal(response.status,200);const result=await response.json();assert.equal(result.localId,uid);return result.idToken;
  };
  const batch=db.batch();for(const [path,value] of seed)batch.create(db.doc(path),value);
  assert(!(await db.doc(base).get()).exists);assert.equal((await db.doc(base).listCollections()).length,0);
  await auth.createUser({uid,email,password,emailVerified:true});ownedAuth=true;
  await auth.setCustomUserClaims(uid,{role:'admin',authNamespace:'staff',tenantId,projectIds:[project]});
  await batch.commit();seeded=true;
  const sessionA=await login();
  server=http.createServer((req,res)=>maybeHandleCxorbiaCommandRuntimeRequest(req,res,new URL(req.url,'http://localhost'),
    {configure:()=>({db,auth,operationalPolicy:policy})}));
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const endpoint='http://127.0.0.1:'+server.address().port+'/v1/cxorbia/commands';
  const call=async(token,body)=>(await fetch(endpoint,{method:'POST',headers:{Authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify(body)})).json();
  const dry=command('dry_run');
  plan=await call(sessionA,dry);assert.equal(plan.status,'dry_run',plan.code);assert.equal(plan.providerWrites,0);
  same(plan.outcomes.map(r=>r.state),['new','duplicate','conflict','discarded']);
  assert((await db.collection(base+'/visits').get()).empty && (await db.collection(base+'/hrImportRuns').get()).empty);check('DRY_RUN_ZERO_WRITES_AND_FOUR_ROW_STATES');
  const commit={...command('commit',{...payload,plan:plan.plan}),expectedVersion:plan.expectedVersion,idempotencyKey:plan.batchKey};
  assert(!(await call(sessionA,{...commit,payload:{...payload,plan:'0'.repeat(64)}})).ok);check('WRONG_PLAN_DENIED');
  assert(!(await call(sessionA,{...dry,tenantId:'other-qa'})).ok);check('OTHER_TENANT_DENIED');
  const first=await call(sessionA,commit);assert(first.providerAck && first.readbackVerified);assert.equal(first.providerWrites,6);
  check('COMMIT_ACK_AND_INDEPENDENT_READBACK');receipt.createdVisitCount=1;
  const sessionB=await login();
  const snapshot=async()=>Promise.all(['visits','hrImportRuns','importConflicts'].map(async coll=>(await db.collection(base+'/'+coll).get()).docs.map(s=>[s.id,s.updateTime.toMillis()])));
  const before=await snapshot();
  const again=await call(sessionB,commit);
  assert(again.idempotentReplay && again.providerAck);assert.equal(again.providerWrites,0);
  same(await snapshot(),before);check('SECOND_PASSWORD_SESSION_REPLAY_ZERO_WRITES');
  const read=await call(sessionB,{...command('read',{}),entityId:first.runId});
  assert(read.readbackVerified);assert.equal(read.runId,first.runId);check('INDEPENDENT_RECEIPT_SECOND_SESSION');
  receipt.runId=first.runId;receipt.plan=plan.plan;receipt.status='PASS';
}catch(error){receipt.status='HOLD';receipt.failure=String(error.message).slice(0,210);process.exitCode=1;}
finally{
  try{
    if(server)await new Promise(resolve=>server.close(resolve));
    if(seeded){
      const ledger=await db.collection(base+'/hrImportRuns').get(),visits=await db.collection(base+'/visits').get();
      const allowed=new Map(seed);
      const projected=plan?.outcomes?.filter(r=>r.state==='new')||[];
      for(const s of visits.docs){
        const row=projected.find(r=>r.visitId===s.id);assert(row);
        const v=s.data();assert.equal(v.importRunId,plan.runId);assert.equal(v.importRowDigest,row.rowDigest);
        assert.equal(v.tenantId,tenantId);assert.equal(v.projectId,project);assert.equal(v.periodId,periodId);
        assert.equal(v.createdBy,uid);assert.equal(v.version,1);assert.equal(v.estado,'disponible');
        assert(s.createTime.isEqual(s.updateTime),'changed visit');allowed.set(s.ref.path,v);
      }
      for(const s of ledger.docs){
        const v=s.data();assert.equal(v.tenantId,tenantId);assert.equal(v.projectId,project);
        if(s.id==='visit-access-v1'){
          assert.equal(v.kind,'imported_visit_query_scope');assert.equal(v.firstRunId,plan.runId);
        }else{
          assert.equal(v.periodId,periodId);
          if(s.id===plan.runId){assert.equal(v.actorUid,uid);assert.equal(v.plan,plan.plan);}
          else if(s.id==='audit-'+plan.runId.slice(4)){
            assert.equal(v.kind,'import_commit_audit');assert.equal(v.actorUid,uid);
            assert.equal(v.importRunId,plan.runId);assert.equal(v.plan,plan.plan);
          }else{
            assert.equal(s.id,'lock-'+bytes([periodId,payload.countryCode]));assert.equal(v.lastRunId,plan.runId);assert.equal(v.sequence,1);
          }
        }
        assert(s.createTime.isEqual(s.updateTime),'changed receipt');allowed.set(s.ref.path,v);
      }
      for(const s of (await db.collection(base+'/importConflicts').get()).docs){
        const v=s.data(),row=plan.outcomes.find(o=>o.state==='conflict'&&o.index===v.index);
        assert(row);assert.equal(s.id,bytes([plan.runId.slice(4),row.index]));
        assert.equal(v.tenantId,tenantId);assert.equal(v.projectId,project);assert.equal(v.periodId,periodId);
        assert.equal(v.importRunId,plan.runId);assert.equal(v.sourceRowDigest,row.rowDigest);
        assert.equal(v.sourceRowId,row.sourceRowId);assert.equal(v.status,'review_required');
        assert.equal(v.reviewerUid,null);assert(s.createTime.isEqual(s.updateTime));allowed.set(s.ref.path,v);
      }
      const allowedPaths=new Set(allowed.keys());
      const projectChildren=await db.doc(base).listCollections();
      for(const collection of projectChildren)for(const item of (await collection.get()).docs){assert(allowedPaths.has(item.ref.path));assert.equal((await item.ref.listCollections()).length,0);}
      await db.runTransaction(async tx=>{
        const docs=await Promise.all([...allowed].map(async([path,body])=>{const ref=db.doc(path),s=await tx.get(ref);same(s.data(),body);return ref;}));
        for(const ref of docs)tx.delete(ref);
      });
      for(const path of allowed.keys())assert(!(await db.doc(path).get()).exists);
      assert.equal((await db.doc(base).listCollections()).length,0);receipt.ownedDocumentsRemoved=allowed.size;
    }
    if(ownedAuth){const user=await auth.getUser(uid);assert.equal(user.email,email);await auth.deleteUser(uid);
      await assert.rejects(auth.getUser(uid),e=>e.code==='auth/user-not-found');receipt.ownedAuthRemoved=1;}
    check('EXACT_OWNED_CLEANUP');receipt.cleanupVerified=true;
  }catch(error){receipt.status='HOLD';receipt.cleanupVerified=false;receipt.cleanupFailure=String(error.message).slice(0,210);process.exitCode=1;}
  await db.terminate();await deleteApp(app);fs.writeFileSync(out,JSON.stringify(receipt,null,2)+'\n',{flag:'wx',mode:0o600});
  console.log(JSON.stringify(receipt));
}
