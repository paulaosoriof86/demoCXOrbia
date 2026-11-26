import test from 'node:test';
import assert from 'node:assert/strict';
import {createOperationalCommandProvider} from '../../cxorbia-operational-command-provider-v1.mjs';

const scope={tenantId:'sample',projectId:'project',periodId:'period-2026-11'};
const project='tenants/sample/projects/project',member='tenants/sample/users/admin';
const baseRow={ref:'001',sucursal:'Sucursal 14',fecha:'2026-11-05',ciudad:'Ciudad',escenario:'Visita'};
const policy={schemaVersion:'cxorbia.operational.provider-policy.v1',enabled:true,allowedTenantIds:['sample'],
  allowedProjectIds:['project'],conflictPolicy:'review_no_silent_overwrite',hrWrites:false,makeCalls:false,geminiCalls:false,storageWrites:false,paymentWrites:false};

// A transaction double with Firestore's read-before-write rule. New providers
// receive independent auth objects and share only the durable document store.
function fixture(){
  const docs=new Map(),verified=[];
  const seed=(path,v)=>docs.set(path,structuredClone(v));
  seed(member,{tenantId:'sample',role:'admin',active:true,authNamespace:'staff',projectIds:['project']});
  seed(project,{tenantId:'sample',projectId:'project',version:2,countries:['CO'],currency:{CO:'COP'},
    operationalSource:{mode:'internal',providerType:'internal_firestore',readPolicy:'internal_live',writePolicy:'platform_only'}});
  seed(project+'/periods/'+scope.periodId,{...scope,version:3,state:'activo',sourceMode:'internal'});
  const snap=path=>({id:path.split('/').at(-1),exists:docs.has(path),data:()=>structuredClone(docs.get(path))});
  const doc=path=>({path,get:async()=>snap(path),collection:name=>collection(path+'/'+name)});
  const collection=path=>({doc:id=>doc(path+'/'+id),where:(key,op,value)=>{assert.equal(op,'==');return {path,key,value};}});
  let tail=Promise.resolve();
  const db={doc,collection,runTransaction(callback){
    const work=tail.then(async()=>{
      const staged=new Map();
      const tx={get:async ref=>{
        assert.equal(staged.size,0);
        if(!ref.key)return snap(ref.path);
        return {docs:[...docs.keys()].filter(k=>k.startsWith(ref.path+'/')&&docs.get(k)[ref.key]===ref.value).map(snap)};
      },create(ref,data){assert(!docs.has(ref.path)&&!staged.has(ref.path));staged.set(ref.path,data);},
        set:(ref,data)=>staged.set(ref.path,data)};
      const value=await callback(tx);
      for(const [key,data] of staged)seed(key,data);
      return value;
    });
    tail=work.catch(()=>{});return work;
  }};
  function provider(role='admin'){
    const auth={verifyIdToken:async(token,revoked)=>{verified.push([token,revoked]);assert.equal(revoked,true);
      if(!token.startsWith('session-'))throw Error('invalid token');
      return {uid:'admin',role,authNamespace:'staff',tenantId:'sample',projectIds:['project']};}};
    return createOperationalCommandProvider({db,auth,policy});
  }
  return {docs,seed,verified,provider};
}
function command(type,rows=[baseRow]){
  const commandType='import.visits.'+type;
  return {...scope,version:'cxorbia-command-adapter-v1',entityType:'hrImport',commandType,expectedVersion:'current',
    idempotencyKey:'preview',authorization:{providerEnforcementRequired:true,permission:commandType},
    payload:{countryCode:'CO',sourceDigest:'a'.repeat(64),mappingDigest:'b'.repeat(64),rows}};
}
function confirm(preview,cmd){
  const commit=command('commit',cmd.payload.rows);
  return {...commit,idempotencyKey:preview.batchKey,expectedVersion:preview.expectedVersion,payload:{...cmd.payload,plan:preview.plan}};
}
test('dry-run through the operational dispatcher verifies auth, classifies every row and writes zero documents',async()=>{
  const f=fixture(),before=JSON.stringify([...f.docs]),c=command('dry_run',[baseRow,baseRow,{...baseRow,fecha:'2026-11-06'},{...baseRow,fecha:'2026-10-30'},{...baseRow,shopper:'blocked'}]);
  const r=await f.provider().execute('session-a',c);
  assert.equal(r.status,'dry_run');assert.equal(r.providerWrites,0);assert.equal(r.providerAck,false);
  assert.deepEqual(r.outcomes.map(x=>x.state),['new','duplicate','conflict','discarded','discarded']);
  assert.deepEqual(f.verified,[['session-a',true]]);assert.equal(JSON.stringify([...f.docs]),before);
});
test('response loss, independent receipt read and old replay preserve a later valid visit update',async()=>{
  const f=fixture(),c=command('dry_run'),p=f.provider(),preview=await p.execute('session-a',c),commit=confirm(preview,c);
  const first=await p.execute('session-a',commit);
  assert.equal(first.providerWrites,3);assert.equal(first.readbackVerified,true);
  const path=project+'/visits/'+first.outcomes[0].visitId;
  f.seed(path,{...f.docs.get(path),estado:'programada'});
  const before=JSON.stringify([...f.docs]),second=f.provider();
  const replay=await second.execute('session-b',commit);
  assert.equal(replay.idempotentReplay,true);assert.equal(replay.providerWrites,0);
  const read=await second.execute('session-b',{...command('read'),entityId:first.runId,payload:{}});
  assert.equal(read.readbackVerified,true);assert.equal(read.providerWrites,0);
  assert.equal(JSON.stringify([...f.docs]),before);
});
test('missing confirmation, revoked member, actor scope, role, closed period and external source deny writes',async()=>{
  for(const kind of ['confirmation','member','scope','role','period','source','token']){
    const f=fixture(),p=f.provider(),c=command('dry_run'),pre=await p.execute('session-a',c),commit=confirm(pre,c);
    if(kind==='confirmation')delete commit.payload.plan;
    if(kind==='member')f.seed(member,{...f.docs.get(member),active:false});
    if(kind==='scope')commit.projectId='other';
    if(kind==='period'){const ref=project+'/periods/'+scope.periodId;f.seed(ref,{...f.docs.get(ref),state:'cerrado'});}
    if(kind==='source')f.seed(project,{...f.docs.get(project),operationalSource:{mode:'external',providerType:'excel_online'}});
    const before=JSON.stringify([...f.docs]),r=await f.provider(kind==='role'?'ops':'admin').execute(kind==='token'?'invalid':'session-b',commit);
    assert.equal(r.ok,false,kind);assert.equal(JSON.stringify([...f.docs]),before,kind);
  }
});
test('different files with overlapping identities serialize and invalidate an obsolete preview',async()=>{
  const f=fixture(),p=f.provider(),a=command('dry_run'),b=command('dry_run');
  b.payload.sourceDigest='c'.repeat(64);
  const [ap,bp]=await Promise.all([p.execute('session-a',a),p.execute('session-b',b)]);
  const results=await Promise.all([p.execute('session-a',confirm(ap,a)),p.execute('session-b',confirm(bp,b))]);
  assert.equal(results.filter(x=>x.ok).length,1);
  assert.equal(results.filter(x=>x.code==='E10_PLAN_CHANGED').length,1);
  assert.equal([...f.docs.keys()].filter(k=>k.startsWith(project+'/visits/')).length,1);
});
test('existing rows in the selected country and period only participate in the plan',async()=>{
  const f=fixture(),p=f.provider(),c=command('dry_run');
  f.seed(project+'/visits/preexisting',{...baseRow,periodId:'older',pais:'CO'});
  f.seed(project+'/visits/another-country',{...baseRow,periodId:scope.periodId,pais:'GT'});
  assert.equal((await p.execute('session-a',c)).outcomes[0].state,'new');
  f.seed(project+'/visits/same-country',{...baseRow,periodId:scope.periodId,pais:'CO'});
  assert.equal((await p.execute('session-a',c)).outcomes[0].state,'duplicate');
});
