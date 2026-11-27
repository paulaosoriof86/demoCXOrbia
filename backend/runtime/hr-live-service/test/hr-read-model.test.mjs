import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {withReaderIdentity,runAdmittedSnapshot,admitReaderCall,readerTicketKey} from '../hr-read-admission.mjs';
import fs from 'node:fs';
import vm from 'node:vm';
import {createDurableHrReadModel,createConfirmedHrHistory,readSharedHrProjection,invalidateSharedHrSync,hrReadModelKey,HR_READ_MODEL_CHUNK_BYTES} from '../hr-read-model.mjs';

const clone=x=>x===undefined?undefined:structuredClone(x);
const hash=x=>crypto.createHash('sha256').update(String(x)).digest('hex');
const key=hrReadModelKey({scope:{tenantId:'qa-tenant',projectId:'qa-project'},proof:{bindingFingerprint:hash('binding')}},hash('reader-v1'));
const binding={bindingFingerprint:key.bindingFingerprint};
const observation=(tag,{read=2000,start=1000,extra=''}={})=>({
  snapshot:{tenantId:key.tenantId,projectId:key.projectId,sourceSafe:true,imported:false,production:false,
    periods:[{key:'2026-11'}],visits:[{id:'qa-visit',periodKey:'2026-11',state:tag}],generatedAt:'2026-11-24T00:00:00.000Z'},
  revision:hash(tag),loadedAt:read,sourceReadStartedAt:start,bindingProof:binding,
  identity:new Map([['qa-shopper',{displayName:'Synthetic Shopper'}]]),
  privateReviewNotes:new Map([['qa-visit',{observation:'Synthetic note '+extra}]]),
  origin:'runtime_excel_online_original',externalReadCurrent:true
});
class Snap{constructor(ref,value){this.ref=ref;this.value=clone(value);this.exists=value!==undefined;}data(){return clone(this.value);}}
class Ref{
  constructor(db,path){this.db=db;this.path=path;}
  collection(name){const path=this.path+'/'+name,db=this.db;return {doc:id=>new Ref(db,path+'/'+id),get:async()=>({docs:[...db.docs].filter(([p])=>p.startsWith(path+'/')&&p.split('/').length===path.split('/').length+1).map(([p,v])=>new Snap(new Ref(db,p),v))})};}
  async update(data){this.db.apply([['update',this,data]]);}
  async get(){this.db.reads++;return new Snap(this,this.db.docs.get(this.path));}
}
class DB{
  constructor(){this.docs=new Map();this.reads=0;this.batches=0;this.transactions=0;this.writeSizes=[];this.beforeBatch=null;this.tail=Promise.resolve();}
  doc(path){return new Ref(this,path);}
  apply(ops){
    const next=new Map(this.docs);
    for(const [type,ref,data]of ops){
      if(type==='create'&&next.has(ref.path))throw Error('ALREADY_EXISTS');
      if(type==='update'&&!next.has(ref.path))throw Error('NOT_FOUND');
      next.set(ref.path,type==='update'?{...clone(next.get(ref.path)),...clone(data)}:clone(data));
      this.writeSizes.push(data.bytes?data.bytes.length:Buffer.byteLength(JSON.stringify(data)));
    }
    this.docs=next;
  }
  batch(){const ops=[];return {create:(ref,data)=>ops.push(['create',ref,data]),set:(ref,data)=>ops.push(['set',ref,data]),commit:async()=>{this.batches++;await this.beforeBatch?.(this.batches);this.apply(ops);}};}
  async runTransaction(fn){
    let release;const prior=this.tail;this.tail=new Promise(r=>release=r);await prior;
    try{this.transactions++;const ops=[],tx={get:async ref=>ref.get()};
      for(const type of ['create','set','update'])tx[type]=(ref,data)=>ops.push([type,ref,data]);
      const result=await fn(tx);this.apply(ops);return result;
    }finally{release();}
  }
}
const pointer=db=>[...db.docs.entries()].find(([p,v])=>p.split('/').length===6&&v.generation);
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};};

const hscope={tenantId:'qa-tenant',projectId:'qa-project'};
const hrow=(month,id=month)=>({...hscope,id,visitId:id,periodId:'qa-project-'+month,periodKey:month,country:'GT',shopperId:'qa-shopper'});
const hsnapshot=(visits,months)=>({...hscope,sourceSafe:true,imported:false,production:false,visits,shoppers:[{id:'qa-shopper'}],
  periods:months.map(key=>({id:'qa-project-'+key,periodId:'qa-project-'+key,key})),
  readScope:{countryPeriods:months.map(month=>({countryCode:'GT',periodId:'qa-project-'+month}))}});
const hopts=(tag,start=1000,end=2000)=>({sourceReadAt:end,sourceReadStartedAt:start,revision:hash(tag),evidence:{receiptPath:'synthetic-local-test'}});

test('history survives restart and window replacement, but never grants external authority',async()=>{
 const db=new DB(),store=createConfirmedHrHistory({db,now:()=>10000});
 await store.observe(hsnapshot([hrow('2026-05'),hrow('2026-11')],['2026-05','2026-11']),hopts('seed'));
 await store.observe(hsnapshot([hrow('2026-10'),{...hrow('2026-11'),estado:'realizada'}],['2026-10','2026-11']),hopts('window',3000,4000));
 const read=await createConfirmedHrHistory({db,now:()=>1e12}).read(hscope);
 assert.equal(read.visits.length,3);assert.equal(read.visits.find(v=>v.periodKey==='2026-11').estado,'realizada');
 assert.equal(read.externalReadCurrent,false);assert.equal(read.observations.find(x=>x.periodId.endsWith('2026-05')).sourceReadAt,new Date(2000).toISOString());
});
test('an explicitly empty period erases its last historical visit without touching other periods',async()=>{
 const db=new DB(),store=createConfirmedHrHistory({db,now:()=>10000});
 await store.observe(hsnapshot([hrow('2026-05'),hrow('2026-11')],['2026-05','2026-11']),hopts('first'));
 await store.observe(hsnapshot([],['2026-11']),hopts('empty',3000,4000));
 const read=await createConfirmedHrHistory({db,now:()=>1e12}).read(hscope);
 assert.deepEqual(read.visits.map(v=>v.periodKey),['2026-05']);
});
test('invalid or incomplete history coverage is rejected before any write',async()=>{
 for(const alter of [s=>delete s.readScope,s=>s.readScope.countryPeriods.push(s.readScope.countryPeriods[0]),s=>s.readScope.countryPeriods[0].periodId='qa-project-2026-10',s=>s.visits[0].tenantId='foreign']){
  const db=new DB(),store=createConfirmedHrHistory({db,now:()=>10000}),value=hsnapshot([hrow('2026-11')],['2026-11']);alter(value);
  await assert.rejects(store.observe(value,hopts('bad')),/HISTORY_READ_COVERAGE/);assert.equal(db.docs.size,0);assert.equal(db.batches,0);
 }
});
test('history replay writes nothing; identical content reuses immutable chunks for a newer observation',async()=>{
 const db=new DB(),store=createConfirmedHrHistory({db,now:()=>10000}),s=hsnapshot([hrow('2026-11')],['2026-11']);
 await store.observe(s,hopts('first'));const writes=db.writeSizes.length,batches=db.batches;
 await store.observe(s,hopts('first'));assert.equal(db.writeSizes.length,writes);
 await store.observe(s,hopts('second',3000,4000));assert.equal(db.batches,batches);assert.equal(db.writeSizes.length,writes+1);
});
test('late old history reader cannot overwrite a newer-started read, including publication CAS',async()=>{
 const db=new DB(),store=createConfirmedHrHistory({db,now:()=>10000}),s=tag=>hsnapshot([{...hrow('2026-11'),state:tag}],['2026-11']);
 await store.observe(s('new'),hopts('new',2000,3000));
 assert.equal((await store.observe(s('old'),hopts('old',1000,4000))).published,false);
 assert.equal((await store.read(hscope)).visits[0].state,'new');
 await assert.rejects(store.observe(s('conflict'),hopts('conflict',2000,5000)),/HISTORY_CONCURRENT_OBSERVATION/);
 const barrier=deferred(),entered=deferred();let gate=true;db.beforeBatch=async()=>{if(gate){gate=false;entered.resolve();await barrier.promise;}};
 const older=store.observe(s('older-race'),hopts('older-race',5000,8000));await entered.promise;
 await store.observe(s('newer-race'),hopts('newer-race',6000,7000));barrier.resolve();await older;
 assert.equal((await store.read(hscope)).visits[0].state,'newer-race');
});
test('historical seed cannot replace an existing observation and rejects missing provenance',async()=>{
 const db=new DB(),store=createConfirmedHrHistory({db,now:()=>10000}),s=hsnapshot([hrow('2026-11')],['2026-11']);
 await store.observe(s,hopts('first'));
 const opts={...hopts('seed',3000,4000),seed:true};await assert.rejects(store.observe(s,opts),/HISTORY_SEED_PROVENANCE/);
 opts.evidence={receiptPath:'exact-accepted-artifact',snapshotSha256:hash('bytes'),artifactDigest:'sha256:'+hash('zip'),artifactId:123};
 assert.equal((await store.observe(s,opts)).published,false);
 assert.equal((await store.read(hscope)).observations[0].sourceReadAt,new Date(2000).toISOString());
});
test('failed historical chunk batch keeps the previous readable period intact',async()=>{
 const db=new DB(),store=createConfirmedHrHistory({db,now:()=>10000});
 await store.observe(hsnapshot([hrow('2026-11')],['2026-11']),hopts('old'));
 const failAt=db.batches+2;db.beforeBatch=count=>{if(count===failAt)throw Error('STORAGE_FAILURE');};
 const s=hsnapshot([{...hrow('2026-11'),payload:crypto.randomBytes(3000000).toString('base64')}],['2026-11']);
 await assert.rejects(store.observe(s,hopts('large',3000,4000)),/STORAGE_FAILURE/);
 assert.equal((await store.read(hscope)).visits[0].payload,undefined);
});

test('cold process restores validated snapshot, exact maps and original observation time without a provider',async()=>{
  const db=new DB(),value=observation('first'),writer=createDurableHrReadModel({db,now:()=>2500});
  const receipt=await writer.publish(key,value);assert.equal(receipt.published,true);
  const freshProcess=createDurableHrReadModel({db,now:()=>500000});
  const saved=await freshProcess.read(key);
  assert.deepEqual(saved.snapshot,value.snapshot);assert.deepEqual(saved.identity,value.identity);
  assert.deepEqual(saved.privateReviewNotes,value.privateReviewNotes);
  assert.equal(saved.loadedAt,2000);assert.equal(saved.sourceReadStartedAt,1000);
  assert.equal(saved.revision,value.revision);assert.equal(saved.externalReadCurrent,false);
  assert.equal(saved.origin,'durable_internal_snapshot');assert.equal(saved.durableReadModel.recoveredAt,500000);
});

test('payload over one MiB is recovered from bounded immutable shards; no document approaches Firestore limit',async()=>{
  const db=new DB(),value=observation('large',{extra:crypto.randomBytes(1500000).toString('base64')});
  assert.ok(Buffer.byteLength(JSON.stringify(value.snapshot))+Buffer.byteLength(JSON.stringify([...value.privateReviewNotes]))>1048576);
  const store=createDurableHrReadModel({db,now:()=>3000}),result=await store.publish(key,value);
  assert.ok(result.chunkCount>1);assert.ok(Math.max(...db.writeSizes)<=HR_READ_MODEL_CHUNK_BYTES);
  const saved=await store.read(key);assert.deepEqual(saved.privateReviewNotes,value.privateReviewNotes);
});

test('failed shard batch never publishes a partial new snapshot or changes the prior pointer',async()=>{
  const db=new DB(),store=createDurableHrReadModel({db,now:()=>6000});
  await store.publish(key,observation('old'));const before=clone(pointer(db));
  const failAt=db.batches+2;db.beforeBatch=async count=>{if(count===failAt)throw Error('SIMULATED_STORAGE_FAILURE');};
  const large=observation('new',{start:3000,read:4000,extra:crypto.randomBytes(3000000).toString('base64')});
  await assert.rejects(store.publish(key,large),/SIMULATED_STORAGE_FAILURE/);
  assert.deepEqual(pointer(db),before);assert.equal((await store.read(key)).revision,hash('old'));
});

test('unchanged revision advances only confirmed observation metadata and reuses immutable content',async()=>{
  const db=new DB(),store=createDurableHrReadModel({db,now:()=>6000});
  const first=await store.publish(key,observation('same')),batches=db.batches,count=db.docs.size;
  const second=await store.publish(key,observation('same',{start:3000,read:4000}));
  assert.equal(second.reused,true);assert.equal(second.generation,first.generation);
  assert.equal(db.batches,batches);assert.equal(db.docs.size,count);assert.equal((await store.read(key)).loadedAt,4000);
});

test('repeat presentation of the same observation performs no additional durable write',async()=>{
  const db=new DB(),store=createDurableHrReadModel({db,now:()=>3000}),value=observation('same-observation');
  await store.publish(key,value);const writes=db.writeSizes.length,transactions=db.transactions;
  const repeat=await store.publish(key,value);assert.equal(repeat.published,false);assert.equal(repeat.readModelPresent,true);
  assert.equal(db.writeSizes.length,writes);assert.equal(db.transactions,transactions);
});

test('different tenant, project, binding or reader cannot recover another scoped snapshot',async()=>{
  const db=new DB(),store=createDurableHrReadModel({db,now:()=>3000});await store.publish(key,observation('one'));
  for(const other of [{...key,tenantId:'other'},{...key,projectId:'other'},
    {...key,bindingFingerprint:hash('other')},{...key,readerFingerprint:hash('reader-v2')}])
    assert.equal(await store.read(other),null);
  for(const invalid of [{...key,projectId:'../other'},{...key,tenantId:'a/b'},{...key,bindingFingerprint:'wrong'}])
    await assert.rejects(store.read(invalid),/HR_READ_MODEL_KEY/);
});

test('corrupt or missing shard is rejected before exposing content',async()=>{
  for(const mode of ['corrupt','missing']){
    const db=new DB(),store=createDurableHrReadModel({db,now:()=>3000});await store.publish(key,observation(mode));
    const [path,row]=[...db.docs.entries()].find(([p])=>p.includes('/chunks/'));
    if(mode==='missing')db.docs.delete(path);else{row.bytes[0]^=1;db.docs.set(path,row);}
    await assert.rejects(store.read(key),/HR_READ_MODEL_CHUNK/);
  }
});

test('expired or future observation is never returned as a recovered valid view',async()=>{
  const db=new DB();await createDurableHrReadModel({db,now:()=>3000}).publish(key,observation('aged'));
  assert.equal(await createDurableHrReadModel({db,now:()=>10000,maxAgeMs:5000}).read(key),null);
  assert.equal(await createDurableHrReadModel({db,now:()=>1000}).read(key),null);
});

test('late prior read cannot replace a more recent observation; ambiguous equal-start revisions fail closed',async()=>{
  const db=new DB(),store=createDurableHrReadModel({db,now:()=>10000});
  await store.publish(key,observation('new',{start:4000,read:5000}));const before=clone(pointer(db));
  const old=await store.publish(key,observation('old',{start:1000,read:8000}));
  assert.equal(old.published,false);assert.deepEqual(pointer(db),before);
  await assert.rejects(store.publish(key,observation('ambiguous',{start:4000,read:6000})),/CONCURRENT_REVISION/);
  assert.deepEqual(pointer(db),before);
});

test('pointer CAS rejects a slower reader even when it finishes writing shards after the newer reader',async()=>{
  const db=new DB(),hold=deferred(),reached=deferred(),store=createDurableHrReadModel({db,now:()=>10000});
  db.beforeBatch=async n=>{if(n===1){reached.resolve();await hold.promise;}};
  const old=store.publish(key,observation('slow',{start:1000,read:2000}));await reached.promise;
  const recent=await store.publish(key,observation('recent',{start:3000,read:4000}));
  assert.equal(recent.published,true);hold.resolve();assert.equal((await old).published,false);
  assert.equal((await store.read(key)).revision,hash('recent'));
});

test('bootstrap, recovered data or invalid timestamps cannot be republished as a new external observation',async()=>{
  const db=new DB(),store=createDurableHrReadModel({db,now:()=>10000});
  for(const change of [{origin:'build_bootstrap'},{origin:'durable_internal_snapshot'},
    {externalReadCurrent:false},{sourceReadStartedAt:3000,loadedAt:2000},{loadedAt:100000}])
    await assert.rejects(store.publish(key,{...observation('invalid'),...change}),/EXTERNAL_OBSERVATION_REQUIRED/);
  assert.equal(db.docs.size,0);
});

test('oversized or foreign manifest is rejected before chunk allocation',async()=>{
  for(const change of [{chunkCount:100000},{rawBytes:100000000},{tenantId:'foreign'}]){
    const db=new DB(),store=createDurableHrReadModel({db,now:()=>3000});await store.publish(key,observation('manifest'));
    const [path,row]=[...db.docs.entries()].find(([p,v])=>v.compression==='gzip');db.docs.set(path,{...row,...change});
    const reads=db.reads;await assert.rejects(store.read(key),/HR_READ_MODEL_MANIFEST/);
    assert.equal(db.reads-reads,2);
  }
});

test('one local configuration retains the exact observed worksheet binding when its stable content revision is unchanged',async()=>{
 const db=new DB(),store=createDurableHrReadModel({db,now:()=>5000});
 const first=observation('same'),second=observation('same',{read:4000,start:3000});
 for(const [n,current] of [first,second].entries()){
   current.bindingProof={bindingFingerprint:hash('exact-sheet-'+n),localBindingFingerprint:key.bindingFingerprint};
   current.discoveryContexts={GT:{inventoryHash:hash('inventory-'+n)}};
   const receipt=await store.publish(key,current);assert.equal(receipt.reused,false);
   const saved=await store.read(key);assert.equal(saved.revision,current.revision);
   assert.equal(saved.bindingProof.bindingFingerprint,current.bindingProof.bindingFingerprint);
   assert.deepEqual(saved.discoveryContexts,current.discoveryContexts);assert.equal(saved.loadedAt,current.loadedAt);
 }
 await assert.rejects(store.publish(key,{...first,sourceReadStartedAt:second.sourceReadStartedAt}),/EXTERNAL_OBSERVATION_REQUIRED/);
 await assert.rejects(store.publish(key,{...first,loadedAt:second.loadedAt,sourceReadStartedAt:second.sourceReadStartedAt}),/CONCURRENT_REVISION/);
 const [name,p]=pointer(db);db.docs.set(name,{...p,sourceBindingFingerprint:first.bindingProof.bindingFingerprint});
 await assert.rejects(store.read(key),/SOURCE_BINDING/);
});

function sharedProject(){
  const db=new DB(),scope={tenantId:'qa-tenant',projectId:'qa-projection'},bindingKey=hash('reader+local-binding');
  let clock=Date.parse('2026-11-26T02:45Z'),rows='A',saved=null,calls=0,remote=async()=>{};
  const read=async()=>saved&&{...saved,externalReadCurrent:false,origin:'durable_internal_snapshot'};
  const refresh=async()=>{
    const start=clock,value=rows;calls++;await remote();
    const current={revision:hash(value),sourceReadStartedAt:start,loadedAt:clock,externalReadCurrent:true};
    saved=current;return current;
  };
  const opts={db,scope,bindingKey,now:()=>clock,read,refresh,delay:()=>new Promise(r=>setTimeout(r,1))};
  return {opts,observe:(poll=true)=>readSharedHrProjection({...opts,poll}),calls:()=>calls,
    advance:n=>clock+=n,edit:value=>{rows=value;},setRemote:fn=>remote=fn,
    invalidate:()=>invalidateSharedHrSync(db,scope,opts.now),drop:()=>{saved=null;}};
}
test('two Cloud Run callers, concurrent navigation and staggered session polls use one external observation for a shared revision',async()=>{
  const h=sharedProject();
  let admit,release;const started=new Promise(r=>admit=r),pending=new Promise(r=>release=r);
  h.setRemote(()=>{admit();return pending;});
  const first=h.observe();await started;
  const simultaneous=[h.observe(),h.observe(false),h.observe(false)];
  release();const results=await Promise.all([first,...simultaneous]);
  assert.equal(h.calls(),1);assert.ok(results.every(x=>x.revision===hash('A')));
  assert.equal(results.filter(x=>x.externalReadCurrent===true).length,1);
  h.advance(100000);assert.equal((await h.observe()).externalReadCurrent,false);
  h.edit('B');assert.equal((await h.observe(false)).revision,hash('A'));
  h.advance(200000);const changes=await Promise.all([h.observe(),h.observe()]);
  assert.deepEqual(changes.map(x=>x.revision),[hash('B'),hash('B')]);assert.equal(h.calls(),2);
  assert.equal((await h.observe(false)).revision,hash('B'));assert.equal(h.calls(),2);
});
test('a verified ACK invalidates the shared projection for the next presentation before the timer',async()=>{
  const h=sharedProject();await h.observe();h.edit('B');
  await h.invalidate();const read=await h.observe(false);
  assert.equal(read.revision,hash('B'));assert.equal(h.calls(),2);
  await h.observe();assert.equal(h.calls(),2);
});
test('a late refresh that began before an ACK cannot mark the old revision current',async()=>{
  const h=sharedProject();
  let admit,release;const started=new Promise(r=>admit=r),pending=new Promise(r=>release=r);
  h.setRemote(()=>{admit();return pending;});const first=h.observe();await started;
  h.edit('B');await h.invalidate();release();
  await assert.rejects(first,/SHARED_INVALIDATED_DURING_REFRESH/);
  assert.equal((await h.observe()).revision,hash('B'));assert.equal(h.calls(),2);
});
test('external failure serves only a confirmed timestamp, throttles other workers, then discovers subsequent changes',async()=>{
  const h=sharedProject(),first=await h.observe();h.advance(300001);h.setRemote(async()=>{throw Error('PROVIDER_FAILURE:EXCEL_DOWN');});
  const fallback=await h.observe(),other=await h.observe();
  for(const result of [fallback,other]){assert.equal(result.loadedAt,first.loadedAt);assert.equal(result.externalReadCurrent,false);assert.equal(result.sharedRefreshFailed,true);}
  assert.equal(h.calls(),2);h.advance(30001);h.edit('B');h.setRemote(async()=>{});
  assert.equal((await h.observe()).revision,hash('B'));assert.equal(h.calls(),3);
});
test('a missing or expired durable body requires a new external observation',async()=>{
  const h=sharedProject();await h.observe();h.drop();h.advance(24*60*60*1000+1);h.edit('B');
  assert.equal((await h.observe(false)).revision,hash('B'));assert.equal(h.calls(),2);
});
test('binding errors fail closed even when a saved revision exists',async()=>{
  const h=sharedProject();await h.observe();h.advance(300001);
  h.setRemote(async()=>{throw Error('MAPPING_FAILURE:HR_SHARED_BINDING_CHANGED');});
  await assert.rejects(h.observe(),/HR_SHARED_BINDING_CHANGED/);
  await assert.rejects(h.observe(),/MAPPING_FAILURE:HR_SHARED_BINDING_CHANGED/);
  assert.equal(h.calls(),2);
});

test('the served watcher routes two independent authenticated clients through the real shared presentation handler',async()=>{
  const server=fs.readFileSync(new URL('../server.mjs',import.meta.url),'utf8');
  const begin=server.indexOf('async function sharedPresentation('),end=server.indexOf('function setCommonHeaders(',begin);
  assert.ok(begin>=0&&end>begin);
  const watcher=fs.readFileSync(new URL('../../../../app/adapters/tya-live-source-refresh-watch-v2.js',import.meta.url),'utf8');
  const project=sharedProject(),{scope,db}=project.opts,actors=[],requests=[];
  const local={scope,proof:{providerType:'excel_online',localBindingFingerprint:hash('local')}};
  let resolutions=0,saved={revision:hash('A'),loadedAt:Date.now()-420000};
  function instance(){
    return new Function('verifiedProtectedPrincipal','resolveProjectHrReadBinding','durableHrReadContext',
      'crypto','readSharedHrProjection','recoverHrReadModel','buildSnapshot','persistHrReadModel',
      server.slice(begin,end)+'\nreturn sharedPresentation;')(
      async req=>{const uid=req.headers.Authorization.replace(/^Bearer /,'');if(!['s1','s2'].includes(uid))throw Error('AUTH_FAILURE:DENIED');actors.push(uid);return {uid,db};},
      async (_,options)=>{assert.equal(options.localOnly,true);resolutions++;return local;},
      ()=>({key:{readerFingerprint:hash('reader')}}),crypto,readSharedHrProjection,
      async (_,options)=>{assert.equal(options.durableOnly,true);return saved&&{...saved,externalReadCurrent:false};},
      async options=>{assert.equal(options.forceFresh,true);const observed=await project.opts.refresh();return {...observed,loadedAt:Date.now(),bindingProof:local.proof};},
      async (_,value)=>{saved={...value};return {published:true};});
  }
  function session(uid,handler){
    const context={authenticated:true,tenantId:scope.tenantId,projectIds:[scope.projectId],role:'shopper',authNamespace:'shopper'};
    const CX={data:{currentProjectId:scope.projectId,projects:[],_visitas:[],previewMeta:{sourceRevision:hash('A')}},
      dataSource:{sourceRef:'hr-live-all-periods+firestore-authenticated-exact-overlay',badge:()=>({})},backendAuth:{context:()=>context}};
    const win={CX,addEventListener(){},firebase:{auth:()=>({currentUser:{uid,getIdToken:async()=>uid}})},
      CX_PROTECTED_AUTH_HR_AUTHORITY:{applied:true,atomicPublication:true,sourceRevision:hash('A')}};
    vm.runInNewContext(watcher,{window:win,CX,document:{addEventListener(){},visibilityState:'visible',getElementById(){return null;}},
      URLSearchParams,location:{search:'?cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV'},
      setInterval(){},setTimeout(){},fetch:async(raw,{headers})=>{
        const u=new URL(raw,'https://qa.invalid');assert.equal(u.pathname,'/api/tenants/qa-tenant/projects/qa-projection/hr-live');
        assert.equal(u.searchParams.get('protectedState'),'1');assert.equal(u.searchParams.get('readModel'),'1');
        assert.equal(u.searchParams.has('fresh'),false);assert.equal(u.searchParams.get('sync'),'due');requests.push(uid);
        const {current,principal}=await handler({headers},scope,true);assert.equal(principal.uid,uid);
        return {ok:true,json:async()=>({sourceSafe:true,runtimeRead:true,...current})};
      }});
    return win.CX_TYA_CHECK_LIVE_SOURCE;
  }
  const one=instance(),two=instance();
  const result=await Promise.all([session('s1',one)('poll'),session('s2',two)('poll')]);
  assert.deepEqual(requests.sort(),['s1','s2']);assert.deepEqual(result.map(x=>x.revision),[hash('A'),hash('A')]);
  // Additional protected JSON/metadata consumers see the same published read.
  for(const [uid,handler] of [['s1',one],['s2',two],['s1',one]]){
    const result=await handler({headers:{Authorization:'Bearer '+uid}},scope,false);
    assert.equal(result.current.revision,hash('A'));assert.equal(result.current.externalReadCurrent,false);
  }
  assert.equal(project.calls(),0);assert.equal(actors.length,5);assert.equal(resolutions,5);
  await assert.rejects(one({headers:{Authorization:'Bearer other'}},scope,true),/AUTH_FAILURE/);
  assert.equal(project.calls(),0);assert.equal(resolutions,5);
});

function budgetFixture(overrides={}){
  const scope={tenantId:'qa',projectId:'synthetic'},bindingKey=hash('binding'),db=new DB();
  const actor='google:fixture',process='seal-meta',runId='native-run';
  const policy='cxorbiaProviderBudgets/dev_make_hr_reader';
  const window={...scope,windowId:'w',enabled:true,bindingKey,expiresAt:Date.now()+60000,
    protectedAllocation:160,spendingLimit:60,recoveryReserve:100,maxCreditsPerCall:3,reserved:0,
    allocationReceiptSha256:hash('synthetic allocation'),grants:[{actor,process,runId,maxCalls:4}],...overrides};
  db.docs.set(policy,window);
  const input={...scope,bindingFingerprint:bindingKey,countryCode:'GT',periodId:'nov',driveId:'drive',itemId:'test',worksheetId:'a',rangeAddress:'A1:B2'};
  if(!Object.hasOwn(overrides,'grants'))window.grants[0].tickets=[readerTicketKey(input)];
  let sent=0;
  const call=(args=input,send=async()=>++sent)=>admitReaderCall(args,send);
  const submit=(requestId,work=async()=>{await call();return {revision:hash('confirmed')};},who={})=>
    withReaderIdentity({...scope,actor,process,runId,requestId,...who},()=>runAdmittedSnapshot({db,scope,bindingKey,work}));
  return {db,policy,call,submit,input,sent:()=>sent,window,scope,bindingKey};
}

test('five of twenty concurrent four-call envelopes fit the 60-credit ceiling; ordinary identities cannot debit the reserve',async()=>{
  const b=budgetFixture();
  const results=await Promise.allSettled(Array.from({length:20},(_,i)=>b.submit(String(i))));
  assert.equal(results.filter(r=>r.status==='fulfilled').length,5);
  assert.equal(b.db.docs.get(b.policy).reserved,60);
  assert.equal(b.sent(),5);
  await assert.rejects(b.submit('ordinary',undefined,{actor:'firebase:other'}),/WINDOW_CLOSED/);
  await assert.rejects(b.call(),/ATTEMPT_REQUIRED/);
  assert.equal(b.window.protectedAllocation-b.db.docs.get(b.policy).reserved,100);
});
for(const [name,change] of Object.entries({closed:{enabled:false},expired:{expiresAt:0},
  unfunded:{protectedAllocation:110},noReserve:{recoveryReserve:99},price:{maxCreditsPerCall:1},
  excessive:{spendingLimit:61},evidence:{allocationReceiptSha256:'missing'},grants:{grants:[]}})){
  test('paid dispatch fails closed on '+name,async()=>{
    const b=budgetFixture(change);
    await assert.rejects(b.submit('test'),/WINDOW_CLOSED|BUDGET_EXHAUSTED/);
    assert.equal(b.sent(),0);assert.equal(b.db.docs.get(b.policy).reserved,0);
  });
}
test('duplicate ticket, response loss and new-session replay keep one physical invocation',async()=>{
  const b=budgetFixture();let attempts=0;
  await assert.rejects(b.submit('same',async()=>{
    await b.call(b.input,async()=>{attempts++;throw Error('PROVIDER_FAILURE:UNCERTAIN');});
  }),/UNCERTAIN/);
  await assert.rejects(b.submit('same'),/INCOMPLETE/);assert.equal(attempts,1);assert.equal(b.sent(),0);
  const saved=[...b.db.docs.values()].find(v=>v.state==='FAILED');
  assert.equal(Object.values(saved.calls)[0],'DISPATCHED');
  assert.equal(saved.maxCredits,12);
  await assert.rejects(b.submit('dup',async()=>{await b.call();await b.call();}),/TICKET_UNAVAILABLE/);assert.equal(b.sent(),1);
});
test('deterministic mapping failure survives new requests on the same binding',async()=>{
  const b=budgetFixture();
  await assert.rejects(b.submit('one',async()=>{await b.call();throw Error('MAPPING_FAILURE:COLUMN_MISSING:private detail');}),/COLUMN_MISSING/);
  await assert.rejects(b.submit('two'),/^Error: MAPPING_FAILURE:COLUMN_MISSING$/);
  assert.equal(b.sent(),1);assert.equal(b.db.docs.get(b.policy).reserved,12);
  assert.equal(JSON.stringify([...b.db.docs.values()]).includes('private detail'),false);
});
test('scope drift, cancelled window and reused success ticket cannot redispatch',async()=>{
  const b=budgetFixture();
  await b.submit('a');
  await assert.rejects(b.submit('a'),/ATTEMPT_COMPLETE/);
  await assert.rejects(b.submit('b',()=>b.call({...b.input,projectId:'other'})),/ATTEMPT_REQUIRED/);
  await assert.rejects(b.submit('c',async()=>{b.db.docs.get(b.policy).enabled=false;return b.call();}),/WINDOW_CLOSED/);
  assert.equal(b.sent(),1);
});

test('a new session reads a typed receipt only for its own actor, project and request without dispatch',async()=>{
  const {readReaderOutcome}=await import('../hr-read-admission.mjs');
  const b=budgetFixture();await b.submit('history');
  const get=(actor='google:fixture',scope=b.scope)=>readReaderOutcome(b.db,scope,actor,'seal-meta','native-run','history');
  assert.deepEqual(await get(),{state:'COMPLETE',code:null,revision:hash('confirmed'),
    startedAt:[...b.db.docs.values()].find(x=>x.state==='COMPLETE').startedAt,
    finishedAt:[...b.db.docs.values()].find(x=>x.state==='COMPLETE').finishedAt,dispatched:1,returned:1,externalReadCurrent:false});
  await assert.rejects(get('foreign'),/UNAVAILABLE/);
  await assert.rejects(get('google:fixture',{...b.scope,projectId:'other'}),/UNAVAILABLE/);
  assert.equal(b.sent(),1);
});
test('ordinary refresh, anonymous strict probe, and internal poll cannot enter the external read path without proof',async()=>{
  const server=fs.readFileSync(new URL('../server.mjs',import.meta.url),'utf8');
  const start=server.indexOf('async function protectedOrStrictRead('),end=server.indexOf('async function buildSnapshot(',start);
  let writes=0,external=0,internal=0;
  const run=new Function('authorizedExternalRead','resolveProjectHrReadBinding','recoverHrReadModel','buildSnapshot',
    server.slice(start,end)+'\nreturn protectedOrStrictRead;')(
    async()=>{writes++;},async()=>({proof:{providerType:'excel_online'}}),async()=>{internal++;return {externalReadCurrent:false};},async()=>{external++;});
  const scope={tenantId:'x',projectId:'y'};
  const req=(url,headers={})=>({url,headers});
  await assert.rejects(run(req('/?fresh=1'),scope,null,true,false),/PRINCIPAL_REQUIRED/);
  await assert.rejects(run(req('/?vrm154156=test&format=json'),scope,null,false,false),/STRICT_TOKEN_REQUIRED/);
  await assert.rejects(run(req('/?canonical=test-1&format=meta',{'x-cxorbia-run':'test','x-cxorbia-probe':'canonical-before'}),scope,null,false,false),/STRICT_TOKEN_REQUIRED/);
  const last=await run(req('/?sync=due'),scope,{uid:'user'},false,true);
  assert.equal(last.externalReadCurrent,false);assert.equal(internal,1);assert.equal(writes+external,0);
});
